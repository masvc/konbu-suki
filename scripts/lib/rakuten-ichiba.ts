/**
 * 楽天市場 商品検索 API (Ichiba Item Search)
 *
 * 以前ここにあったのは楽天GORA（ゴルフ場予約）のクライアントで、別プロジェクト
 * 由来。import 元が一つも無く、商品には使えなかったので置き換える。
 *
 * 必要な環境変数:
 *   RAKUTEN_APP_ID        楽天ウェブサービスのアプリID（無料で発行できる）
 *   RAKUTEN_AFFILIATE_ID  任意。楽天直営アフィリエイトのID。
 *                         もしも経由ならここは空でよい（リンクの組み立ては
 *                         src/lib/affiliates.ts が担当する）。
 *
 * 呼び出し間隔は1秒1回が目安。連続で叩くと 429 が返る。
 */
import "dotenv/config";

const API_URL = "https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601";

/** 連続呼び出しの最低間隔 */
export const API_INTERVAL_MS = 1100;

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type RakutenItem = {
  itemName: string;
  /** "<ショップコード>:<商品ID>" 形式 */
  itemCode: string;
  itemPrice: number;
  itemUrl: string;
  shopName: string;
  imageUrl: string | null;
  reviewCount: number;
  reviewAverage: number;
};

export function hasCredentials(): boolean {
  return Boolean(process.env.RAKUTEN_APP_ID);
}

export function requireCredentials(): string {
  const appId = process.env.RAKUTEN_APP_ID;
  if (!appId) {
    console.error(
      "RAKUTEN_APP_ID が .env に未設定。" +
        "楽天ウェブサービス (https://webservice.rakuten.co.jp/) でアプリIDを発行して設定する。"
    );
    process.exit(1);
  }
  return appId;
}

type RawItem = Record<string, unknown>;

function pickString(raw: RawItem, key: string): string {
  const v = raw[key];
  return typeof v === "string" ? v : "";
}

function pickNumber(raw: RawItem, key: string): number {
  const v = raw[key];
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function pickImage(raw: RawItem): string | null {
  for (const key of ["mediumImageUrls", "smallImageUrls"]) {
    const list = raw[key];
    if (!Array.isArray(list) || list.length === 0) continue;
    const first = list[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object" && typeof (first as RawItem).imageUrl === "string") {
      return (first as RawItem).imageUrl as string;
    }
  }
  return null;
}

function normalizeItem(entry: unknown): RakutenItem | null {
  if (!entry || typeof entry !== "object") return null;
  // 版によって { Item: {...} } で包まれる場合とそのままの場合がある
  const wrapped = (entry as RawItem).Item;
  const raw = (wrapped && typeof wrapped === "object" ? wrapped : entry) as RawItem;
  const itemCode = pickString(raw, "itemCode");
  if (!itemCode) return null;
  return {
    itemName: pickString(raw, "itemName"),
    itemCode,
    itemPrice: pickNumber(raw, "itemPrice"),
    itemUrl: pickString(raw, "itemUrl"),
    shopName: pickString(raw, "shopName"),
    imageUrl: pickImage(raw),
    reviewCount: pickNumber(raw, "reviewCount"),
    reviewAverage: pickNumber(raw, "reviewAverage"),
  };
}

export async function searchItems(
  keyword: string,
  opts: { hits?: number; retries?: number } = {}
): Promise<RakutenItem[]> {
  const { hits = 10, retries = 2 } = opts;
  const params = new URLSearchParams({
    applicationId: requireCredentials(),
    keyword,
    hits: String(hits),
    format: "json",
    formatVersion: "2",
  });
  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID;
  if (affiliateId) params.set("affiliateId", affiliateId);

  for (let attempt = 0; attempt <= retries; attempt++) {
    const res = await fetch(`${API_URL}?${params}`);
    if (res.status === 429) {
      // 叩きすぎ。間隔を広げて待つ。
      await sleep(API_INTERVAL_MS * (attempt + 2));
      continue;
    }
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`楽天APIが ${res.status} を返した: ${body.slice(0, 200)}`);
    }
    const data = (await res.json()) as { Items?: unknown[] };
    const items = Array.isArray(data.Items) ? data.Items : [];
    return items.map(normalizeItem).filter((i): i is RakutenItem => i !== null);
  }
  throw new Error("楽天APIが繰り返し 429 を返した");
}
