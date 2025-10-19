import { AlertTriangle, MapPin, ArrowRight, CheckCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function CrisisAlertsPage() {
  const activeAlerts = [
    {
      id: "1",
      type: "natural-disaster",
      severity: "high",
      title: "Tropical Storm Warning",
      description: "Tropical Storm Elena is approaching the Caribbean coast. Travelers should monitor conditions.",
      affectedDestinations: ["Cancún", "Playa del Carmen", "Tulum"],
      timestamp: "2025-01-18T10:00:00Z",
      alternatives: ["Oaxaca", "Mexico City", "Guadalajara"],
      recommendations: [
        "Monitor local weather updates",
        "Keep emergency contacts handy",
        "Consider postponing beach activities",
      ],
    },
    {
      id: "2",
      type: "infrastructure",
      severity: "medium",
      title: "Airport Delays Expected",
      description: "Major construction at Oslo Airport may cause delays for international flights.",
      affectedDestinations: ["Oslo"],
      timestamp: "2025-01-17T14:30:00Z",
      alternatives: ["Bergen", "Stavanger"],
      recommendations: ["Arrive 3 hours early", "Check flight status before departure", "Consider train alternatives"],
    },
  ]

  const resolvedAlerts = [
    {
      id: "3",
      type: "health",
      severity: "low",
      title: "Health Advisory Lifted",
      description: "Water quality issues in San José have been resolved.",
      affectedDestinations: ["San José"],
      timestamp: "2025-01-15T09:00:00Z",
      resolvedAt: "2025-01-17T12:00:00Z",
    },
  ]

  const severityColors = {
    critical: "bg-red-500",
    high: "bg-orange-500",
    medium: "bg-yellow-500",
    low: "bg-blue-500",
  }

  const typeIcons = {
    "natural-disaster": "🌪️",
    political: "⚠️",
    health: "🏥",
    infrastructure: "🚧",
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Crisis Alerts & Travel Advisories</h1>
        <p className="text-muted-foreground">Stay informed about conditions affecting your destinations</p>
      </div>

      {/* Summary */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Active Alerts</span>
            <AlertTriangle className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-foreground">{activeAlerts.length}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Affected Trips</span>
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">1</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Resolved Today</span>
            <CheckCircle className="w-5 h-5 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">{resolvedAlerts.length}</div>
        </Card>
      </div>

      {/* Alerts */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">Active Alerts</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="subscriptions">My Subscriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6 space-y-4">
          {activeAlerts.map((alert) => (
            <Card key={alert.id} className="p-6">
              <div className="flex items-start gap-4">
                <div className="text-3xl">{typeIcons[alert.type]}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">{alert.title}</h3>
                        <Badge className={`${severityColors[alert.severity]} text-white border-0`}>
                          {alert.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{alert.description}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Affected Destinations</h4>
                      <div className="flex flex-wrap gap-2">
                        {alert.affectedDestinations.map((dest) => (
                          <Badge key={dest} variant="outline" className="text-xs">
                            <MapPin className="w-3 h-3 mr-1" />
                            {dest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-2">Alternative Destinations</h4>
                      <div className="flex flex-wrap gap-2">
                        {alert.alternatives.map((alt) => (
                          <Badge
                            key={alt}
                            variant="outline"
                            className="text-xs bg-primary/5 text-primary border-primary/20"
                          >
                            {alt}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-surface p-4 rounded-lg mb-4">
                    <h4 className="text-sm font-semibold text-foreground mb-2">Recommendations</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {alert.recommendations.map((rec, index) => (
                        <li key={index}>• {rec}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button size="sm" className="bg-primary hover:bg-primary-dark text-white">
                      View Eco-Friendly Alternatives
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                    <Button size="sm" variant="outline">
                      Modify Trip
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="resolved" className="mt-6 space-y-4">
          {resolvedAlerts.map((alert) => (
            <Card key={alert.id} className="p-6 opacity-60">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-primary" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-foreground">{alert.title}</h3>
                    <Badge className="bg-primary/10 text-primary border-0">Resolved</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                  <div className="text-xs text-muted-foreground">
                    Resolved on {new Date(alert.resolvedAt!).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="subscriptions" className="mt-6">
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-4">Alert Subscriptions</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get notified about alerts affecting your upcoming trips and favorite destinations
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
                <div>
                  <div className="font-medium text-foreground">Costa Rica Adventure</div>
                  <div className="text-xs text-muted-foreground">March 15 - 22, 2025</div>
                </div>
                <Badge className="bg-primary/10 text-primary border-0">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
                <div>
                  <div className="font-medium text-foreground">Nordic Escape</div>
                  <div className="text-xs text-muted-foreground">April 10 - 17, 2025</div>
                </div>
                <Badge className="bg-primary/10 text-primary border-0">Active</Badge>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
