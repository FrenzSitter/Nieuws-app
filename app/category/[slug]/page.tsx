import { notFound } from 'next/navigation'
import CategoryBar from '@/components/CategoryBar'
import CategorySubNav from '@/components/CategorySubNav'
import NewsCard from '@/components/NewsCard'
import { rssManager } from '@/lib/rss-parser'

interface CategoryPageProps {
  params: {
    slug: string
  }
}

const categoryMap: Record<string, string> = {
  // Legacy categories (for backwards compatibility)
  'politics': 'Politiek',
  'technology': 'Technologie', 
  'world': 'Wereld',
  'business': 'Economie',
  'sports': 'Sport',
  'culture': 'Cultuur',
  
  // New geographic structure
  'nederland': 'Nederland',
  'europa': 'Europa',
  'wereld': 'Wereld',
  
  // Nederland subcategories
  'nederland-politiek': 'Nederlandse Politiek',
  'nederland-economie': 'Nederlandse Economie',
  'nederland-sport': 'Nederlandse Sport',
  'nederland-wetenschap': 'Nederlandse Wetenschap',
  'nederland-feiten': 'Nederlandse Feiten',
  
  // Europa subcategories
  'europa-politiek': 'Europese Politiek',
  'europa-economie': 'Europese Economie',
  'europa-oorlog': 'Oorlog in Europa',
  'europa-wetenschap': 'Europese Wetenschap',
  'europa-feiten': 'Europese Feiten',
  
  // Wereld subcategories
  'wereld-politiek': 'Wereldpolitiek',
  'wereld-economie': 'Wereldeconomie',
  'wereld-oorlog': 'Oorlog in de Wereld',
  'wereld-sport': 'Wereldsport',
  'wereld-wetenschap': 'Wereldwetenschap',
  'wereld-feiten': 'Wereldfeiten'
}

const categoryDescriptions: Record<string, string> = {
  // Legacy descriptions
  'politics': 'Het laatste politieke nieuws uit Nederland en Europa. Van verkiezingen tot beleidsbeslissingen.',
  'technology': 'Innovatie, AI, startups en de digitale transformatie van Nederland.',
  'world': 'Internationale ontwikkelingen en hun impact op Nederland.',
  'business': 'Economisch nieuws, bedrijfsleven en financiële markten.',
  'sports': 'Nederlandse en internationale sport, van voetbal tot Formule 1.',
  'culture': 'Kunst, cultuur, entertainment en Nederlandse culturele evenementen.',
  
  // Main geographic categories
  'nederland': 'Al het Nederlandse nieuws op één plek. Van politiek tot sport, van de Randstad tot de provincie.',
  'europa': 'Europese ontwikkelingen die Nederland raken. Politiek, economie en maatschappij vanuit Europees perspectief.',
  'wereld': 'Internationale nieuwsgebeurtenissen met wereldwijde impact en hun gevolgen voor Nederland.',
  
  // Nederland subcategories
  'nederland-politiek': 'Nederlandse politiek, verkiezingen, coalitieformatie en beleidsbeslissingen uit Den Haag.',
  'nederland-economie': 'Nederlandse economie, bedrijfsleven, arbeidsmarkt en financiële ontwikkelingen.',
  'nederland-sport': 'Nederlandse sport, van Eredivisie tot Olympische Spelen en alles daartussen.',
  'nederland-wetenschap': 'Nederlandse wetenschappelijke doorbraken, onderzoek en innovatie.',
  'nederland-feiten': 'Fact-checks, onderzoeksjournalistiek en duiding van Nederlandse nieuwsfeiten.',
  
  // Europa subcategories
  'europa-politiek': 'Europese Unie, verkiezingen en politieke ontwikkelingen die Nederland raken.',
  'europa-economie': 'Europese economische ontwikkelingen, handel en monetair beleid van de ECB.',
  'europa-oorlog': 'Conflicten en veiligheidssituatie in Europa, vooral de oorlog in Oekraïne.',
  'europa-wetenschap': 'Europese wetenschappelijke samenwerking, onderzoek en technologische vooruitgang.',
  'europa-feiten': 'Fact-checks en analyse van Europese ontwikkelingen en hun impact op Nederland.',
  
  // Wereld subcategories
  'wereld-politiek': 'Internationale politiek, diplomatie en geopolitieke ontwikkelingen wereldwijd.',
  'wereld-economie': 'Wereldeconomie, internationale handel en financiële markten buiten Europa.',
  'wereld-oorlog': 'Conflicten en oorlogen wereldwijd en hun internationale gevolgen.',
  'wereld-sport': 'Internationale sport, Wereldkampioenschappen en sportevenementen buiten Nederland.',
  'wereld-wetenschap': 'Internationale wetenschappelijke ontwikkelingen en wereldwijde onderzoeksprojecten.',
  'wereld-feiten': 'Internationale fact-checks en analyse van wereldwijde nieuwsgebeurtenissen.'
}

const categoryIcons: Record<string, React.ReactNode> = {
  // Geographic main categories
  'nederland': (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
    </svg>
  ),
  'europa': (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  'wereld': (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  
  // Legacy and specific category icons
  'politics': (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
    </svg>
  ),
  'nederland-politiek': (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
    </svg>
  ),
  'europa-politiek': (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
    </svg>
  ),
  'wereld-politiek': (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
    </svg>
  ),
  'technology': (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  'world': (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  'business': (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  'sports': (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  'culture': (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m3 0H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zM8 10h8M8 14h8M8 18h8" />
    </svg>
  ),
  
  // Use default icon for categories without specific icons
  'default': (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3v9" />
    </svg>
  )
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = params
  
  const categoryName = categoryMap[slug]
  if (!categoryName) {
    notFound()
  }
  
  // Fetch real articles from database - map category to database format
  const dbCategory = slug.split('-')[0] // Extract base category (nederland, europa, wereld)
  const rawArticles = await rssManager.getArticlesByCategory(dbCategory, 20)
  
  // Transform articles for UI components
  const articles = rawArticles.map(article => ({
    id: article.id,
    title: article.title,
    summary: article.description || article.content?.substring(0, 150) + '...' || '',
    imageUrl: '', // We don't have images from RSS yet
    publishedAt: article.published_at,
    sources: [{ name: article.news_sources?.name || 'Unknown Source' }],
    category: article.categories?.[0] || dbCategory,
    readingTime: Math.max(1, Math.ceil((article.content?.length || 0) / 200)),
    perspectiveCount: 1
  }))
  
  const description = categoryDescriptions[slug] || ''
  const icon = categoryIcons[slug] || categoryIcons['default']
  
  // Get some stats for this category
  const totalArticles = articles.length
  const sourcesUsed = new Set(articles.flatMap(article => article.sources.map(s => s.name))).size
  const averagePerspectives = articles.length > 0 ? Math.round(
    articles.reduce((sum, article) => sum + article.perspectiveCount, 0) / articles.length
  ) : 1

  return (
    <div className="space-y-8">
      {/* Category Bar */}
      <div className="-mt-12">
        <CategoryBar currentSlug={`/category/${slug}`} />
      </div>

      {/* Category Header */}
      <div className="text-center space-y-6 py-8">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-nonbulla-blue-500 to-nonbulla-blue-600 rounded-2xl flex items-center justify-center text-white">
            {icon}
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-gray-900 dark:text-gray-100">
            {categoryName}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        {/* Category Stats */}
        <div className="flex justify-center">
          <div className="flex items-center gap-8 px-8 py-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="text-center">
              <div className="text-2xl font-bold text-nonbulla-blue-600 dark:text-nonbulla-blue-400">
                {totalArticles}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Artikelen
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-perspective-green-600 dark:text-perspective-green-400">
                {sourcesUsed}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Bronnen
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-analysis-purple-600 dark:text-analysis-purple-400">
                {averagePerspectives}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                Gem. Perspectieven
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Sub-Navigation */}
      {(slug.startsWith('nederland-') || slug.startsWith('europa-') || slug.startsWith('wereld-')) && (
        <CategorySubNav 
          mainCategory={
            slug.startsWith('nederland') ? 'nederland' : 
            slug.startsWith('europa') ? 'europa' : 
            slug.startsWith('wereld') ? 'wereld' : 
            slug
          } 
          currentSlug={slug} 
        />
      )}

      {/* Featured Article */}
      {articles.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-gray-100">
            Uitgelicht in {categoryName}
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {articles.slice(0, 2).map((article) => (
              <div key={article.id} className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.01] overflow-hidden">
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white leading-tight mb-2">
                      {article.title}
                    </h3>
                    <p className="text-gray-200 text-sm line-clamp-2">
                      {article.summary}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Articles Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-gray-100">
            Alle {categoryName} Artikelen
          </h2>
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>Gesorteerd op: Nieuwste eerst</span>
            <button className="text-nonbulla-blue-600 dark:text-nonbulla-blue-400 hover:text-nonbulla-blue-700 dark:hover:text-nonbulla-blue-300 font-semibold">
              Filter ↓
            </button>
          </div>
        </div>
        
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <NewsCard
                key={article.id}
                id={article.id}
                title={article.title}
                summary={article.summary}
                imageUrl={article.imageUrl}
                publishedAt={article.publishedAt}
                sources={Array.isArray(article.sources) 
                  ? article.sources.map((source: any) => String(source?.name || source || 'Unknown')).filter(Boolean)
                  : []
                }
                category={article.category}
                readingTime={article.readingTime}
                isPerspective={article.perspectiveCount > 1}
                perspectiveCount={article.perspectiveCount}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3v9" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Geen artikelen gevonden
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Er zijn momenteel geen artikelen beschikbaar in de categorie {categoryName}.
            </p>
          </div>
        )}
      </div>

      {/* Related Categories */}
      <div className="bg-gradient-to-br from-gray-50/50 to-white/50 dark:from-gray-900/50 dark:to-gray-800/50 -mx-6 sm:-mx-8 lg:-mx-12 px-6 sm:px-8 lg:px-12 py-12 rounded-2xl">
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-display font-bold text-gray-900 dark:text-gray-100">
            Ontdek Meer Categorieën
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(categoryMap)
              .filter(([key]) => key !== slug)
              .slice(0, 6)
              .map(([key, name]) => (
                <a
                  key={key}
                  href={`/category/${key}`}
                  className="flex items-center gap-3 p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
                >
                  <div className="text-nonbulla-blue-600 dark:text-nonbulla-blue-400">
                    {categoryIcons[key]}
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {name}
                  </span>
                </a>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Generate static params for all categories
export function generateStaticParams() {
  return Object.keys(categoryMap).map((slug) => ({
    slug,
  }))
}

// Add dynamic metadata for SEO
export async function generateMetadata({ params }: CategoryPageProps) {
  const { slug } = params
  const categoryName = categoryMap[slug]
  
  if (!categoryName) {
    return {
      title: 'Categorie niet gevonden - Nonbulla',
      description: 'De gevraagde nieuwscategorie kon niet worden gevonden.'
    }
  }

  const description = categoryDescriptions[slug] || `Lees het laatste nieuws over ${categoryName}`
  
  return {
    title: `${categoryName} - Nonbulla`,
    description: description,
    openGraph: {
      title: `${categoryName} - Nonbulla`,
      description: description,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${categoryName} - Nonbulla`,
      description: description,
    }
  }
}