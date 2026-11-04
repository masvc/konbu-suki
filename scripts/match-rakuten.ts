/**
 * Amazon 側で持っている商品に対応する楽天の商品を探し、rakutenUrl / rakutenId を埋める。
 *
 * Usage:
 *   npx tsx scripts/match-rakuten.ts                 # 下見。DBには書かない
 *   npx tsx scripts/match-rakuten.ts --limit 20      # 件数を絞って試す
 *   npx tsx scripts/match-rakuten.ts --min 0.8       # 一致とみなす下限（既定 0.72）
 *   npx tsx scripts/match-rakuten.ts --write         # DBに書き込む
 *
 * 既定は下見。DB書き込みは --write を明示したときだけ行う
 * （CLAUDE.md: DB書き込みは事前にユーザーの確認を取る）。
 *
 * 判定の根拠は scripts/tmp/ に JSON で残すので、--write の前に目を通せる。
 *
 * rakutenUrl には楽天のそのままの商品URLを入れる。アフィリエイトの形に
 * 変えるのは src/lib/affiliates.ts の仕事。ここで成果リンクを保存すると、
 * ASPを変えるたびにDBを書き換えることになる。
 */
import "dotenv/config";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createPrisma } from "./lib/db";
import { searchItems, sleep, API_INTERVAL_MS, hasCredentials } from "./lib/rakuten-ichiba";
import { bestMatch, type Target } from "./lib/match";

const prisma = createPrisma();

const args = process.argv.slice(2);
const write = args.includes("--write");
const numberAfter = (flag: string, fallback: number) => {
  const i = args.indexOf(flag);
  if (i === -1) return fallback;
  const n = Number(args[i + 1]);
  return Number.isFinite(n) ? n : fallback;
};
const limit = numberAfter("--limit", 0);
const minScore = numberAfter("--min", 0.72);

const OUT_DIR = path.resolve(__dirname, "tmp");

/**
 * 検索語の候補を、具体的な順に並べて作る。
 *
 * 楽天の検索は指定した語を全部含むものだけを返す。商品名をそのまま渡すと
 * 「道南伝統食品 天然 利尻昆布 1等検 200g」のようになり、ブランド名や
 * 等級まで一致する出品しか拾えず0件になる。実際それで全件が保留になった。
 * 具体的な語から順に試し、候補が出た時点で打ち切る。
 *
 * 緩めても誤一致は増えない。判定は商品名全体に対する一致率で行うため、
 * 広く拾った候補は素点が低く出て閾値で落ちる。
 */
function buildQueries(brand: string, name: string): string[] {
  const cleaned = name
    .replace(/[【】[\]（）()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const words = cleaned.split(" ").filter(Boolean);
  const candidates = [
    `${brand} ${cleaned}`.trim(),
    cleaned,
    words.slice(0, 3).join(" "),
    words.slice(0, 2).join(" "),
  ];
  // 重複を除き、短すぎるものは落とす
  return [...new Set(candidates)].filter((q) => q.length >= 2).slice(0, 4);
}

type Row = {
  id: number;
  name: string;
  brand: string;
  /** 候補が出た検索語。どれでも出なければ最後に試したもの */
  keyword: string;
  /** 何段階目で候補が出たか（1が最も具体的） */
  queryStep: number;
  matched: boolean;
  score: number | null;
  reasons: string[];
  rakutenItemName: string | null;
  rakutenItemCode: string | null;
  rakutenUrl: string | null;
  rakutenPrice: number | null;
  candidateCount: number;
};

async function main() {
  if (!hasCredentials()) {
    console.error(
      "RAKUTEN_APP_ID と RAKUTEN_ACCESS_KEY の両方が必要。\n" +
        "https://webservice.rakuten.co.jp/ で発行して .env に入れる。\n" +
        "アプリは Application type を「API/Backend Service」にして、" +
        "Allowed IP addresses に 0.0.0.0 を入れること。" +
        "「Web Application」でドメイン指定にすると CLIENT_IP_NOT_ALLOWED で弾かれる。"
    );
    process.exit(1);
  }

  const products = await prisma.product.findMany({
    where: { rakutenUrl: null },
    select: { id: true, name: true, brand: true, price: true, weight: true },
    orderBy: { id: "asc" },
    ...(limit > 0 ? { take: limit } : {}),
  });

  console.log(`対象: ${products.length}件（楽天リンク未設定の商品）`);
  console.log(`一致の下限: ${minScore} / 書き込み: ${write ? "する" : "しない（下見）"}`);
  console.log("=".repeat(70));

  const rows: Row[] = [];

  for (const [index, product] of products.entries()) {
    const target: Target = {
      name: product.name,
      brand: product.brand,
      price: product.price,
      weight: product.weight,
    };

    const queries = buildQueries(product.brand, product.name);
    let candidates: Awaited<ReturnType<typeof searchItems>> = [];
    let keyword = queries[queries.length - 1] ?? product.name;
    let queryStep = 0;

    for (const [step, query] of queries.entries()) {
      if (step > 0) await sleep(API_INTERVAL_MS);
      try {
        candidates = await searchItems(query, { hits: 10 });
      } catch (e) {
        console.log(`  [${product.id}] 検索失敗: ${e instanceof Error ? e.message : String(e)}`);
        candidates = [];
      }
      if (candidates.length > 0) {
        keyword = query;
        queryStep = step + 1;
        break;
      }
    }

    const best = candidates.length > 0 ? bestMatch(target, candidates) : null;
    const matched = Boolean(best && best.score.score >= minScore);

    rows.push({
      id: product.id,
      name: product.name,
      brand: product.brand,
      keyword,
      queryStep,
      matched,
      score: best ? Number(best.score.score.toFixed(3)) : null,
      reasons: best ? best.score.reasons : [],
      rakutenItemName: best ? best.candidate.itemName : null,
      rakutenItemCode: best ? (best.candidate as { itemCode?: string }).itemCode ?? null : null,
      rakutenUrl: best ? (best.candidate as { itemUrl?: string }).itemUrl ?? null : null,
      rakutenPrice: best ? best.candidate.itemPrice : null,
      candidateCount: candidates.length,
    });

    const mark = matched ? "一致" : "保留";
    const score = best ? best.score.score.toFixed(2) : "-";
    console.log(`[${index + 1}/${products.length}] ${mark} ${score} #${product.id} ${product.name}`);
    if (best) console.log(`         ← ${best.candidate.itemName.slice(0, 70)}`);

    if (index < products.length - 1) await sleep(API_INTERVAL_MS);
  }

  mkdirSync(OUT_DIR, { recursive: true });
  const outFile = path.join(OUT_DIR, `rakuten-match-${new Date().toLocaleDateString("sv-SE")}.json`);
  writeFileSync(outFile, JSON.stringify(rows, null, 2));

  const matchedRows = rows.filter((r) => r.matched && r.rakutenUrl && r.rakutenItemCode);
  console.log("\n" + "=".repeat(70));
  console.log(`一致 ${matchedRows.length}件 / 保留 ${rows.length - matchedRows.length}件`);
  console.log(`判定の根拠: ${outFile}`);

  if (!write) {
    console.log("\n下見のみ。書き込むには --write を付ける。");
    console.log("書き込む前に上のJSONで一致内容を確認すること。");
  } else {
    let updated = 0;
    for (const row of matchedRows) {
      await prisma.product.update({
        where: { id: row.id },
        data: { rakutenUrl: row.rakutenUrl, rakutenId: row.rakutenItemCode },
      });
      updated++;
    }
    console.log(`\n${updated}件を更新した`);
  }

  console.log(`SUMMARY: 対象 ${rows.length} / 一致 ${matchedRows.length} / 書き込み ${write ? matchedRows.length : 0}`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
