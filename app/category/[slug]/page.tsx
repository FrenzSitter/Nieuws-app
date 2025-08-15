'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import CategoryNav from '@/components/CategoryNav'
import NewsCard from '@/components/NewsCard'


const categoryMap: Record<string, string> = {
  'politiek': 'Politiek',
  'economie': 'Economie', 
  'oorlog': 'Oorlog',
  'wetenschap': 'Wetenschap',
  'technologie': 'Technologie',
  'feiten': 'Feiten'
}

const categoryDescriptions: Record<string, string> = {
  'politiek': 'Politieke ontwikkelingen vanuit meerdere perspectieven. Van lokale besluitvorming tot internationale betrekkingen.',
  'economie': 'Economische trends en analyses met impact op samenleving en bedrijfsleven.',
  'oorlog': 'Conflicten en veiligheidskwesties wereldwijd met gebalanceerde berichtgeving.',
  'wetenschap': 'Wetenschappelijke doorbraken, onderzoek en innovaties die ons leven veranderen.',
  'technologie': 'Technologische ontwikkelingen, digitale transformatie en hun maatschappelijke impact.',
  'feiten': 'Fact-checks, onderzoeksjournalistiek en verificatie van nieuwsfeiten.'
}


export default function CategoryPage() {
  const params = useParams()
  const slug = params?.slug as string
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [isUnifiedContent, setIsUnifiedContent] = useState(false)

  const categoryName = categoryMap[slug] || 'Categorie'
  const description = categoryDescriptions[slug] || ''

  useEffect(() => {
    console.log(`🚀 Loading articles for category: ${categoryName}...`)
    
    // Try to fetch AI-generated articles for this category
    const apiUrl = `/api/ai/generate-article?action=recent&limit=10&category=${slug}&t=${Date.now()}`
    
    fetch(apiUrl)
      .then(response => response.json())
      .then(data => {
        console.log(`🧠 AI Articles for ${categoryName}:`, data)
        
        if (data.success && data.data?.articles && data.data.articles.length > 0) {
          console.log('✅ SUCCESS! Got', data.data.articles.length, `AI articles for ${categoryName}`)
          setArticles(data.data.articles.map((article: any) => ({
            ...article,
            sources: article.source_names ? article.source_names.split(',').slice(0, 5) : [`${article.sources_count} bronnen`],
            publishedAt: article.generated_at,
            summary: article.summary || `AI-gegenereerde samenvatting van ${article.sources_count} nieuwsbronnen`,
            isUnified: true,
            sourcesCount: article.sources_count,
            politicalLeaning: article.political_leaning || 'balanced',
            category: categoryName,
            readingTime: Math.ceil((article.content?.length || 1000) / 200) || 3,
            isPerspective: true,
            perspectiveCount: article.sources_count
          })))
          setIsUnifiedContent(true)
          setLoading(false)
        } else {
          console.log('⚠️ No AI articles for category, falling back to raw articles...')
          
          // Fallback to raw articles for this category
          return fetch(`/api/articles/recent?limit=10&category=${slug}&t=${Date.now()}`)
        }
      })
      .then(response => {
        if (!response) return null
        console.log('📡 Raw Articles Response status:', response.status)
        return response.json()
      })
      .then(data => {
        if (!data) return
        console.log('📋 Raw Articles Response:', data)
        
        if (data.success && data.data) {
          console.log('✅ FALLBACK SUCCESS! Got', data.data.length, 'raw articles')
          setArticles(data.data.map((article: any) => ({
            ...article,
            sources: [article.source?.name || 'Onbekende bron'],
            summary: article.description || 'Geen samenvatting beschikbaar',
            category: categoryName,
            readingTime: 3,
            isPerspective: false,
            perspectiveCount: 1,
            isUnified: false
          })))
          setIsUnifiedContent(false)
        } else {
          console.error('❌ Both APIs failed for category:', data)
          setError('Geen artikelen gevonden voor deze categorie')
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('🔥 Fetch Error:', err)
        setError(err.message)
        setLoading(false)
      })
  }, [slug, categoryName])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <CategoryNav currentCategory={slug} />
        <div className="max-w-[1320px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="py-16 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-nonbulla-blue-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Laden van {categoryName} artikelen...
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Zoeken naar multi-perspectief content
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <CategoryNav currentCategory={slug} />
        <div className="max-w-[1320px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="py-16 text-center">
            <div className="text-red-600 text-6xl mb-4">⚠️</div>
            <h1 className="text-3xl font-bold text-red-800 dark:text-red-400 mb-4">
              Fout bij laden van artikelen
            </h1>
            <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200"
            >
              Probeer opnieuw
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <CategoryNav currentCategory={slug} />
        <div className="max-w-[1320px] mx-auto px-6 sm:px-8 lg:px-12">
          <div className="py-16 text-center">
            <div className="text-gray-400 text-6xl mb-4">📰</div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              Geen {categoryName} artikelen gevonden
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Er zijn momenteel geen artikelen beschikbaar voor deze categorie.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Category Navigation */}
      <CategoryNav currentCategory={slug} />
      
      <div className="max-w-[1320px] mx-auto px-6 sm:px-8 lg:px-12">
        {/* Header */}
        <div className="py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {categoryName}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {description}
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              {isUnifiedContent 
                ? `${articles.length} AI-gegenereerde syntheses van meerdere bronnen` 
                : `${articles.length} artikelen van Nederlandse nieuwsbronnen`
              }
            </p>
            {isUnifiedContent && (
              <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI-gegenereerd
              </div>
            )}
          </div>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 pb-12">
          {articles.map((article) => (
            <NewsCard
              key={article.id}
              id={article.id}
              title={article.title}
              summary={article.summary}
              imageUrl={article.image_url}
              publishedAt={article.publishedAt}
              sources={article.sources}
              category={article.category}
              readingTime={article.readingTime}
              isPerspective={article.isPerspective}
              perspectiveCount={article.perspectiveCount}
              isUnified={article.isUnified}
              sourcesCount={article.sourcesCount}
              politicalLeaning={article.politicalLeaning}
            />
          ))}
        </div>
        
        {/* Load more section */}
        {articles.length > 0 && (
          <div className="text-center py-8">
            <button className="px-6 py-3 bg-nonbulla-blue-600 hover:bg-nonbulla-blue-700 text-white rounded-lg font-medium transition-colors duration-200">
              Meer {categoryName.toLowerCase()} artikelen laden
            </button>
          </div>
        )}
      </div>
    </div>
  )
}