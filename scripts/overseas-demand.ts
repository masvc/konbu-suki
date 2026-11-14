/**
 * 海外からの需要がほんとうに来ているかを測る。
 *
 * 使い方:
 *   npx tsx scripts/overseas-demand.ts          # 過去90日
 *   npx tsx scripts/overseas-demand.ts 28       # 過去28日
 *
 * 必要な環境変数 (.env):
 *   GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
 *   GA4_PROPERTY_ID=properties/XXXXXXXXX
 *   SEARCH_CONSOLE_SITE=sc-domain:konbu-suki.com
 *
 * **なぜ要るか。** GA4 の「国」をそのまま見ると海外から来ているように見えるが、
 * 中身はクローラーのことがある。2026-11-15 に初めて測ったときは
 *
 *   United States  30 users / 30 sessions / **engaged 0** / 平均3秒
 *   Japan          26 users / 34 sessions / engaged 20     / 平均155秒
 *
 * で、米国の「30人」は1人1セッション・エンゲージ0・3秒。読者ではなかった。
 * **海外向けに手を広げるかどうかは、この数字を見てから決める**（判断の材料と
 * 基準は docs/overseas.md）。
 *
 * 見るのは3つ。
 *   1. 国別の engagedSessions と平均滞在（ボットと読者を分ける）
 *   2. Search Console のクエリに非日本語（ラテン文字）がどれだけあるか
 *   3. 国別の表示回数（Search Console。検索で見られている国）
 */
import 'dotenv/config'
import { getGA4Client, getSearchConsoleClient, requireGA4PropertyId, SEARCH_CONSOLE_SITE } from './lib/google-auth'

/** 日本語の文字を含まないクエリを「非日本語」とみなす。 */
function isNonJapanese(q: string): boolean {
  return !/[぀-ヿ㐀-䶿一-鿿ｦ-ﾟ]/.test(q)
}

function dateRange(days: number) {
  const end = new Date()
  end.setDate(end.getDate() - 3) // Search Console は3日前まで
  const start = new Date(end)
  start.setDate(start.getDate() - days)
  const f = (d: Date) => d.toISOString().split('T')[0]
  return { startDate: f(start), endDate: f(end) }
}

async function ga4ByCountry(days: number) {
  const analytics = getGA4Client()
  const property = requireGA4PropertyId()
  const res = await analytics.properties.runReport({
    property,
    requestBody: {
      dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
      dimensions: [{ name: 'country' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'engagedSessions' },
        { name: 'averageSessionDuration' },
      ],
      orderBys: [{ metric: { metricName: 'activeUsers' }, desc: true }],
      limit: '15',
    },
  })

  console.log(`\n【GA4 国別（過去${days}日）】`)
  console.log('国'.padEnd(18) + 'users  sess  engaged  平均滞在   判定')
  console.log('-'.repeat(68))
  let realOverseas = 0
  for (const row of res.data.rows ?? []) {
    const country = row.dimensionValues?.[0].value ?? '(不明)'
    const v = row.metricValues ?? []
    const users = Number(v[0]?.value ?? 0)
    const sessions = Number(v[1]?.value ?? 0)
    const engaged = Number(v[2]?.value ?? 0)
    const dur = Math.round(Number(v[3]?.value ?? 0))
    // エンゲージ0かつ滞在が数秒なら、読者ではなくクローラーと見る
    const bot = engaged === 0 && dur < 10
    if (!bot && country !== 'Japan') realOverseas += engaged
    console.log(
      country.padEnd(18) +
        String(users).padStart(5) +
        String(sessions).padStart(6) +
        String(engaged).padStart(9) +
        (dur + 's').padStart(9) +
        '   ' +
        (country === 'Japan' ? '—' : bot ? 'クローラーの可能性' : '読者かもしれない')
    )
  }
  console.log(`\n  → 日本以外で「読者かもしれない」エンゲージ合計: ${realOverseas}`)
  return realOverseas
}

async function searchConsoleQueries(days: number) {
  const search = getSearchConsoleClient()
  const { startDate, endDate } = dateRange(days)
  const res = await search.searchanalytics.query({
    siteUrl: SEARCH_CONSOLE_SITE,
    requestBody: { startDate, endDate, dimensions: ['query'], rowLimit: 500 },
  })
  const rows = res.data.rows ?? []
  const nonJa = rows.filter((r) => isNonJapanese(String(r.keys?.[0] ?? '')))
  const imp = (rs: typeof rows) => rs.reduce((a, r) => a + (r.impressions ?? 0), 0)

  console.log(`\n【Search Console 非日本語クエリ（${startDate}〜${endDate}）】`)
  console.log(`  全クエリ: ${rows.length}件 / 表示 ${imp(rows)}`)
  console.log(`  非日本語: ${nonJa.length}件 / 表示 ${imp(nonJa)}`)
  if (nonJa.length) {
    console.log('  上位:')
    for (const r of nonJa.slice(0, 15)) {
      console.log(`    ${String(r.keys?.[0]).padEnd(40)} imp ${r.impressions} / click ${r.clicks} / 順位 ${r.position?.toFixed(1)}`)
    }
  } else {
    console.log('  → 非日本語のクエリは無い')
  }
  return imp(nonJa)
}

async function searchConsoleCountries(days: number) {
  const search = getSearchConsoleClient()
  const { startDate, endDate } = dateRange(days)
  const res = await search.searchanalytics.query({
    siteUrl: SEARCH_CONSOLE_SITE,
    requestBody: { startDate, endDate, dimensions: ['country'], rowLimit: 15 },
  })
  console.log(`\n【Search Console 国別（${startDate}〜${endDate}）】`)
  for (const r of res.data.rows ?? []) {
    console.log(`  ${String(r.keys?.[0]).padEnd(6)} imp ${r.impressions} / click ${r.clicks}`)
  }
}

async function main() {
  const days = /^\d+$/.test(process.argv[2] ?? '') ? parseInt(process.argv[2]) : 90
  console.log('='.repeat(68))
  console.log(`海外からの需要（過去${days}日）`)
  console.log('='.repeat(68))

  const engaged = await ga4ByCountry(days)
  const nonJaImp = await searchConsoleQueries(days)
  await searchConsoleCountries(days)

  console.log('\n' + '='.repeat(68))
  console.log('【判断】docs/overseas.md の基準で見る')
  console.log(`  日本以外のエンゲージセッション: ${engaged}`)
  console.log(`  非日本語クエリの表示回数:       ${nonJaImp}`)
  if (engaged >= 50 || nonJaImp >= 200) {
    console.log('  → 基準を超えた。docs/overseas.md の「次にやること」を読む')
  } else {
    console.log('  → まだ基準に届かない。日本語の記事と導線に集中する')
  }
  console.log('='.repeat(68))
}

main().catch((e) => {
  console.error('取得に失敗:', String(e).slice(0, 300))
  process.exit(1)
})
