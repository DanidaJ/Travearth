"use client"

import { useState, useEffect, useCallback } from "react"
import { MapPin, Activity, TrendingUp, Pause, Play } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface GPSPosition {
  latitude: number
  longitude: number
  timestamp: number
  accuracy: number
}

interface GPSTrackerProps {
  tripId: string
  predictedCarbon: number
  onUpdate?: (data: { distance: number; carbon: number; positions: GPSPosition[] }) => void
}

export function GPSTracker({ tripId, predictedCarbon, onUpdate }: GPSTrackerProps) {
  const [isTracking, setIsTracking] = useState(false)
  const [positions, setPositions] = useState<GPSPosition[]>([])
  const [totalDistance, setTotalDistance] = useState(0)
  const [actualCarbon, setActualCarbon] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Haversine formula to calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180)
    const dLon = (lon2 - lon1) * (Math.PI / 180)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  // Calculate carbon footprint based on distance (simplified model)
  const calculateCarbon = (distanceKm: number): number => {
    // Average: 0.12 kg CO2 per km (varies by transport mode)
    return distanceKm * 0.12
  }

  const updateTracking = useCallback((position: GeolocationPosition) => {
    const newPosition: GPSPosition = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      timestamp: position.timestamp,
      accuracy: position.coords.accuracy,
    }

    setPositions((prev) => {
      const updated = [...prev, newPosition]
      
      // Calculate total distance
      if (updated.length > 1) {
        const lastPos = updated[updated.length - 2]
        const newDistance = calculateDistance(
          lastPos.latitude,
          lastPos.longitude,
          newPosition.latitude,
          newPosition.longitude
        )
        
        setTotalDistance((prevDist) => {
          const updatedDist = prevDist + newDistance
          const updatedCarbon = calculateCarbon(updatedDist)
          setActualCarbon(updatedCarbon)
          
          // Call the update callback
          if (onUpdate) {
            onUpdate({
              distance: updatedDist,
              carbon: updatedCarbon,
              positions: updated,
            })
          }
          
          return updatedDist
        })
      }
      
      return updated
    })
  }, [onUpdate])

  const handleError = (error: GeolocationPositionError) => {
    setError(error.message)
    setIsTracking(false)
  }

  const startTracking = () => {
    if ("geolocation" in navigator) {
      setError(null)
      setIsTracking(true)
      
      // Get initial position
      navigator.geolocation.getCurrentPosition(updateTracking, handleError)
      
      // Watch position changes
      const watchId = navigator.geolocation.watchPosition(updateTracking, handleError, {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 5000,
      })
      
      // Store watchId for cleanup
      return () => navigator.geolocation.clearWatch(watchId)
    } else {
      setError("Geolocation is not supported by your browser")
    }
  }

  const stopTracking = () => {
    setIsTracking(false)
  }

  const carbonComparison = predictedCarbon > 0 
    ? ((actualCarbon - predictedCarbon) / predictedCarbon) * 100 
    : 0

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Real-Time Carbon Tracking
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Track your actual carbon footprint as you travel
            </p>
          </div>
          <Button
            onClick={isTracking ? stopTracking : startTracking}
            variant={isTracking ? "destructive" : "default"}
            size="sm"
          >
            {isTracking ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start
              </>
            )}
          </Button>
        </div>

        {/* Status */}
        {isTracking && (
          <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-foreground">Tracking active</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <MapPin className="w-4 h-4" />
              Distance Traveled
            </div>
            <div className="text-2xl font-bold text-foreground">
              {totalDistance.toFixed(2)} <span className="text-sm font-normal">km</span>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <TrendingUp className="w-4 h-4" />
              Actual Carbon
            </div>
            <div className="text-2xl font-bold text-foreground">
              {actualCarbon.toFixed(1)} <span className="text-sm font-normal">kg CO₂</span>
            </div>
          </div>
        </div>

        {/* Comparison */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">vs Predicted</span>
            <Badge variant={carbonComparison <= 0 ? "default" : "destructive"}>
              {carbonComparison > 0 ? "+" : ""}
              {carbonComparison.toFixed(1)}%
            </Badge>
          </div>
          <Progress 
            value={Math.min((actualCarbon / predictedCarbon) * 100, 100)} 
            className="h-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0 kg</span>
            <span>{predictedCarbon} kg (predicted)</span>
          </div>
        </div>

        {/* Data Points */}
        <div className="text-xs text-muted-foreground">
          <span>{positions.length} GPS data points collected</span>
          {positions.length > 0 && (
            <span className="ml-2">
              • Last update: {new Date(positions[positions.length - 1].timestamp).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}
