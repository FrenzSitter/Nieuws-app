'use client'

import { useState, useEffect } from 'react'
import ManifestBar from '@/components/ManifestBar'
import CategoryNav from '@/components/CategoryNav'
import NewsCard from '@/components/NewsCard'

interface Article {
  id: string
  title: string
  description: string
  publishedAt: string
  source: {
    name: string
    credibilityScore: number
    politicalLeaning: string
  }
  categories: string[]
  readingTime: number
}

export default function Home() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRealArticles = async () => {
      try {
        setLoading(true)
        
        // Force fetch from our API to get REAL data
        const response = await fetch('/api/articles/recent?limit=12&nocache=' + Date.now())
        
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (!data.success) {
          throw new Error(data.message || 'API returned error')
        }
        
        console.log('✅ REAL DATA LOADED:', data.data.length, 'articles')
        console.log('✅ First article title:', data.data[0]?.title)
        
        setArticles(data.data)
        setError(null)
      } catch (err) {
        console.error('❌ Failed to load real articles:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setArticles([]) // NO FALLBACK TO SAMPLE DATA!
      } finally {
        setLoading(false)
      }
    }

    fetchRealArticles()
  }, [])

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="-mt-12">
          <ManifestBar />
        </div>
        <CategoryNav />
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nonbulla-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-gray-100 mb-2">
            Laden van echte nieuwsartikelen...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Ophalen van RSS feeds uit database...
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="-mt-12">
          <ManifestBar />
        </div>
        <CategoryNav />
        <div className="text-center py-16">
          <h2 className="text-2xl font-display font-bold text-red-600 mb-4">
            Fout bij laden van artikelen
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-nonbulla-blue-600 text-white rounded-lg hover:bg-nonbulla-blue-700 transition-colors"
          >
            Probeer opnieuw
          </button>
        </div>
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="space-y-8">
        <div className="-mt-12">
          <ManifestBar />
        </div>
        <CategoryNav />
        <div className="text-center py-16">
          <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-gray-100 mb-4">
            Geen artikelen gevonden
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            RSS feeds worden elke 2 uur bijgewerkt. Even geduld...
          </p>
        </div>
      </div>
    )
  }

  // Transform articles for UI
  const latestNews = articles.map((article, index) => ({
    id: article.id,
    title: article.title,
    summary: article.description || 'Geen samenvatting beschikbaar',
    imageUrl: '', 
    publishedAt: article.publishedAt,
    sources: [{ name: article.source.name }],
    category: article.categories?.[0] || 'algemeen',
    readingTime: article.readingTime || 1,
    isPerspective: false,
    perspectiveCount: 1
  }))

  return (
    <div className="space-y-8">
      {/* Manifest Bar */}
      <div className="-mt-12">
        <ManifestBar />
      </div>

      {/* Category Navigation */}
      <CategoryNav />

      {/* SUCCESS MESSAGE */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <span className="font-semibold text-green-800 dark:text-green-200">
            ✅ ECHTE DATA GELADEN! {articles.length} artikelen van RSS feeds
          </span>
        </div>
        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
          Eerste artikel: "{articles[0]?.title}" van {articles[0]?.source.name}
        </p>
      </div>

      {/* Real Articles */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-gray-100">
            Laatste Nieuws (Live RSS Data)
          </h2>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Direct van Nederlandse nieuwsbronnen</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {latestNews.map((article) => (
            <NewsCard
              key={article.id}
              id={article.id}
              title={article.title}
              summary={article.summary}
              imageUrl={article.imageUrl}
              publishedAt={article.publishedAt}
              sources={article.sources}
              category={article.category}
              readingTime={article.readingTime}
              isPerspective={article.isPerspective}
              perspectiveCount={article.perspectiveCount}
            />
          ))}
        </div>
      </div>

      {/* Debug Info */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-sm">
        <h3 className="font-semibold mb-2">Debug Info:</h3>
        <ul className="space-y-1 text-gray-600 dark:text-gray-400">
          <li>• Geladen artikelen: {articles.length}</li>
          <li>• Data bron: Client-side fetch van /api/articles/recent</li>
          <li>• Geen sample data: Alle sample bestanden zijn verwijderd</li>
          <li>• Update tijd: {new Date().toLocaleString('nl-NL')}</li>
        </ul>
      </div>
    </div>
  )
}