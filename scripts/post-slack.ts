/**
 * ファイルの中身を Slack に流す。
 *
 * Usage:
 *   npx tsx scripts/post-slack.ts docs/night/2026-11-05/report.md
 *
 * 夜間実行の最後の枠が、自分でまとめた報告を投げるために使う。
 * activity-report.ts は決まった形の報告しか出せないので、分析結果や
 * 効果測定を含む文面は、書いた側から流せるようにする。
 */
import "dotenv/config";
import { existsSync, readFileSync } from "node:fs";
import { postToSlack, escapeSlack } from "./lib/slack";

/** Slack の1メッセージの上限に収める。超える分は切る。 */
const MAX_CHARS = 3500;

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("ファイルを渡す: npx tsx scripts/post-slack.ts <path>");
    process.exit(1);
  }
  if (!existsSync(file)) {
    console.error(`ファイルが無い: ${file}`);
    process.exit(1);
  }
  const raw = readFileSync(file, "utf8").trim();
  if (!raw) {
    console.error(`中身が空: ${file}`);
    process.exit(1);
  }
  const text =
    raw.length > MAX_CHARS ? `${raw.slice(0, MAX_CHARS)}\n…（以下省略。全文は ${file}）` : raw;

  const sent = await postToSlack(escapeSlack(text));
  console.log(sent ? "Slack に流した" : "Slack に流せなかった");
  process.exit(sent ? 0 : 1);
}

main();
