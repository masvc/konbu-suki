/**
 * 自動作業の停止フラグ。
 *
 * 長く走る処理は、記事1本ごとのような区切りでこれを確認して止まる。
 * 途中で止めたくなったときに、プロセスを探して kill しなくて済むようにする。
 *
 * 止めるには、プロジェクト直下に .stop を置く。
 *   touch .stop
 * 再開するときは消す。
 *   rm .stop
 *
 * ~/Desktop 配下に置くのは、Slack 経由の bot（WORK_DIR が ~/Desktop）からも
 * 作れるようにするため。後日 Slack から止められるようにする布石。
 */
import { existsSync } from "node:fs";
import path from "node:path";

const STOP_FILE = path.resolve(__dirname, "..", "..", ".stop");

export function stopRequested(): boolean {
  return existsSync(STOP_FILE);
}

/** 停止が要求されていれば理由を出して true を返す。 */
export function shouldStop(label: string): boolean {
  if (!stopRequested()) return false;
  console.log(`\n停止フラグ（${STOP_FILE}）を検出。${label} の前で止まる。`);
  console.log("再開するには .stop を消す。");
  return true;
}

export const STOP_FILE_PATH = STOP_FILE;
