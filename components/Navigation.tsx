'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Menu, X } from 'lucide-react'

interface NavCategory {
  name: string
  slug: string
}

const navigationCategories: NavCategory[] = [
  { name: 'Alles', slug: '' },
  { name: 'Politiek', slug: 'politiek' },
  { name: 'Economie', slug: 'economie' },
  { name: 'Oorlog', slug: 'oorlog' },
  { name: 'Wetenschap', slug: 'wetenschap' },
  { name: 'Technologie', slug: 'technologie' },
  { name: 'Feiten', slug: 'feiten' }
]

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center space-x-1">
        {navigationCategories.map((category) => {
          const href = category.slug === '' ? '/' : `/category/${category.slug}`
          return (
            <Link
              key={category.slug || 'home'}
              href={href}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 font-medium transition-colors duration-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {category.name}
            </Link>
          )
        })}
        
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
            {navigationCategories.map((category) => {
              const href = category.slug === '' ? '/' : `/category/${category.slug}`
              return (
                <Link
                  key={category.slug || 'home'}
                  href={href}
                  className="block px-4 py-3 text-gray-900 dark:text-gray-100 font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {category.name}
                </Link>
              )
            })}

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