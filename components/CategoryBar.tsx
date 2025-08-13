'use client'

import Link from 'next/link'

interface SubCategory {
  name: string
  slug: string
  icon: React.ReactNode
  color?: string
}

const subcategoriesMap: Record<string, SubCategory[]> = {
  'nederland': [
    {
      name: 'Alle Nederland nieuws',
      slug: '/category/nederland',
      color: 'bg-blue-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-4V5a2 2 0 00-2-2H7a2 2 0 00-2 2v2m14 4v8a2 2 0 01-2 2H7a2 2 0 01-2-2v-8m14 0H5m14 0V9" />
        </svg>
      )
    },
    {
      name: 'Politiek',
      slug: '/category/nederland-politiek',
      color: 'bg-red-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
        </svg>
      )
    },
    {
      name: 'Economie',
      slug: '/category/nederland-economie',
      color: 'bg-green-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    {
      name: 'Sport',
      slug: '/category/nederland-sport',
      color: 'bg-orange-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )
    },
    {
      name: 'Wetenschap',
      slug: '/category/nederland-wetenschap',
      color: 'bg-purple-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      name: 'Feiten',
      slug: '/category/nederland-feiten',
      color: 'bg-teal-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ],
  'europa': [
    {
      name: 'Alle Europa nieuws',
      slug: '/category/europa',
      color: 'bg-blue-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-4V5a2 2 0 00-2-2H7a2 2 0 00-2 2v2m14 4v8a2 2 0 01-2 2H7a2 2 0 01-2-2v-8m14 0H5m14 0V9" />
        </svg>
      )
    },
    {
      name: 'Politiek',
      slug: '/category/europa-politiek',
      color: 'bg-red-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
        </svg>
      )
    },
    {
      name: 'Economie',
      slug: '/category/europa-economie',
      color: 'bg-green-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    {
      name: 'Oorlog',
      slug: '/category/europa-oorlog',
      color: 'bg-gray-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    {
      name: 'Wetenschap',
      slug: '/category/europa-wetenschap',
      color: 'bg-purple-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      name: 'Feiten',
      slug: '/category/europa-feiten',
      color: 'bg-teal-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ],
  'wereld': [
    {
      name: 'Alle Wereld nieuws',
      slug: '/category/wereld',
      color: 'bg-blue-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-4V5a2 2 0 00-2-2H7a2 2 0 00-2 2v2m14 4v8a2 2 0 01-2 2H7a2 2 0 01-2-2v-8m14 0H5m14 0V9" />
        </svg>
      )
    },
    {
      name: 'Politiek',
      slug: '/category/wereld-politiek',
      color: 'bg-red-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
        </svg>
      )
    },
    {
      name: 'Economie',
      slug: '/category/wereld-economie',
      color: 'bg-green-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    {
      name: 'Oorlog',
      slug: '/category/wereld-oorlog',
      color: 'bg-gray-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    },
    {
      name: 'Sport',
      slug: '/category/wereld-sport',
      color: 'bg-orange-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      )
    },
    {
      name: 'Wetenschap',
      slug: '/category/wereld-wetenschap',
      color: 'bg-purple-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      name: 'Feiten',
      slug: '/category/wereld-feiten',
      color: 'bg-teal-600',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ]
}

interface CategoryBarProps {
  currentSlug?: string
}

export default function CategoryBar({ currentSlug }: CategoryBarProps) {
  // Determine which main category we're in
  let mainCategory = ''
  let subcategories: SubCategory[] = []
  
  if (currentSlug) {
    if (currentSlug.includes('nederland')) {
      mainCategory = 'nederland'
      subcategories = subcategoriesMap['nederland']
    } else if (currentSlug.includes('europa')) {
      mainCategory = 'europa'
      subcategories = subcategoriesMap['europa']
    } else if (currentSlug.includes('wereld')) {
      mainCategory = 'wereld'
      subcategories = subcategoriesMap['wereld']
    }
  }

  // If no subcategories found (e.g., on perspectives page), don't show the bar
  if (subcategories.length === 0) {
    return null
  }

  return (
    <div className="w-screen text-black relative overflow-hidden h-[60px] -ml-[50vw] left-1/2" style={{ backgroundColor: '#E0EEFB' }}>
      <div className="max-w-[1320px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center h-[60px] gap-3 overflow-x-auto scrollbar-hide">
          {subcategories.map((category) => {
            const isActive = currentSlug === category.slug
            
            return (
              <Link
                key={category.slug}
                href={category.slug as any}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all duration-200 hover:scale-105 flex-shrink-0 ${
                  isActive
                    ? `${category.color || 'bg-blue-600'} text-white shadow-lg`
                    : 'bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 shadow-md hover:shadow-lg'
                }`}
              >
                <div className={isActive ? 'text-white' : category.color?.replace('bg-', 'text-') || 'text-blue-600'}>
                  {category.icon}
                </div>
                {category.name}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}