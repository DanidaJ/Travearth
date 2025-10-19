import { Calendar, MapPin, Leaf } from "lucide-react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface TripCardProps {
  trip: {
    id: string
    name: string
    destination: string
    startDate: string
    endDate: string
    imageUrl: string
    sustainabilityScore: number
    predictedCarbon: number
  }
}

export function TripCard({ trip }: TripCardProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  return (
    <Link href={`/dashboard/trips/${trip.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer bg-card border-border">
        <div className="relative h-48 bg-muted">
          <Image src={trip.imageUrl || "/placeholder.svg"} alt={trip.name} fill className="object-cover" />
          <div className="absolute top-3 right-3">
            <Badge className="bg-primary/90 text-primary-foreground border-0">
              <Leaf className="w-3 h-3 mr-1" />
              {trip.sustainabilityScore}
            </Badge>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-foreground mb-2">{trip.name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <MapPin className="w-4 h-4" />
            <span>{trip.destination}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
              </span>
            </div>
            <span className="text-xs text-muted-foreground">{trip.predictedCarbon} kg CO₂</span>
          </div>
        </div>
      </Card>
    </Link>
  )
}
