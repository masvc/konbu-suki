/**
 * 定期点検のまとめ役
 *
 * site-check / check-links / meta-check / fact-audit を順に走らせ、全文を
 * ~/Library/Logs/konbu-suki/ に残し、要約を Slack に流す。
 *
 * Usage:
 *   npx tsx scripts/health-report.ts             # 全部
 *   npx tsx scripts/health-report.ts --no-slack  # Slack に流さない
 *   npx tsx scripts/health-report.ts --offline   # 本番サイトを叩かない
 *
 * 順番に走らせる。どれも本番サイトに多数のリクエストを投げるので、
 * 同時に走らせると自サイトへの負荷が重なる。
 *
 * ログを ~/Desktop 配下に置かないこと。macOS の保護対象(TCC)で、
 * launchd がファイルを開けず起動に失敗する。
 */
import "dotenv/config";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdirSync, appendFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { postToSlack, escapeSlack } from "./lib/slack";

const run = promisify(execFile);

// cwd に依存しないよう、このファイルからの相対で解決する
const PROJECT_ROOT = path.resolve(__dirname, "..");
const TSX = path.join(PROJECT_ROOT, "node_modules", "tsx", "dist", "cli.mjs");
const LOG_DIR = path.join(homedir(), "Library/Logs/konbu-suki");

const args = process.argv.slice(2);
const noSlack = args.includes("--no-slack");
const offline = args.includes("--offline");

type Check = { name: string; script: string; args: string[] };

const CHECKS: Check[] = [
  { name: "サイト品質", script: "scripts/site-check.ts", args: offline ? ["--offline"] : [] },
  ...(offline ? [] : [{ name: "リンク", script: "scripts/check-links.ts", args: [] }]),
  { name: "meta", script: "scripts/meta-check.ts", args: [] },
  // 記事をまたいだ事実の食い違い。1記事だけ読んでいると気付けない壊れ方で、
  // 記事が増えるほど起きやすい。人が覚えておく話にせず毎回見る。
  { name: "事実の整合", script: "scripts/fact-audit.ts", args: [] },
];

type Result = { name: string; ok: boolean; seconds: number; summary: string[] };

/**
 * 要約の取り出し。
 *
 * 各点検スクリプトは最後に "SUMMARY: ..." の1行を出す規約にしてある。
 * それがあれば使い、無ければ（失敗して途中で落ちた場合など）末尾の
 * 意味のある数行で代用する。
 */
function summarize(text: string, fallbackCount: number): string[] {
  const lines = text
    .split("\n")
    .map((l) => l.replace(/\r/g, "").trimEnd())
    .filter((l) => l.trim().length > 0 && !/^[\s=\-─━]+$/.test(l));

  const summary = lines.filter((l) => l.startsWith("SUMMARY:"));
  if (summary.length > 0) return summary.map((l) => l.replace(/^SUMMARY:\s*/, ""));
  return lines.slice(-fallbackCount);
}

async function runCheck(check: Check, logFile: string): Promise<Result> {
  const startedAt = Date.now();
  let stdout = "";
  let ok = true;
  try {
    const res = await run(process.execPath, [TSX, check.script, ...check.args], {
      cwd: PROJECT_ROOT,
      timeout: 15 * 60 * 1000,
      maxBuffer: 20 * 1024 * 1024,
    });
    stdout = res.stdout + (res.stderr || "");
  } catch (e) {
    ok = false;
    const err = e as { stdout?: string; stderr?: string; message?: string };
    stdout = (err.stdout || "") + (err.stderr || "") + (err.message || "");
  }
  const seconds = Math.round((Date.now() - startedAt) / 1000);

  appendFileSync(
    logFile,
    `\n${"=".repeat(70)}\n[${new Date().toISOString()}] ${check.name}` +
      ` (${check.script} ${check.args.join(" ")}) — ${ok ? "完了" : "失敗"} ${seconds}秒\n` +
      `${"=".repeat(70)}\n${stdout}\n`
  );

  return { name: check.name, ok, seconds, summary: summarize(stdout, 3) };
}

async function main() {
  mkdirSync(LOG_DIR, { recursive: true });
  const date = new Date().toLocaleDateString("sv-SE");
  const logFile = path.join(LOG_DIR, `${date}.log`);

  console.log(`定期点検 — ${date}${offline ? " (offline)" : ""}`);
  console.log(`ログ: ${logFile}`);

  const results: Result[] = [];
  for (const check of CHECKS) {
    console.log(`\n--- ${check.name} ---`);
    const result = await runCheck(check, logFile);
    console.log(`${result.ok ? "完了" : "失敗"} ${result.seconds}秒`);
    for (const line of result.summary) console.log(`  ${line}`);
    results.push(result);
  }

  const failed = results.filter((r) => !r.ok);
  const header = `*konbu-suki 定期点検* ${date}${failed.length > 0 ? ` — ${failed.length}件が失敗` : ""}`;
  const body = results
    .map((r) =>
      [`*${r.name}* ${r.ok ? "OK" : "NG"} ${r.seconds}秒`, ...r.summary.map((l) => `  ${escapeSlack(l)}`)].join("\n")
    )
    .join("\n");
  const message = `${header}\n\n${body}\n\nログ: ${logFile}`;

  if (noSlack) {
    console.log("\n--- Slack に流す内容 ---");
    console.log(message);
  } else {
    const sent = await postToSlack(message);
    console.log(`\nSlack 通知: ${sent ? "送信した" : "送信しなかった"}`);
  }

  // 失敗があれば非ゼロで終わる。launchd のログで気付けるようにする。
  if (failed.length > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
