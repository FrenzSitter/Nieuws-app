'use client'

import { useState, useEffect } from 'react'

export default function TestPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/articles/recent?limit=3')
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-green-600">
        🎯 REAL DATA TEST PAGE - THIS SHOULD WORK!
      </h1>
      
      {data?.success && (
        <div className="bg-green-100 border border-green-400 rounded p-4 mb-8">
          <h2 className="text-xl font-bold text-green-800 mb-4">
            ✅ SUCCESS! Found {data.count} real articles:
          </h2>
          
          {data.data.map((article: any, index: number) => (
            <div key={article.id} className="border-l-4 border-green-500 pl-4 mb-4 bg-white p-3 rounded">
              <h3 className="font-bold text-lg text-gray-900">
                {index + 1}. {article.title}
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                Bron: {article.source.name} | Published: {new Date(article.publishedAt).toLocaleString('nl-NL')}
              </p>
              <p className="text-gray-700 mt-2">
                {article.description || 'Geen beschrijving'}
              </p>
            </div>
          ))}
        </div>
      )}

      {!data?.success && (
        <div className="bg-red-100 border border-red-400 rounded p-4">
          <h2 className="text-xl font-bold text-red-800">❌ API Error:</h2>
          <pre className="text-sm text-red-700 mt-2">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}

      <div className="bg-blue-100 border border-blue-400 rounded p-4 mt-8">
        <h3 className="font-bold text-blue-800">🔍 Raw API Response:</h3>
        <pre className="text-xs text-blue-700 mt-2 overflow-auto">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>

      <div className="mt-8">
        <a 
          href="/" 
          className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700"
        >
          ← Back to Homepage
        </a>
      </div>
    </div>
  )
}