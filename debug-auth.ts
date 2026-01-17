import { db } from './src/lib/db'
import { verifyPassword, generateToken } from './src/lib/auth'

async function debugAuth() {
  try {
    console.log('🔍 Debugging Authentication System...')
    
    // 1. Check database connection
    console.log('\n1. Testing Database Connection:')
    const userCount = await db.user.count()
    console.log(`   ✅ Connected to database (${userCount} users found)`)
    
    // 2. Check non-profit user
    console.log('\n2. Checking Non-Profit User:')
    const nonprofit = await db.user.findUnique({
      where: { email: 'nonprofit@example.com' }
    })
    
    if (!nonprofit) {
      console.log('   ❌ Non-profit user not found')
      return
    }
    
    console.log(`   ✅ Found: ${nonprofit.name} (${nonprofit.role})`)
    console.log(`   📧 Email: ${nonprofit.email}`)
    console.log(`   🆔 ID: ${nonprofit.id}`)
    
    // 3. Test password verification
    console.log('\n3. Testing Password Verification:')
    const isValid = await verifyPassword('password123', nonprofit.password)
    console.log(`   ${isValid ? '✅' : '❌'} Password verification: ${isValid}`)
    
    // 4. Generate test token
    console.log('\n4. Generating Test Token:')
    const token = generateToken({
      userId: nonprofit.id,
      email: nonprofit.email,
      role: nonprofit.role
    })
    console.log(`   ✅ Token generated: ${token.substring(0, 50)}...`)
    
    // 5. Test token verification
    console.log('\n5. Testing Token Verification:')
    const { verifyToken } = require('./src/lib/auth')
    const payload = verifyToken(token)
    console.log(`   ${payload ? '✅' : '❌'} Token verification: ${payload ? 'Valid' : 'Invalid'}`)
    
    if (payload) {
      console.log(`   👤 User ID: ${payload.userId}`)
      console.log(`   📧 Email: ${payload.email}`)
      console.log(`   🎭 Role: ${payload.role}`)
    }
    
    // 6. Check existing campaigns
    console.log('\n6. Checking Existing Campaigns:')
    const campaigns = await db.campaign.findMany({
      where: { createdById: nonprofit.id },
      select: { title: true, status: true }
    })
    console.log(`   ✅ Found ${campaigns.length} campaigns:`)
    campaigns.forEach((c, i) => {
      console.log(`   ${i + 1}. ${c.title} (${c.status})`)
    })
    
    console.log('\n🎯 Manual Testing Instructions:')
    console.log('1. Open browser console (F12)')
    console.log('2. Run: localStorage.clear()')
    console.log('3. Run: sessionStorage.clear()')
    console.log('4. Go to: /auth/login')
    console.log('5. Login with: nonprofit@example.com / password123')
    console.log('6. Check localStorage for token after login')
    console.log('7. Try accessing: /dashboard/campaigns/create')
    
    console.log('\n🔧 If still failing, try:')
    console.log('1. Use: /simple-create (bypasses redirects)')
    console.log('2. Open in: Incognito/Private mode')
    console.log('3. Different browser')
    
  } catch (error) {
    console.error('❌ Debug error:', error)
  } finally {
    await db.$disconnect()
  }
}

debugAuth()