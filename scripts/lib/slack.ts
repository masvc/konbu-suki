/**
 * 運用通知の Slack 投稿。
 *
 * お問い合わせフォーム（src/app/api/contact/route.ts）も Slack に投げるが、
 * あちらは Web リクエストの処理、こちらは定期点検の通知で用途が別。
 *
 * 宛先も分ける。SLACK_OPS_WEBHOOK_URL を優先し、無ければ
 * SLACK_WEBHOOK_URL にそのまま落ちる。同じキーを使い回すと、本番に
 * 設定した時点で問い合わせが点検チャンネルに流れてしまう。
 */

/** Slack の mrkdwn で意味を持つ文字を無効化する */
export function escapeSlack(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** 投げられたら true。未設定や失敗は理由を出して false（例外にはしない）。 */
export async function postToSlack(text: string): Promise<boolean> {
  const url = process.env.SLACK_OPS_WEBHOOK_URL || process.env.SLACK_WEBHOOK_URL;
  if (!url) {
    console.log(
      "SLACK_OPS_WEBHOOK_URL（無ければ SLACK_WEBHOOK_URL）が未設定なので Slack 通知は行わない"
    );
    return false;
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      console.log(`Slack 通知に失敗: ${res.status} ${await res.text().catch(() => "")}`);
      return false;
    }
    return true;
  } catch (e) {
    console.log(`Slack 通知に失敗: ${e instanceof Error ? e.message : String(e)}`);
    return false;
  }
}
