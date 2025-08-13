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

export interface UnifiedArticle {
  title: string
  unified_content: string
  perspective_analysis: {
    common_facts: string[]
    different_interpretations: string[]
    bias_analysis: string
    credibility_assessment: string
  }
  source_chips: SourceChip[]
  surprise_ending: string
  notebooklm_summary: string
  source_perspectives_summary: SourcePerspective[]
  metadata: {
    total_sources: number
    processing_time_ms: number
    ai_model_used: string
    confidence_score: number
  }
}

class AIPerspectiveEngine {
  private supabase = createClient()
  
  // OpenAI API configuration (you'll need to set OPENAI_API_KEY in env)
  private openaiApiKey = process.env.OPENAI_API_KEY
  private openaiModel = 'gpt-4o' // Latest model for best analysis

  /**
   * Main method - analyze story cluster and generate unified article
   */
  async generateUnifiedArticle(clusterId: string): Promise<UnifiedArticle> {
    console.log(`🧠 Starting AI perspective analysis for cluster: ${clusterId}`)
    const startTime = Date.now()

    // Get cluster with cross-referenced articles
    const cluster = await this.getClusterWithCrossReferencedArticles(clusterId)
    if (!cluster || cluster.matched_articles.length < 2) {
      throw new Error(`Cluster ${clusterId} not ready for perspective analysis - need at least 2 sources`)
    }

    console.log(`📰 Analyzing ${cluster.matched_articles.length} articles from different sources`)

    // Step 1: Analyze each source's perspective
    const sourcePerspectives = await this.analyzeSourcePerspectives(cluster.matched_articles)
    
    // Step 2: Generate unified content with AI
    const unifiedContent = await this.generateUnifiedContent(cluster, sourcePerspectives)
    
    // Step 3: Create source chips for inline references
    const sourceChips = this.generateSourceChips(sourcePerspectives, unifiedContent.content)
    
    // Step 4: Generate "om-denken" surprise ending
    const surpriseEnding = await this.generateSurpriseEnding(cluster, sourcePerspectives)
    
    // Step 5: Create NotebookLM extended summary
    const notebooklmSummary = await this.generateNotebookLMSummary(cluster, sourcePerspectives, unifiedContent)

    const processingTime = Date.now() - startTime

    const result: UnifiedArticle = {
      title: unifiedContent.title,
      unified_content: unifiedContent.content,
      perspective_analysis: unifiedContent.analysis,
      source_chips: sourceChips,
      surprise_ending: surpriseEnding,
      notebooklm_summary: notebooklmSummary,
      source_perspectives_summary: sourcePerspectives,
      metadata: {
        total_sources: cluster.matched_articles.length,
        processing_time_ms: processingTime,
        ai_model_used: this.openaiModel,
        confidence_score: this.calculateConfidenceScore(sourcePerspectives)
      }
    }

    // Store in database
    await this.storeUnifiedArticle(clusterId, result)

    console.log(`✅ Unified article generated in ${processingTime}ms`)
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
   * Generate unified content with AI
   */
  private async generateUnifiedContent(cluster: any, perspectives: SourcePerspective[]): Promise<{
    title: string
    content: string
    analysis: any
  }> {
    console.log('✍️ Generating unified article content...')
    
    const prompt = this.buildUnifiedContentPrompt(cluster, perspectives)
    const result = await this.callOpenAI(prompt, 'unified-content')
    
    return {
      title: result.title || cluster.primary_topic,
      content: result.content || '',
      analysis: {
        common_facts: result.common_facts || [],
        different_interpretations: result.different_interpretations || [],
        bias_analysis: result.bias_analysis || '',
        credibility_assessment: result.credibility_assessment || ''
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
   * Build unified content generation prompt
   */
  private buildUnifiedContentPrompt(cluster: any, perspectives: SourcePerspective[]): string {
    return `
Je bent een ervaren Nederlandse journalist die multi-perspectief artikelen schrijft voor Nonbulla - een platform dat nieuwsbubbels doorbreekt.

ONDERWERP: ${cluster.primary_topic}
KEYWORDS: ${cluster.keywords?.join(', ')}

PERSPECTIVEN VAN VERSCHILLENDE BRONNEN:
${perspectives.map(p => `
🔹 ${p.source_name} (${p.political_leaning_detected}):
   Invalshoek: ${p.key_angle}
   Unieke details: ${p.unique_details.join(', ')}
   Perspectief: ${p.perspective_summary}
   Citaten: ${p.quote_extracts.join(' | ')}
`).join('\n')}

SCHRIJF EEN GEBALANCEERD NIEUWSARTIKEL DAT:
1. Alle belangrijke feiten bevat van alle bronnen
2. De verschillende perspectieven helder maakt zonder oordeel
3. Verschillen in interpretatie benoemt op een plezierige manier
4. Neutraal blijft maar wel nuances erkent
5. Goed leesbaar is voor Nederlandse lezers
6. 400-600 woorden lang is

ANALYSEER OOK:
- Gemeenschappelijke feiten tussen bronnen
- Verschillende interpretaties van dezelfde feiten  
- Bias patronen die je detecteert
- Kredibiliteitsbeoordeling van de verschillende standpunten

Antwoord in JSON format:
{
  "title": "Pakkende titel die de kern van het verhaal weergeeft",
  "content": "Volledige artikel tekst in vlotte Nederlandse journalistieke stijl",
  "common_facts": ["feit1", "feit2", "feit3"],
  "different_interpretations": ["interpretatie1", "interpretatie2"],
  "bias_analysis": "Analyse van detecteerbare bias patronen",
  "credibility_assessment": "Beoordeling van de verschillende standpunten"
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
   * Helper methods
   */
  private async getClusterWithCrossReferencedArticles(clusterId: string) {
    const { data: cluster } = await this.supabase
      .from('story_clusters')
      .select('*')
      .eq('id', clusterId)
      .eq('processing_status', 'analyzing')
      .single()

    if (!cluster) return null

    // Get articles from sources found by cross-reference engine
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
      .in('source_id', cluster.sources_found || [])
      .gte('published_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString())
      .order('quality_score', { ascending: false })

    return {
      ...cluster,
      matched_articles: articles || []
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

  private calculateConfidenceScore(perspectives: SourcePerspective[]): number {
    if (perspectives.length === 0) return 0
    
    const avgCredibility = perspectives.reduce((sum, p) => sum + p.credibility_assessment, 0) / perspectives.length
    const diversityScore = perspectives.length >= 3 ? 0.9 : 0.7
    
    return Math.min(0.95, (avgCredibility / 100) * diversityScore)
  }

  private async storeUnifiedArticle(clusterId: string, article: UnifiedArticle) {
    try {
      // Store unified article
      const { data: unifiedArticle, error: articleError } = await this.supabase
        .from('unified_articles')
        .insert({
          cluster_id: clusterId,
          title: article.title,
          unified_content: article.unified_content,
          perspective_analysis: article.perspective_analysis,
          source_chips: article.source_chips,
          surprise_ending: article.surprise_ending,
          notebooklm_summary: article.notebooklm_summary,
          ai_model_used: article.metadata.ai_model_used,
          generation_timestamp: new Date().toISOString(),
          status: 'draft',
          metadata: article.metadata
        })
        .select()
        .single()

      if (articleError) throw articleError

      // Store source perspectives
      for (const perspective of article.source_perspectives_summary) {
        await this.supabase
          .from('source_perspectives')
          .insert({
            cluster_id: clusterId,
            source_name: perspective.source_name,
            original_article_url: perspective.source_url,
            original_title: perspective.original_title,
            key_angle: perspective.key_angle,
            unique_details: perspective.unique_details,
            sentiment_score: perspective.sentiment_score,
            political_leaning_detected: perspective.political_leaning_detected,
            credibility_assessment: perspective.credibility_assessment,
            perspective_summary: perspective.perspective_summary,
            quote_extracts: perspective.quote_extracts
          })
      }

      // Update cluster status
      await this.supabase
        .from('story_clusters')
        .update({ 
          processing_status: 'complete',
          unified_article_id: unifiedArticle.id
        })
        .eq('id', clusterId)

      console.log(`💾 Stored unified article: "${article.title}"`)

    } catch (error) {
      console.error('Error storing unified article:', error)
      throw error
    }
  }
}

export const aiPerspectiveEngine = new AIPerspectiveEngine()
export default AIPerspectiveEngine