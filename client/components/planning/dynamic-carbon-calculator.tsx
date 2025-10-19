"use client"

import { useState, useEffect } from "react"
import { TrendingDown, AlertCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface TripItem {
  type: "flight" | "hotel" | "activity" | "transport"
  name: string
  carbon: number
}

interface DynamicCarbonCalculatorProps {
  tripItems: TripItem[]
  benchmark?: number
  onUpdate?: (data: { total: number; isUnderBenchmark: boolean }) => void
}

export function DynamicCarbonCalculator({
  tripItems,
  benchmark = 1000,
  onUpdate,
}: DynamicCarbonCalculatorProps) {
  const [totalCarbon, setTotalCarbon] = useState(0)
  const [breakdown, setBreakdown] = useState({
    flights: 0,
    hotels: 0,
    activities: 0,
    transport: 0,
  })

  useEffect(() => {
    const newBreakdown = {
      flights: 0,
      hotels: 0,
      activities: 0,
      transport: 0,
    }

    tripItems.forEach((item) => {
      switch (item.type) {
        case "flight":
          newBreakdown.flights += item.carbon
          break
        case "hotel":
          newBreakdown.hotels += item.carbon
          break
        case "activity":
          newBreakdown.activities += item.carbon
          break
        case "transport":
          newBreakdown.transport += item.carbon
          break
      }
    })

    const total = Object.values(newBreakdown).reduce((sum, val) => sum + val, 0)
    setBreakdown(newBreakdown)
    setTotalCarbon(total)

    if (onUpdate) {
      onUpdate({
        total,
        isUnderBenchmark: total <= benchmark,
      })
    }
  }, [tripItems, benchmark, onUpdate])

  const isUnderBenchmark = totalCarbon <= benchmark
  const percentageOfBenchmark = benchmark > 0 ? (totalCarbon / benchmark) * 100 : 0
  const difference = benchmark - totalCarbon

  const breakdownItems = [
    { label: "Flights", value: breakdown.flights, icon: "✈️", color: "bg-blue-500" },
    { label: "Hotels", value: breakdown.hotels, icon: "🏨", color: "bg-purple-500" },
    { label: "Activities", value: breakdown.activities, icon: "🎯", color: "bg-orange-500" },
    { label: "Transport", value: breakdown.transport, icon: "🚗", color: "bg-green-500" },
  ]

  return (
    <Card className="p-6 sticky top-4">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-primary" />
            Carbon Footprint
          </h3>
          <p className="text-sm text-muted-foreground mt-1">Real-time calculation</p>
        </div>

        {/* Total Carbon */}
        <div className="text-center">
          <div className="text-4xl font-bold text-foreground mb-2">
            {totalCarbon.toFixed(1)}
            <span className="text-lg font-normal text-muted-foreground ml-2">kg CO₂</span>
          </div>
          <Badge variant={isUnderBenchmark ? "default" : "destructive"} className="text-sm">
            {isUnderBenchmark ? "✓ Under Benchmark" : "⚠ Above Benchmark"}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Eco Benchmark</span>
            <span className="font-medium">{benchmark} kg</span>
          </div>
          <Progress
            value={Math.min(percentageOfBenchmark, 100)}
            className={`h-3 ${isUnderBenchmark ? "bg-green-500/20" : "bg-red-500/20"}`}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0 kg</span>
            <span>{percentageOfBenchmark.toFixed(0)}%</span>
            <span>{benchmark} kg</span>
          </div>
        </div>

        {/* Status Alert */}
        {!isUnderBenchmark && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your trip is {Math.abs(difference).toFixed(0)} kg CO₂ above the eco-benchmark. Consider lower-carbon
              alternatives.
            </AlertDescription>
          </Alert>
        )}

        {isUnderBenchmark && difference > 0 && (
          <Alert className="border-green-500/30 bg-green-500/10">
            <AlertCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
              Great! You're {difference.toFixed(0)} kg CO₂ under the benchmark. You're on track for an eco-friendly
              trip!
            </AlertDescription>
          </Alert>
        )}

        {/* Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Carbon Breakdown</h4>
          {breakdownItems.map((item) => {
            const percentage = totalCarbon > 0 ? (item.value / totalCarbon) * 100 : 0
            return (
              <div key={item.label} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    <span className="text-muted-foreground">{item.label}</span>
                  </span>
                  <span className="font-medium">{item.value.toFixed(1)} kg</span>
                </div>
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`absolute top-0 left-0 h-full ${item.color} transition-all`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{tripItems.length}</div>
            <div className="text-xs text-muted-foreground">Items</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {tripItems.length > 0 ? (totalCarbon / tripItems.length).toFixed(1) : "0"}
            </div>
            <div className="text-xs text-muted-foreground">Avg per Item</div>
          </div>
        </div>
      </div>
    </Card>
  )
}
