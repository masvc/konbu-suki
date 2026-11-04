/**
 * 楽天ウェブサービス共通クライアント
 * GORA API (Search / Detail / Plan) で共有
 */
import "dotenv/config";

const APP_ID = process.env.RAKUTEN_APP_ID!;
const ACCESS_KEY = process.env.RAKUTEN_ACCESS_KEY!;
const AFFILIATE_ID = process.env.RAKUTEN_AFFILIATE_ID!;

const API_BASE = "https://openapi.rakuten.co.jp/engine/api/Gora";

/** レート制限対策の待機 */
export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

/** API間隔（楽天推奨 1.5s以上） */
export const API_INTERVAL_MS = 1600;

/** 認証パラメータ確認 */
export function ensureCredentials() {
  if (!APP_ID || !ACCESS_KEY) {
    console.error("RAKUTEN_APP_ID / RAKUTEN_ACCESS_KEY が .env に未設定");
    process.exit(1);
  }
}

/** 共通認証パラメータ */
function authParams(): Record<string, string> {
  return {
    format: "json",
    formatVersion: "2",
    applicationId: APP_ID,
    accessKey: ACCESS_KEY,
    affiliateId: AFFILIATE_ID,
  };
}

/** GORA API呼び出し（429リトライ・404→null対応） */
export async function callGoraApi<T>(
  endpoint: "GoraGolfCourseSearch" | "GoraGolfCourseDetail" | "GoraGolfPlanSearch",
  params: Record<string, string>,
): Promise<T | null> {
  const allParams = new URLSearchParams({ ...authParams(), ...params });
  const url = `${API_BASE}/${endpoint}/20170623?${allParams}`;
  const res = await fetch(url);

  if (res.status === 404) return null;
  if (res.status === 429) {
    console.log("  → 429 レート制限 → 10秒待機");
    await sleep(10000);
    return callGoraApi(endpoint, params);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json() as Promise<T>;
}

/** 文字列→int変換（空・NaN→undefined） */
export function toInt(v: unknown): number | undefined {
  if (v == null || v === "") return undefined;
  const n = parseInt(String(v), 10);
  return isNaN(n) ? undefined : n;
}

/** Prismaクライアント生成（NeonアダプタでScript用） */
export async function createScriptPrisma() {
  const { PrismaClient } = await import("@/generated/prisma/client");
  const { PrismaPg } = await import("@prisma/adapter-pg");
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}
