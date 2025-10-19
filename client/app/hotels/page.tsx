"use client"

import { Search, Filter, Leaf, MapPin, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { useState, useEffect } from "react"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Mock hotels for fallback
const mockHotels = [
  {
    id: "mock-1",
    name: "Eco Lodge Monteverde",
    location: "Monteverde, Costa Rica",
    sustainabilityScore: 94,
    pricePerNight: 120,
    carbonPerNight: 5,
    certifications: ["LEED Gold", "Green Key"],
    imageUrl: "/eco-lodge-monteverde.jpg",
    amenities: ["Solar Power", "Rainwater Harvesting", "Organic Restaurant"],
  },
  {
    id: "mock-2",
    name: "Sustainable Beach Resort",
    location: "Manuel Antonio, Costa Rica",
    sustainabilityScore: 88,
    pricePerNight: 180,
    carbonPerNight: 7,
    certifications: ["Green Globe", "Rainforest Alliance"],
    imageUrl: "/beach-resort.jpg",
    amenities: ["Wind Energy", "Zero Waste", "Local Sourcing"],
  },
  {
    id: "mock-3",
    name: "Green Mountain Inn",
    location: "Oslo, Norway",
    sustainabilityScore: 92,
    pricePerNight: 150,
    carbonPerNight: 4,
    certifications: ["Nordic Swan", "EU Ecolabel"],
    imageUrl: "/mountain-inn.jpg",
    amenities: ["Geothermal Heating", "EV Charging", "Organic Breakfast"],
  },
]

export default function HotelsPage() {
  const [hotels, setHotels] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAllHotels()
  }, [])

  const fetchAllHotels = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/hotels/list?limit=100`)
      if (!response.ok) throw new Error("Failed to fetch hotels")
      const result = await response.json()
      
      // Extract hotels array from response
      const data = result.hotels || []
      
      // Transform database hotels to match our display format
      const transformedHotels = data.map((hotel: any) => ({
        id: hotel._id,
        name: hotel.name,
        location: `${hotel.location?.address?.city || ""}, ${hotel.location?.address?.country || ""}`,
        sustainabilityScore: hotel.sustainabilityScore || 0,
        pricePerNight: hotel.roomTypes?.[0]?.pricePerNight || hotel.pricePerNight || 0,
        carbonPerNight: hotel.carbonFootprintPerNight || hotel.roomTypes?.[0]?.carbonPerNight || 0,
        certifications: hotel.ecoCertifications?.map((cert: any) => cert.name) || [],
        imageUrl: hotel.images?.[0] || "/placeholder.svg",
        amenities: hotel.amenities || [],
        features: hotel.features || [],
      }))

      // Combine database hotels with mock hotels
      setHotels([...transformedHotels, ...mockHotels])
    } catch (err) {
      console.error("Error fetching hotels:", err)
      setError("Failed to load hotels from database")
      // Use only mock hotels if API fails
      setHotels(mockHotels)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredHotels = hotels.filter((hotel) =>
    searchQuery
      ? hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hotel.location.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">Travearth</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link href="/hotels/register">Partner with Us</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3">Sustainable Hotels</h1>
          <p className="text-lg text-muted-foreground">
            Discover eco-friendly accommodations with verified sustainability scores
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by location or hotel name..." 
              className="pl-10 bg-card"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" onClick={fetchAllHotels}>
            <Filter className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading hotels...</span>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Card className="p-8 text-center bg-card border-border">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={fetchAllHotels} variant="outline">
              Try Again
            </Button>
          </Card>
        )}

        {/* Hotels Grid */}
        {!isLoading && filteredHotels.length === 0 && (
          <Card className="p-8 text-center bg-card border-border">
            <p className="text-muted-foreground">No hotels found matching your search.</p>
          </Card>
        )}

        {!isLoading && filteredHotels.length > 0 && (
          <div>
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {filteredHotels.length} hotel{filteredHotels.length !== 1 ? "s" : ""}
              {hotels.length > mockHotels.length && (
                <Badge variant="outline" className="ml-2">
                  {hotels.length - mockHotels.length} from database
                </Badge>
              )}
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHotels.map((hotel) => (
            <Card key={hotel.id} className="overflow-hidden hover:shadow-lg transition-shadow bg-card border-border">
              <div className="relative h-48 bg-muted">
                <Image src={hotel.imageUrl || "/placeholder.svg"} alt={hotel.name} fill className="object-cover" />
                <div className="absolute top-3 right-3">
                  <Badge className="bg-primary/90 text-primary-foreground border-0">
                    <Leaf className="w-3 h-3 mr-1" />
                    {hotel.sustainabilityScore}
                  </Badge>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-foreground text-lg mb-2">{hotel.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <MapPin className="w-4 h-4" />
                  <span>{hotel.location}</span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {hotel.certifications.map((cert: string) => (
                    <Badge key={cert} variant="outline" className="text-xs">
                      {cert}
                    </Badge>
                  ))}
                </div>

                {/* Eco Features */}
                {hotel.features && hotel.features.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {hotel.features.map((feature: string) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature === "solar" && "☀️ Solar"}
                        {feature === "recycling" && "♻️ Recycling"}
                        {feature === "organic" && "🥬 Organic"}
                        {feature === "water" && "💧 Water"}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div>
                    <div className="text-2xl font-bold text-foreground">${hotel.pricePerNight}</div>
                    <div className="text-xs text-muted-foreground">per night</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-accent">{hotel.carbonPerNight} kg CO₂</div>
                    <div className="text-xs text-muted-foreground">per night</div>
                  </div>
                </div>

                <Button className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
                  View Details
                </Button>
              </div>
            </Card>
              ))}
            </div>
          </div>
        )}

        {/* Partner CTA */}
        <Card className="mt-12 p-8 bg-card border-primary/20">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-foreground mb-3">Are you a hotel owner?</h2>
            <p className="text-muted-foreground mb-6">
              Join our network of sustainable accommodations and reach eco-conscious travelers worldwide
            </p>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
              <Link href="/hotels/register">Register Your Hotel</Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
