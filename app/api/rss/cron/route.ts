import { NextRequest, NextResponse } from 'next/server'
import { rssManager } from '@/lib/rss-parser'

export async function GET(request: NextRequest) {
  try {
    // Verify this is a cron request (Vercel adds this header)
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || process.env.RSS_API_KEY || 'nonbulla-rss-key-2025'
    
    // Allow cron requests from Vercel or manual requests with proper auth
    const isVercelCron = request.headers.get('user-agent')?.includes('vercel-cron')
    const hasValidAuth = authHeader === `Bearer ${cronSecret}`
    
    if (!isVercelCron && !hasValidAuth) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🕒 Starting scheduled RSS fetch...')
    
    const results = await rssManager.fetchAndProcessAllFeeds()
    
    console.log('📊 RSS fetch completed:', {
      totalSources: results.totalSources,
      successfulSources: results.successfulSources,
      totalArticles: results.totalArticles,
      errors: results.errors.length
    })
    
    return NextResponse.json({
      success: true,
      message: 'Scheduled RSS fetch completed',
      timestamp: new Date().toISOString(),
      data: {
        totalSources: results.totalSources,
        successfulSources: results.successfulSources,
        totalArticles: results.totalArticles,
        errors: results.errors,
        schedule: 'Every 2 hours'
      }
    })

  } catch (error) {
    console.error('❌ RSS cron job error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Also allow POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request)
}