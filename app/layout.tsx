import { Inter } from 'next/font/google'
import Link from 'next/link'
import Navigation from '@/components/Navigation'
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
  title: 'Nonbulla – Ontdek het nieuws buiten je bubbel',
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
        <div className="min-h-screen bg-white dark:bg-gray-950">
          <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
            <div className="max-w-[1320px] mx-auto px-6 sm:px-8 lg:px-12">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-4">
                  <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity duration-200">
                    <div className="w-8 h-8 bg-gradient-to-br from-nonbulla-blue-600 to-nonbulla-blue-700 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">N</span>
                    </div>
                    <div className="flex flex-col">
                      <h1 className="text-xl font-bold font-display text-gray-900 dark:text-gray-100 leading-none">
                        Nonbulla
                      </h1>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-none">
                        Ontdek het nieuws buiten je bubbel
                      </span>
                    </div>
                  </Link>
                </div>
                <Navigation />
              </div>
            </div>
          </header>
          
          <main className="max-w-[1320px] mx-auto px-6 sm:px-8 lg:px-12 py-12">
            {children}
          </main>
          
          <footer className="bg-white dark:bg-gray-900 border-t border-gray-200/50 dark:border-gray-700/50 mt-24">
            <div className="max-w-[1320px] mx-auto px-6 sm:px-8 lg:px-12 py-12">
              <div className="text-center">
                <Link href="/" className="inline-flex items-center justify-center space-x-3 mb-4 hover:opacity-80 transition-opacity duration-200">
                  <div className="w-6 h-6 bg-gradient-to-br from-nonbulla-blue-600 to-nonbulla-blue-700 rounded-md flex items-center justify-center">
                    <span className="text-white font-bold text-sm">N</span>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 font-semibold">Nonbulla</span>
                </Link>
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