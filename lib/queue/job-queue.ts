import { cacheManager } from '../cache/redis-client'

interface Job {
  id: string
  type: JobType
  payload: any
  priority: number
  retryCount: number
  maxRetries: number
  createdAt: Date
  scheduledAt?: Date
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

type JobType = 
  | 'rss_fetch_single'
  | 'rss_fetch_batch' 
  | 'ai_generate_article'
  | 'cross_reference_analyze'
  | 'story_cluster_process'
  | 'webhook_delivery'

interface JobHandler {
  (payload: any): Promise<any>
}

class JobQueue {
  private handlers: Map<JobType, JobHandler> = new Map()
  private isProcessing = false
  private concurrency = 3
  private processingJobs = new Set<string>()

  constructor() {
    this.setupHandlers()
  }

  private setupHandlers() {
    // RSS fetching handler
    this.handlers.set('rss_fetch_single', async (payload) => {
      const { sourceId, feedUrl } = payload
      const { rssManager } = await import('../rss-parser')
      
      const items = await rssManager.parseRSSFeed(feedUrl)
      return await rssManager.saveArticlesToDatabase(items, sourceId)
    })

    // AI article generation handler
    this.handlers.set('ai_generate_article', async (payload) => {
      const { clusterId } = payload
      const { aiPerspectiveEngineClaude } = await import('../ai-perspective-engine-claude')
      
      return await aiPerspectiveEngineClaude.generateUnifiedArticle(clusterId)
    })

    // Cross-reference analysis handler
    this.handlers.set('cross_reference_analyze', async (payload) => {
      const { clusterId } = payload
      const { crossReferenceEngine } = await import('../cross-reference-engine')
      
      return await crossReferenceEngine.analyzeStoryCluster(clusterId)
    })

    // Webhook delivery handler
    this.handlers.set('webhook_delivery', async (payload) => {
      const { url, data, retryCount = 0 } = payload
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error(`Webhook delivery failed: ${response.status}`)
      }

      return { status: response.status, delivered: true }
    })
  }

  async addJob(type: JobType, payload: any, options: {
    priority?: number
    delay?: number
    maxRetries?: number
  } = {}): Promise<string> {
    const job: Job = {
      id: `job:${type}:${Date.now()}:${Math.random().toString(36).substr(2, 9)}`,
      type,
      payload,
      priority: options.priority || 5,
      retryCount: 0,
      maxRetries: options.maxRetries || 3,
      createdAt: new Date(),
      scheduledAt: options.delay ? new Date(Date.now() + options.delay) : undefined,
      status: 'pending'
    }

    await this.persistJob(job)
    
    // Start processing if not already running
    if (!this.isProcessing) {
      this.startProcessing()
    }

    return job.id
  }

  private async persistJob(job: Job): Promise<void> {
    const key = `job:${job.id}`
    await cacheManager.set(key, job, 3600) // 1 hour TTL
    
    // Add to priority queue
    const queueKey = 'job_queue:pending'
    const score = job.priority * 1000 + (job.scheduledAt?.getTime() || Date.now())
    
    // Using Redis ZADD functionality through our cache manager
    // Note: This is simplified - in production, use a proper Redis queue like Bull or Bee-Queue
    const currentQueue = await cacheManager.get<string[]>(queueKey) || []
    currentQueue.push(job.id)
    await cacheManager.set(queueKey, currentQueue, 3600)
  }

  private async startProcessing(): Promise<void> {
    if (this.isProcessing) return
    
    this.isProcessing = true
    console.log('🔄 Job queue processing started')

    while (this.isProcessing) {
      try {
        if (this.processingJobs.size >= this.concurrency) {
          await new Promise(resolve => setTimeout(resolve, 1000))
          continue
        }

        const job = await this.getNextJob()
        if (!job) {
          await new Promise(resolve => setTimeout(resolve, 2000))
          continue
        }

        // Process job concurrently
        this.processJob(job).catch(error => {
          console.error(`Job ${job.id} processing error:`, error)
        })

      } catch (error) {
        console.error('Job queue processing error:', error)
        await new Promise(resolve => setTimeout(resolve, 5000))
      }
    }
  }

  private async getNextJob(): Promise<Job | null> {
    const queueKey = 'job_queue:pending'
    const jobIds = await cacheManager.get<string[]>(queueKey) || []
    
    for (const jobId of jobIds) {
      const job = await cacheManager.get<Job>(`job:${jobId}`)
      if (!job || this.processingJobs.has(job.id)) continue
      
      // Check if job is scheduled for the future
      if (job.scheduledAt && job.scheduledAt > new Date()) continue
      
      return job
    }
    
    return null
  }

  private async processJob(job: Job): Promise<void> {
    this.processingJobs.add(job.id)
    
    try {
      console.log(`⚡ Processing job ${job.id} (${job.type})`)
      
      job.status = 'processing'
      await this.updateJob(job)

      const handler = this.handlers.get(job.type)
      if (!handler) {
        throw new Error(`No handler found for job type: ${job.type}`)
      }

      const result = await handler(job.payload)
      
      job.status = 'completed'
      await this.updateJob(job)
      
      console.log(`✅ Job ${job.id} completed successfully`)
      
      // Trigger webhooks for completed jobs
      await this.triggerWebhooks(job, result)

    } catch (error) {
      console.error(`❌ Job ${job.id} failed:`, error)
      
      job.retryCount++
      
      if (job.retryCount <= job.maxRetries) {
        job.status = 'pending'
        job.scheduledAt = new Date(Date.now() + Math.pow(2, job.retryCount) * 1000) // Exponential backoff
        await this.updateJob(job)
        console.log(`🔄 Job ${job.id} scheduled for retry ${job.retryCount}/${job.maxRetries}`)
      } else {
        job.status = 'failed'
        await this.updateJob(job)
        console.log(`💀 Job ${job.id} failed permanently after ${job.maxRetries} retries`)
      }
    } finally {
      this.processingJobs.delete(job.id)
    }
  }

  private async updateJob(job: Job): Promise<void> {
    const key = `job:${job.id}`
    await cacheManager.set(key, job, 3600)
  }

  private async triggerWebhooks(job: Job, result: any): Promise<void> {
    // Webhook URLs from environment
    const webhookUrls = process.env.WEBHOOK_URLS?.split(',') || []
    
    for (const url of webhookUrls) {
      try {
        await this.addJob('webhook_delivery', {
          url: url.trim(),
          data: {
            jobId: job.id,
            jobType: job.type,
            status: job.status,
            result: result,
            timestamp: new Date().toISOString()
          }
        }, { priority: 3 })
      } catch (error) {
        console.error(`Failed to queue webhook for ${url}:`, error)
      }
    }
  }

  async stopProcessing(): Promise<void> {
    this.isProcessing = false
    console.log('🛑 Job queue processing stopped')
  }

  async getJobStatus(jobId: string): Promise<Job | null> {
    return await cacheManager.get<Job>(`job:${jobId}`)
  }

  async getQueueStats(): Promise<{
    pending: number
    processing: number
    completed: number
    failed: number
  }> {
    const queueKey = 'job_queue:pending'
    const jobIds = await cacheManager.get<string[]>(queueKey) || []
    
    const stats = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0
    }

    for (const jobId of jobIds) {
      const job = await cacheManager.get<Job>(`job:${jobId}`)
      if (job) {
        stats[job.status]++
      }
    }

    return stats
  }
}

export const jobQueue = new JobQueue()