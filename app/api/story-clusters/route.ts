import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const status = searchParams.get('status') || 'detecting'
    const hoursBack = parseInt(searchParams.get('hours') || '24', 10)

    const supabase = createClient()

    // Calculate time range
    const timeThreshold = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString()

    const { data: clusters, error } = await supabase
      .from('story_clusters')
      .select(`
        *,
        unified_articles (
          id,
          title,
          status,
          published_at
        )
      `)
      .eq('processing_status', status)
      .gte('detection_timestamp', timeThreshold)
      .order('detection_timestamp', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    // Get article details for each cluster
    const enrichedClusters = await Promise.all(
      clusters.map(async (cluster) => {
        const { data: articles } = await supabase
          .from('raw_articles')
          .select(`
            id,
            title,
            url,
            published_at,
            news_sources (
              name,
              credibility_score,
              political_leaning
            )
          `)
          .in('source_id', cluster.sources_found)
          .gte('published_at', timeThreshold)
          .order('published_at', { ascending: false })
          .limit(10)

        return {
          ...cluster,
          sample_articles: articles || [],
          cross_reference_count: cluster.sources_found.length,
          requires_cross_reference: cluster.sources_found.length >= 2
        }
      })
    )

    return NextResponse.json({
      success: true,
      data: {
        clusters: enrichedClusters,
        total_clusters: enrichedClusters.length,
        filters: {
          status,
          hours_back: hoursBack,
          limit
        },
        summary: {
          ready_for_processing: enrichedClusters.filter(c => c.sources_found.length >= 2).length,
          single_source_stories: enrichedClusters.filter(c => c.sources_found.length === 1).length,
          multi_source_stories: enrichedClusters.filter(c => c.sources_found.length >= 2).length
        },
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Story clusters API error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch story clusters',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Manual cluster creation or processing trigger
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

    const supabase = createClient()

    if (action === 'process' && cluster_id) {
      // Update cluster status to analyzing
      const { data, error } = await supabase
        .from('story_clusters')
        .update({ 
          processing_status: 'analyzing',
          updated_at: new Date().toISOString()
        })
        .eq('id', cluster_id)
        .select()
        .single()

      if (error) {
        throw error
      }

      return NextResponse.json({
        success: true,
        message: 'Story cluster marked for processing',
        data: data
      })
    }

    return NextResponse.json(
      { error: 'Invalid action or missing cluster_id' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Story clusters processing error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process story cluster',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}