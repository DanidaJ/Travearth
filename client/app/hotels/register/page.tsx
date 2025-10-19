"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Leaf, Building, MapPin, Award, Upload, Plus, X } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

export default function HotelRegistrationPage() {
  const router = useRouter()
  const [certifications, setCertifications] = useState<string[]>([])
  const [amenities, setAmenities] = useState<string[]>([])
  const [newCertification, setNewCertification] = useState("")
  const [newAmenity, setNewAmenity] = useState("")

  const addCertification = () => {
    if (newCertification.trim()) {
      setCertifications([...certifications, newCertification.trim()])
      setNewCertification("")
    }
  }

  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index))
  }

  const addAmenity = () => {
    if (newAmenity.trim()) {
      setAmenities([...amenities, newAmenity.trim()])
      setNewAmenity("")
    }
  }

  const removeAmenity = (index: number) => {
    setAmenities(amenities.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle registration
    router.push("/hotels/register/success")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold text-foreground">Travearth</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/hotels/dashboard">Dashboard</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/hotels">Back to Hotels</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Building className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3">Register Your Hotel</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join our network of sustainable accommodations and connect with eco-conscious travelers
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-primary" />
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="hotelName">Hotel Name *</Label>
                <Input id="hotelName" placeholder="e.g., Green Mountain Lodge" required />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Contact Email *</Label>
                  <Input id="email" type="email" placeholder="contact@hotel.com" required />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" required />
                </div>
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input id="website" type="url" placeholder="https://yourhotel.com" />
              </div>
            </div>
          </Card>

          {/* Location */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Location
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="address">Street Address *</Label>
                <Input id="address" placeholder="123 Eco Street" required />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" placeholder="San José" required />
                </div>
                <div>
                  <Label htmlFor="state">State/Province</Label>
                  <Input id="state" placeholder="San José Province" />
                </div>
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input id="country" placeholder="Costa Rica" required />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input id="latitude" type="number" step="any" placeholder="9.9281" />
                </div>
                <div>
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input id="longitude" type="number" step="any" placeholder="-84.0907" />
                </div>
              </div>
            </div>
          </Card>

          {/* Sustainability */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Sustainability Information
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="description">Sustainability Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your hotel's eco-friendly practices and initiatives..."
                  rows={4}
                  required
                />
              </div>

              <div>
                <Label>Certifications</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add certification (e.g., LEED Gold)"
                    value={newCertification}
                    onChange={(e) => setNewCertification(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCertification())}
                  />
                  <Button type="button" onClick={addCertification} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {certifications.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {certifications.map((cert, index) => (
                      <div key={index} className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                        <span className="text-sm text-foreground">{cert}</span>
                        <button
                          type="button"
                          onClick={() => removeCertification(index)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <Label>Eco-Friendly Amenities</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add amenity (e.g., Solar Power)"
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAmenity())}
                  />
                  <Button type="button" onClick={addAmenity} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-2 px-3 py-1 bg-accent/10 rounded-full">
                        <span className="text-sm text-foreground">{amenity}</span>
                        <button
                          type="button"
                          onClick={() => removeAmenity(index)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pricePerNight">Price Per Night (USD) *</Label>
                  <Input id="pricePerNight" type="number" placeholder="120" required />
                </div>
                <div>
                  <Label htmlFor="carbonPerNight">Estimated Carbon Per Night (kg CO₂)</Label>
                  <Input id="carbonPerNight" type="number" step="0.1" placeholder="5.0" />
                </div>
              </div>
            </div>
          </Card>

          {/* Images */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Hotel Images
            </h2>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-2">Drag and drop images or click to browse</p>
              <Button type="button" variant="outline" size="sm">
                Choose Files
              </Button>
            </div>
          </Card>

          {/* Terms */}
          <Card className="p-6">
            <div className="flex items-start gap-3">
              <Checkbox id="terms" required />
              <div className="flex-1">
                <Label htmlFor="terms" className="text-sm cursor-pointer">
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </Link>
                  . I confirm that all information provided is accurate and that my hotel meets basic sustainability
                  standards.
                </Label>
              </div>
            </div>
          </Card>

          {/* Submit */}
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" className="bg-primary hover:bg-primary-dark text-white">
              Submit Registration
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
