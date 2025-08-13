#!/usr/bin/env node

/**
 * Cross-Reference Detection Engine Test Script voor Nonbulla
 * 
 * Test de cross-reference detection volgens jouw workflow:
 * NU.nl → Check Volkskrant, NOS, Telegraaf → Cross-reference analysis
 * 
 * Gebruik:
 * node scripts/cross-reference-test.js status
 * node scripts/cross-reference-test.js analyze [cluster_id]
 * node scripts/cross-reference-test.js process-delayed
 * 
 * Of via npm:
 * npm run cross-ref:status
 * npm run cross-ref:analyze
 * npm run cross-ref:delayed
 */

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args))

async function checkCrossReferenceStatus() {
  const apiUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  try {
    console.log('📊 Checking Cross-Reference Engine status...\n')
    
    const response = await fetch(`${apiUrl}/api/cross-reference/analyze?action=status`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (result.success) {
      const stats = result.data.stats
      
      console.log('✅ Cross-Reference Engine is operational\n')
      
      console.log('📈 Cluster Statistics:')
      console.log(`   📰 Total clusters: ${stats.total_clusters}`)
      console.log(`   🎯 Ready for analysis: ${stats.ready_for_analysis}`)
      console.log(`   ⏳ Awaiting recheck: ${stats.awaiting_recheck}`)
      console.log(`   ❌ Insufficient sources: ${stats.insufficient_sources}`)
      
      console.log('\n🔗 Cross-Reference Performance:')
      console.log(`   🎯 Multi-source clusters: ${stats.multi_source_clusters}`)
      console.log(`   📄 Single-source clusters: ${stats.single_source_clusters}`)
      
      const successRate = stats.total_clusters > 0 
        ? ((stats.multi_source_clusters / stats.total_clusters) * 100).toFixed(1)
        : '0.0'
      console.log(`   📊 Cross-reference success rate: ${successRate}%`)

      console.log('\n⚙️ Cross-Reference Rules:')
      result.data.cross_reference_rules.forEach(rule => {
        console.log(`   🚨 Trigger: ${rule.trigger}`)
        console.log(`   📋 Required sources: ${rule.required_sources.join(', ')}`)
        console.log(`   🎯 Minimum matches: ${rule.minimum_matches}`)
        console.log(`   ⏰ Recheck delay: ${rule.recheck_delay}`)
      })

      console.log(`\n🔗 Status checked at: ${result.data.last_status_check}`)
      
    } else {
      console.error('❌ Cross-reference status check failed:', result.error)
    }

  } catch (error) {
    console.error('❌ Failed to check cross-reference status:', error.message)
  }
}

async function analyzeCrossReference(clusterId) {
  const apiUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const apiKey = process.env.RSS_API_KEY || 'nonbulla-rss-key-2025'

  try {
    if (!clusterId) {
      // First, get available clusters
      const clustersResponse = await fetch(`${apiUrl}/api/story-clusters?status=detecting&limit=10`)
      const clustersResult = await clustersResponse.json()
      
      if (clustersResult.success && clustersResult.data.clusters.length > 0) {
        clusterId = clustersResult.data.clusters[0].id
        console.log(`📋 Using first available cluster: ${clusterId}`)
        console.log(`📰 Topic: "${clustersResult.data.clusters[0].primary_topic}"`)
      } else {
        console.log('❌ No clusters available for analysis')
        return
      }
    }

    console.log(`🔍 Analyzing cross-references for cluster: ${clusterId}`)
    console.log('⏰ This may take 10-30 seconds...\n')
    
    const startTime = Date.now()
    
    const response = await fetch(`${apiUrl}/api/cross-reference/analyze`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        cluster_id: clusterId,
        action: 'analyze'
      })
    })

    const duration = Date.now() - startTime

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (result.success) {
      console.log('✅ Cross-reference analysis completed!\n')
      console.log('📊 Analysis Results:')
      console.log(`   🕒 Duration: ${duration}ms`)
      console.log(`   🎯 Processing recommendation: ${result.data.processing_recommendation.toUpperCase()}`)
      console.log(`   🔗 Cross-reference score: ${(result.data.cross_reference_score * 100).toFixed(1)}%`)
      console.log(`   ✅ Matched sources: ${result.data.matched_sources}`)
      console.log(`   ❌ Missing sources: ${result.data.missing_sources.length}`)
      
      if (result.data.trigger_article_title) {
        console.log(`   🚨 Trigger article: "${result.data.trigger_article_title}"`)
      }
      
      if (result.data.missing_sources.length > 0) {
        console.log(`\n⚠️  Missing Sources:`)
        result.data.missing_sources.forEach(source => console.log(`   - ${source}`))
      }

      if (result.data.recheck_scheduled) {
        console.log(`\n⏰ Recheck scheduled for: ${new Date(result.data.recheck_scheduled).toLocaleString('nl-NL')}`)
      }

      console.log(`\n🔗 Analysis timestamp: ${result.data.analysis_timestamp}`)
      
      // Show recommendation explanation
      console.log(`\n💡 What happens next:`)
      switch (result.data.processing_recommendation) {
        case 'immediate':
          console.log('   ✅ This cluster is ready for AI perspective analysis and unified article generation!')
          break
        case 'delayed':
          console.log('   ⏳ Missing sources will be rechecked in 1 hour. If found, cluster becomes ready for processing.')
          break
        case 'insufficient':
          console.log('   ❌ This cluster does not meet cross-reference requirements and will not be processed.')
          break
      }
      
    } else {
      console.error('❌ Cross-reference analysis failed:', result.error)
      console.error('Message:', result.message)
    }

  } catch (error) {
    console.error('❌ Failed to analyze cross-references:', error.message)
    console.error('Stack:', error.stack)
    process.exit(1)
  }
}

async function processDelayedRechecks() {
  const apiUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const apiKey = process.env.RSS_API_KEY || 'nonbulla-rss-key-2025'

  try {
    console.log('⏰ Processing delayed cross-reference rechecks...')
    console.log('🔄 This will recheck missing sources and update cluster statuses\n')
    
    const startTime = Date.now()
    
    const response = await fetch(`${apiUrl}/api/cross-reference/analyze`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'process_delayed'
      })
    })

    const duration = Date.now() - startTime

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()

    if (result.success) {
      console.log('✅ Delayed rechecks processing completed!\n')
      console.log('📊 Processing Results:')
      console.log(`   🕒 Duration: ${duration}ms`)
      console.log(`   📋 Total processed: ${result.data.processed}`)
      console.log(`   ✅ Now ready for processing: ${result.data.successful}`)
      console.log(`   ⏳ Still waiting for sources: ${result.data.still_waiting}`)
      console.log(`   ❌ Exceeded max attempts: ${result.data.exceeded_attempts}`)
      
      const successRate = result.data.processed > 0 
        ? ((result.data.successful / result.data.processed) * 100).toFixed(1)
        : '0.0'
      console.log(`   📊 Success rate: ${successRate}%`)

      console.log(`\n🔗 Processing timestamp: ${result.data.timestamp}`)
      
    } else {
      console.error('❌ Delayed rechecks processing failed:', result.error)
      console.error('Message:', result.message)
    }

  } catch (error) {
    console.error('❌ Failed to process delayed rechecks:', error.message)
    console.error('Stack:', error.stack)
    process.exit(1)
  }
}

// Main execution
if (require.main === module) {
  const command = process.argv[2]
  const clusterId = process.argv[3]

  switch (command) {
    case 'status':
      checkCrossReferenceStatus()
      break
    case 'analyze':
      analyzeCrossReference(clusterId)
      break
    case 'process-delayed':
      processDelayedRechecks()
      break
    default:
      console.log('Usage:')
      console.log('  node scripts/cross-reference-test.js status')
      console.log('  node scripts/cross-reference-test.js analyze [cluster_id]')
      console.log('  node scripts/cross-reference-test.js process-delayed')
      break
  }
}

module.exports = { checkCrossReferenceStatus, analyzeCrossReference, processDelayedRechecks }