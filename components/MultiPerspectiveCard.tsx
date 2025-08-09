import Link from 'next/link'

interface PerspectiveSource {
  id: string
  name: string
  stance: 'supporting' | 'opposing' | 'neutral' | 'mixed'
  summary: string
  politicalLeaning?: 'left' | 'center-left' | 'center' | 'center-right' | 'right'
  credibilityScore: number
}

interface MultiPerspectiveCardProps {
  id: string
  title: string
  topic: string
  perspectives: PerspectiveSource[]
  publishedAt: string
  totalSources: number
  href?: string
}

const getStanceColor = (stance: PerspectiveSource['stance']) => {
  switch (stance) {
    case 'supporting': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700'
    case 'opposing': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700'
    case 'mixed': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700'
    default: return 'bg-gray-100 dark:bg-gray-700/30 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600'
  }
}

const getStanceLabel = (stance: PerspectiveSource['stance']) => {
  switch (stance) {
    case 'supporting': return 'Voor'
    case 'opposing': return 'Tegen'  
    case 'mixed': return 'Gemengd'
    default: return 'Neutraal'
  }
}

const getPoliticalColor = (leaning?: PerspectiveSource['politicalLeaning']) => {
  switch (leaning) {
    case 'left': return 'text-red-600 dark:text-red-400'
    case 'center-left': return 'text-pink-600 dark:text-pink-400'
    case 'center': return 'text-purple-600 dark:text-purple-400'
    case 'center-right': return 'text-blue-600 dark:text-blue-400'
    case 'right': return 'text-indigo-600 dark:text-indigo-400'
    default: return 'text-gray-600 dark:text-gray-400'
  }
}

export default function MultiPerspectiveCard({ 
  id,
  title, 
  topic,
  perspectives, 
  publishedAt, 
  totalSources,
  href
}: MultiPerspectiveCardProps) {
  const cardHref = href || `/perspectives/${id}`
  
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

  // Calculate perspective distribution
  const stanceCount = perspectives.reduce((acc, p) => {
    acc[p.stance] = (acc[p.stance] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <Link href={cardHref}>
      <article className="bg-gradient-to-br from-white/80 to-gray-50/80 dark:from-gray-800/80 dark:to-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden group">
        {/* Header */}
        <div className="p-5 pb-0">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-perspective-green-100 dark:bg-perspective-green-900/30 rounded-lg">
                  <svg className="w-4 h-4 text-perspective-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-perspective-green-600 dark:text-perspective-green-400 uppercase tracking-wide">
                  Meerdere Perspectieven
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 leading-tight mb-2 group-hover:text-nonbulla-blue-600 dark:group-hover:text-nonbulla-blue-400 transition-colors">
                {title}
              </h3>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Onderwerp: <span className="text-gray-800 dark:text-gray-200">{topic}</span>
              </p>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold text-nonbulla-blue-600 dark:text-nonbulla-blue-400">
                {perspectives.length}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                Perspectieven
              </div>
            </div>
          </div>
        </div>

        {/* Perspective Distribution */}
        <div className="px-5 pb-4">
          <div className="flex flex-wrap gap-2">
            {Object.entries(stanceCount).map(([stance, count]) => (
              <div key={stance} className={`px-3 py-1 rounded-full text-xs font-medium border ${getStanceColor(stance as PerspectiveSource['stance'])}`}>
                {getStanceLabel(stance as PerspectiveSource['stance'])}: {count}
              </div>
            ))}
          </div>
        </div>

        {/* Perspective Preview */}
        <div className="px-5 pb-4 space-y-3">
          {perspectives.slice(0, 3).map((perspective, index) => (
            <div key={perspective.id} className="border-l-2 border-gray-200 dark:border-gray-700 pl-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                    {perspective.name}
                  </span>
                  <div className={`px-2 py-0.5 rounded text-xs font-medium border ${getStanceColor(perspective.stance)}`}>
                    {getStanceLabel(perspective.stance)}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  {perspective.politicalLeaning && (
                    <span className={`font-medium ${getPoliticalColor(perspective.politicalLeaning)}`}>
                      {perspective.politicalLeaning}
                    </span>
                  )}
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>{perspective.credibilityScore}%</span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2">
                {perspective.summary}
              </p>
            </div>
          ))}
          
          {perspectives.length > 3 && (
            <div className="text-center pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
              <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                +{perspectives.length - 3} meer perspectieven beschikbaar
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-gray-50/50 dark:bg-gray-800/50 border-t border-gray-200/30 dark:border-gray-700/30">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2m-4-3v9" />
                </svg>
                <span className="font-medium">{totalSources} bronnen totaal</span>
              </div>
              
              <time dateTime={publishedAt} className="font-medium">
                {formatDate(publishedAt)}
              </time>
            </div>
            
            <div className="flex items-center gap-2 text-perspective-green-600 dark:text-perspective-green-400 group-hover:text-perspective-green-700 dark:group-hover:text-perspective-green-300 transition-colors">
              <span className="font-medium text-sm">Alle perspectieven</span>
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