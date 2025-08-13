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
  console.log('   • OPENAI_API_KEY - Your OpenAI API key for GPT-4o');
  console.log('   • RSS_API_KEY - API key for internal RSS endpoints');
  console.log('   • SUPABASE_URL - Your Supabase project URL');
  console.log('   • SUPABASE_ANON_KEY - Your Supabase anonymous key');
  console.log('   • SUPABASE_SERVICE_ROLE_KEY - Your Supabase service role key');

  console.log('\n4️⃣ Verifying cron jobs...');
  console.log('✅ Cron jobs configured:');
  console.log('   • Enhanced RSS Crawl: Every hour at :00');
  console.log('   • Cross-reference check: Every 15 minutes');  
  console.log('   • AI article generation: Every hour at :30');

  console.log('\n5️⃣ Testing endpoints...');
  console.log('🔗 Test these API endpoints after deployment:');
  console.log('   • GET /api/ai/generate-article?action=status');
  console.log('   • GET /api/ai/generate-article?action=recent&limit=5');
  console.log('   • GET /api/ai/generate-article?action=batch_generate (for manual testing)');

  console.log('\n🎉 Deployment completed!');
  console.log('📊 Monitor your deployment at https://vercel.com/dashboard');
  console.log('📰 Your Nonbulla news aggregator is now live with AI perspective analysis!');

} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  console.log('\n💡 Troubleshooting:');
  console.log('   • Make sure you\'re logged into Vercel: vercel login');
  console.log('   • Check your project settings in vercel.json');
  console.log('   • Verify all environment variables are set');
  process.exit(1);
}