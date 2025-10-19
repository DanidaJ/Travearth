"use client"

import { useState, useCallback } from "react"
import { APIClient } from "@/lib/api-client"

export interface FlightOffer {
  id: string
  price: {
    total: number
    currency: string
  }
  airline: string
  flight: {
    number: string
    departure: {
      airport: string
      time: string
    }
    arrival: {
      airport: string
      time: string
    }
    duration: string
    cabin: string
  }
  carbon: {
    weight: number
    unit: string
  }
  numberOfStops: number
  validatingAirline: string
}

export interface FlightSearchParams {
  origin: string
  destination: string
  departureDate: string
  adults?: number
  travelClass?: "ECONOMY" | "BUSINESS"
}

export interface MultiCityRoute {
  origin: string
  destination: string
  date: string
}

export function useFlights() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [flightOffers, setFlightOffers] = useState<FlightOffer[]>([])

  const searchFlights = useCallback(async (params: FlightSearchParams) => {
    setLoading(true)
    setError(null)
    
    try {
      const response: any = await APIClient.searchFlights(params)
      
      if (response.success) {
        setFlightOffers(response.data)
        return response.data
      } else {
        setError(response.error || "Failed to search flights")
        return []
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while searching flights")
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const searchMultiCity = useCallback(async (
    routes: MultiCityRoute[],
    adults = 1,
    travelClass: "ECONOMY" | "BUSINESS" = "ECONOMY"
  ) => {
    setLoading(true)
    setError(null)
    
    try {
      const response: any = await APIClient.searchMultiCityFlights({
        routes,
        adults,
        travelClass,
      })
      
      if (response.success) {
        return response.data
      } else {
        setError(response.error || "Failed to search multi-city flights")
        return []
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while searching flights")
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  const searchAirports = useCallback(async (keyword: string) => {
    try {
      const response: any = await APIClient.searchAirports(keyword)
      
      if (response.success) {
        return response.data
      } else {
        return []
      }
    } catch (err) {
      return []
    }
  }, [])

  const getAirlineInfo = useCallback(async (code: string) => {
    try {
      const response: any = await APIClient.getAirlineInfo(code)
      
      if (response.success) {
        return response.data
      } else {
        return null
      }
    } catch (err) {
      return null
    }
  }, [])

  return {
    loading,
    error,
    flightOffers,
    searchFlights,
    searchMultiCity,
    searchAirports,
    getAirlineInfo,
  }
}
