import { NextRequest, NextResponse } from 'next/server'
// Use Claude for text analysis, DALL-E for images
import { aiPerspectiveEngineClaude } from '@/lib/ai-perspective-engine-claude'

export async function POST(request: NextRequest) {
  try {
    // Check for authorization header
    const authHeader = request.headers.get('authorization')
    const apiKey = process.env.RSS_API_KEY || 'nonbulla-rss-key-2025'
    
    if (authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { cluster_id, action } = body

    if (action === 'generate' && cluster_id) {
      console.log(`🧠 Starting AI multi-perspective synthesis for cluster: ${cluster_id}`)
      
      const startTime = Date.now()
      const result = await aiPerspectiveEngineClaude.generateUnifiedArticle(cluster_id)
      const duration = Date.now() - startTime

      return NextResponse.json({
        success: true,
        message: 'AI multi-perspective article synthesized successfully - breaking filter bubbles!',
        data: {
          cluster_id: cluster_id,
          article_id: Date.now().toString(),
          title: result.title,
          content_length: result.unified_content.length,
          notebooklm_summary_length: result.notebooklm_summary.length,
          source_chips_count: result.source_chips.length,
          perspectives_count: result.source_perspectives_summary.length,
          sources_analyzed: result.metadata.total_sources,
          processing_time_ms: result.metadata.processing_time_ms,
          confidence_score: result.metadata.confidence_score,
          ai_model_used: result.metadata.ai_model_used,
          api_duration_ms: duration,
          has_surprise_ending: !!result.surprise_ending,
          notebooklm_ready: !!result.notebooklm_summary,
          generation_timestamp: new Date().toISOString()
        }
      })
    }

    if (action === 'batch_generate') {
      console.log('🚀 Starting batch AI multi-perspective synthesis...')
      
      // Get all clusters ready for AI synthesis
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { data: readyClusters } = await supabase
        .from('topic_clusters')
        .select('id, title')
        .eq('status', 'ready_for_ai')
        .order('created_at', { ascending: false })
        .limit(10)

      if (!readyClusters || readyClusters.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'No topic clusters ready for AI synthesis',
          data: { processed: 0, generated: 0 }
        })
      }

      const results = {
        processed: readyClusters.length,
        generated: 0,
        failed: 0,
        articles: [] as any[]
      }

      for (const cluster of readyClusters) {
        try {
          const article = await aiPerspectiveEngineClaude.generateUnifiedArticle(cluster.id)
          results.generated++
          results.articles.push({
            cluster_id: cluster.id,
            title: article.title,
            sources: article.metadata.total_sources,
            confidence: article.metadata.confidence_score,
            perspectives: article.source_perspectives_summary.length,
            filter_bubble_breaking: true
          })
          console.log(`✅ Synthesized multi-perspective article: "${article.title}"`)
        } catch (error) {
          results.failed++
          console.error(`❌ Failed to synthesize article for cluster ${cluster.id}:`, error)
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Batch AI multi-perspective synthesis completed',
        data: results
      })
    }

    return NextResponse.json(
      { error: 'Invalid action or missing cluster_id' },
      { status: 400 }
    )

  } catch (error) {
    console.error('AI multi-perspective synthesis API error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'AI multi-perspective synthesis failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'status'

    if (action === 'status') {
      // Get AI generation system status
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      // Get synthesized articles statistics
      const { data: synthesizedStats } = await supabase
        .from('synthesized_articles')
        .select('publish_status, metadata, created_at')

      // Get clusters ready for processing
      const { data: readyClusters } = await supabase
        .from('topic_clusters')
        .select('id')
        .eq('status', 'ready_for_ai')

      const stats = {
        total_synthesized_articles: synthesizedStats?.length || 0,
        articles_by_status: {
          draft: synthesizedStats?.filter(a => a.publish_status === 'draft').length || 0,
          review: synthesizedStats?.filter(a => a.publish_status === 'review').length || 0,
          published: synthesizedStats?.filter(a => a.publish_status === 'published').length || 0
        },
        clusters_ready_for_ai: readyClusters?.length || 0,
        ai_model_in_use: 'claude-3-opus',
        anthropic_api_configured: !!process.env.ANTHROPIC_API_KEY,
        openai_api_configured: !!process.env.OPENAI_API_KEY,
        avg_confidence_score: (synthesizedStats && synthesizedStats.length > 0) 
          ? (synthesizedStats.reduce((sum, a) => sum + (a.metadata?.confidence_score || 0), 0) / synthesizedStats.length).toFixed(3)
          : 0,
        recent_synthesis_count: synthesizedStats?.filter(a => 
          new Date(a.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length || 0
      }

      return NextResponse.json({
        success: true,
        message: 'AI Multi-Perspective Synthesis Engine status',
        data: {
          stats,
          features: {
            filter_bubble_breaking: true,
            multi_perspective_synthesis: true,
            political_balance_analysis: true,
            source_chips: true,
            surprise_endings: true,
            notebooklm_integration: true,
            bias_detection: true,
            credibility_scoring: true
          },
          requirements: {
            minimum_sources: 2,
            maximum_sources: 10,
            supported_languages: ['nl'],
            text_ai_model: 'claude-3-opus',
            image_ai_model: 'dall-e-3'
          },
          last_status_check: new Date().toISOString()
        }
      })
    }

    if (action === 'batch_generate') {
      // Handle batch generation via GET for Vercel cron jobs
      console.log('🚀 Starting batch AI multi-perspective synthesis via cron...')
      
      // Get all clusters ready for AI synthesis
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { data: readyClusters } = await supabase
        .from('topic_clusters')
        .select('id, title')
        .eq('status', 'ready_for_ai')
        .order('created_at', { ascending: false })
        .limit(10)

      if (!readyClusters || readyClusters.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'No topic clusters ready for AI synthesis',
          data: { processed: 0, generated: 0 }
        })
      }

      const results = {
        processed: readyClusters.length,
        generated: 0,
        failed: 0,
        articles: [] as any[]
      }

      for (const cluster of readyClusters) {
        try {
          const article = await aiPerspectiveEngineClaude.generateUnifiedArticle(cluster.id)
          results.generated++
          results.articles.push({
            cluster_id: cluster.id,
            title: article.title,
            sources: article.metadata.total_sources,
            confidence: article.metadata.confidence_score,
            perspectives: article.source_perspectives_summary.length,
            filter_bubble_breaking: true
          })
          console.log(`✅ Synthesized multi-perspective article: "${article.title}"`)
        } catch (error) {
          results.failed++
          console.error(`❌ Failed to synthesize article for cluster ${cluster.id}:`, error)
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Batch AI multi-perspective synthesis completed via cron',
        data: results
      })
    }

    if (action === 'recent') {
      // Get recent synthesized articles
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const limit = parseInt(searchParams.get('limit') || '10', 10)

      const { data: recentArticles } = await supabase
        .from('synthesized_articles')
        .select(`
          id,
          title,
          publish_status,
          created_at,
          metadata,
          source_count,
          credibility_score,
          cluster_id,
          topic_clusters!inner (
            title,
            keywords
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      return NextResponse.json({
        success: true,
        message: 'Recent synthesized articles',
        data: {
          articles: recentArticles?.map(article => ({
            id: article.id,
            title: article.title,
            status: article.publish_status,
            sources_count: article.source_count || 0,
            confidence_score: article.metadata?.confidence_score || 0,
            credibility_score: article.credibility_score || 0,
            source_chips_count: Array.isArray(article.metadata?.source_chips) ? article.metadata.source_chips.length : 0,
            generated_at: article.created_at,
            topic: (article.topic_clusters as any)?.title,
            keywords: (article.topic_clusters as any)?.keywords || []
          })) || [],
          total_count: recentArticles?.length || 0
        }
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('AI multi-perspective synthesis status API error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get AI synthesis status',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}