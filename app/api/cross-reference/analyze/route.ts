import { NextRequest, NextResponse } from 'next/server'
import { crossReferenceEngine } from '@/lib/cross-reference-engine'

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

    if (action === 'analyze' && cluster_id) {
      console.log(`🔍 Starting cross-reference analysis for cluster: ${cluster_id}`)
      
      const result = await crossReferenceEngine.analyzeStoryCluster(cluster_id)
      
      return NextResponse.json({
        success: true,
        message: 'Cross-reference analysis completed',
        data: {
          cluster_id: result.cluster_id,
          processing_recommendation: result.processing_recommendation,
          cross_reference_score: result.cross_reference_score,
          matched_sources: result.matched_articles.length,
          missing_sources: result.missing_sources,
          trigger_article_title: result.trigger_article?.title,
          recheck_scheduled: result.recheck_scheduled_at,
          analysis_timestamp: new Date().toISOString()
        }
      })
    }

    if (action === 'process_delayed') {
      console.log('⏰ Processing delayed cross-reference rechecks...')
      
      const results = await crossReferenceEngine.processDelayedRechecks()
      
      return NextResponse.json({
        success: true,
        message: 'Delayed rechecks processed',
        data: {
          ...results,
          timestamp: new Date().toISOString()
        }
      })
    }

    return NextResponse.json(
      { error: 'Invalid action or missing cluster_id' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Cross-reference analysis API error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Cross-reference analysis failed',
        message: error instanceof Error ? error.message : 'Unknown error'
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
      // Get cross-reference system status
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      // Get cluster statistics
      const { data: clusterStats } = await supabase
        .from('story_clusters')
        .select('processing_status, recheck_scheduled_at, sources_found, sources_missing')

      const stats = {
        total_clusters: clusterStats?.length || 0,
        ready_for_analysis: clusterStats?.filter(c => c.processing_status === 'analyzing').length || 0,
        awaiting_recheck: clusterStats?.filter(c => 
          c.processing_status === 'detecting' && c.recheck_scheduled_at
        ).length || 0,
        insufficient_sources: clusterStats?.filter(c => c.processing_status === 'failed').length || 0,
        multi_source_clusters: clusterStats?.filter(c => 
          c.sources_found && c.sources_found.length >= 2
        ).length || 0,
        single_source_clusters: clusterStats?.filter(c => 
          c.sources_found && c.sources_found.length === 1
        ).length || 0
      }

      return NextResponse.json({
        success: true,
        message: 'Cross-reference engine status',
        data: {
          stats,
          cross_reference_rules: [
            {
              trigger: 'NU.nl',
              required_sources: ['Volkskrant', 'NOS', 'Telegraaf'],
              minimum_matches: 2,
              recheck_delay: '1 hour'
            }
          ],
          last_status_check: new Date().toISOString()
        }
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Cross-reference status API error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get cross-reference status',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}