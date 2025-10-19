"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from "react-leaflet"
import { Icon, LatLngExpression } from "leaflet"
import "leaflet/dist/leaflet.css"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Leaf, AlertTriangle } from "lucide-react"

interface Location {
  id: string
  name: string
  coordinates: {
    lat: number
    lng: number
  }
  sustainabilityScore: number
  type: "destination" | "hotel" | "activity" | "heritage"
  futureRisk?: "low" | "medium" | "high"
  futureDescription?: string
}

interface TripMapProps {
  locations: Location[]
  center?: { lat: number; lng: number }
  zoom?: number
  showTimePort?: boolean
  className?: string
}

export function TripMap({ 
  locations, 
  center = { lat: 20, lng: 0 }, 
  zoom = 3,
  showTimePort = false,
  className = ""
}: TripMapProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Card className={`flex items-center justify-center h-[400px] bg-muted ${className}`}>
        <p className="text-muted-foreground">Loading map...</p>
      </Card>
    )
  }

  // Create custom icons
  const createIcon = (color: string, type: string) => {
    const iconHtml = `
      <div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
        <span style="color: white; font-size: 16px;">${type === 'destination' ? '📍' : type === 'hotel' ? '🏨' : type === 'heritage' ? '🏛️' : '🎯'}</span>
      </div>
    `
    return new Icon({
      iconUrl: `data:image/svg+xml;utf8,${encodeURIComponent(iconHtml)}`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
      className: 'custom-marker-icon'
    })
  }

  const getIconColor = (score: number) => {
    if (score >= 80) return '#10b981'
    if (score >= 60) return '#f59e0b'
    return '#ef4444'
  }

  const getRiskColor = (risk?: string) => {
    if (risk === 'high') return '#ef4444'
    if (risk === 'medium') return '#f59e0b'
    return '#10b981'
  }

  // Calculate route polyline coordinates
  const routeCoordinates: LatLngExpression[] = locations
    .filter(loc => loc.type === 'destination')
    .map(loc => [loc.coordinates.lat, loc.coordinates.lng])

  return (
    <Card className={`overflow-hidden ${className}`}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={zoom}
        style={{ height: '100%', width: '100%', minHeight: '400px' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Route line between destinations */}
        {routeCoordinates.length > 1 && (
          <Polyline
            positions={routeCoordinates}
            color="#10b981"
            weight={3}
            opacity={0.7}
            dashArray="10, 10"
          />
        )}

        {/* Location markers */}
        {locations.map((location) => (
          <Marker
            key={location.id}
            position={[location.coordinates.lat, location.coordinates.lng]}
            icon={createIcon(getIconColor(location.sustainabilityScore), location.type)}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <div className="font-semibold text-sm mb-2">{location.name}</div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">
                    <Leaf className="w-3 h-3 mr-1" />
                    Score: {location.sustainabilityScore}
                  </Badge>
                </div>
                
                {showTimePort && location.futureRisk && (
                  <div className="mt-2 pt-2 border-t">
                    <div className="text-xs font-medium mb-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" style={{ color: getRiskColor(location.futureRisk) }} />
                      TimePort 2050:
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {location.futureDescription || 
                        `${location.futureRisk.toUpperCase()} risk of environmental impact`}
                    </p>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* TimePort visualization - show risk circles */}
        {showTimePort && locations.map((location) => (
          location.futureRisk && (
            <Circle
              key={`risk-${location.id}`}
              center={[location.coordinates.lat, location.coordinates.lng]}
              radius={50000}
              pathOptions={{
                color: getRiskColor(location.futureRisk),
                fillColor: getRiskColor(location.futureRisk),
                fillOpacity: 0.1,
                weight: 2,
              }}
            />
          )
        ))}
      </MapContainer>
    </Card>
  )
}
