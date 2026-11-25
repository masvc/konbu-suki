/**
 * 商品のアフィリエイトリンクが生きているかを確かめ、消えているものを外す。
 *
 *   npx tsx scripts/check-affiliate-links.ts            # 調べるだけ
 *   npx tsx scripts/check-affiliate-links.ts --write    # 消えているリンクをDBから外す
 *   npx tsx scripts/check-affiliate-links.ts --only=75,79   # 商品IDを絞る
 *
 * **消えたリンクは外す。空にすると検索リンクに切り替わる**（src/lib/affiliates.ts）。
 * 商品ページは `amazonAsin` が無ければ商品名でのAmazon検索、`rakutenUrl`/
 * `rakutenId` が無ければ楽天検索に自動で落ちるので、404を押させずに済む。
 *
 * **404と410だけ外す。** 403・429・タイムアウトは外さない（相手がこちらの
 * 取得を弾いているだけで、人がブラウザで開けば見えることが多い）。
 *
 * **代わりの商品は自動で探さない。** 楽天の付け直しは `match-rakuten.ts` の
 * 役目で、目視の振り分け（triage-rakuten.ts）を通す決まりになっている。
 * ここは「死んだリンクを残さない」だけを受け持つ。
 */
import { createPrisma } from "./lib/db";

const WRITE = process.argv.includes("--write");
const only = process.argv
  .find((a) => a.startsWith("--only="))
  ?.slice(7)
  .split(",")
  .map(Number)
  .filter((n) => Number.isFinite(n));

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** 消えているか。消えていると言い切れるときだけ true */
async function isGone(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "GET",
      redirect: "follow",
      headers: { "User-Agent": "konbu-suki link check (+https://konbu-suki.com/)" },
      signal: AbortSignal.timeout(20_000),
    });
    return res.status === 404 || res.status === 410;
  } catch {
    return false;
  }
}

async function main() {
  const prisma = createPrisma();
  const products = await prisma.product.findMany({
    where: only ? { id: { in: only } } : undefined,
    select: { id: true, name: true, amazonAsin: true, amazonUrl: true, rakutenUrl: true, rakutenId: true },
    orderBy: { id: "asc" },
  });

  const { amazonProductUrl, rakutenProductUrl } = await import("../src/lib/affiliates");

  const deadAmazon: number[] = [];
  const deadRakuten: number[] = [];
  let checked = 0;

  for (const p of products) {
    if (p.amazonAsin) {
      if (await isGone(amazonProductUrl(p.amazonAsin))) {
        deadAmazon.push(p.id);
        console.log(`  [Amazon 404] #${p.id} ${p.name.slice(0, 40)}（${p.amazonAsin}）`);
      }
      checked += 1;
      await sleep(400);
    }
    const rakutenTarget = p.rakutenUrl || p.rakutenId;
    if (rakutenTarget) {
      if (await isGone(rakutenProductUrl(rakutenTarget))) {
        deadRakuten.push(p.id);
        console.log(`  [楽天 404] #${p.id} ${p.name.slice(0, 40)}`);
      }
      checked += 1;
      await sleep(400);
    }
  }

  console.log(
    `\n調べた ${checked}件／消えていた Amazon ${deadAmazon.length}件・楽天 ${deadRakuten.length}件`
  );

  if (!WRITE) {
    console.log("--write を付けると、消えているリンクをDBから外す（検索リンクに切り替わる）");
    process.exit(0);
  }

  if (deadAmazon.length > 0) {
    await prisma.product.updateMany({
      where: { id: { in: deadAmazon } },
      data: { amazonAsin: null, amazonUrl: null },
    });
  }
  if (deadRakuten.length > 0) {
    await prisma.product.updateMany({
      where: { id: { in: deadRakuten } },
      data: { rakutenUrl: null, rakutenId: null },
    });
  }
  console.log(`外した：Amazon ${deadAmazon.length}件・楽天 ${deadRakuten.length}件`);
  process.exit(0);
}

main();
