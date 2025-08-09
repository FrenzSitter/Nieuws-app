import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-8 max-w-md mx-auto px-6">
        <div className="space-y-4">
          <div className="w-24 h-24 bg-gradient-to-br from-nonbulla-blue-500 to-nonbulla-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h1 className="text-4xl font-display font-bold text-gray-900 dark:text-gray-100">
            Pagina niet gevonden
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            De pagina die je zoekt bestaat niet of is verplaatst. 
            Ontdek het laatste nieuws op onze homepage.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href="/"
            className="px-8 py-4 bg-nonbulla-blue-600 hover:bg-nonbulla-blue-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            Terug naar Home
          </Link>
          <Link 
            href="/perspectives"
            className="px-8 py-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 text-gray-700 dark:text-gray-300 font-semibold rounded-xl transition-all duration-300 hover:shadow-lg"
          >
            Ontdek Perspectieven
          </Link>
        </div>
        
        <div className="pt-8 border-t border-gray-200/50 dark:border-gray-700/50">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Populaire Categorieën
          </h3>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link 
              href="/category/politics"
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Politiek
            </Link>
            <Link 
              href="/category/technology"
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Technologie
            </Link>
            <Link 
              href="/category/world"
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Wereld
            </Link>
            <Link 
              href="/category/sports"
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Sport
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}