import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { companyName, contactName, email, productInfo, website } = await req.json();
    // ハニーポット
    if (website) return NextResponse.json({ message: "お問い合わせを受け付けました。" });

    if (!companyName || !contactName || !email) {
      return NextResponse.json({ error: "必須項目を入力してください" }, { status: 400 });
    }

    // Slack通知のみ（DB保存なし）
    const slackUrl = process.env.SLACK_WEBHOOK_URL;
    if (slackUrl) {
      fetch(slackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `[コンブスキー] 生産者掲載のお問い合わせ\n会社名: ${companyName}\n担当者: ${contactName}\nメール: ${email}\n商品概要: ${productInfo || "未記入"}`,
        }),
      }).catch(() => {});
    }

    return NextResponse.json({ message: "お問い合わせを受け付けました。追ってご連絡いたします。" });
  } catch {
    return NextResponse.json({ error: "送信に失敗しました" }, { status: 500 });
  }
}
