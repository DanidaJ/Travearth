import { Award, Trophy, Star, TrendingUp, Lock } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function EcoScorePage() {
  const badges = [
    {
      id: "1",
      name: "First Steps",
      description: "Complete your first eco-friendly trip",
      icon: "🌱",
      earned: true,
      earnedAt: "2024-01-15",
      category: "explorer",
    },
    {
      id: "2",
      name: "Carbon Saver",
      description: "Save 100kg of CO₂ compared to average traveler",
      icon: "🌍",
      earned: true,
      earnedAt: "2024-03-20",
      category: "carbon",
    },
    {
      id: "3",
      name: "Eco Warrior",
      description: "Complete 10 trips with 90+ sustainability score",
      icon: "⚡",
      earned: true,
      earnedAt: "2024-06-10",
      category: "explorer",
    },
    {
      id: "4",
      name: "Community Leader",
      description: "Share 5 trips with friends",
      icon: "🤝",
      earned: true,
      earnedAt: "2024-08-05",
      category: "community",
    },
    {
      id: "5",
      name: "Crisis Navigator",
      description: "Successfully adapt to a travel disruption",
      icon: "🧭",
      earned: false,
      category: "resilience",
    },
    {
      id: "6",
      name: "Eco Legend",
      description: "Reach 1000 EcoScore points",
      icon: "👑",
      earned: false,
      category: "carbon",
    },
  ]

  const achievements = [
    { label: "Total Trips", value: 12, max: 20, nextReward: "Explorer Badge" },
    { label: "Carbon Saved", value: 450, max: 500, nextReward: "Climate Hero" },
    { label: "Eco Hotels", value: 8, max: 10, nextReward: "Green Sleeper" },
    { label: "Shared Trips", value: 5, max: 10, nextReward: "Social Butterfly" },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">EcoScore & Badges</h1>
        <p className="text-muted-foreground">Track your achievements and sustainable travel milestones</p>
      </div>

      {/* EcoScore Card */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
        <div className="flex items-center gap-6">
          <div className="flex-shrink-0">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <div className="w-28 h-28 rounded-full bg-white flex flex-col items-center justify-center">
                <Trophy className="w-10 h-10 text-primary mb-2" />
                <span className="text-3xl font-bold text-foreground">850</span>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold text-foreground">Eco Champion</span>
              <div className="flex items-center gap-1 text-sm text-primary">
                <TrendingUp className="w-4 h-4" />
                <span>+45 this month</span>
              </div>
            </div>
            <Progress value={85} className="h-3 mb-3" />
            <p className="text-sm text-muted-foreground">150 points to reach Eco Legend status</p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-foreground">Level 8</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-accent" />
                <span className="text-sm font-medium text-foreground">18 Badges</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Progress Towards Next Badges */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-foreground mb-4">Progress Towards Next Badges</h2>
        <div className="space-y-4">
          {achievements.map((achievement) => (
            <div key={achievement.label}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">{achievement.label}</span>
                <div className="text-right">
                  <span className="text-sm font-medium text-foreground">
                    {achievement.value}/{achievement.max}
                  </span>
                  <p className="text-xs text-muted-foreground">{achievement.nextReward}</p>
                </div>
              </div>
              <Progress value={(achievement.value / achievement.max) * 100} className="h-2" />
            </div>
          ))}
        </div>
      </Card>

      {/* Badges */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Badges</TabsTrigger>
          <TabsTrigger value="earned">Earned</TabsTrigger>
          <TabsTrigger value="locked">Locked</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge) => (
              <Card key={badge.id} className={`p-6 ${badge.earned ? "bg-white" : "bg-surface opacity-60"}`}>
                <div className="flex items-start gap-4">
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
                      badge.earned ? "bg-primary/10" : "bg-muted"
                    }`}
                  >
                    {badge.earned ? badge.icon : <Lock className="w-6 h-6 text-muted-foreground" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{badge.name}</h3>
                      {badge.earned && <Badge className="bg-primary/10 text-primary border-0 text-xs">Earned</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{badge.description}</p>
                    {badge.earned && badge.earnedAt && (
                      <p className="text-xs text-muted-foreground">
                        Earned on {new Date(badge.earnedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="earned" className="mt-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges
              .filter((badge) => badge.earned)
              .map((badge) => (
                <Card key={badge.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl">
                      {badge.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-foreground">{badge.name}</h3>
                        <Badge className="bg-primary/10 text-primary border-0 text-xs">Earned</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{badge.description}</p>
                      {badge.earnedAt && (
                        <p className="text-xs text-muted-foreground">
                          Earned on {new Date(badge.earnedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="locked" className="mt-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges
              .filter((badge) => !badge.earned)
              .map((badge) => (
                <Card key={badge.id} className="p-6 bg-surface opacity-60">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                      <Lock className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">{badge.name}</h3>
                      <p className="text-sm text-muted-foreground">{badge.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
