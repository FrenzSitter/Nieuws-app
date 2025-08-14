import { NextRequest, NextResponse } from 'next/server'
import { enhancedRSSCrawler } from '@/lib/enhanced-rss-crawler'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Bootstrap clustering: Processing existing articles...')

    // Get recent articles from the last 24 hours
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()

    const { data: recentArticles } = await supabase
      .from('raw_articles')
      .select(`
        *,
        news_sources!inner (
          name,
          credibility_score,
          political_leaning,
          metadata
        )
      `)
      .gte('published_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('published_at', { ascending: false })
      .limit(50)

    if (!recentArticles || recentArticles.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No recent articles found for clustering',
        data: { processed: 0 }
      })
    }

    console.log(`📊 Found ${recentArticles.length} recent articles for clustering`)

    // Transform articles to expected format
    const articles = recentArticles.map((article: any) => ({
      id: article.id,
      source_id: article.source_id,
      title: article.title,
      description: article.description,
      content: article.content,
      url: article.url,
      author: article.author,
      published_at: article.published_at,
      categories: article.categories || [],
      raw_content: article,
      source_name: article.news_sources?.name
    }))

    // Perform clustering on existing articles
    const clusters = await enhancedRSSCrawler.performInitialClustering(articles)
    
    // Perform cross-reference analysis
    const crossRefResults = await enhancedRSSCrawler.performCrossReferenceAnalysis(clusters)

    return NextResponse.json({
      success: true,
      message: 'Bootstrap clustering completed',
      data: {
        articles_processed: articles.length,
        clusters_created: clusters.length,
        cross_reference_analysis: crossRefResults,
        processing_summary: {
          immediate_processing: crossRefResults.immediate_processing,
          delayed_processing: crossRefResults.delayed_processing,
          insufficient_sources: crossRefResults.insufficient_sources
        }
      }
    })

  } catch (error) {
    console.error('Bootstrap clustering error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Bootstrap clustering failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Bootstrap clustering endpoint',
    description: 'POST to this endpoint to manually trigger clustering on existing articles',
    usage: 'POST /api/clustering/bootstrap'
  })
}