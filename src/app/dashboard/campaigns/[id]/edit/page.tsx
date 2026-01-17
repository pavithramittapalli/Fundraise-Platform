'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'
import { Campaign, CampaignStatus } from '@prisma/client'

export default function EditCampaignPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const campaignId = params.id as string

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goalAmount: '',
    deadline: '',
    imageUrl: '',
    status: CampaignStatus.ACTIVE
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (campaignId) {
      fetchCampaign()
    }
  }, [campaignId])

  const fetchCampaign = async () => {
    try {
      const data = await apiClient.get<{ campaign: Campaign }>(`/api/campaigns/${campaignId}`)
      const campaignData = data.campaign
      
      // Check if user owns this campaign
      if (campaignData.createdById !== user?.id) {
        router.push('/dashboard')
        return
      }

      setCampaign(campaignData)
      setFormData({
        title: campaignData.title,
        description: campaignData.description,
        goalAmount: campaignData.goalAmount.toString(),
        deadline: new Date(campaignData.deadline).toISOString().split('T')[0],
        imageUrl: campaignData.imageUrl || '',
        status: campaignData.status
      })
    } catch (error) {
      console.error('Failed to fetch campaign:', error)
      router.push('/dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleStatusChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      status: value as CampaignStatus
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSaving(true)

    try {
      // Validation
      if (!formData.title || !formData.description || !formData.goalAmount || !formData.deadline) {
        setError('All required fields must be filled')
        return
      }

      const goalAmount = parseFloat(formData.goalAmount)
      if (goalAmount <= 0) {
        setError('Goal amount must be greater than 0')
        return
      }

      await apiClient.put(`/api/campaigns/${campaignId}`, {
        title: formData.title,
        description: formData.description,
        goalAmount,
        deadline: formData.deadline,
        imageUrl: formData.imageUrl || undefined,
        status: formData.status
      })

      router.push('/dashboard')
    } catch (error: any) {
      setError(error.message || 'Failed to update campaign')
    } finally {
      setIsSaving(false)
    }
  }

  if (!user || user.role !== 'NONPROFIT') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            Only non-profits can edit campaigns
          </p>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-1/3 mb-8"></div>
              <div className="h-64 bg-muted rounded"></div>
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
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

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
              <Link href="/dashboard" className="text-foreground font-medium">
                Dashboard
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Edit Campaign</h1>
            <p className="text-muted-foreground">
              Update your campaign information and settings
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
              <CardDescription>
                Modify your campaign information below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="title">Campaign Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    type="text"
                    placeholder="Enter a compelling title for your campaign"
                    value={formData.title}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Describe your campaign, its goals, and how the funds will be used..."
                    value={formData.description}
                    onChange={handleChange}
                    rows={6}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="goalAmount">Fundraising Goal (USD) *</Label>
                    <Input
                      id="goalAmount"
                      name="goalAmount"
                      type="number"
                      step="0.01"
                      min="1"
                      placeholder="1000"
                      value={formData.goalAmount}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deadline">Campaign Deadline *</Label>
                    <Input
                      id="deadline"
                      name="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Campaign Image URL (Optional)</Label>
                  <Input
                    id="imageUrl"
                    name="imageUrl"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={formData.imageUrl}
                    onChange={handleChange}
                  />
                  <p className="text-sm text-muted-foreground">
                    Add a compelling image to attract more donors
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Campaign Status</Label>
                  <Select value={formData.status} onValueChange={handleStatusChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={CampaignStatus.ACTIVE}>Active</SelectItem>
                      <SelectItem value={CampaignStatus.COMPLETED}>Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    {formData.status === CampaignStatus.ACTIVE 
                      ? 'Campaign is accepting donations'
                      : 'Campaign is no longer accepting donations'
                    }
                  </p>
                </div>

                <div className="flex gap-4">
                  <Link href={`/campaigns/${campaignId}`}>
                    <Button variant="outline" type="button">
                      View Campaign
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </Link>
                  <Button 
                    type="submit" 
                    disabled={isSaving}
                    className="flex-1"
                  >
                    {isSaving ? 'Saving Changes...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}