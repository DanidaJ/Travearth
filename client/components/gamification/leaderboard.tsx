"use client"

import { Trophy, Medal, Award, TrendingUp, Users } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface LeaderboardEntry {
  id: string
  name: string
  avatar?: string
  ecoScore: number
  carbonSaved: number
  tripsCompleted: number
  rank: number
}

interface LeaderboardProps {
  currentUserId: string
  entries: LeaderboardEntry[]
}

export function Leaderboard({ currentUserId, entries }: LeaderboardProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />
    return <span className="text-sm font-semibold text-muted-foreground">#{rank}</span>
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "🥇"
    if (rank === 2) return "🥈"
    if (rank === 3) return "🥉"
    return null
  }

  const sortByEcoScore = [...entries].sort((a, b) => b.ecoScore - a.ecoScore)
  const sortByCarbonSaved = [...entries].sort((a, b) => b.carbonSaved - a.carbonSaved)
  const sortByTrips = [...entries].sort((a, b) => b.tripsCompleted - a.tripsCompleted)

  const LeaderboardList = ({ entries, metric }: { entries: LeaderboardEntry[]; metric: string }) => (
    <div className="space-y-2">
      {entries.map((entry, index) => {
        const rank = index + 1
        const isCurrentUser = entry.id === currentUserId

        return (
          <Card
            key={entry.id}
            className={`p-4 transition-all ${
              isCurrentUser
                ? "bg-primary/10 border-primary/30 shadow-md"
                : "hover:bg-muted/50"
            }`}
          >
            <div className="flex items-center gap-4">
              {/* Rank */}
              <div className="w-8 flex items-center justify-center">
                {getRankIcon(rank)}
              </div>

              {/* Avatar */}
              <Avatar className="w-10 h-10">
                <AvatarImage src={entry.avatar} alt={entry.name} />
                <AvatarFallback>
                  {entry.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-semibold truncate ${isCurrentUser ? "text-primary" : ""}`}>
                    {entry.name}
                  </span>
                  {isCurrentUser && (
                    <Badge variant="default" className="text-xs">
                      You
                    </Badge>
                  )}
                  {getRankBadge(rank) && <span className="text-lg">{getRankBadge(rank)}</span>}
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    {entry.ecoScore}
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {entry.carbonSaved}kg saved
                  </span>
                </div>
              </div>

              {/* Metric Value */}
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {metric === "ecoScore"
                    ? entry.ecoScore
                    : metric === "carbonSaved"
                    ? entry.carbonSaved
                    : entry.tripsCompleted}
                </div>
                <div className="text-xs text-muted-foreground">
                  {metric === "ecoScore" ? "points" : metric === "carbonSaved" ? "kg CO₂" : "trips"}
                </div>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Global Leaderboard
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            See how you rank against eco-conscious travelers worldwide
          </p>
        </div>
        <Badge variant="outline" className="gap-2">
          <Users className="w-4 h-4" />
          {entries.length} travelers
        </Badge>
      </div>

      <Tabs defaultValue="ecoScore" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="ecoScore">EcoScore</TabsTrigger>
          <TabsTrigger value="carbonSaved">Carbon Saved</TabsTrigger>
          <TabsTrigger value="trips">Trips</TabsTrigger>
        </TabsList>

        <TabsContent value="ecoScore" className="mt-4">
          <LeaderboardList entries={sortByEcoScore} metric="ecoScore" />
        </TabsContent>

        <TabsContent value="carbonSaved" className="mt-4">
          <LeaderboardList entries={sortByCarbonSaved} metric="carbonSaved" />
        </TabsContent>

        <TabsContent value="trips" className="mt-4">
          <LeaderboardList entries={sortByTrips} metric="tripsCompleted" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
