'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import { Campaign, Donation } from '@prisma/client'

interface CampaignWithDetails extends Campaign {
  createdBy: {
    id: string
    name: string
    email: string
  }
  donations: (Donation & {
    donor: {
      id: string
      name: string
    }
  })[]
  _count: {
    donations: number
  }
}

export default function CampaignDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const campaignId = params.id as string

  const [campaign, setCampaign] = useState<CampaignWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [donationAmount, setDonationAmount] = useState('')
  const [isDonating, setIsDonating] = useState(false)
  const [donationError, setDonationError] = useState('')
  const [donationSuccess, setDonationSuccess] = useState(false)
  const [isDonationDialogOpen, setIsDonationDialogOpen] = useState(false)

  useEffect(() => {
    if (campaignId) {
      fetchCampaign()
    }
  }, [campaignId])

  const fetchCampaign = async () => {
    try {
      const data = await apiClient.get<{ campaign: CampaignWithDetails }>(`/api/campaigns/${campaignId}`)
      setCampaign(data.campaign)
    } catch (error) {
      console.error('Failed to fetch campaign:', error)
      router.push('/campaigns')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDonation = async (e: React.FormEvent) => {
    e.preventDefault()
    setDonationError('')
    setIsDonating(true)

    try {
      const amount = parseFloat(donationAmount)
      if (amount <= 0) {
        setDonationError('Donation amount must be greater than 0')
        return
      }

      await apiClient.post('/api/donations', {
        campaignId,
        amount
      })

      setDonationSuccess(true)
      setDonationAmount('')
      setIsDonationDialogOpen(false)
      
      await fetchCampaign()
      
      setTimeout(() => setDonationSuccess(false), 3000)
    } catch (error: any) {
      setDonationError(error.message || 'Donation failed')
    } finally {
      setIsDonating(false)
    }
  }

  const calculateProgress = (raised: number, goal: number) => {
    return Math.min((raised / goal) * 100, 100)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getDaysLeft = (deadline: Date | string) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
            <div className="h-64 bg-muted rounded mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
                <div className="h-4 bg-muted rounded w-4/6"></div>
              </div>
              <div className="h-48 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Campaign not found</h2>
          <Link href="/campaigns">
            <Button>Back to Campaigns</Button>
          </Link>
        </div>
      </div>
    )
  }

  const isOwner = user?.id === campaign.createdById
  const canDonate = user && user.role === 'DONOR' && campaign.status === 'ACTIVE'

  return (
    <div className="min-h-screen bg-background">
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
              
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-muted-foreground">
                    Welcome, {user.name}
                  </span>
                  <Badge variant={user.role === 'NONPROFIT' ? 'default' : 'secondary'}>
                    {user.role === 'NONPROFIT' ? 'Non-Profit' : 'Donor'}
                  </Badge>
                  <Link href="/dashboard" className="text-sm font-medium hover:text-primary">
                    Dashboard
                  </Link>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link href="/auth/login">
                    <Button variant="outline" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/register">
                    <Button size="sm">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {donationSuccess && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">
              Thank you for your donation! Your support makes a difference.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge variant={campaign.status === 'ACTIVE' ? 'default' : 'secondary'}>
                  {campaign.status.toLowerCase()}
                </Badge>
                {campaign.status === 'ACTIVE' && (
                  <Badge variant="outline">
                    {getDaysLeft(campaign.deadline)} days left
                  </Badge>
                )}
              </div>
              
              <h1 className="text-4xl font-bold mb-4">{campaign.title}</h1>
              
              <div className="flex items-center text-muted-foreground mb-6">
                <span>by {campaign.createdBy.name}</span>
                <span className="mx-2">•</span>
                <span>Created on {formatDate(campaign.createdAt)}</span>
              </div>
            </div>

            {campaign.imageUrl && (
              <div className="w-full h-96 overflow-hidden rounded-lg">
                <img
                  src={campaign.imageUrl}
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>About this campaign</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{campaign.description}</p>
                </div>
              </CardContent>
            </Card>

            {campaign.donations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Donations</CardTitle>
                  <CardDescription>
                    See who's supporting this campaign
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {campaign.donations.slice(0, 10).map((donation) => (
                      <div key={donation.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{donation.donor.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(donation.donatedAt)}
                          </p>
                        </div>
                        <span className="font-semibold text-primary">
                          {formatCurrency(donation.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                  {campaign.donations.length > 10 && (
                    <p className="text-sm text-muted-foreground mt-4 text-center">
                      And {campaign.donations.length - 10} more donations...
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Raised</span>
                    <span className="font-medium">
                      {formatCurrency(campaign.raisedAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Goal</span>
                    <span className="font-medium">
                      {formatCurrency(campaign.goalAmount)}
                    </span>
                  </div>
                  <Progress 
                    value={calculateProgress(campaign.raisedAmount, campaign.goalAmount)} 
                    className="h-3 my-4"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{calculateProgress(campaign.raisedAmount, campaign.goalAmount).toFixed(1)}% funded</span>
                    <span>{campaign._count.donations} donations</span>
                  </div>
                </div>

                {campaign.status === 'ACTIVE' && (
                  <div className="text-center p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Deadline</p>
                    <p className="font-medium">{formatDate(campaign.deadline)}</p>
                    <p className="text-sm text-muted-foreground">
                      {getDaysLeft(campaign.deadline)} days remaining
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {canDonate ? (
              <Card>
                <CardHeader>
                  <CardTitle>Support this campaign</CardTitle>
                  <CardDescription>
                    Your donation helps make a difference
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Dialog open={isDonationDialogOpen} onOpenChange={setIsDonationDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full" size="lg">
                        Donate Now
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Make a Donation</DialogTitle>
                        <DialogDescription>
                          Enter the amount you'd like to donate to this campaign
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleDonation} className="space-y-4">
                        {donationError && (
                          <Alert variant="destructive">
                            <AlertDescription>{donationError}</AlertDescription>
                          </Alert>
                        )}
                        
                        <div className="space-y-2">
                          <Label htmlFor="amount">Donation Amount (USD)</Label>
                          <Input
                            id="amount"
                            type="number"
                            step="0.01"
                            min="1"
                            placeholder="Enter amount"
                            value={donationAmount}
                            onChange={(e) => setDonationAmount(e.target.value)}
                            required
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDonationAmount('10')}
                            className="flex-1"
                          >
                            $10
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDonationAmount('25')}
                            className="flex-1"
                          >
                            $25
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDonationAmount('50')}
                            className="flex-1"
                          >
                            $50
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDonationAmount('100')}
                            className="flex-1"
                          >
                            $100
                          </Button>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDonationDialogOpen(false)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={isDonating}
                            className="flex-1"
                          >
                            {isDonating ? 'Processing...' : 'Donate'}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            ) : user ? (
              user.role === 'NONPROFIT' ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground text-center">
                      Non-profits cannot donate to campaigns. Switch to a donor account to make donations.
                    </p>
                  </CardContent>
                </Card>
              ) : campaign.status !== 'ACTIVE' ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground text-center">
                      This campaign is not currently accepting donations.
                    </p>
                  </CardContent>
                </Card>
              ) : null
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Sign in to make a donation
                    </p>
                    <Link href="/auth/login">
                      <Button className="w-full">
                        Sign In to Donate
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {isOwner && (
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Link href={`/dashboard/campaigns/${campaign.id}/edit`}>
                    <Button variant="outline" className="w-full">
                      Edit Campaign
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="outline" className="w-full">
                      View Dashboard
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}