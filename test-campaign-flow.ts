import { db } from './src/lib/db'

async function testCampaignFlow() {
  try {
    console.log('🧪 Testing campaign creation flow...')

    // Check if non-profit user exists
    const nonprofit = await db.user.findUnique({
      where: { email: 'nonprofit@example.com' }
    })

    if (!nonprofit) {
      console.log('❌ Non-profit user not found')
      return
    }

    console.log('✅ Non-profit user found:', nonprofit.name)
    console.log('✅ Role:', nonprofit.role)

    // Check existing campaigns
    const campaigns = await db.campaign.findMany({
      where: { createdById: nonprofit.id },
      select: {
        title: true,
        status: true,
        goalAmount: true,
        raisedAmount: true
      }
    })

    console.log(`✅ Found ${campaigns.length} existing campaigns:`)
    campaigns.forEach((campaign, index) => {
      const progress = ((campaign.raisedAmount / campaign.goalAmount) * 100).toFixed(1)
      console.log(`   ${index + 1}. ${campaign.title} (${progress}% funded)`)
    })

    console.log('\n🎯 Ready for campaign creation!')
    console.log('📝 To create a campaign:')
    console.log('   1. Login as: nonprofit@example.com / password123')
    console.log('   2. Go to: /dashboard/campaigns/create')
    console.log('   3. Fill out the form and submit')

  } catch (error) {
    console.error('❌ Error testing campaign flow:', error)
  } finally {
    await db.$disconnect()
  }
}

testCampaignFlow()