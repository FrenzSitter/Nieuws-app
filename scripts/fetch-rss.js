#!/usr/bin/env node

/**
 * RSS Fetching Script voor Nonbulla
 * 
 * Dit script haalt RSS feeds op van Nederlandse nieuwsbronnen
 * en slaat ze op in de Supabase database.
 * 
 * Gebruik:
 * node scripts/fetch-rss.js
 * 
 * Of via npm:
 * npm run fetch-rss
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))

async function fetchRSSFeeds() {
  const apiUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const apiKey = process.env.RSS_API_KEY || 'nonbulla-rss-key-2025'

  try {
    console.log('🚀 Starting RSS fetch for Nonbulla...')
    console.log(`📡 API URL: ${apiUrl}`)
    
    const response = await fetch(`${apiUrl}/api/rss/fetch`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (result.success) {
      console.log('✅ RSS fetch completed successfully!')
      console.log(`📊 Results:`)
      console.log(`   - Total sources: ${result.data.totalSources}`)
      console.log(`   - Successful sources: ${result.data.successfulSources}`)
      console.log(`   - Total articles: ${result.data.totalArticles}`)
      
      if (result.data.errors.length > 0) {
        console.log(`⚠️  Errors (${result.data.errors.length}):`)
        result.data.errors.forEach(error => console.log(`   - ${error}`))
      }
    } else {
      console.error('❌ RSS fetch failed:', result.error)
      console.error('Message:', result.message)
    }

  } catch (error) {
    console.error('❌ Failed to fetch RSS feeds:', error.message)
    console.error('Stack:', error.stack)
    process.exit(1)
  }
}

async function checkRSSStatus() {
  const apiUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  try {
    console.log('📊 Checking RSS system status...')
    
    const response = await fetch(`${apiUrl}/api/rss/fetch`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (result.success) {
      console.log('✅ RSS system is operational')
      console.log(`📰 Recent articles: ${result.data.recentArticlesCount}`)
      
      if (result.data.lastArticle) {
        console.log(`📄 Latest article:`)
        console.log(`   - Title: ${result.data.lastArticle.title}`)
        console.log(`   - Source: ${result.data.lastArticle.source}`)
        console.log(`   - Published: ${result.data.lastArticle.publishedAt}`)
      }
    } else {
      console.error('❌ RSS system error:', result.error)
    }

  } catch (error) {
    console.error('❌ Failed to check RSS status:', error.message)
  }
}

// Main execution
if (require.main === module) {
  const command = process.argv[2]

  switch (command) {
    case 'status':
      checkRSSStatus()
      break
    case 'fetch':
    default:
      fetchRSSFeeds()
      break
  }
}

module.exports = { fetchRSSFeeds, checkRSSStatus }