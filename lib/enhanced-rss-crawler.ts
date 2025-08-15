import { createClient } from './supabase/client'
import Parser from 'rss-parser'

// Nonbulla Categories
type NonbullaCategory = 'Alles' | 'Politiek' | 'Economie' | 'Oorlog' | 'Wetenschap' | 'Technologie' | 'Feiten'

export interface EnhancedNewsSource {
  id: string
  name: string
  url: string
  rss_feed_url: string
  category?: NonbullaCategory
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
  // Focus on metadata, not full content extraction
  url: string
  author?: string
  published_at: string
  guid?: string
  categories?: string[]
  // Metadata for clustering and cross-referencing
  keywords: string[]
  topic_category: NonbullaCategory
  quality_score: number
  sentiment_score?: number
  language_detected?: string
  raw_metadata: any
}

export interface StoryCluster {
  id: string
  title: string
  keywords: string[]
  main_topic: string
  time_period_start: string
  time_period_end: string
  status: 'detecting' | 'analyzing' | 'ready_for_ai' | 'synthesized' | 'failed'
  cluster_method: 'metadata_similarity' | 'keyword_matching' | 'ai_enhanced'
  confidence_score: number
  article_count: number
  nonbulla_category: NonbullaCategory
  geographic_focus?: string
  trending_score?: number
  metadata: {
    trigger_source: string
    sources_found: string[]
    sources_missing: string[]
    similarity_threshold: number
    last_updated: string
  }
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
   * Enhanced RSS parsing focused on metadata collection for clustering
   * NO full text extraction - only metadata for efficient processing
   */
  async parseEnhancedRSS(source: EnhancedNewsSource): Promise<RSSArticle[]> {
    try {
      console.log(`📡 Fetching RSS metadata from ${source.name}: ${source.rss_feed_url}`)
      
      const feed = await this.parser.parseURL(source.rss_feed_url)
      
      if (!feed.items || feed.items.length === 0) {
        console.warn(`⚠️ No items found in feed: ${source.name}`)
        return []
      }

      const articles: RSSArticle[] = feed.items.map((item: any) => {
        const title = this.cleanTitle(item.title || 'Untitled')
        const description = this.cleanContent(item.summary || item.contentSnippet || '')
        const keywords = this.extractKeywords(title + ' ' + description)
        const topicCategory = this.categorizeArticle(title, description, source.category)
        
        return {
          id: `${source.id}_${item.guid || item.id || item.link}`,
          source_id: source.id,
          title,
          description,
          url: item.link || '',
          author: item.creator || item.dc?.creator || item.author,
          published_at: new Date(item.pubDate || item.isoDate || new Date()).toISOString(),
          guid: item.guid || item.id || item.link,
          categories: this.extractCategories(item.categories),
          keywords,
          topic_category: topicCategory,
          quality_score: this.calculateInitialQualityScore(item, source),
          sentiment_score: this.detectSentiment(title + ' ' + description),
          language_detected: 'nl', // Assume Dutch for now
          raw_metadata: {
            feed_category: item.category,
            tags: item.categories,
            source_priority: source.priority_weight
          }
        }
      })

      // Filter out articles older than 48 hours for real-time processing
      const cutoffTime = new Date(Date.now() - 48 * 60 * 60 * 1000)
      const recentArticles = articles.filter(article => 
        new Date(article.published_at) > cutoffTime
      )

      console.log(`✅ Parsed ${recentArticles.length}/${articles.length} recent article metadata from ${source.name}`)
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
   * Enhanced story clustering focused on metadata-based similarity and cross-referencing
   * Uses the new database schema (topic_clusters table)
   */
  async performInitialClustering(articles: RSSArticle[]): Promise<StoryCluster[]> {
    console.log('🧠 Performing intelligent metadata-based story clustering...')
    
    const clusters: StoryCluster[] = []
    const processedArticles = new Set<string>()

    for (const article of articles) {
      if (processedArticles.has(article.id)) continue

      const similarArticles = this.findSimilarArticlesByMetadata(article, articles)

      if (similarArticles.length >= 2) { // Need at least 2 articles for a cluster
        const now = new Date().toISOString()
        const cluster: StoryCluster = {
          id: `cluster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: this.generateClusterTitle(similarArticles),
          keywords: this.mergeKeywords(similarArticles),
          main_topic: this.generateMainTopic(similarArticles),
          time_period_start: this.getEarliestTimestamp(similarArticles),
          time_period_end: this.getLatestTimestamp(similarArticles),
          status: 'detecting',
          cluster_method: 'metadata_similarity',
          confidence_score: this.calculateClusterConfidence(similarArticles),
          article_count: similarArticles.length,
          nonbulla_category: this.determineClusterCategory(similarArticles),
          geographic_focus: this.detectGeographicFocus(similarArticles),
          trending_score: this.calculateTrendingScore(similarArticles),
          metadata: {
            trigger_source: article.source_id,
            sources_found: Array.from(new Set(similarArticles.map(a => a.source_id))),
            sources_missing: [],
            similarity_threshold: 0.75,
            last_updated: now
          }
        }

        clusters.push(cluster)
        
        // Mark articles as processed
        similarArticles.forEach(a => processedArticles.add(a.id))

        // Store cluster in new database schema
        await this.storeTopicCluster(cluster, similarArticles)
      }
    }

    console.log(`✅ Created ${clusters.length} topic clusters from ${articles.length} articles`)
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
   * Store articles with enhanced metadata for clustering and AI processing
   * Uses the updated database schema focusing on metadata
   */
  private async storeArticles(articles: RSSArticle[], source: EnhancedNewsSource) {
    if (articles.length === 0) return

    const articlesToInsert = articles.map(article => ({
      source_id: source.id,
      title: article.title,
      description: article.description,
      // No full content - just URL for later retrieval if needed by AI
      url: article.url,
      author: article.author,
      published_at: article.published_at,
      guid: article.guid,
      categories: article.categories,
      processing_status: 'pending_clustering',
      quality_score: article.quality_score,
      sentiment_score: article.sentiment_score,
      language_detected: article.language_detected,
      tags: article.keywords, // Store keywords as tags
      metadata: {
        source_tier: source.tier,
        crawl_timestamp: new Date().toISOString(),
        priority_weight: source.priority_weight,
        topic_category: article.topic_category,
        clustering_keywords: article.keywords,
        raw_feed_data: article.raw_metadata
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
        console.error(`Error storing article metadata for ${source.name}:`, error)
      } else {
        console.log(`💾 Stored ${data?.length || 0} article metadata records from ${source.name}`)
      }
    } catch (error) {
      console.error(`Failed to store article metadata for ${source.name}:`, error)
    }
  }

  /**
   * Store topic cluster in database using the new schema
   */
  private async storeTopicCluster(cluster: StoryCluster, articles: RSSArticle[]) {
    try {
      const { data: clusterData, error: clusterError } = await this.supabase
        .from('topic_clusters')
        .insert({
          title: cluster.title,
          keywords: cluster.keywords,
          main_topic: cluster.main_topic,
          time_period_start: cluster.time_period_start,
          time_period_end: cluster.time_period_end,
          status: cluster.status,
          cluster_method: cluster.cluster_method,
          confidence_score: cluster.confidence_score,
          article_count: cluster.article_count,
          geographic_focus: cluster.geographic_focus,
          trending_score: cluster.trending_score,
          metadata: {
            ...cluster.metadata,
            nonbulla_category: cluster.nonbulla_category,
            articles_metadata: articles.map(a => ({
              id: a.id,
              title: a.title,
              source_id: a.source_id,
              quality_score: a.quality_score,
              keywords: a.keywords
            }))
          }
        })
        .select()
        .single()

      if (clusterError) {
        console.error('Error storing topic cluster:', clusterError)
        return null
      }

      // Link articles to cluster
      if (clusterData) {
        const clusterArticles = articles.map(article => ({
          cluster_id: clusterData.id,
          article_id: article.id,
          relevance_score: this.calculateArticleRelevance(article, cluster),
          is_primary: article.source_id === cluster.metadata.trigger_source
        }))

        await this.supabase
          .from('cluster_articles')
          .insert(clusterArticles)
      }

      console.log(`🎯 Stored topic cluster: "${cluster.title}" with ${articles.length} articles`)
      return clusterData
    } catch (error) {
      console.error('Failed to store topic cluster:', error)
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

  // Remove full content extraction - we focus on metadata only
  // Content will be retrieved later by AI engine when needed

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

  private findSimilarArticlesByMetadata(targetArticle: RSSArticle, allArticles: RSSArticle[]): RSSArticle[] {
    const similar = [targetArticle]
    
    for (const article of allArticles) {
      if (article.id === targetArticle.id) continue

      // Multi-factor similarity scoring
      let similarity = 0
      
      // Keyword similarity (50% weight)
      const keywordSim = this.calculateSimilarity(targetArticle.keywords, article.keywords)
      similarity += keywordSim * 0.5
      
      // Topic category match (25% weight)
      if (targetArticle.topic_category === article.topic_category) {
        similarity += 0.25
      }
      
      // Time proximity (15% weight)
      const timeDiff = Math.abs(
        new Date(targetArticle.published_at).getTime() - 
        new Date(article.published_at).getTime()
      )
      const hours = timeDiff / (1000 * 60 * 60)
      if (hours < 6) similarity += 0.15
      else if (hours < 24) similarity += 0.10
      
      // Quality threshold (10% weight)
      if (article.quality_score > 70) similarity += 0.10

      if (similarity > 0.65) { // Higher threshold for metadata-based clustering
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

  // Enhanced clustering helper methods
  
  private generateClusterTitle(articles: RSSArticle[]): string {
    // Use the highest quality article's title as base
    const bestArticle = articles.sort((a, b) => b.quality_score - a.quality_score)[0]
    return bestArticle.title.substring(0, 150)
  }
  
  private generateMainTopic(articles: RSSArticle[]): string {
    const allKeywords: string[] = []
    articles.forEach(article => {
      allKeywords.push(...article.keywords)
    })

    const keywordFreq = new Map()
    allKeywords.forEach(keyword => {
      keywordFreq.set(keyword, (keywordFreq.get(keyword) || 0) + 1)
    })

    const topKeywords = Array.from(keywordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([keyword]) => keyword)

    return topKeywords.join(' ')
  }
  
  private mergeKeywords(articles: RSSArticle[]): string[] {
    const allKeywords = new Set<string>()
    articles.forEach(article => {
      article.keywords.forEach(keyword => allKeywords.add(keyword))
    })
    return Array.from(allKeywords).slice(0, 15) // Limit to top 15 keywords
  }
  
  private getEarliestTimestamp(articles: RSSArticle[]): string {
    return articles
      .map(a => new Date(a.published_at))
      .sort((a, b) => a.getTime() - b.getTime())[0]
      .toISOString()
  }
  
  private getLatestTimestamp(articles: RSSArticle[]): string {
    return articles
      .map(a => new Date(a.published_at))
      .sort((a, b) => b.getTime() - a.getTime())[0]
      .toISOString()
  }
  
  private calculateClusterConfidence(articles: RSSArticle[]): number {
    const avgQuality = articles.reduce((sum, a) => sum + a.quality_score, 0) / articles.length
    const sourceCount = new Set(articles.map(a => a.source_id)).size
    const timeSpan = new Date(this.getLatestTimestamp(articles)).getTime() - 
                    new Date(this.getEarliestTimestamp(articles)).getTime()
    const hoursSpan = timeSpan / (1000 * 60 * 60)
    
    let confidence = (avgQuality / 100) * 0.6 // Quality weight: 60%
    confidence += Math.min(sourceCount / 4, 1) * 0.3 // Source diversity: 30%
    confidence += (hoursSpan < 12 ? 1 : Math.max(0, 1 - hoursSpan / 48)) * 0.1 // Recency: 10%
    
    return Math.max(0, Math.min(1, confidence))
  }
  
  private determineClusterCategory(articles: RSSArticle[]): NonbullaCategory {
    const categoryCount = new Map<NonbullaCategory, number>()
    articles.forEach(article => {
      const count = categoryCount.get(article.topic_category) || 0
      categoryCount.set(article.topic_category, count + 1)
    })
    
    const [mostCommon] = Array.from(categoryCount.entries())
      .sort((a, b) => b[1] - a[1])[0] || ['Alles', 0]
    
    return mostCommon
  }
  
  private detectGeographicFocus(articles: RSSArticle[]): string | undefined {
    const text = articles.map(a => a.title + ' ' + (a.description || '')).join(' ').toLowerCase()
    
    const locations = ['nederland', 'europa', 'amsterdam', 'den haag', 'rotterdam', 'utrecht', 'wereldwijd', 'internationaal']
    const detected = locations.filter(loc => text.includes(loc))
    
    return detected.length > 0 ? detected[0] : undefined
  }
  
  private calculateTrendingScore(articles: RSSArticle[]): number {
    const now = Date.now()
    const recentCount = articles.filter(article => {
      const age = now - new Date(article.published_at).getTime()
      return age < 6 * 60 * 60 * 1000 // Last 6 hours
    }).length
    
    const sourceCount = new Set(articles.map(a => a.source_id)).size
    const avgQuality = articles.reduce((sum, a) => sum + a.quality_score, 0) / articles.length
    
    return (recentCount / articles.length) * 0.4 +
           Math.min(sourceCount / 5, 1) * 0.4 +
           (avgQuality / 100) * 0.2
  }
  
  private calculateArticleRelevance(article: RSSArticle, cluster: StoryCluster): number {
    const keywordOverlap = this.calculateSimilarity(article.keywords, cluster.keywords)
    const qualityNorm = article.quality_score / 100
    const categoryMatch = article.topic_category === cluster.nonbulla_category ? 0.2 : 0
    
    return keywordOverlap * 0.6 + qualityNorm * 0.2 + categoryMatch
  }

  // New helper methods for metadata-focused approach
  
  private categorizeArticle(title: string, description: string, sourceCategory?: NonbullaCategory): NonbullaCategory {
    const text = (title + ' ' + description).toLowerCase()
    
    // Keyword-based categorization for Dutch news
    if (text.match(/(politiek|verkiezingen|regering|minister|kamer|partij|coalitie)/)) {
      return 'Politiek'
    } else if (text.match(/(economie|inflatie|rente|beurs|bedrijf|financieel|euro)/)) {
      return 'Economie'
    } else if (text.match(/(oorlog|conflict|militair|defensie|oekraïne|gaza|aanval)/)) {
      return 'Oorlog'
    } else if (text.match(/(wetenschap|onderzoek|studie|universiteit|klimaat|energie)/)) {
      return 'Wetenschap'
    } else if (text.match(/(technologie|ai|internet|app|software|tech|digitaal)/)) {
      return 'Technologie'
    } else if (text.match(/(feit|waarheid|nepnieuws|factcheck|bewijs|onderzoek)/)) {
      return 'Feiten'
    }
    
    return sourceCategory || 'Alles'
  }
  
  private calculateInitialQualityScore(item: any, source: EnhancedNewsSource): number {
    let score = 50 // Base score

    // Source credibility (most important factor)
    score += (source.credibility_score - 50) * 0.4

    // Metadata quality indicators
    if (item.title && item.title.length > 10 && item.title.length < 200) score += 15
    if (item.summary && item.summary.length > 50) score += 10
    if (item.creator || item.author) score += 10
    if (item.categories && item.categories.length > 0) score += 5
    if (item.guid) score += 5

    // Recency bonus
    const hoursOld = (Date.now() - new Date(item.pubDate || item.isoDate || new Date()).getTime()) / (1000 * 60 * 60)
    if (hoursOld < 2) score += 10
    else if (hoursOld < 6) score += 5

    return Math.max(0, Math.min(100, Math.round(score)))
  }
  
  private detectSentiment(text: string): number {
    // Simple Dutch sentiment analysis
    const positive = ['goed', 'positief', 'succes', 'winst', 'verbeterd', 'groei']
    const negative = ['slecht', 'negatief', 'verlies', 'daling', 'crisis', 'probleem']
    
    const words = text.toLowerCase().split(/\s+/)
    let score = 0
    
    words.forEach(word => {
      if (positive.some(p => word.includes(p))) score += 1
      if (negative.some(n => word.includes(n))) score -= 1
    })
    
    return Math.max(-1, Math.min(1, score / Math.max(words.length / 10, 1)))
  }
}

export const enhancedRSSCrawler = new EnhancedRSSCrawler()
export default EnhancedRSSCrawler