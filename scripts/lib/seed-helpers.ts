/**
 * seedスクリプト共通ヘルパー
 *
 * ShaftData型、Prismaクライアント初期化、upsert処理を一元化。
 * 各seedスクリプトはデータ定義だけに集中する。
 *
 * Usage:
 *   import { prisma, seedShafts, runSeed, expandSeries, type ShaftData, type Series, type Variant } from "./lib/seed-helpers";
 */
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import "dotenv/config";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
export const prisma = new PrismaClient({ adapter });

/** シリーズ内のバリアント（重量帯ごとのフレックス展開） */
export type Variant = {
  suffix: string; // "50", "60" etc. 空文字ならsuffixなし
  flexes: { flex: string; weight: number; torque: number | null }[];
};

/** シリーズ定義（expandSeriesで個別ShaftDataに展開する） */
export type Series = {
  prefix: string; // "Speeder NX Green"
  maker: string;
  kickPoint: string;
  launch: string | null;
  feel: string | null;
  category: string;
  releaseYear: number | null;
  variants: Variant[];
};

/**
 * シリーズ定義から個別シャフトデータを展開する
 *
 * name生成ルール: `${prefix}[ ${suffix}] ${flex}`
 * suffixが空文字の場合はスペースを挟まない。
 */
export function expandSeries(s: Series): ShaftData[] {
  const out: ShaftData[] = [];
  for (const v of s.variants) {
    for (const f of v.flexes) {
      const suffix = v.suffix ? ` ${v.suffix}` : "";
      out.push({
        name: `${s.prefix}${suffix} ${f.flex}`,
        maker: s.maker,
        weight: f.weight,
        flex: f.flex,
        torque: f.torque,
        kickPoint: s.kickPoint,
        launch: s.launch,
        feel: s.feel,
        category: s.category,
        isDiscontinued: false,
        releaseYear: s.releaseYear,
      });
    }
  }
  return out;
}

/** シャフトデータの型定義（全seedスクリプト共通） */
export type ShaftData = {
  name: string;
  maker: string;
  weight: number;
  flex: string;
  torque: number | null;
  kickPoint: string;
  category: string;
  /** 説明文（任意） */
  description?: string | null;
  isDiscontinued: boolean;
  releaseYear: number | null;
  /** 弾道（任意。省略時はkickPointから自動導出） */
  launch?: string | null;
  /** 打感（任意） */
  feel?: string | null;
};

/**
 * シャフトデータを一括登録する（既存はスキップ）
 * @param label - ログ表示用のラベル（例: "2026年新モデル"）
 * @returns { created, skipped } の件数
 */
export async function seedShafts(
  shafts: ShaftData[],
  label?: string,
): Promise<{ created: number; skipped: number }> {
  if (label) {
    console.log(`\n🏌️ ${label}: ${shafts.length}本\n`);
  }

  let created = 0;
  let skipped = 0;

  for (const s of shafts) {
    const exists = await prisma.shaft.findFirst({
      where: { name: s.name },
    });
    if (exists) {
      skipped++;
      continue;
    }
    await prisma.shaft.create({ data: s });
    created++;
    process.stdout.write(".");
  }

  console.log(`\n✅ 完了: ${created}本追加 / ${skipped}本スキップ（既存）`);
  return { created, skipped };
}

/**
 * seedスクリプトのエントリポイントラッパー
 * Prisma接続のcleanupとエラーハンドリングを共通化
 */
export async function runSeed(fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}
