import { createClient } from './supabase/client'
import { enhancedRSSCrawler } from './enhanced-rss-crawler'

export interface CrossReferenceRule {
  trigger_source: string
  required_sources: string[]
  minimum_matches: number
  recheck_delay_hours: number
}

export interface CrossReferenceResult {
  cluster_id: string
  trigger_article: any
  matched_articles: any[]
  missing_sources: string[]
  cross_reference_score: number
  processing_recommendation: 'immediate' | 'delayed' | 'insufficient'
  recheck_scheduled_at?: string
}

export interface DelayedProcessingTask {
  cluster_id: string
  original_detection_time: string
  scheduled_recheck_time: string
  missing_sources: string[]
  attempt_count: number
  max_attempts: number
}

class CrossReferenceEngine {
  private supabase = createClient()
  
  // Jouw specificaties: NU.nl als trigger, check VK/NOS/Telegraaf
  private crossReferenceRules: CrossReferenceRule[] = [
    {
      trigger_source: 'nu.nl',
      required_sources: ['volkskrant.nl', 'nos.nl', 'telegraaf.nl'],
      minimum_matches: 2, // Van de 3 required sources, minimaal 2 moeten matchen
      recheck_delay_hours: 1
    }
  ]

  /**
   * Main cross-reference analysis volgens jouw workflow
   */
  async analyzeStoryCluster(clusterId: string): Promise<CrossReferenceResult> {
    console.log(`🔍 Analyzing cross-references for cluster: ${clusterId}`)

    // Get cluster with articles
    const cluster = await this.getClusterWithArticles(clusterId)
    if (!cluster) {
      throw new Error(`Cluster ${clusterId} not found`)
    }

    // Determine trigger source and rule
    const rule = this.determineApplicableRule(cluster)
    if (!rule) {
      console.log('No cross-reference rule applicable for this cluster')
      return this.createInsufficientResult(cluster)
    }

    // Find trigger article (NU.nl article that started this)
    const triggerArticle = cluster.articles.find((article: any) => 
      this.matchesSourcePattern(article.source_name, rule.trigger_source)
    )

    if (!triggerArticle) {
      console.log('No trigger article found for cross-reference analysis')
      return this.createInsufficientResult(cluster)
    }

    console.log(`📰 Trigger article: "${triggerArticle.title}" from ${triggerArticle.source_name}`)

    // Check for matches in required sources
    const matchAnalysis = await this.findCrossSourceMatches(cluster, rule, triggerArticle)

    // Determine processing recommendation
    const recommendation = this.determineProcessingRecommendation(matchAnalysis, rule)

    const result: CrossReferenceResult = {
      cluster_id: clusterId,
      trigger_article: triggerArticle,
      matched_articles: matchAnalysis.matched_articles,
      missing_sources: matchAnalysis.missing_sources,
      cross_reference_score: matchAnalysis.cross_reference_score,
      processing_recommendation: recommendation,
      recheck_scheduled_at: recommendation === 'delayed' 
        ? this.calculateRecheckTime(rule.recheck_delay_hours)
        : undefined
    }

    // Update cluster status based on recommendation
    await this.updateClusterStatus(clusterId, result)

    console.log(`✅ Cross-reference analysis complete: ${recommendation}`)
    return result
  }

  /**
   * Process delayed rechecks (run elke 15 minuten via cron)
   */
  async processDelayedRechecks(): Promise<{
    processed: number
    successful: number
    still_waiting: number
    exceeded_attempts: number
  }> {
    console.log('⏰ Processing delayed cross-reference rechecks...')

    const delayedClusters = await this.getDelayedProcessingClusters()
    
    const results = {
      processed: delayedClusters.length,
      successful: 0,
      still_waiting: 0,
      exceeded_attempts: 0
    }

    for (const cluster of delayedClusters) {
      try {
        // Re-crawl missing sources specifically
        await this.recheckMissingSources(cluster.id, cluster.sources_missing)

        // Re-analyze cluster
        const analysis = await this.analyzeStoryCluster(cluster.id)

        if (analysis.processing_recommendation === 'immediate') {
          results.successful++
          console.log(`✅ Cluster ${cluster.id} now ready for processing`)
        } else if (cluster.metadata?.attempt_count >= 3) {
          // Max attempts reached
          await this.markClusterAsExceededAttempts(cluster.id)
          results.exceeded_attempts++
          console.log(`⏸️ Cluster ${cluster.id} exceeded max recheck attempts`)
        } else {
          // Schedule another recheck
          await this.scheduleAnotherRecheck(cluster.id)
          results.still_waiting++
          console.log(`⏳ Cluster ${cluster.id} scheduled for another recheck`)
        }

      } catch (error) {
        console.error(`Error processing delayed cluster ${cluster.id}:`, error)
      }
    }

    console.log(`✅ Delayed processing complete:`, results)
    return results
  }

  /**
   * Find cross-source matches based on content similarity
   */
  private async findCrossSourceMatches(cluster: any, rule: CrossReferenceRule, triggerArticle: any) {
    const matched_articles = [triggerArticle] // Always include trigger
    const missing_sources = [...rule.required_sources] // Start with all required sources
    
    // Check each required source
    for (const requiredSource of rule.required_sources) {
      const matchingArticles = cluster.articles.filter((article: any) => {
        if (article.id === triggerArticle.id) return false // Skip trigger
        return this.matchesSourcePattern(article.source_name, requiredSource)
      })

      if (matchingArticles.length > 0) {
        // Found match(es) - pick best quality
        const bestMatch = this.selectBestQualityArticle(matchingArticles)
        matched_articles.push(bestMatch)
        
        // Remove from missing sources
        const index = missing_sources.indexOf(requiredSource)
        if (index > -1) {
          missing_sources.splice(index, 1)
        }
        
        console.log(`✅ Found match in ${requiredSource}: "${bestMatch.title}"`)
      } else {
        console.log(`❌ No match found in ${requiredSource}`)
      }
    }

    // Calculate cross-reference score
    const total_required = rule.required_sources.length
    const found_matches = total_required - missing_sources.length
    const cross_reference_score = found_matches / total_required

    return {
      matched_articles,
      missing_sources,
      cross_reference_score,
      total_sources: matched_articles.length
    }
  }

  /**
   * Recheck missing sources specifically for a cluster
   */
  private async recheckMissingSources(clusterId: string, missingSources: string[]) {
    console.log(`🔄 Rechecking missing sources for cluster ${clusterId}: ${missingSources.join(', ')}`)

    // Get enhanced sources for missing sources only
    const sources = await enhancedRSSCrawler.getEnhancedSources()
    const missingSourceObjects = sources.filter(source => 
      missingSources.some(pattern => this.matchesSourcePattern(source.name, pattern))
    )

    // Re-crawl only these sources
    for (const source of missingSourceObjects) {
      try {
        const articles = await enhancedRSSCrawler.parseEnhancedRSS(source)
        
        if (articles.length > 0) {
          // Check if any new articles match our cluster's keywords
          const cluster = await this.getClusterWithArticles(clusterId)
          const newMatchingArticles = this.findArticlesMatchingCluster(articles, cluster)
          
          if (newMatchingArticles.length > 0) {
            console.log(`🎯 Found ${newMatchingArticles.length} new matching articles from ${source.name}`)
            
            // Store new articles and link to cluster
            await this.storeAndLinkArticlesToCluster(newMatchingArticles, source, clusterId)
          }
        }
      } catch (error) {
        console.error(`Error rechecking source ${source.name}:`, error)
      }
    }
  }

  /**
   * Get cluster with associated articles
   */
  private async getClusterWithArticles(clusterId: string) {
    const { data: cluster, error: clusterError } = await this.supabase
      .from('story_clusters')
      .select('*')
      .eq('id', clusterId)
      .single()

    if (clusterError || !cluster) {
      return null
    }

    // Get articles that match this cluster's keywords and timeframe
    const { data: articles } = await this.supabase
      .from('raw_articles')
      .select(`
        *,
        news_sources (
          name,
          credibility_score,
          political_leaning,
          metadata
        )
      `)
      .gte('published_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
      .order('published_at', { ascending: false })

    if (!articles) return { ...cluster, articles: [] }

    // Filter articles that match cluster keywords
    const matchingArticles = articles.filter(article => 
      this.articleMatchesClusterKeywords(article, cluster.keywords)
    )

    return {
      ...cluster,
      articles: matchingArticles.map(article => ({
        ...article,
        source_name: article.news_sources?.name || 'Unknown'
      }))
    }
  }

  /**
   * Check if article matches cluster keywords (simple implementation)
   */
  private articleMatchesClusterKeywords(article: any, clusterKeywords: string[]): boolean {
    const articleText = (article.title + ' ' + (article.description || '')).toLowerCase()
    const matchCount = clusterKeywords.filter(keyword => 
      articleText.includes(keyword.toLowerCase())
    ).length
    
    // Require at least 30% keyword match
    return matchCount >= Math.ceil(clusterKeywords.length * 0.3)
  }

  /**
   * Determine applicable cross-reference rule
   */
  private determineApplicableRule(cluster: any): CrossReferenceRule | null {
    // Check if cluster has articles from trigger sources
    const hasNuArticle = cluster.articles.some((article: any) => 
      this.matchesSourcePattern(article.source_name, 'nu.nl')
    )

    if (hasNuArticle) {
      return this.crossReferenceRules[0] // NU.nl rule
    }

    return null // No applicable rule
  }

  /**
   * Check if source name matches pattern
   */
  private matchesSourcePattern(sourceName: string, pattern: string): boolean {
    const cleanSource = sourceName.toLowerCase()
    const cleanPattern = pattern.toLowerCase()
    
    // Flexible matching
    return cleanSource.includes(cleanPattern) || 
           cleanPattern.includes(cleanSource.split(' ')[0]) ||
           (cleanPattern === 'nu.nl' && cleanSource.includes('nu.nl')) ||
           (cleanPattern === 'volkskrant.nl' && cleanSource.includes('volkskrant')) ||
           (cleanPattern === 'nos.nl' && cleanSource.includes('nos')) ||
           (cleanPattern === 'telegraaf.nl' && cleanSource.includes('telegraaf'))
  }

  /**
   * Select best quality article from matches
   */
  private selectBestQualityArticle(articles: any[]): any {
    return articles.sort((a, b) => {
      const scoreA = a.quality_score || 50
      const scoreB = b.quality_score || 50
      return scoreB - scoreA // Highest quality first
    })[0]
  }

  /**
   * Determine processing recommendation based on matches
   */
  private determineProcessingRecommendation(
    matchAnalysis: any, 
    rule: CrossReferenceRule
  ): 'immediate' | 'delayed' | 'insufficient' {
    const foundSources = matchAnalysis.matched_articles.length - 1 // Exclude trigger
    
    if (foundSources >= rule.minimum_matches) {
      return 'immediate' // Genoeg matches voor directe processing
    } else if (foundSources >= 1) {
      return 'delayed' // Enkele matches, probeer later opnieuw
    } else {
      return 'insufficient' // Onvoldoende voor verwerking
    }
  }

  /**
   * Update cluster status based on analysis
   */
  private async updateClusterStatus(clusterId: string, result: CrossReferenceResult) {
    const updateData: any = {
      sources_found: result.matched_articles.map(a => a.source_name),
      sources_missing: result.missing_sources,
      updated_at: new Date().toISOString()
    }

    switch (result.processing_recommendation) {
      case 'immediate':
        updateData.processing_status = 'analyzing'
        break
      case 'delayed':
        updateData.processing_status = 'detecting'
        updateData.recheck_scheduled_at = result.recheck_scheduled_at
        updateData.metadata = {
          cross_reference_score: result.cross_reference_score,
          attempt_count: 1,
          last_recheck: new Date().toISOString()
        }
        break
      case 'insufficient':
        updateData.processing_status = 'failed'
        break
    }

    await this.supabase
      .from('story_clusters')
      .update(updateData)
      .eq('id', clusterId)
  }

  /**
   * Helper methods
   */
  private createInsufficientResult(cluster: any): CrossReferenceResult {
    return {
      cluster_id: cluster.id,
      trigger_article: null,
      matched_articles: [],
      missing_sources: [],
      cross_reference_score: 0,
      processing_recommendation: 'insufficient'
    }
  }

  private calculateRecheckTime(delayHours: number): string {
    return new Date(Date.now() + delayHours * 60 * 60 * 1000).toISOString()
  }

  private async getDelayedProcessingClusters() {
    const { data } = await this.supabase
      .from('story_clusters')
      .select('*')
      .eq('processing_status', 'detecting')
      .not('recheck_scheduled_at', 'is', null)
      .lte('recheck_scheduled_at', new Date().toISOString())

    return data || []
  }

  private findArticlesMatchingCluster(articles: any[], cluster: any) {
    return articles.filter(article => 
      this.articleMatchesClusterKeywords(article, cluster.keywords)
    )
  }

  private async storeAndLinkArticlesToCluster(articles: any[], source: any, clusterId: string) {
    // Store articles normally
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
      quality_score: 75, // Default quality for recheck articles
      metadata: {
        source_tier: source.tier,
        linked_cluster_id: clusterId,
        found_via_recheck: true
      }
    }))

    await this.supabase
      .from('raw_articles')
      .upsert(articlesToInsert, { 
        onConflict: 'source_id,url',
        ignoreDuplicates: true 
      })
  }

  private async markClusterAsExceededAttempts(clusterId: string) {
    await this.supabase
      .from('story_clusters')
      .update({
        processing_status: 'failed',
        metadata: { 
          failure_reason: 'exceeded_max_recheck_attempts',
          final_attempt_at: new Date().toISOString()
        }
      })
      .eq('id', clusterId)
  }

  private async scheduleAnotherRecheck(clusterId: string) {
    const nextRecheck = this.calculateRecheckTime(1) // 1 hour from now
    
    const { data: cluster } = await this.supabase
      .from('story_clusters')
      .select('metadata')
      .eq('id', clusterId)
      .single()

    const currentAttempts = cluster?.metadata?.attempt_count || 1

    await this.supabase
      .from('story_clusters')
      .update({
        recheck_scheduled_at: nextRecheck,
        metadata: {
          ...cluster?.metadata,
          attempt_count: currentAttempts + 1,
          last_recheck: new Date().toISOString()
        }
      })
      .eq('id', clusterId)
  }
}

export const crossReferenceEngine = new CrossReferenceEngine()
export default CrossReferenceEngine