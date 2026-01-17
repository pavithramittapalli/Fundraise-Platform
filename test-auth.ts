import { db } from './src/lib/db'
import { hashPassword, verifyPassword, generateToken } from './src/lib/auth'

async function testAuth() {
  try {
    console.log('🔐 Testing authentication...')

    // Get the nonprofit user from database
    const nonprofit = await db.user.findUnique({
      where: { email: 'nonprofit@example.com' }
    })

    if (!nonprofit) {
      console.log('❌ Non-profit user not found')
      return
    }

    console.log('✅ Found non-profit user:')
    console.log(`   Email: ${nonprofit.email}`)
    console.log(`   Name: ${nonprofit.name}`)
    console.log(`   Role: ${nonprofit.role}`)

    // Test password verification
    const isValid = await verifyPassword('password123', nonprofit.password)
    console.log(`   Password valid: ${isValid}`)

    // Generate a test token
    const token = generateToken({
      userId: nonprofit.id,
      email: nonprofit.email,
      role: nonprofit.role
    })
    console.log(`   Token: ${token.substring(0, 50)}...`)

  } catch (error) {
    console.error('❌ Error testing auth:', error)
  } finally {
    await db.$disconnect()
  }
}

testAuth()