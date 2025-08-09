import Image from 'next/image'
import Link from 'next/link'

interface HeroArticleProps {
  id: string
  title: string
  summary: string
  imageUrl: string
  publishedAt: string
  sources: string[]
  category: string
  readingTime: number
  perspectiveCount: number
  isBreaking?: boolean
}

export default function HeroArticle({
  id,
  title,
  summary,
  imageUrl,
  publishedAt,
  sources,
  category,
  readingTime,
  perspectiveCount,
  isBreaking = false
}: HeroArticleProps) {
  // Format published date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffHours < 1) return 'Zojuist'
    if (diffHours < 24) return `${diffHours}u geleden`
    if (diffHours < 48) return 'Gisteren'
    return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <Link href={`/article/${id}` as any}>
      <article className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-500 hover:scale-[1.01] overflow-hidden group">
        {/* Hero Image */}
        <div className="relative aspect-[21/9] lg:aspect-[3/1] overflow-hidden">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Breaking News Badge */}
          {isBreaking && (
            <div className="absolute top-4 left-4 z-10">
              <div className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg shadow-lg">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <span className="text-sm font-bold uppercase tracking-wide">Breaking</span>
              </div>
            </div>
          )}
          
          {/* Category */}
          <div className="absolute top-4 right-4 z-10">
            <span className="px-4 py-2 bg-nonbulla-blue-600/90 backdrop-blur-sm text-white text-sm font-semibold rounded-lg">
              {category}
            </span>
          </div>
          
          {/* Multi-perspective indicator */}
          <div className="absolute bottom-4 right-4 z-10">
            <div className="flex items-center gap-2 px-3 py-2 bg-perspective-green-600/90 backdrop-blur-sm text-white rounded-lg">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-sm font-semibold">{perspectiveCount} perspectieven</span>
            </div>
          </div>
          
          {/* Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
            <div className="max-w-4xl">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white leading-tight mb-4 group-hover:text-gray-200 transition-colors">
                {title}
              </h1>
              <p className="text-lg text-gray-200 leading-relaxed mb-4 line-clamp-2 lg:line-clamp-none">
                {summary}
              </p>
              
              {/* Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3v9" />
                  </svg>
                  <span className="font-medium">{sources.length} bronnen</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{readingTime} min leestijd</span>
                </div>
                
                <time dateTime={publishedAt} className="font-medium">
                  {formatDate(publishedAt)}
                </time>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sources Strip */}
        <div className="p-4 border-t border-gray-200/30 dark:border-gray-700/30 bg-white/50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {sources.slice(0, 4).map((source, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-300 text-xs font-medium rounded-full"
                >
                  {source}
                </span>
              ))}
              {sources.length > 4 && (
                <span className="px-3 py-1 bg-gray-100/80 dark:bg-gray-700/80 text-gray-500 dark:text-gray-400 text-xs rounded-full">
                  +{sources.length - 4} meer
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>Lees alle perspectieven</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}