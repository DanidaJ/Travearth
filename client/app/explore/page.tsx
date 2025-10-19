"use client"

import Link from "next/link"
import { Leaf, MapPin, TrendingDown, Star, Users, Navigation, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Eco-friendly destinations data
const destinations = [
  {
    id: 1,
    name: "Costa Rica",
    location: "Central America",
    image: "🇨🇷",
    ecoScore: 98,
    description: "A pioneer in sustainable tourism with 25% of its land protected and 99% renewable energy.",
    highlights: ["Carbon Neutral", "Rainforest Conservation", "Wildlife Protection"],
    carbonSaved: "45%",
    visitors: "3.2M",
    rating: 4.9,
  },
  {
    id: 2,
    name: "Iceland",
    location: "Nordic Region",
    image: "🇮🇸",
    ecoScore: 96,
    description: "Powered entirely by renewable geothermal and hydroelectric energy with pristine natural landscapes.",
    highlights: ["100% Renewable Energy", "Glacier Protection", "Sustainable Tourism"],
    carbonSaved: "52%",
    visitors: "2.1M",
    rating: 4.8,
  },
  {
    id: 3,
    name: "New Zealand",
    location: "Oceania",
    image: "🇳🇿",
    ecoScore: 95,
    description: "World leader in conservation with extensive national parks and carbon-neutral tourism initiatives.",
    highlights: ["Conservation Leader", "Clean Energy", "Protected Ecosystems"],
    carbonSaved: "48%",
    visitors: "3.8M",
    rating: 4.9,
  },
  {
    id: 4,
    name: "Norway",
    location: "Scandinavia",
    image: "🇳🇴",
    ecoScore: 94,
    description: "Fjords and mountains preserved through strict environmental policies and electric transportation.",
    highlights: ["Electric Transport", "Fjord Protection", "Zero-Emission Cruises"],
    carbonSaved: "58%",
    visitors: "6.2M",
    rating: 4.7,
  },
  {
    id: 5,
    name: "Bhutan",
    location: "South Asia",
    image: "🇧🇹",
    ecoScore: 97,
    description: "The world's only carbon-negative country with constitutional environmental protection.",
    highlights: ["Carbon Negative", "Forest Coverage 72%", "Sustainable Development"],
    carbonSaved: "65%",
    visitors: "315K",
    rating: 5.0,
  },
  {
    id: 6,
    name: "Slovenia",
    location: "Central Europe",
    image: "🇸🇮",
    ecoScore: 93,
    description: "Green capital of Europe with extensive forests, clean water, and sustainable practices.",
    highlights: ["Green Capital", "Sustainable Cities", "Eco-Certified Hotels"],
    carbonSaved: "42%",
    visitors: "4.7M",
    rating: 4.6,
  },
  {
    id: 7,
    name: "Kenya",
    location: "East Africa",
    image: "🇰🇪",
    ecoScore: 91,
    description: "Leading wildlife conservation with community-based ecotourism and renewable energy projects.",
    highlights: ["Wildlife Conservation", "Community Tourism", "Solar Power"],
    carbonSaved: "38%",
    visitors: "2.0M",
    rating: 4.8,
  },
  {
    id: 8,
    name: "Finland",
    location: "Nordic Region",
    image: "🇫🇮",
    ecoScore: 94,
    description: "Vast forests and lakes protected by world-class environmental policies and clean energy.",
    highlights: ["Forest Nation", "Clean Energy", "Sustainable Design"],
    carbonSaved: "50%",
    visitors: "3.4M",
    rating: 4.7,
  },
  {
    id: 9,
    name: "Portugal",
    location: "Southern Europe",
    image: "🇵🇹",
    ecoScore: 90,
    description: "Beautiful coastlines with growing renewable energy infrastructure and eco-tourism initiatives.",
    highlights: ["Renewable Energy", "Marine Conservation", "Sustainable Wineries"],
    carbonSaved: "44%",
    visitors: "27M",
    rating: 4.5,
  },
]

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">Travearth</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link href="/explore" className="text-sm font-medium text-foreground">
              Explore
            </Link>
            <Link href="/hotels" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Hotels
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
              <Link href="/dashboard">Start Planning</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary-foreground text-sm font-medium mb-6">
              <MapPin className="w-4 h-4" />
              <span>Discover Sustainable Destinations</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
              Explore Eco-Friendly Destinations
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Discover the world's most sustainable travel destinations. Each location is scored based on renewable
              energy, conservation efforts, and eco-tourism practices.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-b border-border bg-card/30">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-1">{destinations.length}</div>
              <div className="text-sm text-muted-foreground">Destinations</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">94.2</div>
              <div className="text-sm text-muted-foreground">Avg EcoScore</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-accent mb-1">48%</div>
              <div className="text-sm text-muted-foreground">Carbon Saved</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground mb-1">52M+</div>
              <div className="text-sm text-muted-foreground">Eco Travelers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((destination) => (
            <Card
              key={destination.id}
              className="group bg-card border-border hover:border-primary/50 transition-all duration-300 overflow-hidden"
            >
              {/* Image/Flag Header */}
              <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center overflow-hidden">
                <div className="text-8xl group-hover:scale-110 transition-transform duration-300">
                  {destination.image}
                </div>
                <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-background/90 backdrop-blur-sm px-2.5 py-1.5 rounded-full">
                  <TrendingDown className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-semibold text-foreground">{destination.ecoScore}/100</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-1">{destination.name}</h3>
                    <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{destination.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-semibold">{destination.rating}</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed mb-4">{destination.description}</p>

                {/* Highlights */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {destination.highlights.map((highlight, index) => (
                    <Badge key={index} variant="secondary" className="text-xs bg-primary/10 text-primary border-0">
                      {highlight}
                    </Badge>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4 pt-4 border-t border-border">
                  <div>
                    <div className="flex items-center gap-1.5 text-primary mb-1">
                      <TrendingDown className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">Carbon Saved</span>
                    </div>
                    <div className="text-lg font-bold text-foreground">{destination.carbonSaved}</div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-muted-foreground mb-1">
                      <Users className="w-3.5 h-3.5" />
                      <span className="text-xs font-medium">Visitors/Year</span>
                    </div>
                    <div className="text-lg font-bold text-foreground">{destination.visitors}</div>
                  </div>
                </div>

                {/* CTA */}
                <Button
                  className="w-full bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground border-0 group/btn"
                  variant="outline"
                  asChild
                >
                  <Link href="/dashboard">
                    Plan Trip Here
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border bg-gradient-to-b from-transparent to-primary/5">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-6">
              <Navigation className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Ready to Start Your Journey?</h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Create your personalized eco-friendly travel plan, track your carbon footprint, and make a positive
              impact.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8" asChild>
                <Link href="/dashboard">
                  Start Planning
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-border text-foreground hover:bg-card bg-transparent"
                asChild
              >
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">Travearth</span>
            </div>
            <p className="text-sm text-muted-foreground">© 2025 Travearth. Sustainable travel for a better planet.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
