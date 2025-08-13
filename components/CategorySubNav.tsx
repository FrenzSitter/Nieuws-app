'use client'

import Link from 'next/link'

interface SubCategory {
  name: string
  slug: string
  icon: React.ReactNode
}

const subcategoriesMap: Record<string, SubCategory[]> = {
  'nederland': [
    {
      name: 'Politiek',
      slug: 'nederland-politiek',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
        </svg>
      )
    },
    {
      name: 'Economie',
      slug: 'nederland-economie',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    {
      name: 'Sport',
      slug: 'nederland-sport', 
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )
    },
    {
      name: 'Wetenschap',
      slug: 'nederland-wetenschap',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      name: 'Feiten',
      slug: 'nederland-feiten',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ],
  'europa': [
    {
      name: 'Politiek',
      slug: 'europa-politiek',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
        </svg>
      )
    },
    {
      name: 'Economie',
      slug: 'europa-economie',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    {
      name: 'Oorlog',
      slug: 'europa-oorlog',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    {
      name: 'Wetenschap',
      slug: 'europa-wetenschap',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      name: 'Feiten',
      slug: 'europa-feiten',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ],
  'wereld': [
    {
      name: 'Politiek',
      slug: 'wereld-politiek',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
        </svg>
      )
    },
    {
      name: 'Economie',
      slug: 'wereld-economie',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    {
      name: 'Oorlog',
      slug: 'wereld-oorlog',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    {
      name: 'Sport',
      slug: 'wereld-sport',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )
    },
    {
      name: 'Wetenschap',
      slug: 'wereld-wetenschap',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      name: 'Feiten',
      slug: 'wereld-feiten',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ]
}

interface CategorySubNavProps {
  mainCategory: string
  currentSlug: string
}

export default function CategorySubNav({ mainCategory, currentSlug }: CategorySubNavProps) {
  const subcategories = subcategoriesMap[mainCategory] || []
  
  if (subcategories.length === 0) {
    return null
  }

  return (
    <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Categorieën binnen {mainCategory === 'nederland' ? 'Nederland' : mainCategory === 'europa' ? 'Europa' : 'Wereld'}
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {subcategories.length} categorieën
        </span>
      </div>
      
      {/* All category button */}
      <Link 
        href={`/category/${mainCategory}`}
        className={`flex items-center gap-3 p-4 rounded-lg transition-all duration-200 ${
          currentSlug === mainCategory 
            ? 'bg-nonbulla-blue-100 dark:bg-nonbulla-blue-900/30 text-nonbulla-blue-900 dark:text-nonbulla-blue-100 shadow-md' 
            : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
        }`}
      >
        <div className={`p-2 rounded-lg ${
          currentSlug === mainCategory
            ? 'bg-nonbulla-blue-200 dark:bg-nonbulla-blue-800 text-nonbulla-blue-800 dark:text-nonbulla-blue-200'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
        }`}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-4V5a2 2 0 00-2-2H7a2 2 0 00-2 2v2m14 4v8a2 2 0 01-2 2H7a2 2 0 01-2-2v-8m14 0H5m14 0V9" />
          </svg>
        </div>
        <div className="flex-1">
          <h4 className="font-medium">
            Alle {mainCategory === 'nederland' ? 'Nederland' : mainCategory === 'europa' ? 'Europa' : 'Wereld'} nieuws
          </h4>
          <p className="text-sm opacity-75">
            Overzicht van alle nieuwscategorieën
          </p>
        </div>
      </Link>

      {/* Subcategory grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {subcategories.map((sub) => (
          <Link
            key={sub.slug}
            href={`/category/${sub.slug}`}
            className={`flex items-center gap-3 p-4 rounded-lg transition-all duration-200 hover:scale-105 ${
              currentSlug === sub.slug
                ? 'bg-perspective-green-100 dark:bg-perspective-green-900/30 text-perspective-green-900 dark:text-perspective-green-100 shadow-md'
                : 'bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
            }`}
          >
            <div className={`p-2 rounded-lg ${
              currentSlug === sub.slug
                ? 'bg-perspective-green-200 dark:bg-perspective-green-800 text-perspective-green-800 dark:text-perspective-green-200'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              {sub.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{sub.name}</h4>
              <p className="text-xs opacity-75 capitalize">
                {mainCategory === 'nederland' ? 'Nederland' : mainCategory === 'europa' ? 'Europa' : 'Wereld'}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}