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
      console.log(`🧠 Starting AI article generation for cluster: ${cluster_id}`)
      
      const startTime = Date.now()
      const result = await aiPerspectiveEngineClaude.generateUnifiedArticle(cluster_id)
      const duration = Date.now() - startTime

      return NextResponse.json({
        success: true,
        message: 'AI unified article generated successfully',
        data: {
          cluster_id: cluster_id,
          article_id: result.title, // Will be proper ID from database
          title: result.title,
          content_length: result.unified_content.length,
          sources_analyzed: result.metadata.total_sources,
          processing_time_ms: result.metadata.processing_time_ms,
          api_duration_ms: duration,
          ai_model_used: result.metadata.ai_model_used,
          confidence_score: result.metadata.confidence_score,
          source_chips_count: result.source_chips.length,
          has_surprise_ending: !!result.surprise_ending,
          notebooklm_ready: !!result.notebooklm_summary,
          perspective_analysis: {
            common_facts_count: result.perspective_analysis.common_facts.length,
            different_interpretations_count: result.perspective_analysis.different_interpretations.length,
            has_bias_analysis: !!result.perspective_analysis.bias_analysis
          },
          generation_timestamp: new Date().toISOString()
        }
      })
    }

    if (action === 'batch_generate') {
      console.log('🚀 Starting batch AI article generation...')
      
      // Get all clusters ready for processing
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { data: readyClusters } = await supabase
        .from('story_clusters')
        .select('id, primary_topic')
        .eq('processing_status', 'analyzing')
        .order('detection_timestamp', { ascending: false })
        .limit(10)

      if (!readyClusters || readyClusters.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'No clusters ready for AI processing',
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
            confidence: article.metadata.confidence_score
          })
          console.log(`✅ Generated: "${article.title}"`)
        } catch (error) {
          results.failed++
          console.error(`❌ Failed to generate article for cluster ${cluster.id}:`, error)
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Batch AI article generation completed',
        data: results
      })
    }

    return NextResponse.json(
      { error: 'Invalid action or missing cluster_id' },
      { status: 400 }
    )

  } catch (error) {
    console.error('AI article generation API error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'AI article generation failed',
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

      // Get unified articles statistics
      const { data: unifiedStats } = await supabase
        .from('unified_articles')
        .select('status, ai_model_used, generation_timestamp, metadata')

      // Get clusters ready for processing
      const { data: readyClusters } = await supabase
        .from('story_clusters')
        .select('id')
        .eq('processing_status', 'analyzing')

      const stats = {
        total_unified_articles: unifiedStats?.length || 0,
        articles_by_status: {
          draft: unifiedStats?.filter(a => a.status === 'draft').length || 0,
          review: unifiedStats?.filter(a => a.status === 'review').length || 0,
          published: unifiedStats?.filter(a => a.status === 'published').length || 0,
          archived: unifiedStats?.filter(a => a.status === 'archived').length || 0
        },
        clusters_ready_for_ai: readyClusters?.length || 0,
        ai_model_in_use: 'claude-3-opus',
        anthropic_api_configured: !!process.env.ANTHROPIC_API_KEY,
        openai_api_configured: !!process.env.OPENAI_API_KEY,
        avg_confidence_score: (unifiedStats && unifiedStats.length > 0) 
          ? (unifiedStats.reduce((sum, a) => sum + (a.metadata?.confidence_score || 0), 0) / unifiedStats.length).toFixed(3)
          : 0,
        recent_generation_count: unifiedStats?.filter(a => 
          new Date(a.generation_timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        ).length || 0
      }

      return NextResponse.json({
        success: true,
        message: 'AI Perspective Engine status',
        data: {
          stats,
          features: {
            perspective_analysis: true,
            source_chips: true,
            surprise_endings: true,
            notebooklm_integration: true,
            bias_detection: true,
            multi_source_synthesis: true
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
      console.log('🚀 Starting batch AI article generation via cron...')
      
      // Get all clusters ready for processing
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const { data: readyClusters } = await supabase
        .from('story_clusters')
        .select('id, primary_topic')
        .eq('processing_status', 'analyzing')
        .order('detection_timestamp', { ascending: false })
        .limit(10)

      if (!readyClusters || readyClusters.length === 0) {
        return NextResponse.json({
          success: true,
          message: 'No clusters ready for AI processing',
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
            confidence: article.metadata.confidence_score
          })
          console.log(`✅ Generated: "${article.title}"`)
        } catch (error) {
          results.failed++
          console.error(`❌ Failed to generate article for cluster ${cluster.id}:`, error)
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Batch AI article generation completed via cron',
        data: results
      })
    }

    if (action === 'recent') {
      // Get recent unified articles
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      const limit = parseInt(searchParams.get('limit') || '10', 10)

      const { data: recentArticles } = await supabase
        .from('unified_articles')
        .select(`
          id,
          title,
          status,
          generation_timestamp,
          metadata,
          source_chips,
          cluster_id,
          story_clusters!inner (
            primary_topic,
            sources_found
          )
        `)
        .order('generation_timestamp', { ascending: false })
        .limit(limit)

      return NextResponse.json({
        success: true,
        message: 'Recent unified articles',
        data: {
          articles: recentArticles?.map(article => ({
            id: article.id,
            title: article.title,
            status: article.status,
            sources_count: Array.isArray((article.story_clusters as any)?.sources_found) ? (article.story_clusters as any).sources_found.length : 0,
            confidence_score: article.metadata?.confidence_score || 0,
            source_chips_count: Array.isArray(article.source_chips) ? article.source_chips.length : 0,
            generated_at: article.generation_timestamp,
            topic: (article.story_clusters as any)?.primary_topic
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
    console.error('AI article generation status API error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get AI generation status',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}