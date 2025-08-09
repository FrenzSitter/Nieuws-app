'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface BreakingNewsItem {
  id: string
  title: string
  href: string
  publishedAt: string
  isUrgent?: boolean
}

interface BreakingNewsProps {
  items: BreakingNewsItem[]
  autoScroll?: boolean
  scrollSpeed?: number
}

export default function BreakingNews({ 
  items, 
  autoScroll = true, 
  scrollSpeed = 3000 
}: BreakingNewsProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoScroll)

  useEffect(() => {
    if (!isPlaying || items.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length)
    }, scrollSpeed)

    return () => clearInterval(interval)
  }, [isPlaying, items.length, scrollSpeed])

  if (!items || items.length === 0) {
    return null
  }

  const currentItem = items[currentIndex]

  return (
    <div className="bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white shadow-lg relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
      
      <div className="relative max-w-[1320px] mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center py-3 gap-4">
          {/* Breaking news indicator */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              <span className="text-sm font-bold uppercase tracking-wide">
                Breaking
              </span>
            </div>
          </div>

          {/* News content */}
          <div className="flex-1 min-w-0">
            <Link href={currentItem.href} className="block group">
              <div className="flex items-center justify-between">
                <p className="text-lg font-semibold leading-tight group-hover:text-gray-200 transition-colors truncate pr-4">
                  {currentItem.title}
                </p>
                
                <div className="flex items-center gap-3 flex-shrink-0">
                  <time className="text-sm text-red-100 font-medium">
                    {new Date(currentItem.publishedAt).toLocaleTimeString('nl-NL', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </time>
                  
                  <svg className="w-5 h-5 text-red-100 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>

          {/* Controls */}
          {items.length > 1 && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Play/Pause */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label={isPlaying ? 'Pauzeer automatisch scrollen' : 'Start automatisch scrollen'}
              >
                {isPlaying ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M15 14h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </button>

              {/* Navigation dots */}
              <div className="flex items-center gap-1">
                {items.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all duration-200 ${
                      index === currentIndex 
                        ? 'bg-white' 
                        : 'bg-white/40 hover:bg-white/60'
                    }`}
                    aria-label={`Ga naar breaking news ${index + 1}`}
                  />
                ))}
              </div>

              {/* Manual navigation */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                  aria-label="Vorige breaking news"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button
                  onClick={() => setCurrentIndex((prevIndex) => (prevIndex + 1) % items.length)}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                  aria-label="Volgende breaking news"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Progress indicator */}
      {isPlaying && items.length > 1 && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20">
          <div 
            className="h-full bg-white transition-all duration-100 ease-linear"
            style={{
              width: `${((currentIndex + 1) / items.length) * 100}%`
            }}
          />
        </div>
      )}
    </div>
  )
}