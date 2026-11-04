/**
 * Google Search Console レポート取得スクリプト
 *
 * 使い方:
 *   npx tsx scripts/search-console.ts              # 過去28日（自サイトのみ）
 *   npx tsx scripts/search-console.ts 7            # 過去7日
 *   npx tsx scripts/search-console.ts queries      # クエリ別
 *   npx tsx scripts/search-console.ts pages        # ページ別
 *   npx tsx scripts/search-console.ts all          # 全レポート
 *   npx tsx scripts/search-console.ts --all-sites  # プロパティ全体（フィルタなし）
 *
 * 必要な環境変数 (.env):
 *   GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
 *   SEARCH_CONSOLE_SITE=sc-domain:example.com  （未設定なら自サイトのドメイン）
 */

import 'dotenv/config'
import { getSearchConsoleClient, SEARCH_CONSOLE_SITE } from './lib/google-auth'
import { PUBLIC_SITE_URL, PUBLIC_SITE_HOST, toSitePath } from './lib/site'

function getDateRange(daysArg?: string): { startDate: string; endDate: string } {
  const days = daysArg && /^\d+$/.test(daysArg) ? parseInt(daysArg) : 28
  const end = new Date()
  end.setDate(end.getDate() - 3) // Search Console は3日前までのデータ
  const start = new Date(end)
  start.setDate(start.getDate() - days)
  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
  }
}

async function queryReport(
  searchconsole: ReturnType<typeof getSearchConsoleClient>,
  startDate: string,
  endDate: string,
  dimensions: string[],
  rowLimit = 30,
  dimensionFilterGroups?: Array<{ filters: Array<{ dimension: string; operator: string; expression: string }> }>
) {
  const res = await searchconsole.searchanalytics.query({
    siteUrl: SEARCH_CONSOLE_SITE,
    requestBody: {
      startDate,
      endDate,
      dimensions,
      rowLimit,
      type: 'web',
      ...(dimensionFilterGroups ? { dimensionFilterGroups } : {}),
    },
  })
  return res.data.rows || []
}

async function run() {
  const searchconsole = getSearchConsoleClient()

  const args = process.argv.slice(2)
  const daysArg = args.find(a => /^\d+$/.test(a))
  const mode = args.find(a => ['queries', 'pages', 'all', 'devices', 'countries'].includes(a)) || 'all'
  const allSites = args.includes('--all-sites')
  const { startDate, endDate } = getDateRange(daysArg)

  // デフォルトは自サイトのみ、--all-sites でフィルタなし。
  // 正規表現は GSC 固有の指定なので、組み立てはここに置く（site.ts は
  // 「自サイトの URL とは何か」だけを持つ）。
  const siteUrlRegex = `^${PUBLIC_SITE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/`

  const urlFilter = allSites
    ? undefined
    : { dimension: 'page' as const, operator: 'includingRegex' as const, expression: siteUrlRegex }

  const filterLabel = allSites ? 'プロパティ全体' : `${PUBLIC_SITE_HOST} のみ`
  console.log(`\n🔍 Search Console レポート (${startDate} ~ ${endDate})`)
  console.log(`   サイト: ${SEARCH_CONSOLE_SITE}  [${filterLabel}]`)
  console.log('='.repeat(70))

  // フィルタグループ（自サイト絞り込み用）
  const filterGroups = urlFilter ? [{ filters: [urlFilter] }] : undefined

  // サマリー（ディメンションなし）
  const summaryRes = await searchconsole.searchanalytics.query({
    siteUrl: SEARCH_CONSOLE_SITE,
    requestBody: {
      startDate,
      endDate,
      type: 'web',
      ...(filterGroups ? { dimensionFilterGroups: filterGroups } : {}),
    },
  })
  const summaryRows = summaryRes.data.rows || []
  if (summaryRows.length > 0) {
    const s = summaryRows[0]
    console.log('\n【サマリー】')
    console.log(`  クリック数:    ${s.clicks}`)
    console.log(`  表示回数:      ${s.impressions}`)
    console.log(`  平均CTR:       ${((s.ctr || 0) * 100).toFixed(1)}%`)
    console.log(`  平均掲載順位:  ${(s.position || 0).toFixed(1)}`)
  }

  // クエリ別
  if (mode === 'queries' || mode === 'all') {
    const rows = await queryReport(searchconsole, startDate, endDate, ['query'], 50, filterGroups)
    console.log('\n【検索クエリ Top50】')
    console.log(`${'クエリ'.padEnd(45)} ${'Click'.padStart(6)} ${'Imp'.padStart(7)} ${'CTR'.padStart(6)} ${'順位'.padStart(5)}`)
    console.log('-'.repeat(75))
    for (const row of rows) {
      const query = (row.keys?.[0] || '').slice(0, 44)
      console.log(
        `${query.padEnd(45)} ${String(row.clicks).padStart(6)} ${String(row.impressions).padStart(7)} ${((row.ctr || 0) * 100).toFixed(1).padStart(5)}% ${(row.position || 0).toFixed(1).padStart(5)}`
      )
    }
  }

  // ページ別
  if (mode === 'pages' || mode === 'all') {
    const rows = await queryReport(searchconsole, startDate, endDate, ['page'], 30, filterGroups)
    console.log('\n【ページ別 Top30】')
    console.log(`${'URL'.padEnd(55)} ${'Click'.padStart(6)} ${'Imp'.padStart(7)} ${'CTR'.padStart(6)} ${'順位'.padStart(5)}`)
    console.log('-'.repeat(85))
    for (const row of rows) {
      const url = toSitePath(row.keys?.[0] || '')
      console.log(
        `${url.slice(0, 54).padEnd(55)} ${String(row.clicks).padStart(6)} ${String(row.impressions).padStart(7)} ${((row.ctr || 0) * 100).toFixed(1).padStart(5)}% ${(row.position || 0).toFixed(1).padStart(5)}`
      )
    }
  }

  // デバイス別
  if (mode === 'devices' || mode === 'all') {
    const rows = await queryReport(searchconsole, startDate, endDate, ['device'], 30, filterGroups)
    console.log('\n【デバイス別】')
    console.log(`${'デバイス'.padEnd(15)} ${'Click'.padStart(6)} ${'Imp'.padStart(7)} ${'CTR'.padStart(6)} ${'順位'.padStart(5)}`)
    console.log('-'.repeat(45))
    for (const row of rows) {
      console.log(
        `${(row.keys?.[0] || '').padEnd(15)} ${String(row.clicks).padStart(6)} ${String(row.impressions).padStart(7)} ${((row.ctr || 0) * 100).toFixed(1).padStart(5)}% ${(row.position || 0).toFixed(1).padStart(5)}`
      )
    }
  }

  // 国別
  if (mode === 'countries' || mode === 'all') {
    const rows = await queryReport(searchconsole, startDate, endDate, ['country'], 10, filterGroups)
    console.log('\n【国別 Top10】')
    console.log(`${'国'.padEnd(10)} ${'Click'.padStart(6)} ${'Imp'.padStart(7)} ${'CTR'.padStart(6)} ${'順位'.padStart(5)}`)
    console.log('-'.repeat(40))
    for (const row of rows) {
      console.log(
        `${(row.keys?.[0] || '').padEnd(10)} ${String(row.clicks).padStart(6)} ${String(row.impressions).padStart(7)} ${((row.ctr || 0) * 100).toFixed(1).padStart(5)}% ${(row.position || 0).toFixed(1).padStart(5)}`
      )
    }
  }

  console.log('\n')
}

run().catch(console.error)
