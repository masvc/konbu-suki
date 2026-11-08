/**
 * 記事をまたいで事実の食い違いを探す。
 *
 * Usage:
 *   npx tsx scripts/fact-audit.ts            # 検査する
 *   npx tsx scripts/fact-audit.ts --json     # 機械で読む形で出す
 *
 * 同じことを書いた記事どうしで数字が違う、という壊れ方が繰り返し起きている。
 * 実際に見つかったもの:
 *   - 北海道産の割合が「約90%」と「約95%」（kombu-types / kombu-production）
 *   - だしの日持ちが「3日」と「1週間」（how-to-make-dashi / kombu-water）
 *   - 成分表の値が旧版のまま（kombu-nutrition）
 *   - 摂取基準の版が「2020年版」と「2025年版」で混在
 *
 * どれも1記事だけ読んでいると気付けない。記事が増えるほど確率が上がるので、
 * 人が覚えておく話にせず機械で見る。
 *
 * ルールの足し方は RULES のコメントを参照。新しい事実を記事に書いたら、
 * 同じ事実を別の記事でも書くことになった時点でルールを足す。
 */
import { GUIDES } from "../src/lib/guides";
import { guideText } from "./lib/guide-text";
import { checkContextWords } from "./lib/content-rules";

type Rule = {
  id: string;
  label: string;
  /** 本文から値を取り出す。1つ目のキャプチャが比べる値になる。 */
  pattern: RegExp;
  /** 取り出した値をそろえる（カンマを外す等） */
  normalize?: (v: string) => string;
};

/**
 * 比べる事実。
 *
 * 全文から数値を機械的に拾って比べる形にはしていない。関係のない数字どうしが
 * 当たって誤検知だらけになり、見なくなるため。「複数の記事に書くことになった事実」
 * だけをここに並べる。
 */
const RULES: Rule[] = [
  {
    id: "hokkaido-share",
    label: "日本の昆布に占める北海道産の割合",
    // 「北海道産天然昆布100%」のような商品の配合を拾わないよう、
    // 全国に占める割合を言っている文脈に限る。誤検知が混ざると検査を見なくなる。
    pattern:
      /(?:日本|全国|国内)[^。]{0,30}?(\d{1,3})\s*[%％][^。]{0,15}?北海道|北海道[^。]{0,25}?(?:日本|全国|国内)[^。]{0,20}?(\d{1,3})\s*[%％]|(?:生産量|流通量)[^。]{0,20}?(\d{1,3})\s*[%％][^。]{0,15}?北海道/,
  },
  {
    id: "dashi-ratio",
    label: "だしの分量（水1リットルあたりの昆布）",
    pattern: /水\s*1\s*リットルに(?:昆布)?\s*(\d{1,3})\s*g/,
  },
  {
    id: "iodine-ul-adult",
    label: "ヨウ素の耐容上限量（成人）",
    pattern: /耐容上限量[^。]{0,60}?成人[^。]{0,20}?([\d,]{3,6})\s*(?:μg|µg)|成人（男女）[^|]*\|\s*([\d,]{3,6})/,
    normalize: (v) => v.replace(/,/g, ""),
  },
  {
    id: "shokuji-kijun-edition",
    label: "日本人の食事摂取基準の版",
    pattern: /日本人の食事摂取基準[（(](\d{4})年版[)）]/,
  },
  {
    id: "seibunhyo-edition",
    label: "日本食品標準成分表の版",
    // 「（八訂）増補2023年」と「八訂増補2023年」は同じものを指す。括弧の有無で
    // 別物と判定すると、表記ゆれを食い違いとして出してしまう。
    pattern: /日本食品標準成分表[^。]{0,20}?((?:八訂|七訂)[）)]?\s*(?:増補\s*\d{4}\s*年)?)/,
    normalize: (v) => v.replace(/[（）()\s]/g, ""),
  },
  {
    id: "makombu-kcal",
    label: "まこんぶ（素干し）100gあたりのエネルギー",
    pattern: /まこんぶ[^。]{0,30}?100\s*gあたり\s*(\d{2,4})\s*kcal|100gあたり\s*(\d{2,4})\s*kcal[^。]{0,20}?まこんぶ/,
  },
];

type Finding = { level: "error" | "warn"; message: string };
const findings: Finding[] = [];
const add = (level: Finding["level"], message: string) => findings.push({ level, message });

function auditNumbers() {
  for (const rule of RULES) {
    // 値 → その値を書いている記事
    const byValue = new Map<string, string[]>();
    for (const slug of Object.keys(GUIDES)) {
      const text = guideText(slug);
      const re = new RegExp(rule.pattern.source, "g" + rule.pattern.flags.replace("g", ""));
      let m: RegExpExecArray | null;
      const seen = new Set<string>();
      while ((m = re.exec(text)) !== null) {
        const raw = m.slice(1).find((x) => x !== undefined);
        if (!raw) continue;
        const value = rule.normalize ? rule.normalize(raw) : raw;
        if (seen.has(value)) continue;
        seen.add(value);
        byValue.set(value, [...(byValue.get(value) ?? []), slug]);
      }
      if (seen.size > 1) {
        add(
          "error",
          `${rule.label}: ${slug} の中だけで値が割れている（${[...seen].join(" / ")}）`
        );
      }
    }
    if (byValue.size > 1) {
      const detail = [...byValue.entries()]
        .map(([v, slugs]) => `${v}（${slugs.join(", ")}）`)
        .join(" ／ ");
      add("error", `${rule.label}: 記事によって値が違う — ${detail}`);
    }
  }
}

function auditSources() {
  for (const slug of Object.keys(GUIDES)) {
    const text = guideText(slug);
    const hasSource = /出典[:：]/.test(text) || /https?:\/\//.test(text);
    if (!hasSource) add("error", `guide/${slug}: 出典の記載が1つも無い`);
  }
}

/**
 * 古い版を引いていないか。
 *
 * 最新版が出たらここを書き換える。書き換えた時点で、古い版を引いている記事が
 * 全部出る。
 */
const LATEST = {
  shokujiKijun: "2025",
  seibunhyo: "八訂増補2023年",
};

function auditEditions() {
  for (const slug of Object.keys(GUIDES)) {
    const text = guideText(slug);
    for (const m of text.matchAll(/日本人の食事摂取基準[（(](\d{4})年版[)）]/g)) {
      if (m[1] !== LATEST.shokujiKijun) {
        add("error", `guide/${slug}: 食事摂取基準を${m[1]}年版で引いている（最新は${LATEST.shokujiKijun}年版）`);
      }
    }
    for (const m of text.matchAll(/日本食品標準成分表[^。]{0,20}?(八訂|七訂)/g)) {
      const around = text.slice(m.index ?? 0, (m.index ?? 0) + 60);
      if (m[1] === "七訂") {
        add("error", `guide/${slug}: 成分表を七訂で引いている（最新は${LATEST.seibunhyo}）`);
      } else if (!/増補\s*2023\s*年/.test(around)) {
        add("warn", `guide/${slug}: 成分表の版が「八訂」止まりで増補年が無い（最新は${LATEST.seibunhyo}）`);
      }
    }
  }
}

/**
 * 文脈に依存する言い回し。
 *
 * AI検索は記事の一部だけを抜き出して引用する。「上記のとおり」「下の表」は、
 * 抜き出された側だけ読むと何を指しているのか分からない。前を指すもの
 * （上記・前述・上の表）は特に意味が通らなくなるので error、後ろを指すものは warn。
 */
function auditContextWords() {
  const BACKWARD = ["上記", "前述", "上の表", "上の図", "先ほど"];
  for (const slug of Object.keys(GUIDES)) {
    for (const found of checkContextWords(guideText(slug))) {
      const backward = BACKWARD.some((w) => found.startsWith(w));
      add(backward ? "error" : "warn", `guide/${slug}: 文脈に頼った言い回し ${found}`);
    }
  }
}

function main() {
  auditNumbers();
  auditSources();
  auditEditions();
  auditContextWords();

  const errors = findings.filter((f) => f.level === "error");
  const warns = findings.filter((f) => f.level === "warn");

  if (process.argv.includes("--json")) {
    console.log(JSON.stringify({ errors, warns }, null, 2));
  } else {
    console.log(`\n記事をまたいだ事実の監査（${Object.keys(GUIDES).length}記事）`);
    console.log("=".repeat(70));
    if (errors.length > 0) {
      console.log(`\n--- 要修正 (${errors.length}件) ---`);
      for (const f of errors) console.log(`  [!!] ${f.message}`);
    }
    if (warns.length > 0) {
      console.log(`\n--- 改善推奨 (${warns.length}件) ---`);
      for (const f of warns) console.log(`  [ ?] ${f.message}`);
    }
    if (findings.length === 0) console.log("\n  食い違いなし。\n");
    console.log("");
  }
  console.log(`SUMMARY: 要修正 ${errors.length} / 改善推奨 ${warns.length}`);
  process.exit(errors.length > 0 ? 1 : 0);
}

main();
