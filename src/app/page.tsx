'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import { LoadingSpinner } from '@/components/loading-spinner'
import { Campaign } from '@prisma/client'

interface CampaignWithDetails extends Campaign {
  createdBy: {
    id: string
    name: string
    email: string
  }
  _count: {
    donations: number
  }
}

export default function Home() {
  const { user, logout, isLoading: authLoading } = useAuth()
  const [campaigns, setCampaigns] = useState<CampaignWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
    try {
      const data = await apiClient.get<{ campaigns: CampaignWithDetails[] }>('/api/campaigns')
      setCampaigns(data.campaigns)
    } catch (error) {
      console.error('Failed to fetch campaigns:', error)
    } finally {
      setIsLoading(false)
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

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDaysLeft = (deadline: Date | string) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  // Show loading spinner while auth is loading or campaigns are loading
  if (authLoading || isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">FR</span>
              </div>
              <h1 className="text-2xl font-bold">FundRaise</h1>
            </div>
            
            <nav className="flex items-center space-x-4">
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
                  <Button variant="outline" size="sm" onClick={logout}>
                    Logout
                  </Button>
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

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Support Meaningful Causes
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with non-profits making a difference in communities worldwide. 
            Every donation counts towards creating positive change.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/campaigns">
              <Button size="lg">
                Explore Campaigns
              </Button>
            </Link>
            {user?.role === 'NONPROFIT' && (
              <Link href="/dashboard">
                <Button variant="outline" size="lg">
                  Create Campaign
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Featured Campaigns */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">Featured Campaigns</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover impactful campaigns from verified non-profits 
              working towards meaningful change.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-muted rounded-t-lg"></div>
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-5/6"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No active campaigns at the moment.
              </p>
              {user?.role === 'NONPROFIT' && (
                <Link href="/dashboard">
                  <Button>Create the First Campaign</Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <Card key={campaign.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {campaign.imageUrl && (
                    <div className="h-48 w-full overflow-hidden">
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
                      <Badge variant="secondary" className="ml-2">
                        {getDaysLeft(campaign.deadline)} days left
                      </Badge>
                    </div>
                    <CardDescription className="line-clamp-3">
                      {campaign.description}
                    </CardDescription>
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
                        by {campaign.createdBy.name}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Link href={`/campaigns/${campaign.id}`} className="w-full">
                      <Button className="w-full">
                        View Campaign
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">
            Ready to Make a Difference?
          </h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our community of donors and non-profits working together 
            to create positive change in the world.
          </p>
          <div className="flex justify-center space-x-4">
            {!user && (
              <Link href="/auth/register">
                <Button size="lg">
                  Get Started
                </Button>
              </Link>
            )}
            <Link href="/campaigns">
              <Button variant="outline" size="lg">
                Browse Campaigns
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">FR</span>
              </div>
              <span className="text-sm text-muted-foreground">
                © 2024 FundRaise. All rights reserved.
              </span>
            </div>
            <div className="flex space-x-6">
              <Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">
                About
              </Link>
              <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">
                Contact
              </Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}