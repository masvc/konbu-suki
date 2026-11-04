import { NextRequest, NextResponse } from "next/server";

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL ?? "";

function escapeSlack(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function POST(request: NextRequest) {
  const { type, name, email, message, website } = await request.json();

  // honeypot
  if (website) return NextResponse.json({ ok: true });

  const validTypes = ["product", "producer", "media", "other"];
  if (!validTypes.includes(type)) {
    return NextResponse.json({ error: "お問い合わせ種別を選択してください" }, { status: 400 });
  }
  if (!name?.trim() || name.length > 100) {
    return NextResponse.json({ error: "お名前を入力してください" }, { status: 400 });
  }
  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "有効なメールアドレスを入力してください" }, { status: 400 });
  }
  if (!message?.trim() || message.length > 5000) {
    return NextResponse.json({ error: "お問い合わせ内容を入力してください" }, { status: 400 });
  }

  const typeLabels: Record<string, string> = {
    product: "商品掲載リクエスト",
    producer: "生産者・メーカー掲載",
    media: "メディア・広告掲載",
    other: "その他",
  };

  const sentAt = new Date().toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });

  const slackText = [
    `:incoming_envelope: *コンブスキー お問い合わせ*`,
    `*送信日時:* ${sentAt}`,
    `*種別:* ${typeLabels[type] ?? type}`,
    `*お名前:* ${escapeSlack(name.trim())}`,
    `*メール:* ${escapeSlack(email.trim())}`,
    `*内容:*\n${escapeSlack(message.trim())}`,
  ].join("\n");

  if (!SLACK_WEBHOOK_URL) {
    console.error("SLACK_WEBHOOK_URL is not set");
    return NextResponse.json({ error: "送信設定にエラーがあります" }, { status: 500 });
  }

  const slackRes = await fetch(SLACK_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: slackText }),
  });

  if (!slackRes.ok) {
    console.error("Slack webhook failed:", slackRes.status);
    return NextResponse.json({ error: "送信に失敗しました。時間をおいて再度お試しください" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
