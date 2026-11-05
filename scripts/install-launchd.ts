/**
 * 定期実行する処理を launchd に登録する。
 *
 * Usage:
 *   npx tsx scripts/install-launchd.ts             # plist を生成して手順を表示
 *   npx tsx scripts/install-launchd.ts --install   # 生成して登録まで行う
 *   npx tsx scripts/install-launchd.ts --uninstall # 登録を外す
 *   npx tsx scripts/install-launchd.ts --hour 9    # 定期点検の時刻（既定7時）
 *   npx tsx scripts/install-launchd.ts --night 1,4 # 夜間の記事作成の時刻（既定 1,3,5）
 *
 * 登録するもの:
 *   com.konbusuki.checks    定期点検（毎日7時）
 *   com.konbusuki.activity  作業報告（2時間ごと。AIが何をしたかを Slack へ）
 *   com.konbusuki.content   夜間の記事作成（1時・3時・5時に1本ずつ）
 *
 * plist を固定ファイルとしてリポジトリに置くと、node のパスやプロジェクトの
 * 置き場所が機種ごとに違うため、別のPCで pull したときに動かない。
 * 実行環境から組み立てる。
 *
 * 手で動かして確かめるとき:
 *   launchctl start <ラベル>
 *   launchctl list <ラベル>   # PID があれば実行中
 *
 *   start は**すでに実行中なら黙って無視される**。走っている最中にもう一度
 *   投げても2回目は動かず、ログも1回分しか増えない。.env を書き換えて
 *   試すときは、PID が消えてから start する。
 *
 * 注意（別プロジェクトで踏んだもの）:
 * - node を直接起動する。launchd から起動された /bin/sh は ~/Desktop 配下の
 *   スクリプトを読めず exit 126 になるため、シェルを挟んではいけない。
 * - ログを ~/Desktop 配下に置かないこと。macOS の保護対象(TCC)で、launchd が
 *   ファイルを開けず exit 78 で起動に失敗する。~/Library/Logs/ を使う。
 * - KeepAlive は付けない。常駐ではなく定時実行のため。
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync, copyFileSync, unlinkSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

const PROJECT_ROOT = path.resolve(__dirname, "..");
const TSX_CLI = path.join(PROJECT_ROOT, "node_modules", "tsx", "dist", "cli.mjs");
const LOG_DIR = path.join(homedir(), "Library/Logs/konbu-suki");
const AGENTS_DIR = path.join(homedir(), "Library/LaunchAgents");
const OUT_DIR = path.join(PROJECT_ROOT, "scripts", "tmp");

const args = process.argv.slice(2);
const install = args.includes("--install");
const uninstall = args.includes("--uninstall");
const hourArg = args.indexOf("--hour");
const dailyHour =
  hourArg !== -1 && Number.isFinite(Number(args[hourArg + 1])) ? Number(args[hourArg + 1]) : 7;

/** 夜間の記事作成を走らせる時刻。--night 1,3,5 のように渡せる。 */
const nightArg = args.indexOf("--night");
const NIGHT_HOURS =
  nightArg !== -1 && args[nightArg + 1]
    ? args[nightArg + 1]
        .split(",")
        .map((h) => Number(h.trim()))
        .filter((h) => Number.isInteger(h) && h >= 0 && h <= 23)
    : [1, 3, 5];

type Job = {
  label: string;
  script: string;
  /** 毎日この時刻に動かす */
  hour?: number;
  /** 毎日これらの時刻に動かす（hour / intervalSeconds と排他） */
  hours?: number[];
  /** この秒数ごとに動かす（hour と排他） */
  intervalSeconds?: number;
  description: string;
};

const JOBS: Job[] = [
  {
    label: "com.konbusuki.checks",
    script: "scripts/health-report.ts",
    hour: dailyHour,
    description: "定期点検（サイト品質・リンク・meta）",
  },
  {
    label: "com.konbusuki.activity",
    script: "scripts/activity-report.ts",
    intervalSeconds: 2 * 60 * 60,
    description: "作業報告（直近2時間に何をしたか）",
  },
  {
    // 1回の起動で記事1本。対話モードは返事で区切られて夜通し走らないため、
    // 起動を分ける（scripts/auto-content.ts の冒頭に経緯あり）。
    // 1本あたり最大45分を見て、間隔は2時間空けておく。
    label: "com.konbusuki.content",
    script: "scripts/auto-content.ts",
    hours: NIGHT_HOURS,
    description: "夜間の記事作成（1起動で1本）",
  },
];

function escapeXml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * plist に埋める node のパスを決める。
 *
 * process.execPath は Homebrew だと
 * /opt/homebrew/Cellar/node/26.8.1/bin/node のようなバージョン込みのパスを
 * 返す。これを埋めると node を更新した時点でパスが消え、定期実行が静かに
 * 壊れる。更新に強い symlink 側を優先する。
 */
function resolveNodePath(): string {
  const candidates: string[] = [];
  try {
    const found = execFileSync("/usr/bin/which", ["node"], { encoding: "utf8" }).trim();
    if (found) candidates.push(found);
  } catch {
    /* PATH に無ければ下の候補で探す */
  }
  candidates.push("/opt/homebrew/bin/node", "/usr/local/bin/node", "/usr/bin/node");

  for (const candidate of candidates) {
    if (!existsSync(candidate)) continue;
    try {
      execFileSync(candidate, ["--version"], { stdio: "pipe" });
      return candidate;
    } catch {
      /* 次の候補へ */
    }
  }
  return process.execPath;
}

const NODE_PATH = resolveNodePath();

function buildPlist(job: Job): string {
  // 複数時刻は StartCalendarInterval を配列で渡す。dict を並べても
  // 後ろの1つしか効かないため、array で包む必要がある。
  const calendarEntry = (hour: number) =>
    `    <dict><key>Hour</key><integer>${hour}</integer><key>Minute</key><integer>0</integer></dict>`;

  const schedule = job.intervalSeconds
    ? `  <key>StartInterval</key><integer>${job.intervalSeconds}</integer>`
    : job.hours
      ? `  <key>StartCalendarInterval</key>
  <array>
${job.hours.map(calendarEntry).join("\n")}
  </array>`
      : `  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key><integer>${job.hour ?? 7}</integer>
    <key>Minute</key><integer>0</integer>
  </dict>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<!--
  ${job.description}
  scripts/install-launchd.ts が生成したファイル。直接編集せず、生成し直すこと。

  node を直接起動している。launchd から起動された /bin/sh は Desktop 配下の
  スクリプトを読めず exit 126 になるため、シェルを挟んではいけない。
  ログは ~/Library/Logs/ に置く。Desktop は macOS の保護対象(TCC)で、
  launchd がファイルを開けず exit 78 で起動に失敗する。
-->
<plist version="1.0">
<dict>
  <key>Label</key><string>${job.label}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${escapeXml(NODE_PATH)}</string>
    <string>${escapeXml(TSX_CLI)}</string>
    <string>${escapeXml(job.script)}</string>
  </array>
  <key>WorkingDirectory</key><string>${escapeXml(PROJECT_ROOT)}</string>
${schedule}
  <key>RunAtLoad</key><false/>
  <key>StandardOutPath</key><string>${escapeXml(path.join(LOG_DIR, `${job.label}.out.log`))}</string>
  <key>StandardErrorPath</key><string>${escapeXml(path.join(LOG_DIR, `${job.label}.err.log`))}</string>
</dict>
</plist>
`;
}

function unloadIfLoaded(installedFile: string) {
  try {
    execFileSync("/bin/launchctl", ["unload", installedFile], { stdio: "pipe" });
  } catch {
    /* 読み込まれていなければそれでよい */
  }
}

function main() {
  if (uninstall) {
    for (const job of JOBS) {
      const installedFile = path.join(AGENTS_DIR, `${job.label}.plist`);
      if (!existsSync(installedFile)) {
        console.log(`${job.label}: 登録されていない`);
        continue;
      }
      unloadIfLoaded(installedFile);
      unlinkSync(installedFile);
      console.log(`${job.label}: 登録を外した`);
    }
    return;
  }

  if (!existsSync(TSX_CLI)) {
    console.error(`tsx が見つからない: ${TSX_CLI}\nnpm ci を先に実行する。`);
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });
  mkdirSync(LOG_DIR, { recursive: true });
  console.log(`node: ${NODE_PATH}`);
  console.log(`作業場所: ${PROJECT_ROOT}`);
  console.log(`ログ: ${LOG_DIR}`);
  console.log("=".repeat(62));

  for (const job of JOBS) {
    const outFile = path.join(OUT_DIR, `${job.label}.plist`);
    writeFileSync(outFile, buildPlist(job));
    const when = job.intervalSeconds
      ? `${job.intervalSeconds / 3600}時間ごと`
      : job.hours
        ? `毎日 ${job.hours.map((h) => `${h}:00`).join(" / ")}`
        : `毎日 ${job.hour}:00`;
    console.log(`${job.label}  ${when}  — ${job.description}`);

    if (!install) continue;

    const installedFile = path.join(AGENTS_DIR, `${job.label}.plist`);
    mkdirSync(AGENTS_DIR, { recursive: true });
    if (existsSync(installedFile)) unloadIfLoaded(installedFile);
    copyFileSync(outFile, installedFile);
    execFileSync("/bin/launchctl", ["load", installedFile], { stdio: "inherit" });
    console.log(`  → 登録した: ${installedFile}`);
  }

  if (!install) {
    console.log("\n登録するには: npx tsx scripts/install-launchd.ts --install");
  } else {
    console.log("\n今すぐ試すには: launchctl start <ラベル>");
  }
}

main();
