/**
 * GA4 Data API レポート取得スクリプト
 *
 * 使い方:
 *   npx tsx scripts/ga4-report.ts                  # 過去28日
 *   npx tsx scripts/ga4-report.ts 7                # 過去7日
 *   npx tsx scripts/ga4-report.ts 2025-04-01 2025-04-30  # 期間指定
 *
 * 必要な環境変数 (.env):
 *   GOOGLE_APPLICATION_CREDENTIALS=./google-credentials.json
 *   GA4_PROPERTY_ID=properties/XXXXXXXXX
 */

import 'dotenv/config'
import { getGA4Client, requireGA4PropertyId } from './lib/google-auth'
import { parseDateArgs } from './lib/analytics-constants'

const PROPERTY_ID = requireGA4PropertyId()

async function runReport() {
  const analyticsData = getGA4Client()
  const { startDate, endDate } = parseDateArgs()

  console.log(`\n📊 GA4 レポート (${startDate} ~ ${endDate})`)
  console.log('='.repeat(70))

  // 1. サマリー
  const summary = await analyticsData.properties.runReport({
    property: PROPERTY_ID,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
        { name: 'engagedSessions' },
      ],
    },
  })

  const row = summary.data.rows?.[0]?.metricValues
  if (row) {
    console.log('\n【サマリー】')
    console.log(`  アクティブユーザー: ${row[0].value}`)
    console.log(`  セッション数:      ${row[1].value}`)
    console.log(`  PV数:              ${row[2].value}`)
    console.log(`  平均セッション時間: ${Math.round(Number(row[3].value))}秒`)
    console.log(`  直帰率:            ${(Number(row[4].value) * 100).toFixed(1)}%`)
    console.log(`  エンゲージセッション: ${row[5].value}`)
  }

  // 2. ページ別レポート
  const pages = await analyticsData.properties.runReport({
    property: PROPERTY_ID,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'activeUsers' },
        { name: 'averageSessionDuration' },
        { name: 'bounceRate' },
      ],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit: '30',
    },
  })

  console.log('\n【ページ別 Top30】')
  console.log(`${'パス'.padEnd(50)} ${'PV'.padStart(6)} ${'Users'.padStart(6)} ${'滞在秒'.padStart(6)} ${'直帰率'.padStart(6)}`)
  console.log('-'.repeat(80))
  for (const row of pages.data.rows || []) {
    const path = row.dimensionValues![0].value!
    const pv = row.metricValues![0].value!
    const users = row.metricValues![1].value!
    const duration = Math.round(Number(row.metricValues![2].value))
    const bounce = (Number(row.metricValues![3].value) * 100).toFixed(0)
    console.log(`${path.padEnd(50)} ${pv.padStart(6)} ${users.padStart(6)} ${String(duration).padStart(5)}s ${(bounce + '%').padStart(6)}`)
  }

  // 3. 流入元
  const sources = await analyticsData.properties.runReport({
    property: PROPERTY_ID,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
      metrics: [
        { name: 'sessions' },
        { name: 'activeUsers' },
        { name: 'engagedSessions' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: '15',
    },
  })

  console.log('\n【流入元 Top15】')
  console.log(`${'ソース/メディア'.padEnd(40)} ${'Sessions'.padStart(8)} ${'Users'.padStart(6)} ${'Engaged'.padStart(8)}`)
  console.log('-'.repeat(65))
  for (const row of sources.data.rows || []) {
    const source = row.dimensionValues![0].value!
    const medium = row.dimensionValues![1].value!
    const sessions = row.metricValues![0].value!
    const users = row.metricValues![1].value!
    const engaged = row.metricValues![2].value!
    console.log(`${(`${source} / ${medium}`).padEnd(40)} ${sessions.padStart(8)} ${users.padStart(6)} ${engaged.padStart(8)}`)
  }

  // 4. デバイス別
  const devices = await analyticsData.properties.runReport({
    property: PROPERTY_ID,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'deviceCategory' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'averageSessionDuration' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    },
  })

  console.log('\n【デバイス別】')
  console.log(`${'デバイス'.padEnd(15)} ${'Users'.padStart(6)} ${'Sessions'.padStart(8)} ${'平均滞在'.padStart(8)}`)
  console.log('-'.repeat(40))
  for (const row of devices.data.rows || []) {
    const device = row.dimensionValues![0].value!
    const users = row.metricValues![0].value!
    const sessions = row.metricValues![1].value!
    const duration = Math.round(Number(row.metricValues![2].value))
    console.log(`${device.padEnd(15)} ${users.padStart(6)} ${sessions.padStart(8)} ${(duration + 's').padStart(8)}`)
  }

  // 5. チャネル別
  const queries = await analyticsData.properties.runReport({
    property: PROPERTY_ID,
    requestBody: {
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [
        { name: 'sessions' },
        { name: 'activeUsers' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    },
  })

  console.log('\n【チャネル別】')
  console.log(`${'チャネル'.padEnd(30)} ${'Sessions'.padStart(8)} ${'Users'.padStart(6)}`)
  console.log('-'.repeat(48))
  for (const row of queries.data.rows || []) {
    const channel = row.dimensionValues![0].value!
    const sessions = row.metricValues![0].value!
    const users = row.metricValues![1].value!
    console.log(`${channel.padEnd(30)} ${sessions.padStart(8)} ${users.padStart(6)}`)
  }

  console.log('\n')
}

runReport().catch(console.error)
