import { memo } from 'react'
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
  isUnified?: boolean
  sourcesCount?: number
  politicalLeaning?: 'left' | 'center' | 'right' | 'balanced'
}

const NewsCard = memo(function NewsCard({ 
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
  perspectiveCount = 0,
  isUnified = false,
  sourcesCount,
  politicalLeaning = 'balanced'
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
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              quality={75}
              priority={false}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            
            {/* Category badge */}
            <div className="absolute top-3 left-3">
              <span className="px-3 py-1 bg-nonbulla-blue-600/90 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
                {category}
              </span>
            </div>
            
            {/* AI/Unified indicator */}
            {isUnified && (
              <div className="absolute top-3 right-3">
                <span className="flex items-center gap-1 px-2 py-1 bg-purple-600/90 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  AI
                </span>
              </div>
            )}
            
            {/* Multi-perspective indicator for non-unified */}
            {!isUnified && isPerspective && perspectiveCount > 1 && (
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
          
          {/* Sources preview with political leaning */}
          {(sources.length > 0 || isUnified) && (
            <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50">
              {/* Political leaning indicator for unified articles */}
              {isUnified && (
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Bronnen:</span>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      politicalLeaning === 'left' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                      politicalLeaning === 'right' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                      politicalLeaning === 'balanced' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {politicalLeaning === 'left' ? 'Links' :
                       politicalLeaning === 'right' ? 'Rechts' :
                       politicalLeaning === 'balanced' ? 'Gebalanceerd' : 'Centrum'}
                    </div>
                  </div>
                  {sourcesCount && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {sourcesCount} {sourcesCount === 1 ? 'bron' : 'bronnen'}
                    </span>
                  )}
                </div>
              )}
              
              {/* Source chips */}
              {sources.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {sources.slice(0, isUnified ? 2 : 3).map((source, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-md"
                    >
                      {source}
                    </span>
                  ))}
                  {sources.length > (isUnified ? 2 : 3) && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs rounded-md">
                      +{sources.length - (isUnified ? 2 : 3)} meer
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </article>
    </Link>
  )
})

export default NewsCard