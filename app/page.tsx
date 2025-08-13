import { createClient } from '@/lib/supabase/server'
import ManifestBar from '@/components/ManifestBar'
import CategoryNav from '@/components/CategoryNav'
import HeroArticle from '@/components/HeroArticle'
import NewsCard from '@/components/NewsCard'
import MultiPerspectiveCard from '@/components/MultiPerspectiveCard'
import { rssManager } from '@/lib/rss-parser'
import {
  heroArticles,
  multiPerspectiveArticles
} from '@/lib/sampleNews'

export default async function Home() {
  const supabase = createClient()
  
  // Fetch some basic stats for the homepage
  const { data: sources } = await supabase
    .from('news_sources')
    .select('id, name')
    .eq('is_active', true)
    .limit(5)

  // Fetch real articles from database
  const latestArticles = await rssManager.getRecentArticles(12)
  const trendingArticles = await rssManager.getRecentArticles(4)

  // Transform articles for UI components
  const latestNews = latestArticles.map((article, index) => ({
    id: article.id,
    title: article.title,
    summary: article.description || article.content?.substring(0, 150) + '...' || '',
    imageUrl: '', // We don't have images from RSS yet
    publishedAt: article.published_at,
    sources: [{ name: article.news_sources?.name || 'Unknown Source' }],
    category: article.categories?.[0] || 'algemeen',
    readingTime: Math.max(1, Math.ceil((article.content?.length || 0) / 200)),
    perspectiveCount: 1,
    isBreaking: index < 2 // Mark first 2 as breaking
  }))

  const trendingNews = trendingArticles.map((article, index) => ({
    id: article.id,
    title: article.title,
    summary: article.description || '',
    imageUrl: '',
    publishedAt: article.published_at,
    sources: [{ name: article.news_sources?.name || 'Unknown Source' }],
    category: article.categories?.[0] || 'algemeen',
    readingTime: Math.max(1, Math.ceil((article.content?.length || 0) / 200)),
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

      {/* Hero Section */}
      {heroArticles.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-gray-100">
              Hoofdverhalen
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Live</span>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {heroArticles.slice(0, 2).map((article) => (
              <HeroArticle
                key={article.id}
                id={article.id}
                title={article.title}
                summary={article.summary}
                imageUrl={article.imageUrl}
                publishedAt={article.publishedAt}
                sources={article.sources}
                category={article.category}
                readingTime={article.readingTime}
                perspectiveCount={article.perspectiveCount}
                isBreaking={article.isBreaking}
              />
            ))}
          </div>
        </div>
      )}

      {/* Multi-Perspective Articles */}
      {multiPerspectiveArticles.length > 0 && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-gray-100">
              Nieuws vanuit meerdere perspectieven
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Dezelfde verhalen, verschillende invalshoeken - krijg het complete beeld
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {multiPerspectiveArticles.map((article) => (
              <MultiPerspectiveCard
                key={article.id}
                id={article.id}
                title={article.title}
                topic={article.topic}
                perspectives={article.perspectives}
                publishedAt={article.publishedAt}
                totalSources={article.totalSources}
              />
            ))}
          </div>
        </div>
      )}

      {/* Latest News Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main News Feed */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-gray-100">
              Laatste Nieuws
            </h2>
            <button className="text-sm text-nonbulla-blue-600 dark:text-nonbulla-blue-400 hover:text-nonbulla-blue-700 dark:hover:text-nonbulla-blue-300 font-semibold transition-colors">
              Alle artikelen →
            </button>
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
                isPerspective={article.perspectiveCount > 1}
                perspectiveCount={article.perspectiveCount}
              />
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          {/* Trending */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
            <h3 className="text-lg font-display font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Trending
            </h3>
            <div className="space-y-4">
              {trendingNews.map((article, index) => (
                <div key={article.id} className="group">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl font-bold text-nonbulla-blue-600 dark:text-nonbulla-blue-400 mt-1">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-nonbulla-blue-600 dark:group-hover:text-nonbulla-blue-400 transition-colors mb-1">
                        {article.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>{article.sources.length} bronnen</span>
                        <span>•</span>
                        <span>{article.perspectiveCount} perspectieven</span>
                      </div>
                    </div>
                  </div>
                  {index < trendingNews.length - 1 && (
                    <div className="mt-3 border-t border-gray-200/50 dark:border-gray-700/50" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Sources Stats */}
          {sources && sources.length > 0 && (
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <h3 className="text-lg font-display font-bold text-gray-900 dark:text-gray-100 mb-4">
                Actieve Bronnen
              </h3>
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-3xl font-bold text-nonbulla-blue-600 dark:text-nonbulla-blue-400">
                    {sources.length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Betrouwbare nieuwsbronnen
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sources.map((source) => (
                    <span
                      key={source.id}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md"
                    >
                      {source.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AI Analysis Info */}
          <div className="bg-gradient-to-br from-analysis-purple-50 to-nonbulla-blue-50 dark:from-analysis-purple-950/30 dark:to-nonbulla-blue-950/30 rounded-xl border border-analysis-purple-200/50 dark:border-analysis-purple-700/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-analysis-purple-600 to-nonbulla-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-display font-bold text-gray-900 dark:text-gray-100">
                AI Analyse
              </h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Onze AI analyseert nieuwsartikelen uit verschillende bronnen en identificeert bias, 
              perspectief en credibiliteit om je een compleet beeld te geven.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}