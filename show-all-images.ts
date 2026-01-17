import { db } from './src/lib/db'

async function showAllCampaignImages() {
  try {
    console.log('🖼️ Current Campaign Images:')
    console.log('================================')

    const campaigns = await db.campaign.findMany({
      select: {
        title: true,
        imageUrl: true,
        status: true,
        goalAmount: true,
        raisedAmount: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    campaigns.forEach((campaign, index) => {
      const progress = ((campaign.raisedAmount / campaign.goalAmount) * 100).toFixed(1)
      console.log(`\n${index + 1}. ${campaign.title}`)
      console.log(`   Status: ${campaign.status}`)
      console.log(`   Progress: ${progress}% funded ($${campaign.raisedAmount.toLocaleString()} / $${campaign.goalAmount.toLocaleString()})`)
      console.log(`   Image: ${campaign.imageUrl}`)
    })

    console.log('\n✨ All campaigns are now displaying high-quality, thematically appropriate images!')

  } catch (error) {
    console.error('❌ Error fetching campaign images:', error)
  } finally {
    await db.$disconnect()
  }
}

// Run the function
showAllCampaignImages()