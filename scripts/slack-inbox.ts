/**
 * Slack に送った指示を docs/inbox.md に取り込む。
 *
 * Usage:
 *   npx tsx scripts/slack-inbox.ts         # 取り込む
 *   npx tsx scripts/slack-inbox.ts --dry   # 取り込まず、拾える分を表示する
 *
 * 外出先で思いついたことを、その場で作業キューに入れられるようにする。
 * 夜間の各枠は docs/inbox.md を最初に読む（CLAUDE.md「指示の取り込み」）。
 *
 * **送信用の webhook では読めない。** SLACK_OPS_WEBHOOK_URL は投稿専用で、
 * 履歴の取得にはボットのトークンが要る。.env に次の2つを足すと動く。
 *   SLACK_BOT_TOKEN      xoxb- で始まるボットトークン
 *   SLACK_INBOX_CHANNEL  取り込み元のチャンネルID（C… か D…）
 * 必要なスコープは channels:history / groups:history / im:history のうち使うもの。
 *
 * 未設定のあいだは docs/inbox.md を直接書く運用で回る。設定が無いことを
 * エラーにはしない（夜間の枠が落ちないように）。
 */
import "dotenv/config";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

const PROJECT_ROOT = path.resolve(__dirname, "..");
const INBOX = path.join(PROJECT_ROOT, "docs", "inbox.md");
const STATE_DIR = path.join(homedir(), "Library/Logs/konbu-suki");
const STATE_FILE = path.join(STATE_DIR, "slack-inbox.json");

const dry = process.argv.slice(2).includes("--dry");

type SlackMessage = { ts: string; text?: string; bot_id?: string; subtype?: string };

function loadLastTs(): string | null {
  try {
    return JSON.parse(readFileSync(STATE_FILE, "utf8")).lastTs ?? null;
  } catch {
    return null;
  }
}

function saveLastTs(ts: string) {
  mkdirSync(STATE_DIR, { recursive: true });
  writeFileSync(STATE_FILE, JSON.stringify({ lastTs: ts }, null, 2));
}

/** 取り込んだ指示を「未処理」の下に足す。見出しの形は docs/inbox.md 参照。 */
function appendToInbox(lines: string[]) {
  const text = readFileSync(INBOX, "utf8");
  const heading = "## 未処理\n";
  const i = text.indexOf(heading);
  if (i === -1) throw new Error(`docs/inbox.md に「## 未処理」が無い`);
  const after = i + heading.length;
  // 「（なし）」が置いてあれば差し替える
  const rest = text.slice(after).replace(/^\n（なし）\n/, "\n");
  const block = `\n${lines.map((l) => `- [ ] ${l}`).join("\n")}\n`;
  writeFileSync(INBOX, text.slice(0, after) + block + rest);
}

async function main() {
  const token = process.env.SLACK_BOT_TOKEN;
  const channel = process.env.SLACK_INBOX_CHANNEL;
  if (!token || !channel) {
    console.log(
      "Slack からの取り込みは設定されていない。\n" +
        "  .env に SLACK_BOT_TOKEN（xoxb-…）と SLACK_INBOX_CHANNEL（C… か D…）を足すと動く。\n" +
        "  未設定のあいだは docs/inbox.md を直接書く。"
    );
    return;
  }

  const lastTs = loadLastTs();
  const params = new URLSearchParams({ channel, limit: "50" });
  if (lastTs) params.set("oldest", lastTs);

  const res = await fetch(`https://slack.com/api/conversations.history?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json()) as { ok: boolean; error?: string; messages?: SlackMessage[] };
  if (!data.ok) {
    console.log(`Slack の取得に失敗: ${data.error ?? "不明"}`);
    process.exitCode = 1;
    return;
  }

  // 自分が流した報告を拾わない。bot の投稿と、参加/退出のような subtype は除く。
  const messages = (data.messages ?? [])
    .filter((m) => !m.bot_id && !m.subtype && (m.text ?? "").trim())
    .filter((m) => m.ts !== lastTs)
    .sort((a, b) => Number(a.ts) - Number(b.ts));

  if (messages.length === 0) {
    console.log("新しい指示は無い。");
    return;
  }

  const lines = messages.map((m) => (m.text ?? "").replace(/\s*\n\s*/g, " ").trim());
  console.log(`取り込む指示 ${lines.length}件:`);
  for (const l of lines) console.log(`  - ${l.slice(0, 100)}`);

  if (dry) {
    console.log("\n--dry のため書き込まない。");
    return;
  }
  appendToInbox(lines);
  saveLastTs(messages[messages.length - 1].ts);
  console.log(`\ndocs/inbox.md に追記した。`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : String(e));
  process.exit(1);
});
