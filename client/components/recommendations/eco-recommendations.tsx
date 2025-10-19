"use client"

import { Lightbulb, TrendingDown, AlertCircle, ArrowRight, Leaf, Building2, Car } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { EcoRecommendation } from "@/lib/types"

interface EcoRecommendationsProps {
  recommendations: EcoRecommendation[]
  onApply?: (recommendationId: string) => void
}

export function EcoRecommendations({ recommendations, onApply }: EcoRecommendationsProps) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "tip":
        return <Lightbulb className="w-5 h-5 text-yellow-500" />
      case "alternative":
        return <TrendingDown className="w-5 h-5 text-green-500" />
      case "warning":
        return <AlertCircle className="w-5 h-5 text-orange-500" />
      default:
        return <Lightbulb className="w-5 h-5" />
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      case "medium":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
      case "low":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      default:
        return "bg-muted"
    }
  }

  const getCategoryIcon = (category: string) => {
    if (category.includes("transport")) return <Car className="w-4 h-4" />
    if (category.includes("hotel") || category.includes("accommodation")) return <Building2 className="w-4 h-4" />
    return <Leaf className="w-4 h-4" />
  }

  const groupedRecommendations = recommendations.reduce((acc, rec) => {
    if (!acc[rec.type]) acc[rec.type] = []
    acc[rec.type].push(rec)
    return acc
  }, {} as Record<string, EcoRecommendation[]>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Leaf className="w-5 h-5 text-primary" />
          Eco-Friendly Recommendations
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Personalized suggestions to reduce your carbon footprint
        </p>
      </div>

      {/* Alternatives */}
      {groupedRecommendations.alternative && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="w-4 h-4 text-green-500" />
            <h4 className="font-medium text-sm">Lower Carbon Alternatives</h4>
          </div>
          <div className="space-y-3">
            {groupedRecommendations.alternative.map((rec) => (
              <Card key={rec.id} className="p-4 border-l-4 border-l-green-500">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="font-semibold text-foreground">{rec.title}</h5>
                      <Badge className={getImpactColor(rec.impact)} variant="outline">
                        {rec.impact.toUpperCase()} impact
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{rec.description}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs gap-1">
                        {getCategoryIcon(rec.category)}
                        {rec.category}
                      </Badge>
                    </div>
                  </div>
                  {onApply && (
                    <Button size="sm" variant="outline" onClick={() => onApply(rec.id)}>
                      Apply
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      {groupedRecommendations.tip && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
            <h4 className="font-medium text-sm">Conservation Tips</h4>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {groupedRecommendations.tip.map((rec) => (
              <Card key={rec.id} className="p-4 bg-yellow-500/5 border-yellow-500/20">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
                    <Lightbulb className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-sm mb-1">{rec.title}</h5>
                    <p className="text-xs text-muted-foreground">{rec.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {groupedRecommendations.warning && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            <h4 className="font-medium text-sm">Important Notices</h4>
          </div>
          <div className="space-y-3">
            {groupedRecommendations.warning.map((rec) => (
              <Card key={rec.id} className="p-4 border-l-4 border-l-orange-500 bg-orange-500/5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h5 className="font-semibold text-foreground mb-1">{rec.title}</h5>
                    <p className="text-sm text-muted-foreground">{rec.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {recommendations.length === 0 && (
        <Card className="p-8 text-center">
          <Leaf className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <h4 className="font-semibold text-foreground mb-2">Great job!</h4>
          <p className="text-sm text-muted-foreground">
            Your trip is already optimized for sustainability. No recommendations at this time.
          </p>
        </Card>
      )}
    </div>
  )
}
