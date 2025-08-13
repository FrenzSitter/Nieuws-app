#!/usr/bin/env node

const fetch = require('node-fetch');

async function testClaudeAI() {
  console.log('🧪 Testing Claude + DALL-E AI Perspective Engine...\n');

  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000';

  try {
    // Test 1: Check API status and configuration
    console.log('1️⃣ Testing AI configuration...');
    const statusResponse = await fetch(`${baseUrl}/api/ai/generate-article?action=status`);
    
    if (statusResponse.ok) {
      const statusData = await statusResponse.json();
      console.log('✅ API Status:', statusData.success ? 'Working' : 'Failed');
      console.log('🔧 Configuration:');
      console.log('   - Text AI Model:', statusData.data?.requirements?.text_ai_model || 'Not configured');
      console.log('   - Image AI Model:', statusData.data?.requirements?.image_ai_model || 'Not configured');
      console.log('   - Anthropic API:', statusData.data?.stats?.anthropic_api_configured ? '✅ Configured' : '❌ Missing');
      console.log('   - OpenAI API:', statusData.data?.stats?.openai_api_configured ? '✅ Configured' : '❌ Missing');
      console.log('   - Clusters ready:', statusData.data?.stats?.clusters_ready_for_ai || 0);
    } else {
      console.log('❌ Status API failed:', statusResponse.status);
    }

    // Test 2: Check recent articles generated with Claude
    console.log('\n2️⃣ Testing recent articles...');
    const recentResponse = await fetch(`${baseUrl}/api/ai/generate-article?action=recent&limit=3`);
    
    if (recentResponse.ok) {
      const recentData = await recentResponse.json();
      console.log('✅ Recent Articles API: Working');
      console.log('📰 Total articles generated:', recentData.data?.total_count || 0);
      
      if (recentData.data?.articles?.length > 0) {
        console.log('📋 Recent articles:');
        recentData.data.articles.forEach((article, index) => {
          console.log(`   ${index + 1}. "${article.title}"`);
          console.log(`      - Sources: ${article.sources_count}`);
          console.log(`      - Confidence: ${Math.round(article.confidence_score * 100)}%`);
          console.log(`      - Generated: ${new Date(article.generated_at).toLocaleDateString('nl-NL')}`);
        });
      }
    } else {
      console.log('❌ Recent Articles API failed:', recentResponse.status);
    }

    // Test 3: Test batch generation (Claude processing)
    console.log('\n3️⃣ Testing Claude batch generation...');
    const generateResponse = await fetch(`${baseUrl}/api/ai/generate-article?action=batch_generate`, {
      method: 'GET' // Using GET for Vercel cron compatibility
    });

    if (generateResponse.ok) {
      const generateData = await generateResponse.json();
      console.log('✅ Batch Generation API: Working');
      console.log('🤖 Results:');
      console.log('   - Clusters processed:', generateData.data?.processed || 0);
      console.log('   - Articles generated:', generateData.data?.generated || 0);
      console.log('   - Generation failures:', generateData.data?.failed || 0);
      
      if (generateData.data?.articles?.length > 0) {
        console.log('📝 Generated articles:');
        generateData.data.articles.forEach((article, index) => {
          console.log(`   ${index + 1}. "${article.title}"`);
          console.log(`      - Sources: ${article.sources}`);
          console.log(`      - Confidence: ${Math.round(article.confidence * 100)}%`);
        });
      }
    } else {
      const errorData = await generateResponse.text();
      console.log('❌ Batch Generation failed:', generateResponse.status);
      console.log('Error details:', errorData.substring(0, 200));
    }

    // Test 4: Manual article generation test
    console.log('\n4️⃣ Testing manual article generation...');
    console.log('💡 To test manual generation, you can POST to:');
    console.log(`   ${baseUrl}/api/ai/generate-article`);
    console.log('   With body: {"action": "generate", "cluster_id": "your-cluster-id"}');
    console.log('   And header: "Authorization: Bearer nonbulla-rss-key-2025"');

  } catch (error) {
    console.error('🚨 Test failed:', error.message);
    console.log('\n💡 Troubleshooting tips:');
    console.log('   • Make sure the development server is running: npm run dev');
    console.log('   • Or test on production: VERCEL_URL=your-app.vercel.app node test-claude-ai.js');
    console.log('   • Check environment variables: ANTHROPIC_API_KEY, OPENAI_API_KEY');
  }

  console.log('\n🏁 Claude AI test completed');
  console.log('📚 Next steps:');
  console.log('   1. Set ANTHROPIC_API_KEY in environment');
  console.log('   2. Set OPENAI_API_KEY for hero images (optional)');
  console.log('   3. Deploy to Vercel: vercel --prod');
  console.log('   4. Monitor first Claude-generated articles');
}

// Run if this script is executed directly
if (require.main === module) {
  testClaudeAI();
}

module.exports = { testClaudeAI };