/**
 * 夜間に記事を1本書かせる。
 *
 * Usage:
 *   npx tsx scripts/auto-content.ts              # 1回分を実行
 *   npx tsx scripts/auto-content.ts --dry        # 実行せず、渡すプロンプトと引数だけ出す
 *   npx tsx scripts/auto-content.ts --minutes 60 # 打ち切り時間（既定45分）
 *   npx tsx scripts/auto-content.ts --no-slack   # Slack に流さない
 *
 * なぜ対話モードでなく `claude -p` なのか:
 *   対話モードは「返事を返したら一区切り」という作りで、夜通し走らせる用途に
 *   向かない。実際に夜間の作業が途中で止まった。1回の起動で記事1本だけを
 *   書かせ、それを launchd から何回か呼ぶ形にする。会話が毎回まっさらになる
 *   ので、文脈が膨らんで判断が重くなることもない。
 *
 * 権限について:
 *   `auto-settings.json`（gitignore 対象）に許可・禁止を書く。対話モードなら
 *   都度聞いて止まれるが、-p では聞けないので、許可していない操作は黙って
 *   拒否される。DB書き込み・.env 参照・force push は deny に入れてある。
 *   CLAUDE.md の「DB書き込みは事前確認」を自動実行でも守るための仕組み。
 *   雛形は auto-settings.example.json。
 */
import "dotenv/config";
import { spawnSync, execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { postToSlack, escapeSlack } from "./lib/slack";
import { stopRequested, STOP_FILE_PATH } from "./lib/stop";

const PROJECT_ROOT = path.resolve(__dirname, "..");
const TSX_CLI = path.join(PROJECT_ROOT, "node_modules", "tsx", "dist", "cli.mjs");
const SETTINGS_FILE = path.join(PROJECT_ROOT, "auto-settings.json");
const EXAMPLE_FILE = path.join(PROJECT_ROOT, "auto-settings.example.json");

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const noSlack = args.includes("--no-slack");
const minutesArg = args.indexOf("--minutes");
const limitMinutes =
  minutesArg !== -1 && Number.isFinite(Number(args[minutesArg + 1]))
    ? Number(args[minutesArg + 1])
    : 45;

/**
 * 1回の起動で書かせる内容。
 *
 * 「1本だけ」と明示するのが肝。複数本を任せると、1本目で残り時間を使い切って
 * 中途半端な状態で打ち切られる。1本ずつ push まで終わらせれば、打ち切られても
 * 完成したぶんは残る。
 */
const PROMPT = `docs/topic-map.md と docs/content-log.md と CLAUDE.md を読んで、記事を1本だけ進めてください。

進め方:
1. docs/content-log.md の「次にやる予定」を見て、今回の対象を決める。
   そこが空なら docs/topic-map.md の優先度「高」の未着手から選ぶ。
   既存記事の強化が指示されている場合は、新規作成ではなく src/lib/guides.ts の
   該当エントリに加筆する。
2. 新しい出典を使うときは WebFetch で実際に開いて内容を確かめ、
   docs/topic-map.md の「確認済みの出典」の表に追加する。開いて確認できなかった
   出典は使わない。
3. 記事は docs/topic-map.md の「記事の型」に従う。比較表・早見表は本文に
   Markdown で書かず、GuideSection の table として持たせる。
4. 新規記事なら scripts/generate-guide-images.ts の PROMPTS にアイキャッチの
   プロンプトを追加し、\`npx tsx scripts/generate-guide-images.ts <slug>\` で生成して
   image と imageAlt を設定する。生成に失敗したら画像なしで進め、理由を記録に残す。
5. docs/content-log.md に表形式で記録を追加し、末尾の「次にやる予定」を次の対象に
   書き換える。
6. \`npm run build\` が通ることを確認してから、1コミットにまとめて push する。
   コミットの件名は日本語で書く。

守ること:
- CLAUDE.md のコンテンツルール（効果効能を断定しない・出典を明記・ヨウ素の注意・
  商品データを捏造しない）を必ず守る。
- DB への書き込みはしない。.env は読まない。
- 1本終わったら、次の記事には進まず終了する。
- ${STOP_FILE_PATH} があれば、何もせずに終了する。

最後に、何をしたかを3行以内で出力してください。`;

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
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

/**
 * claude に渡す環境。
 *
 * claude 自身が走らせる `npm run build` も同じ PATH を引き継ぐため、
 * node / npm の場所を足しておかないと、ビルドの段で転ぶ。
 */
function buildEnv(claudePath: string): NodeJS.ProcessEnv {
  const extra = [path.dirname(claudePath), path.dirname(process.execPath), "/opt/homebrew/bin", "/usr/local/bin"];
  const current = (process.env.PATH ?? "").split(":").filter(Boolean);
  const merged = [...new Set([...extra, ...current, "/usr/bin", "/bin", "/usr/sbin", "/sbin"])];
  return { ...process.env, PATH: merged.join(":") };
}

function git(...a: string[]): string {
  return execFileSync("/usr/bin/git", a, { cwd: PROJECT_ROOT, encoding: "utf8" }).trim();
}

/** 成果を「コミットが何本増えたか」で見る。claude の出力文は当てにしない。 */
function newCommitSubjects(since: string): string[] {
  const out = git("log", "--format=%s", `${since}..HEAD`);
  return out ? out.split("\n") : [];
}

async function report(lines: string[]) {
  const text = lines.join("\n");
  console.log(`\n${text}\n`);
  if (!noSlack) await postToSlack(escapeSlack(text));
}

/**
 * 作業報告を流す。
 *
 * 記事が書けた回は activity-report に任せる。数字の前回比・朝やること・次に
 * やる予定まで入った報告になり、報告済みの記事は除かれる。こちらで短い報告を
 * 別に出すと、1回の作業で2通届いてしまう。
 *
 * 書けなかった回・落ちた回だけ、理由をこちらから流す。activity-report は
 * 「公開物の変更はなし」としか言えず、打ち切りや異常終了が伝わらないため。
 */
function runActivityReport(): boolean {
  const res = spawnSync(process.execPath, [TSX_CLI, "scripts/activity-report.ts"], {
    cwd: PROJECT_ROOT,
    stdio: "inherit",
  });
  return res.status === 0;
}

async function main() {
  const startedAt = new Date();
  console.log(`[${startedAt.toISOString()}] 夜間の記事作成を開始`);

  if (stopRequested()) {
    console.log(`停止フラグ（${STOP_FILE_PATH}）があるため何もしない。`);
    return;
  }

  if (!existsSync(SETTINGS_FILE)) {
    await report([
      "夜間の記事作成を実行できなかった",
      `・権限ファイルが無い: ${SETTINGS_FILE}`,
      `・${path.basename(EXAMPLE_FILE)} をコピーして作る`,
    ]);
    process.exit(1);
  }

  const claudePath = resolveClaudePath();
  if (!claudePath) {
    await report([
      "夜間の記事作成を実行できなかった",
      "・claude コマンドが見つからない（launchd の PATH には Homebrew が入っていない）",
    ]);
    process.exit(1);
  }

  const claudeArgs = [
    "-p",
    PROMPT,
    "--settings",
    SETTINGS_FILE,
    "--permission-mode",
    "acceptEdits",
  ];

  if (dry) {
    console.log(`${claudePath} ${claudeArgs.map((a) => (a === PROMPT ? "<プロンプト>" : a)).join(" ")}`);
    console.log(`打ち切り: ${limitMinutes}分`);
    console.log(`\n--- プロンプト ---\n${PROMPT}`);
    return;
  }

  // 作業前に pull する（todo.md の先頭にある複数PC運用の前提）。
  // 未コミットの変更が残っていると、AIの変更と混ざって1コミットに入ってしまう。
  const dirty = git("status", "--porcelain");
  if (dirty) {
    await report([
      "夜間の記事作成を見送った",
      "・未コミットの変更が残っている（AIの変更と混ざるため走らせない）",
      ...dirty.split("\n").slice(0, 10).map((l) => `  ${l}`),
    ]);
    return;
  }

  try {
    git("pull", "--ff-only");
  } catch {
    await report([
      "夜間の記事作成を見送った",
      "・git pull --ff-only が通らない（手で解消が必要）",
    ]);
    return;
  }

  const before = git("rev-parse", "HEAD");

  const res = spawnSync(claudePath, claudeArgs, {
    cwd: PROJECT_ROOT,
    env: buildEnv(claudePath),
    stdio: "inherit",
    timeout: limitMinutes * 60 * 1000,
    killSignal: "SIGTERM",
  });

  const subjects = newCommitSubjects(before);
  const minutes = Math.round((Date.now() - startedAt.getTime()) / 60000);

  // 打ち切りやクラッシュは、コミットが残っていても分かるようにする。
  // 静かに失敗し続けるのが一番困る。
  const trouble: string[] = [];
  if (res.error && (res.error as NodeJS.ErrnoException).code === "ETIMEDOUT") {
    trouble.push(`・${limitMinutes}分で打ち切った`);
  } else if (res.error) {
    trouble.push(`・起動できなかった: ${res.error.message}`);
  } else if (res.status !== 0) {
    trouble.push(`・claude が異常終了（exit ${res.status}）`);
  }

  if (subjects.length > 0 && trouble.length === 0) {
    // 書けた回は作業報告に任せる（報告が2通にならないように）
    console.log(`\n記事を${subjects.length}件コミットした（${minutes}分）。作業報告を流す。`);
    if (!runActivityReport()) {
      await report([`夜間の記事作成（${minutes}分）`, ...subjects.map((x) => `・${x}`), "・作業報告の送信に失敗した"]);
    }
    return;
  }

  const lines = [`夜間の記事作成（${minutes}分）`];
  lines.push(...(subjects.length > 0 ? subjects.map((x) => `・${x}`) : ["・コミットは増えなかった"]));
  lines.push(...trouble);
  await report(lines);
}

main().catch(async (e) => {
  const message = e instanceof Error ? e.message : String(e);
  console.error(message);
  if (!noSlack) await postToSlack(escapeSlack(`夜間の記事作成が落ちた: ${message}`));
  process.exit(1);
});
