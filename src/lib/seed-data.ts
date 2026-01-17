import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { Role, CampaignStatus } from '@prisma/client'

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...')

    // Create sample users
    const nonprofitUser = await db.user.upsert({
      where: { email: 'nonprofit@example.com' },
      update: {},
      create: {
        name: 'Helping Hands Foundation',
        email: 'nonprofit@example.com',
        password: await hashPassword('password123'),
        role: Role.NONPROFIT
      }
    })

    const donorUser = await db.user.upsert({
      where: { email: 'donor@example.com' },
      update: {},
      create: {
        name: 'John Doe',
        email: 'donor@example.com',
        password: await hashPassword('password123'),
        role: Role.DONOR
      }
    })

    console.log('✅ Created sample users')

    // Create sample campaigns
    const campaigns = [
      {
        title: 'Clean Water for Rural Communities',
        description: 'Help us bring clean, safe drinking water to rural communities in developing countries. Your donation will fund the construction of wells and water purification systems that will serve thousands of families.',
        goalAmount: 50000,
        raisedAmount: 32500,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        imageUrl: 'https://images.unsplash.com/photo-1548191977-7d76d99aa0c2?w=800&h=600&fit=crop',
        status: CampaignStatus.ACTIVE,
        createdById: nonprofitUser.id
      },
      {
        title: 'Education for Every Child',
        description: 'Providing quality education materials, school supplies, and technology to underprivileged children. Every child deserves access to education that can transform their future and break the cycle of poverty.',
        goalAmount: 25000,
        raisedAmount: 18750,
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop',
        status: CampaignStatus.ACTIVE,
        createdById: nonprofitUser.id
      },
      {
        title: 'Save the Rainforest',
        description: 'Join us in our mission to protect endangered rainforests. Your support helps fund conservation efforts, reforestation projects, and wildlife protection programs in critical ecosystems around the world.',
        goalAmount: 75000,
        raisedAmount: 12000,
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
        imageUrl: 'https://images.unsplash.com/photo-1540206395-68808572332f?w=800&h=600&fit=crop',
        status: CampaignStatus.ACTIVE,
        createdById: nonprofitUser.id
      },
      {
        title: 'Medical Supplies for Clinics',
        description: 'Providing essential medical supplies and equipment to rural clinics that serve communities with limited healthcare access. Your donation saves lives by ensuring doctors have the tools they need.',
        goalAmount: 30000,
        raisedAmount: 30000,
        deadline: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago (completed)
        imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=600&fit=crop',
        status: CampaignStatus.COMPLETED,
        createdById: nonprofitUser.id
      },
      {
        title: 'Food Security Program',
        description: 'Establishing sustainable food programs that provide nutritious meals to families facing food insecurity. We focus on both immediate relief and long-term solutions through community gardens and education.',
        goalAmount: 40000,
        raisedAmount: 28000,
        deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
        imageUrl: 'https://images.unsplash.com/photo-1516550893923-42d28c936723?w=800&h=600&fit=crop',
        status: CampaignStatus.ACTIVE,
        createdById: nonprofitUser.id
      }
    ]

    for (const campaignData of campaigns) {
      await db.campaign.upsert({
        where: { 
          title: campaignData.title 
        },
        update: campaignData,
        create: campaignData
      })
    }

    console.log('✅ Created sample campaigns')

    // Create sample donations
    const createdCampaigns = await db.campaign.findMany({
      where: { createdById: nonprofitUser.id }
    })

    for (const campaign of createdCampaigns) {
      if (campaign.raisedAmount > 0) {
        // Create a few sample donations for each campaign
        const donationCount = Math.floor(Math.random() * 5) + 3
        const donationAmount = campaign.raisedAmount / donationCount

        for (let i = 0; i < donationCount; i++) {
          await db.donation.create({
            data: {
              amount: donationAmount,
              donorId: donorUser.id,
              campaignId: campaign.id,
              donatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) // Random date within last 30 days
            }
          })
        }
      }
    }

    console.log('✅ Created sample donations')

    console.log('🎉 Database seeding completed successfully!')
    console.log('\n📧 Sample Login Credentials:')
    console.log('Non-Profit: nonprofit@example.com / password123')
    console.log('Donor: donor@example.com / password123')

  } catch (error) {
    console.error('❌ Error seeding database:', error)
  } finally {
    await db.$disconnect()
  }
}

// Run the seeding function
if (require.main === module) {
  seedDatabase()
}

export default seedDatabase