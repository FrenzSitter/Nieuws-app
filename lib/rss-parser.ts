import Parser from 'rss-parser'
import { createServiceClient } from './supabase/service'

export interface RSSItem {
  title: string
  description?: string
  content?: string
  link: string
  pubDate: string
  author?: string
  categories?: string[]
  guid?: string
}

export interface NewsSource {
  id: string
  name: string
  url: string
  rss_feed_url: string
  category?: string
  country_code: string
  language_code: string
  credibility_score: number
  political_leaning: string
  is_active: boolean
  fetch_error_count?: number
  last_fetched_at?: string
}

interface ParsedRSSItem extends Parser.Item {
  'content:encoded'?: string
  'content:encodedSnippet'?: string
  dc?: {
    creator?: string
  }
}

class RSSFeedManager {
  private parser: any
  private supabase = createServiceClient()

  constructor() {
    this.parser = new Parser({
      customFields: {
        item: ['content:encoded', 'content:encodedSnippet', 'dc:creator']
      }
    })
  }

  async fetchActiveSources(): Promise<NewsSource[]> {
    try {
      const { data, error } = await this.supabase
        .from('news_sources')
        .select('*')
        .eq('is_active', true)
        .order('credibility_score', { ascending: false })

      if (error) {
        console.error('Error fetching news sources:', error)
        return []
      }

      return data as NewsSource[]
    } catch (error) {
      console.error('Failed to fetch active sources:', error)
      return []
    }
  }

  async parseRSSFeed(feedUrl: string): Promise<RSSItem[]> {
    try {
      console.log(`Fetching RSS feed: ${feedUrl}`)
      
      // Add timeout and user agent
      const feed = await this.parser.parseURL(feedUrl)
      
      if (!feed.items) {
        console.warn(`No items found in feed: ${feedUrl}`)
        return []
      }

      const items: RSSItem[] = feed.items.map((item: any) => ({
        title: item.title || 'Untitled',
        description: item.summary || item.contentSnippet || '',
        content: item['content:encoded'] || item.content || item.contentSnippet || '',
        link: item.link || '',
        pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
        author: item.creator || item.dc?.creator || item.author || undefined,
        categories: item.categories || [],
        guid: item.guid || item.id || item.link
      }))

      console.log(`Successfully parsed ${items.length} items from ${feedUrl}`)
      return items

    } catch (error) {
      console.error(`Failed to parse RSS feed ${feedUrl}:`, error)
      return []
    }
  }

  async saveArticlesToDatabase(items: RSSItem[], sourceId: string) {
    try {
      const articlesToInsert = items.map(item => ({
        source_id: sourceId,
        title: item.title,
        description: item.description,
        content: item.content,
        url: item.link,
        author: item.author,
        published_at: new Date(item.pubDate).toISOString(),
        guid: item.guid,
        categories: item.categories,
        processing_status: 'processed',
        quality_score: this.calculateInitialQualityScore(item),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }))

      // Use upsert to handle duplicates
      const { data, error } = await this.supabase
        .from('raw_articles')
        .upsert(articlesToInsert, { 
          onConflict: 'source_id,url',
          ignoreDuplicates: true 
        })
        .select()

      if (error) {
        console.error('Error saving articles to database:', error)
        return { success: false, error: error.message }
      }

      console.log(`Successfully saved ${data?.length || 0} articles to database`)
      return { success: true, count: data?.length || 0 }

    } catch (error) {
      console.error('Failed to save articles:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  private calculateInitialQualityScore(item: RSSItem): number {
    let score = 50 // Base score

    // Title quality
    if (item.title && item.title.length > 10) score += 15
    if (item.title && item.title.length < 200) score += 10

    // Content quality
    if (item.content && item.content.length > 200) score += 15
    if (item.description && item.description.length > 50) score += 10

    // Author attribution
    if (item.author) score += 10

    // Ensure score is between 0-100
    return Math.max(0, Math.min(100, score))
  }

  async fetchAndProcessAllFeeds(): Promise<{
    totalSources: number
    totalArticles: number
    successfulSources: number
    errors: string[]
  }> {
    const startTime = Date.now()
    const sources = await this.fetchActiveSources()
    const results = {
      totalSources: sources.length,
      totalArticles: 0,
      successfulSources: 0,
      errors: [] as string[]
    }

    console.log(`Starting RSS fetch for ${sources.length} active sources`)

    for (const source of sources) {
      try {
        console.log(`Processing source: ${source.name} (${source.rss_feed_url})`)
        
        const items = await this.parseRSSFeed(source.rss_feed_url)
        
        if (items.length === 0) {
          results.errors.push(`No articles found for ${source.name}`)
          continue
        }

        const saveResult = await this.saveArticlesToDatabase(items, source.id)
        
        if (saveResult.success) {
          results.totalArticles += saveResult.count || 0
          results.successfulSources += 1
          
          // Update last_fetched_at for successful sources
          await this.supabase
            .from('news_sources')
            .update({ 
              last_fetched_at: new Date().toISOString(),
              fetch_error_count: 0
            })
            .eq('id', source.id)
        } else {
          results.errors.push(`Failed to save articles for ${source.name}: ${saveResult.error}`)
          
          // Increment error count
          await this.supabase
            .from('news_sources')
            .update({
              fetch_error_count: (source.fetch_error_count || 0) + 1
            })
            .eq('id', source.id)
        }

        // Add delay between requests to be respectful
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (error) {
        console.error(`Error processing source ${source.name}:`, error)
        results.errors.push(`Error processing ${source.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    const executionTime = Date.now() - startTime
    console.log('RSS fetch completed:', results)
    
    // Log the results to database for monitoring
    try {
      await this.supabase
        .from('rss_fetch_logs')
        .insert({
          total_sources: results.totalSources,
          successful_sources: results.successfulSources,
          total_articles: results.totalArticles,
          errors: results.errors,
          execution_time_ms: executionTime,
          triggered_by: 'automated'
        })
    } catch (logError) {
      console.warn('Failed to log RSS fetch results:', logError)
    }
    
    return results
  }

  async getRecentArticles(limit: number = 50): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('raw_articles')
        .select(`
          *,
          news_sources (
            name,
            credibility_score,
            political_leaning
          )
        `)
        .eq('processing_status', 'processed')
        .order('published_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching recent articles:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Failed to fetch recent articles:', error)
      return []
    }
  }

  async getArticlesByCategory(category: string, limit: number = 20): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('raw_articles')
        .select(`
          *,
          news_sources (
            name,
            credibility_score,
            political_leaning,
            category
          )
        `)
        .or(`categories.cs.{${category}},news_sources.category.eq.${category}`)
        .eq('processing_status', 'processed')
        .order('published_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('Error fetching articles by category:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Failed to fetch articles by category:', error)
      return []
    }
  }
}

export const rssManager = new RSSFeedManager()
export default RSSFeedManager