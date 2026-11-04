/**
 * 自サイトの URL。
 *
 * 以前は各スクリプトに別サイトのドメインが直接書かれていて、konbu-suki を
 * 対象にしているつもりで別サイトを検査していた。さらに check-links.ts には
 * 独自のハードコードがあり、同じ値が3箇所に散っていた。
 *
 * 参照元を src/lib/constants.ts の SITE_URL（NEXT_PUBLIC_SITE_URL 由来）
 * ひとつに寄せる。ドメインを変えるときは .env だけ直せば全スクリプトが追従する。
 *
 * ここが持つのは「自サイトの URL とは何か」だけ。Search Console の
 * プロパティ指定は google-auth.ts、GA4 の定数は analytics-constants.ts。
 */
import { SITE_URL } from "../../src/lib/constants";

/** 末尾のスラッシュを落とした自サイトの URL */
export const PUBLIC_SITE_URL = SITE_URL.replace(/\/+$/, "");

/** 自サイトのホスト名。User-Agent やログの見出しに使う。 */
export const PUBLIC_SITE_HOST = PUBLIC_SITE_URL.replace(/^https?:\/\//, "");

/** 絶対 URL をサイト内パスに直す。自サイト以外の URL はそのまま返す。 */
export function toSitePath(url: string): string {
  const value = url || "";
  if (!value.startsWith(PUBLIC_SITE_URL)) return value;
  return value.slice(PUBLIC_SITE_URL.length) || "/";
}
