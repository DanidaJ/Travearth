"use client"

import { ArrowLeft, TrendingDown, MapPin, Calendar, Leaf, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Pie,
  PieChart,
  Cell,
} from "recharts"

export default function TripCarbonPage({ params }: { params: { id: string } }) {
  const tripData = {
    name: "Costa Rica Adventure",
    predictedCarbon: 450,
    actualCarbon: 420,
    breakdown: {
      flights: { predicted: 280, actual: 260 },
      hotels: { predicted: 100, actual: 95 },
      activities: { predicted: 50, actual: 45 },
      transport: { predicted: 20, actual: 20 },
    },
  }

  const dailyTracking = [
    { day: "Day 1", predicted: 65, actual: 60 },
    { day: "Day 2", predicted: 70, actual: 65 },
    { day: "Day 3", predicted: 60, actual: 58 },
    { day: "Day 4", predicted: 75, actual: 70 },
    { day: "Day 5", predicted: 65, actual: 62 },
    { day: "Day 6", predicted: 70, actual: 68 },
    { day: "Day 7", predicted: 45, actual: 37 },
  ]

  const pieData = [
    { name: "Flights", value: 260, color: "#10b981" },
    { name: "Hotels", value: 95, color: "#14b8a6" },
    { name: "Activities", value: 45, color: "#34d399" },
    { name: "Transport", value: 20, color: "#6ee7b7" },
  ]

  const carbonSaved = tripData.predictedCarbon - tripData.actualCarbon
  const percentageSaved = ((carbonSaved / tripData.predictedCarbon) * 100).toFixed(1)

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild>
        <Link href={`/dashboard/trips/${params.id}`}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Trip
        </Link>
      </Button>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Carbon Footprint Details</h1>
        <p className="text-muted-foreground">{tripData.name}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Predicted</span>
            <TrendingDown className="w-5 h-5 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold text-foreground">{tripData.predictedCarbon}</div>
          <div className="text-xs text-muted-foreground">kg CO₂</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Actual</span>
            <TrendingDown className="w-5 h-5 text-accent" />
          </div>
          <div className="text-2xl font-bold text-accent">{tripData.actualCarbon}</div>
          <div className="text-xs text-muted-foreground">kg CO₂</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Saved</span>
            <Leaf className="w-5 h-5 text-primary" />
          </div>
          <div className="text-2xl font-bold text-primary">{carbonSaved}</div>
          <div className="text-xs text-muted-foreground">kg CO₂</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Performance</span>
            <Badge className="bg-primary/10 text-primary border-0 text-xs">{percentageSaved}% better</Badge>
          </div>
          <Progress value={Number.parseFloat(percentageSaved)} className="h-2 mt-2" />
        </Card>
      </div>

      {/* Comparison Alert */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <Leaf className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-foreground mb-1">Great Job!</h3>
            <p className="text-sm text-muted-foreground">
              You've emitted {carbonSaved} kg less CO₂ than predicted. That's equivalent to planting{" "}
              {Math.round(carbonSaved / 20)} trees!
            </p>
          </div>
        </div>
      </Card>

      {/* Charts */}
      <Tabs defaultValue="daily" className="w-full">
        <TabsList>
          <TabsTrigger value="daily">Daily Tracking</TabsTrigger>
          <TabsTrigger value="breakdown">Category Breakdown</TabsTrigger>
          <TabsTrigger value="details">Detailed Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="mt-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Daily Carbon Emissions</h2>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyTracking}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: "#10b981" }}
                  />
                  <Line type="monotone" dataKey="actual" stroke="#14b8a6" strokeWidth={2} dot={{ fill: "#14b8a6" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-sm text-muted-foreground">Predicted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent" />
                <span className="text-sm text-muted-foreground">Actual</span>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="mt-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">Emissions by Category</h2>
              <div className="h-[300px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-4">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <div>
                      <div className="text-sm font-medium text-foreground">{item.name}</div>
                      <div className="text-xs text-muted-foreground">{item.value} kg</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-6">Category Comparison</h2>
              <div className="space-y-6">
                {Object.entries(tripData.breakdown).map(([category, data]) => (
                  <div key={category}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground capitalize">{category}</span>
                      <div className="text-right">
                        <span className="text-sm font-medium text-accent">{data.actual} kg</span>
                        <span className="text-xs text-muted-foreground"> / {data.predicted} kg</span>
                      </div>
                    </div>
                    <Progress value={(data.actual / data.predicted) * 100} className="h-2" />
                    <div className="text-xs text-primary mt-1">
                      {data.predicted - data.actual > 0
                        ? `↓ ${data.predicted - data.actual} kg saved`
                        : `↑ ${data.actual - data.predicted} kg over`}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details" className="mt-6">
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Flights</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium text-foreground">SFO → SJO</div>
                      <div className="text-xs text-muted-foreground">Economy Class</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-foreground">130 kg CO₂</div>
                    <div className="text-xs text-primary">↓ 10 kg saved</div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium text-foreground">SJO → SFO</div>
                      <div className="text-xs text-muted-foreground">Economy Class</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-foreground">130 kg CO₂</div>
                    <div className="text-xs text-primary">↓ 10 kg saved</div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Accommodations</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium text-foreground">Eco Lodge Monteverde</div>
                      <div className="text-xs text-muted-foreground">3 nights</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-foreground">45 kg CO₂</div>
                    <div className="text-xs text-primary">↓ 3 kg saved</div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-surface rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium text-foreground">Sustainable Beach Resort</div>
                      <div className="text-xs text-muted-foreground">4 nights</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-foreground">50 kg CO₂</div>
                    <div className="text-xs text-primary">↓ 2 kg saved</div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-accent/5 border-accent/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Eco Recommendations</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Consider taking a bus instead of flying for short distances</li>
                    <li>• Choose hotels with renewable energy certifications</li>
                    <li>• Opt for group tours to reduce per-person emissions</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
