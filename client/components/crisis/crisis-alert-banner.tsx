"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, X, Info, MapPin, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CrisisAlert } from "@/lib/types"
import Link from "next/link"

interface CrisisAlertBannerProps {
  destinationIds?: string[]
  className?: string
}

export function CrisisAlertBanner({ destinationIds = [], className = "" }: CrisisAlertBannerProps) {
  const [alerts, setAlerts] = useState<CrisisAlert[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock crisis alerts - replace with actual API call
    const mockAlerts: CrisisAlert[] = [
      {
        id: "crisis-1",
        type: "natural-disaster",
        severity: "high",
        affectedDestinations: ["costa-rica", "nicaragua"],
        title: "Volcanic Activity Alert",
        description: "Increased volcanic activity detected in Central America. Consider alternative destinations or postpone travel.",
        alternatives: ["Panama", "Colombia", "Ecuador"],
        timestamp: new Date().toISOString(),
      },
      {
        id: "crisis-2",
        type: "infrastructure",
        severity: "medium",
        affectedDestinations: ["norway", "sweden"],
        title: "Transportation Disruption",
        description: "Railway maintenance affecting Nordic travel routes. Plan for alternative transportation.",
        alternatives: ["Local bus services", "Rental vehicles", "Domestic flights"],
        timestamp: new Date().toISOString(),
      },
    ]

    // Filter alerts based on destination IDs
    const relevantAlerts = destinationIds.length > 0
      ? mockAlerts.filter(alert => 
          alert.affectedDestinations.some(dest => destinationIds.includes(dest))
        )
      : mockAlerts

    setAlerts(relevantAlerts)
    setLoading(false)
  }, [destinationIds])

  const dismissAlert = (alertId: string) => {
    setDismissed(prev => new Set(prev).add(alertId))
  }

  const visibleAlerts = alerts.filter(alert => !dismissed.has(alert.id))

  if (loading || visibleAlerts.length === 0) {
    return null
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "high":
        return "destructive"
      case "medium":
        return "default"
      default:
        return "secondary"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "natural-disaster":
        return "🌋"
      case "political":
        return "⚠️"
      case "health":
        return "🏥"
      case "infrastructure":
        return "🚧"
      default:
        return "ℹ️"
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {visibleAlerts.map((alert) => (
        <Alert key={alert.id} variant={getSeverityColor(alert.severity) as any} className="relative">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="flex items-center gap-2 pr-8">
            <span>{getTypeIcon(alert.type)}</span>
            <span>{alert.title}</span>
            <Badge variant={getSeverityColor(alert.severity) as any} className="ml-2">
              {alert.severity.toUpperCase()}
            </Badge>
          </AlertTitle>
          <AlertDescription className="mt-2 space-y-3">
            <p>{alert.description}</p>
            
            {alert.alternatives.length > 0 && (
              <div className="mt-3 p-3 bg-background/50 rounded-lg">
                <div className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Info className="w-4 h-4" />
                  <span>Recommended Alternatives:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {alert.alternatives.map((alt, index) => (
                    <Badge key={index} variant="outline" className="gap-1">
                      <MapPin className="w-3 h-3" />
                      {alt}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" className="gap-2" asChild>
                <Link href="/dashboard/alerts">
                  <ArrowRight className="w-4 h-4" />
                  View Safe Alternatives
                </Link>
              </Button>
              <span className="text-xs text-muted-foreground ml-auto">
                {new Date(alert.timestamp).toLocaleString()}
              </span>
            </div>
          </AlertDescription>
          
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2"
            onClick={() => dismissAlert(alert.id)}
          >
            <X className="w-4 h-4" />
          </Button>
        </Alert>
      ))}
    </div>
  )
}
