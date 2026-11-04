/**
 * 定期点検（health-report.ts）を launchd に登録するための plist を生成する。
 *
 * Usage:
 *   npx tsx scripts/install-launchd.ts            # 生成して手順を表示
 *   npx tsx scripts/install-launchd.ts --install  # 生成して登録まで行う
 *   npx tsx scripts/install-launchd.ts --hour 9   # 実行時刻を変える（既定 7時）
 *   npx tsx scripts/install-launchd.ts --uninstall # 登録を外す
 *
 * plist を固定ファイルとしてリポジトリに置くと、node のパスやプロジェクトの
 * 置き場所が機種ごとに違うため、別のPCで pull したときに動かない。
 * 実行環境から組み立てる。
 *
 * 注意（別プロジェクトで踏んだもの）:
 * - node を直接起動する。launchd から起動された /bin/sh は Desktop 配下の
 *   スクリプトを読めず exit 126 になるため、シェルを挟んではいけない。
 * - ログを Desktop 配下に置かないこと。macOS の保護対象(TCC)で、launchd が
 *   ファイルを開けず exit 78 で起動に失敗する。~/Library/Logs/ を使う。
 * - KeepAlive は付けない。常駐ではなく定時実行のため。
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync, copyFileSync, unlinkSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

const LABEL = "com.konbusuki.checks";
const PROJECT_ROOT = path.resolve(__dirname, "..");
const TSX_CLI = path.join(PROJECT_ROOT, "node_modules", "tsx", "dist", "cli.mjs");
const LOG_DIR = path.join(homedir(), "Library/Logs/konbu-suki");
const AGENTS_DIR = path.join(homedir(), "Library/LaunchAgents");
const PLIST_NAME = `${LABEL}.plist`;
const OUT_DIR = path.join(PROJECT_ROOT, "scripts", "tmp");
const OUT_FILE = path.join(OUT_DIR, PLIST_NAME);
const INSTALLED_FILE = path.join(AGENTS_DIR, PLIST_NAME);

const args = process.argv.slice(2);
const install = args.includes("--install");
const uninstall = args.includes("--uninstall");
const hourArg = args.indexOf("--hour");
const hour = hourArg !== -1 && Number.isFinite(Number(args[hourArg + 1])) ? Number(args[hourArg + 1]) : 7;

function escapeXml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/**
 * plist に埋める node のパスを決める。
 *
 * process.execPath は Homebrew だと
 * /opt/homebrew/Cellar/node/26.8.1/bin/node のようなバージョン込みのパスを
 * 返す。これを埋めると node を更新した時点でパスが消え、定時実行が静かに
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
      // 実際に動く node か確かめる
      execFileSync(candidate, ["--version"], { stdio: "pipe" });
      return candidate;
    } catch {
      /* 次の候補へ */
    }
  }
  // どれも見つからなければ、今動いている node をそのまま使う
  return process.execPath;
}

const NODE_PATH = resolveNodePath();

function buildPlist(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<!--
  scripts/install-launchd.ts が生成したファイル。直接編集せず、生成し直すこと。

  node を直接起動している。launchd から起動された /bin/sh は Desktop 配下の
  スクリプトを読めず exit 126 になるため、シェルを挟んではいけない。
  ログは ~/Library/Logs/ に置く。Desktop は macOS の保護対象(TCC)で、
  launchd がファイルを開けず exit 78 で起動に失敗する。
-->
<plist version="1.0">
<dict>
  <key>Label</key><string>${LABEL}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${escapeXml(NODE_PATH)}</string>
    <string>${escapeXml(TSX_CLI)}</string>
    <string>scripts/health-report.ts</string>
  </array>
  <key>WorkingDirectory</key><string>${escapeXml(PROJECT_ROOT)}</string>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key><integer>${hour}</integer>
    <key>Minute</key><integer>0</integer>
  </dict>
  <key>RunAtLoad</key><false/>
  <key>StandardOutPath</key><string>${escapeXml(path.join(LOG_DIR, "launchd.out.log"))}</string>
  <key>StandardErrorPath</key><string>${escapeXml(path.join(LOG_DIR, "launchd.err.log"))}</string>
</dict>
</plist>
`;
}

function main() {
  if (uninstall) {
    if (!existsSync(INSTALLED_FILE)) {
      console.log(`登録されていない: ${INSTALLED_FILE}`);
      return;
    }
    try {
      execFileSync("/bin/launchctl", ["unload", INSTALLED_FILE], { stdio: "pipe" });
    } catch {
      /* 読み込まれていなければそれでよい */
    }
    unlinkSync(INSTALLED_FILE);
    console.log(`登録を外した: ${INSTALLED_FILE}`);
    return;
  }

  if (!existsSync(TSX_CLI)) {
    console.error(`tsx が見つからない: ${TSX_CLI}\nnpm ci を先に実行する。`);
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });
  mkdirSync(LOG_DIR, { recursive: true });
  writeFileSync(OUT_FILE, buildPlist());
  console.log(`生成した: ${OUT_FILE}`);
  console.log(`  node    : ${NODE_PATH}`);
  console.log(`  作業場所: ${PROJECT_ROOT}`);
  console.log(`  実行時刻: 毎日 ${hour}:00`);
  console.log(`  ログ    : ${LOG_DIR}`);

  if (!install) {
    console.log("\n登録するには:");
    console.log(`  npx tsx scripts/install-launchd.ts --install`);
    console.log("または手で:");
    console.log(`  cp ${OUT_FILE} ${AGENTS_DIR}/`);
    console.log(`  launchctl load ${INSTALLED_FILE}`);
    return;
  }

  mkdirSync(AGENTS_DIR, { recursive: true });
  if (existsSync(INSTALLED_FILE)) {
    try {
      execFileSync("/bin/launchctl", ["unload", INSTALLED_FILE], { stdio: "pipe" });
    } catch {
      /* 読み込まれていなければそれでよい */
    }
  }
  copyFileSync(OUT_FILE, INSTALLED_FILE);
  execFileSync("/bin/launchctl", ["load", INSTALLED_FILE], { stdio: "inherit" });
  console.log(`\n登録した: ${INSTALLED_FILE}`);
  console.log("今すぐ試すには: launchctl start " + LABEL);
}

main();
