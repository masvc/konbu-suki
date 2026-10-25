import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "メールアドレスを入力してください" }, { status: 400 });
    }

    const existing = await prisma.subscriber.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: "既に登録済みです" });
    }

    await prisma.subscriber.create({ data: { email } });

    // Slack通知（設定されている場合）
    const slackUrl = process.env.SLACK_WEBHOOK_URL;
    if (slackUrl) {
      fetch(slackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: `[コンブスキー] 新規メルマガ登録: ${email}` }),
      }).catch(() => {});
    }

    return NextResponse.json({ message: "登録しました" });
  } catch {
    return NextResponse.json({ error: "登録に失敗しました" }, { status: 500 });
  }
}
