"use client"

import { useEffect, useState } from "react"
import { Plus, Search, Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TripCard } from "@/components/dashboard/trip-card"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Trip {
  _id: string
  title: string
  name?: string // Legacy field
  description?: string
  destinations?: { name?: string; city?: string; country?: string }[]
  metadata?: {
    destinations?: { name?: string; country?: string; lat?: number; lng?: number }[]
    activities?: any[]
    hotels?: any[]
    itinerary?: any[]
  }
  startDate: string
  endDate: string
  status: string
  predictedCarbon?: number
  carbonFootprint?: {
    total: number
  }
  tripType?: string
  shareCode?: string
}

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchTrips()
  }, [])

  const fetchTrips = async () => {
    try {
      setLoading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      console.log('Fetching trips from:', `${apiUrl}/trips`)
      
      const response = await fetch(`${apiUrl}/trips`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error:', response.status, errorText)
        throw new Error(`Failed to fetch trips: ${response.status}`)
      }

      const data = await response.json()
      console.log('Trips loaded:', data)
      console.log('Number of trips:', data.trips?.length)
      setTrips(data.trips || [])
      setError('') // Clear any previous errors
    } catch (err: any) {
      console.error('Error fetching trips:', err)
      setError(err.message || 'Failed to load trips. Make sure the backend is running on http://localhost:5000')
    } finally {
      setLoading(false)
    }
  }

  const filteredTrips = trips.filter(trip => {
    const tripName = trip.title || trip.name || ''
    const allDestinations = [
      ...(trip.destinations || []),
      ...(trip.metadata?.destinations || [])
    ]
    
    return (
      tripName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      allDestinations.some(d => 
        d.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.country?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
  })

  const upcomingTrips = filteredTrips.filter(trip => {
    const startDate = new Date(trip.startDate)
    return startDate >= new Date() && trip.status !== 'completed'
  })

  const pastTrips = filteredTrips.filter(trip => {
    const endDate = new Date(trip.endDate)
    return endDate < new Date() || trip.status === 'completed'
  })

  const planningTrips = filteredTrips.filter(trip => 
    trip.status === 'planning' || trip.status === 'draft' || trip.status === 'confirmed'
  )

  console.log('Trip counts:', {
    total: trips.length,
    filtered: filteredTrips.length,
    upcoming: upcomingTrips.length,
    past: pastTrips.length,
    planning: planningTrips.length
  })

  const formatTripForCard = (trip: Trip) => {
    // Get destinations from either field
    const allDestinations = [
      ...(trip.destinations || []),
      ...(trip.metadata?.destinations || [])
    ]
    
    const firstDestination = allDestinations[0]
    const destinationText = firstDestination 
      ? `${firstDestination.name || 'Destination'}${firstDestination.country ? ', ' + firstDestination.country : ''}`
      : 'No destination'
    
    const carbonValue = trip.predictedCarbon || trip.carbonFootprint?.total || 0
    
    return {
      id: trip._id,
      name: trip.title || trip.name || 'Untitled Trip',
      destination: destinationText,
      startDate: trip.startDate,
      endDate: trip.endDate,
      imageUrl: '/placeholder-trip.jpg',
      sustainabilityScore: carbonValue > 0 ? Math.max(0, 100 - (carbonValue / 10)) : 75,
      predictedCarbon: carbonValue,
      tripType: trip.tripType || 'trip',
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">My Trips</h1>
          <p className="text-muted-foreground">Manage and track all your sustainable travel adventures</p>
        </div>
        <Button className="bg-primary hover:bg-primary-dark text-white" asChild>
          <Link href="/dashboard/trips/create">
            <Plus className="w-4 h-4 mr-2" />
            New Trip
          </Link>
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search trips..." 
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading trips...</span>
        </div>
      ) : (
        /* Tabs */
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingTrips.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past Trips ({pastTrips.length})
            </TabsTrigger>
            <TabsTrigger value="planning">
              Planning ({planningTrips.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-6">
            {upcomingTrips.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-lg border">
                <p className="text-muted-foreground mb-4">No upcoming trips</p>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/trips/create">Plan Your First Trip</Link>
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingTrips.map((trip) => (
                  <TripCard key={trip._id} trip={formatTripForCard(trip)} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="past" className="mt-6">
            {pastTrips.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-lg border">
                <p className="text-muted-foreground">No past trips yet</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pastTrips.map((trip) => (
                  <TripCard key={trip._id} trip={formatTripForCard(trip)} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="planning" className="mt-6">
            {planningTrips.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-lg border">
                <p className="text-muted-foreground mb-4">No trips in planning stage</p>
                <Button variant="outline" asChild>
                  <Link href="/dashboard/trips/create">Start Planning a Trip</Link>
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {planningTrips.map((trip) => (
                  <TripCard key={trip._id} trip={formatTripForCard(trip)} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
