"use client"

import { Award, TrendingUp, Shield, Users, Leaf, Flame } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge as UIBadge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/lib/types"

interface BadgeCardProps {
  badge: Badge
  isEarned: boolean
  progress?: number
}

export function BadgeCard({ badge, isEarned, progress = 0 }: BadgeCardProps) {
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "carbon":
        return <Leaf className="w-6 h-6" />
      case "explorer":
        return <TrendingUp className="w-6 h-6" />
      case "resilience":
        return <Shield className="w-6 h-6" />
      case "community":
        return <Users className="w-6 h-6" />
      default:
        return <Award className="w-6 h-6" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "carbon":
        return "text-green-500"
      case "explorer":
        return "text-blue-500"
      case "resilience":
        return "text-orange-500"
      case "community":
        return "text-purple-500"
      default:
        return "text-primary"
    }
  }

  return (
    <Card
      className={`p-4 transition-all ${
        isEarned
          ? "bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30"
          : "bg-muted/50 opacity-60 grayscale"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center ${
            isEarned ? "bg-primary/20" : "bg-muted"
          } ${getCategoryColor(badge.category)}`}
        >
          {badge.icon ? <span className="text-2xl">{badge.icon}</span> : getCategoryIcon(badge.category)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className={`font-semibold ${isEarned ? "text-foreground" : "text-muted-foreground"}`}>
              {badge.name}
            </h4>
            {isEarned && (
              <UIBadge variant="default" className="text-xs">
                Earned
              </UIBadge>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">{badge.description}</p>
          
          {!isEarned && progress > 0 && (
            <div className="mt-2 space-y-1">
              <Progress value={progress} className="h-1" />
              <p className="text-xs text-muted-foreground">{progress}% complete</p>
            </div>
          )}
          
          {isEarned && badge.earnedAt && (
            <p className="text-xs text-muted-foreground mt-2">
              Earned {new Date(badge.earnedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </Card>
  )
}

interface BadgeShowcaseProps {
  badges: Badge[]
  earnedBadgeIds: string[]
  badgeProgress?: Record<string, number>
}

export function BadgeShowcase({ badges, earnedBadgeIds, badgeProgress = {} }: BadgeShowcaseProps) {
  const earnedBadges = badges.filter((badge) => earnedBadgeIds.includes(badge.id))
  const unearnedBadges = badges.filter((badge) => !earnedBadgeIds.includes(badge.id))

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-primary">{earnedBadges.length}</div>
          <div className="text-sm text-muted-foreground mt-1">Badges Earned</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-muted-foreground">{badges.length}</div>
          <div className="text-sm text-muted-foreground mt-1">Total Badges</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-orange-500">
            {earnedBadges.filter((b) => b.category === "resilience").length}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Resilience</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-3xl font-bold text-green-500">
            {earnedBadges.filter((b) => b.category === "carbon").length}
          </div>
          <div className="text-sm text-muted-foreground mt-1">Carbon Saver</div>
        </Card>
      </div>

      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Your Achievements</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {earnedBadges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} isEarned={true} />
            ))}
          </div>
        </div>
      )}

      {/* Unearned Badges */}
      {unearnedBadges.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Available Badges</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {unearnedBadges.map((badge) => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                isEarned={false}
                progress={badgeProgress[badge.id]}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
