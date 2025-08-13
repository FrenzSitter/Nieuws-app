#!/usr/bin/env node

/**
 * Simple RSS Test Script
 * Tests RSS parsing without database integration
 */

const Parser = require('rss-parser')
const parser = new Parser()

async function testRSSFeed(url) {
  try {
    console.log(`🔍 Testing RSS feed: ${url}`)
    
    const feed = await parser.parseURL(url)
    
    console.log(`📰 Feed title: ${feed.title}`)
    console.log(`📊 Number of items: ${feed.items.length}`)
    
    if (feed.items.length > 0) {
      console.log(`\n🎯 First article:`)
      console.log(`   Title: ${feed.items[0].title}`)
      console.log(`   Link: ${feed.items[0].link}`)
      console.log(`   Published: ${feed.items[0].pubDate}`)
    }
    
    return true
  } catch (error) {
    console.error(`❌ Failed to parse ${url}:`, error.message)
    return false
  }
}

async function testMultipleFeeds() {
  const feeds = [
    'https://feeds.nos.nl/nosnieuwsalgemeen',
    'https://www.nu.nl/rss/Algemeen',
    'https://www.volkskrant.nl/voorpagina/rss.xml'
  ]
  
  console.log('🚀 Testing RSS feeds for Nonbulla...\n')
  
  let successful = 0
  
  for (const feed of feeds) {
    const result = await testRSSFeed(feed)
    if (result) successful++
    console.log('---\n')
  }
  
  console.log(`✅ Successfully tested ${successful}/${feeds.length} RSS feeds`)
}

if (require.main === module) {
  testMultipleFeeds()
}