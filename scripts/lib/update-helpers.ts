/**
 * メーカー別 update スクリプトの共通ヘルパー
 *
 * 使い方: scripts/update-{maker}.ts からインポートして使う
 */
import { prisma } from "../../src/lib/prisma";

export type ShaftUpdate = {
  id: number;
  name: string;
  flex: string;
  field: string;
  before: string | number | boolean;
  after: string | number | boolean;
};

export type ShaftInsert = {
  name: string;
  maker: string;
  flex: string;
  weight: number;
  torque: number;
  kickPoint: string;
  category: string;
  isDiscontinued: boolean;
  description: string;
};

/** dry-run レポートを出力 */
export function printDryRunReport(updates: ShaftUpdate[], inserts: ShaftInsert[]): void {
  console.log(`\n=== DRY-RUN REPORT ===\n`);

  if (updates.length > 0) {
    // Group by field
    const byField = new Map<string, ShaftUpdate[]>();
    for (const u of updates) {
      if (!byField.has(u.field)) byField.set(u.field, []);
      byField.get(u.field)!.push(u);
    }

    console.log(`UPDATES (${updates.length}):`);
    for (const [field, ups] of byField) {
      console.log(`\n  ${field} (${ups.length}):`);
      for (const u of ups.slice(0, 15)) {
        console.log(`    ${u.name} [${u.flex}]: ${u.before} → ${u.after}`);
      }
      if (ups.length > 15) console.log(`    ... and ${ups.length - 15} more`);
    }
  } else {
    console.log(`UPDATES (0):`);
  }

  if (inserts.length > 0) {
    console.log(`\nINSERTS (${inserts.length}):`);
    for (const i of inserts.slice(0, 20)) {
      console.log(`  ${i.name} [${i.flex}]: ${i.weight}g t=${i.torque} kp=${i.kickPoint} cat=${i.category}`);
    }
    if (inserts.length > 20) console.log(`  ... and ${inserts.length - 20} more`);
  } else {
    console.log(`\nINSERTS (0):`);
  }
}

/** $transaction でまとめて適用 */
export async function applyUpdates(
  updates: ShaftUpdate[],
  inserts: ShaftInsert[],
  opts: { timeout?: number } = {},
): Promise<void> {
  const timeout = opts.timeout ?? 30000;
  console.log(`\nApplying ${updates.length} updates and ${inserts.length} inserts (in transaction)...`);

  if (updates.length === 0 && inserts.length === 0) {
    console.log("No changes to apply.");
    return;
  }

  await prisma.$transaction(async (tx) => {
    for (const u of updates) {
      const data: Record<string, unknown> = {};
      data[u.field] = u.after;
      await tx.shaft.update({ where: { id: u.id }, data });
    }

    for (const i of inserts) {
      await tx.shaft.create({ data: i });
    }
  }, { timeout });

  // DB 変更後に Vercel デプロイを自動トリガー（proxy の slug JSON を再生成するため）
  await triggerDeploy();
}

/** maker のシャフト数をカウントして表示 */
export async function printMakerCount(maker: string): Promise<void> {
  const total = await prisma.shaft.count({ where: { maker } });
  const allTotal = await prisma.shaft.count();
  console.log(`Done. ${maker}: ${total} shafts. All: ${allTotal}.`);
}

/** DB に既に存在するエントリを除外（重複 INSERT 防止） */
export async function filterDuplicateInserts(inserts: ShaftInsert[]): Promise<ShaftInsert[]> {
  const result: ShaftInsert[] = [];
  for (const i of inserts) {
    const existing = await prisma.shaft.findFirst({
      where: { maker: i.maker, name: i.name, flex: i.flex },
    });
    if (existing) {
      console.log(`SKIP (already exists): ${i.name} [${i.flex}]`);
    } else {
      result.push(i);
    }
  }
  return result;
}

/** --apply フラグの確認 */
export function isApplyMode(): boolean {
  return process.argv.includes("--apply");
}

/**
 * Vercel Deploy Hook を叩いてデプロイを開始する
 * DB で名前を変えると proxy（ビルド時 JSON）と page（DB）の slug がズレるため、
 * apply 後に自動でデプロイして JSON を再生成する。
 * .env の VERCEL_DEPLOY_HOOK_URL が未設定なら何もしない。
 */
export async function triggerDeploy(): Promise<void> {
  const url = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!url) {
    console.log("\n⚠ VERCEL_DEPLOY_HOOK_URL が未設定。手動でデプロイしてください。");
    return;
  }
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      console.log(`\nVercel Deploy Hook を叩いています...${attempt > 1 ? ` (リトライ ${attempt}/2)` : ""}`);
      const res = await fetch(url, { method: "POST", signal: AbortSignal.timeout(30000) });
      if (res.ok) {
        console.log("✅ デプロイを開始しました。");
        return;
      }
      console.log(`❌ Deploy Hook エラー: ${res.status} ${res.statusText}`);
    } catch (e) {
      console.log(`❌ Deploy Hook タイムアウト/接続エラー: ${e instanceof Error ? e.message : e}`);
    }
    if (attempt < 2) continue;
    console.log("⚠ 手動でデプロイしてください: npx tsx scripts/trigger-deploy.ts");
  }
}
