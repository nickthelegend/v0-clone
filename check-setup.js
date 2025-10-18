const fs = require('fs');
const path = require('path');

console.log('🔍 Checking setup...\n');

// Check .env file
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  
  console.log('✅ .env file exists');
  
  const hasSupabaseUrl = envContent.includes('NEXT_PUBLIC_SUPABASE_URL=') && 
                         !envContent.includes('NEXT_PUBLIC_SUPABASE_URL=your_supabase');
  const hasSupabaseKey = envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=') && 
                         !envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase');
  const hasDatabaseUrl = envContent.includes('DATABASE_URL=') && 
                         !envContent.includes('[YOUR-PASSWORD]');
  
  if (hasSupabaseUrl) {
    console.log('✅ NEXT_PUBLIC_SUPABASE_URL is set');
  } else {
    console.log('❌ NEXT_PUBLIC_SUPABASE_URL is NOT set or using placeholder');
  }
  
  if (hasSupabaseKey) {
    console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY is set');
  } else {
    console.log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is NOT set or using placeholder');
  }
  
  if (hasDatabaseUrl) {
    console.log('✅ DATABASE_URL is set');
  } else {
    console.log('❌ DATABASE_URL contains [YOUR-PASSWORD] placeholder');
  }
} else {
  console.log('❌ .env file not found');
}

console.log('\n📋 Next steps:');
console.log('1. Update .env with your Supabase credentials');
console.log('2. Run: npm run db:push');
console.log('3. Run: npm run db:seed');
console.log('4. Run: npm run dev');
