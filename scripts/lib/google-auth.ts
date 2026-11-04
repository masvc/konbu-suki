/**
 * Google API 認証ユーティリティ
 *
 * GA4 / Search Console の認証済みクライアント生成を一元化。
 * 各スクリプトで重複していた GoogleAuth 初期化パターンを共通化する。
 *
 * 使用例:
 *   import { getGA4Client, getSearchConsoleClient, requireGA4PropertyId } from "./lib/google-auth";
 *   const ad = getGA4Client();
 *   const sc = getSearchConsoleClient();
 */
import { google } from "googleapis";
import { PUBLIC_SITE_HOST } from "./site";

/** Google認証情報ファイルパス */
export const CREDENTIALS_PATH =
  process.env.GOOGLE_APPLICATION_CREDENTIALS || "./google-credentials.json";

/**
 * Search Console の「プロパティ」指定。自サイトの URL とは別物なので
 * SITE_URL という名前にはしない（混同して別サイトを見ていた経緯がある）。
 * 自サイトの URL は lib/site.ts の PUBLIC_SITE_URL。
 * 既定値は自サイトのドメインプロパティ。Search Console への登録が前提。
 */
export const SEARCH_CONSOLE_SITE =
  process.env.SEARCH_CONSOLE_SITE || `sc-domain:${PUBLIC_SITE_HOST}`;

/** GA4 Data API 用の認証済みクライアントを取得する */
export function getGA4Client() {
  const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
  });
  return google.analyticsdata({ version: "v1beta", auth });
}

/** Search Console API 用の認証済みクライアントを取得する */
export function getSearchConsoleClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
  });
  return google.searchconsole({ version: "v1", auth });
}

/**
 * GA4 + Search Console 両方のスコープを持つ認証済みクライアントを取得する。
 * weekly.ts のように両方を同時に使うスクリプト向け。
 */
export function getGoogleClients() {
  const auth = new google.auth.GoogleAuth({
    keyFile: CREDENTIALS_PATH,
    scopes: [
      "https://www.googleapis.com/auth/analytics.readonly",
      "https://www.googleapis.com/auth/webmasters.readonly",
    ],
  });
  return {
    analyticsdata: google.analyticsdata({ version: "v1beta", auth }),
    searchconsole: google.searchconsole({ version: "v1", auth }),
  };
}

/**
 * GA4 プロパティIDを取得する。
 * 未設定の場合はエラーメッセージを表示して process.exit(1) する。
 */
export function requireGA4PropertyId(): string {
  const id = process.env.GA4_PROPERTY_ID;
  if (!id) {
    console.error("GA4_PROPERTY_ID が .env に未設定");
    process.exit(1);
  }
  return id;
}
