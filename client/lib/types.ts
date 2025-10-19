// Core types for the Travearth application

export interface Destination {
  id: string
  name: string
  country: string
  coordinates: {
    lat: number
    lng: number
  }
  sustainabilityScore: number
  description: string
  imageUrl: string
}

export interface Activity {
  id: string
  name: string
  type: "sightseeing" | "adventure" | "cultural" | "nature" | "food"
  destinationId: string
  carbonFootprint: number // kg CO2
  sustainabilityScore: number
  duration: number // hours
  price: number
  description: string
  ecoTips: string[]
}

export interface Hotel {
  id: string
  name: string
  destinationId: string
  sustainabilityScore: number
  certifications: string[]
  amenities: string[]
  pricePerNight: number
  carbonFootprintPerNight: number // kg CO2
  coordinates: {
    lat: number
    lng: number
  }
  imageUrl: string
  description: string
}

export interface Flight {
  id: string
  from: string
  to: string
  carbonFootprint: number // kg CO2
  price: number
  duration: number // hours
  airline: string
  class: "economy" | "business" | "first"
}

export interface TripPlan {
  id: string
  userId: string
  name: string
  startDate: string
  endDate: string
  destinations: Destination[]
  activities: Activity[]
  hotels: Hotel[]
  flights: Flight[]
  predictedCarbonFootprint: number
  actualCarbonFootprint?: number
  sustainabilityScore: number
  status: "planning" | "active" | "completed"
  collaborators?: string[]
  shareCode?: string
}

export interface UserProfile {
  id: string
  name: string
  email: string
  ecoScore: number
  badges: Badge[]
  totalTrips: number
  totalCarbonSaved: number
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  earnedAt: string
  category: "carbon" | "explorer" | "resilience" | "community"
}

export interface CarbonFootprintData {
  predicted: number
  actual: number
  breakdown: {
    flights: number
    accommodation: number
    activities: number
    transportation: number
  }
  comparison: "better" | "worse" | "equal"
  percentageDifference: number
}

export interface EcoRecommendation {
  id: string
  type: "tip" | "alternative" | "warning"
  title: string
  description: string
  impact: "high" | "medium" | "low"
  category: string
}

export interface CrisisAlert {
  id: string
  type: "natural-disaster" | "political" | "health" | "infrastructure"
  severity: "critical" | "high" | "medium" | "low"
  affectedDestinations: string[]
  title: string
  description: string
  alternatives: string[]
  timestamp: string
}
