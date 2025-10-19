"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  MapPin, 
  Calendar as CalendarIcon,
  Plus,
  X,
  Plane,
  Train,
  Car,
  Navigation,
  Sparkles,
  ArrowRight,
  Loader2,
  MapPinned,
  Clock,
  Trash2,
  Star,
  Save,
  Check
} from "lucide-react"
import { format, addDays } from "date-fns"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { getDistance } from "geolib"
import { useFlights } from "@/hooks/use-flights"

// Dynamic import for map to avoid SSR issues
const ActivityMap = dynamic(() => import("@/components/maps/activity-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full flex items-center justify-center bg-muted rounded-lg">
      <Loader2 className="w-8 h-8 animate-spin" />
    </div>
  )
})

// Hardcoded current location (Colombo, Sri Lanka)
const CURRENT_LOCATION = {
  name: "Colombo, Sri Lanka",
  country: "Sri Lanka",
  city: "Colombo",
  lat: 6.9271,
  lng: 79.8612,
  airport: {
    name: "Bandaranaike International Airport",
    code: "CMB",
    lat: 7.1808,
    lng: 79.8841
  }
}

// Popular destinations with coordinates
const DESTINATIONS: Record<string, {
  capital: string
  lat: number
  lng: number
  airport: { name: string; code: string; lat: number; lng: number }
}> = {
  "France": { capital: "Paris", lat: 48.8566, lng: 2.3522, airport: { name: "Charles de Gaulle", code: "CDG", lat: 49.0097, lng: 2.5479 } },
  "Switzerland": { capital: "Bern", lat: 46.9480, lng: 7.4474, airport: { name: "Zurich Airport", code: "ZRH", lat: 47.4647, lng: 8.5492 } },
  "Italy": { capital: "Rome", lat: 41.9028, lng: 12.4964, airport: { name: "Fiumicino", code: "FCO", lat: 41.8003, lng: 12.2389 } },
  "Spain": { capital: "Madrid", lat: 40.4168, lng: -3.7038, airport: { name: "Barajas", code: "MAD", lat: 40.4983, lng: -3.5676 } },
  "Germany": { capital: "Berlin", lat: 52.5200, lng: 13.4050, airport: { name: "Brandenburg", code: "BER", lat: 52.3667, lng: 13.5033 } },
  "United Kingdom": { capital: "London", lat: 51.5074, lng: -0.1278, airport: { name: "Heathrow", code: "LHR", lat: 51.4700, lng: -0.4543 } },
  "Japan": { capital: "Tokyo", lat: 35.6762, lng: 139.6503, airport: { name: "Narita", code: "NRT", lat: 35.7647, lng: 140.3864 } },
  "USA": { capital: "New York", lat: 40.7128, lng: -74.0060, airport: { name: "JFK", code: "JFK", lat: 40.6413, lng: -73.7781 } },
  "Australia": { capital: "Sydney", lat: -33.8688, lng: 151.2093, airport: { name: "Kingsford Smith", code: "SYD", lat: -33.9461, lng: 151.1772 } },
  "Thailand": { capital: "Bangkok", lat: 13.7563, lng: 100.5018, airport: { name: "Suvarnabhumi", code: "BKK", lat: 13.6900, lng: 100.7501 } },
  "UAE": { capital: "Dubai", lat: 25.2048, lng: 55.2708, airport: { name: "Dubai International", code: "DXB", lat: 25.2532, lng: 55.3657 } },
  "India": { capital: "New Delhi", lat: 28.6139, lng: 77.2090, airport: { name: "Indira Gandhi", code: "DEL", lat: 28.5562, lng: 77.1000 } }
}

interface Destination {
  country: string
  capital: string
  lat: number
  lng: number
  airport: {
    name: string
    code: string
    lat: number
    lng: number
  }
  arrivalDate?: Date
  departureDate?: Date
}

interface Activity {
  id: string
  name: string
  location: string
  lat: number
  lng: number
  time: string
  duration: number
  type: "sightseeing" | "dining" | "adventure" | "cultural" | "nature"
  carbonImpact: number
  distance: number
}

export default function NewTripPlanner() {
  const [step, setStep] = useState(1)
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [selectedCountry, setSelectedCountry] = useState("")
  const [goingDate, setGoingDate] = useState<Date>()
  const [returnDate, setReturnDate] = useState<Date>()
  const [tripType, setTripType] = useState("")
  const [totalDistance, setTotalDistance] = useState(0)
  
  // Step 2: Activity Planning
  const [currentDay, setCurrentDay] = useState(1)
  const [activities, setActivities] = useState<Record<number, Activity[]>>({})
  const [newActivityName, setNewActivityName] = useState("")
  const [newActivityLocation, setNewActivityLocation] = useState("")
  const [newActivityTime, setNewActivityTime] = useState("09:00")
  const [newActivityType, setNewActivityType] = useState<Activity["type"]>("sightseeing")
  const [isCalculating, setIsCalculating] = useState(false)
  const [locationSuggestions, setLocationSuggestions] = useState<Array<{
    display_name: string
    lat: string
    lon: string
  }>>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)

  // Step 2: Hotel Selection (NEW - moved before activities)
  const [availableHotels, setAvailableHotels] = useState<Record<string, any[]>>({})
  const [isLoadingHotels, setIsLoadingHotels] = useState(false)

  // Step 2: Flight Data (Amadeus API)
  const { searchFlights, loading: flightsLoading } = useFlights()
  const [realFlightOffers, setRealFlightOffers] = useState<Record<string, any[]>>({})
  const [selectedFlights, setSelectedFlights] = useState<Record<string, any>>({})
  const [flightClass, setFlightClass] = useState<"ECONOMY" | "BUSINESS">("ECONOMY")
  const [expandedRoutes, setExpandedRoutes] = useState<Record<string, boolean>>({})

  // Step 3: AI Optimization (moved to Step 4)
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [optimizationResult, setOptimizationResult] = useState<any>(null)
  const [selectedTransportModes, setSelectedTransportModes] = useState<Record<number, any>>({})
  const [selectedHotelsForTrip, setSelectedHotelsForTrip] = useState<Record<number, any>>({})

  // Step 5: Save Trip
  const [isSaving, setIsSaving] = useState(false)
  const [savedTripId, setSavedTripId] = useState<string | null>(null)
  const [tripTitle, setTripTitle] = useState("")
  const [shareCode, setShareCode] = useState<string | null>(null)

  // Fetch hotels when user moves to Step 2
  const fetchHotelsForDestinations = useCallback(async () => {
    if (destinations.length === 0) return
    
    setIsLoadingHotels(true)
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
    
    try {
      const hotelsData: Record<string, any[]> = {}
      
      for (const dest of destinations) {
        const response = await fetch(
          `${API_URL}/hotels/search?city=${encodeURIComponent(dest.capital)}&country=${encodeURIComponent(dest.country)}&limit=6`
        )
        
        if (response.ok) {
          const hotels = await response.json()
          hotelsData[dest.capital] = hotels
        } else {
          hotelsData[dest.capital] = []
        }
      }
      
      setAvailableHotels(hotelsData)
    } catch (error) {
      console.error("Error fetching hotels:", error)
    } finally {
      setIsLoadingHotels(false)
    }
  }, [destinations])

  // Fetch real flight data from Amadeus API
  const fetchRealFlightData = useCallback(async () => {
    if (destinations.length === 0 || !goingDate) {
      console.log("❌ Cannot fetch flights: Missing destinations or date")
      return
    }
    
    console.log("🛫 Fetching real flight data...")
    console.log("Destinations:", destinations.length)
    console.log("Going Date:", goingDate)
    console.log("Return Date:", returnDate)
    
    try {
      const flightData: Record<string, any[]> = {}
      
      // Outbound flights from current location to each destination
      for (let i = 0; i < destinations.length; i++) {
        const origin = i === 0 ? CURRENT_LOCATION.airport.code : destinations[i - 1].airport.code
        const destination = destinations[i].airport.code
        
        // Calculate departure date for this leg
        let departureDate = new Date(goingDate)
        if (i > 0) {
          departureDate = addDays(departureDate, i * 3) // 3 days per destination
        }
        
        console.log(`🔍 Searching: ${origin} → ${destination} on ${format(departureDate, 'yyyy-MM-dd')}`)
        
        const offers = await searchFlights({
          origin,
          destination,
          departureDate: format(departureDate, 'yyyy-MM-dd'),
          adults: 1,
          travelClass: flightClass
        })
        
        console.log(`✅ Found ${offers.length} offers for ${origin} → ${destination}`)
        flightData[`${origin}-${destination}`] = offers
      }
      
      // Return flight from last destination to home
      if (destinations.length > 0 && returnDate) {
        const lastDest = destinations[destinations.length - 1]
        const returnOrigin = lastDest.airport.code
        const returnDest = CURRENT_LOCATION.airport.code
        
        console.log(`🔍 Searching return: ${returnOrigin} → ${returnDest} on ${format(returnDate, 'yyyy-MM-dd')}`)
        
        const returnOffers = await searchFlights({
          origin: returnOrigin,
          destination: returnDest,
          departureDate: format(returnDate, 'yyyy-MM-dd'),
          adults: 1,
          travelClass: flightClass
        })
        
        console.log(`✅ Found ${returnOffers.length} return offers`)
        flightData[`${returnOrigin}-${returnDest}`] = returnOffers
      }
      
      console.log("✈️ Total routes with data:", Object.keys(flightData).length)
      setRealFlightOffers(flightData)
    } catch (error) {
      console.error("❌ Error fetching flight data:", error)
    }
  }, [destinations, goingDate, returnDate, flightClass, searchFlights])

  // Step 3: AI Optimization
  useEffect(() => {
    if (destinations.length > 0) {
      calculateTripMetrics()
    }
  }, [destinations])

  const calculateTripMetrics = () => {
    let total = 0
    
    // Distance from current location to first destination
    if (destinations.length > 0) {
      const firstDest = destinations[0]
      const distance = getDistance(
        { latitude: CURRENT_LOCATION.airport.lat, longitude: CURRENT_LOCATION.airport.lng },
        { latitude: firstDest.airport.lat, longitude: firstDest.airport.lng }
      ) / 1000 // Convert to km
      
      total += distance
    }

    // Distance between destinations
    for (let i = 0; i < destinations.length - 1; i++) {
      const from = destinations[i]
      const to = destinations[i + 1]
      const distance = getDistance(
        { latitude: from.airport.lat, longitude: from.airport.lng },
        { latitude: to.airport.lat, longitude: to.airport.lng }
      ) / 1000
      
      total += distance
    }

    // Distance back to current location
    if (destinations.length > 0) {
      const lastDest = destinations[destinations.length - 1]
      const distance = getDistance(
        { latitude: lastDest.airport.lat, longitude: lastDest.airport.lng },
        { latitude: CURRENT_LOCATION.airport.lat, longitude: CURRENT_LOCATION.airport.lng }
      ) / 1000
      
      total += distance
    }

    setTotalDistance(Math.round(total))

    // Determine trip type
    if (total < 200) {
      setTripType("local")
    } else if (total < 2000) {
      setTripType("domestic")
    } else {
      setTripType("international")
    }
  }

  const addDestination = () => {
    if (selectedCountry && DESTINATIONS[selectedCountry]) {
      const destData = DESTINATIONS[selectedCountry]
      const newDest: Destination = {
        country: selectedCountry,
        capital: destData.capital,
        lat: destData.lat,
        lng: destData.lng,
        airport: destData.airport
      }
      setDestinations([...destinations, newDest])
      setSelectedCountry("")
    }
  }

  const removeDestination = (index: number) => {
    setDestinations(destinations.filter((_, i) => i !== index))
  }

  const getTripTypeBadge = () => {
    const badges = {
      local: { color: "bg-green-500", label: "LOCAL" },
      domestic: { color: "bg-blue-500", label: "DOMESTIC" },
      international: { color: "bg-purple-500", label: "INTERNATIONAL" }
    }
    
    const badge = badges[tripType as keyof typeof badges]
    if (!badge) return null
    
    return (
      <Badge className={`${badge.color} text-white`}>
        <Navigation className="w-3 h-3 mr-1" />
        {badge.label}
      </Badge>
    )
  }

  const handleNextStep = () => {
    if (step === 1 && destinations.length > 0 && goingDate && returnDate) {
      // Move to Step 2: Hotel Selection and Flights
      fetchHotelsForDestinations()
      fetchRealFlightData() // Fetch real flight data from Amadeus
      setStep(2)
    } else if (step === 2) {
      // Move to Step 3: Activity Planning
      setStep(3)
    } else if (step === 3) {
      // Move to Step 4: Carbon Forecast & Optimization
      optimizeTrip()
    } else if (step === 4) {
      setStep(5)
    }
  }

  // Autocomplete search with debouncing
  useEffect(() => {
    if (newActivityLocation.length < 3) {
      setLocationSuggestions([])
      setShowSuggestions(false)
      return
    }

    const currentDestination = destinations[0]
    if (!currentDestination) return

    const timer = setTimeout(async () => {
      setIsLoadingSuggestions(true)
      try {
        const searchQuery = `${newActivityLocation}, ${currentDestination.capital}, ${currentDestination.country}`
        const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1`
        
        const response = await fetch(searchUrl, {
          headers: { 'User-Agent': 'TravearthPlanner/1.0' }
        })

        if (response.ok) {
          const data = await response.json()
          setLocationSuggestions(data)
          setShowSuggestions(data.length > 0)
        }
      } catch (error) {
        console.error("Autocomplete error:", error)
      } finally {
        setIsLoadingSuggestions(false)
      }
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [newActivityLocation, destinations])

  // AI Optimization - Call backend API
  const optimizeTrip = useCallback(async () => {
    setIsOptimizing(true)
    setStep(4) // Move to Step 4 immediately to show loading

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
      
      // Prepare activities data - convert from Record<number, Activity[]> to array
      const activitiesArray = Object.entries(activities).flatMap(([day, dayActivities]) =>
        dayActivities.map(activity => ({
          name: activity.name,
          location: activity.location,
          lat: activity.lat,
          lng: activity.lng,
          type: activity.type,
          time: activity.time,
          carbonImpact: activity.carbonImpact,
          day: parseInt(day)
        }))
      )

      // Prepare hotels data
      const hotelsArray = Object.values(selectedHotelsForTrip).filter(Boolean)
      
      // Prepare data for backend
      const requestData = {
        destinations: destinations.map(dest => ({
          name: dest.country,
          city: dest.capital,
          country: dest.country,
          lat: dest.lat,
          lng: dest.lng
        })),
        activities: activitiesArray,
        hotels: hotelsArray,
        startDate: goingDate?.toISOString(),
        endDate: returnDate?.toISOString(),
        travelers: 1,
        preferences: {
          budget: "medium",
          pace: "moderate"
        }
      }

      console.log("🚀 Sending optimization request:", requestData)

      const response = await fetch(`${API_URL}/ecoplan/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("❌ API Error:", errorData)
        throw new Error(errorData.message || "Failed to generate optimization")
      }

      const responseData = await response.json()
      console.log("🔍 API Response:", responseData)
      
      // Extract ecoPlan from response (backend returns { success: true, ecoPlan: {...} })
      const result = responseData.ecoPlan || responseData
      console.log("📊 Summary:", result.summary)
      console.log("💨 Total Carbon:", result.summary?.totalCarbon)
      console.log("📍 Destinations:", result.summary?.totalDestinations)
      console.log("📅 Duration:", result.duration)
      setOptimizationResult(result)

      // Pre-select recommended transport modes and hotels
      const transportModes: Record<number, any> = {}
      const hotels: Record<number, any> = {}

      result.itinerary?.forEach((day: any, index: number) => {
        if (day.transport) {
          transportModes[index] = day.transport
        }
        if (day.accommodationSuggestions && day.accommodationSuggestions.length > 0) {
          hotels[index] = day.accommodationSuggestions[0]
        }
      })

      setSelectedTransportModes(transportModes)
      setSelectedHotelsForTrip(hotels)
    } catch (error) {
      console.error("❌ Optimization error:", error)
      
      // Show user-friendly error
      const errorMessage = error instanceof Error ? error.message : "Failed to optimize trip"
      alert(`Failed to calculate carbon footprint:\n\n${errorMessage}\n\nPlease check:\n- Backend server is running on port 5000\n- All required data is filled in\n- Check browser console for details`)
      
      // Stay on Step 3 if there's an error
      setStep(3)
    } finally {
      setIsOptimizing(false)
    }
  }, [destinations, activities, selectedHotelsForTrip, goingDate, returnDate])

  // Save Trip to MongoDB
  const saveTrip = useCallback(async () => {
    if (!tripTitle.trim()) {
      alert("Please enter a trip title")
      return
    }

    setIsSaving(true)

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

      // Prepare trip data
      const tripData = {
        title: tripTitle,
        description: `${optimizationResult?.tripType || "Trip"} to ${destinations.map(d => d.capital).join(", ")}`,
        startDate: goingDate?.toISOString(),
        endDate: returnDate?.toISOString(),
        status: "confirmed",
        tripType: optimizationResult?.tripType || "international",
        travelers: 1,
        destinations: destinations.map(d => ({
          name: d.capital,
          country: d.country,
          lat: d.lat,
          lng: d.lng
        })),
        activities: Object.entries(activities).flatMap(([day, dayActivities]) =>
          dayActivities.map(activity => ({
            name: activity.name,
            location: activity.location,
            lat: activity.lat,
            lng: activity.lng,
            type: activity.type,
            time: activity.time,
            carbonImpact: activity.carbonImpact,
            day: parseInt(day)
          }))
        ),
        hotels: Object.values(selectedHotelsForTrip).filter(Boolean),
        predictedCarbon: optimizationResult?.summary?.totalCarbon || 0,
        actualCarbon: 0,
        ecoBenchmark: optimizationResult?.benchmark,
        benchmarkRating: optimizationResult?.summary?.rating,
        itinerary: optimizationResult?.itinerary || []
      }

      console.log("💾 Saving trip:", tripData)

      const response = await fetch(`${API_URL}/trips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(tripData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to save trip")
      }

      const result = await response.json()
      console.log("✅ Trip saved:", result)

      setSavedTripId(result.trip?._id || result._id)
      
      // Generate share code
      const shareCodeValue = Math.random().toString(36).substring(2, 10).toUpperCase()
      setShareCode(shareCodeValue)

      // Show success message
      alert(`✅ Trip saved successfully!\n\nYou can now view it in your dashboard.`)

    } catch (error) {
      console.error("❌ Save error:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to save trip"
      alert(`Failed to save trip:\n\n${errorMessage}\n\nPlease try again or check the console for details`)
    } finally {
      setIsSaving(false)
    }
  }, [tripTitle, optimizationResult, destinations, activities, selectedHotelsForTrip, goingDate, returnDate])

  // Calculate number of days
  const tripDays = useMemo(() => {
    if (!goingDate || !returnDate) return 0
    return Math.ceil((returnDate.getTime() - goingDate.getTime()) / (1000 * 60 * 60 * 24))
  }, [goingDate, returnDate])

  // Handle selecting a suggestion
  const selectSuggestion = useCallback((suggestion: any) => {
    setNewActivityLocation(suggestion.display_name.split(',')[0]) // Use just the place name
    setLocationSuggestions([])
    setShowSuggestions(false)
    
    // Store the selected coordinates temporarily
    ;(window as any).__selectedCoordinates = {
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon)
    }
  }, [])

  // Add activity for current day
  const addActivity = useCallback(async () => {
    if (!newActivityName || !newActivityLocation) return

    setIsCalculating(true)

    try {
      const currentDestination = destinations[0]
      if (!currentDestination) {
        alert("Please select a destination first")
        return
      }

      // Check if user selected from autocomplete suggestions
      let activityLat = currentDestination.lat
      let activityLng = currentDestination.lng

      if ((window as any).__selectedCoordinates) {
        // Use pre-selected coordinates from autocomplete
        activityLat = (window as any).__selectedCoordinates.lat
        activityLng = (window as any).__selectedCoordinates.lng
        delete (window as any).__selectedCoordinates
      } else {
        // Real geocoding using Nominatim (OpenStreetMap)
        try {
          // Geocode the location using Nominatim
          const geocodeQuery = `${newActivityLocation}, ${currentDestination.capital}, ${currentDestination.country}`
          const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(geocodeQuery)}&limit=1`
          
          const geocodeResponse = await fetch(geocodeUrl, {
            headers: {
              'User-Agent': 'TravearthPlanner/1.0' // Required by Nominatim
            }
          })

          if (geocodeResponse.ok) {
            const geocodeData = await geocodeResponse.json()
            if (geocodeData && geocodeData.length > 0) {
              activityLat = parseFloat(geocodeData[0].lat)
              activityLng = parseFloat(geocodeData[0].lon)
            }
          }
        } catch (geocodeError) {
          console.warn("Geocoding failed, using destination center:", geocodeError)
          // Fall back to destination coordinates with small random offset
          const randomOffset = () => (Math.random() - 0.5) * 0.05
          activityLat = currentDestination.lat + randomOffset()
          activityLng = currentDestination.lng + randomOffset()
        }
      }

      // Calculate distance from previous activity or hotel
      const dayActivities = activities[currentDay] || []
      const previousLocation = dayActivities.length > 0
        ? dayActivities[dayActivities.length - 1]
        : { lat: currentDestination.lat, lng: currentDestination.lng }

      const distance = getDistance(
        { latitude: previousLocation.lat, longitude: previousLocation.lng },
        { latitude: activityLat, longitude: activityLng }
      ) / 1000 // km

      // Calculate carbon impact based on activity type
      const carbonFactors = {
        sightseeing: 0.1,
        dining: 2.5,
        adventure: 5.0,
        cultural: 0.2,
        nature: 0.05
      }

      const newActivity: Activity = {
        id: `activity-${Date.now()}`,
        name: newActivityName,
        location: newActivityLocation,
        lat: activityLat,
        lng: activityLng,
        time: newActivityTime,
        duration: 2,
        type: newActivityType,
        carbonImpact: carbonFactors[newActivityType],
        distance
      }

      setActivities({
        ...activities,
        [currentDay]: [...(activities[currentDay] || []), newActivity]
      })

      // Reset form
      setNewActivityName("")
      setNewActivityLocation("")
      setNewActivityTime("09:00")
      setNewActivityType("sightseeing")
    } catch (error) {
      console.error("Error adding activity:", error)
      alert("Failed to add activity. Please try again.")
    } finally {
      setIsCalculating(false)
    }
  }, [newActivityName, newActivityLocation, newActivityTime, newActivityType, currentDay, activities, destinations])

  const removeActivity = useCallback((dayNumber: number, activityId: string) => {
    setActivities({
      ...activities,
      [dayNumber]: (activities[dayNumber] || []).filter(a => a.id !== activityId)
    })
  }, [activities])

  // Calculate total carbon for current day
  const getDayCarbon = useCallback((dayNumber: number) => {
    const dayActivities = activities[dayNumber] || []
    return dayActivities.reduce((sum, a) => sum + a.carbonImpact, 0)
  }, [activities])

  // Get map markers for current day
  const getMapMarkers = useMemo(() => {
    const dayActivities = activities[currentDay] || []
    const currentDest = destinations[0]
    
    if (!currentDest) return []

    const markers: Array<{
      position: [number, number]
      label: string
      type?: "current" | "airport" | "activity" | "hotel"
    }> = [
      {
        position: [currentDest.lat, currentDest.lng] as [number, number],
        label: `${currentDest.capital} - Hotel`,
        type: "hotel"
      }
    ]

    dayActivities.forEach((activity, index) => {
      markers.push({
        position: [activity.lat, activity.lng] as [number, number],
        label: `${index + 1}. ${activity.name}`,
        type: "activity"
      })
    })

    return markers
  }, [currentDay, activities, destinations])

  // Get route polyline for current day
  const getMapRoute = useMemo(() => {
    const dayActivities = activities[currentDay] || []
    const currentDest = destinations[0]
    
    if (!currentDest) return []

    const route: [number, number][] = [[currentDest.lat, currentDest.lng]]
    
    dayActivities.forEach(activity => {
      route.push([activity.lat, activity.lng])
    })

    return route
  }, [currentDay, activities, destinations])

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold flex items-center gap-2 mb-2">
          <Sparkles className="h-8 w-8 text-primary" />
          Plan Your Trip
        </h1>
        <p className="text-muted-foreground">
          Create a sustainable travel itinerary with intelligent route optimization
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="flex items-center">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                s === step
                  ? "bg-primary text-primary-foreground"
                  : s < step
                  ? "bg-green-500 text-white"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {s}
            </div>
            {s < 5 && (
              <div
                className={cn(
                  "w-16 h-1 mx-2",
                  s < step ? "bg-green-500" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-6">
        <span className="text-sm text-muted-foreground">
          {step === 1 && "Step 1: Select Destinations"}
          {step === 2 && "Step 2: Select Hotels"}
          {step === 3 && "Step 3: Plan Activities"}
          {step === 4 && "Step 4: Carbon Footprint Forecast"}
          {step === 5 && "Step 5: Review & Save"}
        </span>
      </div>

      {/* Step 1: Destination Selection */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Current Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Your Starting Point
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-4 bg-primary/10 rounded-lg">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <div className="font-semibold">{CURRENT_LOCATION.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {CURRENT_LOCATION.airport.name} ({CURRENT_LOCATION.airport.code})
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Destination Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Destinations</CardTitle>
              <CardDescription>Choose the countries you want to visit</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="flex-1 h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="">Select a country...</option>
                  {Object.keys(DESTINATIONS).map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                <Button onClick={addDestination} disabled={!selectedCountry}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>

              {destinations.length > 0 && (
                <div className="space-y-2">
                  {destinations.map((dest, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-card border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold">{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-semibold">{dest.country}</div>
                          <div className="text-sm text-muted-foreground">
                            {dest.capital} - {dest.airport.name} ({dest.airport.code})
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDestination(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trip Dates */}
          <Card>
            <CardHeader>
              <CardTitle>Travel Dates</CardTitle>
              <CardDescription>When are you going?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Going Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !goingDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {goingDate ? format(goingDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={goingDate}
                        onSelect={setGoingDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Return Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !returnDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {returnDate ? format(returnDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={returnDate}
                        onSelect={setReturnDate}
                        initialFocus
                        disabled={(date) => goingDate ? date < goingDate : false}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trip Summary */}
          {destinations.length > 0 && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Trip Summary</span>
                  {getTripTypeBadge()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{destinations.length}</div>
                    <div className="text-sm text-muted-foreground">
                      {destinations.length === 1 ? "Destination" : "Destinations"}
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {totalDistance.toLocaleString()} km
                    </div>
                    <div className="text-sm text-muted-foreground">Total Distance</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {goingDate && returnDate
                        ? Math.ceil(
                            (returnDate.getTime() - goingDate.getTime()) / (1000 * 60 * 60 * 24)
                          )
                        : 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Days</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Next Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleNextStep}
              disabled={destinations.length === 0 || !goingDate || !returnDate}
              size="lg"
            >
              Continue to Hotels
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Flights & Hotels */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ✈️ Flights & 🏨 Hotels
              </CardTitle>
              <CardDescription>
                Book flights and choose eco-friendly accommodations for your journey
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Flight Tickets Section */}
          <Card className="border-2 border-blue-600/30 bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5 text-blue-600" />
                Flight Tickets
              </CardTitle>
              <CardDescription>
                Real flight data with carbon footprint estimates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Debug Info */}
              <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-3 text-xs">
                <div className="font-semibold mb-2 text-blue-600">Flight Data Status:</div>
                <div className="space-y-1 text-muted-foreground">
                  <div>Loading: {flightsLoading ? "Yes ⏳" : "No"}</div>
                  <div>Real Offers: {Object.keys(realFlightOffers).length} routes</div>
                  <div>Going Date: {goingDate ? format(goingDate, "MMM dd, yyyy") : "Not set"}</div>
                  <div>Return Date: {returnDate ? format(returnDate, "MMM dd, yyyy") : "Not set"}</div>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2 w-full"
                  onClick={fetchRealFlightData}
                  disabled={flightsLoading}
                >
                  {flightsLoading ? "Loading..." : "Refresh Flight Data"}
                </Button>
              </div>

              {/* Flight Route Overview */}
              <div className="bg-accent/50 p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Your Flight Route</div>
                    <div className="font-semibold text-lg mt-1 text-foreground">
                      {CURRENT_LOCATION.airport.code} → {destinations.map(d => d.airport.code).join(" → ")} → {CURRENT_LOCATION.airport.code}
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-blue-600 text-white border-blue-600">
                    Round Trip
                  </Badge>
                </div>
                
                {goingDate && returnDate && (
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      <span>Departure: {format(goingDate, "MMM dd, yyyy")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      <span>Return: {format(returnDate, "MMM dd, yyyy")}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Flights for Each Leg */}
              {flightsLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <span className="ml-3 text-muted-foreground">Loading real flight data from Amadeus...</span>
                </div>
              )}
              
              {destinations.map((dest, destIndex) => {
                const fromAirport = destIndex === 0 ? CURRENT_LOCATION.airport : destinations[destIndex - 1].airport
                const toAirport = dest.airport
                const distance = Math.round(getDistance(
                  { latitude: fromAirport.lat, longitude: fromAirport.lng },
                  { latitude: toAirport.lat, longitude: toAirport.lng }
                ) / 1000)
                const flightTime = Math.round(distance / 800) // Approximate flight time in hours
                const carbonFootprint = (distance * 0.115).toFixed(1) // kg CO2 per km (economy class average)
                
                // Get real flight offers for this route
                const routeKey = `${fromAirport.code}-${toAirport.code}`
                const realOffers = realFlightOffers[routeKey] || []
                const hasRealData = realOffers.length > 0
                
                return (
                  <div key={destIndex} className="bg-accent/30 p-4 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center">
                          <Plane className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">
                            {fromAirport.code} → {toAirport.code}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {fromAirport.name} to {toAirport.name}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-orange-600/20 text-orange-600 border-orange-600/50">
                        🌍 {hasRealData && realOffers[0].carbon.weight ? `${realOffers[0].carbon.weight} kg CO₂` : `${carbonFootprint} kg CO₂`}
                      </Badge>
                    </div>

                    {/* Real Flight Options from Amadeus or Mock Data */}
                    <div className="space-y-2">
                      {hasRealData ? (
                        // Show real Amadeus flight offers
                        <>
                          {realOffers.slice(0, expandedRoutes[routeKey] ? undefined : 3).map((offer: any, index: number) => {
                            const isEconomy = offer.flight.cabin === "ECONOMY"
                            const departureTime = new Date(offer.flight.departure.time)
                            const arrivalTime = new Date(offer.flight.arrival.time)
                            
                            return (
                              <div 
                                key={offer.id}
                                className={cn(
                                  "p-3 rounded border cursor-pointer transition-colors",
                                  index === 0 && isEconomy
                                    ? "bg-green-600/10 border-green-600/30 hover:bg-green-600/20"
                                    : "border-border hover:bg-accent/50"
                                )}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      {index === 0 && isEconomy && (
                                        <Badge className="bg-green-600 text-white">Best Eco Choice</Badge>
                                      )}
                                      <span className="text-sm font-semibold text-foreground">
                                        {offer.airline} {offer.flight.number}
                                      </span>
                                      <Badge variant="outline" className="text-xs">
                                        {offer.flight.cabin}
                                      </Badge>
                                    </div>
                                    <div className="text-xs text-muted-foreground space-y-1">
                                      <div>🛫 Depart: {format(departureTime, "MMM dd, h:mm a")}</div>
                                      <div>🛬 Arrive: {format(arrivalTime, "MMM dd, h:mm a")}</div>
                                      <div>⏱️ Duration: {offer.flight.duration.replace('PT', '').toLowerCase()}</div>
                                      <div>✈️ Stops: {offer.numberOfStops === 0 ? "Direct" : `${offer.numberOfStops} stop(s)`}</div>
                                      <div className={cn(
                                        "font-medium",
                                        isEconomy ? "text-green-600" : "text-orange-600"
                                      )}>
                                        🌍 Carbon: {offer.carbon.weight || carbonFootprint} {offer.carbon.unit}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className={cn(
                                      "text-lg font-bold",
                                      index === 0 ? "text-green-600" : "text-foreground"
                                    )}>
                                      ${offer.price.total.toFixed(2)}
                                    </div>
                                    <div className="text-xs text-muted-foreground">{offer.price.currency}</div>
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="mt-2"
                                      onClick={() => {
                                        setSelectedFlights({
                                          ...selectedFlights,
                                          [routeKey]: offer
                                        })
                                      }}
                                    >
                                      {selectedFlights[routeKey]?.id === offer.id ? (
                                        <><Check className="w-3 h-3 mr-1" /> Selected</>
                                      ) : (
                                        "Select"
                                      )}
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                          {realOffers.length > 3 && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-full text-xs"
                              onClick={() => {
                                setExpandedRoutes({
                                  ...expandedRoutes,
                                  [routeKey]: !expandedRoutes[routeKey]
                                })
                              }}
                            >
                              {expandedRoutes[routeKey] 
                                ? "Show less" 
                                : `View ${realOffers.length - 3} more options`
                              }
                            </Button>
                          )}
                        </>
                      ) : (
                        // Show mock data as fallback
                        <>
                          {/* Economy Option */}
                          <div className="p-3 rounded border bg-green-600/10 border-green-600/30">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge className="bg-green-600 text-white">Best Eco Choice</Badge>
                                  <span className="text-sm font-semibold text-foreground">Economy Class</span>
                                </div>
                                <div className="text-xs text-muted-foreground space-y-1">
                                  <div>✈️ Distance: {distance.toLocaleString()} km</div>
                                  <div>⏱️ Duration: ~{flightTime}h {((distance / 800 - flightTime) * 60).toFixed(0)}m</div>
                                  <div className="text-green-600 font-medium">🌱 Carbon: {carbonFootprint} kg CO₂ per passenger</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-green-600">
                                  ${Math.round(distance * 0.08)}
                                </div>
                                <div className="text-xs text-muted-foreground">per person</div>
                              </div>
                            </div>
                          </div>

                          {/* Business Option */}
                          <div className="p-3 rounded border border-border hover:bg-accent/50 cursor-pointer">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-sm font-semibold text-foreground">Business Class</span>
                                </div>
                                <div className="text-xs text-muted-foreground space-y-1">
                                  <div>✈️ Distance: {distance.toLocaleString()} km</div>
                                  <div>⏱️ Duration: ~{flightTime}h {((distance / 800 - flightTime) * 60).toFixed(0)}m</div>
                                  <div className="text-orange-600 font-medium">🌍 Carbon: {(parseFloat(carbonFootprint) * 2.6).toFixed(1)} kg CO₂ per passenger</div>
                                  <div className="text-xs text-orange-500">(2.6x more emissions than economy)</div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-foreground">
                                  ${Math.round(distance * 0.25)}
                                </div>
                                <div className="text-xs text-muted-foreground">per person</div>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Eco Travel Tip */}
                    <div className="mt-3 p-2 bg-blue-600/10 rounded text-xs text-blue-600 border border-blue-600/30">
                      💡 <strong>Eco Tip:</strong> Direct flights produce less CO₂ than connecting flights. Economy class has the lowest per-passenger carbon footprint.
                    </div>
                  </div>
                )
              })}

              {/* Return Flight */}
              {destinations.length > 0 && (
                <div className="bg-accent/30 p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center">
                        <Plane className="w-5 h-5 text-blue-600 rotate-180" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">
                          {destinations[destinations.length - 1].airport.code} → {CURRENT_LOCATION.airport.code}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Return to {CURRENT_LOCATION.airport.name}
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-orange-600/20 text-orange-600 border-orange-600/50">
                      🌍 {(() => {
                        const lastDest = destinations[destinations.length - 1]
                        const dist = Math.round(getDistance(
                          { latitude: lastDest.airport.lat, longitude: lastDest.airport.lng },
                          { latitude: CURRENT_LOCATION.airport.lat, longitude: CURRENT_LOCATION.airport.lng }
                        ) / 1000)
                        return (dist * 0.115).toFixed(1)
                      })()} kg CO₂
                    </Badge>
                  </div>

                  <div className="p-3 rounded border bg-green-600/10 border-green-600/30">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-green-600 text-white">Recommended</Badge>
                          <span className="text-sm font-semibold text-foreground">Economy Class - Return</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Same carbon footprint as outbound economy flight
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          ${(() => {
                            const lastDest = destinations[destinations.length - 1]
                            const dist = Math.round(getDistance(
                              { latitude: lastDest.airport.lat, longitude: lastDest.airport.lng },
                              { latitude: CURRENT_LOCATION.airport.lat, longitude: CURRENT_LOCATION.airport.lng }
                            ) / 1000)
                            return Math.round(dist * 0.08)
                          })()}
                        </div>
                        <div className="text-xs text-muted-foreground">per person</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Total Carbon Summary */}
              <div className="bg-gradient-to-r from-orange-600/10 to-red-600/10 p-4 rounded-lg border-2 border-orange-600/30">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Total Flight Carbon Footprint</div>
                    <div className="text-2xl font-bold text-orange-600 mt-1">
                      {(() => {
                        let total = 0
                        // Outbound flights
                        destinations.forEach((dest, i) => {
                          const from = i === 0 ? CURRENT_LOCATION.airport : destinations[i - 1].airport
                          const dist = getDistance(
                            { latitude: from.lat, longitude: from.lng },
                            { latitude: dest.airport.lat, longitude: dest.airport.lng }
                          ) / 1000
                          total += dist * 0.115
                        })
                        // Return flight
                        if (destinations.length > 0) {
                          const lastDest = destinations[destinations.length - 1]
                          const dist = getDistance(
                            { latitude: lastDest.airport.lat, longitude: lastDest.airport.lng },
                            { latitude: CURRENT_LOCATION.airport.lat, longitude: CURRENT_LOCATION.airport.lng }
                          ) / 1000
                          total += dist * 0.115
                        }
                        return total.toFixed(1)
                      })()} kg CO₂
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Economy class, per passenger
                    </div>
                  </div>
                  <div className="text-4xl">✈️</div>
                </div>
              </div>

              {/* Offset Option */}
              <div className="bg-green-600/10 p-4 rounded-lg border border-green-600/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl">🌳</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">Carbon Offset Available</div>
                    <div className="text-sm text-muted-foreground">
                      Plant trees or support renewable energy projects to offset your flight emissions
                    </div>
                  </div>
                  <Button variant="outline" className="bg-green-600 text-white hover:bg-green-700" size="sm">
                    Offset Now
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hotels Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🏨 Select Your Hotels
              </CardTitle>
              <CardDescription>
                Choose eco-friendly accommodations for each destination
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Loading State */}
          {isLoadingHotels && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <Loader2 className="w-16 h-16 animate-spin mx-auto text-primary" />
                  <h3 className="text-xl font-semibold">Finding Eco-Friendly Hotels...</h3>
                  <p className="text-muted-foreground">
                    Searching for sustainable accommodations in your destinations
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Hotels by Destination */}
          {!isLoadingHotels && destinations.map((dest, destIndex) => (
            <Card key={destIndex}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    {dest.capital}, {dest.country}
                  </span>
                  {selectedHotelsForTrip[destIndex] && (
                    <Badge variant="default">Hotel Selected ✓</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  Choose from our curated eco-friendly hotels
                </CardDescription>
              </CardHeader>
              <CardContent>
                {availableHotels[dest.capital] && availableHotels[dest.capital].length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableHotels[dest.capital].slice(0, 6).map((hotel: any, hotelIndex: number) => (
                      <div
                        key={hotelIndex}
                        className={cn(
                          "flex flex-col gap-3 p-4 rounded-lg border cursor-pointer transition-all hover:shadow-lg",
                          selectedHotelsForTrip[destIndex]?.name === hotel.name
                            ? "bg-primary/10 border-primary ring-2 ring-primary"
                            : "bg-card hover:bg-accent"
                        )}
                        onClick={() => setSelectedHotelsForTrip({ ...selectedHotelsForTrip, [destIndex]: hotel })}
                      >
                        {/* Hotel Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-primary/20 rounded flex items-center justify-center shrink-0">
                              <span className="text-lg">🏨</span>
                            </div>
                            {selectedHotelsForTrip[destIndex]?.name === hotel.name && (
                              <div className="text-primary font-bold text-xl">✓</div>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(hotel.rating || 4)].map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                        </div>

                        {/* Hotel Details */}
                        <div>
                          <div className="font-semibold text-lg">{hotel.name}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            📍 {hotel.location?.address || hotel.location?.city || dest.capital}
                          </div>
                          <div className="text-sm font-medium text-primary mt-2">
                            ${hotel.pricePerNight || 120}/night
                          </div>
                        </div>

                        {/* Eco Features */}
                        {hotel.sustainabilityScore !== undefined && (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-green-50">
                              🌿 Eco Score: {hotel.sustainabilityScore}/100
                            </Badge>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-2">
                          {hotel.features?.includes("solar") && (
                            <Badge variant="secondary" className="text-xs">
                              ☀️ Solar Power
                            </Badge>
                          )}
                          {hotel.features?.includes("recycling") && (
                            <Badge variant="secondary" className="text-xs">
                              ♻️ Recycling
                            </Badge>
                          )}
                          {hotel.features?.includes("organic") && (
                            <Badge variant="secondary" className="text-xs">
                              🥬 Organic Food
                            </Badge>
                          )}
                          {hotel.features?.includes("water") && (
                            <Badge variant="secondary" className="text-xs">
                              💧 Water Conservation
                            </Badge>
                          )}
                        </div>

                        {/* Amenities */}
                        {hotel.amenities && (
                          <div className="text-xs text-muted-foreground">
                            {hotel.amenities.slice(0, 3).join(" • ")}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No hotels found for {dest.capital}. You can still proceed to plan activities.
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Navigation */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back to Destinations
            </Button>
            <Button
              onClick={handleNextStep}
              size="lg"
            >
              Continue to Activities
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Activity Planning (moved from Step 2) */}
      {step === 3 && (
        <div className="space-y-6">
          {/* Trip Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPinned className="h-5 w-5" />
                Your Trip: {destinations.map(d => d.country).join(" → ")}
              </CardTitle>
              <CardDescription>
                {goingDate && format(goingDate, "MMM d, yyyy")} - {returnDate && format(returnDate, "MMM d, yyyy")} ({tripDays} days)
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Day Tabs */}
          <Card>
            <CardHeader>
              <CardTitle>Plan Your Daily Activities</CardTitle>
              <CardDescription>Add activities for each day of your trip</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={currentDay.toString()} onValueChange={(v) => setCurrentDay(Number(v))}>
                <TabsList className="w-full overflow-x-auto flex-nowrap">
                  {Array.from({ length: tripDays }, (_, i) => i + 1).map((day) => (
                    <TabsTrigger key={day} value={day.toString()} className="flex-1 min-w-[100px]">
                      Day {day}
                      {activities[day]?.length > 0 && (
                        <Badge variant="secondary" className="ml-2">
                          {activities[day].length}
                        </Badge>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {Array.from({ length: tripDays }, (_, i) => i + 1).map((day) => (
                  <TabsContent key={day} value={day.toString()} className="space-y-4 mt-4">
                    {/* Add Activity Form */}
                    <div className="p-4 border rounded-lg bg-card space-y-4">
                      <h3 className="font-semibold flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add Activity
                      </h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Activity Name</Label>
                          <Input
                            placeholder="e.g., Visit Eiffel Tower"
                            value={newActivityName}
                            onChange={(e) => setNewActivityName(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Location</Label>
                          <div className="relative">
                            <Input
                              placeholder="e.g., Eiffel Tower or Champ de Mars"
                              value={newActivityLocation}
                              onChange={(e) => setNewActivityLocation(e.target.value)}
                              onBlur={() => {
                                // Delay hiding to allow click on suggestion
                                setTimeout(() => setShowSuggestions(false), 200)
                              }}
                              onFocus={() => {
                                if (locationSuggestions.length > 0) {
                                  setShowSuggestions(true)
                                }
                              }}
                            />
                            
                            {/* Autocomplete Dropdown */}
                            {showSuggestions && (
                              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                {isLoadingSuggestions ? (
                                  <div className="p-3 text-sm text-gray-500 text-center">
                                    🔍 Searching locations...
                                  </div>
                                ) : locationSuggestions.length > 0 ? (
                                  locationSuggestions.map((suggestion, index) => (
                                    <div
                                      key={index}
                                      onClick={() => selectSuggestion(suggestion)}
                                      className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-b-0 transition-colors"
                                    >
                                      <div className="text-sm font-medium text-gray-900">
                                        📍 {suggestion.display_name.split(',')[0]}
                                      </div>
                                      <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                                        {suggestion.display_name}
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="p-3 text-sm text-gray-500 text-center">
                                    No suggestions found
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            💡 Tip: Type at least 3 characters to see location suggestions
                          </p>
                        </div>

                        <div className="space-y-2">
                          <Label>Time</Label>
                          <Input
                            type="time"
                            value={newActivityTime}
                            onChange={(e) => setNewActivityTime(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Activity Type</Label>
                          <select
                            value={newActivityType}
                            onChange={(e) => setNewActivityType(e.target.value as Activity["type"])}
                            className="w-full h-10 px-3 rounded-md border border-input bg-background"
                          >
                            <option value="sightseeing">Sightseeing 👁️</option>
                            <option value="dining">Dining 🍽️</option>
                            <option value="adventure">Adventure 🏔️</option>
                            <option value="cultural">Cultural 🎭</option>
                            <option value="nature">Nature 🌿</option>
                          </select>
                        </div>
                      </div>

                      <Button
                        onClick={addActivity}
                        disabled={!newActivityName || !newActivityLocation || isCalculating}
                        className="w-full"
                      >
                        {isCalculating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Finding location...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Activity
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Activities List */}
                    {activities[day] && activities[day].length > 0 && (
                      <div className="space-y-2">
                        <h3 className="font-semibold flex items-center justify-between">
                          <span>Activities ({activities[day].length})</span>
                          <Badge variant="outline">
                            {getDayCarbon(day).toFixed(2)} kg CO₂
                          </Badge>
                        </h3>
                        
                        {activities[day].map((activity, index) => (
                          <div
                            key={activity.id}
                            className="flex items-start gap-3 p-3 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                          >
                            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
                              <span className="text-sm font-bold">{index + 1}</span>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold">{activity.name}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {activity.location}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {activity.time}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {activity.distance.toFixed(1)} km • {activity.carbonImpact.toFixed(2)} kg CO₂
                              </div>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeActivity(day, activity.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Map */}
                    <div className="space-y-2">
                      <h3 className="font-semibold flex items-center gap-2">
                        <MapPinned className="w-4 h-4" />
                        Day {day} Route Map
                      </h3>
                      {destinations[0] && (
                        <ActivityMap
                          center={[destinations[0].lat, destinations[0].lng]}
                          zoom={12}
                          markers={getMapMarkers}
                          route={getMapRoute}
                          height="400px"
                        />
                      )}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              Back to Hotels
            </Button>
            <Button onClick={handleNextStep} size="lg">
              Continue to Carbon Forecast
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Carbon Footprint Forecast & AI Optimization (moved from Step 3) */}
      {step === 4 && (
        <div className="space-y-6">
          {/* Loading State */}
          {isOptimizing && (
            <Card>
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <Loader2 className="w-16 h-16 animate-spin mx-auto text-primary" />
                  <h3 className="text-2xl font-bold">Calculating Carbon Footprint...</h3>
                  <p className="text-muted-foreground">
                    Analyzing your trip's environmental impact and generating optimization suggestions
                  </p>
                  <div className="flex items-center justify-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Calculating emissions
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPinned className="w-4 h-4 text-primary" />
                      Analyzing routes
                    </div>
                    <div className="flex items-center gap-2">
                      <Train className="w-4 h-4 text-primary" />
                      Finding alternatives
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Carbon Forecast Results */}
          {!isOptimizing && optimizationResult && (
            <>
              {/* Summary Card */}
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      💨 Carbon Footprint Forecast
                    </span>
                    <Badge
                      className={cn(
                        "text-white",
                        optimizationResult.summary?.rating.rating === "excellent" && "bg-green-500",
                        optimizationResult.summary?.rating.rating === "good" && "bg-blue-500",
                        optimizationResult.summary?.rating.rating === "average" && "bg-yellow-500",
                        optimizationResult.summary?.rating.rating === "poor" && "bg-orange-500",
                        optimizationResult.summary?.rating.rating === "critical" && "bg-red-500"
                      )}
                    >
                      {optimizationResult.summary?.rating.message}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {optimizationResult.tripType?.toUpperCase() || "TRIP"} trip • {optimizationResult.duration || 0} days • {optimizationResult.summary?.totalDestinations || 0} destinations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div className="p-4 bg-card border rounded-lg">
                      <div className="text-3xl font-bold text-primary">
                        {typeof optimizationResult.summary?.totalCarbon === 'number' 
                          ? optimizationResult.summary.totalCarbon.toLocaleString() 
                          : "N/A"}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">Total CO₂ (kg)</div>
                    </div>
                    <div className="p-4 bg-card border rounded-lg">
                      <div className="text-3xl font-bold text-primary">
                        {typeof optimizationResult.summary?.carbonPerDay === 'number'
                          ? optimizationResult.summary.carbonPerDay.toFixed(1)
                          : "N/A"}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">CO₂ per Day (kg)</div>
                    </div>
                    <div className="p-4 bg-card border rounded-lg">
                      <div className="text-3xl font-bold text-primary">
                        {typeof optimizationResult.summary?.averageSustainabilityScore === 'number'
                          ? optimizationResult.summary.averageSustainabilityScore
                          : "N/A"}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">Eco Score</div>
                    </div>
                    <div className="p-4 bg-card border rounded-lg">
                      <div className="text-3xl font-bold text-primary">
                        {typeof optimizationResult.benchmark?.goodThreshold === 'number'
                          ? optimizationResult.benchmark.goodThreshold.toLocaleString()
                          : "N/A"}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">Benchmark (kg)</div>
                    </div>
                  </div>

                  {/* Benchmark Info */}
                  <div className="mt-4 p-4 bg-muted rounded-lg">
                    <p className="text-sm">
                      <strong>💡 Recommendation:</strong> {optimizationResult.benchmark?.recommendation || "Optimize your trip for lower carbon emissions"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Optimization Suggestions */}
              {optimizationResult.optimizations && optimizationResult.optimizations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Optimization Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {optimizationResult.optimizations.map((suggestion: any, index: number) => (
                      <div
                        key={index}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-lg border",
                          suggestion.priority === "high" && "bg-red-50 border-red-200 dark:bg-red-950/20",
                          suggestion.priority === "medium" && "bg-yellow-50 border-yellow-200 dark:bg-yellow-950/20",
                          suggestion.priority === "low" && "bg-blue-50 border-blue-200 dark:bg-blue-950/20"
                        )}
                      >
                        <span className="text-2xl">{suggestion.icon}</span>
                        <div className="flex-1">
                          <div className="font-semibold">{suggestion.message}</div>
                          {suggestion.savings && (
                            <div className="text-sm text-muted-foreground mt-1">
                              Potential savings: {suggestion.savings}kg CO₂
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Itinerary Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Day-by-Day Itinerary</CardTitle>
                  <CardDescription>AI-optimized route with eco-friendly options</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {optimizationResult.itinerary?.map((day: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4 space-y-4">
                      {/* Destination Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-bold flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-primary" />
                            {day.destination}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(day.startDate), "MMM d")} - {format(new Date(day.endDate), "MMM d")} ({day.duration} days)
                          </p>
                        </div>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {day.sustainabilityScore}/100
                        </Badge>
                      </div>

                      {/* Transport Mode Selection */}
                      {day.transport && (
                        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                          <h4 className="font-semibold text-sm">🚆 Transport to {day.destination}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{day.transport.icon}</span>
                            <div className="flex-1">
                              <div className="font-semibold">{day.transport.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {day.transport.description} • {day.transportCarbon}kg CO₂
                              </div>
                            </div>
                            <Badge className="bg-green-500 text-white">
                              Recommended
                            </Badge>
                          </div>
                        </div>
                      )}

                      {/* Hotel Selection */}
                      {day.accommodationSuggestions && day.accommodationSuggestions.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm flex items-center gap-2">
                            <MapPinned className="w-4 h-4" />
                            Recommended Hotels ({day.accommodationCarbon}kg CO₂)
                          </h4>
                          <div className="grid gap-2">
                            {day.accommodationSuggestions.slice(0, 3).map((hotel: any, hotelIndex: number) => (
                              <div
                                key={hotelIndex}
                                className={cn(
                                  "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                                  selectedHotelsForTrip[index]?.name === hotel.name
                                    ? "bg-primary/10 border-primary"
                                    : "bg-card hover:bg-accent"
                                )}
                                onClick={() => setSelectedHotelsForTrip({ ...selectedHotelsForTrip, [index]: hotel })}
                              >
                                <div className="w-10 h-10 bg-primary/20 rounded flex items-center justify-center shrink-0">
                                  <span className="text-lg">🏨</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-semibold">{hotel.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {hotel.location?.city || "City Center"} • ${hotel.pricePerNight}/night
                                  </div>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      <Star className="w-3 h-3 mr-1" />
                                      {hotel.sustainabilityScore}/100
                                    </Badge>
                                    {hotel.features?.includes("solar") && (
                                      <span className="text-xs">☀️ Solar</span>
                                    )}
                                    {hotel.features?.includes("recycling") && (
                                      <span className="text-xs">♻️ Recycling</span>
                                    )}
                                  </div>
                                </div>
                                {selectedHotelsForTrip[index]?.name === hotel.name && (
                                  <div className="text-primary">✓</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Suggested Activities */}
                      {day.activities && day.activities.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-sm flex items-center gap-2">
                            🎯 Suggested Activities ({day.activityCarbon}kg CO₂)
                          </h4>
                          <div className="grid grid-cols-2 gap-2">
                            {day.activities.slice(0, 4).map((activity: any, actIndex: number) => (
                              <div key={actIndex} className="flex items-start gap-2 p-2 border rounded-lg bg-card">
                                <span className="text-xl">{activity.icon}</span>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm">{activity.name}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {activity.duration}h • {(activity.carbonPerHour * activity.duration).toFixed(1)}kg CO₂
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Carbon Summary */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-sm font-semibold">Total Carbon for this destination:</span>
                        <Badge variant="outline" className="text-base">
                          {day.totalCarbon} kg CO₂
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Navigation */}
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(3)}>
                  Back to Activities
                </Button>
                <Button onClick={handleNextStep} size="lg">
                  Review & Save
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Step 5: Review & Save */}
      {step === 5 && (
        <div className="space-y-6">
          {/* Trip Summary Header */}
          <Card className="border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">🎉 Your Eco-Friendly Trip is Ready!</CardTitle>
                  <CardDescription className="mt-2">
                    Review your trip details and save to your dashboard
                  </CardDescription>
                </div>
                <Badge className="bg-green-500 text-white text-lg px-4 py-2">
                  {optimizationResult?.summary?.rating?.message || "Eco Trip"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-card border rounded-lg">
                  <div className="text-3xl mb-2">🌍</div>
                  <div className="text-2xl font-bold text-primary">
                    {destinations.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Destination{destinations.length !== 1 ? 's' : ''}</div>
                </div>
                <div className="text-center p-4 bg-card border rounded-lg">
                  <div className="text-3xl mb-2">📅</div>
                  <div className="text-2xl font-bold text-primary">
                    {optimizationResult?.duration || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Days</div>
                </div>
                <div className="text-center p-4 bg-card border rounded-lg">
                  <div className="text-3xl mb-2">💨</div>
                  <div className="text-2xl font-bold text-primary">
                    {typeof optimizationResult?.summary?.totalCarbon === 'number' 
                      ? optimizationResult.summary.totalCarbon.toLocaleString() 
                      : "0"}
                  </div>
                  <div className="text-sm text-muted-foreground">kg CO₂</div>
                </div>
                <div className="text-center p-4 bg-card border rounded-lg">
                  <div className="text-3xl mb-2">🌿</div>
                  <div className="text-2xl font-bold text-primary">
                    {optimizationResult?.summary?.averageSustainabilityScore || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Eco Score</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* World Map with Route */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPinned className="h-5 w-5" />
                Your Trip Route
              </CardTitle>
              <CardDescription>
                Visual overview of your destinations and activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 dark:from-blue-950 dark:via-green-950 dark:to-blue-950 rounded-lg border-2 border-primary/20 relative overflow-hidden">
                {/* Decorative background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-10 left-10 w-32 h-32 border-2 border-primary rounded-full"></div>
                  <div className="absolute top-20 right-20 w-24 h-24 border-2 border-green-500 rounded-full"></div>
                  <div className="absolute bottom-10 left-1/3 w-40 h-40 border-2 border-blue-500 rounded-full"></div>
                </div>

                {/* Content */}
                <div className="relative h-full flex flex-col items-center justify-center p-6 space-y-6">
                  {/* Route visualization */}
                  <div className="flex items-center gap-4 flex-wrap justify-center">
                    {destinations.map((dest, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="flex flex-col items-center">
                          <div className="w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-lg">
                            {dest.capital.charAt(0)}
                          </div>
                          <div className="text-sm font-semibold mt-2">{dest.capital}</div>
                          <div className="text-xs text-muted-foreground">{dest.country}</div>
                        </div>
                        {idx < destinations.length - 1 && (
                          <ArrowRight className="w-6 h-6 text-primary" />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                    <div className="grid grid-cols-3 gap-6 text-center">
                      <div>
                        <div className="text-2xl font-bold text-primary">{destinations.length}</div>
                        <div className="text-xs text-muted-foreground">Destination{destinations.length !== 1 ? 's' : ''}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{Object.values(selectedHotelsForTrip).filter(Boolean).length}</div>
                        <div className="text-xs text-muted-foreground">Hotel{Object.values(selectedHotelsForTrip).filter(Boolean).length !== 1 ? 's' : ''}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-orange-600">{Object.values(activities).flat().length}</div>
                        <div className="text-xs text-muted-foreground">Activit{Object.values(activities).flat().length !== 1 ? 'ies' : 'y'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-primary"></div>
                      <span>Destinations</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span>Hotels</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      <span>Activities</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trip Details */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            {/* Itinerary Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Itinerary Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {optimizationResult?.itinerary?.map((day: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 border rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{day.destination}</div>
                      <div className="text-sm text-muted-foreground">
                        {day.duration} day{day.duration !== 1 ? 's' : ''} • {day.activities?.length || 0} activit{day.activities?.length !== 1 ? 'ies' : 'y'}
                      </div>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          💨 {day.totalCarbon} kg CO₂
                        </Badge>
                        <Badge variant="outline" className="text-xs bg-green-500/10">
                          ⭐ {day.sustainabilityScore}/100
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Selected Hotels */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPinned className="h-5 w-5" />
                  Selected Hotels
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.values(selectedHotelsForTrip).filter(Boolean).map((hotel: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 border rounded-lg">
                    <div className="w-12 h-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center shrink-0 text-xl">
                      🏨
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{hotel.name}</div>
                      <div className="text-sm text-muted-foreground">
                        📍 {hotel.location?.city || hotel.location?.address?.city || "City"} • 💵 ${hotel.pricePerNight}/night
                      </div>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant="outline" className="text-xs bg-green-500/10">
                          ⭐ {hotel.sustainabilityScore}/100
                        </Badge>
                        <div className="flex gap-1">
                          {hotel.features?.map((feature: string) => (
                            <span key={feature} className="text-base" title={feature}>
                              {feature === "solar" && "☀️"}
                              {feature === "recycling" && "♻️"}
                              {feature === "organic" && "🥬"}
                              {feature === "water" && "💧"}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {Object.values(selectedHotelsForTrip).filter(Boolean).length === 0 && (
                  <div className="text-center text-muted-foreground py-8 bg-muted/30 rounded-lg border-2 border-dashed">
                    <div className="text-4xl mb-2">🏨</div>
                    <div>No hotels selected</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Save Trip Section */}
          <Card className="border-primary mt-8">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-green-500/5">
              <CardTitle className="flex items-center gap-2">
                <Save className="h-5 w-5" />
                Save Your Trip
              </CardTitle>
              <CardDescription>
                Give your trip a name and save it to your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Trip Title</label>
                <Input
                  placeholder="e.g., Summer Adventure in Europe"
                  value={tripTitle}
                  onChange={(e) => setTripTitle(e.target.value)}
                  className="text-lg"
                />
              </div>

              {savedTripId && (
                <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">✅</div>
                    <div className="flex-1">
                      <div className="font-semibold text-green-900 dark:text-green-100">
                        Trip Saved Successfully!
                      </div>
                      <div className="text-sm text-green-700 dark:text-green-300 mt-1">
                        Your trip has been saved to your dashboard. You can view and edit it anytime.
                      </div>
                      {shareCode && (
                        <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded border">
                          <div className="text-xs text-muted-foreground mb-1">Share Code:</div>
                          <div className="font-mono font-bold text-lg">{shareCode}</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={saveTrip}
                  disabled={isSaving || !tripTitle.trim() || savedTripId !== null}
                  size="lg"
                  className="flex-1"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : savedTripId ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Saved
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Trip
                    </>
                  )}
                </Button>
                {savedTripId && (
                  <Button
                    variant="outline"
                    size="lg"
                    asChild
                  >
                    <Link href="/dashboard/trips">
                      View in Dashboard
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(4)}>
              Back to Carbon Forecast
            </Button>
            {savedTripId && (
              <Button asChild size="lg">
                <Link href="/dashboard/trips">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
