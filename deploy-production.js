#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🚀 Deploying Nonbulla AI Perspective Engine to production...\n');

try {
  console.log('1️⃣ Checking Vercel CLI...');
  try {
    execSync('vercel --version', { stdio: 'inherit' });
  } catch (error) {
    console.log('❌ Vercel CLI not found. Installing...');
    execSync('npm install -g vercel', { stdio: 'inherit' });
  }

  console.log('\n2️⃣ Deploying to Vercel...');
  execSync('vercel --prod', { stdio: 'inherit' });

  console.log('\n3️⃣ Setting up environment variables...');
  console.log('⚠️  Remember to set these environment variables in Vercel dashboard:');
  console.log('   • ANTHROPIC_API_KEY - Your Claude API key (primary AI engine)');
  console.log('   • OPENAI_API_KEY - Your OpenAI API key (for DALL-E images)');
  console.log('   • RSS_API_KEY - API key for internal RSS endpoints');
  console.log('   • CRON_SECRET - Secret for cron job authentication');
  console.log('   • SUPABASE_URL - Your Supabase project URL');
  console.log('   • SUPABASE_ANON_KEY - Your Supabase anonymous key');
  console.log('   • SUPABASE_SERVICE_ROLE_KEY - Your Supabase service role key');
  console.log('   • UPSTASH_REDIS_REST_URL - Redis cache URL (optional)');
  console.log('   • UPSTASH_REDIS_REST_TOKEN - Redis auth token (optional)');

  console.log('\n4️⃣ Verifying cron jobs...');
  console.log('✅ Optimized Cron Workflow configured:');
  console.log('   • RSS Crawl + Clustering: Every hour at :05');
  console.log('   • Cross-reference Analysis: Every hour at :25 (20min after RSS)');
  console.log('   • AI Multi-Perspective Synthesis: Every hour at :45 (20min after cross-ref)');
  console.log('   • System Cleanup: Daily at 3:00 AM');
  console.log('   • Health Monitoring: Every 15 minutes');

  console.log('\n5️⃣ Testing endpoints...');
  console.log('🔗 Test these API endpoints after deployment:');
  console.log('   • GET /api/monitoring/performance?action=health_check');
  console.log('   • GET /api/ai/generate-article?action=status');
  console.log('   • GET /api/cross-reference/analyze?action=status');
  console.log('   • GET /api/rss/status');
  console.log('   • GET /api/ai/generate-article?action=recent&limit=5');

  console.log('\n🎉 Deployment completed!');
  console.log('📊 Monitor your deployment at https://vercel.com/dashboard');
  console.log('📰 Your Nonbulla Multi-Perspective News Platform is now live!');
  console.log('');
  console.log('🔄 Automated Workflow:');
  console.log('   RSS Sources → Article Clustering → Cross-Reference Analysis → AI Synthesis');
  console.log('');
  console.log('🎨 Features Enabled:');
  console.log('   • Multi-perspective news synthesis with Claude');
  console.log('   • Filter bubble breaking analysis');
  console.log('   • Political balance detection');
  console.log('   • Source credibility scoring');
  console.log('   • Real-time monitoring and alerts');
  console.log('   • Automated cleanup and health checks');

} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  console.log('\n💡 Troubleshooting:');
  console.log('   • Make sure you\'re logged into Vercel: vercel login');
  console.log('   • Check your project settings in vercel.json');
  console.log('   • Verify all environment variables are set');
  process.exit(1);
}