import { Users, TrendingUp, Share2, Heart, MessageCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function SocialFeedPage() {
  const activities = [
    {
      id: "1",
      user: "Sarah Johnson",
      action: "completed",
      trip: "Iceland Road Trip",
      carbonSaved: 45,
      timestamp: "2 hours ago",
      likes: 12,
      comments: 3,
    },
    {
      id: "2",
      user: "Mike Chen",
      action: "earned badge",
      badge: "Carbon Saver",
      timestamp: "5 hours ago",
      likes: 8,
      comments: 1,
    },
    {
      id: "3",
      user: "Alex Thompson",
      action: "shared",
      trip: "Costa Rica Adventure",
      timestamp: "1 day ago",
      likes: 15,
      comments: 5,
    },
  ]

  const leaderboard = [
    { rank: 1, name: "Emma Wilson", ecoScore: 950, trips: 15 },
    { rank: 2, name: "You", ecoScore: 850, trips: 12 },
    { rank: 3, name: "David Lee", ecoScore: 820, trips: 11 },
    { rank: 4, name: "Lisa Brown", ecoScore: 780, trips: 10 },
    { rank: 5, name: "Tom Garcia", ecoScore: 750, trips: 9 },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Community</h1>
        <p className="text-muted-foreground">Connect with eco-conscious travelers and share your journey</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Friends</span>
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">24</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Shared Trips</span>
            <Share2 className="w-5 h-5 text-accent" />
          </div>
          <div className="text-2xl font-bold text-foreground">5</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Collective Carbon Saved</span>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">2.1 tons</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Leaderboard Rank</span>
            <Badge className="bg-primary/10 text-primary border-0">#2</Badge>
          </div>
          <div className="text-2xl font-bold text-foreground">850</div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
          {activities.map((activity) => (
            <Card key={activity.id} className="p-5">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {activity.user
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="mb-2">
                    <span className="font-semibold text-foreground">{activity.user}</span>
                    <span className="text-muted-foreground"> {activity.action} </span>
                    {activity.trip && <span className="font-medium text-foreground">{activity.trip}</span>}
                    {activity.badge && (
                      <Badge className="ml-2 bg-primary/10 text-primary border-0">{activity.badge}</Badge>
                    )}
                  </div>
                  {activity.carbonSaved && (
                    <div className="text-sm text-primary mb-2">Saved {activity.carbonSaved} kg CO₂</div>
                  )}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{activity.timestamp}</span>
                    <button className="flex items-center gap-1 hover:text-foreground">
                      <Heart className="w-4 h-4" />
                      <span>{activity.likes}</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-foreground">
                      <MessageCircle className="w-4 h-4" />
                      <span>{activity.comments}</span>
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Leaderboard */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Leaderboard</h2>
          <Card className="p-5">
            <div className="space-y-3">
              {leaderboard.map((entry) => (
                <div
                  key={entry.rank}
                  className={`flex items-center gap-3 p-3 rounded-lg ${
                    entry.name === "You" ? "bg-primary/5 border border-primary/20" : "bg-surface"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      entry.rank === 1
                        ? "bg-yellow-500 text-white"
                        : entry.rank === 2
                          ? "bg-gray-400 text-white"
                          : entry.rank === 3
                            ? "bg-orange-600 text-white"
                            : "bg-muted text-foreground"
                    }`}
                  >
                    {entry.rank}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-foreground">{entry.name}</div>
                    <div className="text-xs text-muted-foreground">{entry.trips} trips</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">{entry.ecoScore}</div>
                    <div className="text-xs text-muted-foreground">EcoScore</div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 bg-transparent">
              View Full Leaderboard
            </Button>
          </Card>

          {/* Suggested Friends */}
          <Card className="p-5">
            <h3 className="font-semibold text-foreground mb-4">Suggested Friends</h3>
            <div className="space-y-3">
              {["Emma Wilson", "David Lee"].map((name) => (
                <div key={name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-foreground">{name}</span>
                  </div>
                  <Button size="sm" variant="outline">
                    Follow
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
