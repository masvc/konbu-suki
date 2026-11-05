/**
 * 夜間実行。1枠ぶんの役割を claude -p に渡して回す。
 *
 * Usage:
 *   npx tsx scripts/night-run.ts --slot analysis            # 1枠を実行
 *   npx tsx scripts/night-run.ts --slot create --dry        # プロンプトだけ見る
 *   npx tsx scripts/night-run.ts --slot wrapup --minutes 60 # 打ち切り時間
 *   npx tsx scripts/night-run.ts --list                     # 枠の一覧
 *
 * 23:00 から 7:00 までを5枠に分け、枠ごとに役割を変える。毎回同じことを
 * させるより、分析 → 既存改善 → 新規 → 点検 → 仕上げの順に回すほうが、
 * 前の枠の結果を次の枠がそのまま使える。
 *
 * 枠をまたぐ受け渡しは docs/night/YYYY-MM-DD/ に置く。日付は 12時間戻して
 * 決めるので、23:00 の枠と翌朝 7:00 の枠が同じフォルダになる（lib/night.ts）。
 *
 * なぜ対話モードでなく -p なのか:
 *   対話モードは返事を返したところで一区切りになる作りで、夜通し走らせる
 *   用途に向かない。実際に夜間の作業が途中で止まった。1枠1起動に区切る。
 *
 * 権限について:
 *   auto-settings.json（gitignore 対象、雛形は auto-settings.example.json）。
 *   -p では都度の確認ができないので、許可していない操作は黙って拒否される。
 */
import "dotenv/config";
import { spawnSync, execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { postToSlack, escapeSlack } from "./lib/slack";
import { stopRequested, STOP_FILE_PATH } from "./lib/stop";
import { nightDir, nightDirRelative, nightDate } from "./lib/night";
import { SLOTS, COMMON_RULES } from "./lib/night-slots";

const PROJECT_ROOT = path.resolve(__dirname, "..");
const SETTINGS_FILE = path.join(PROJECT_ROOT, "auto-settings.json");
const EXAMPLE_FILE = path.join(PROJECT_ROOT, "auto-settings.example.json");
const LOCK_FILE = path.join(homedir(), "Library/Logs/konbu-suki/night.lock");

/** 枠の間隔は2時間。前の枠が次の枠に食い込むと claude が2つ同時に走る。 */
const DEFAULT_MINUTES = 100;

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const noSlack = args.includes("--no-slack");
const list = args.includes("--list");
const stringAfter = (flag: string): string | null => {
  const i = args.indexOf(flag);
  return i === -1 ? null : args[i + 1] || null;
};
const numberAfter = (flag: string, fallback: number): number => {
  const v = stringAfter(flag);
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

function git(...a: string[]): string {
  return execFileSync("/usr/bin/git", a, { cwd: PROJECT_ROOT, encoding: "utf8" }).trim();
}

/**
 * claude の絶対パスを決める。
 *
 * launchd から起動されたプロセスの PATH は /usr/bin:/bin:/usr/sbin:/sbin しか
 * 無く、Homebrew に入っている claude も npm も見つからない。手で動かすと通るのに
 * 定時実行だけ失敗する、という形になるので、パスは自前で解決する。
 */
function resolveClaudePath(): string | null {
  const candidates = ["/opt/homebrew/bin/claude", "/usr/local/bin/claude"];
  try {
    const found = execFileSync("/usr/bin/which", ["claude"], { encoding: "utf8" }).trim();
    if (found) candidates.unshift(found);
  } catch {
    /* PATH に無ければ下の候補で探す */
  }
  for (const c of candidates) if (existsSync(c)) return c;
  return null;
}

/** claude 自身が走らせる npm も同じ PATH を引き継ぐので、node の場所も足す。 */
function buildEnv(claudePath: string): NodeJS.ProcessEnv {
  const extra = [
    path.dirname(claudePath),
    path.dirname(process.execPath),
    "/opt/homebrew/bin",
    "/usr/local/bin",
  ];
  const current = (process.env.PATH ?? "").split(":").filter(Boolean);
  const merged = [...new Set([...extra, ...current, "/usr/bin", "/bin", "/usr/sbin", "/sbin"])];
  // NIGHT_RUN は「無人で走っている」ことの目印。DB を書くスクリプトが、
  // 許可されている範囲だけに自分を制限するために見る（match-rakuten.ts）。
  return { ...process.env, PATH: merged.join(":"), NIGHT_RUN: "1" };
}

/**
 * 枠が二重に走らないようにする。
 *
 * 前の枠が打ち切り時間まで粘ると、次の枠の起動と重なりうる。claude が2つ同時に
 * コミットすると、片方の変更をもう片方が巻き込む。
 */
function acquireLock(slot: string): boolean {
  if (existsSync(LOCK_FILE)) {
    const held = readFileSync(LOCK_FILE, "utf8").trim();
    const pid = Number(held.split(" ")[0]);
    if (Number.isFinite(pid) && pid > 0) {
      try {
        process.kill(pid, 0); // 生きているか確認するだけ
        console.log(`別の枠が実行中（${held}）。この枠は見送る。`);
        return false;
      } catch {
        console.log(`残っていたロックを引き継ぐ（${held}）。`);
      }
    }
  }
  writeFileSync(LOCK_FILE, `${process.pid} ${slot} ${new Date().toISOString()}\n`);
  return true;
}

function releaseLock() {
  try {
    unlinkSync(LOCK_FILE);
  } catch {
    /* 無ければそれでよい */
  }
}

async function report(lines: string[]) {
  const text = lines.join("\n");
  console.log(`\n${text}\n`);
  if (!noSlack) await postToSlack(escapeSlack(text));
}

function newCommitSubjects(since: string): string[] {
  const out = git("log", "--format=%s", `${since}..HEAD`);
  return out ? out.split("\n") : [];
}

async function main() {
  if (list) {
    console.log("\n夜間実行の枠\n");
    for (const s of SLOTS) {
      console.log(`  ${String(s.hour).padStart(2, "0")}:00  ${s.name.padEnd(9)} ${s.title}`);
    }
    console.log(`\nその夜のフォルダ: ${nightDirRelative()}\n`);
    return;
  }

  const slotName = stringAfter("--slot");
  const slot = SLOTS.find((s) => s.name === slotName);
  if (!slot) {
    console.error(`--slot が不正: ${slotName ?? "(未指定)"}`);
    console.error(`使えるのは: ${SLOTS.map((s) => s.name).join(" / ")}`);
    process.exit(1);
  }

  const limitMinutes = numberAfter("--minutes", slot.minutes ?? DEFAULT_MINUTES);
  const dir = nightDir();
  const dirRel = nightDirRelative();
  const prompt = `${slot.prompt}\n${COMMON_RULES}`.replace(/\{\{DIR\}\}/g, dirRel);

  const claudePath = resolveClaudePath();
  if (dry) {
    console.log(`枠: ${slot.name}（${slot.hour}:00 ${slot.title}）`);
    console.log(`打ち切り: ${limitMinutes}分`);
    console.log(`フォルダ: ${dir}`);
    console.log(`claude: ${claudePath ?? "見つからない"}`);
    console.log(`\n--- プロンプト ---\n${prompt}`);
    return;
  }

  const startedAt = new Date();
  console.log(`[${startedAt.toISOString()}] 夜間実行 ${slot.name}（${slot.title}）を開始`);

  if (stopRequested()) {
    console.log(`停止フラグ（${STOP_FILE_PATH}）があるため何もしない。`);
    return;
  }
  if (!existsSync(SETTINGS_FILE)) {
    await report([
      `夜間実行 ${slot.title} を実行できなかった`,
      `・権限ファイルが無い: ${SETTINGS_FILE}`,
      `・${path.basename(EXAMPLE_FILE)} をコピーして作る`,
    ]);
    process.exit(1);
  }
  if (!claudePath) {
    await report([
      `夜間実行 ${slot.title} を実行できなかった`,
      "・claude コマンドが見つからない（launchd の PATH には Homebrew が入っていない）",
    ]);
    process.exit(1);
  }
  if (!acquireLock(slot.name)) return;

  try {
    // 前の枠が中途半端に終わって未コミットの変更が残っていることがある。
    // そのまま走らせると claude の変更と混ざって1コミットに入る。捨てずに
    // stash に退避して、朝に拾えるようにする。
    const dirty = git("status", "--porcelain");
    if (dirty) {
      const label = `night-${nightDate()}-${slot.name} の前に退避`;
      git("stash", "push", "-u", "-m", label);
      const note = path.join(dir, "held.md");
      const body =
        `\n## ${new Date().toLocaleString("sv-SE")} ${slot.title} の開始前\n\n` +
        `未コミットの変更が残っていたので stash に退避した（\`git stash list\` で確認できる）。\n` +
        `退避名: ${label}\n\n\`\`\`\n${dirty}\n\`\`\`\n`;
      writeFileSync(note, (existsSync(note) ? readFileSync(note, "utf8") : "# 保留したもの\n") + body);
      console.log(`未コミットの変更を stash に退避した: ${label}`);
    }

    try {
      git("pull", "--ff-only");
    } catch {
      // 履歴が分かれている状態で無人のまま進めると、こじれ方が大きくなる。
      await report([
        `夜間実行 ${slot.title} を見送った`,
        "・git pull --ff-only が通らない（手で解消が必要）",
      ]);
      return;
    }

    const before = git("rev-parse", "HEAD");
    const res = spawnSync(
      claudePath,
      ["-p", prompt, "--settings", SETTINGS_FILE, "--permission-mode", "acceptEdits"],
      {
        cwd: PROJECT_ROOT,
        env: buildEnv(claudePath),
        stdio: "inherit",
        timeout: limitMinutes * 60 * 1000,
        killSignal: "SIGTERM",
      }
    );

    const subjects = newCommitSubjects(before);
    const minutes = Math.round((Date.now() - startedAt.getTime()) / 60000);
    const trouble: string[] = [];
    if (res.error && (res.error as NodeJS.ErrnoException).code === "ETIMEDOUT") {
      trouble.push(`・${limitMinutes}分で打ち切った`);
    } else if (res.error) {
      trouble.push(`・起動できなかった: ${res.error.message}`);
    } else if (res.status !== 0) {
      trouble.push(`・claude が異常終了（exit ${res.status}）`);
    }

    // 枠の結果を残す。最後の枠がこれを読んで報告をまとめる。
    writeFileSync(
      path.join(dir, `status-${slot.name}.json`),
      JSON.stringify(
        {
          slot: slot.name,
          title: slot.title,
          startedAt: startedAt.toISOString(),
          minutes,
          limitMinutes,
          commits: subjects,
          exit: res.status,
          trouble,
        },
        null,
        2
      )
    );

    // 報告は最後の枠（wrapup）が自分でまとめて流す。途中の枠から毎回流すと、
    // 一晩に5通届いて何が進んだのか読み取れない。うまくいかなかった枠だけ、
    // その場で理由を流す。
    if (trouble.length > 0) {
      await report([
        `夜間実行 ${slot.title}（${minutes}分）`,
        ...(subjects.length > 0 ? subjects.map((x) => `・${x}`) : ["・コミットは増えなかった"]),
        ...trouble,
      ]);
    } else {
      console.log(
        `\n${slot.title} 完了（${minutes}分）。コミット ${subjects.length}件。\n` +
          subjects.map((x) => `  ・${x}`).join("\n")
      );
    }
  } finally {
    releaseLock();
  }
}

main().catch(async (e) => {
  releaseLock();
  const message = e instanceof Error ? e.message : String(e);
  console.error(message);
  if (!noSlack) await postToSlack(escapeSlack(`夜間実行が落ちた: ${message}`));
  process.exit(1);
});
