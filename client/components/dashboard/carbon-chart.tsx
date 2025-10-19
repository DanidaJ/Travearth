"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { month: "Jan", predicted: 400, actual: 380 },
  { month: "Feb", predicted: 300, actual: 320 },
  { month: "Mar", predicted: 500, actual: 450 },
  { month: "Apr", predicted: 450, actual: 420 },
  { month: "May", predicted: 600, actual: 550 },
  { month: "Jun", predicted: 550, actual: 520 },
]

export function CarbonChart() {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.32 0.08 155)" />
          <XAxis dataKey="month" stroke="oklch(0.75 0.04 155)" fontSize={12} />
          <YAxis stroke="oklch(0.75 0.04 155)" fontSize={12} />
          <Tooltip
            contentStyle={{
              backgroundColor: "oklch(0.22 0.08 155)",
              border: "1px solid oklch(0.32 0.08 155)",
              borderRadius: "8px",
              color: "oklch(0.98 0 0)",
            }}
          />
          <Line
            type="monotone"
            dataKey="predicted"
            stroke="oklch(0.55 0.15 160)"
            strokeWidth={2}
            dot={{ fill: "oklch(0.55 0.15 160)" }}
          />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="oklch(0.45 0.12 165)"
            strokeWidth={2}
            dot={{ fill: "oklch(0.45 0.12 165)" }}
          />
        </LineChart>
      </ResponsiveContainer>
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
    </div>
  )
}
