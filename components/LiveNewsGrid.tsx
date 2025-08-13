'use client'

import { useState, useEffect } from 'react'
import NewsCard from './NewsCard'
import { Clock, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react'

interface LiveArticle {
  id: string
  title: string
  description: string
  url: string
  publishedAt: string
  author?: string
  categories: string[]
  source: {
    name: string
    credibilityScore: number
    politicalLeaning: string
  }
  qualityScore: number
  readingTime?: number
  wordCount?: number
}

interface LiveNewsGridProps {
  category?: string
  limit?: number
  autoRefresh?: boolean
  refreshInterval?: number
}

export default function LiveNewsGrid({ 
  category = 'all', 
  limit = 12,
  autoRefresh = true,
  refreshInterval = 300000 // 5 minutes
}: LiveNewsGridProps) {
  const [articles, setArticles] = useState<LiveArticle[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchArticles = async () => {
    try {
      setError(null)
      
      const params = new URLSearchParams({
        limit: limit.toString(),
        ...(category !== 'all' && { category })
      })

      const response = await fetch(`/api/articles/recent?${params}`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch articles: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.success) {
        setArticles(result.data)
        setLastUpdated(new Date())
        console.log(`✅ Loaded ${result.data.length} live articles`)
      } else {
        throw new Error(result.message || 'Failed to load articles')
      }

    } catch (error) {
      console.error('Error fetching articles:', error)
      setError(error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    fetchArticles()
  }, [category, limit])

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing articles...')
      fetchArticles()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, category, limit])

  const handleRefresh = () => {
    setLoading(true)
    fetchArticles()
  }

  const formatLastUpdated = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Zojuist bijgewerkt'
    if (diffMins === 1) return '1 minuut geleden bijgewerkt'
    if (diffMins < 60) return `${diffMins} minuten geleden bijgewerkt`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours === 1) return '1 uur geleden bijgewerkt'
    if (diffHours < 24) return `${diffHours} uur geleden bijgewerkt`
    
    return date.toLocaleDateString('nl-NL', { 
      day: 'numeric', 
      month: 'long', 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (loading && articles.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {category === 'all' ? 'Laatste Nieuws' : `${category.charAt(0).toUpperCase() + category.slice(1)} Nieuws`}
          </h2>
          <div className="flex items-center gap-2 text-gray-500">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span className="text-sm">Laden...</span>
          </div>
        </div>
        
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-48 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Laatste Nieuws
          </h2>
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Opnieuw proberen
          </button>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-200 mb-1">
                Fout bij laden van artikelen
              </h3>
              <p className="text-red-700 dark:text-red-300">
                {error}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header met status */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {category === 'all' ? 'Laatste Nieuws' : `${category.charAt(0).toUpperCase() + category.slice(1)} Nieuws`}
          <span className="ml-3 text-lg font-normal text-gray-500">
            ({articles.length} {articles.length === 1 ? 'artikel' : 'artikelen'})
          </span>
        </h2>
        
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <CheckCircle className="w-4 h-4 text-green-500" />
              {formatLastUpdated(lastUpdated)}
            </div>
          )}
          
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-nonbulla-blue-600 text-white rounded-lg hover:bg-nonbulla-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Vernieuwen
          </button>
        </div>
      </div>

      {/* Live indicator */}
      {autoRefresh && (
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span>Live updates elke {Math.floor(refreshInterval / 60000)} minuten</span>
        </div>
      )}

      {/* Articles grid */}
      {articles.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-12 text-center">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Geen artikelen gevonden
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {category === 'all' 
              ? 'Er zijn momenteel geen artikelen beschikbaar.' 
              : `Er zijn geen artikelen in de categorie '${category}' gevonden.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {articles.map((article) => (
            <NewsCard
              key={article.id}
              id={article.id}
              title={article.title}
              summary={article.description}
              imageUrl="/api/placeholder/400/240"
              publishedAt={article.publishedAt}
              sources={[article.source.name]}
              category={article.categories[0] || 'algemeen'}
              readingTime={article.readingTime || Math.ceil((article.wordCount || 200) / 200)}
              href={article.url}
            />
          ))}
        </div>
      )}
    </div>
  )
}