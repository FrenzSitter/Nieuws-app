'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Menu, X } from 'lucide-react'

interface NavCategory {
  name: string
  slug: string
}

const navigationCategories: NavCategory[] = [
  { name: 'Nederland', slug: 'nederland' },
  { name: 'Europa', slug: 'europa' },
  { name: 'Wereld', slug: 'wereld' }
]

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center space-x-1">
        <Link 
          href="/" 
          className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          Overzicht
        </Link>

        {navigationCategories.map((category) => (
          <Link
            key={category.slug}
            href={`/category/${category.slug}`}
            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {category.name}
          </Link>
        ))}

        <Link 
          href="/perspectives" 
          className="px-4 py-2 text-perspective-green-600 dark:text-perspective-green-400 hover:text-perspective-green-700 dark:hover:text-perspective-green-300 font-semibold transition-colors duration-200 rounded-lg hover:bg-perspective-green-50 dark:hover:bg-perspective-green-950/30 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Perspectieven
        </Link>
        
        {/* Search */}
        <div className="relative ml-4">
          <input
            type="search"
            placeholder="Zoek nieuws..."
            className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nonbulla-blue-500 focus:border-nonbulla-blue-500 w-56 transition-all duration-200 focus:w-64"
          />
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
        </div>
      </nav>

      {/* Mobile Menu Button */}
      <button
        className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors duration-200"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-white dark:bg-gray-900 top-16">
          <nav className="px-6 py-4 space-y-2 max-h-[calc(100vh-4rem)] overflow-y-auto">
            <Link 
              href="/"
              className="block px-4 py-3 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              Overzicht
            </Link>

            {navigationCategories.map((category) => (
              <Link
                key={category.slug}
                href={`/category/${category.slug}`}
                className="block px-4 py-3 text-gray-900 dark:text-gray-100 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))}

            <Link 
              href="/perspectives"
              className="block px-4 py-3 text-perspective-green-600 dark:text-perspective-green-400 font-semibold hover:bg-perspective-green-50 dark:hover:bg-perspective-green-950/30 rounded-lg transition-colors duration-200"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Perspectieven
              </div>
            </Link>

            {/* Mobile Search */}
            <div className="relative pt-4">
              <input
                type="search"
                placeholder="Zoek nieuws..."
                className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-nonbulla-blue-500 focus:border-nonbulla-blue-500"
              />
              <Search className="absolute left-3 top-7 w-4 h-4 text-gray-400" />
            </div>
          </nav>
        </div>
      )}
    </>
  )
}