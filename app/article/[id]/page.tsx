import { notFound } from 'next/navigation'

interface ArticlePageProps {
  params: {
    id: string
  }
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const { id } = params

  // For now, redirect to external source since we don't have full article pages yet
  return (
    <div className="space-y-8">
      <div className="text-center py-16">
        <h1 className="text-3xl font-display font-bold text-gray-900 dark:text-gray-100 mb-4">
          Artikel wordt geladen...
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Artikelen worden momenteel nog geladen vanaf de originele bron. 
          Deze functie wordt binnenkort beschikbaar.
        </p>
        
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 p-6 max-w-md mx-auto">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Artikel ID: {id}
          </p>
        </div>
      </div>
    </div>
  )
}