import { NextResponse } from 'next/server'
import { rssManager } from '@/lib/rss-parser'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET() {
  try {
    const supabase = createServiceClient()
    
    // Get recent articles count
    const recentArticles = await rssManager.getRecentArticles(10)
    
    // Get RSS fetch logs for the last 24 hours
    const { data: logs, error: logsError } = await supabase
      .from('rss_fetch_logs')
      .select('*')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })
      .limit(10)
    
    if (logsError) {
      console.warn('Failed to fetch RSS logs:', logsError)
    }
    
    // Get news sources status
    const { data: sources, error: sourcesError } = await supabase
      .from('news_sources')
      .select('id, name, is_active, last_fetched_at, fetch_error_count')
      .eq('is_active', true)
    
    if (sourcesError) {
      console.warn('Failed to fetch sources:', sourcesError)
    }
    
    // Calculate stats
    const lastLog = logs?.[0]
    const totalFetchesLast24h = logs?.length || 0
    const avgArticlesPerFetch = logs?.length ? 
      Math.round(logs.reduce((sum, log) => sum + log.total_articles, 0) / logs.length) : 0
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      status: {
        recentArticlesCount: recentArticles.length,
        lastArticle: recentArticles[0] ? {
          title: recentArticles[0].title,
          source: recentArticles[0].news_sources?.name,
          publishedAt: recentArticles[0].published_at
        } : null,
        lastFetch: lastLog ? {
          timestamp: lastLog.created_at,
          totalSources: lastLog.total_sources,
          successfulSources: lastLog.successful_sources,
          totalArticles: lastLog.total_articles,
          executionTimeMs: lastLog.execution_time_ms,
          hasErrors: lastLog.errors.length > 0
        } : null,
        stats24h: {
          totalFetches: totalFetchesLast24h,
          avgArticlesPerFetch: avgArticlesPerFetch,
          activeSources: sources?.length || 0
        },
        sources: sources?.map(source => ({
          name: source.name,
          isActive: source.is_active,
          lastFetched: source.last_fetched_at,
          errorCount: source.fetch_error_count
        })) || [],
        cronSchedule: 'Every 2 hours (0 */2 * * *)',
        nextScheduledRun: getNextCronRun()
      }
    })

  } catch (error) {
    console.error('RSS status API error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get RSS status',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

function getNextCronRun(): string {
  const now = new Date()
  const nextRun = new Date(now)
  
  // Calculate next even hour (2, 4, 6, 8, etc.)
  const currentHour = now.getHours()
  const nextEvenHour = Math.ceil((currentHour + 1) / 2) * 2
  
  if (nextEvenHour > 23) {
    nextRun.setDate(nextRun.getDate() + 1)
    nextRun.setHours(0, 0, 0, 0)
  } else {
    nextRun.setHours(nextEvenHour, 0, 0, 0)
  }
  
  return nextRun.toISOString()
}