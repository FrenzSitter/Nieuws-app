import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { jobQueue } from '@/lib/queue/job-queue'
import { cacheManager } from '@/lib/cache/redis-client'

interface WebhookPayload {
  event: 'article_created' | 'article_updated' | 'cluster_ready' | 'ai_generated'
  data: any
  timestamp: string
  source: string
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature
    const signature = request.headers.get('x-webhook-signature')
    const expectedSignature = process.env.WEBHOOK_SECRET
    
    if (!signature || signature !== expectedSignature) {
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 401 }
      )
    }

    const payload: WebhookPayload = await request.json()
    console.log(`📡 Webhook received: ${payload.event} from ${payload.source}`)

    const supabase = createServiceClient()

    switch (payload.event) {
      case 'article_created':
        await handleArticleCreated(payload.data, supabase)
        break
        
      case 'cluster_ready':
        await handleClusterReady(payload.data, supabase)
        break
        
      case 'ai_generated':
        await handleAIGenerated(payload.data, supabase)
        break
        
      default:
        console.warn(`Unknown webhook event: ${payload.event}`)
    }

    return NextResponse.json({
      success: true,
      message: `Webhook ${payload.event} processed successfully`,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Webhook processing error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Webhook processing failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function handleArticleCreated(data: any, supabase: any) {
  const { article, source } = data
  
  // Trigger cross-reference analysis for primary sources
  if (source.tier === 'primary' && source.cross_reference_required) {
    console.log(`🔍 Triggering cross-reference analysis for article: ${article.title}`)
    
    await jobQueue.addJob('cross_reference_analyze', {
      articleId: article.id,
      sourceId: source.id,
      title: article.title,
      content: article.content
    }, { priority: 8 })
  }

  // Invalidate relevant caches
  await cacheManager.invalidate('articles:*')
  await cacheManager.invalidate('clusters:*')
  
  // Send real-time notifications to connected clients
  await sendRealtimeNotification({
    type: 'new_article',
    data: {
      title: article.title,
      source: source.name,
      category: source.category,
      url: article.url
    }
  })
}

async function handleClusterReady(data: any, supabase: any) {
  const { clusterId, sources, articleCount } = data
  
  console.log(`📊 Cluster ready for AI processing: ${clusterId} (${articleCount} articles from ${sources.length} sources)`)
  
  // Queue AI article generation
  await jobQueue.addJob('ai_generate_article', {
    clusterId: clusterId
  }, { 
    priority: 7,
    delay: 5000 // Small delay to allow for any final articles
  })

  // Update cluster status
  await supabase
    .from('story_clusters')
    .update({ 
      processing_status: 'analyzing',
      updated_at: new Date().toISOString()
    })
    .eq('id', clusterId)

  // Send notification
  await sendRealtimeNotification({
    type: 'cluster_ready',
    data: {
      clusterId,
      articleCount,
      sourceCount: sources.length
    }
  })
}

async function handleAIGenerated(data: any, supabase: any) {
  const { articleId, title, clusterId, confidence } = data
  
  console.log(`🤖 AI article generated: ${title} (confidence: ${confidence})`)
  
  // If high confidence, auto-publish
  if (confidence >= 0.8) {
    await supabase
      .from('unified_articles')
      .update({ 
        status: 'published',
        published_at: new Date().toISOString()
      })
      .eq('id', articleId)
    
    console.log(`✅ Auto-published high-confidence article: ${title}`)
  }

  // Invalidate article caches
  await cacheManager.invalidate('articles:*')
  await cacheManager.invalidate('unified:*')

  // Send notification
  await sendRealtimeNotification({
    type: 'ai_article_ready',
    data: {
      articleId,
      title,
      clusterId,
      confidence,
      autoPublished: confidence >= 0.8
    }
  })
}

async function sendRealtimeNotification(notification: any) {
  // Integration with WebSocket or Server-Sent Events
  // For now, we'll use a simple webhook approach
  const webhookUrls = process.env.REALTIME_WEBHOOK_URLS?.split(',') || []
  
  for (const url of webhookUrls) {
    try {
      await fetch(url.trim(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Source': 'nieuws-app'
        },
        body: JSON.stringify({
          type: 'realtime_notification',
          ...notification,
          timestamp: new Date().toISOString()
        })
      })
    } catch (error) {
      console.error(`Failed to send notification to ${url}:`, error)
    }
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Webhook endpoint is healthy',
    timestamp: new Date().toISOString()
  })
}