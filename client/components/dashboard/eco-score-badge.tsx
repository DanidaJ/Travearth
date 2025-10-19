import { Award, TrendingUp } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface EcoScoreBadgeProps {
  score: number
  level: string
}

export function EcoScoreBadge({ score, level }: EcoScoreBadgeProps) {
  const maxScore = 1000
  const percentage = (score / maxScore) * 100

  return (
    <div className="flex items-center gap-6">
      <div className="flex-shrink-0">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-card flex flex-col items-center justify-center">
            <Award className="w-8 h-8 text-primary mb-1" />
            <span className="text-2xl font-bold text-foreground">{score}</span>
          </div>
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-semibold text-foreground">{level}</span>
          <div className="flex items-center gap-1 text-sm text-primary">
            <TrendingUp className="w-4 h-4" />
            <span>+45 this month</span>
          </div>
        </div>
        <Progress value={percentage} className="h-2 mb-2" />
        <p className="text-sm text-muted-foreground">{maxScore - score} points to reach Eco Legend status</p>
      </div>
    </div>
  )
}
