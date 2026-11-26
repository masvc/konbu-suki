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
 *   npx tsx scripts/search-console.ts queries --page /guide/kombu-water  # 1ページのクエリ内訳
 *
 *   npx tsx scripts/search-console.ts 28 pages --compare  # 同じ長さの直前の期間と並べる
 *
 * --page は表示・順位が動いたページで「どのクエリが増えた・落ちたか」を見るためのもの。
 * --compare と組み合わせられる（例: queries --page /guide/shiokombu-guide 7 --compare）。
 * --compare の列: 前Imp（前期間の表示）・Imp差・Clk差・前順位・順位差（マイナスが改善）。
 * 前期間に無かった行は「新」。前期間にだけある行は出さない。
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

/** 同じ長さの直前の期間（今期の開始日の前日で終わる） */
function getPreviousRange(startDate: string, endDate: string): { startDate: string; endDate: string } {
  const start = new Date(`${startDate}T00:00:00Z`)
  const end = new Date(`${endDate}T00:00:00Z`)
  const span = Math.round((end.getTime() - start.getTime()) / 86400000)
  const prevEnd = new Date(start)
  prevEnd.setUTCDate(prevEnd.getUTCDate() - 1)
  const prevStart = new Date(prevEnd)
  prevStart.setUTCDate(prevStart.getUTCDate() - span)
  return {
    startDate: prevStart.toISOString().split('T')[0],
    endDate: prevEnd.toISOString().split('T')[0],
  }
}

type GscRow = { keys?: string[] | null; clicks?: number | null; impressions?: number | null; position?: number | null }

function signed(n: number, digits = 0): string {
  const s = n.toFixed(digits)
  return n > 0 ? `+${s}` : s
}

/** 前期間の列（表示・クリック・順位とその差）。前期間に無い行は「新」 */
function compareCols(row: GscRow, prev: GscRow | undefined): string {
  if (!prev) return `${'新'.padStart(7)} ${''.padStart(7)} ${''.padStart(6)} ${''.padStart(6)} ${''.padStart(6)}`
  const imp = row.impressions || 0
  const pImp = prev.impressions || 0
  const clk = row.clicks || 0
  const pClk = prev.clicks || 0
  const pos = row.position || 0
  const pPos = prev.position || 0
  // 順位はマイナスが改善（数字が小さくなった）
  return `${String(pImp).padStart(7)} ${signed(imp - pImp).padStart(7)} ${signed(clk - pClk).padStart(6)} ${pPos.toFixed(1).padStart(6)} ${signed(pos - pPos, 1).padStart(6)}`
}

const COMPARE_HEADER = ` ${'前Imp'.padStart(6)} ${'Imp差'.padStart(6)} ${'Clk差'.padStart(5)} ${'前順位'.padStart(4)} ${'順位差'.padStart(4)}`

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
  const pageIdx = args.indexOf('--page')
  const pagePath = pageIdx >= 0 ? args[pageIdx + 1] : undefined
  if (pageIdx >= 0 && !pagePath?.startsWith('/')) {
    console.error('--page には / で始まるパスを渡す（例: --page /guide/kombu-water）')
    process.exit(1)
  }
  const { startDate, endDate } = getDateRange(daysArg)
  const compare = args.includes('--compare')
  const prevRange = compare ? getPreviousRange(startDate, endDate) : undefined

  // デフォルトは自サイトのみ、--all-sites でフィルタなし。
  // 正規表現は GSC 固有の指定なので、組み立てはここに置く（site.ts は
  // 「自サイトの URL とは何か」だけを持つ）。
  const siteUrlRegex = `^${PUBLIC_SITE_URL.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/`

  const urlFilter = pagePath
    ? { dimension: 'page' as const, operator: 'equals' as const, expression: `${PUBLIC_SITE_URL}${pagePath}` }
    : allSites
      ? undefined
      : { dimension: 'page' as const, operator: 'includingRegex' as const, expression: siteUrlRegex }

  const filterLabel = pagePath ? `${pagePath} のみ` : allSites ? 'プロパティ全体' : `${PUBLIC_SITE_HOST} のみ`
  console.log(`\n🔍 Search Console レポート (${startDate} ~ ${endDate})`)
  console.log(`   サイト: ${SEARCH_CONSOLE_SITE}  [${filterLabel}]`)
  if (prevRange) console.log(`   前期間: ${prevRange.startDate} ~ ${prevRange.endDate}（同じ長さの直前）`)
  console.log('='.repeat(70))

  // フィルタグループ（自サイト絞り込み用）
  const filterGroups = urlFilter ? [{ filters: [urlFilter] }] : undefined

  // サマリー（ディメンションなし）
  const summaryOf = async (range: { startDate: string; endDate: string }) => {
    const res = await searchconsole.searchanalytics.query({
      siteUrl: SEARCH_CONSOLE_SITE,
      requestBody: {
        startDate: range.startDate,
        endDate: range.endDate,
        type: 'web',
        ...(filterGroups ? { dimensionFilterGroups: filterGroups } : {}),
      },
    })
    return (res.data.rows || [])[0]
  }
  const s = await summaryOf({ startDate, endDate })
  const ps = prevRange ? await summaryOf(prevRange) : undefined
  if (s || ps) {
    const clk = s?.clicks || 0
    const imp = s?.impressions || 0
    const pos = s?.position || 0
    const prevNote = (cur: string, prev: string) => (prevRange ? `${cur}  （前期間 ${prev}）` : cur)
    console.log('\n【サマリー】')
    console.log(`  クリック数:    ${prevNote(String(clk), `${ps?.clicks || 0}・差 ${signed(clk - (ps?.clicks || 0))}`)}`)
    console.log(`  表示回数:      ${prevNote(String(imp), `${ps?.impressions || 0}・差 ${signed(imp - (ps?.impressions || 0))}`)}`)
    console.log(`  平均CTR:       ${prevNote(`${((s?.ctr || 0) * 100).toFixed(1)}%`, `${((ps?.ctr || 0) * 100).toFixed(1)}%`)}`)
    console.log(`  平均掲載順位:  ${prevNote(pos.toFixed(1), ps ? `${(ps.position || 0).toFixed(1)}・差 ${signed(pos - (ps.position || 0), 1)}` : 'なし')}`)
  }

  // 前期間の行をキーで引けるようにする。上位に入らなかった行も突き合わせたいので多めに取る
  const prevMap = async (dimensions: string[]) => {
    if (!prevRange) return undefined
    const rows = await queryReport(searchconsole, prevRange.startDate, prevRange.endDate, dimensions, 1000, filterGroups)
    return new Map(rows.map(r => [r.keys?.[0] || '', r]))
  }

  // クエリ別
  if (mode === 'queries' || mode === 'all') {
    const rows = await queryReport(searchconsole, startDate, endDate, ['query'], 50, filterGroups)
    const prev = await prevMap(['query'])
    console.log('\n【検索クエリ Top50】')
    console.log(`${'クエリ'.padEnd(45)} ${'Click'.padStart(6)} ${'Imp'.padStart(7)} ${'CTR'.padStart(6)} ${'順位'.padStart(5)}${prev ? COMPARE_HEADER : ''}`)
    console.log('-'.repeat(prev ? 115 : 75))
    for (const row of rows) {
      const key = row.keys?.[0] || ''
      const query = key.slice(0, 44)
      console.log(
        `${query.padEnd(45)} ${String(row.clicks).padStart(6)} ${String(row.impressions).padStart(7)} ${((row.ctr || 0) * 100).toFixed(1).padStart(5)}% ${(row.position || 0).toFixed(1).padStart(5)}${prev ? ` ${compareCols(row, prev.get(key))}` : ''}`
      )
    }
  }

  // ページ別
  if (mode === 'pages' || mode === 'all') {
    const rows = await queryReport(searchconsole, startDate, endDate, ['page'], 30, filterGroups)
    const prev = await prevMap(['page'])
    console.log('\n【ページ別 Top30】')
    console.log(`${'URL'.padEnd(55)} ${'Click'.padStart(6)} ${'Imp'.padStart(7)} ${'CTR'.padStart(6)} ${'順位'.padStart(5)}${prev ? COMPARE_HEADER : ''}`)
    console.log('-'.repeat(prev ? 125 : 85))
    for (const row of rows) {
      const key = row.keys?.[0] || ''
      const url = toSitePath(key)
      console.log(
        `${url.slice(0, 54).padEnd(55)} ${String(row.clicks).padStart(6)} ${String(row.impressions).padStart(7)} ${((row.ctr || 0) * 100).toFixed(1).padStart(5)}% ${(row.position || 0).toFixed(1).padStart(5)}${prev ? ` ${compareCols(row, prev.get(key))}` : ''}`
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
