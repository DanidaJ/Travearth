"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Building,
  Leaf,
  TrendingUp,
  Users,
  Droplet,
  Zap,
  Trash2,
  Star,
  Calendar,
  DollarSign,
  Award,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Settings,
  Download
} from "lucide-react"
import Link from "next/link"

export default function HotelDashboardPage() {
  // Demo data for Sustainable Beach Resort
  const hotelData = {
    name: "Sustainable Beach Resort",
    ecoScore: 92,
    certifications: ["Green Key", "LEED Platinum", "EarthCheck Gold"],
    bookings: {
      thisMonth: 156,
      lastMonth: 142,
      trend: 9.9
    },
    revenue: {
      thisMonth: 87500,
      lastMonth: 78200,
      trend: 11.9
    },
    sustainability: {
      waterSaved: 45000, // liters
      energySaved: 12500, // kWh
      wasteRecycled: 89, // percentage
      carbonOffset: 15.8 // tons
    },
    ratings: {
      overall: 4.8,
      ecoFriendly: 4.9,
      totalReviews: 342
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">Travearth</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/hotels/dashboard">
                <BarChart3 className="w-4 h-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/hotels">Back to Hotels</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Hotel Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                <Building className="w-8 h-8 text-primary" />
                {hotelData.name}
              </h1>
              <p className="text-muted-foreground mt-1">Partner Dashboard</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          {/* Eco Score Badge */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 bg-green-600/10 px-4 py-2 rounded-lg border border-green-600/30">
              <Leaf className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-xs text-muted-foreground">Eco Score</div>
                <div className="text-2xl font-bold text-green-600">{hotelData.ecoScore}/100</div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-yellow-600/10 px-4 py-2 rounded-lg border border-yellow-600/30">
              <Star className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="text-xs text-muted-foreground">Guest Rating</div>
                <div className="text-2xl font-bold text-yellow-600">{hotelData.ratings.overall}/5.0</div>
              </div>
            </div>

            {hotelData.certifications.map((cert) => (
              <Badge key={cert} variant="outline" className="bg-blue-600/10 text-blue-600 border-blue-600/30">
                <Award className="w-3 h-3 mr-1" />
                {cert}
              </Badge>
            ))}
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="sustainability">Sustainability</TabsTrigger>
            <TabsTrigger value="bookings">Bookings & Revenue</TabsTrigger>
            <TabsTrigger value="ratings">Reviews & Ratings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-3xl font-bold text-foreground">{hotelData.bookings.thisMonth}</div>
                      <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                        <TrendingUp className="w-3 h-3" />
                        +{hotelData.bookings.trend}% vs last month
                      </div>
                    </div>
                    <Calendar className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-3xl font-bold text-foreground">
                        ${(hotelData.revenue.thisMonth / 1000).toFixed(1)}K
                      </div>
                      <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                        <TrendingUp className="w-3 h-3" />
                        +{hotelData.revenue.trend}% vs last month
                      </div>
                    </div>
                    <DollarSign className="w-8 h-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Eco Rating</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-3xl font-bold text-green-600">{hotelData.ratings.ecoFriendly}/5.0</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {hotelData.ratings.totalReviews} reviews
                      </div>
                    </div>
                    <Leaf className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Carbon Offset</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-3xl font-bold text-blue-600">{hotelData.sustainability.carbonOffset}</div>
                      <div className="text-xs text-muted-foreground mt-1">tons CO₂ this year</div>
                    </div>
                    <CheckCircle className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Manage your hotel operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Button variant="outline" className="justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Manage Bookings
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    View Guests
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Hotel Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sustainability Tab */}
          <TabsContent value="sustainability" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Eco Meters */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-green-600" />
                    Sustainability Metrics
                  </CardTitle>
                  <CardDescription>Your environmental impact this month</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Droplet className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">Water Conservation</span>
                      </div>
                      <span className="text-sm font-bold text-blue-600">{hotelData.sustainability.waterSaved.toLocaleString()}L</span>
                    </div>
                    <Progress value={85} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">85% efficiency vs industry average</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-medium">Energy Efficiency</span>
                      </div>
                      <span className="text-sm font-bold text-yellow-600">{hotelData.sustainability.energySaved.toLocaleString()} kWh</span>
                    </div>
                    <Progress value={78} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">78% from renewable sources</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Trash2 className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">Waste Recycling</span>
                      </div>
                      <span className="text-sm font-bold text-green-600">{hotelData.sustainability.wasteRecycled}%</span>
                    </div>
                    <Progress value={hotelData.sustainability.wasteRecycled} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">Above industry standard of 65%</p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">Overall Eco Score</span>
                      </div>
                      <span className="text-sm font-bold text-green-600">{hotelData.ecoScore}/100</span>
                    </div>
                    <Progress value={hotelData.ecoScore} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">Top 5% of eco-friendly hotels</p>
                  </div>
                </CardContent>
              </Card>

              {/* Certifications & Achievements */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-600" />
                    Certifications & Achievements
                  </CardTitle>
                  <CardDescription>Your sustainability credentials</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      name: "Green Key Certification",
                      date: "Valid until Dec 2025",
                      status: "active",
                      icon: CheckCircle
                    },
                    {
                      name: "LEED Platinum",
                      date: "Awarded Jan 2024",
                      status: "active",
                      icon: CheckCircle
                    },
                    {
                      name: "EarthCheck Gold",
                      date: "Valid until Jun 2026",
                      status: "active",
                      icon: CheckCircle
                    },
                    {
                      name: "Zero Waste Facility",
                      date: "In progress (87%)",
                      status: "pending",
                      icon: AlertCircle
                    }
                  ].map((cert) => (
                    <div key={cert.name} className="flex items-center gap-3 p-3 rounded-lg bg-accent/30 border border-border">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        cert.status === 'active' ? 'bg-green-600/20' : 'bg-orange-600/20'
                      }`}>
                        <cert.icon className={`w-5 h-5 ${
                          cert.status === 'active' ? 'text-green-600' : 'text-orange-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-foreground">{cert.name}</div>
                        <div className="text-xs text-muted-foreground">{cert.date}</div>
                      </div>
                      <Badge variant={cert.status === 'active' ? 'default' : 'secondary'}>
                        {cert.status === 'active' ? 'Active' : 'Pending'}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Environmental Impact */}
            <Card className="bg-gradient-to-r from-green-600/10 to-blue-600/10 border-green-600/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-green-600" />
                  Environmental Impact
                </CardTitle>
                <CardDescription>Your contribution to sustainability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {hotelData.sustainability.carbonOffset}
                    </div>
                    <div className="text-sm text-muted-foreground">Tons of CO₂ offset</div>
                    <div className="text-xs text-muted-foreground mt-1">Equivalent to 3,500 trees planted</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      {(hotelData.sustainability.waterSaved / 1000).toFixed(1)}K
                    </div>
                    <div className="text-sm text-muted-foreground">Liters of water saved</div>
                    <div className="text-xs text-muted-foreground mt-1">Enough for 150 households/day</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-yellow-600 mb-2">
                      {(hotelData.sustainability.energySaved / 1000).toFixed(1)}K
                    </div>
                    <div className="text-sm text-muted-foreground">kWh energy saved</div>
                    <div className="text-xs text-muted-foreground mt-1">Powers 40 homes for a month</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings & Revenue Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Booking Trends</CardTitle>
                  <CardDescription>Monthly comparison</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">This Month</span>
                        <span className="text-lg font-bold text-foreground">{hotelData.bookings.thisMonth} bookings</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Last Month</span>
                        <span className="text-lg font-bold text-muted-foreground">{hotelData.bookings.lastMonth} bookings</span>
                      </div>
                      <Progress value={68} className="h-2" />
                    </div>
                    <div className="pt-4 border-t border-border">
                      <div className="flex items-center gap-2 text-green-600">
                        <TrendingUp className="w-4 h-4" />
                        <span className="font-semibold">+{hotelData.bookings.trend}% growth</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        You're outperforming 78% of hotels in your category
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Revenue Performance</CardTitle>
                  <CardDescription>Monthly comparison</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">This Month</span>
                        <span className="text-lg font-bold text-foreground">
                          ${hotelData.revenue.thisMonth.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={82} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Last Month</span>
                        <span className="text-lg font-bold text-muted-foreground">
                          ${hotelData.revenue.lastMonth.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={73} className="h-2" />
                    </div>
                    <div className="pt-4 border-t border-border">
                      <div className="flex items-center gap-2 text-green-600">
                        <TrendingUp className="w-4 h-4" />
                        <span className="font-semibold">+{hotelData.revenue.trend}% growth</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Average booking value: ${(hotelData.revenue.thisMonth / hotelData.bookings.thisMonth).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Ratings Tab */}
          <TabsContent value="ratings" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Guest Reviews & Ratings</CardTitle>
                <CardDescription>{hotelData.ratings.totalReviews} total reviews</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-center mb-6">
                      <div className="text-5xl font-bold text-foreground mb-2">{hotelData.ratings.overall}</div>
                      <div className="flex items-center justify-center gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-5 h-5 ${
                              star <= hotelData.ratings.overall ? "fill-yellow-600 text-yellow-600" : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground">Overall Rating</div>
                    </div>

                    <div className="space-y-3">
                      {[
                        { label: "Eco-Friendly", value: 4.9 },
                        { label: "Cleanliness", value: 4.8 },
                        { label: "Service", value: 4.7 },
                        { label: "Location", value: 4.6 },
                        { label: "Value", value: 4.5 }
                      ].map((rating) => (
                        <div key={rating.label}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-muted-foreground">{rating.label}</span>
                            <span className="text-sm font-semibold text-foreground">{rating.value}/5</span>
                          </div>
                          <Progress value={rating.value * 20} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-green-600/10 border border-green-600/30">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
                          JD
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-foreground">John Doe</span>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className="w-3 h-3 fill-yellow-600 text-yellow-600" />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            "Amazing eco-friendly resort! Solar panels, water recycling, and organic food. Highly recommend!"
                          </p>
                          <span className="text-xs text-muted-foreground">2 days ago</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-accent/30 border border-border">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                          SE
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-foreground">Sarah Evans</span>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} className={`w-3 h-3 ${star <= 4 ? "fill-yellow-600 text-yellow-600" : "text-muted-foreground"}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            "Beautiful location and truly sustainable. Love the commitment to the environment!"
                          </p>
                          <span className="text-xs text-muted-foreground">5 days ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
