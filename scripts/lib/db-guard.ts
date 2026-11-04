/**
 * 接続先ガード: 本番 DB への誤書き込みを防止
 *
 * 実行時に接続先ホスト（ep-xxxx）を表示し、
 * 本番ホスト（ep-polished-moon）に向いているときは --prod フラグがない限り中断。
 */
const PROD_HOST_MARKER = "ep-polished-moon";

export function guardConnection(): void {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("ERROR: DATABASE_URL が設定されていません");
    process.exit(1);
  }

  let host: string;
  try {
    host = new URL(url).hostname;
  } catch {
    console.error("ERROR: DATABASE_URL のパースに失敗");
    process.exit(1);
  }

  console.log(`接続先: ${host}`);

  if (host.includes(PROD_HOST_MARKER)) {
    if (!process.argv.includes("--prod")) {
      console.error(`\n⚠ 本番 DB (${PROD_HOST_MARKER}) に向いています。`);
      console.error("本番に書き込むには --prod フラグを付けてください。中断します。");
      process.exit(1);
    }
    console.log("⚠ --prod フラグあり。本番 DB に書き込みます。\n");
  } else {
    console.log("(ブランチ DB)\n");
  }
}
