/**
 * ファイルの中身を Slack に流す。
 *
 * Usage:
 *   npx tsx scripts/post-slack.ts docs/night/2026-11-05/report.md
 *   npx tsx scripts/post-slack.ts --mention docs/night/2026-11-05/summary.md
 *   npx tsx scripts/post-slack.ts --mention --dry <path>   # 送らずに中身だけ出す
 *
 * --mention を付けると先頭にメンションを足し、スマホに通知が飛ぶ形で投稿する。
 * 宛先は .env の SLACK_MENTION。未設定なら <!channel>。個人宛てにするなら
 * 自分のメンバーIDを入れて `SLACK_MENTION="<@U01234ABCDE>"` のように書く
 * （メンバーIDは Slack のプロフィール → その他 → メンバーIDをコピー）。
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
  const args = process.argv.slice(2);
  const withMention = args.includes("--mention");
  const dry = args.includes("--dry");
  const file = args.find((a) => !a.startsWith("--"));
  if (!file) {
    console.error("ファイルを渡す: npx tsx scripts/post-slack.ts [--mention] <path>");
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

  // メンションは escapeSlack に通さない。<!channel> や <@U...> の山括弧が
  // &lt; に変換されると、ただの文字列になって通知が飛ばない。
  const body = escapeSlack(text);
  const mention = withMention ? `${process.env.SLACK_MENTION || "<!channel>"} ` : "";
  const payload = `${mention}${body}`;
  if (dry) {
    console.log("--- 実際に送る内容 ---");
    console.log(payload);
    console.log("--- ここまで（--dry のため送らない）---");
    return;
  }
  const sent = await postToSlack(payload);
  console.log(sent ? "Slack に流した" : "Slack に流せなかった");
  process.exit(sent ? 0 : 1);
}

main();
