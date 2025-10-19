"use client"

import { use, useEffect, useState } from "react"
import { Calendar, MapPin, TrendingDown, Users, Edit, Leaf, Loader2, ArrowLeft, Play } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { ShareTripDialog } from "@/components/sharing/share-trip-dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Trip {
  _id: string
  title: string
  description?: string
  startDate: string
  endDate: string
  status: string
  tripType?: string
  travelers?: number
  predictedCarbon?: number
  actualCarbon?: number
  shareCode?: string
  metadata?: {
    destinations?: Array<{ name: string; country: string; lat?: number; lng?: number }>
    activities?: Array<any>
    hotels?: Array<any>
    itinerary?: Array<any>
  }
  ecoBenchmark?: any
  benchmarkRating?: {
    rating?: string
    level?: number
    color?: string
    message?: string
  }
  createdAt?: string
  updatedAt?: string
}

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params for Next.js 15
  const { id } = use(params)
  
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [heroImage, setHeroImage] = useState("")

  useEffect(() => {
    fetchTripDetails()
  }, [id])

  const fetchTripDetails = async () => {
    try {
      setLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      
      const response = await fetch(`${apiUrl}/trips/${id}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch trip details')
      }

      const data = await response.json()
      console.log('Trip details:', data)
      
      const tripData = data.trip || data
      setTrip(tripData)

      // Use Picsum Photos (reliable alternative to Unsplash Source)
      const firstDestination = tripData.metadata?.destinations?.[0]
      if (firstDestination) {
        // Use Lorem Picsum with a seed based on destination for consistency
        const seed = `${firstDestination.name}-${firstDestination.country}`.toLowerCase().replace(/\s+/g, '-')
        setHeroImage(`https://picsum.photos/seed/${seed}/1200/600`)
      } else {
        // Random travel-style image
        setHeroImage('https://picsum.photos/seed/travel-adventure/1200/600')
      }
      
    } catch (err: any) {
      console.error('Error fetching trip:', err)
      setError(err.message || 'Failed to load trip details')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
  }

  const getSustainabilityScore = () => {
    if (!trip?.predictedCarbon) return 75
    // Calculate sustainability score based on carbon (lower is better)
    return Math.max(0, Math.min(100, 100 - (trip.predictedCarbon / 10)))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading trip details...</span>
      </div>
    )
  }

  if (error || !trip) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/trips">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Trips
          </Link>
        </Button>
        <Alert variant="destructive">
          <AlertDescription>{error || 'Trip not found'}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const destinations = trip.metadata?.destinations || []
  const activities = trip.metadata?.activities || []
  const hotels = trip.metadata?.hotels || []
  const itinerary = trip.metadata?.itinerary || []
  const sustainabilityScore = getSustainabilityScore()

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild>
        <Link href="/dashboard/trips">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Trips
        </Link>
      </Button>

      {/* Hero Section */}
      <div className="relative h-64 rounded-lg overflow-hidden">
        <Image 
          src={heroImage} 
          alt={trip.title} 
          fill 
          className="object-cover"
          unoptimized // Allow external Unsplash images
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-white/20 backdrop-blur-sm border-0 text-white">
              <Leaf className="w-3 h-3 mr-1" />
              Sustainability Score: {Math.round(sustainabilityScore)}
            </Badge>
            {trip.shareCode && (
              <Badge className="bg-blue-500/20 backdrop-blur-sm border-0 text-white">
                Share Code: {trip.shareCode}
              </Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold mb-2">{trip.title}</h1>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>
                {destinations.map(d => d.name).join(', ') || 'No destinations'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>
                {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 flex-wrap">
        <Button 
          className="bg-green-600 hover:bg-green-700 text-white font-semibold" 
          size="lg"
          asChild
        >
          <Link href={`/dashboard/trips/${trip._id}/live`}>
            <Play className="w-4 h-4 mr-2" />
            Start Trip - Go Live
          </Link>
        </Button>
        <Button className="bg-primary hover:bg-primary-dark text-white" disabled>
          <Edit className="w-4 h-4 mr-2" />
          Edit Trip
        </Button>
        <ShareTripDialog tripId={trip._id} tripName={trip.title} />
        <Button variant="outline" disabled>
          <Users className="w-4 h-4 mr-2" />
          Invite Collaborators
        </Button>
      </div>

      {/* Carbon Footprint Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Carbon Footprint</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/dashboard/trips/${trip._id}/carbon`}>View Details</Link>
          </Button>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-muted-foreground mb-1">Predicted</div>
            <div className="text-3xl font-bold text-foreground">{trip.predictedCarbon || 0}</div>
            <div className="text-sm text-muted-foreground">kg CO₂</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Actual</div>
            <div className="text-3xl font-bold text-accent">{trip.actualCarbon || 0}</div>
            <div className="text-sm text-muted-foreground">kg CO₂</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Saved</div>
            <div className="text-3xl font-bold text-primary">
              {(trip.predictedCarbon || 0) - (trip.actualCarbon || 0)}
            </div>
            <div className="text-sm text-muted-foreground">kg CO₂</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted-foreground">Carbon Efficiency</span>
            <span className="text-primary font-medium">7% better than predicted</span>
          </div>
          <Progress value={93} className="h-2" />
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="itinerary" className="w-full">
        <TabsList>
          <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
          <TabsTrigger value="accommodations">Accommodations ({hotels.length})</TabsTrigger>
          <TabsTrigger value="activities">Activities ({activities.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="itinerary" className="mt-6">
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Destinations</h3>
            {destinations.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No destinations planned</p>
            ) : (
              <div className="space-y-3">
                {destinations.map((dest: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-foreground font-medium">{dest.name}</div>
                      <div className="text-sm text-muted-foreground">{dest.country}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {itinerary.length > 0 && (
              <>
                <h3 className="font-semibold text-foreground mb-4 mt-6">Day-by-Day Plan</h3>
                <div className="space-y-3">
                  {itinerary.map((day: any, index: number) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">{day.destination}</div>
                          <div className="text-sm text-muted-foreground">
                            {day.duration} day{day.duration !== 1 ? 's' : ''}
                          </div>
                          {day.totalCarbon && (
                            <Badge variant="outline" className="mt-2">
                              💨 {day.totalCarbon} kg CO₂
                            </Badge>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="accommodations" className="mt-6">
          {hotels.length === 0 ? (
            <Card className="p-6">
              <p className="text-muted-foreground text-center">No hotels selected</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {hotels.map((hotel: any, index: number) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{hotel.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {hotel.location?.address?.city || hotel.location?.city || 'Location'}, 
                        {hotel.location?.address?.country || hotel.location?.country || ''}
                      </p>
                      {hotel.pricePerNight && (
                        <p className="text-sm text-muted-foreground mt-1">
                          ${hotel.pricePerNight}/night
                        </p>
                      )}
                    </div>
                    {hotel.sustainabilityScore && (
                      <Badge className="bg-green-500/10 text-green-600 border-0">
                        <Leaf className="w-3 h-3 mr-1" />
                        {hotel.sustainabilityScore}/100
                      </Badge>
                    )}
                  </div>
                  {hotel.features && hotel.features.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-3">
                      {hotel.features.map((feature: string, i: number) => (
                        <span key={i} className="text-lg" title={feature}>
                          {feature === "solar" && "☀️"}
                          {feature === "recycling" && "♻️"}
                          {feature === "organic" && "🥬"}
                          {feature === "water" && "💧"}
                        </span>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="activities" className="mt-6">
          {activities.length === 0 ? (
            <Card className="p-6">
              <p className="text-muted-foreground text-center">No activities planned</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {activities.map((activity: any, index: number) => (
                <Card key={index} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground">{activity.name}</h3>
                      <p className="text-sm text-muted-foreground">{activity.location}</p>
                      {activity.time && (
                        <p className="text-sm text-muted-foreground">Time: {activity.time}</p>
                      )}
                    </div>
                    <Badge variant="outline">{activity.type || 'Activity'}</Badge>
                  </div>
                  {activity.carbonImpact && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <TrendingDown className="w-4 h-4" />
                      <span>{activity.carbonImpact} kg CO₂</span>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
