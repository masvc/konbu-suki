/**
 * スクリプトから使う Amazon のトラッキングID。
 *
 * 以前は4つのスクリプトにそれぞれ "konbu-suki-22" が直接書かれており、
 * さらに src/lib/constants.ts 側のフォールバックだけハイフンが落ちて
 * "konbusuki-22" になっていた。環境変数が未設定の環境では存在しないタグが
 * 出力され、クリックが成果にならない状態だった。既定値は1箇所に集める。
 *
 * サイト側は NEXT_PUBLIC_AMAZON_TAG（クライアントにも渡る必要があるため）、
 * スクリプト側は AMAZON_PARTNER_TAG を見る。どちらも無ければ共通の既定値。
 */
import { AMAZON_ASSOCIATE_TAG } from "../../src/lib/constants";

export const AMAZON_PARTNER_TAG = process.env.AMAZON_PARTNER_TAG || AMAZON_ASSOCIATE_TAG;

/**
 * Creators API が返す商品の形。
 *
 * SDK が戻り値に型を付けていないため、使う範囲だけ宣言する。同じ形が
 * 複数のスクリプトに別々に書かれていたので、ここにまとめる。
 */
export type AmazonItem = {
  asin?: string;
  images?: { primary?: { large?: { url: string }; medium?: { url: string } } };
  itemInfo?: {
    title?: { displayValue: string };
    byLineInfo?: { brand?: { displayValue: string } };
  };
  offersV2?: { listings?: Array<{ price?: { money?: { amount: number } } }> };
};

/** getItems / searchItems の戻り値。型が付いていないので受け側で形を宣言する。 */
export type GetItemsResponse = { itemsResult?: { items?: AmazonItem[] } };
export type SearchItemsResponse = { searchResult?: { items?: AmazonItem[] } };

/** 商品ページのアフィリエイトURL */
export function amazonProductUrl(asin: string): string {
  return `https://www.amazon.co.jp/dp/${asin}?tag=${AMAZON_PARTNER_TAG}`;
}
