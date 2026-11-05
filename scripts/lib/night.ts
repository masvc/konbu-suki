/**
 * 夜間実行の共通の決まり。
 *
 * 枠が 23:00 / 1:00 / 3:00 / 5:00 / 7:00 と日付をまたぐため、「どの夜のものか」
 * をカレンダー日付で決めると 23:00 の枠だけ別フォルダになる。12時間戻した
 * 日付を「その夜の名前」にする。23:00 → 当日、1:00〜7:00 → 前日になる。
 */
import { mkdirSync } from "node:fs";
import path from "node:path";

const PROJECT_ROOT = path.resolve(__dirname, "..", "..");

/** その夜のフォルダ名（YYYY-MM-DD）。 */
export function nightDate(at: Date = new Date()): string {
  const shifted = new Date(at.getTime() - 12 * 60 * 60 * 1000);
  return shifted.toLocaleDateString("sv-SE");
}

/** その夜の作業フォルダ。無ければ作る。 */
export function nightDir(at: Date = new Date()): string {
  const dir = path.join(PROJECT_ROOT, "docs", "night", nightDate(at));
  mkdirSync(dir, { recursive: true });
  return dir;
}

/** リポジトリ直下からの相対パス。プロンプトに書くときはこちらを使う。 */
export function nightDirRelative(at: Date = new Date()): string {
  return path.posix.join("docs", "night", nightDate(at));
}
