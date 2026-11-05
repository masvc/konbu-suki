/**
 * 作業報告を Slack に流す。
 *
 * Usage:
 *   npx tsx scripts/activity-report.ts            # 報告して記録を更新
 *   npx tsx scripts/activity-report.ts --no-slack # 流さず中身だけ出す
 *   npx tsx scripts/activity-report.ts --dry      # 記録も更新しない
 *
 * 「何をしたか」ではなく「何が変わったか」と「朝やること」を出す。
 * コミット一覧は載せない。件名を並べても、何が進んだのか読み取れないため。
 *
 * **定時実行はしない。** 以前は2時間ごとに流していたが、時間で区切ると同じ
 * 成果が何度も報告される。作業が一通り終わった時点で1回呼ぶ
 * （scripts/auto-content.ts が最後に呼ぶ）。
 *
 * 前回比を出すために、実行のたびに数字を
 * ~/Library/Logs/konbu-suki/metrics.json に残して次回と比べる。報告した記事の
 * 見出しも残す。当日分を記録から拾う作りのため、残さないと同じ記事が毎回
 * 「本日の記事」に並ぶ（実際に1日分が毎回重複していた）。
 */
import "dotenv/config";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { createPrisma } from "./lib/db";
import { GUIDES } from "../src/lib/guides";
import { SITE_URL } from "../src/lib/constants";
import { postToSlack, escapeSlack } from "./lib/slack";
import { stopRequested } from "./lib/stop";

const PROJECT_ROOT = path.resolve(__dirname, "..");
const STATE_DIR = path.join(homedir(), "Library/Logs/konbu-suki");
const METRICS_FILE = path.join(STATE_DIR, "metrics.json");
const REVIEW_CSV = path.join(PROJECT_ROOT, "docs", "review-rakuten.csv");
const CONTENT_LOG = path.join(PROJECT_ROOT, "docs", "content-log.md");

const args = process.argv.slice(2);
const noSlack = args.includes("--no-slack");
const dry = args.includes("--dry");

type Metrics = {
  at: string;
  guides: number;
  guideSlugs: string[];
  products: number;
  rakutenDirect: number;
  /** すでに報告した記事の見出し。同じものを二度報告しないために残す。 */
  reportedArticles?: string[];
};

function loadPrevious(): Metrics | null {
  try {
    return JSON.parse(readFileSync(METRICS_FILE, "utf8")) as Metrics;
  } catch {
    return null;
  }
}

/** 増減を "+3" のような形にする。変化なしは空文字。 */
function delta(now: number, before: number | undefined): string {
  if (before === undefined) return "";
  const d = now - before;
  if (d === 0) return "";
  return d > 0 ? `（+${d}）` : `（${d}）`;
}

function countReviewPending(): number {
  if (!existsSync(REVIEW_CSV)) return 0;
  const lines = readFileSync(REVIEW_CSV, "utf8").trim().split("\n");
  return Math.max(0, lines.length - 1); // ヘッダーを除く
}

/**
 * content-log.md から当日分に書かれた記事タイトルを拾う。
 *
 * 数字の差分だけに頼ると、基準値を取った時点より前の作業が「変更なし」に
 * なってしまう。実際、基準値を今夜の作業の後に書いたせいで、記事1本の公開と
 * 楽天リンク137件が「成果なし」と報告された。記録に書かれた事実も見る。
 */
function readTodayArticles(): string[] {
  if (!existsSync(CONTENT_LOG)) return [];
  const text = readFileSync(CONTENT_LOG, "utf8");
  const today = new Date().toLocaleDateString("sv-SE");
  const start = text.indexOf(`## ${today}`);
  if (start === -1) return [];
  const rest = text.slice(start + 1);
  const end = rest.indexOf("\n## ");
  const section = end === -1 ? rest : rest.slice(0, end);
  return [...section.matchAll(/^###\s+(.+)$/gm)].map((m) => m[1].trim());
}

/** content-log.md の「次にやる予定」行を読む。無ければ null。 */
function readNextPlan(): string | null {
  if (!existsSync(CONTENT_LOG)) return null;
  const m = readFileSync(CONTENT_LOG, "utf8").match(/^次にやる予定:\s*(.+)$/m);
  return m ? m[1].trim() : null;
}

/**
 * content-log.md から保留中の記事を拾う。
 *
 * 理由は1行に収める。Slack の報告は要点だけを載せ、詳細は content-log.md を
 * 見てもらう作りなので、長文をそのまま流すと読みにくくなる。
 */
function readOnHold(): string[] {
  if (!existsSync(CONTENT_LOG)) return [];
  return [...readFileSync(CONTENT_LOG, "utf8").matchAll(/^保留:\s*(.+)$/gm)].map((m) => {
    const reason = m[1].trim();
    return reason.length > 60 ? `${reason.slice(0, 60)}…（詳細は content-log.md）` : reason;
  });
}

async function main() {
  const prisma = createPrisma();
  const products = await prisma.product.count();
  const rakutenDirect = await prisma.product.count({ where: { NOT: { rakutenUrl: null } } });
  await prisma.$disconnect();

  const guideSlugs = Object.keys(GUIDES);
  const now: Metrics = {
    at: new Date().toISOString(),
    guides: guideSlugs.length,
    guideSlugs,
    products,
    rakutenDirect,
  };
  const prev = loadPrevious();

  const newGuides = prev ? guideSlugs.filter((s) => !prev.guideSlugs.includes(s)) : [];

  const rate = products > 0 ? ((rakutenDirect / products) * 100).toFixed(0) : "0";
  const prevRate =
    prev && prev.products > 0 ? ((prev.rakutenDirect / prev.products) * 100).toFixed(0) : null;

  // すでに報告した見出しは除く。当日分を記録から拾う作りなので、
  // 除かないと同じ記事が毎回「本日の記事」に並ぶ。
  const alreadyReported = new Set(prev?.reportedArticles ?? []);
  const todayArticles = readTodayArticles().filter((t) => !alreadyReported.has(t));
  const reviewPending = countReviewPending();
  const onHold = readOnHold();
  const nextPlan = readNextPlan();

  const lines: string[] = [];
  lines.push(`*【konbu-suki 作業報告】*`);
  lines.push("");

  lines.push("*■ 成果*");
  const achievements: string[] = [];

  if (prev) {
    // 2回目以降は前回からの差分を出す
    for (const slug of newGuides.slice(0, 5)) {
      achievements.push(`・新規公開「${escapeSlack(GUIDES[slug].title)}」 ${SITE_URL}/guide/${slug}`);
    }
    if (newGuides.length > 5) achievements.push(`・ほか ${newGuides.length - 5}本`);
    if (rakutenDirect !== prev.rakutenDirect) {
      achievements.push(`・楽天の商品ページ直リンク ${rakutenDirect - prev.rakutenDirect}件を追加`);
    }
  } else {
    // 初回は比べる相手がいない。差分ではなく今の実績を出す。
    achievements.push(`・公開記事 ${now.guides}本`);
    achievements.push(`・楽天の商品ページ直リンク ${rakutenDirect}件`);
  }

  // 数字が動かなくても、記録に書かれた当日の作業は成果として出す。
  //
  // 完全一致では弾けない。記録の見出しには「（強化）」「（柱9の柱ページ）」の
  // ような補足が付くため、記事タイトルと文字列が一致しない。実際、新規公開と
  // 本日の記事の両方に同じ記事が並んだ。前方一致で見る。
  for (const title of todayArticles) {
    if (newGuides.some((slug) => title.startsWith(GUIDES[slug].title))) continue;
    achievements.push(`・本日の記事「${escapeSlack(title)}」`);
  }

  lines.push(achievements.length > 0 ? achievements.join("\n") : "・公開物の変更はなし");

  lines.push("");
  lines.push("*■ 数字（前回比）*");
  lines.push(`・公開記事 ${now.guides}本${delta(now.guides, prev?.guides)}`);
  lines.push(
    `・楽天直リンク ${rakutenDirect}/${products}件${delta(rakutenDirect, prev?.rakutenDirect)}` +
      ` 直リンク率 ${rate}%${prevRate && prevRate !== rate ? `（前回 ${prevRate}%）` : ""}`
  );

  lines.push("");
  lines.push("*■ 朝やること*");
  const todo: string[] = [];
  if (reviewPending > 0) {
    todo.push(`・楽天マッチのレビュー待ち ${reviewPending}件 → docs/review-rakuten.csv`);
  }
  for (const hold of onHold) todo.push(`・保留: ${escapeSlack(hold)}`);
  if (stopRequested()) todo.push("・.stop が置かれているため自動作業は停止中");
  lines.push(todo.length > 0 ? todo.join("\n") : "・なし");

  lines.push("");
  lines.push("*■ 次にやる予定*");
  lines.push(`・${nextPlan ? escapeSlack(nextPlan) : "docs/topic-map.md の優先度順に記事を作成"}`);

  const message = lines.join("\n");
  console.log(message);

  if (!dry) {
    // 今回報告したぶんを積み増して残す。新規公開として出した記事も、
    // 当日分として出した記事も、次回はもう報告しない。
    now.reportedArticles = [
      ...alreadyReported,
      ...newGuides.map((slug) => GUIDES[slug].title),
      ...todayArticles,
    ];
    mkdirSync(STATE_DIR, { recursive: true });
    writeFileSync(METRICS_FILE, JSON.stringify(now, null, 2));
  }
  if (!noSlack) {
    const sent = await postToSlack(message);
    console.log(`\nSlack 通知: ${sent ? "送信した" : "送信しなかった"}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
