import { db } from './src/lib/db'

async function updateWaterCampaignImage() {
  try {
    console.log('💧 Updating Clean Water campaign image...')

    // Update Clean Water campaign with a more specific water project image
    const result = await db.campaign.updateMany({
      where: { title: 'Clean Water for Rural Communities' },
      data: {
        imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop&auto=format&q=80'
      }
    })

    console.log(`✅ Updated ${result.count} Clean Water campaign(s)`)

    // Verify the update
    const campaign = await db.campaign.findFirst({
      where: { title: 'Clean Water for Rural Communities' },
      select: {
        title: true,
        imageUrl: true
      }
    })

    if (campaign) {
      console.log('\n📋 Updated Campaign:')
      console.log(`• ${campaign.title}`)
      console.log(`  ${campaign.imageUrl}`)
    }

  } catch (error) {
    console.error('❌ Error updating water campaign image:', error)
  } finally {
    await db.$disconnect()
  }
}

// Run the update function
updateWaterCampaignImage()