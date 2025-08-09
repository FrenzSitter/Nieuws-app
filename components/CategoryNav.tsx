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
    id: 'politics',
    name: 'Politiek',
    href: '/category/politics',
    color: 'text-red-600 dark:text-red-400',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
      </svg>
    )
  },
  {
    id: 'technology',
    name: 'Technologie',
    href: '/category/technology',
    color: 'text-blue-600 dark:text-blue-400',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )
  },
  {
    id: 'world',
    name: 'Wereld',
    href: '/category/world',
    color: 'text-green-600 dark:text-green-400',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    id: 'business',
    name: 'Economie',
    href: '/category/business',
    color: 'text-amber-600 dark:text-amber-400',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    )
  },
  {
    id: 'sports',
    name: 'Sport',
    href: '/category/sports',
    color: 'text-orange-600 dark:text-orange-400',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    )
  },
  {
    id: 'culture',
    name: 'Cultuur',
    href: '/category/culture',
    color: 'text-purple-600 dark:text-purple-400',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m3 0H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zM8 10h8M8 14h8M8 18h8" />
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