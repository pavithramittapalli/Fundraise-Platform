import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromHeaders, verifyToken } from '@/lib/auth'
import { Role } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromHeaders(request.headers)
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    // Check if user is a donor
    if (payload.role !== Role.DONOR) {
      return NextResponse.json(
        { error: 'Only donors can make donations' },
        { status: 403 }
      )
    }

    const { campaignId, amount } = await request.json()

    // Validation
    if (!campaignId || !amount) {
      return NextResponse.json(
        { error: 'Campaign ID and amount are required' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Donation amount must be greater than 0' },
        { status: 400 }
      )
    }

    // Check if campaign exists
    const campaign = await db.campaign.findUnique({
      where: { id: campaignId }
    })

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      )
    }

    // Create donation and update campaign raised amount in a transaction
    const result = await db.$transaction(async (tx) => {
      // Create donation
      const donation = await tx.donation.create({
        data: {
          amount: parseFloat(amount),
          donorId: payload.userId,
          campaignId
        },
        include: {
          donor: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          campaign: {
            select: {
              id: true,
              title: true
            }
          }
        }
      })

      // Update campaign raised amount
      await tx.campaign.update({
        where: { id: campaignId },
        data: {
          raisedAmount: {
            increment: parseFloat(amount)
          }
        }
      })

      return donation
    })

    return NextResponse.json({
      message: 'Donation successful',
      donation: result
    })
  } catch (error) {
    console.error('Create donation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeaders(request.headers)
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const donorId = searchParams.get('donorId') || payload.userId

    // Only allow users to see their own donations
    if (donorId !== payload.userId) {
      return NextResponse.json(
        { error: 'You can only view your own donations' },
        { status: 403 }
      )
    }

    const donations = await db.donation.findMany({
      where: { donorId },
      include: {
        campaign: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
            status: true
          }
        }
      },
      orderBy: {
        donatedAt: 'desc'
      }
    })

    // Calculate total donated
    const totalDonated = donations.reduce((sum, donation) => sum + donation.amount, 0)

    return NextResponse.json({
      donations,
      totalDonated,
      count: donations.length
    })
  } catch (error) {
    console.error('Get donations error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}