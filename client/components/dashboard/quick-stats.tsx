import { TrendingDown, MapPin, Award } from "lucide-react"
import { Card } from "@/components/ui/card"

export function QuickStats() {
  const stats = [
    {
      label: "Total Trips",
      value: "12",
      change: "+2 this month",
      icon: MapPin,
      color: "text-primary",
    },
    {
      label: "Carbon Saved",
      value: "2.4 tons",
      change: "vs. average traveler",
      icon: TrendingDown,
      color: "text-accent",
    },
    {
      label: "EcoScore",
      value: "850",
      change: "+45 this month",
      icon: Award,
      color: "text-primary",
    },
    {
      label: "Badges Earned",
      value: "18",
      change: "3 more to unlock",
      icon: Award,
      color: "text-accent",
    },
  ]

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-4 bg-card border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">{stat.label}</span>
            <stat.icon className={`w-5 h-5 ${stat.color}`} />
          </div>
          <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
          <div className="text-xs text-muted-foreground">{stat.change}</div>
        </Card>
      ))}
    </div>
  )
}
