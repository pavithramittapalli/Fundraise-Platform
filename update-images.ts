import { db } from './src/lib/db'

async function updateCampaignImages() {
  try {
    console.log('🖼️ Updating campaign images...')

    // Update Clean Water campaign image
    await db.campaign.updateMany({
      where: { title: 'Clean Water for Rural Communities' },
      data: {
        imageUrl: 'https://images.unsplash.com/photo-1548191977-7d76d99aa0c2?w=800&h=600&fit=crop&auto=format&q=80'
      }
    })

    // Update Food Security campaign image with a more relevant one
    await db.campaign.updateMany({
      where: { title: 'Food Security Program' },
      data: {
        imageUrl: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=800&h=600&fit=crop&auto=format&q=80'
      }
    })

    // Update all other campaigns with optimized images
    await db.campaign.updateMany({
      where: { title: 'Education for Every Child' },
      data: {
        imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop&auto=format&q=80'
      }
    })

    await db.campaign.updateMany({
      where: { title: 'Save the Rainforest' },
      data: {
        imageUrl: 'https://images.unsplash.com/photo-1540206395-68808572332f?w=800&h=600&fit=crop&auto=format&q=80'
      }
    })

    await db.campaign.updateMany({
      where: { title: 'Medical Supplies for Clinics' },
      data: {
        imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop&auto=format&q=80'
      }
    })

    console.log('✅ Campaign images updated successfully!')

    // Show updated campaigns
    const campaigns = await db.campaign.findMany({
      select: {
        title: true,
        imageUrl: true
      }
    })

    console.log('\n📋 Updated Campaign Images:')
    campaigns.forEach(campaign => {
      console.log(`• ${campaign.title}`)
      console.log(`  ${campaign.imageUrl}`)
      console.log('')
    })

  } catch (error) {
    console.error('❌ Error updating campaign images:', error)
  } finally {
    await db.$disconnect()
  }
}

// Run the update function
updateCampaignImages()