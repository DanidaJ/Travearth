"use client"

import { useState } from "react"
import { QRCodeCanvas } from "qrcode.react"
import { Download, Share2, QrCode, Award } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface SmartSouvenirProps {
  tripId: string
  tripName: string
  ecoScore: number
  carbonSaved: number
  badges: Array<{ name: string; icon: string }>
  shareUrl: string
}

export function SmartSouvenir({
  tripId,
  tripName,
  ecoScore,
  carbonSaved,
  badges,
  shareUrl,
}: SmartSouvenirProps) {
  const [qrSize, setQrSize] = useState(256)

  const downloadQR = () => {
    const canvas = document.getElementById("smart-souvenir-qr") as HTMLCanvasElement
    if (canvas) {
      const url = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.download = `Travearth-souvenir-${tripId}.png`
      link.href = url
      link.click()
    }
  }

  const shareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My Travearth Journey: ${tripName}`,
          text: `Check out my sustainable travel journey! EcoScore: ${ecoScore}, Carbon Saved: ${carbonSaved}kg CO₂`,
          url: shareUrl,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareUrl)
      alert("Link copied to clipboard!")
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <QrCode className="w-4 h-4" />
          Generate Smart Souvenir
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" />
            Your Smart Souvenir
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Trip Info */}
          <div className="text-center">
            <h3 className="font-semibold text-lg mb-2">{tripName}</h3>
            <p className="text-sm text-muted-foreground">
              Scan this QR code to view your complete eco-friendly travel journey
            </p>
          </div>

          {/* QR Code */}
          <div className="flex justify-center p-6 bg-white rounded-lg">
            <QRCodeCanvas
              id="smart-souvenir-qr"
              value={shareUrl}
              size={qrSize}
              level="H"
              includeMargin={true}
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 text-center bg-primary/5">
              <div className="text-2xl font-bold text-primary">{ecoScore}</div>
              <div className="text-xs text-muted-foreground mt-1">EcoScore</div>
            </Card>
            <Card className="p-4 text-center bg-green-500/5">
              <div className="text-2xl font-bold text-green-600">{carbonSaved}</div>
              <div className="text-xs text-muted-foreground mt-1">kg CO₂ Saved</div>
            </Card>
          </div>

          {/* Badges */}
          {badges.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2 flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                Badges Earned
              </div>
              <div className="flex flex-wrap gap-2">
                {badges.map((badge, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    <span>{badge.icon}</span>
                    <span>{badge.name}</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Button onClick={downloadQR} variant="outline" className="flex-1 gap-2">
              <Download className="w-4 h-4" />
              Download
            </Button>
            <Button onClick={shareQR} className="flex-1 gap-2 bg-primary hover:bg-primary/90">
              <Share2 className="w-4 h-4" />
              Share
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-xs text-muted-foreground text-center p-3 bg-muted rounded-lg">
            💡 Print this QR code and attach it to a physical souvenir. Anyone can scan it to see your
            eco-friendly travel journey!
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
