import { Inter, Source_Serif_4 } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const sourceSerif = Source_Serif_4({ 
  subsets: ['latin'], 
  variable: '--font-source-serif',
  weight: ['400', '600', '700']
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
      <body className={`${inter.variable} ${sourceSerif.variable} font-serif`}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-4">
                <div className="flex items-center">
                  <div className="flex items-center space-x-3">
                    <h1 className="text-2xl font-bold font-sans text-gray-900 dark:text-gray-100">
                      Nonbulla
                    </h1>
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-sans">
                      Nieuws buiten je bubbel
                    </span>
                  </div>
                </div>
                <nav className="hidden md:flex space-x-8">
                  <a href="/" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
                    Overzicht
                  </a>
                  <a href="/trending" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
                    Trending
                  </a>
                  <a href="/categories" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100">
                    Categorieën
                  </a>
                </nav>
              </div>
            </div>
          </header>
          
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          
          <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <p>&copy; 2025 Nonbulla. Alle rechten voorbehouden.</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}