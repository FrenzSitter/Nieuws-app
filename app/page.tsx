'use client'

import { useState, useEffect } from 'react'

export default function Home() {
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [isUnifiedContent, setIsUnifiedContent] = useState(false)

  useEffect(() => {
    console.log('🚀 Starting to fetch articles - trying unified first, then raw...')
    
    // Try unified articles first (AI-generated content)
    fetch('/api/ai/generate-article?action=recent&limit=10&t=' + Date.now())
      .then(response => response.json())
      .then(data => {
        console.log('🧠 AI Unified Articles Response:', data)
        
        if (data.success && data.data?.articles && data.data.articles.length > 0) {
          console.log('✅ SUCCESS! Got', data.data.articles.length, 'unified AI articles')
          console.log('🎯 First unified article:', data.data.articles[0]?.title)
          setArticles(data.data.articles.map((article: any) => ({
            ...article,
            source: { name: `${article.sources_count} bronnen`, credibilityScore: 90, politicalLeaning: 'balanced' },
            publishedAt: article.generated_at,
            description: `Samenvatting van ${article.sources_count} nieuwsbronnen`,
            isUnified: true
          })))
          setIsUnifiedContent(true)
          setLoading(false)
        } else {
          console.log('⚠️ No unified articles available, falling back to raw articles...')
          
          // Fallback to raw articles
          return fetch('/api/articles/recent?limit=10&t=' + Date.now())
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
          console.log('🎯 First raw article:', data.data[0]?.title)
          setArticles(data.data)
          setIsUnifiedContent(false)
        } else {
          console.error('❌ Both APIs failed:', data)
          setError(JSON.stringify(data))
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('🔥 Fetch Error:', err)
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold">Laden van ECHTE artikelen...</h1>
          <p className="text-gray-600">Direct van Nederlandse nieuwsbronnen via RSS feeds</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-red-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-red-800 mb-4">❌ Fout bij laden van artikelen</h1>
          <div className="bg-white p-4 rounded border">
            <pre className="text-sm text-red-600">{error}</pre>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
          >
            Probeer opnieuw
          </button>
        </div>
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <div className="min-h-screen bg-yellow-100 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-yellow-800 mb-4">⚠️ Geen artikelen gevonden</h1>
          <p className="text-yellow-700">De RSS feeds worden elke 2 uur bijgewerkt.</p>
        </div>
      </div>
    )
  }

  // SUCCESS STATE - Show real articles!
  return (
    <div className="min-h-screen bg-green-50 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* SUCCESS HEADER */}
        <div className={`${isUnifiedContent ? 'bg-purple-600' : 'bg-green-600'} text-white p-6 rounded-lg mb-8 text-center`}>
          <h1 className="text-4xl font-bold mb-2">
            {isUnifiedContent ? '🧠 AI SYNTHESIS!' : '🎉 RAW CONTENT!'}
          </h1>
          <h2 className="text-2xl">
            {isUnifiedContent 
              ? 'Nonbulla toont nu AI-gegenereerde nieuwssyntheses!' 
              : 'Nonbulla toont nu ECHTE Nederlandse nieuws!'
            }
          </h2>
          <p className={`mt-2 ${isUnifiedContent ? 'text-purple-100' : 'text-green-100'}`}>
            {articles.length} {isUnifiedContent ? 'AI artikelen' : 'RSS artikelen'} geladen • Bijgewerkt: {new Date().toLocaleString('nl-NL')}
          </p>
        </div>

        {/* FIRST ARTICLE HIGHLIGHT */}
        <div className="bg-blue-100 border border-blue-400 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-bold text-blue-800 mb-2">🎯 Eerste artikel (bewijs dat het werkt):</h3>
          <h4 className="text-2xl font-bold text-blue-900 mb-2">"{articles[0]?.title}"</h4>
          <p className="text-blue-700">
            Bron: <span className="font-semibold">{articles[0]?.source?.name}</span> • 
            Gepubliceerd: {new Date(articles[0]?.publishedAt).toLocaleString('nl-NL')}
          </p>
        </div>

        {/* ALL ARTICLES */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {articles.slice(0, 9).map((article, index) => (
            <div key={article.id} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                  {article.source?.name || 'Onbekende bron'}
                </span>
                <span className="text-gray-500 text-xs">
                  #{index + 1}
                </span>
              </div>
              
              <h3 className="font-bold text-lg text-gray-900 mb-2 leading-tight">
                {article.title}
              </h3>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                {article.description || 'Geen beschrijving beschikbaar'}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{article.categories?.[0] || 'Algemeen'}</span>
                <span>{new Date(article.publishedAt).toLocaleDateString('nl-NL')}</span>
              </div>

              {article.url && (
                <a 
                  href={article.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-3 inline-block bg-blue-600 text-white text-xs px-3 py-1 rounded hover:bg-blue-700"
                >
                  Lees volledig artikel →
                </a>
              )}
            </div>
          ))}
        </div>

        {/* TECHNICAL INFO */}
        <div className="bg-gray-100 rounded-lg p-6">
          <h3 className="font-bold text-lg mb-4">🔧 Technische Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <strong>Artikelen geladen:</strong> {articles.length}
            </div>
            <div>
              <strong>Data bron:</strong> Live RSS feeds
            </div>
            <div>
              <strong>Update frequentie:</strong> Elke 2 uur
            </div>
          </div>
          <div className="mt-4 text-xs text-gray-600">
            <p><strong>Bronnen:</strong> {Array.from(new Set(articles.map(a => a.source?.name))).filter(Boolean).join(', ')}</p>
            <p className="mt-1"><strong>Laatste update:</strong> {new Date().toLocaleString('nl-NL')}</p>
          </div>
        </div>

        {/* NAVIGATION */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">
            🎯 Dit bewijst dat Nonbulla nu werkt met echte Nederlandse nieuws!
          </p>
          <div className="space-x-4">
            <a href="/nederland" className="bg-orange-600 text-white px-6 py-2 rounded hover:bg-orange-700">
              Nederland →
            </a>
            <a href="/europa" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
              Europa →
            </a>
            <a href="/wereld" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
              Wereld →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}