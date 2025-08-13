import { NextRequest, NextResponse } from 'next/server'
import { rssManager } from '@/lib/rss-parser'

export async function POST(request: NextRequest) {
  try {
    // Check for authorization header (simple API key check)
    const authHeader = request.headers.get('authorization')
    const apiKey = process.env.RSS_API_KEY || 'nonbulla-rss-key-2025'
    
    if (authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('Starting RSS fetch process...')
    
    const results = await rssManager.fetchAndProcessAllFeeds()
    
    return NextResponse.json({
      success: true,
      message: 'RSS fetch completed',
      data: {
        totalSources: results.totalSources,
        successfulSources: results.successfulSources,
        totalArticles: results.totalArticles,
        errors: results.errors
      }
    })

  } catch (error) {
    console.error('RSS fetch API error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Get recent articles for status check
    const recentArticles = await rssManager.getRecentArticles(10)
    
    return NextResponse.json({
      success: true,
      message: 'RSS system status',
      data: {
        recentArticlesCount: recentArticles.length,
        lastArticle: recentArticles[0] ? {
          title: recentArticles[0].title,
          source: recentArticles[0].news_sources?.name,
          publishedAt: recentArticles[0].published_at
        } : null
      }
    })

  } catch (error) {
    console.error('RSS status API error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get RSS status',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}