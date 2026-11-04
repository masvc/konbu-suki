/**
 * スクリプト用の Prisma クライアント。
 *
 * 7つのスクリプトが同じ3行（アダプタ生成・クライアント生成・接続文字列）を
 * それぞれ書いていた。アダプタを差し替えるときに全部を直すことになる。
 * 実際 AWS 移行のときは src だけ直されて scripts が旧アダプタのまま残り、
 * 全スクリプトが import の時点で落ちる状態になっていた。1箇所にまとめる。
 *
 * サイト側は src/lib/prisma.ts。あちらはリクエストをまたいで使い回す必要が
 * あり、実装が別物なので共有しない。
 */
import "dotenv/config";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

export function createPrisma(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error(
      "DATABASE_URL が未設定。.env を確認する（npm run env:pull で取得できる）。"
    );
    process.exit(1);
  }
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}
