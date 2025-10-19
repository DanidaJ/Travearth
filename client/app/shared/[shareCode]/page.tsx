"use client"

import { use, useEffect, useState } from "react"
import { Calendar, MapPin, Leaf, Users, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface Trip {
  _id: string
  title: string
  startDate: string
  endDate: string
  predictedCarbon?: number
  shareCode?: string
  userId?: string
  metadata?: {
    destinations?: Array<{ name: string; country: string }>
    activities?: Array<any>
  }
}

export default function SharedTripPage({ params }: { params: Promise<{ shareCode: string }> }) {
  const { shareCode } = use(params)
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSharedTrip()
  }, [shareCode])

  const fetchSharedTrip = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const response = await fetch(`${apiUrl}/trips/shared/${shareCode}`)
      
      if (!response.ok) {
        throw new Error('Trip not found')
      }
      
      const data = await response.json()
      setTrip(data.trip || data)
    } catch (err) {
      console.error('Error fetching shared trip:', err)
      setError('Trip not found or no longer available')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading shared trip...</p>
        </div>
      </div>
    )
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Leaf className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold text-foreground">Travearth</span>
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-3xl font-bold text-foreground mb-4">Trip Not Found</h1>
          <p className="text-muted-foreground mb-8">
            This trip link may be invalid or no longer available.
          </p>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const destinations = trip.metadata?.destinations || []
  const carbonSaved = trip.predictedCarbon ? Math.max(0, trip.predictedCarbon * 0.07) : 0
  const actualCarbon = trip.predictedCarbon ? trip.predictedCarbon - carbonSaved : 0

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
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
            <Link href="/dashboard">Create Your Own Trip</Link>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Shared Trip Banner */}
        <Card className="p-4 mb-6 bg-primary/10 border-primary/20">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-primary" />
            <div>
              <span className="font-medium text-foreground">Shared Trip</span>
              <span className="text-muted-foreground"> • View this eco-friendly travel plan</span>
            </div>
          </div>
        </Card>

        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-green-500 via-blue-500 to-purple-500 rounded-lg overflow-hidden mb-6 p-8">
          <div className="relative z-10 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-white/20 backdrop-blur-sm border-0 text-white">
                <Leaf className="w-3 h-3 mr-1" />
                Eco-Friendly Trip
              </Badge>
              {trip.predictedCarbon && (
                <Badge className="bg-white/20 backdrop-blur-sm border-0 text-white">
                  ~{trip.predictedCarbon.toFixed(0)} kg CO₂
                </Badge>
              )}
            </div>
            <h1 className="text-4xl font-bold mb-3">{trip.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>
                  {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                </span>
              </div>
              {destinations.length > 0 && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{destinations.length} destination{destinations.length !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {destinations.length > 0 && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-3">Trip Destinations</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              This eco-friendly trip includes {destinations.length} destination{destinations.length !== 1 ? 's' : ''} with
              sustainable travel practices.
            </p>
            <div className="flex flex-wrap gap-2">
              {destinations.map((dest, index) => (
                <Badge key={index} variant="outline" className="text-sm">
                  <MapPin className="w-3 h-3 mr-1" />
                  {dest.name}, {dest.country}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {/* Carbon Impact */}
        {trip.predictedCarbon && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Environmental Impact</h2>
            <div className="grid sm:grid-cols-2 gap-6 mb-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Predicted Carbon Footprint</div>
                <div className="text-3xl font-bold text-foreground">{trip.predictedCarbon.toFixed(0)}</div>
                <div className="text-sm text-muted-foreground">kg CO₂</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Potential Savings</div>
                <div className="text-3xl font-bold text-primary">{carbonSaved.toFixed(0)}</div>
                <div className="text-sm text-muted-foreground">kg CO₂ with eco choices</div>
              </div>
            </div>
            <div className="bg-primary/10 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <Leaf className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-foreground mb-1">Eco-Friendly Planning</div>
                  <p className="text-sm text-muted-foreground">
                    This trip was planned with sustainability in mind. By choosing eco-friendly transport,
                    accommodations, and activities, you can reduce your carbon footprint by up to 30%.
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Destinations List */}
        {destinations.length > 0 && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Journey Route</h2>
            <div className="space-y-3">
              {destinations.map((dest, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium text-foreground">{dest.name}</div>
                    <div className="text-sm text-muted-foreground">{dest.country}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* CTA */}
        <Card className="p-8 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-3">Inspired by this trip?</h2>
          <p className="text-muted-foreground mb-6">
            Create your own sustainable travel plan and track your carbon footprint in real-time
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
            <Link href="/dashboard">Start Planning Your Trip</Link>
          </Button>
        </Card>
      </div>
    </div>
  )
}
