#!/usr/bin/env node

/**
 * Enhanced RSS Crawler Script voor Nonbulla
 * 
 * Test de geavanceerde RSS crawler met story clustering
 * 
 * Gebruik:
 * node scripts/enhanced-crawl.js
 * node scripts/enhanced-crawl.js status
 * 
 * Of via npm:
 * npm run enhanced-crawl
 * npm run enhanced-crawl:status
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))

async function runEnhancedCrawl() {
  const apiUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const apiKey = process.env.RSS_API_KEY || 'nonbulla-rss-key-2025'

  try {
    console.log('🚀 Starting Enhanced RSS Crawl for Nonbulla...')
    console.log(`📡 API URL: ${apiUrl}`)
    console.log('⏰ This may take 30-60 seconds...\n')
    
    const startTime = Date.now()
    
    const response = await fetch(`${apiUrl}/api/crawler/enhanced`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    })

    const duration = Date.now() - startTime

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (result.success) {
      console.log('✅ Enhanced RSS Crawl completed successfully!\n')
      console.log('📊 Crawl Results:')
      console.log(`   🕒 Duration: ${result.data.crawl_duration_ms}ms (API: ${duration}ms)`)
      console.log(`   📰 Primary articles found: ${result.data.primary_articles_count}`)
      console.log(`   🎯 Story clusters detected: ${result.data.story_clusters_found}`)
      console.log(`   ✅ Sources crawled successfully: ${result.data.sources_crawled}`)
      console.log(`   ❌ Sources failed: ${result.data.sources_failed}`)
      console.log(`   📄 Total articles processed: ${result.data.total_articles}`)
      
      if (result.data.errors && result.data.errors.length > 0) {
        console.log(`\n⚠️  Errors encountered (${result.data.errors.length}):`)
        result.data.errors.forEach(error => console.log(`   - ${error}`))
      }

      console.log(`\n🔗 Timestamp: ${result.data.timestamp}`)
      
      // Show story clustering insights
      if (result.data.story_clusters_found > 0) {
        console.log(`\n🧠 Story Clustering Analysis:`)
        console.log(`   - Detected ${result.data.story_clusters_found} potential cross-source stories`)
        console.log(`   - This indicates ${result.data.story_clusters_found} topics covered by multiple sources`)
        console.log(`   - Ready for cross-reference analysis and unified article generation`)
      }
      
    } else {
      console.error('❌ Enhanced RSS crawl failed:', result.error)
      console.error('Message:', result.message)
    }

  } catch (error) {
    console.error('❌ Failed to run enhanced RSS crawl:', error.message)
    console.error('Stack:', error.stack)
    process.exit(1)
  }
}

async function checkCrawlerStatus() {
  const apiUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  try {
    console.log('📊 Checking Enhanced RSS Crawler status...')
    
    const response = await fetch(`${apiUrl}/api/crawler/enhanced`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (result.success) {
      console.log('✅ Enhanced RSS Crawler is operational\n')
      console.log('📈 Crawler Configuration:')
      console.log(`   📰 Total sources configured: ${result.data.total_sources}`)
      console.log(`   🎯 Primary Dutch sources: ${result.data.primary_sources}`)
      
      console.log('\n📊 Sources by Tier:')
      console.log(`   🥇 Primary: ${result.data.sources_by_tier.primary} sources`)
      console.log(`   🥈 Secondary: ${result.data.sources_by_tier.secondary} sources`)
      console.log(`   🎭 Specialty: ${result.data.sources_by_tier.specialty} sources`)
      console.log(`   🌍 International: ${result.data.sources_by_tier.international} sources`)

      console.log('\n🎯 Primary Sources (Cross-Reference Required):')
      result.data.primary_source_names.forEach(name => {
        console.log(`   • ${name}`)
      })

      console.log(`\n🔗 Status checked at: ${result.data.last_status_check}`)
      
    } else {
      console.error('❌ Crawler status check failed:', result.error)
    }

  } catch (error) {
    console.error('❌ Failed to check crawler status:', error.message)
  }
}

// Main execution
if (require.main === module) {
  const command = process.argv[2]

  switch (command) {
    case 'status':
      checkCrawlerStatus()
      break
    case 'crawl':
    default:
      runEnhancedCrawl()
      break
  }
}

module.exports = { runEnhancedCrawl, checkCrawlerStatus }