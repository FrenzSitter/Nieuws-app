import { Redis } from '@upstash/redis'

// Initialize Redis client with fallback for local development
const redisUrl = process.env.REDIS_URL || process.env.UPSTASH_REDIS_REST_URL
const redisToken = process.env.REDIS_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

let redis: Redis | null = null

if (redisUrl && redisToken) {
  try {
    redis = new Redis({
      url: redisUrl,
      token: redisToken,
    })
  } catch (error) {
    console.warn('Redis initialization failed, falling back to no-cache mode:', error)
  }
} else {
  console.info('Redis not configured, operating in no-cache mode')
}

// Cache TTL settings (in seconds)
export const CACHE_TTL = {
  ARTICLES_LIST: 180,      // 3 minutes for article lists
  ARTICLE_DETAIL: 300,     // 5 minutes for individual articles
  RSS_STATUS: 300,         // 5 minutes for RSS status
  STORY_CLUSTERS: 120,     // 2 minutes for story clusters
  SOURCES: 3600,          // 1 hour for news sources
  CATEGORIES: 1800,       // 30 minutes for category data
}

// Cache key generators
export const CACHE_KEYS = {
  articlesList: (category: string = 'all', limit: number = 20) => 
    `articles:list:${category}:${limit}`,
  
  articleDetail: (id: string) => 
    `articles:detail:${id}`,
  
  rssStatus: () => 
    'rss:status',
  
  storyClusters: (limit: number = 10) => 
    `clusters:story:${limit}`,
  
  sources: (active: boolean = true) => 
    `sources:${active ? 'active' : 'all'}`,
  
  categoryArticles: (category: string, limit: number = 20) => 
    `category:${category}:articles:${limit}`,
}

// Cache operations with fallback
export async function getCached<T>(
  key: string, 
  fallback: () => Promise<T>,
  ttl?: number
): Promise<T> {
  if (!redis) {
    // No Redis, execute fallback directly
    return fallback()
  }

  try {
    // Try to get from cache
    const cached = await redis.get(key)
    if (cached) {
      console.log(`Cache hit: ${key}`)
      return cached as T
    }

    // Cache miss, execute fallback
    console.log(`Cache miss: ${key}`)
    const data = await fallback()
    
    // Store in cache with TTL
    if (data !== null && data !== undefined) {
      await redis.set(key, JSON.stringify(data), {
        ex: ttl || CACHE_TTL.ARTICLES_LIST
      })
    }
    
    return data
  } catch (error) {
    console.error(`Cache operation failed for ${key}:`, error)
    // Fallback to direct execution on cache error
    return fallback()
  }
}

// Invalidate cache patterns
export async function invalidateCache(pattern: string): Promise<void> {
  if (!redis) return

  try {
    // For Upstash Redis, we need to handle pattern deletion differently
    // Since SCAN is not available in all Redis providers
    if (pattern.includes('*')) {
      // Pattern-based invalidation not supported in Upstash free tier
      // Implement specific key invalidation instead
      console.warn('Pattern invalidation not available, implement specific keys')
    } else {
      // Direct key deletion
      await redis.del(pattern)
      console.log(`Cache invalidated: ${pattern}`)
    }
  } catch (error) {
    console.error(`Cache invalidation failed for ${pattern}:`, error)
  }
}

// Batch cache operations for efficiency
export async function getCachedBatch<T>(
  keys: string[],
  fallbacks: Map<string, () => Promise<T>>,
  ttl?: number
): Promise<Map<string, T>> {
  const results = new Map<string, T>()
  
  if (!redis) {
    // No Redis, execute all fallbacks
    const fallbackEntries = Array.from(fallbacks.entries())
    for (const [key, fallback] of fallbackEntries) {
      results.set(key, await fallback())
    }
    return results
  }

  try {
    // Try to get all keys from cache
    const cached = await Promise.all(keys.map(key => redis!.get(key)))
    
    // Process each key
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i]
      const cachedValue = cached[i]
      
      if (cachedValue) {
        console.log(`Batch cache hit: ${key}`)
        results.set(key, cachedValue as T)
      } else {
        console.log(`Batch cache miss: ${key}`)
        const fallback = fallbacks.get(key)
        if (fallback) {
          const data = await fallback()
          results.set(key, data)
          
          // Store in cache with TTL
          if (data !== null && data !== undefined) {
            await redis.set(key, JSON.stringify(data), {
              ex: ttl || CACHE_TTL.ARTICLES_LIST
            })
          }
        }
      }
    }
    
    return results
  } catch (error) {
    console.error('Batch cache operation failed:', error)
    // Fallback to executing all functions
    const fallbackEntries = Array.from(fallbacks.entries())
    for (const [key, fallback] of fallbackEntries) {
      results.set(key, await fallback())
    }
    return results
  }
}

// Health check for Redis connection
export async function isRedisHealthy(): Promise<boolean> {
  if (!redis) return false
  
  try {
    await redis.ping()
    return true
  } catch {
    return false
  }
}

// Cache manager object voor eenvoudige imports
export const cacheManager = {
  // Wrapper voor getCached met optionele fallback
  get: async <T>(key: string, fallback?: () => Promise<T>, ttl?: number): Promise<T | null> => {
    if (!fallback) {
      // Als geen fallback, probeer alleen cache te lezen
      if (!redis) return null
      try {
        const cached = await redis.get(key)
        return cached as T || null
      } catch {
        return null
      }
    }
    return getCached(key, fallback, ttl)
  },
  
  // Direct cache functies
  set: async (key: string, value: any, ttl?: number) => {
    if (!redis) return
    try {
      await redis.set(key, JSON.stringify(value), { ex: ttl || CACHE_TTL.ARTICLES_LIST })
    } catch (error) {
      console.error(`Cache set failed for ${key}:`, error)
    }
  },
  
  invalidate: invalidateCache,
  getBatch: getCachedBatch,
  isHealthy: isRedisHealthy,
  keys: CACHE_KEYS,
  ttl: CACHE_TTL,
  redis
}

export { redis }