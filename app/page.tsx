import { createClient } from '@/lib/supabase/server'
import ManifestBar from '@/components/ManifestBar'
import CategoryNav from '@/components/CategoryNav'
import NewsCard from '@/components/NewsCard'
import { rssManager } from '@/lib/rss-parser'

export default async function Home() {
  const supabase = createClient()
  
  // Fetch basic stats for the homepage
  const { data: sources } = await supabase
    .from('news_sources')
    .select('id, name')
    .eq('is_active', true)
    .limit(5)

  // Fetch ONLY real articles from database - NO SAMPLE DATA!
  let latestArticles = []
  let trendingArticles = []
  
  try {
    latestArticles = await rssManager.getRecentArticles(12)
    trendingArticles = await rssManager.getRecentArticles(4)
  } catch (error) {
    console.error('Error fetching articles:', error)
    // If database fails, show empty rather than sample data
    latestArticles = []
    trendingArticles = []
  }

  // Transform REAL articles for UI components
  const latestNews = latestArticles.map((article, index) => ({
    id: article.id,
    title: article.title,
    summary: article.description || article.content?.substring(0, 150) + '...' || 'Geen samenvatting beschikbaar',
    imageUrl: '', // RSS feeds don't include images yet
    publishedAt: article.published_at,
    sources: [{ name: article.news_sources?.name || 'Onbekende Bron' }],
    category: article.categories?.[0] || 'algemeen',
    readingTime: Math.max(1, Math.ceil((article.content?.length || 0) / 200)),
    perspectiveCount: 1,
    isBreaking: index < 2 // First 2 articles as breaking news
  }))

  const trendingNews = trendingArticles.map((article) => ({
    id: article.id,
    title: article.title,
    summary: article.description || '',
    sources: [{ name: article.news_sources?.name || 'Onbekende Bron' }],
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

      {/* Real Articles Section - Only if we have articles */}
      {latestNews.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-gray-100">
              Laatste Nieuws
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>Live vanuit RSS feeds</span>
            </div>
          </div>
          
          {/* News Grid */}
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
      )}

      {/* If no articles available */}
      {latestNews.length === 0 && (
        <div className="text-center py-16">
          <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-gray-100 mb-4">
            Bezig met laden van nieuws...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            RSS feeds worden elke 2 uur bijgewerkt. Volgende update om {new Date(Math.ceil(Date.now() / (2 * 60 * 60 * 1000)) * (2 * 60 * 60 * 1000)).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}.
          </p>
        </div>
      )}

      {/* Sidebar with Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          {/* Main content already shown above */}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          {/* Trending Articles */}
          {trendingNews.length > 0 && (
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <h3 className="text-lg font-display font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                Recent Gelezen
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
                          <span>{article.sources[0]?.name}</span>
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
          )}

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
                    Nederlandse nieuwsbronnen
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

          {/* System Status */}
          <div className="bg-gradient-to-br from-analysis-purple-50 to-nonbulla-blue-50 dark:from-analysis-purple-950/30 dark:to-nonbulla-blue-950/30 rounded-xl border border-analysis-purple-200/50 dark:border-analysis-purple-700/50 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-analysis-purple-600 to-nonbulla-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-display font-bold text-gray-900 dark:text-gray-100">
                Live RSS Feeds
              </h3>
            </div>
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Artikelen:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">{latestNews.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Update:</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">Elke 2 uur</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Status:</span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {latestNews.length > 0 ? 'Actief' : 'Laden...'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}