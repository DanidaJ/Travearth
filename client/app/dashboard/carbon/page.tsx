"use client"

import { TrendingDown, TrendingUp, Leaf, Plane, Hotel, Activity } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Bar, BarChart } from "recharts"
import { RealTimeTracker } from "@/components/carbon/real-time-tracker"
import { CarbonCalculator } from "@/components/carbon/carbon-calculator"

export default function CarbonTrackingPage() {
  const monthlyData = [
    { month: "Jan", predicted: 400, actual: 380 },
    { month: "Feb", predicted: 300, actual: 320 },
    { month: "Mar", predicted: 500, actual: 450 },
    { month: "Apr", predicted: 450, actual: 420 },
    { month: "May", predicted: 600, actual: 550 },
    { month: "Jun", predicted: 550, actual: 520 },
  ]

  const breakdownData = [
    { category: "Flights", value: 320, color: "#10b981" },
    { category: "Hotels", value: 120, color: "#14b8a6" },
    { category: "Activities", value: 50, color: "#34d399" },
    { category: "Transport", value: 30, color: "#6ee7b7" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Carbon Footprint Tracking</h1>
        <p className="text-muted-foreground">Monitor and reduce your travel emissions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total This Year</span>
            <TrendingDown className="w-5 h-5 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">2.4 tons</div>
          <div className="text-xs text-primary">↓ 15% vs last year</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">This Month</span>
            <TrendingDown className="w-5 h-5 text-accent" />
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">520 kg</div>
          <div className="text-xs text-accent">↓ 7% vs predicted</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Carbon Saved</span>
            <Leaf className="w-5 h-5 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">450 kg</div>
          <div className="text-xs text-muted-foreground">vs. average traveler</div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Offset Progress</span>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">85%</div>
          <Progress value={85} className="h-1 mt-2" />
        </Card>
      </div>

      {/* Real-Time Tracking & Calculator */}
      <div className="grid lg:grid-cols-2 gap-6">
        <RealTimeTracker />
        <CarbonCalculator />
      </div>

      {/* Charts */}
      <Tabs defaultValue="trends" className="w-full">
        <TabsList>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="mt-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Monthly Carbon Emissions</h2>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
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
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-6">Emissions by Category</h2>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdownData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="category" stroke="#6b7280" fontSize={12} />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="value" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {breakdownData.map((item) => (
                <div key={item.category} className="flex items-center gap-3 p-3 bg-surface rounded-lg">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <div>
                    <div className="text-sm font-medium text-foreground">{item.category}</div>
                    <div className="text-xs text-muted-foreground">{item.value} kg CO₂</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Your Impact</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Plane className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-foreground">Flights</span>
                      <span className="text-sm font-medium">320 kg</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Hotel className="w-5 h-5 text-accent" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-foreground">Hotels</span>
                      <span className="text-sm font-medium">120 kg</span>
                    </div>
                    <Progress value={40} className="h-2" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-primary" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-foreground">Activities</span>
                      <span className="text-sm font-medium">50 kg</span>
                    </div>
                    <Progress value={20} className="h-2" />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">Average Traveler</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Plane className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-foreground">Flights</span>
                      <span className="text-sm font-medium">450 kg</span>
                    </div>
                    <Progress value={90} className="h-2" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Hotel className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-foreground">Hotels</span>
                      <span className="text-sm font-medium">180 kg</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-foreground">Activities</span>
                      <span className="text-sm font-medium">80 kg</span>
                    </div>
                    <Progress value={35} className="h-2" />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Eco Tips */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Leaf className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-2">Eco Tip of the Day</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Consider taking trains instead of short-haul flights. Rail travel can reduce your carbon footprint by up
              to 90% compared to flying the same distance.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
