import { NextRequest, NextResponse } from 'next/server'
import { enhancedRSSCrawler } from '@/lib/enhanced-rss-crawler'

export async function POST(request: NextRequest) {
  try {
    // Check for authorization header
    const authHeader = request.headers.get('authorization')
    const apiKey = process.env.RSS_API_KEY || 'nonbulla-rss-key-2025'
    
    if (authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🚀 Starting Enhanced RSS Crawl...')
    
    const crawlResult = await enhancedRSSCrawler.performHourlyCrawl()
    
    return NextResponse.json({
      success: true,
      message: 'Enhanced RSS crawl completed successfully',
      data: {
        primary_articles_count: crawlResult.primary_articles.length,
        story_clusters_found: crawlResult.crawl_summary.story_clusters_found,
        crawl_duration_ms: crawlResult.crawl_summary.duration_ms,
        sources_crawled: crawlResult.crawl_summary.successful_crawls,
        sources_failed: crawlResult.crawl_summary.failed_crawls,
        total_articles: crawlResult.crawl_summary.total_articles,
        errors: crawlResult.crawl_summary.errors,
        cross_reference_results: crawlResult.crawl_summary.cross_reference_results,
        timestamp: crawlResult.crawl_summary.timestamp
      }
    })

  } catch (error) {
    console.error('Enhanced RSS crawl API error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Enhanced RSS crawl failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Get crawler status and recent clusters
    const sources = await enhancedRSSCrawler.getEnhancedSources()
    const primarySources = await enhancedRSSCrawler.getPrimarySources()
    
    return NextResponse.json({
      success: true,
      message: 'Enhanced RSS crawler status',
      data: {
        total_sources: sources.length,
        primary_sources: primarySources.length,
        sources_by_tier: {
          primary: sources.filter(s => s.tier === 'primary').length,
          secondary: sources.filter(s => s.tier === 'secondary').length,
          specialty: sources.filter(s => s.tier === 'specialty').length,
          international: sources.filter(s => s.tier === 'international').length
        },
        primary_source_names: primarySources.map(s => s.name),
        last_status_check: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Enhanced RSS crawler status error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get crawler status',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}