import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  weight: ['400', '500', '600', '700', '800']
})

const interDisplay = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter-display',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap'
})

export const metadata = {
  title: 'Nonbulla – Nieuws buiten je bubbel',
  description: 'Doorbreek je nieuwsbubbel. Ontdek verhalen vanuit meerdere perspectieven met AI-gestuurde analyse.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl">
      <body className={`${inter.variable} ${interDisplay.variable} font-sans antialiased`}>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
          <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="max-w-[1320px] mx-auto px-6 sm:px-8 lg:px-12">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-nonbulla-blue-600 to-nonbulla-blue-700 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">N</span>
                    </div>
                    <div className="flex flex-col">
                      <h1 className="text-xl font-bold font-display text-gray-900 dark:text-gray-100 leading-none">
                        Nonbulla
                      </h1>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-none">
                        Nieuws buiten je bubbel
                      </span>
                    </div>
                  </div>
                </div>
                <nav className="hidden md:flex items-center space-x-6">
                  <a href="/" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium transition-colors duration-200">
                    Overzicht
                  </a>
                  <a href="/category/politics" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium transition-colors duration-200">
                    Politiek
                  </a>
                  <a href="/category/technology" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium transition-colors duration-200">
                    Tech
                  </a>
                  <a href="/category/world" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium transition-colors duration-200">
                    Wereld
                  </a>
                  <a href="/perspectives" className="text-perspective-green-600 dark:text-perspective-green-400 hover:text-perspective-green-700 dark:hover:text-perspective-green-300 font-semibold transition-colors duration-200 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Perspectieven
                  </a>
                  
                  {/* Search */}
                  <div className="relative">
                    <input
                      type="search"
                      placeholder="Zoek nieuws..."
                      className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nonbulla-blue-500 focus:border-nonbulla-blue-500 w-48"
                    />
                    <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </nav>
              </div>
            </div>
          </header>
          
          <main className="max-w-[1320px] mx-auto px-6 sm:px-8 lg:px-12 py-12">
            {children}
          </main>
          
          <footer className="bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-200/50 dark:border-gray-700/50 mt-24">
            <div className="max-w-[1320px] mx-auto px-6 sm:px-8 lg:px-12 py-12">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <div className="w-6 h-6 bg-gradient-to-br from-nonbulla-blue-600 to-nonbulla-blue-700 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold text-sm">N</span>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 font-semibold">Nonbulla</span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  &copy; 2025 Nonbulla. Alle rechten voorbehouden.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}