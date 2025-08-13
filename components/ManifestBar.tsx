'use client'

import Link from 'next/link'

export default function ManifestBar() {
  return (
    <div className="w-screen text-black relative overflow-hidden h-[60px] -ml-[50vw] left-1/2" style={{ backgroundColor: '#E0EEFB' }}>
      <div className="max-w-[1320px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-center h-[60px]">
          <div className="flex items-center gap-0">
            <span className="text-lg font-light leading-tight">
              Ontdek het nieuws buiten je bubbel
            </span>
            <Link 
              href="/manifest"
              className="ml-4 flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 font-medium text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Manifest
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}