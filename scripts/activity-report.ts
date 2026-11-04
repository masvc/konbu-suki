/**
 * 直近の作業内容を Slack に報告する。
 *
 * Usage:
 *   npx tsx scripts/activity-report.ts             # 直近2時間
 *   npx tsx scripts/activity-report.ts --hours 6
 *   npx tsx scripts/activity-report.ts --no-slack  # 流さず中身だけ出す
 *
 * 何をしたかの根拠は git のコミットに置く。報告のために別途ログを書くと、
 * 書き忘れや実態との食い違いが起きる。コミットは必ず残るので、そこから作る。
 *
 * Claude が作ったコミットは Co-Authored-By で見分ける。人の作業と混ざっても
 * どちらがやったか分かるようにする。
 */
import "dotenv/config";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { postToSlack, escapeSlack } from "./lib/slack";

const PROJECT_ROOT = path.resolve(__dirname, "..");

const args = process.argv.slice(2);
const noSlack = args.includes("--no-slack");
const hoursArg = args.indexOf("--hours");
const hours =
  hoursArg !== -1 && Number.isFinite(Number(args[hoursArg + 1]))
    ? Number(args[hoursArg + 1])
    : 2;

function git(cliArgs: string[]): string {
  try {
    return execFileSync("/usr/bin/git", cliArgs, {
      cwd: PROJECT_ROOT,
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
    }).trim();
  } catch {
    return "";
  }
}

type Commit = {
  hash: string;
  subject: string;
  byClaude: boolean;
  filesChanged: number;
  insertions: number;
  deletions: number;
};

function collectCommits(): Commit[] {
  // %x1f は項目の区切り、%x1e は行の区切り。件名に何が入っても壊れないようにする
  const raw = git([
    "log",
    `--since=${hours} hours ago`,
    "--pretty=format:%h%x1f%s%x1f%b%x1e",
  ]);
  if (!raw) return [];

  return raw
    .split("\x1e")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [hash, subject, body] = entry.split("\x1f");
      const stat = git(["show", "--stat", "--format=", hash]);
      const summary = stat.split("\n").pop() || "";
      const num = (re: RegExp) => Number(summary.match(re)?.[1] || 0);
      return {
        hash,
        subject: subject || "(件名なし)",
        byClaude: /Co-Authored-By:\s*Claude/i.test(body || ""),
        filesChanged: num(/(\d+) files? changed/),
        insertions: num(/(\d+) insertions?/),
        deletions: num(/(\d+) deletions?/),
      };
    });
}

function main() {
  const commits = collectCommits();
  const branch = git(["rev-parse", "--abbrev-ref", "HEAD"]) || "main";
  const unpushed = git(["rev-list", "--count", `origin/${branch}..HEAD`]) || "0";

  const byClaude = commits.filter((c) => c.byClaude);
  const byHuman = commits.filter((c) => !c.byClaude);

  const lines: string[] = [];
  lines.push(`*konbu-suki 作業報告* 直近${hours}時間`);
  lines.push("");

  if (commits.length === 0) {
    lines.push("この時間帯の変更はなし。");
  } else {
    const files = commits.reduce((s, c) => s + c.filesChanged, 0);
    const add = commits.reduce((s, c) => s + c.insertions, 0);
    const del = commits.reduce((s, c) => s + c.deletions, 0);
    lines.push(
      `コミット ${commits.length}件（AI ${byClaude.length} / 人 ${byHuman.length}）` +
        ` / ${files}ファイル +${add} -${del}`
    );
    lines.push("");
    for (const c of commits) {
      lines.push(`${c.byClaude ? "[AI]" : "[人]"} ${escapeSlack(c.subject)}`);
    }
  }

  if (Number(unpushed) > 0) {
    lines.push("");
    lines.push(`未 push のコミットが ${unpushed}件ある`);
  }

  const message = lines.join("\n");

  if (noSlack) {
    console.log(message);
    return;
  }
  postToSlack(message).then((sent) => {
    console.log(message);
    console.log(`\nSlack 通知: ${sent ? "送信した" : "送信しなかった"}`);
  });
}

main();
