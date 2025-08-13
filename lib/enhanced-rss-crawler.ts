import { createClient } from './supabase/client'
import Parser from 'rss-parser'

export interface EnhancedNewsSource {
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
  tier: 'primary' | 'secondary' | 'international' | 'specialty'
  priority_weight: number
  cross_reference_required: boolean
}

export interface RSSArticle {
  id: string
  source_id: string
  title: string
  description?: string
  content?: string
  url: string
  author?: string
  published_at: string
  guid?: string
  categories?: string[]
  raw_content: any
}

export interface StoryCluster {
  id: string
  primary_topic: string
  keywords: string[]
  detection_timestamp: string
  sources_found: string[]
  sources_missing: string[]
  processing_status: 'detecting' | 'analyzing' | 'complete' | 'failed'
  trigger_source: string
  similarity_threshold: number
  article_count: number
  articles: RSSArticle[]
}

class EnhancedRSSCrawler {
  private parser: any
  private supabase = createClient()

  constructor() {
    this.parser = new Parser({
      customFields: {
        item: ['content:encoded', 'content:encodedSnippet', 'dc:creator']
      }
    })
  }

  /**
   * Get enhanced news sources with tier metadata
   */
  async getEnhancedSources(): Promise<EnhancedNewsSource[]> {
    try {
      const { data, error } = await this.supabase
        .from('news_sources')
        .select('*')
        .eq('is_active', true)
        .order('metadata->priority_weight', { ascending: false })

      if (error) {
        console.error('Error fetching enhanced sources:', error)
        return []
      }

      return data.map(source => ({
        ...source,
        tier: source.metadata?.tier || 'secondary',
        priority_weight: source.metadata?.priority_weight || 5,
        cross_reference_required: source.metadata?.cross_reference_required || false
      })) as EnhancedNewsSource[]
    } catch (error) {
      console.error('Failed to fetch enhanced sources:', error)
      return []
    }
  }

  /**
   * Get primary Dutch sources (NU.nl, Volkskrant, NOS, Telegraaf)
   */
  async getPrimarySources(): Promise<EnhancedNewsSource[]> {
    const sources = await this.getEnhancedSources()
    return sources.filter(source => 
      source.tier === 'primary' && 
      source.country_code === 'NL'
    )
  }

  /**
   * Enhanced RSS parsing with better content extraction
   */
  async parseEnhancedRSS(source: EnhancedNewsSource): Promise<RSSArticle[]> {
    try {
      console.log(`📡 Fetching RSS from ${source.name}: ${source.rss_feed_url}`)
      
      const feed = await this.parser.parseURL(source.rss_feed_url)
      
      if (!feed.items || feed.items.length === 0) {
        console.warn(`⚠️ No items found in feed: ${source.name}`)
        return []
      }

      const articles: RSSArticle[] = feed.items.map((item: any) => ({
        id: `${source.id}_${item.guid || item.id || item.link}`,
        source_id: source.id,
        title: this.cleanTitle(item.title || 'Untitled'),
        description: this.cleanContent(item.summary || item.contentSnippet || ''),
        content: this.extractContent(item),
        url: item.link || '',
        author: item.creator || item.dc?.creator || item.author,
        published_at: new Date(item.pubDate || item.isoDate || new Date()).toISOString(),
        guid: item.guid || item.id || item.link,
        categories: this.extractCategories(item.categories),
        raw_content: item
      }))

      // Filter out articles older than 48 hours for real-time processing
      const cutoffTime = new Date(Date.now() - 48 * 60 * 60 * 1000)
      const recentArticles = articles.filter(article => 
        new Date(article.published_at) > cutoffTime
      )

      console.log(`✅ Parsed ${recentArticles.length}/${articles.length} recent articles from ${source.name}`)
      return recentArticles

    } catch (error) {
      console.error(`❌ Failed to parse RSS from ${source.name}:`, error)
      return []
    }
  }

  /**
   * Hourly RSS crawl focusing on primary sources first
   */
  async performHourlyCrawl(): Promise<{
    primary_articles: RSSArticle[]
    secondary_articles: RSSArticle[]
    crawl_summary: any
  }> {
    const startTime = Date.now()
    console.log('🚀 Starting Enhanced Hourly RSS Crawl...')

    // Phase 1: Crawl primary sources first (NU.nl as trigger)
    const primarySources = await this.getPrimarySources()
    const nuSource = primarySources.find(s => s.rss_feed_url.includes('nu.nl'))
    
    if (!nuSource) {
      throw new Error('NU.nl not found in primary sources!')
    }

    console.log('📰 Phase 1: Crawling Primary Sources')
    const primaryArticles: RSSArticle[] = []
    const crawlResults = {
      total_sources: primarySources.length,
      successful_crawls: 0,
      failed_crawls: 0,
      total_articles: 0,
      errors: [] as string[]
    }

    // Crawl all primary sources
    for (const source of primarySources) {
      try {
        const articles = await this.parseEnhancedRSS(source)
        primaryArticles.push(...articles)
        crawlResults.successful_crawls++
        crawlResults.total_articles += articles.length

        // Store articles in database immediately
        await this.storeArticles(articles, source)

      } catch (error) {
        crawlResults.failed_crawls++
        crawlResults.errors.push(`${source.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }

      // Respectful delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // Phase 2: Process for story clustering
    console.log('🔍 Phase 2: Initial Story Clustering')
    const storyClusters = await this.performInitialClustering(primaryArticles)

    // Phase 3: Cross-reference analysis for NU.nl triggered clusters
    console.log('🎯 Phase 3: Cross-Reference Analysis')
    const crossReferenceResults = await this.performCrossReferenceAnalysis(storyClusters)

    const duration = Date.now() - startTime
    console.log(`✅ Enhanced crawl completed in ${duration}ms`)
    console.log(`📊 Found ${storyClusters.length} potential story clusters`)
    console.log(`🔗 ${crossReferenceResults.immediate_processing} ready for immediate processing`)
    console.log(`⏳ ${crossReferenceResults.delayed_processing} scheduled for delayed processing`)

    return {
      primary_articles: primaryArticles,
      secondary_articles: [], // Will be populated in cross-reference phase
      crawl_summary: {
        ...crawlResults,
        duration_ms: duration,
        story_clusters_found: storyClusters.length,
        cross_reference_results: crossReferenceResults,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Initial story clustering based on title and keyword similarity
   */
  async performInitialClustering(articles: RSSArticle[]): Promise<StoryCluster[]> {
    console.log('🧠 Performing intelligent story clustering...')
    
    const clusters: StoryCluster[] = []
    const processedArticles = new Set<string>()

    for (const article of articles) {
      if (processedArticles.has(article.id)) continue

      const keywords = this.extractKeywords(article.title + ' ' + (article.description || ''))
      const similarArticles = this.findSimilarArticles(article, articles, keywords)

      if (similarArticles.length >= 1) { // At least the article itself
        const cluster: StoryCluster = {
          id: `cluster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          primary_topic: this.generatePrimaryTopic(similarArticles),
          keywords: keywords,
          detection_timestamp: new Date().toISOString(),
          sources_found: Array.from(new Set(similarArticles.map(a => a.source_id))),
          sources_missing: [],
          processing_status: 'detecting',
          trigger_source: article.source_id,
          similarity_threshold: 0.80,
          article_count: similarArticles.length,
          articles: similarArticles
        }

        clusters.push(cluster)
        
        // Mark articles as processed
        similarArticles.forEach(a => processedArticles.add(a.id))

        // Store cluster in database
        await this.storeStoryCluster(cluster)
      }
    }

    return clusters
  }

  /**
   * Perform cross-reference analysis on story clusters
   */
  async performCrossReferenceAnalysis(clusters: StoryCluster[]): Promise<{
    total_clusters: number
    immediate_processing: number
    delayed_processing: number
    insufficient_sources: number
  }> {
    const { crossReferenceEngine } = await import('./cross-reference-engine')
    
    const results = {
      total_clusters: clusters.length,
      immediate_processing: 0,
      delayed_processing: 0,
      insufficient_sources: 0
    }

    for (const cluster of clusters) {
      try {
        // Analyze cross-references for each cluster
        const analysis = await crossReferenceEngine.analyzeStoryCluster(cluster.id)
        
        switch (analysis.processing_recommendation) {
          case 'immediate':
            results.immediate_processing++
            console.log(`✅ Cluster "${cluster.primary_topic}" ready for immediate processing`)
            break
          case 'delayed':
            results.delayed_processing++
            console.log(`⏳ Cluster "${cluster.primary_topic}" scheduled for recheck`)
            break
          case 'insufficient':
            results.insufficient_sources++
            console.log(`❌ Cluster "${cluster.primary_topic}" has insufficient sources`)
            break
        }

      } catch (error) {
        console.error(`Error analyzing cluster ${cluster.id}:`, error)
        results.insufficient_sources++
      }
    }

    return results
  }

  /**
   * Store articles in database with enhanced metadata
   */
  private async storeArticles(articles: RSSArticle[], source: EnhancedNewsSource) {
    if (articles.length === 0) return

    const articlesToInsert = articles.map(article => ({
      source_id: source.id,
      title: article.title,
      description: article.description,
      content: article.content,
      url: article.url,
      author: article.author,
      published_at: article.published_at,
      guid: article.guid,
      categories: article.categories,
      processing_status: 'pending',
      quality_score: this.calculateQualityScore(article, source),
      metadata: {
        source_tier: source.tier,
        crawl_timestamp: new Date().toISOString(),
        priority_weight: source.priority_weight
      }
    }))

    try {
      const { data, error } = await this.supabase
        .from('raw_articles')
        .upsert(articlesToInsert, { 
          onConflict: 'source_id,url',
          ignoreDuplicates: true 
        })
        .select()

      if (error) {
        console.error(`Error storing articles for ${source.name}:`, error)
      } else {
        console.log(`💾 Stored ${data?.length || 0} articles from ${source.name}`)
      }
    } catch (error) {
      console.error(`Failed to store articles for ${source.name}:`, error)
    }
  }

  /**
   * Store story cluster in database
   */
  private async storeStoryCluster(cluster: StoryCluster) {
    try {
      const { data, error } = await this.supabase
        .from('story_clusters')
        .insert({
          primary_topic: cluster.primary_topic,
          keywords: cluster.keywords,
          detection_timestamp: cluster.detection_timestamp,
          sources_found: cluster.sources_found,
          sources_missing: cluster.sources_missing,
          processing_status: cluster.processing_status,
          trigger_source: cluster.trigger_source,
          similarity_threshold: cluster.similarity_threshold,
          article_count: cluster.article_count,
          metadata: {
            cluster_method: 'keyword_similarity',
            articles_ids: cluster.articles.map(a => a.id)
          }
        })
        .select()
        .single()

      if (error) {
        console.error('Error storing story cluster:', error)
      } else {
        console.log(`🎯 Stored story cluster: "${cluster.primary_topic}"`)
      }

      return data
    } catch (error) {
      console.error('Failed to store story cluster:', error)
      return null
    }
  }

  // Helper methods
  private cleanTitle(title: string): string {
    return title.trim().replace(/\s+/g, ' ').substring(0, 500)
  }

  private cleanContent(content: string): string {
    return content.replace(/<[^>]*>/g, '').trim().substring(0, 2000)
  }

  private extractContent(item: any): string {
    const content = item['content:encoded'] || 
                   item.content || 
                   item.contentSnippet || 
                   item.summary || ''
    return this.cleanContent(content)
  }

  private extractCategories(categories: any): string[] {
    if (!categories) return []
    if (Array.isArray(categories)) return categories.slice(0, 5)
    if (typeof categories === 'string') return [categories]
    return []
  }

  private extractKeywords(text: string): string[] {
    // Simple keyword extraction - can be enhanced with NLP
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !this.isStopWord(word))

    const wordFreq = new Map()
    words.forEach(word => {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1)
    })

    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word)
  }

  private isStopWord(word: string): boolean {
    const stopWords = [
      'het', 'de', 'een', 'van', 'en', 'in', 'op', 'met', 'voor', 'door',
      'aan', 'bij', 'uit', 'over', 'onder', 'tussen', 'tijdens', 'naar',
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'
    ]
    return stopWords.includes(word)
  }

  private findSimilarArticles(targetArticle: RSSArticle, allArticles: RSSArticle[], keywords: string[]): RSSArticle[] {
    const similar = [targetArticle] // Include the original article
    
    for (const article of allArticles) {
      if (article.id === targetArticle.id) continue

      const articleKeywords = this.extractKeywords(article.title + ' ' + (article.description || ''))
      const similarity = this.calculateSimilarity(keywords, articleKeywords)

      if (similarity > 0.3) { // 30% keyword overlap
        similar.push(article)
      }
    }

    return similar
  }

  private calculateSimilarity(keywords1: string[], keywords2: string[]): number {
    const set1 = new Set(keywords1)
    const set2 = new Set(keywords2)
    const intersection = new Set(Array.from(set1).filter(x => set2.has(x)))
    const union = new Set(Array.from(set1).concat(Array.from(set2)))
    
    return union.size > 0 ? intersection.size / union.size : 0
  }

  private generatePrimaryTopic(articles: RSSArticle[]): string {
    // Extract most common keywords across articles
    const allKeywords: string[] = []
    articles.forEach(article => {
      const keywords = this.extractKeywords(article.title + ' ' + (article.description || ''))
      allKeywords.push(...keywords)
    })

    const keywordFreq = new Map()
    allKeywords.forEach(keyword => {
      keywordFreq.set(keyword, (keywordFreq.get(keyword) || 0) + 1)
    })

    const topKeywords = Array.from(keywordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([keyword]) => keyword)

    return topKeywords.join(' ') || articles[0]?.title.substring(0, 100) || 'Unknown Topic'
  }

  private calculateQualityScore(article: RSSArticle, source: EnhancedNewsSource): number {
    let score = 50 // Base score

    // Source credibility
    score += (source.credibility_score - 50) * 0.3

    // Content quality
    if (article.title && article.title.length > 10 && article.title.length < 200) score += 15
    if (article.description && article.description.length > 50) score += 10
    if (article.content && article.content.length > 200) score += 15
    if (article.author) score += 10

    // Recency bonus (newer articles get higher scores)
    const hoursOld = (Date.now() - new Date(article.published_at).getTime()) / (1000 * 60 * 60)
    if (hoursOld < 2) score += 10
    else if (hoursOld < 6) score += 5

    return Math.max(0, Math.min(100, Math.round(score)))
  }
}

export const enhancedRSSCrawler = new EnhancedRSSCrawler()
export default EnhancedRSSCrawler