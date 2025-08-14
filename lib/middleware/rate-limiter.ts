import { NextRequest } from 'next/server'
import { cacheManager } from '../cache/redis-client'

interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  skipSuccessfulRequests: boolean
  skipFailedRequests: boolean
}

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  resetTime: number
}

class RateLimiter {
  private config: RateLimitConfig

  constructor(config: Partial<RateLimitConfig> = {}) {
    this.config = {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 100,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...config
    }
  }

  async checkLimit(request: NextRequest, identifier?: string): Promise<RateLimitResult> {
    const clientIdentifier = identifier || this.getClientIdentifier(request)
    const windowStart = Math.floor(Date.now() / this.config.windowMs)
    const key = `rate_limit:${clientIdentifier}:${windowStart}`

    try {
      const current = await cacheManager.get<number>(key) || 0
      const resetTime = (windowStart + 1) * this.config.windowMs

      if (current >= this.config.maxRequests) {
        return {
          success: false,
          limit: this.config.maxRequests,
          remaining: 0,
          resetTime
        }
      }

      // Increment counter
      await cacheManager.set(key, current + 1, Math.ceil(this.config.windowMs / 1000))

      return {
        success: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests - current - 1,
        resetTime
      }
    } catch (error) {
      console.error('Rate limiting error:', error)
      // Fail open - allow request if Redis is down
      return {
        success: true,
        limit: this.config.maxRequests,
        remaining: this.config.maxRequests - 1,
        resetTime: Date.now() + this.config.windowMs
      }
    }
  }

  private getClientIdentifier(request: NextRequest): string {
    // Try to get IP from various headers (Vercel, Cloudflare, etc.)
    const forwardedFor = request.headers.get('x-forwarded-for')
    const realIp = request.headers.get('x-real-ip')
    const remoteAddress = request.headers.get('x-vercel-forwarded-for')
    
    const ip = forwardedFor?.split(',')[0]?.trim() || 
               realIp || 
               remoteAddress || 
               'unknown'
    
    return `ip:${ip}`
  }
}

// Pre-configured rate limiters for different endpoints
export const rateLimiters = {
  // General API rate limiting
  general: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100
  }),

  // RSS fetch operations (more restrictive)
  rssFetch: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute  
    maxRequests: 10
  }),

  // AI processing (very restrictive)
  aiProcessing: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5
  }),

  // Public article access
  publicArticles: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 200
  })
}

export function createRateLimitMiddleware(limiter: RateLimiter) {
  return async (request: NextRequest) => {
    const result = await limiter.checkLimit(request)
    
    if (!result.success) {
      return Response.json(
        {
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. Try again later.',
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': result.limit.toString(),
            'X-RateLimit-Remaining': result.remaining.toString(),
            'X-RateLimit-Reset': result.resetTime.toString(),
            'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
          }
        }
      )
    }

    return null // Continue to actual handler
  }
}