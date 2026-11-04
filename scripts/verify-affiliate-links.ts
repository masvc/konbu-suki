/**
 * 全商品の購入リンクに成果計測が付いているかを確かめる。
 *
 * Usage:
 *   npx tsx scripts/verify-affiliate-links.ts
 *
 * リンクが素のURLのままだと、クリックされても成果にならない。しかも
 * 見た目は普通に動くのでエラーにならず、気付けない。書き換えのたびに
 * 機械的に確認する。
 *
 * ページと同じ組み立て関数（src/lib/affiliates.ts）を使う。別に書くと
 * 検査側だけ正しいという状態になりうる。
 */
import "dotenv/config";
import { createPrisma } from "./lib/db";
import { amazonProductUrl, amazonSearchUrl, rakutenProductUrl, rakutenSearchUrl } from "../src/lib/affiliates";
import { AMAZON_ASSOCIATE_TAG, MOSHIMO_A_ID } from "../src/lib/constants";

const prisma = createPrisma();

type Problem = { id: number; name: string; kind: string; url: string };

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, name: true, amazonAsin: true, rakutenId: true, rakutenUrl: true },
    orderBy: { id: "asc" },
  });

  const problems: Problem[] = [];
  let amazonDirect = 0;
  let amazonSearch = 0;
  let rakutenDirect = 0;
  let rakutenSearch = 0;

  for (const p of products) {
    const amazon = p.amazonAsin ? amazonProductUrl(p.amazonAsin) : amazonSearchUrl(p.name);
    if (p.amazonAsin) amazonDirect++; else amazonSearch++;
    if (!amazon.includes(`tag=${AMAZON_ASSOCIATE_TAG}`)) {
      problems.push({ id: p.id, name: p.name, kind: "Amazon のタグなし", url: amazon });
    }

    const rakutenTarget = p.rakutenUrl || p.rakutenId;
    const rakuten = rakutenTarget ? rakutenProductUrl(rakutenTarget) : rakutenSearchUrl(p.name);
    if (rakutenTarget) rakutenDirect++; else rakutenSearch++;
    if (MOSHIMO_A_ID && !rakuten.includes("af.moshimo.com")) {
      problems.push({ id: p.id, name: p.name, kind: "楽天が成果経由でない", url: rakuten });
    }
    if (MOSHIMO_A_ID && !rakuten.includes(`a_id=${MOSHIMO_A_ID}`)) {
      problems.push({ id: p.id, name: p.name, kind: "楽天のIDなし", url: rakuten });
    }
  }

  console.log(`商品 ${products.length}件`);
  console.log(`  Amazon : 商品ページ直 ${amazonDirect} / 検索 ${amazonSearch}`);
  console.log(`  楽天   : 商品ページ直 ${rakutenDirect} / 検索 ${rakutenSearch}`);
  if (!MOSHIMO_A_ID) {
    console.log("  注意: もしものIDが未設定。楽天リンクは素のURLになる");
  }

  if (problems.length === 0) {
    console.log("\n成果計測が付いていないリンクはない");
  } else {
    console.log(`\n問題 ${problems.length}件`);
    for (const p of problems.slice(0, 10)) {
      console.log(`  #${p.id} ${p.kind}: ${p.url.slice(0, 80)}`);
    }
  }

  console.log(
    `SUMMARY: 商品 ${products.length} / 楽天直リンク ${rakutenDirect} / 楽天検索 ${rakutenSearch} / 問題 ${problems.length}`
  );
  await prisma.$disconnect();
  if (problems.length > 0) process.exitCode = 1;
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
