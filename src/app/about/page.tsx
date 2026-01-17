'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'

export default function AboutPage() {
  const { user } = useAuth()

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
              <Link href="/about" className="text-foreground font-medium">
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

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">About FundRaise</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Empowering communities by connecting passionate donors with verified non-profits creating meaningful change.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
                <p className="text-lg text-muted-foreground mb-4">
                  FundRaise is dedicated to democratizing philanthropy by providing a trusted platform where non-profits can showcase their work and donors can make informed decisions about where to allocate their resources.
                </p>
                <p className="text-lg text-muted-foreground mb-6">
                  We believe that every contribution, no matter the size, has the power to create positive change in communities around the world.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/campaigns">
                    <Button size="lg">Explore Campaigns</Button>
                  </Link>
                  <Link href="/contact">
                    <Button variant="outline" size="lg">Contact Us</Button>
                  </Link>
                </div>
              </div>
              <div className="bg-primary/10 rounded-lg p-8">
                <div className="grid grid-cols-2 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-primary mb-2">1000+</div>
                    <div className="text-sm text-muted-foreground">Campaigns Launched</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary mb-2">$2.5M+</div>
                    <div className="text-sm text-muted-foreground">Funds Raised</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary mb-2">50K+</div>
                    <div className="text-sm text-muted-foreground">Active Donors</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-primary mb-2">500+</div>
                    <div className="text-sm text-muted-foreground">Non-Profit Partners</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How FundRaise Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our platform makes it easy for non-profits to launch campaigns and for donors to support causes they care about.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary-foreground font-bold">1</span>
                </div>
                <CardTitle>Create Campaign</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Non-profits create detailed campaigns with goals, deadlines, and compelling stories to inspire donors.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary-foreground font-bold">2</span>
                </div>
                <CardTitle>Discover & Support</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Donors browse campaigns, learn about causes, and make secure donations to projects that resonate with them.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary-foreground font-bold">3</span>
                </div>
                <CardTitle>Track Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Real-time progress updates show the collective impact of donations, keeping everyone engaged and informed.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose FundRaise?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We provide the tools and support needed to make fundraising successful and transparent.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🔒 Secure & Trusted
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Industry-leading security measures and verified non-profit partners ensure your donations are safe and go to legitimate causes.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📊 Real-Time Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Track campaign progress, donor engagement, and impact metrics with our comprehensive dashboard and reporting tools.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🌍 Global Reach
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Connect with causes and supporters from around the world, breaking down geographical barriers to giving.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  💝 Zero Platform Fees
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  We believe every dollar should go to the cause. FundRaise doesn't charge platform fees for non-profits.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎯 Targeted Outreach
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Advanced matching algorithms help donors discover campaigns that align with their values and interests.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  📱 Mobile Optimized
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Seamless experience across all devices, making it easy to donate and manage campaigns on the go.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of non-profits and donors already creating positive change through FundRaise.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {!user && (
              <Link href="/auth/register">
                <Button size="lg">Get Started Today</Button>
              </Link>
            )}
            <Link href="/campaigns">
              <Button variant="outline" size="lg">Browse Campaigns</Button>
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