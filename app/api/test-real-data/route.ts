import { NextResponse } from 'next/server'
import { rssManager } from '@/lib/rss-parser'

export async function GET() {
  try {
    // Force fetch real articles
    const articles = await rssManager.getRecentArticles(5)
    
    return NextResponse.json({
      success: true,
      message: 'REAL DATA TEST',
      articleCount: articles.length,
      articles: articles.map(article => ({
        id: article.id,
        title: article.title,
        source: article.news_sources?.name,
        publishedAt: article.published_at
      }))
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to get real data'
    })
  }
}