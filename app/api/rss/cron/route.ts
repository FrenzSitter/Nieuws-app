import { NextRequest, NextResponse } from 'next/server'
import { enhancedRSSCrawler } from '@/lib/enhanced-rss-crawler'
import { crossReferenceEngine } from '@/lib/cross-reference-engine'

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

    console.log('🕒 Starting Nonbulla enhanced RSS crawl and clustering...')
    
    // Phase 1: Enhanced RSS crawling with metadata focus and clustering
    const crawlResults = await enhancedRSSCrawler.performHourlyCrawl()
    
    // Phase 2: Process delayed cross-reference rechecks
    console.log('🔄 Processing delayed cross-reference rechecks...')
    const recheckResults = await crossReferenceEngine.processDelayedRechecks()
    
    const totalResults = {
      crawl: crawlResults.crawl_summary,
      delayed_rechecks: recheckResults,
      workflow_stage: 'RSS Crawling → Clustering → Cross-Reference Analysis',
      next_phase: 'AI Perspective Synthesis (separate cron job)'
    }
    
    console.log('🎆 Nonbulla RSS and clustering workflow completed:', totalResults)
    
    return NextResponse.json({
      success: true,
      message: 'Nonbulla RSS crawl and clustering completed',
      timestamp: new Date().toISOString(),
      workflow: 'enhanced_metadata_clustering',
      data: totalResults
    })

  } catch (error) {
    console.error('❌ Nonbulla RSS crawl and clustering error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Enhanced RSS crawl failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        workflow: 'enhanced_metadata_clustering'
      },
      { status: 500 }
    )
  }
}

// Also allow POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request)
}