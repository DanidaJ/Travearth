"use client"

import type React from "react"

import { useState } from "react"
import { Calculator, Plane, Hotel, Car } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function CarbonCalculator() {
  const [result, setResult] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    flightDistance: "",
    flightClass: "economy",
    hotelNights: "",
    carDistance: "",
  })

  const calculateCarbon = (e: React.FormEvent) => {
    e.preventDefault()

    // Simple carbon calculation (kg CO2)
    const flightCarbon = Number.parseFloat(formData.flightDistance) * (formData.flightClass === "economy" ? 0.15 : 0.3)
    const hotelCarbon = Number.parseFloat(formData.hotelNights) * 15
    const carCarbon = Number.parseFloat(formData.carDistance) * 0.2

    const total = flightCarbon + hotelCarbon + carCarbon
    setResult(total)
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calculator className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Carbon Calculator</h3>
      </div>

      <form onSubmit={calculateCarbon} className="space-y-4">
        <div>
          <Label htmlFor="flightDistance" className="flex items-center gap-2">
            <Plane className="w-4 h-4" />
            Flight Distance (km)
          </Label>
          <Input
            id="flightDistance"
            type="number"
            placeholder="e.g., 5000"
            value={formData.flightDistance}
            onChange={(e) => setFormData({ ...formData, flightDistance: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="flightClass">Flight Class</Label>
          <Select
            value={formData.flightClass}
            onValueChange={(value) => setFormData({ ...formData, flightClass: value })}
          >
            <SelectTrigger id="flightClass">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="economy">Economy</SelectItem>
              <SelectItem value="business">Business</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="hotelNights" className="flex items-center gap-2">
            <Hotel className="w-4 h-4" />
            Hotel Nights
          </Label>
          <Input
            id="hotelNights"
            type="number"
            placeholder="e.g., 7"
            value={formData.hotelNights}
            onChange={(e) => setFormData({ ...formData, hotelNights: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="carDistance" className="flex items-center gap-2">
            <Car className="w-4 h-4" />
            Car Distance (km)
          </Label>
          <Input
            id="carDistance"
            type="number"
            placeholder="e.g., 500"
            value={formData.carDistance}
            onChange={(e) => setFormData({ ...formData, carDistance: e.target.value })}
          />
        </div>

        <Button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white">
          Calculate Carbon Footprint
        </Button>
      </form>

      {result !== null && (
        <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-1">Estimated Carbon Footprint</div>
            <div className="text-3xl font-bold text-primary">{result.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">kg CO₂</div>
          </div>
        </div>
      )}
    </Card>
  )
}
