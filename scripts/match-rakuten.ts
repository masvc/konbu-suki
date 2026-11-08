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
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
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
/** 保存済みの判定結果を読んで、それだけを書き込むモード */
const applyFrom = (() => {
  const i = args.indexOf("--apply");
  return i === -1 ? null : args[i + 1] || null;
})();

const OUT_DIR = path.resolve(__dirname, "tmp");

/**
 * 夜間の無人実行では、全件まとめての書き込みを禁じる。
 *
 * ユーザーが許可したのは「レビュー待ちのうち再照合で score>=0.85 になったものを
 * 適用する」ところまで。--write だけを付けると既定の 0.72 以上がすべて書き込まれ、
 * 許可の範囲を超える。triage-rakuten.ts が振り分けた --apply のファイル経由だけに
 * 絞る。CLAUDE.md「DB書き込みルール」の例外の条件をコードで担保する。
 *
 * 手で実行するとき（NIGHT_RUN が無いとき）は、これまでどおり制限しない。
 */
if (process.env.NIGHT_RUN === "1" && write && !applyFrom) {
  console.error(
    "夜間の実行では --write 単体を受け付けない。\n" +
      "  1) npx tsx scripts/match-rakuten.ts            （下見。JSON が scripts/tmp に出る）\n" +
      "  2) npx tsx scripts/triage-rakuten.ts <その JSON>（score>=0.85 だけに絞る）\n" +
      "  3) npx tsx scripts/match-rakuten.ts --apply scripts/tmp/rakuten-apply.json --write\n" +
      "の順で行う。"
  );
  process.exit(1);
}

/** 楽天APIの keyword の上限（128文字以上は 400 になる） */
const MAX_KEYWORD_LENGTH = 127;

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
  // 楽天APIは128文字以上の keyword を 400（keyword must be under 128 length）で
  // 弾く。長い商品名は語の切れ目で切り詰めてから渡す。
  // 重複を除き、短すぎるものは落とす
  return [...new Set(candidates.map(fitKeyword))].filter((q) => q.length >= 2).slice(0, 4);
}

function fitKeyword(query: string): string {
  if (query.length <= MAX_KEYWORD_LENGTH) return query;
  const words = query.split(" ");
  let out = "";
  for (const w of words) {
    const next = out ? `${out} ${w}` : w;
    if (next.length > MAX_KEYWORD_LENGTH) break;
    out = next;
  }
  // 1語目だけで上限を超えるときは文字数で切る
  return out || query.slice(0, MAX_KEYWORD_LENGTH);
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

/**
 * 下見で作った判定結果を読み、そこに載っているものだけを書き込む。
 *
 * 下見は315件で40分かかる。閾値を上げ直すたびに叩き直すのは楽天にも
 * こちらにも無駄なので、確認を通した結果を渡して適用できるようにする。
 */
async function applyFromFile(file: string) {
  const rows = JSON.parse(readFileSync(file, "utf8")) as Row[];
  const usable = rows.filter((r) => r.rakutenUrl && r.rakutenItemCode);
  console.log(`${file} から ${rows.length}件を読んだ（うち書き込める ${usable.length}件）`);

  if (!write) {
    console.log("\n下見のみ。書き込むには --write を付ける。");
    for (const r of usable.slice(0, 5)) {
      console.log(`  #${r.id} ${r.name.slice(0, 40)} → ${r.rakutenItemName?.slice(0, 40)}`);
    }
    console.log(`SUMMARY: 対象 ${rows.length} / 書き込める ${usable.length} / 書き込み 0`);
    return;
  }

  let updated = 0;
  for (const row of usable) {
    await prisma.product.update({
      where: { id: row.id },
      data: { rakutenUrl: row.rakutenUrl, rakutenId: row.rakutenItemCode },
    });
    updated++;
  }
  console.log(`${updated}件を更新した`);
  console.log(`SUMMARY: 対象 ${rows.length} / 書き込み ${updated}`);
}

async function main() {
  if (applyFrom) {
    await applyFromFile(applyFrom);
    await prisma.$disconnect();
    return;
  }

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
