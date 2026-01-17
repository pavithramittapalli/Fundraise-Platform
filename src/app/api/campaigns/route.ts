import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getTokenFromHeaders, verifyToken } from '@/lib/auth'
import { CampaignStatus, Role } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || CampaignStatus.ACTIVE
    const createdBy = searchParams.get('createdBy')

    let whereClause: any = { status }

    if (createdBy) {
      whereClause.createdById = createdBy
    }

    const campaigns = await db.campaign.findMany({
      where: whereClause,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            donations: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ campaigns })
  } catch (error) {
    console.error('Get campaigns error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    // Check if user is a nonprofit
    if (payload.role !== Role.NONPROFIT) {
      return NextResponse.json(
        { error: 'Only nonprofits can create campaigns' },
        { status: 403 }
      )
    }

    const { title, description, goalAmount, deadline, imageUrl } = await request.json()

    // Validation
    if (!title || !description || !goalAmount || !deadline) {
      return NextResponse.json(
        { error: 'Title, description, goal amount, and deadline are required' },
        { status: 400 }
      )
    }

    if (goalAmount <= 0) {
      return NextResponse.json(
        { error: 'Goal amount must be greater than 0' },
        { status: 400 }
      )
    }

    const campaign = await db.campaign.create({
      data: {
        title,
        description,
        goalAmount: parseFloat(goalAmount),
        deadline: new Date(deadline),
        imageUrl,
        createdById: payload.userId
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Campaign created successfully',
      campaign
    })
  } catch (error) {
    console.error('Create campaign error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}