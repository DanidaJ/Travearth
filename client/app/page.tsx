import Link from "next/link"
import { Leaf, TrendingDown, Award, MapPin, Users, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">Travearth</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/explore" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Explore
            </Link>
            <Link href="/hotels" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Hotels
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
              <Link href="/dashboard">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary-foreground text-sm font-medium mb-6">
            <Leaf className="w-4 h-4" />
            <span>Travel Sustainably, Track Your Impact</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6">Plan Eco-Friendly Trips That Matter</h1>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto">
            Create sustainable travel plans, track your carbon footprint in real-time, and earn rewards for making
            eco-conscious choices.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8" asChild>
              <Link href="/dashboard">Start Planning</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary text-foreground hover:bg-primary/10 bg-transparent"
              asChild
            >
              <Link href="/explore">Explore Destinations</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Everything You Need for Sustainable Travel
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful tools to help you plan, track, and optimize your eco-friendly adventures
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="p-6 bg-card border-border hover:bg-card/80 transition-all">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
              <TrendingDown className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Carbon Footprint Tracking</h3>
            <p className="text-muted-foreground leading-relaxed">
              Monitor your predicted and actual carbon emissions throughout your journey with real-time GPS tracking.
            </p>
          </Card>

          <Card className="p-6 bg-card border-border hover:bg-card/80 transition-all">
            <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Smart Trip Planning</h3>
            <p className="text-muted-foreground leading-relaxed">
              Get AI-powered eco-friendly recommendations for destinations, hotels, and activities.
            </p>
          </Card>

          <Card className="p-6 bg-card border-border hover:bg-card/80 transition-all">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
              <Award className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Gamification & Rewards</h3>
            <p className="text-muted-foreground leading-relaxed">
              Earn badges and improve your EcoScore by making sustainable travel choices.
            </p>
          </Card>

          <Card className="p-6 bg-card border-border hover:bg-card/80 transition-all">
            <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
              <Leaf className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Sustainability Scores</h3>
            <p className="text-muted-foreground leading-relaxed">
              See verified sustainability ratings for every hotel, activity, and destination.
            </p>
          </Card>

          <Card className="p-6 bg-card border-border hover:bg-card/80 transition-all">
            <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Collaborative Planning</h3>
            <p className="text-muted-foreground leading-relaxed">
              Share trip plans with friends and track collective carbon footprint together.
            </p>
          </Card>

          <Card className="p-6 bg-card border-border hover:bg-card/80 transition-all">
            <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Crisis Management</h3>
            <p className="text-muted-foreground leading-relaxed">
              Get real-time alerts and alternative eco-friendly options during travel disruptions.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-to-br from-primary to-accent text-primary-foreground p-12 text-center border-0">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Travel Sustainably?</h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of eco-conscious travelers making a positive impact on our planet
          </p>
          <Button size="lg" className="bg-background text-foreground hover:bg-background/90" asChild>
            <Link href="/dashboard">Start Your Journey</Link>
          </Button>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-semibold text-foreground">Travearth</span>
              </div>
              <p className="text-sm text-muted-foreground">Making sustainable travel accessible to everyone.</p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/dashboard" className="hover:text-foreground transition-colors">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/explore" className="hover:text-foreground transition-colors">
                    Explore
                  </Link>
                </li>
                <li>
                  <Link href="/hotels" className="hover:text-foreground transition-colors">
                    Hotels
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-foreground transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/hotels/register" className="hover:text-foreground transition-colors">
                    Hotel Partners
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/privacy" className="hover:text-foreground transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground transition-colors">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; 2025 Travearth. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
