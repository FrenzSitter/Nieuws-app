import Image from 'next/image'
import Link from 'next/link'

interface NewsCardProps {
  id: string
  title: string
  summary: string
  imageUrl?: string
  publishedAt: string
  sources: string[]
  category: string
  readingTime: number
  href?: string
  isPerspective?: boolean
  perspectiveCount?: number
}

export default function NewsCard({ 
  id,
  title, 
  summary, 
  imageUrl, 
  publishedAt, 
  sources, 
  category, 
  readingTime,
  href,
  isPerspective = false,
  perspectiveCount = 0
}: NewsCardProps) {
  const cardHref = href || `/article/${id}`
  
  // Format published date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    
    if (diffHours < 1) return 'Zojuist'
    if (diffHours < 24) return `${diffHours}u geleden`
    if (diffHours < 48) return 'Gisteren'
    return date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
  }

  return (
    <Link href={cardHref as any}>
      <article className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] overflow-hidden group">
        {/* Image */}
        {imageUrl && (
          <div className="relative aspect-[16/10] overflow-hidden">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            
            {/* Category badge */}
            <div className="absolute top-3 left-3">
              <span className="px-3 py-1 bg-nonbulla-blue-600/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                {category}
              </span>
            </div>
            
            {/* Multi-perspective indicator */}
            {isPerspective && perspectiveCount > 1 && (
              <div className="absolute top-3 right-3">
                <span className="flex items-center gap-1 px-2 py-1 bg-perspective-green-600/90 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {perspectiveCount}
                </span>
              </div>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="p-5">
          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight mb-3 group-hover:text-nonbulla-blue-600 dark:group-hover:text-nonbulla-blue-400 transition-colors line-clamp-2">
            {title}
          </h3>
          
          {/* Summary */}
          <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
            {summary}
          </p>
          
          {/* Metadata */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-3">
              {/* Sources */}
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3v9" />
                </svg>
                <span className="font-medium">{sources.length} bron{sources.length !== 1 ? 'nen' : ''}</span>
              </div>
              
              {/* Reading time */}
              <div className="flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{readingTime} min</span>
              </div>
            </div>
            
            {/* Published date */}
            <time dateTime={publishedAt} className="font-medium">
              {formatDate(publishedAt)}
            </time>
          </div>
          
          {/* Sources preview */}
          {sources.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
              {sources.slice(0, 3).map((source, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md"
                >
                  {source}
                </span>
              ))}
              {sources.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs rounded-md">
                  +{sources.length - 3} meer
                </span>
              )}
            </div>
          )}
        </div>
      </article>
    </Link>
  )
}