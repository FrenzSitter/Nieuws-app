#!/usr/bin/env node

const fetch = require('node-fetch');

async function testAIApi() {
  console.log('🧪 Testing AI Perspective Engine API...\n');

  try {
    // Test 1: Check API status
    console.log('1️⃣ Testing API status...');
    const statusResponse = await fetch('http://localhost:3000/api/ai/generate-article?action=status');
    
    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      console.log('✅ API Status:', statusData.success ? 'Working' : 'Failed');
      console.log('📊 Stats:');
      console.log('   - Total unified articles:', statusData.data?.stats?.total_unified_articles || 0);
      console.log('   - Clusters ready for AI:', statusData.data?.stats?.clusters_ready_for_ai || 0);
      console.log('   - OpenAI API configured:', statusData.data?.stats?.openai_api_configured || false);
      console.log('   - Average confidence score:', statusData.data?.stats?.avg_confidence_score || 'N/A');
    } else {
      console.log('❌ Status API failed:', statusResponse.status);
    }

    // Test 2: Check recent articles
    console.log('\n2️⃣ Testing recent articles API...');
    const recentResponse = await fetch('http://localhost:3000/api/ai/generate-article?action=recent&limit=5');
    
    if (recentResponse.ok) {
      const recentData = await recentResponse.json();
      console.log('✅ Recent Articles API: Working');
      console.log('📰 Recent articles:', recentData.data?.total_count || 0);
    } else {
      console.log('❌ Recent Articles API failed:', recentResponse.status);
    }

    // Test 3: Test article generation (requires API key and cluster)
    console.log('\n3️⃣ Testing article generation...');
    const generateResponse = await fetch('http://localhost:3000/api/ai/generate-article', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RSS_API_KEY || 'nonbulla-rss-key-2025'}`
      },
      body: JSON.stringify({
        action: 'batch_generate'
      })
    });

    if (generateResponse.ok) {
      const generateData = await generateResponse.json();
      console.log('✅ Article Generation API: Working');
      console.log('🤖 Generated articles:', generateData.data?.generated || 0);
      console.log('📝 Processed clusters:', generateData.data?.processed || 0);
      console.log('❌ Failed generations:', generateData.data?.failed || 0);
    } else {
      console.log('❌ Article Generation API failed:', generateResponse.status);
    }

  } catch (error) {
    console.error('🚨 Test failed:', error.message);
    console.log('\n💡 Make sure the development server is running with: npm run dev');
  }

  console.log('\n🏁 AI API test completed');
}

// Run if this script is executed directly
if (require.main === module) {
  testAIApi();
}

module.exports = { testAIApi };