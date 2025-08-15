'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Category {
  id: string
  name: string
  icon: React.ReactNode
  href: string
  color: string
}

const categories: Category[] = [
  {
    id: 'all',
    name: 'Alles',
    href: '/',
    color: 'text-gray-600 dark:text-gray-300',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-4V5a2 2 0 00-2-2H7a2 2 0 00-2 2v2m14 4v8a2 2 0 01-2 2H7a2 2 0 01-2-2v-8m14 0H5m14 0V9" />
      </svg>
    )
  },
  {
    id: 'politiek',
    name: 'Politiek',
    href: '/category/politiek',
    color: 'text-red-600 dark:text-red-400',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
      </svg>
    )
  },
  {
    id: 'economie',
    name: 'Economie',
    href: '/category/economie',
    color: 'text-green-600 dark:text-green-400',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    )
  },
  {
    id: 'oorlog',
    name: 'Oorlog',
    href: '/category/oorlog',
    color: 'text-gray-700 dark:text-gray-400',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    )
  },
  {
    id: 'wetenschap',
    name: 'Wetenschap',
    href: '/category/wetenschap',
    color: 'text-purple-600 dark:text-purple-400',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    id: 'technologie',
    name: 'Technologie',
    href: '/category/technologie',
    color: 'text-blue-600 dark:text-blue-400',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    )
  },
  {
    id: 'feiten',
    name: 'Feiten',
    href: '/category/feiten',
    color: 'text-teal-600 dark:text-teal-400',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  }
]

interface CategoryNavProps {
  currentCategory?: string
  showIcon?: boolean
  variant?: 'horizontal' | 'vertical'
  className?: string
}

export default function CategoryNav({ 
  currentCategory, 
  showIcon = true, 
  variant = 'horizontal',
  className = ''
}: CategoryNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (category: Category) => {
    if (category.id === 'all' && pathname === '/') return true
    return pathname.includes(category.href) && category.href !== '/'
  }

  if (variant === 'vertical') {
    return (
      <div className={`space-y-2 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Categorieën
        </h3>
        {categories.map((category) => {
          const active = isActive(category)
          return (
            <Link key={category.id} href={category.href as any}>
              <div className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                ${active 
                  ? 'bg-nonbulla-blue-600 text-white shadow-lg' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }
              `}>
                {showIcon && (
                  <div className={active ? 'text-white' : category.color}>
                    {category.icon}
                  </div>
                )}
                <span className="font-medium">{category.name}</span>
              </div>
            </Link>
          )
        })}
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {/* Mobile dropdown toggle */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full px-4 py-3 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-lg text-gray-700 dark:text-gray-300 font-medium"
        >
          <span>Categorieën</span>
          <svg 
            className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {isOpen && (
          <div className="mt-2 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-lg shadow-lg">
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => {
                const active = isActive(category)
                return (
                  <Link key={category.id} href={category.href as any} onClick={() => setIsOpen(false)}>
                    <div className={`
                      flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm
                      ${active 
                        ? 'bg-nonbulla-blue-600 text-white' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }
                    `}>
                      {showIcon && (
                        <div className={active ? 'text-white' : category.color}>
                          {category.icon}
                        </div>
                      )}
                      <span className="font-medium">{category.name}</span>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Desktop horizontal navigation */}
      <div className="hidden md:flex items-center space-x-2 overflow-x-auto scrollbar-hide pb-2">
        {categories.map((category) => {
          const active = isActive(category)
          return (
            <Link key={category.id} href={category.href as any}>
              <div className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap
                ${active 
                  ? 'bg-nonbulla-blue-600 text-white shadow-lg' 
                  : 'bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 hover:shadow-md hover:scale-105 text-gray-700 dark:text-gray-300'
                }
              `}>
                {showIcon && (
                  <div className={active ? 'text-white' : category.color}>
                    {category.icon}
                  </div>
                )}
                <span className="font-medium text-sm">{category.name}</span>
              </div>
            </Link>
          )
        })}
      </div>
      
      {/* Trending indicator */}
      <div className="hidden md:flex items-center justify-end mt-4 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span>Live updates beschikbaar</span>
        </div>
      </div>
    </div>
  )
}