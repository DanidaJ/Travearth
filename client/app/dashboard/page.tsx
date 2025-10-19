import { Plus, MapPin, TrendingDown, Award } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { TripCard } from "@/components/dashboard/trip-card"
import { CarbonChart } from "@/components/dashboard/carbon-chart"
import { EcoScoreBadge } from "@/components/dashboard/eco-score-badge"
import { QuickStats } from "@/components/dashboard/quick-stats"
import { CrisisAlertBanner } from "@/components/crisis/crisis-alert-banner"

export default function DashboardPage() {
  // Mock data - replace with actual API calls
  const upcomingTrips = [
    {
      id: "1",
      name: "Costa Rica Adventure",
      destination: "San José, Costa Rica",
      startDate: "2025-03-15",
      endDate: "2025-03-22",
      imageUrl: "/costa-rica-rainforest.png",
      sustainabilityScore: 92,
      predictedCarbon: 450,
    },
    {
      id: "2",
      name: "Nordic Escape",
      destination: "Oslo, Norway",
      startDate: "2025-04-10",
      endDate: "2025-04-17",
      imageUrl: "/norway-fjords.jpg",
      sustainabilityScore: 88,
      predictedCarbon: 520,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Crisis Alerts */}
      <CrisisAlertBanner destinationIds={["costa-rica", "norway"]} />

      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, Traveler!</h1>
          <p className="text-muted-foreground">Track your sustainable travel journey and plan your next adventure</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
          <Link href="/dashboard/trips/create">
            <Plus className="w-4 h-4 mr-2" />
            New Trip
          </Link>
        </Button>
      </div>

      {/* Quick Stats */}
      <QuickStats />

      {/* EcoScore Overview */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-1">Your EcoScore</h2>
            <p className="text-sm text-muted-foreground">Keep making sustainable choices to improve your score</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/eco-score">View Details</Link>
          </Button>
        </div>
        <EcoScoreBadge score={850} level="Eco Champion" />
      </Card>

      {/* Carbon Footprint Chart */}
      <Card className="p-6 bg-card border-border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-1">Carbon Footprint Trends</h2>
            <p className="text-sm text-muted-foreground">Your monthly carbon emissions from travel</p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/carbon">
              <TrendingDown className="w-4 h-4 mr-2" />
              View All
            </Link>
          </Button>
        </div>
        <CarbonChart />
      </Card>

      {/* Upcoming Trips */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Upcoming Trips</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/trips">View All</Link>
          </Button>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {upcomingTrips.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="p-6 bg-card border-border">
        <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent" asChild>
            <Link href="/explore">
              <MapPin className="w-6 h-6 text-primary" />
              <span className="font-medium">Explore Destinations</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent" asChild>
            <Link href="/dashboard/carbon">
              <TrendingDown className="w-6 h-6 text-accent" />
              <span className="font-medium">Track Carbon</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2 bg-transparent" asChild>
            <Link href="/dashboard/eco-score">
              <Award className="w-6 h-6 text-primary" />
              <span className="font-medium">View Badges</span>
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}
