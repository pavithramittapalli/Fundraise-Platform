'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import { Campaign, Donation, Role } from '@prisma/client'

interface CampaignWithDetails extends Campaign {
  _count: {
    donations: number
  }
}

interface DonationWithDetails extends Donation {
  campaign: {
    id: string
    title: string
    imageUrl: string
    status: string
  }
}

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  
  const [campaigns, setCampaigns] = useState<CampaignWithDetails[]>([])
  const [donations, setDonations] = useState<DonationWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login')
      return
    }

    if (user) {
      fetchDashboardData()
    }
  }, [user, router, isLoading])

  const fetchDashboardData = async () => {
    try {
      if (user?.role === Role.NONPROFIT) {
        // Fetch campaigns created by this nonprofit
        const campaignsData = await apiClient.get<{ campaigns: CampaignWithDetails[] }>('/api/campaigns?createdBy=' + user.id)
        setCampaigns(campaignsData.campaigns)
      } else if (user?.role === Role.DONOR) {
        // Fetch donations made by this donor
        const donationsData = await apiClient.get<{ donations: DonationWithDetails[], totalDonated: number, count: number }>('/api/donations')
        setDonations(donationsData.donations)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const calculateProgress = (raised: number, goal: number) => {
    return Math.min((raised / goal) * 100, 100)
  }

  const calculateStats = () => {
    if (user?.role === Role.NONPROFIT) {
      const totalRaised = campaigns.reduce((sum, campaign) => sum + campaign.raisedAmount, 0)
      const totalGoal = campaigns.reduce((sum, campaign) => sum + campaign.goalAmount, 0)
      const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE').length
      const completedCampaigns = campaigns.filter(c => c.status === 'COMPLETED').length

      return {
        totalRaised,
        totalGoal,
        activeCampaigns,
        completedCampaigns,
        totalCampaigns: campaigns.length
      }
    } else {
      const totalDonated = donations.reduce((sum, donation) => sum + donation.amount, 0)
      const campaignsSupported = new Set(donations.map(d => d.campaignId)).size

      return {
        totalDonated,
        campaignsSupported,
        totalDonations: donations.length
      }
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please sign in to access your dashboard</h2>
          <Link href="/auth/login">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const stats = calculateStats()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">FR</span>
              </div>
              <h1 className="text-2xl font-bold">FundRaise</h1>
            </Link>
            
            <nav className="flex items-center space-x-4">
              <Link href="/" className="text-muted-foreground hover:text-foreground">
                Home
              </Link>
              <Link href="/campaigns" className="text-muted-foreground hover:text-foreground">
                Explore
              </Link>
              <Link href="/about" className="text-muted-foreground hover:text-foreground">
                About
              </Link>
              <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                Contact
              </Link>
              
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">
                  Welcome, {user.name}
                </span>
                <Badge variant={user.role === 'NONPROFIT' ? 'default' : 'secondary'}>
                  {user.role === 'NONPROFIT' ? 'Non-Profit' : 'Donor'}
                </Badge>
                <Button variant="outline" size="sm" onClick={logout}>
                  Logout
                </Button>
              </div>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {user.role === 'NONPROFIT' ? 'Non-Profit Dashboard' : 'Donor Dashboard'}
          </h1>
          <p className="text-muted-foreground">
            {user.role === 'NONPROFIT' 
              ? 'Manage your campaigns and track fundraising progress'
              : 'View your donation history and impact'
            }
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {user.role === 'NONPROFIT' ? (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeCampaigns} active, {stats.completedCampaigns} completed
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(stats.totalRaised)}</div>
                  <p className="text-xs text-muted-foreground">
                    Goal: {formatCurrency(stats.totalGoal)}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
                  <p className="text-xs text-muted-foreground">
                    Currently fundraising
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.totalCampaigns > 0 
                      ? Math.round((stats.completedCampaigns / stats.totalCampaigns) * 100)
                      : 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Campaigns completed
                  </p>
                </CardContent>
              </Card>
            </>
          ) : (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Donated</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(stats.totalDonated)}</div>
                  <p className="text-xs text-muted-foreground">
                    All time contribution
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Campaigns Supported</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.campaignsSupported}</div>
                  <p className="text-xs text-muted-foreground">
                    Different causes
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalDonations}</div>
                  <p className="text-xs text-muted-foreground">
                    Individual contributions
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Average Donation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.totalDonations > 0 
                      ? formatCurrency(stats.totalDonated / stats.totalDonations)
                      : formatCurrency(0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Per contribution
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Main Content */}
        {user.role === 'NONPROFIT' ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Your Campaigns</h2>
              <Link href="/dashboard/campaigns/create">
                <Button>Create New Campaign</Button>
              </Link>
            </div>

            {campaigns.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-semibold">No campaigns yet</h3>
                    <p className="text-muted-foreground">
                      Start making a difference by creating your first campaign
                    </p>
                    <Link href="/dashboard/campaigns/create">
                      <Button>Create Your First Campaign</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {campaigns.map((campaign) => (
                  <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                    {campaign.imageUrl && (
                      <div className="h-48 w-full overflow-hidden rounded-t-lg">
                        <img
                          src={campaign.imageUrl}
                          alt={campaign.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg line-clamp-2">
                          {campaign.title}
                        </CardTitle>
                        <Badge variant={campaign.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {campaign.status.toLowerCase()}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">
                              {formatCurrency(campaign.raisedAmount)} / {formatCurrency(campaign.goalAmount)}
                            </span>
                          </div>
                          <Progress 
                            value={calculateProgress(campaign.raisedAmount, campaign.goalAmount)} 
                            className="h-2"
                          />
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>{calculateProgress(campaign.raisedAmount, campaign.goalAmount).toFixed(1)}% funded</span>
                            <span>{campaign._count.donations} donations</span>
                          </div>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          Created {formatDate(campaign.createdAt)}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Link href={`/campaigns/${campaign.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                          View
                        </Button>
                      </Link>
                      <Link href={`/dashboard/campaigns/${campaign.id}/edit`} className="flex-1">
                        <Button className="w-full">
                          Edit
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Your Donation History</h2>

            {donations.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <h3 className="text-lg font-semibold">No donations yet</h3>
                    <p className="text-muted-foreground">
                      Start supporting meaningful causes by making your first donation
                    </p>
                    <Link href="/campaigns">
                      <Button>Browse Campaigns</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Donations</CardTitle>
                  <CardDescription>
                    Your contribution history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {donations.map((donation) => (
                      <div key={donation.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          {donation.campaign.imageUrl && (
                            <img
                              src={donation.campaign.imageUrl}
                              alt={donation.campaign.title}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                          <div>
                            <h4 className="font-medium">{donation.campaign.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              Donated on {formatDate(donation.donatedAt)}
                            </p>
                            <Badge variant="outline" className="mt-1">
                              {donation.campaign.status.toLowerCase()}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-primary">
                            {formatCurrency(donation.amount)}
                          </div>
                          <Link href={`/campaigns/${donation.campaignId}`}>
                            <Button variant="outline" size="sm">
                              View Campaign
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  )
}