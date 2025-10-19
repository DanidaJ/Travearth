"use client"

import { useState, useEffect } from "react"
import { MapPin, TrendingDown, Navigation } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface RealTimeTrackerProps {
  onCarbonUpdate?: (carbon: number) => void
}

export function RealTimeTracker({ onCarbonUpdate }: RealTimeTrackerProps) {
  const [isTracking, setIsTracking] = useState(false)
  const [currentCarbon, setCurrentCarbon] = useState(0)
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)

  useEffect(() => {
    if (isTracking && "geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          // Simulate carbon calculation based on movement
          setCurrentCarbon((prev) => {
            const newCarbon = prev + Math.random() * 0.5
            // Notify parent component of carbon update
            if (onCarbonUpdate) {
              onCarbonUpdate(newCarbon)
            }
            return newCarbon
          })
        },
        (error) => {
          console.error("Error getting location:", error)
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 5000,
        },
      )

      return () => navigator.geolocation.clearWatch(watchId)
    }
  }, [isTracking, onCarbonUpdate])

  const toggleTracking = () => {
    setIsTracking(!isTracking)
    if (!isTracking) {
      setCurrentCarbon(0)
      // Reset parent carbon value when stopping
      if (onCarbonUpdate) {
        onCarbonUpdate(0)
      }
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Real-Time Tracking</h3>
        <Button
          onClick={toggleTracking}
          variant={isTracking ? "destructive" : "default"}
          size="sm"
          className={isTracking ? "" : "bg-primary hover:bg-primary-dark text-white"}
        >
          <Navigation className="w-4 h-4 mr-2" />
          {isTracking ? "Stop Tracking" : "Start Tracking"}
        </Button>
      </div>

      {isTracking ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-primary animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-muted-foreground">Current Emissions</div>
              <div className="text-2xl font-bold text-foreground">{currentCarbon.toFixed(2)} kg CO₂</div>
            </div>
          </div>

          {location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>
                Tracking at {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
              </span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Daily Budget</span>
              <span className="text-foreground font-medium">{currentCarbon.toFixed(2)} / 65 kg</span>
            </div>
            <Progress value={(currentCarbon / 65) * 100} className="h-2" />
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Navigation className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Start tracking to monitor your real-time carbon emissions</p>
        </div>
      )}
    </Card>
  )
}
