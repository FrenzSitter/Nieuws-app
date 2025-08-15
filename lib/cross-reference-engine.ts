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
   * Main cross-reference analysis for topic clusters using new schema
   */
  async analyzeTopicCluster(clusterId: string): Promise<CrossReferenceResult> {
    console.log(`🔍 Analyzing cross-references for topic cluster: ${clusterId}`)

    // Get cluster with articles using new schema
    const cluster = await this.getTopicClusterWithArticles(clusterId)
    if (!cluster) {
      throw new Error(`Topic cluster ${clusterId} not found`)
    }

    // Determine trigger source and rule
    const rule = this.determineApplicableRule(cluster)
    if (!rule) {
      console.log('No cross-reference rule applicable for this cluster')
      return this.createInsufficientResult(cluster)
    }

    // Find trigger article (NU.nl article that started this)
    const triggerArticle = cluster.articles.find((article: any) => 
      this.matchesSourcePattern(article.source_name || article.news_sources?.name, rule.trigger_source)
    )

    if (!triggerArticle) {
      console.log('No trigger article found for cross-reference analysis')
      return this.createInsufficientResult(cluster)
    }

    console.log(`📰 Trigger article: "${triggerArticle.title}" from ${triggerArticle.source_name || triggerArticle.news_sources?.name}`)

    // Check for matches in required sources
    const matchAnalysis = await this.findCrossSourceMatches(cluster, rule, triggerArticle)

    // Determine processing recommendation based on Nonbulla concept
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
    await this.updateTopicClusterStatus(clusterId, result)

    console.log(`✅ Cross-reference analysis complete: ${recommendation}`)
    return result
  }
  
  // Keep backward compatibility
  async analyzeStoryCluster(clusterId: string): Promise<CrossReferenceResult> {
    return this.analyzeTopicCluster(clusterId)
  }

  /**
   * Process delayed rechecks for topic clusters (run elke 15 minuten via cron)
   */
  async processDelayedRechecks(): Promise<{
    processed: number
    successful: number
    still_waiting: number
    exceeded_attempts: number
  }> {
    console.log('⏰ Processing delayed cross-reference rechecks for topic clusters...')

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
        const missingSourceIds = cluster.metadata?.sources_missing || []
        await this.recheckMissingSources(cluster.id, missingSourceIds)

        // Re-analyze cluster using new method
        const analysis = await this.analyzeTopicCluster(cluster.id)

        if (analysis.processing_recommendation === 'immediate') {
          results.successful++
          console.log(`✅ Topic cluster ${cluster.id} now ready for AI synthesis`)
        } else if (cluster.metadata?.attempt_count >= 3) {
          // Max attempts reached - mark as ready with limited sources
          await this.markClusterAsReadyWithLimitedSources(cluster.id)
          results.exceeded_attempts++
          console.log(`⚠️ Topic cluster ${cluster.id} proceeding with limited sources`)
        } else {
          // Schedule another recheck
          await this.scheduleAnotherRecheck(cluster.id)
          results.still_waiting++
          console.log(`⏳ Topic cluster ${cluster.id} scheduled for another recheck`)
        }

      } catch (error) {
        console.error(`Error processing delayed topic cluster ${cluster.id}:`, error)
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
   * Get topic cluster with associated articles using new database schema
   */
  private async getTopicClusterWithArticles(clusterId: string) {
    const { data: cluster, error: clusterError } = await this.supabase
      .from('topic_clusters')
      .select('*')
      .eq('id', clusterId)
      .single()

    if (clusterError || !cluster) {
      return null
    }

    // Get articles linked to this cluster via cluster_articles junction table
    const { data: clusterArticles } = await this.supabase
      .from('cluster_articles')
      .select(`
        relevance_score,
        is_primary,
        raw_articles!inner (
          *,
          news_sources!inner (
            name,
            credibility_score,
            political_leaning,
            metadata
          )
        )
      `)
      .eq('cluster_id', clusterId)
      .order('relevance_score', { ascending: false })

    const articles = clusterArticles?.map(ca => ({
      ...ca.raw_articles,
      relevance_score: ca.relevance_score,
      is_primary: ca.is_primary,
      source_name: ca.raw_articles.news_sources?.name || 'Unknown'
    })) || []

    return {
      ...cluster,
      articles
    }
  }
  
  // Keep backward compatibility
  private async getClusterWithArticles(clusterId: string) {
    return this.getTopicClusterWithArticles(clusterId)
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
   * Update topic cluster status based on cross-reference analysis
   */
  private async updateTopicClusterStatus(clusterId: string, result: CrossReferenceResult) {
    const now = new Date().toISOString()
    const updateData: any = {
      updated_at: now
    }

    // Update metadata with cross-reference results
    const currentCluster = await this.supabase
      .from('topic_clusters')
      .select('metadata')
      .eq('id', clusterId)
      .single()

    const existingMetadata = currentCluster.data?.metadata || {}
    
    switch (result.processing_recommendation) {
      case 'immediate':
        updateData.status = 'ready_for_ai'
        updateData.metadata = {
          ...existingMetadata,
          cross_reference: {
            sources_found: result.matched_articles.map(a => a.source_name || a.news_sources?.name),
            sources_missing: result.missing_sources,
            cross_reference_score: result.cross_reference_score,
            analysis_completed_at: now,
            ready_for_synthesis: true
          }
        }
        break
      case 'delayed':
        updateData.status = 'analyzing' // Keep analyzing status
        updateData.metadata = {
          ...existingMetadata,
          cross_reference: {
            sources_found: result.matched_articles.map(a => a.source_name || a.news_sources?.name),
            sources_missing: result.missing_sources,
            cross_reference_score: result.cross_reference_score,
            attempt_count: (existingMetadata.cross_reference?.attempt_count || 0) + 1,
            last_recheck: now,
            next_recheck_at: result.recheck_scheduled_at,
            ready_for_synthesis: false
          }
        }
        break
      case 'insufficient':
        // Don't mark as failed immediately - allow limited source processing
        updateData.status = 'ready_for_ai'
        updateData.metadata = {
          ...existingMetadata,
          cross_reference: {
            sources_found: result.matched_articles.map(a => a.source_name || a.news_sources?.name),
            sources_missing: result.missing_sources,
            cross_reference_score: result.cross_reference_score,
            insufficient_sources: true,
            ready_for_synthesis: result.matched_articles.length >= 2, // Need at least 2 for perspective
            analysis_completed_at: now
          }
        }
        break
    }

    await this.supabase
      .from('topic_clusters')
      .update(updateData)
      .eq('id', clusterId)
  }
  
  // Keep backward compatibility
  private async updateClusterStatus(clusterId: string, result: CrossReferenceResult) {
    return this.updateTopicClusterStatus(clusterId, result)
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
      .from('topic_clusters')
      .select('*')
      .eq('status', 'analyzing')
      .not('metadata->cross_reference->next_recheck_at', 'is', null)

    // Filter clusters where recheck time has passed
    const now = new Date().toISOString()
    const readyForRecheck = data?.filter(cluster => {
      const nextRecheck = cluster.metadata?.cross_reference?.next_recheck_at
      return nextRecheck && nextRecheck <= now
    }) || []

    return readyForRecheck
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

  private async markClusterAsReadyWithLimitedSources(clusterId: string) {
    // In Nonbulla concept, we don't fail clusters - we process them with available sources
    const now = new Date().toISOString()
    
    const { data: cluster } = await this.supabase
      .from('topic_clusters')
      .select('metadata')
      .eq('id', clusterId)
      .single()

    const existingMetadata = cluster?.metadata || {}
    
    await this.supabase
      .from('topic_clusters')
      .update({
        status: 'ready_for_ai',
        metadata: { 
          ...existingMetadata,
          cross_reference: {
            ...existingMetadata.cross_reference,
            limited_sources: true,
            max_attempts_reached: true,
            ready_for_synthesis: true,
            final_attempt_at: now,
            synthesis_note: 'Proceeding with available sources for multi-perspective analysis'
          }
        }
      })
      .eq('id', clusterId)
  }
  
  // Keep backward compatibility  
  private async markClusterAsExceededAttempts(clusterId: string) {
    return this.markClusterAsReadyWithLimitedSources(clusterId)
  }

  private async scheduleAnotherRecheck(clusterId: string) {
    const nextRecheck = this.calculateRecheckTime(1) // 1 hour from now
    
    const { data: cluster } = await this.supabase
      .from('topic_clusters')
      .select('metadata')
      .eq('id', clusterId)
      .single()

    const existingMetadata = cluster?.metadata || {}
    const currentAttempts = existingMetadata.cross_reference?.attempt_count || 1

    await this.supabase
      .from('topic_clusters')
      .update({
        metadata: {
          ...existingMetadata,
          cross_reference: {
            ...existingMetadata.cross_reference,
            attempt_count: currentAttempts + 1,
            last_recheck: new Date().toISOString(),
            next_recheck_at: nextRecheck
          }
        }
      })
      .eq('id', clusterId)
  }
}

export const crossReferenceEngine = new CrossReferenceEngine()
export default CrossReferenceEngine