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
  hero_image_url?: string
  hero_image_prompt?: string
  metadata: {
    total_sources: number
    processing_time_ms: number
    ai_model_used: string
    confidence_score: number
  }
}

class AIPerspectiveEngineClaude {
  private supabase = createClient()
  
  // API configuration - Claude for text, OpenAI for images
  private anthropicApiKey = process.env.ANTHROPIC_API_KEY
  private openaiApiKey = process.env.OPENAI_API_KEY // Only for DALL-E 3
  private claudeModel = 'claude-3-opus-20240229' // Best Claude model for complex analysis
  private dalleModel = 'dall-e-3' // For hero images

  /**
   * Main method - analyze story cluster and generate unified article
   */
  async generateUnifiedArticle(clusterId: string): Promise<UnifiedArticle> {
    console.log(`🧠 Starting AI perspective analysis with Claude for cluster: ${clusterId}`)
    const startTime = Date.now()

    // Get cluster with cross-referenced articles
    const cluster = await this.getClusterWithCrossReferencedArticles(clusterId)
    if (!cluster || cluster.matched_articles.length < 2) {
      throw new Error(`Cluster ${clusterId} not ready for perspective analysis - need at least 2 sources`)
    }

    console.log(`📰 Analyzing ${cluster.matched_articles.length} articles from different sources`)

    // Step 1: Analyze each source's perspective with Claude
    const sourcePerspectives = await this.analyzeSourcePerspectives(cluster.matched_articles)
    
    // Step 2: Generate unified content with Claude
    const unifiedContent = await this.generateUnifiedContent(cluster, sourcePerspectives)
    
    // Step 3: Create source chips for inline references
    const sourceChips = this.generateSourceChips(sourcePerspectives, unifiedContent.content)
    
    // Step 4: Generate "om-denken" surprise ending with Claude
    const surpriseEnding = await this.generateSurpriseEnding(cluster, sourcePerspectives)
    
    // Step 5: Create NotebookLM extended summary with Claude
    const notebooklmSummary = await this.generateNotebookLMSummary(cluster, sourcePerspectives, unifiedContent)

    // Step 6: Generate hero image with DALL-E 3 (optional)
    let heroImageData: { url?: string; prompt?: string } = { url: undefined, prompt: undefined }
    if (this.openaiApiKey) {
      try {
        heroImageData = await this.generateHeroImage(cluster, unifiedContent.title)
      } catch (error) {
        console.warn('⚠️ Hero image generation skipped:', error)
      }
    }

    const processingTime = Date.now() - startTime

    const result: UnifiedArticle = {
      title: unifiedContent.title,
      unified_content: unifiedContent.content,
      perspective_analysis: unifiedContent.analysis,
      source_chips: sourceChips,
      surprise_ending: surpriseEnding,
      notebooklm_summary: notebooklmSummary,
      source_perspectives_summary: sourcePerspectives,
      hero_image_url: heroImageData.url,
      hero_image_prompt: heroImageData.prompt,
      metadata: {
        total_sources: cluster.matched_articles.length,
        processing_time_ms: processingTime,
        ai_model_used: this.claudeModel,
        confidence_score: this.calculateConfidenceScore(sourcePerspectives)
      }
    }

    // Store in database
    await this.storeUnifiedArticle(clusterId, result)

    console.log(`✅ Unified article generated with Claude in ${processingTime}ms`)
    return result
  }

  /**
   * Analyze each source's unique perspective using Claude
   */
  private async analyzeSourcePerspectives(articles: any[]): Promise<SourcePerspective[]> {
    console.log('🔍 Analyzing source perspectives with Claude...')
    
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
   * Analyze single source's perspective using Claude
   */
  private async analyzeSingleSourcePerspective(article: any, allArticles: any[]): Promise<SourcePerspective> {
    const otherArticles = allArticles.filter(a => a.id !== article.id)
    
    const prompt = this.buildPerspectiveAnalysisPrompt(article, otherArticles)
    
    const analysis = await this.callClaude(prompt, 'perspective-analysis')
    
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
   * Generate unified content with Claude
   */
  private async generateUnifiedContent(cluster: any, perspectives: SourcePerspective[]): Promise<{
    title: string
    content: string
    analysis: any
  }> {
    console.log('✍️ Generating unified article content with Claude...')
    
    const prompt = this.buildUnifiedContentPrompt(cluster, perspectives)
    const result = await this.callClaude(prompt, 'unified-content')
    
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
   * Generate hero image with DALL-E 3
   */
  private async generateHeroImage(cluster: any, title: string): Promise<{ url?: string; prompt?: string }> {
    if (!this.openaiApiKey) {
      console.log('⏭️ Skipping hero image generation - no OpenAI API key')
      return { url: undefined, prompt: undefined }
    }

    console.log('🎨 Generating hero image with DALL-E 3...')
    
    // Create a news-appropriate image prompt
    const imagePrompt = `
Dutch news illustration for article titled "${title}".
Style: Professional news photography, photojournalistic, editorial quality.
Scene: ${cluster.primary_topic}
Mood: Neutral, informative, balanced perspective.
Composition: Wide shot suitable for news header, 16:9 aspect ratio.
Color palette: Professional, slightly desaturated, newspaper-style.
NO text, NO logos, NO identifiable people, NO political symbols.
High quality, sharp focus, professional news media style.
`.trim()

    try {
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.openaiApiKey}`
        },
        body: JSON.stringify({
          model: this.dalleModel,
          prompt: imagePrompt,
          n: 1,
          size: '1792x1024', // Wide format for hero images
          quality: 'hd',
          style: 'natural'
        })
      })

      if (!response.ok) {
        throw new Error(`DALL-E API error: ${response.status}`)
      }

      const result = await response.json()
      const imageUrl = result.data[0]?.url

      console.log('✅ Hero image generated successfully')
      return { url: imageUrl, prompt: imagePrompt }

    } catch (error) {
      console.error('Failed to generate hero image:', error)
      return { url: undefined, prompt: undefined }
    }
  }

  /**
   * Call Claude API (Anthropic)
   */
  private async callClaude(prompt: string, operation: string): Promise<any> {
    if (!this.anthropicApiKey) {
      throw new Error('Anthropic API key not configured')
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.anthropicApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: this.claudeModel,
          max_tokens: 4000,
          temperature: 0.7,
          system: 'Je bent een expert Nederlandse nieuwsanalyst en journalist die gespecialiseerd is in multi-perspectief nieuwsanalyse. Je werkt voor Nonbulla, een platform dat nieuwsbubbels doorbreekt door verschillende perspectieven te tonen. Je antwoordt altijd in correct JSON format. Je bent objectief, grondig, en hebt oog voor nuance.',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Claude API error: ${response.status} - ${JSON.stringify(errorData)}`)
      }

      const result = await response.json()
      const content = result.content[0]?.text

      try {
        return JSON.parse(content)
      } catch (parseError) {
        console.error(`JSON parse error for ${operation}:`, parseError)
        console.error('Raw content:', content)
        
        // Try to extract JSON from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          try {
            return JSON.parse(jsonMatch[0])
          } catch (e) {
            throw new Error(`Invalid JSON response from Claude for ${operation}`)
          }
        }
        throw new Error(`Invalid JSON response from Claude for ${operation}`)
      }

    } catch (error) {
      console.error(`Claude API call failed for ${operation}:`, error)
      throw error
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
   * Generate surprising "om-denken" ending with Claude
   */
  private async generateSurpriseEnding(cluster: any, perspectives: SourcePerspective[]): Promise<string> {
    console.log('🎭 Generating "om-denken" surprise ending with Claude...')
    
    const prompt = this.buildSurpriseEndingPrompt(cluster, perspectives)
    const result = await this.callClaude(prompt, 'surprise-ending')
    
    return result.surprise_ending || 'Dit verhaal laat zien hoe verschillende perspectieven tot een rijker begrip van de werkelijkheid leiden.'
  }

  /**
   * Generate extended summary for NotebookLM with Claude
   */
  private async generateNotebookLMSummary(cluster: any, perspectives: SourcePerspective[], unifiedContent: any): Promise<string> {
    console.log('📝 Generating NotebookLM extended summary with Claude...')
    
    const prompt = this.buildNotebookLMPrompt(cluster, perspectives, unifiedContent)
    const result = await this.callClaude(prompt, 'notebooklm-summary')
    
    return result.extended_summary || ''
  }

  /**
   * Build perspective analysis prompt
   */
  private buildPerspectiveAnalysisPrompt(article: any, otherArticles: any[]): string {
    return `
Je bent een Nederlandse nieuwsanalyst die de unieke invalshoek van nieuwsbronnen analyseert voor Nonbulla.

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
3. Verschillen in interpretatie benoemt op een constructieve manier
4. Neutraal blijft maar wel nuances erkent
5. Goed leesbaar is voor Nederlandse lezers
6. 400-600 woorden lang is
7. Geschikt is voor een breed publiek
8. Verwijst naar bronnen op natuurlijke wijze (gebruik [BRON: naam] tags waar relevant)

ANALYSEER OOK:
- Gemeenschappelijke feiten tussen bronnen
- Verschillende interpretaties van dezelfde feiten  
- Bias patronen die je detecteert
- Kredibiliteitsbeoordeling van de verschillende standpunten

Antwoord in JSON format:
{
  "title": "Pakkende titel die de kern van het verhaal weergeeft",
  "content": "Volledige artikel tekst in vlotte Nederlandse journalistieke stijl met [BRON: naam] tags",
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
6. Filosofisch of reflectief van aard is

Voorbeelden van goede "om-denken" afsluitingen:
- "Misschien zegt de manier waarop we over dit onderwerp praten meer over onszelf dan over het onderwerp zelf."
- "In een tijd van snelle oordelen blijkt de waarheid vaak te vinden in wat er niet wordt gezegd."
- "Terwijl iedereen naar links of rechts kijkt, speelt het echte verhaal zich mogelijk recht voor onze neus af."
- "Soms is de belangrijkste vraag niet 'wie heeft gelijk?' maar 'waarom vinden we dat zo belangrijk?'"

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
1. De kern van het verhaal uitlegt voor podcast luisteraars
2. De verschillende perspectieven benoemt in spreektaal
3. Context geeft over waarom dit belangrijk is voor Nederland
4. Interessante achtergrond informatie bevat
5. Geschikt is voor een Nederlandse nieuws podcast
6. Vermeld welke bronnen welke standpunten innemen
7. Eindigt met een prikkelende vraag of gedachte
8. Natuurlijk klinkt wanneer voorgelezen

Focus op:
- Waarom dit nieuws nu relevant is
- Hoe verschillende media het verhaal framen
- Wat de mogelijke implicaties zijn
- Welke vragen onbeantwoord blijven

Antwoord in JSON format:
{
  "extended_summary": "Uitgebreide podcast-ready samenvatting in natuurlijke spreektaal"
}
`
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
      'RTL Nieuws': 'RTL',
      'NRC Nieuws': 'NRC',
      'AD Nieuws': 'AD',
      'Trouw Nieuws': 'Trouw',
      'Het Parool': 'Parool',
      'De Correspondent': 'Correspondent',
      'BBC News Nederlands': 'BBC',
      'CNN International': 'CNN',
      'The Guardian International': 'Guardian'
    }
    return nameMap[fullName] || fullName.split(' ')[0]
  }

  private getSourceChipColor(politicalLeaning: string): string {
    const colorMap: { [key: string]: string } = {
      'left': '#e3f2fd',           // Light blue
      'center-left': '#f3e5f5',    // Light purple  
      'center': '#f5f5f5',         // Light gray
      'center-right': '#fff3e0',   // Light orange
      'right': '#ffebee'           // Light red
    }
    return colorMap[politicalLeaning] || '#f5f5f5'
  }

  private findSourceReferencePositions(content: string, perspective: SourcePerspective, sourceName: string): number[] {
    // Find where [BRON: name] tags appear in content
    const positions: number[] = []
    const regex = new RegExp(`\\[BRON: ${sourceName}\\]`, 'gi')
    let match
    
    while ((match = regex.exec(content)) !== null) {
      positions.push(match.index)
    }
    
    // Also find where unique details appear
    perspective.unique_details.forEach(detail => {
      const index = content.toLowerCase().indexOf(detail.toLowerCase())
      if (index !== -1 && !positions.includes(index)) {
        positions.push(index)
      }
    })

    return positions.sort((a, b) => a - b)
  }

  private calculateConfidenceScore(perspectives: SourcePerspective[]): number {
    if (perspectives.length === 0) return 0
    
    const avgCredibility = perspectives.reduce((sum, p) => sum + p.credibility_assessment, 0) / perspectives.length
    const diversityScore = perspectives.length >= 3 ? 0.9 : 0.7
    const hasDifferentLeanings = new Set(perspectives.map(p => p.political_leaning_detected)).size > 1 ? 1.1 : 1.0
    
    return Math.min(0.95, (avgCredibility / 100) * diversityScore * hasDifferentLeanings)
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
          metadata: {
            ...article.metadata,
            hero_image_url: article.hero_image_url,
            hero_image_prompt: article.hero_image_prompt
          }
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

export const aiPerspectiveEngineClaude = new AIPerspectiveEngineClaude()
export default AIPerspectiveEngineClaude