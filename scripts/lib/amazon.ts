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

/** 商品ページのアフィリエイトURL */
export function amazonProductUrl(asin: string): string {
  return `https://www.amazon.co.jp/dp/${asin}?tag=${AMAZON_PARTNER_TAG}`;
}
