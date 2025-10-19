"use client"

import { TrendingDown, TrendingUp, Target, Award, BarChart3 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Line, LineChart } from "recharts"

interface CarbonComparisonProps {
  predicted: {
    total: number
    flights: number
    accommodation: number
    activities: number
    transportation: number
  }
  actual: {
    total: number
    flights: number
    accommodation: number
    activities: number
    transportation: number
  }
  dailyData?: Array<{
    day: string
    predicted: number
    actual: number
  }>
}

export function CarbonComparison({ predicted, actual, dailyData }: CarbonComparisonProps) {
  const difference = actual.total - predicted.total
  const percentageDiff = predicted.total > 0 ? (difference / predicted.total) * 100 : 0
  const isUnderTarget = difference <= 0

  const comparisonData = [
    {
      category: "Flights",
      predicted: predicted.flights,
      actual: actual.flights,
    },
    {
      category: "Hotels",
      predicted: predicted.accommodation,
      actual: actual.accommodation,
    },
    {
      category: "Activities",
      predicted: predicted.activities,
      actual: actual.activities,
    },
    {
      category: "Transport",
      predicted: predicted.transportation,
      actual: actual.transportation,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Predicted */}
        <Card className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
            <Target className="w-4 h-4" />
            Predicted
          </div>
          <div className="text-3xl font-bold text-foreground">
            {predicted.total.toFixed(1)}
            <span className="text-sm font-normal text-muted-foreground ml-1">kg CO₂</span>
          </div>
        </Card>

        {/* Actual */}
        <Card className="p-6">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
            <BarChart3 className="w-4 h-4" />
            Actual
          </div>
          <div className="text-3xl font-bold text-foreground">
            {actual.total.toFixed(1)}
            <span className="text-sm font-normal text-muted-foreground ml-1">kg CO₂</span>
          </div>
        </Card>

        {/* Difference */}
        <Card className={`p-6 ${isUnderTarget ? "bg-green-500/10 border-green-500/30" : "bg-orange-500/10 border-orange-500/30"}`}>
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
            {isUnderTarget ? (
              <TrendingDown className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingUp className="w-4 h-4 text-orange-600" />
            )}
            Difference
          </div>
          <div className="flex items-baseline gap-2">
            <div className={`text-3xl font-bold ${isUnderTarget ? "text-green-600" : "text-orange-600"}`}>
              {isUnderTarget ? "" : "+"}
              {difference.toFixed(1)}
              <span className="text-sm font-normal ml-1">kg CO₂</span>
            </div>
            <Badge variant={isUnderTarget ? "default" : "destructive"} className="text-xs">
              {percentageDiff > 0 ? "+" : ""}
              {percentageDiff.toFixed(1)}%
            </Badge>
          </div>
        </Card>
      </div>

      {/* Achievement Banner */}
      {isUnderTarget && (
        <Card className="p-4 bg-gradient-to-r from-green-500/10 to-primary/10 border-green-500/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground">Excellent Work!</h4>
              <p className="text-sm text-muted-foreground">
                You stayed {Math.abs(percentageDiff).toFixed(1)}% under your predicted carbon footprint. Keep up the
                eco-friendly travel!
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Category Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Category Breakdown</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.32 0.08 155)" />
              <XAxis dataKey="category" stroke="oklch(0.75 0.04 155)" fontSize={12} />
              <YAxis stroke="oklch(0.75 0.04 155)" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.22 0.08 155)",
                  border: "1px solid oklch(0.32 0.08 155)",
                  borderRadius: "8px",
                  color: "oklch(0.98 0 0)",
                }}
              />
              <Legend />
              <Bar dataKey="predicted" fill="#10b981" name="Predicted" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" fill="#3b82f6" name="Actual" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Daily Trend */}
      {dailyData && dailyData.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Daily Carbon Emissions</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.32 0.08 155)" />
                <XAxis dataKey="day" stroke="oklch(0.75 0.04 155)" fontSize={12} />
                <YAxis stroke="oklch(0.75 0.04 155)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.22 0.08 155)",
                    border: "1px solid oklch(0.32 0.08 155)",
                    borderRadius: "8px",
                    color: "oklch(0.98 0 0)",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981" }}
                  name="Predicted"
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6" }}
                  name="Actual"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Detailed Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Detailed Analysis</h3>
        <div className="space-y-4">
          {comparisonData.map((item) => {
            const itemDiff = item.actual - item.predicted
            const itemPercent = item.predicted > 0 ? (itemDiff / item.predicted) * 100 : 0
            const isUnder = itemDiff <= 0

            return (
              <div key={item.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{item.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {item.predicted.toFixed(1)} → {item.actual.toFixed(1)} kg
                    </span>
                    <Badge variant={isUnder ? "default" : "secondary"} className="text-xs">
                      {itemPercent > 0 ? "+" : ""}
                      {itemPercent.toFixed(0)}%
                    </Badge>
                  </div>
                </div>
                <Progress
                  value={item.predicted > 0 ? (item.actual / item.predicted) * 100 : 0}
                  className={`h-2 ${isUnder ? "bg-green-500/20" : "bg-orange-500/20"}`}
                />
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
