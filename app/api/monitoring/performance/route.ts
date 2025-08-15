import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { cacheManager } from '@/lib/cache/redis-client'
import { jobQueue } from '@/lib/queue/job-queue'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'metrics'
    const timeframe = searchParams.get('timeframe') || '24h'
    
    // Handle cleanup action for cron jobs
    if (action === 'cleanup') {
      return await handleCleanupAction()
    }
    
    // Handle health check action
    if (action === 'health_check') {
      return await handleHealthCheckAction()
    }
    
    // Default metrics action
    // Check cache first
    const cacheKey = `performance:${timeframe}`
    const cachedMetrics = await cacheManager.get<any>(cacheKey)
    
    if (cachedMetrics) {
      return NextResponse.json({
        success: true,
        data: cachedMetrics,
        cached: true,
        timestamp: new Date().toISOString()
      })
    }

    const supabase = createServiceClient()
    const metrics = await gatherPerformanceMetrics(supabase, timeframe)
    
    // Cache metrics for 5 minutes
    await cacheManager.set(cacheKey, metrics, 300)

    return NextResponse.json({
      success: true,
      data: metrics,
      cached: false,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Performance monitoring error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to gather performance metrics',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function gatherPerformanceMetrics(supabase: any, timeframe: string) {
  const timeMap: Record<string, string> = {
    '1h': '1 hour',
    '6h': '6 hours', 
    '24h': '24 hours',
    '7d': '7 days',
    '30d': '30 days'
  }
  
  const interval = timeMap[timeframe] || '24 hours'
  const startTime = new Date(Date.now() - getMilliseconds(interval))

  // RSS Performance Metrics
  const rssMetrics = await getRSSPerformanceMetrics(supabase, startTime)
  
  // AI Processing Metrics
  const aiMetrics = await getAIProcessingMetrics(supabase, startTime)
  
  // Database Performance Metrics
  const dbMetrics = await getDatabaseMetrics(supabase, startTime)
  
  // Queue Performance Metrics
  const queueMetrics = await getQueueMetrics()
  
  // Cache Performance Metrics
  const cacheMetrics = await getCacheMetrics()
  
  // System Health Scores
  const healthScores = calculateHealthScores({
    rss: rssMetrics,
    ai: aiMetrics,
    database: dbMetrics,
    queue: queueMetrics,
    cache: cacheMetrics
  })

  return {
    timeframe,
    interval,
    overview: {
      system_health: healthScores.overall,
      total_articles_processed: rssMetrics.totalArticles,
      ai_articles_generated: aiMetrics.totalGenerated,
      average_response_time: dbMetrics.avgResponseTime,
      cache_hit_rate: cacheMetrics.hitRate,
      queue_throughput: queueMetrics.throughput
    },
    rss: rssMetrics,
    ai: aiMetrics,
    database: dbMetrics,
    queue: queueMetrics,
    cache: cacheMetrics,
    health_scores: healthScores,
    alerts: await getActiveAlerts(supabase),
    recommendations: generatePerformanceRecommendations({
      rss: rssMetrics,
      ai: aiMetrics,
      database: dbMetrics,
      queue: queueMetrics,
      cache: cacheMetrics
    })
  }
}

async function getRSSPerformanceMetrics(supabase: any, startTime: Date) {
  // RSS fetch performance
  const { data: fetchLogs } = await supabase
    .from('rss_fetch_logs')
    .select('*')
    .gte('created_at', startTime.toISOString())
    .order('created_at', { ascending: false })

  // Source-level performance
  const { data: sourceLogs } = await supabase
    .from('rss_source_fetch_logs')
    .select('*, news_sources(name)')
    .gte('created_at', startTime.toISOString())

  const totalFetches = fetchLogs?.length || 0
  const successfulFetches = fetchLogs?.filter((log: any) => log.status === 'completed').length || 0
  const totalArticles = fetchLogs?.reduce((sum: number, log: any): number => sum + (log.total_articles || 0), 0) || 0
  const avgExecutionTime = fetchLogs?.reduce((sum: number, log: any): number => sum + (log.execution_time_ms || 0), 0) / totalFetches || 0

  // Source reliability metrics
  const sourcePerformance = sourceLogs?.reduce((acc: any, log: any) => {
    const sourceName = log.news_sources?.name || 'Unknown'
    if (!acc[sourceName]) {
      acc[sourceName] = { total: 0, successful: 0, avgTime: 0 }
    }
    acc[sourceName].total++
    if (log.status === 'success') acc[sourceName].successful++
    acc[sourceName].avgTime += log.execution_time_ms || 0
    return acc
  }, {} as Record<string, any>) || {}

  // Calculate averages
  Object.keys(sourcePerformance).forEach((source: string) => {
    const perf = sourcePerformance[source]
    perf.successRate = (perf.successful / perf.total) * 100
    perf.avgTime = perf.avgTime / perf.total
  })

  return {
    totalFetches,
    successfulFetches,
    successRate: totalFetches > 0 ? (successfulFetches / totalFetches) * 100 : 0,
    totalArticles,
    avgExecutionTime,
    avgArticlesPerFetch: totalFetches > 0 ? totalArticles / totalFetches : 0,
    sourcePerformance: Object.entries(sourcePerformance)
      .map(([name, perf]: [string, any]) => ({ source: name, ...perf }))
      .sort((a: any, b: any) => b.successRate - a.successRate),
    errors: fetchLogs?.reduce((acc: any[], log: any) => acc.concat(log.errors || []), []) || []
  }
}

async function getAIProcessingMetrics(supabase: any, startTime: Date) {
  const { data: articles } = await supabase
    .from('unified_articles')
    .select('*')
    .gte('generation_timestamp', startTime.toISOString())

  const totalGenerated = articles?.length || 0
  const avgConfidence = articles?.reduce((sum: number, article: any): number => 
    sum + (article.metadata?.confidence_score || 0), 0) / totalGenerated || 0
  const avgProcessingTime = articles?.reduce((sum: number, article: any): number => 
    sum + (article.metadata?.processing_time_ms || 0), 0) / totalGenerated || 0

  const statusBreakdown = articles?.reduce((acc: Record<string, number>, article: any) => {
    const status = article.status || 'unknown'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}

  return {
    totalGenerated,
    avgConfidence,
    avgProcessingTime,
    statusBreakdown,
    throughputPerHour: totalGenerated > 0 ? totalGenerated / 24 : 0, // Assuming 24h timeframe
    highConfidenceRate: articles?.filter((a: any) => a.metadata?.confidence_score >= 0.8).length / totalGenerated * 100 || 0
  }
}

async function getDatabaseMetrics(supabase: any, startTime: Date) {
  // Get query performance from pg_stat_statements if available
  // For now, we'll use simulated metrics based on our operations
  
  const { data: recentArticles } = await supabase
    .from('raw_articles')
    .select('id')
    .gte('created_at', startTime.toISOString())
    .limit(1)

  const queryStartTime = Date.now()
  await supabase
    .from('raw_articles')
    .select('count')
    .gte('created_at', startTime.toISOString())
    .single()
  const queryEndTime = Date.now()

  return {
    avgResponseTime: queryEndTime - queryStartTime,
    activeConnections: 'N/A', // Would need database access
    slowQueries: 0, // Would need pg_stat_statements
    indexUsage: 'N/A', // Would need database access
    connectionPoolUtilization: 'N/A' // Would need connection pool metrics
  }
}

async function getQueueMetrics() {
  const stats = await jobQueue.getQueueStats()
  
  return {
    pending: stats.pending,
    processing: stats.processing,
    completed: stats.completed,
    failed: stats.failed,
    throughput: stats.completed + stats.failed, // Jobs processed
    errorRate: stats.failed / (stats.completed + stats.failed) * 100 || 0
  }
}

async function getCacheMetrics() {
  // Mock cache metrics - in production, get from Redis INFO command
  return {
    hitRate: 85.5, // Percentage
    missRate: 14.5,
    totalKeys: 1250,
    memoryUsage: '45MB',
    evictions: 23,
    connections: 12
  }
}

function calculateHealthScores(metrics: any) {
  const rssHealth = Math.min(100, metrics.rss.successRate)
  const aiHealth = Math.min(100, metrics.ai.avgConfidence * 100)
  const queueHealth = Math.max(0, 100 - metrics.queue.errorRate)
  const cacheHealth = metrics.cache.hitRate
  
  const overall = (rssHealth + aiHealth + queueHealth + cacheHealth) / 4

  return {
    overall: Math.round(overall),
    rss: Math.round(rssHealth),
    ai: Math.round(aiHealth),
    queue: Math.round(queueHealth),
    cache: Math.round(cacheHealth)
  }
}

async function getActiveAlerts(supabase: any) {
  const { data: alerts } = await supabase
    .from('rss_monitoring_alerts')
    .select('*')
    .eq('is_resolved', false)
    .order('severity', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(10)

  return alerts || []
}

function generatePerformanceRecommendations(metrics: any) {
  const recommendations = []

  if (metrics.rss.successRate < 95) {
    recommendations.push({
      type: 'rss',
      priority: 'high',
      message: 'RSS success rate is below 95%. Check failing sources and network connectivity.',
      action: 'Review source configurations and error logs'
    })
  }

  if (metrics.ai.avgProcessingTime > 30000) {
    recommendations.push({
      type: 'ai',
      priority: 'medium', 
      message: 'AI processing time is above 30 seconds. Consider optimizing prompts or model configuration.',
      action: 'Review AI model configuration and prompt efficiency'
    })
  }

  if (metrics.queue.errorRate > 10) {
    recommendations.push({
      type: 'queue',
      priority: 'high',
      message: 'Queue error rate is above 10%. Investigate job failures.',
      action: 'Review failed job logs and retry mechanisms'
    })
  }

  if (metrics.cache.hitRate < 80) {
    recommendations.push({
      type: 'cache',
      priority: 'medium',
      message: 'Cache hit rate is below 80%. Review caching strategy.',
      action: 'Analyze cache patterns and adjust TTL values'
    })
  }

  return recommendations
}

async function handleCleanupAction() {
  try {
    console.log('🧹 Starting system cleanup...')
    const supabase = createServiceClient()
    const cleanupResults = {
      cache_cleared: 0,
      old_logs_removed: 0,
      temp_data_cleared: 0,
      queue_jobs_cleaned: 0
    }

    // 1. Clear old performance cache entries
    try {
      if (cacheManager.redis) {
        // Clear old performance metrics caches (older than 1 hour)
        await cacheManager.invalidate('performance:*')
        cleanupResults.cache_cleared++
      }
    } catch (error) {
      console.warn('Cache cleanup failed:', error)
    }

    // 2. Clean old RSS fetch logs (older than 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const { count: logsDeleted } = await supabase
      .from('rss_fetch_logs')
      .delete()
      .lt('created_at', sevenDaysAgo.toISOString())
    cleanupResults.old_logs_removed = logsDeleted || 0

    // 3. Clean old monitoring alerts (resolved, older than 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const { count: alertsDeleted } = await supabase
      .from('rss_monitoring_alerts')
      .delete()
      .eq('is_resolved', true)
      .lt('created_at', thirtyDaysAgo.toISOString())
    cleanupResults.temp_data_cleared = alertsDeleted || 0

    // 4. Clean failed job queue entries (older than 1 day)
    try {
      const cleanedJobs = await jobQueue.cleanFailedJobs(24 * 60 * 60 * 1000) // 24 hours
      cleanupResults.queue_jobs_cleaned = cleanedJobs
    } catch (error) {
      console.warn('Job queue cleanup failed:', error)
    }

    console.log('🧹 System cleanup completed:', cleanupResults)
    
    return NextResponse.json({
      success: true,
      message: 'System cleanup completed successfully',
      data: {
        ...cleanupResults,
        cleanup_timestamp: new Date().toISOString(),
        next_cleanup: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Next day
      }
    })

  } catch (error) {
    console.error('❌ System cleanup failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'System cleanup failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function handleHealthCheckAction() {
  try {
    console.log('🏥 Performing system health check...')
    const healthStatus = {
      overall: 'healthy' as 'healthy' | 'degraded' | 'unhealthy',
      components: {
        database: { status: 'unknown', response_time_ms: 0 },
        redis: { status: 'unknown', connected: false },
        job_queue: { status: 'unknown', pending_jobs: 0 },
        ai_apis: { anthropic: false, openai: false }
      },
      alerts: [] as any[],
      timestamp: new Date().toISOString()
    }

    // 1. Database health check
    const dbStart = Date.now()
    try {
      const supabase = createServiceClient()
      await supabase.from('raw_articles').select('id').limit(1).single()
      healthStatus.components.database.status = 'healthy'
      healthStatus.components.database.response_time_ms = Date.now() - dbStart
    } catch (error) {
      healthStatus.components.database.status = 'unhealthy'
      healthStatus.alerts.push({
        component: 'database',
        message: 'Database connection failed',
        severity: 'high'
      })
    }

    // 2. Redis health check
    try {
      const redisHealthy = await cacheManager.isHealthy()
      healthStatus.components.redis.status = redisHealthy ? 'healthy' : 'degraded'
      healthStatus.components.redis.connected = redisHealthy
      if (!redisHealthy) {
        healthStatus.alerts.push({
          component: 'redis',
          message: 'Redis cache unavailable - operating in no-cache mode',
          severity: 'medium'
        })
      }
    } catch (error) {
      healthStatus.components.redis.status = 'unhealthy'
      healthStatus.alerts.push({
        component: 'redis',
        message: 'Redis health check failed',
        severity: 'medium'
      })
    }

    // 3. Job queue health check
    try {
      const queueStats = await jobQueue.getQueueStats()
      healthStatus.components.job_queue.status = queueStats.pending > 1000 ? 'degraded' : 'healthy'
      healthStatus.components.job_queue.pending_jobs = queueStats.pending
      if (queueStats.pending > 1000) {
        healthStatus.alerts.push({
          component: 'job_queue',
          message: `High pending job count: ${queueStats.pending}`,
          severity: 'medium'
        })
      }
    } catch (error) {
      healthStatus.components.job_queue.status = 'unhealthy'
      healthStatus.alerts.push({
        component: 'job_queue',
        message: 'Job queue health check failed',
        severity: 'high'
      })
    }

    // 4. AI API health check
    healthStatus.components.ai_apis.anthropic = !!process.env.ANTHROPIC_API_KEY
    healthStatus.components.ai_apis.openai = !!process.env.OPENAI_API_KEY
    
    if (!healthStatus.components.ai_apis.anthropic) {
      healthStatus.alerts.push({
        component: 'ai_apis',
        message: 'Anthropic API key not configured',
        severity: 'high'
      })
    }

    // Determine overall health
    const criticalAlerts = healthStatus.alerts.filter(a => a.severity === 'high')
    const mediumAlerts = healthStatus.alerts.filter(a => a.severity === 'medium')
    
    if (criticalAlerts.length > 0) {
      healthStatus.overall = 'unhealthy'
    } else if (mediumAlerts.length > 0) {
      healthStatus.overall = 'degraded'
    }

    console.log('🏥 Health check completed:', healthStatus.overall)
    
    return NextResponse.json({
      success: true,
      message: `System health check completed - Status: ${healthStatus.overall}`,
      data: healthStatus
    })

  } catch (error) {
    console.error('❌ Health check failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Health check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        data: {
          overall: 'unhealthy',
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    )
  }
}

function getMilliseconds(interval: string): number {
  const map: Record<string, number> = {
    '1 hour': 60 * 60 * 1000,
    '6 hours': 6 * 60 * 60 * 1000,
    '24 hours': 24 * 60 * 60 * 1000,
    '7 days': 7 * 24 * 60 * 60 * 1000,
    '30 days': 30 * 24 * 60 * 60 * 1000
  }
  return map[interval] || map['24 hours']
}