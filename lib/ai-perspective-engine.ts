import { createClient } from './supabase/client'

export interface SourcePerspective {
  source_name: string
  source_url: string
  original_title: string
  key_angle: string
  unique_details: string[]
  sentiment_score: number
  political_leaning_detected: string
  credibility_assessment: number
  perspective_summary: string
  quote_extracts: string[]
  emphasis_areas: string[]
}

export interface SourceChip {
  id: string
  label: string
  source_name: string
  article_url: string
  credibility_score: number
  political_leaning: string
  chip_color: string
  position_in_text: number[]
}

export interface SynthesizedArticle {
  title: string
  summary: string
  full_content: string
  key_points: string[]
  different_perspectives: string[]
  political_balance: {
    left_perspective: string
    center_perspective: string  
    right_perspective: string
    factual_core: string[]
  }
  source_chips: SourceChip[]
  surprise_ending: string
  notebooklm_summary: string
  source_perspectives_summary: SourcePerspective[]
  quality_indicators: {
    source_diversity: number
    credibility_score: number
    fact_check_status: 'verified' | 'needs_review' | 'disputed'
    bias_balance_score: number
  }
  metadata: {
    cluster_id: string
    total_sources: number
    source_count: number
    total_source_articles: number
    processing_time_ms: number
    ai_model_used: string
    confidence_score: number
    synthesis_method: 'multi_perspective_ai'
    geographic_coverage: string[]
    publish_status: 'draft' | 'review' | 'published'
  }
}

class AIPerspectiveEngine {
  private supabase = createClient()
  
  // OpenAI API configuration (you'll need to set OPENAI_API_KEY in env)
  private openaiApiKey = process.env.OPENAI_API_KEY
  private openaiModel = 'gpt-4o' // Latest model for best analysis

  /**
   * Main method - synthesize multi-perspective article from topic cluster
   * Focuses on breaking filter bubbles by showing all perspectives
   */
  async generateSynthesizedArticle(clusterId: string): Promise<SynthesizedArticle> {
    console.log(`🧠 Starting AI multi-perspective synthesis for cluster: ${clusterId}`)
    const startTime = Date.now()

    // Get cluster with articles from cross-referenced sources
    const cluster = await this.getTopicClusterWithArticles(clusterId)
    if (!cluster || cluster.articles.length < 2) {
      throw new Error(`Cluster ${clusterId} not ready for synthesis - need at least 2 sources`)
    }

    console.log(`📰 Synthesizing ${cluster.articles.length} articles from different perspectives`)

    // Step 1: Analyze each source's unique perspective  
    const sourcePerspectives = await this.analyzeSourcePerspectives(cluster.articles)
    
    // Step 2: Generate multi-perspective content breaking filter bubbles
    const synthesizedContent = await this.generateMultiPerspectiveContent(cluster, sourcePerspectives)
    
    // Step 3: Create source chips for transparency
    const sourceChips = this.generateSourceChips(sourcePerspectives, synthesizedContent.full_content)
    
    // Step 4: Generate "om-denken" surprise ending
    const surpriseEnding = await this.generateSurpriseEnding(cluster, sourcePerspectives)
    
    // Step 5: Create NotebookLM extended summary for podcast
    const notebooklmSummary = await this.generateNotebookLMSummary(cluster, sourcePerspectives, synthesizedContent)

    const processingTime = Date.now() - startTime

    const result: SynthesizedArticle = {
      title: synthesizedContent.title,
      summary: synthesizedContent.summary,
      full_content: synthesizedContent.full_content,
      key_points: synthesizedContent.key_points,
      different_perspectives: synthesizedContent.different_perspectives,
      political_balance: synthesizedContent.political_balance,
      source_chips: sourceChips,
      surprise_ending: surpriseEnding,
      notebooklm_summary: notebooklmSummary,
      source_perspectives_summary: sourcePerspectives,
      quality_indicators: {
        source_diversity: this.calculateSourceDiversity(sourcePerspectives),
        credibility_score: this.calculateCredibilityScore(sourcePerspectives),
        fact_check_status: this.determineFactCheckStatus(sourcePerspectives),
        bias_balance_score: this.calculateBiasBalance(sourcePerspectives)
      },
      metadata: {
        cluster_id: clusterId,
        total_sources: cluster.articles.length,
        source_count: new Set(cluster.articles.map(a => a.source_id)).size,
        total_source_articles: cluster.articles.length,
        processing_time_ms: processingTime,
        ai_model_used: this.openaiModel,
        confidence_score: this.calculateConfidenceScore(sourcePerspectives),
        synthesis_method: 'multi_perspective_ai',
        geographic_coverage: this.extractGeographicCoverage(cluster, sourcePerspectives),
        publish_status: 'draft'
      }
    }

    // Store in database using new schema
    await this.storeSynthesizedArticle(clusterId, result)

    console.log(`✅ Multi-perspective article synthesized in ${processingTime}ms`)
    return result
  }

  /**
   * Analyze each source's unique perspective
   */
  private async analyzeSourcePerspectives(articles: any[]): Promise<SourcePerspective[]> {
    console.log('🔍 Analyzing source perspectives...')
    
    const perspectives: SourcePerspective[] = []
    
    for (const article of articles) {
      try {
        const perspective = await this.analyzeSingleSourcePerspective(article, articles)
        perspectives.push(perspective)
      } catch (error) {
        console.error(`Error analyzing perspective for ${article.source_name}:`, error)
      }
    }

    return perspectives
  }

  /**
   * Analyze single source's perspective using AI
   */
  private async analyzeSingleSourcePerspective(article: any, allArticles: any[]): Promise<SourcePerspective> {
    const otherArticles = allArticles.filter(a => a.id !== article.id)
    
    const prompt = this.buildPerspectiveAnalysisPrompt(article, otherArticles)
    
    const analysis = await this.callOpenAI(prompt, 'perspective-analysis')
    
    return {
      source_name: article.source_name || article.news_sources?.name,
      source_url: article.url,
      original_title: article.title,
      key_angle: analysis.key_angle || 'Algemene nieuwsrapportage',
      unique_details: analysis.unique_details || [],
      sentiment_score: analysis.sentiment_score || 0,
      political_leaning_detected: analysis.political_leaning || article.news_sources?.political_leaning || 'center',
      credibility_assessment: article.news_sources?.credibility_score || 75,
      perspective_summary: analysis.perspective_summary || '',
      quote_extracts: analysis.quote_extracts || [],
      emphasis_areas: analysis.emphasis_areas || []
    }
  }

  /**
   * Generate multi-perspective content that breaks filter bubbles
   */
  private async generateMultiPerspectiveContent(cluster: any, perspectives: SourcePerspective[]): Promise<{
    title: string
    summary: string
    full_content: string
    key_points: string[]
    different_perspectives: string[]
    political_balance: any
  }> {
    console.log('✍️ Generating multi-perspective content to break filter bubbles...')
    
    const prompt = this.buildMultiPerspectivePrompt(cluster, perspectives)
    const result = await this.callOpenAI(prompt, 'multi-perspective-synthesis')
    
    return {
      title: result.title || cluster.title,
      summary: result.summary || '',
      full_content: result.full_content || '',
      key_points: result.key_points || [],
      different_perspectives: result.different_perspectives || [],
      political_balance: {
        left_perspective: result.political_balance?.left_perspective || '',
        center_perspective: result.political_balance?.center_perspective || '',
        right_perspective: result.political_balance?.right_perspective || '',
        factual_core: result.political_balance?.factual_core || []
      }
    }
  }

  /**
   * Generate source chips for inline references (Material Design style)
   */
  private generateSourceChips(perspectives: SourcePerspective[], content: string): SourceChip[] {
    const chips: SourceChip[] = []
    
    perspectives.forEach((perspective, index) => {
      const sourceName = this.getShortSourceName(perspective.source_name)
      const chipColor = this.getSourceChipColor(perspective.political_leaning_detected)
      
      // Find positions in text where this source should be referenced
      const positions = this.findSourceReferencePositions(content, perspective, sourceName)
      
      chips.push({
        id: `chip-${index}`,
        label: sourceName,
        source_name: perspective.source_name,
        article_url: perspective.source_url,
        credibility_score: perspective.credibility_assessment,
        political_leaning: perspective.political_leaning_detected,
        chip_color: chipColor,
        position_in_text: positions
      })
    })

    return chips
  }

  /**
   * Generate surprising "om-denken" ending
   */
  private async generateSurpriseEnding(cluster: any, perspectives: SourcePerspective[]): Promise<string> {
    console.log('🎭 Generating "om-denken" surprise ending...')
    
    const prompt = this.buildSurpriseEndingPrompt(cluster, perspectives)
    const result = await this.callOpenAI(prompt, 'surprise-ending')
    
    return result.surprise_ending || 'Dit verhaal laat zien hoe verschillende perspectieven tot een rijker begrip van de werkelijkheid leiden.'
  }

  /**
   * Generate extended summary for NotebookLM
   */
  private async generateNotebookLMSummary(cluster: any, perspectives: SourcePerspective[], unifiedContent: any): Promise<string> {
    console.log('📝 Generating NotebookLM extended summary...')
    
    const prompt = this.buildNotebookLMPrompt(cluster, perspectives, unifiedContent)
    const result = await this.callOpenAI(prompt, 'notebooklm-summary')
    
    return result.extended_summary || ''
  }

  /**
   * Build perspective analysis prompt
   */
  private buildPerspectiveAnalysisPrompt(article: any, otherArticles: any[]): string {
    return `
Je bent een Nederlandse nieuwsanalyst die de unieke invalshoek van nieuwsbronnen analyseert.

ARTIKEL OM TE ANALYSEREN:
Bron: ${article.source_name || article.news_sources?.name}
Titel: ${article.title}
Inhoud: ${article.content || article.description}

ANDERE ARTIKELEN OVER HETZELFDE ONDERWERP:
${otherArticles.map(a => `
- ${a.source_name || a.news_sources?.name}: "${a.title}"
  ${(a.content || a.description)?.substring(0, 300)}...
`).join('\n')}

ANALYSEER:
1. Wat is de unieke invalshoek van deze bron?
2. Welke details noemt deze bron die anderen niet noemen?
3. Wat is de sentimentscore (-1.0 tot 1.0)?
4. Welke politieke leaning is detecteerbaar?
5. Wat zijn de belangrijkste citaten/quotes?
6. Op welke aspecten legt deze bron de nadruk?

Antwoord in JSON format:
{
  "key_angle": "Unieke invalshoek van deze bron",
  "unique_details": ["detail1", "detail2", "detail3"],
  "sentiment_score": 0.0,
  "political_leaning": "center/left/right/center-left/center-right",
  "perspective_summary": "Korte samenvatting van de bron's perspectief",
  "quote_extracts": ["quote1", "quote2"],
  "emphasis_areas": ["aspect1", "aspect2", "aspect3"]
}
`
  }

  /**
   * Build multi-perspective content prompt focused on breaking filter bubbles
   */
  private buildMultiPerspectivePrompt(cluster: any, perspectives: SourcePerspective[]): string {
    return `
Je bent een expert Nederlandse journalist die werkt voor Nonbulla - het platform dat nieuwsbubbels doorbreekt door alle perspectieven te tonen.

JOUW MISSIE: Schrijf een artikel dat lezers uit hun filterbubbel haalt door ALLE kanten van het verhaal te belichten.

ONDERWERP: ${cluster.title}
CATEGORIE: ${cluster.metadata?.nonbulla_category || 'Alles'}
KEYWORDS: ${cluster.keywords?.join(', ')}
TIJDSPERIODE: ${cluster.time_period_start} tot ${cluster.time_period_end}

PERSPECTIEVEN VAN VERSCHILLENDE BRONNEN:
${perspectives.map(p => `
🔹 ${p.source_name} (${p.political_leaning_detected}, credibiliteit: ${p.credibility_assessment}%):
   Unieke invalshoek: ${p.key_angle}
   Specifieke details: ${p.unique_details.join(', ')}
   Standpunt samenvatting: ${p.perspective_summary}
   Belangrijke citaten: ${p.quote_extracts.join(' | ')}
   Nadruk gebieden: ${p.emphasis_areas.join(', ')}
`).join('\n')}

SCHRIJF EEN MULTI-PERSPECTIEF ARTIKEL DAT:
1. EXPLICIET alle verschillende standpunten presenteert
2. Laat zien waar bronnen het eens én oneens zijn
3. Politieke nuances respecteert zonder partij te kiezen
4. Feiten scheidt van interpretaties
5. De lezer uitnodigt om zelf na te denken
6. 600-800 woorden, toegankelijk voor alle Nederlanders
7. Transparant is over bronnen en hun achtergrond

INCLUDEER:
- Korte samenvatting (2-3 zinnen)
- Kernpunten die iedereen erkent
- Verschillende interpretaties per politiek spectrum
- Wat elke kant goed/belangrijk vindt
- Waarom dit verhaal belangrijk is voor Nederland

Antwoord in JSON format:
{
  "title": "Neutrale titel die de kern weergeeft",
  "summary": "2-3 zinnen kernpunt samenvatting",
  "full_content": "Volledige artikel met alle perspectieven",
  "key_points": ["kernpunt1", "kernpunt2", "kernpunt3"],
  "different_perspectives": ["perspectief1", "perspectief2", "perspectief3"],
  "political_balance": {
    "left_perspective": "Wat linkse bronnen benadrukken",
    "center_perspective": "Wat centristische bronnen zeggen", 
    "right_perspective": "Wat rechtse bronnen benadrukken",
    "factual_core": ["feit1", "feit2", "feit3"]
  }
}
`
  }

  /**
   * Build surprise ending prompt
   */
  private buildSurpriseEndingPrompt(cluster: any, perspectives: SourcePerspective[]): string {
    return `
Je bent een creatieve Nederlandse journalist die verrassende "om-denken" eindes schrijft voor nieuwsartikelen.

ONDERWERP: ${cluster.primary_topic}

VERSCHILLENDE PERSPECTIVEN:
${perspectives.map(p => `- ${p.source_name}: ${p.key_angle}`).join('\n')}

Schrijf een verrassende, tot nadenken stemmende afsluiting van 1-2 zinnen die:
1. De lezer laat stilstaan bij een onverwachte invalshoek
2. Neutraal blijft - geen partij kiest
3. Een bredere context of diepere betekenis suggereert
4. De lezer verrast met een nieuwe gedachte
5. Past bij het Nederlandse nieuwslandschap

Voorbeelden van goede "om-denken" afsluitingen:
- "Misschien zegt de manier waarop we over dit onderwerp praten meer over onszelf dan over het onderwerp zelf."
- "In een tijd van snelle oordelen blijkt de waarheid vaak te vinden in wat er niet wordt gezegd."
- "Terwijl iedereen naar links of rechts kijkt, speelt het echte verhaal zich mogelijk recht voor onze neus af."

Antwoord in JSON format:
{
  "surprise_ending": "Jouw verrassende 1-2 zin afsluiting"
}
`
  }

  /**
   * Build NotebookLM summary prompt
   */
  private buildNotebookLMPrompt(cluster: any, perspectives: SourcePerspective[], unifiedContent: any): string {
    return `
Je maakt een uitgebreide samenvatting voor NotebookLM dat dagelijks podcasts maakt over Nederlands nieuws.

ARTIKEL INFORMATIE:
Onderwerp: ${cluster.primary_topic}
Titel: ${unifiedContent.title}
Aantal bronnen: ${perspectives.length}

PERSPECTIVEN ANALYSE:
${perspectives.map(p => `
- ${p.source_name}: ${p.perspective_summary}
  Nadruk op: ${p.emphasis_areas.join(', ')}
`).join('\n')}

UNIFIED ARTIKEL:
${unifiedContent.content}

Maak een uitgebreide samenvatting (300-500 woorden) die:
1. De kern van het verhaal uitlegt
2. De verschillende perspectieven benoemt
3. Context geeft over waarom dit belangrijk is
4. Interessante achtergrond informatie bevat
5. Geschikt is voor een Nederlandse nieuws podcast
6. Vermeld welke bronnen welke standpunten innemen

Antwoord in JSON format:
{
  "extended_summary": "Uitgebreide podcast-ready samenvatting"
}
`
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(prompt: string, operation: string): Promise<any> {
    if (!this.openaiApiKey) {
      throw new Error('OpenAI API key not configured')
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify({
          model: this.openaiModel,
          messages: [
            {
              role: 'system',
              content: 'Je bent een expert Nederlandse nieuwsanalyst en journalist die gespecialiseerd is in multi-perspectief nieuwsanalyse. Je antwoordt altijd in correct JSON format.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const result = await response.json()
      const content = result.choices[0]?.message?.content

      try {
        return JSON.parse(content)
      } catch (parseError) {
        console.error(`JSON parse error for ${operation}:`, parseError)
        console.error('Raw content:', content)
        throw new Error(`Invalid JSON response from AI for ${operation}`)
      }

    } catch (error) {
      console.error(`OpenAI API call failed for ${operation}:`, error)
      throw error
    }
  }

  /**
   * Helper methods for new database schema
   */
  private async getTopicClusterWithArticles(clusterId: string) {
    const { data: cluster } = await this.supabase
      .from('topic_clusters')
      .select('*')
      .eq('id', clusterId)
      .in('status', ['analyzing', 'ready_for_ai'])
      .single()

    if (!cluster) return null

    // Get articles linked to this cluster
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
      source_name: ca.raw_articles.news_sources?.name,
      source_credibility: ca.raw_articles.news_sources?.credibility_score,
      source_political_leaning: ca.raw_articles.news_sources?.political_leaning
    })) || []

    return {
      ...cluster,
      articles
    }
  }

  private getShortSourceName(fullName: string): string {
    const nameMap: { [key: string]: string } = {
      'NU.nl Algemeen': 'NU.nl',
      'De Volkskrant Voorpagina': 'Volkskrant',
      'De Volkskrant Achtergrond': 'Volkskrant',
      'NOS Journaal': 'NOS',
      'NOS Nieuwsuur': 'NOS',
      'De Telegraaf RSS': 'Telegraaf',
      'De Telegraaf Binnenland': 'Telegraaf',
      'RTL Nieuws': 'RTL'
    }
    return nameMap[fullName] || fullName.split(' ')[0]
  }

  private getSourceChipColor(politicalLeaning: string): string {
    const colorMap: { [key: string]: string } = {
      'left': '#e3f2fd',           // Light blue
      'center-left': '#f3e5f5',   // Light purple  
      'center': '#f5f5f5',        // Light gray
      'center-right': '#fff3e0',  // Light orange
      'right': '#ffebee'          // Light red
    }
    return colorMap[politicalLeaning] || '#f5f5f5'
  }

  private findSourceReferencePositions(content: string, perspective: SourcePerspective, sourceName: string): number[] {
    // Simple implementation - find where source-specific info appears
    const positions: number[] = []
    
    perspective.unique_details.forEach(detail => {
      const index = content.toLowerCase().indexOf(detail.toLowerCase())
      if (index !== -1) {
        positions.push(index)
      }
    })

    return positions
  }

  // Enhanced quality and diversity metrics for filter bubble breaking
  
  private calculateSourceDiversity(perspectives: SourcePerspective[]): number {
    const leanings = new Set(perspectives.map(p => p.political_leaning_detected))
    const sources = new Set(perspectives.map(p => p.source_name))
    
    return Math.min(1, (leanings.size / 3) * 0.6 + (sources.size / perspectives.length) * 0.4)
  }
  
  private calculateCredibilityScore(perspectives: SourcePerspective[]): number {
    const avgCredibility = perspectives.reduce((sum, p) => sum + p.credibility_assessment, 0) / perspectives.length
    return avgCredibility / 100
  }
  
  private determineFactCheckStatus(perspectives: SourcePerspective[]): 'verified' | 'needs_review' | 'disputed' {
    const avgCredibility = this.calculateCredibilityScore(perspectives) * 100
    const sourceDiversity = this.calculateSourceDiversity(perspectives)
    
    if (avgCredibility > 80 && sourceDiversity > 0.7) return 'verified'
    if (avgCredibility > 60 && sourceDiversity > 0.5) return 'needs_review'
    return 'disputed'
  }
  
  private calculateBiasBalance(perspectives: SourcePerspective[]): number {
    const leanings = perspectives.map(p => p.political_leaning_detected)
    const leftCount = leanings.filter(l => l.includes('left')).length
    const rightCount = leanings.filter(l => l.includes('right')).length
    const centerCount = leanings.filter(l => l === 'center').length
    
    const total = perspectives.length
    const balance = 1 - Math.abs(leftCount - rightCount) / total
    const centerBonus = centerCount / total * 0.2
    
    return Math.min(1, balance + centerBonus)
  }
  
  private calculateConfidenceScore(perspectives: SourcePerspective[]): number {
    if (perspectives.length === 0) return 0
    
    const credibilityScore = this.calculateCredibilityScore(perspectives)
    const diversityScore = this.calculateSourceDiversity(perspectives)
    const biasBalance = this.calculateBiasBalance(perspectives)
    
    return credibilityScore * 0.4 + diversityScore * 0.4 + biasBalance * 0.2
  }
  
  private extractGeographicCoverage(cluster: any, perspectives: SourcePerspective[]): string[] {
    const coverage = ['Nederland'] // Default
    
    const allText = perspectives.map(p => 
      p.perspective_summary + ' ' + p.unique_details.join(' ')
    ).join(' ').toLowerCase()
    
    if (allText.includes('europa') || allText.includes('eu')) coverage.push('Europa')
    if (allText.includes('wereldwijd') || allText.includes('international')) coverage.push('Wereldwijd')
    if (allText.includes('amerika') || allText.includes('vs')) coverage.push('Noord-Amerika')
    
    return coverage
  }
  
  private mapPoliticalLeaningToStance(leaning: string): string {
    const mapping: { [key: string]: string } = {
      'left': 'progressief',
      'center-left': 'centrum-progressief',
      'center': 'neutraal',
      'center-right': 'centrum-conservatief', 
      'right': 'conservatief'
    }
    return mapping[leaning] || 'onbekend'
  }

  private async storeSynthesizedArticle(clusterId: string, article: SynthesizedArticle) {
    try {
      // Store synthesized article using new schema
      const { data: synthesizedArticle, error: articleError } = await this.supabase
        .from('synthesized_articles')
        .insert({
          cluster_id: clusterId,
          title: article.title,
          summary: article.summary,
          full_content: article.full_content,
          key_points: article.key_points,
          different_perspectives: article.different_perspectives,
          political_balance: article.political_balance,
          source_count: article.metadata.source_count,
          total_source_articles: article.metadata.total_source_articles,
          credibility_score: article.quality_indicators.credibility_score,
          fact_check_status: article.quality_indicators.fact_check_status,
          geographic_coverage: article.metadata.geographic_coverage,
          synthesis_method: article.metadata.synthesis_method,
          publish_status: article.metadata.publish_status,
          quality_indicators: article.quality_indicators,
          metadata: {
            ai_model_used: article.metadata.ai_model_used,
            processing_time_ms: article.metadata.processing_time_ms,
            confidence_score: article.metadata.confidence_score,
            source_chips: article.source_chips,
            surprise_ending: article.surprise_ending,
            notebooklm_summary: article.notebooklm_summary
          }
        })
        .select()
        .single()

      if (articleError) throw articleError

      // Store source perspectives with enhanced metadata
      for (const perspective of article.source_perspectives_summary) {
        // Find the corresponding article ID
        const { data: sourceArticle } = await this.supabase
          .from('raw_articles')
          .select('id, source_id')
          .eq('url', perspective.source_url)
          .single()

        if (sourceArticle) {
          await this.supabase
            .from('source_perspectives')
            .insert({
              cluster_id: clusterId,
              article_id: sourceArticle.id,
              source_id: sourceArticle.source_id,
              perspective_summary: perspective.perspective_summary,
              key_quotes: perspective.quote_extracts,
              unique_angles: perspective.unique_details,
              emphasis_topics: perspective.emphasis_areas,
              stance: this.mapPoliticalLeaningToStance(perspective.political_leaning_detected),
              source_credibility_weight: perspective.credibility_assessment / 100,
              relevance_score: 0.8, // Default high relevance for synthesized articles
              bias_indicators: {
                political_leaning: perspective.political_leaning_detected,
                sentiment_score: perspective.sentiment_score,
                key_angle: perspective.key_angle
              }
            })
        }
      }

      // Update cluster status to synthesized
      await this.supabase
        .from('topic_clusters')
        .update({ 
          status: 'synthesized',
          metadata: {
            synthesized_article_id: synthesizedArticle.id,
            synthesis_completed_at: new Date().toISOString()
          }
        })
        .eq('id', clusterId)

      console.log(`💾 Stored synthesized article: "${article.title}"`)
      return synthesizedArticle

    } catch (error) {
      console.error('Error storing synthesized article:', error)
      throw error
    }
  }
}

// Update method name for the new workflow
export class AIPerspectiveEngine {
  // ... (existing methods)
  
  // Keep backward compatibility
  async generateUnifiedArticle(clusterId: string) {
    return this.generateSynthesizedArticle(clusterId)
  }
}

export const aiPerspectiveEngine = new AIPerspectiveEngine()
export default AIPerspectiveEngine