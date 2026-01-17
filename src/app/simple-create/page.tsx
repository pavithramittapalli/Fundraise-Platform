'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api'

export default function SimpleCreatePage() {
  const { user } = useAuth()
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goalAmount: '',
    deadline: '',
    imageUrl: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

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

      const deadlineDate = new Date(formData.deadline)
      if (deadlineDate <= new Date()) {
        setError('Deadline must be in the future')
        return
      }

      await apiClient.post('/api/campaigns', {
        title: formData.title,
        description: formData.description,
        goalAmount,
        deadline: formData.deadline,
        imageUrl: formData.imageUrl || undefined
      })

      setSuccess(true)
      setFormData({
        title: '',
        description: '',
        goalAmount: '',
        deadline: '',
        imageUrl: ''
      })
      
    } catch (error: any) {
      setError(error.message || 'Failed to create campaign')
    } finally {
      setIsLoading(false)
    }
  }

  // Simple auth check without redirects
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              Please log in as a non-profit to create campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Login credentials:
              </p>
              <div className="text-xs bg-muted p-3 rounded">
                <p>Email: nonprofit@example.com</p>
                <p>Password: password123</p>
              </div>
              <Button 
                onClick={() => window.location.href = '/auth/login'}
                className="w-full"
              >
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (user.role !== 'NONPROFIT') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              Only non-profit accounts can create campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Current role: {user.role}
            </p>
            <Button 
              onClick={() => window.location.href = '/auth/login'}
              className="w-full"
            >
              Login as Non-Profit
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Create New Campaign</h1>
          <p className="text-muted-foreground">
            Launch a new fundraising campaign to support your cause
          </p>
          <div className="mt-4 p-3 bg-muted rounded">
            <p className="text-sm">
              Logged in as: <strong>{user.name}</strong> ({user.role})
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
            <CardDescription>
              Fill in the information below to create your campaign
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-50 border-green-200">
                  <AlertDescription className="text-green-800">
                    Campaign created successfully! 
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-green-800 underline"
                      onClick={() => window.location.href = '/dashboard'}
                    >
                      Go to Dashboard
                    </Button>
                  </AlertDescription>
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

              <div className="flex gap-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => window.location.href = '/dashboard'}
                  className="flex-1"
                >
                  Back to Dashboard
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? 'Creating Campaign...' : 'Create Campaign'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}