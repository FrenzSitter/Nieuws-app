import { NextRequest, NextResponse } from 'next/server'
import { rssManager } from '@/lib/rss-parser'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const category = searchParams.get('category')

    let articles
    if (category && category !== 'all') {
      articles = await rssManager.getArticlesByCategory(category, limit)
    } else {
      articles = await rssManager.getRecentArticles(limit)
    }

    // Transform articles to match our UI format
    const transformedArticles = articles.map(article => ({
      id: article.id,
      title: article.title,
      description: article.description,
      content: article.content,
      url: article.url,
      publishedAt: article.published_at,
      author: article.author,
      categories: article.categories || [],
      source: {
        name: article.news_sources?.name || 'Unknown Source',
        credibilityScore: article.news_sources?.credibility_score || 50,
        politicalLeaning: article.news_sources?.political_leaning || 'center'
      },
      qualityScore: article.quality_score,
      readingTime: article.reading_time_minutes,
      wordCount: article.word_count
    }))

    return NextResponse.json({
      success: true,
      data: transformedArticles,
      count: transformedArticles.length,
      category: category || 'all',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Recent articles API error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch articles',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}