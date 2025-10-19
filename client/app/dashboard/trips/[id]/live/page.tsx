"use client"

import { use, useEffect, useState } from "react"
import { ArrowLeft, Activity, TrendingDown, MapPin, Lightbulb, AlertTriangle, Leaf, Navigation, Users, Clock, ThermometerSun, CheckCircle, Download, Share2, Award, Trophy, Info } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RealTimeTracker } from "@/components/carbon/real-time-tracker"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface Trip {
  _id: string
  title: string
  startDate: string
  endDate: string
  predictedCarbon?: number
  shareCode?: string
  metadata?: {
    destinations?: Array<{ name: string; country: string; lat?: number; lng?: number }>
    activities?: Array<any>
    hotels?: Array<any>
  }
}

interface EcoTip {
  id: string
  category: string
  icon: any
  title: string
  description: string
  impact: "high" | "medium" | "low"
}

interface POIData {
  name: string
  crowdLevel: number // 0-100
  ecoScore: number // 0-100
  alternatives: string[]
  distance: number // km
}

export default function LiveTripDashboard({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(true)
  const [ecoTips, setEcoTips] = useState<EcoTip[]>([])
  const [poiData, setPoiData] = useState<POIData[]>([])
  const [currentCarbon, setCurrentCarbon] = useState(0)
  const [dailyTarget, setDailyTarget] = useState(65) // kg CO2 per day
  const [showSummaryDialog, setShowSummaryDialog] = useState(false)
  const [tripCompleted, setTripCompleted] = useState(false)
  const [showEcoActionsDialog, setShowEcoActionsDialog] = useState(false)

  // Simulate tracking for testing (adds carbon incrementally)
  const simulateTracking = () => {
    let simCarbon = 0
    const interval = setInterval(() => {
      simCarbon += Math.random() * 2 + 1 // Add 1-3 kg per second
      setCurrentCarbon(simCarbon)
      
      // Stop at reasonable amount (70% of predicted)
      if (trip?.predictedCarbon && simCarbon >= trip.predictedCarbon * 0.7) {
        clearInterval(interval)
      }
    }, 1000)
    
    // Auto stop after 10 seconds
    setTimeout(() => clearInterval(interval), 10000)
  }
  
  useEffect(() => {
    fetchTripData()
  }, [id])

  useEffect(() => {
    if (trip) {
      loadEcoTips()
      loadPOIData()
    }
  }, [trip])

  const fetchTripData = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'
      const response = await fetch(`${apiUrl}/trips/${id}`)
      
      if (!response.ok) throw new Error('Failed to fetch trip')
      
      const data = await response.json()
      setTrip(data.trip || data)
    } catch (err) {
      console.error('Error fetching trip:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadEcoTips = () => {
    if (!trip?.metadata?.destinations?.[0]) return

    const destination = trip.metadata.destinations[0]
    
    // Generate destination-specific eco tips
    const tips: EcoTip[] = [
      {
        id: "transport-1",
        category: "Transport",
        icon: Navigation,
        title: `Use Public Transport in ${destination.name}`,
        description: `Public transportation reduces carbon emissions by 45% compared to private cars. ${destination.name} has efficient metro and bus systems.`,
        impact: "high"
      },
      {
        id: "transport-2",
        category: "Transport",
        icon: Activity,
        title: "Walk or Cycle Short Distances",
        description: "For distances under 2km, walking or cycling produces zero emissions and helps you explore the city better.",
        impact: "high"
      },
      {
        id: "waste-1",
        category: "Waste",
        icon: Leaf,
        title: "Carry Reusable Water Bottle",
        description: `Avoid single-use plastic bottles. Refill at hotels or public water fountains in ${destination.name}.`,
        impact: "medium"
      },
      {
        id: "waste-2",
        category: "Waste",
        icon: Leaf,
        title: "Refuse Plastic Bags",
        description: "Bring a reusable shopping bag for souvenirs and local market visits.",
        impact: "medium"
      },
      {
        id: "energy-1",
        category: "Energy",
        icon: ThermometerSun,
        title: "Manage Hotel AC/Heating",
        description: "Turn off AC when leaving your room. Set temperature to moderate levels (24-26°C).",
        impact: "medium"
      },
      {
        id: "food-1",
        category: "Food",
        icon: Lightbulb,
        title: "Eat Local & Seasonal Food",
        description: `Try local ${destination.country} cuisine using seasonal ingredients. Reduces food miles significantly.`,
        impact: "high"
      },
      {
        id: "food-2",
        category: "Food",
        icon: Lightbulb,
        title: "Choose Plant-Based Options",
        description: "Opt for vegetarian meals when possible. Plant-based diets have 50% lower carbon footprint.",
        impact: "high"
      },
      {
        id: "water-1",
        category: "Water",
        icon: Activity,
        title: "Take Shorter Showers",
        description: "Limit showers to 5 minutes. Saves water and energy used for heating.",
        impact: "low"
      },
      {
        id: "shopping-1",
        category: "Shopping",
        icon: Leaf,
        title: "Support Local Eco-Businesses",
        description: `Choose shops and restaurants in ${destination.name} with eco-certifications or sustainable practices.`,
        impact: "medium"
      }
    ]
    
    setEcoTips(tips)
  }

  const loadPOIData = () => {
    if (!trip?.metadata?.activities) return

    // Simulate crowd/traffic data for POIs
    const pois: POIData[] = [
      {
        name: "Main Tourist Attraction",
        crowdLevel: 85,
        ecoScore: 45,
        alternatives: ["Local Park", "Cultural Center", "Historic Garden"],
        distance: 2.3
      },
      {
        name: "Shopping District",
        crowdLevel: 72,
        ecoScore: 60,
        alternatives: ["Local Market", "Artisan Quarter"],
        distance: 1.5
      },
      {
        name: "Beach/Waterfront",
        crowdLevel: 45,
        ecoScore: 85,
        alternatives: [],
        distance: 0
      }
    ]
    
    setPoiData(pois)
  }

  const getEcoBalanceStatus = (crowdLevel: number, ecoScore: number) => {
    const balance = ecoScore - (crowdLevel * 0.5)
    if (balance > 50) return { status: "excellent", color: "text-green-600", bg: "bg-green-50" }
    if (balance > 20) return { status: "good", color: "text-blue-600", bg: "bg-blue-50" }
    if (balance > 0) return { status: "moderate", color: "text-yellow-600", bg: "bg-yellow-50" }
    return { status: "poor", color: "text-red-600", bg: "bg-red-50" }
  }

  const getCrowdThreshold = (level: number) => {
    if (level > 80) return { status: "Very Crowded", color: "destructive" }
    if (level > 60) return { status: "Crowded", color: "warning" }
    if (level > 40) return { status: "Moderate", color: "default" }
    return { status: "Low Crowd", color: "success" }
  }

  const handleFinishTrip = () => {
    setTripCompleted(true)
    setShowSummaryDialog(true)
  }

  const generateQRCode = () => {
    // QR code URL with trip share code
    const shareUrl = `${window.location.origin}/shared/${trip?.shareCode || trip?._id}`
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`
  }

  const downloadSummary = async () => {
    try {
      // Import jsPDF
      const { jsPDF } = await import('jspdf')
      
      // Create new PDF document (A4 size)
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      // Page setup
      const pageWidth = doc.internal.pageSize.getWidth()
      const pageHeight = doc.internal.pageSize.getHeight()
      let yPos = 20

      // Helper function to add text with word wrap
      const addText = (text: string, size: number, isBold = false, color = [0, 0, 0]) => {
        doc.setFontSize(size)
        doc.setFont('helvetica', isBold ? 'bold' : 'normal')
        doc.setTextColor(color[0], color[1], color[2])
        const lines = doc.splitTextToSize(text, pageWidth - 40)
        doc.text(lines, 20, yPos)
        yPos += lines.length * (size / 3) + 5
      }

      // Title
      addText('TRIP SUMMARY', 24, true, [34, 197, 94])
      addText(trip?.title || 'Eco Trip', 18, true)
      addText(`Date: ${new Date().toLocaleDateString()}`, 12)
      yPos += 5

      // Metrics Section
      addText('ENVIRONMENTAL IMPACT', 16, true, [59, 130, 246])
      
      // Real CO2 Footprint
      addText(`Real CO2 Footprint: ${currentCarbon.toFixed(1)} kg`, 12, true, [34, 197, 94])
      addText('Tracked from your actual journey', 10, false, [107, 114, 128])
      yPos += 3

      // Eco Score (percentage saved vs predicted)
      const ecoScore = trip?.predictedCarbon && currentCarbon > 0 
        ? Math.max(0, ((trip.predictedCarbon - currentCarbon) / trip.predictedCarbon * 100)).toFixed(0)
        : '0'
      addText(`Eco Score: ${ecoScore}% saved`, 12, true, [59, 130, 246])
      addText(`vs predicted ${trip?.predictedCarbon?.toFixed(1) || '0'} kg`, 10, false, [107, 114, 128])
      yPos += 3

      // CO2 Saved Amount
      const co2Saved = trip?.predictedCarbon && currentCarbon > 0
        ? Math.max(0, trip.predictedCarbon - currentCarbon).toFixed(1)
        : '0'
      addText(`CO2 Saved: ${co2Saved} kg`, 12, true, [168, 85, 247])
      addText('Compared to initial forecast', 10, false, [107, 114, 128])
      yPos += 10

      // Badge Section
      addText('ACHIEVEMENTS', 16, true, [59, 130, 246])
      const scoreNum = parseFloat(ecoScore)
      const badgeTitle = scoreNum >= 50 ? 'Eco Legend - Level 5' 
        : scoreNum >= 30 ? 'Eco Warrior - Level 4'
        : scoreNum >= 15 ? 'Green Traveler - Level 3'
        : 'Eco Beginner - Level 1'
      addText(`Sustainability Badge: ${badgeTitle}`, 12, true, [34, 197, 94])
      addText(`Based on ${ecoScore}% carbon reduction`, 12, true, [168, 85, 247])
      yPos += 10

      // Top Eco Moments
      addText('TOP 3 ECO MOMENTS', 16, true, [59, 130, 246])
      
      addText('1. Cycling Through Amsterdam', 12, true)
      addText('   -5.2 kg CO2 - Low carbon transport choice', 10, false, [107, 114, 128])
      yPos += 3

      addText('2. Solar-Powered Eco Lodge', 12, true)
      addText('   -3.8 kg CO2 - Renewable energy accommodation', 10, false, [107, 114, 128])
      yPos += 3

      addText('3. Zero-Waste Cafe Visit', 12, true)
      addText('   -2.1 kg CO2 - Supporting local sustainable business', 10, false, [107, 114, 128])
      yPos += 10

      // Journey Map
      if (trip?.itinerary?.length > 0) {
        addText('JOURNEY MAP', 16, true, [59, 130, 246])
        trip.itinerary.slice(0, 5).forEach((item: any, index: number) => {
          addText(`${index + 1}. ${item.destination || item.location || 'Destination'}`, 11)
          if (item.date) {
            addText(`   ${new Date(item.date).toLocaleDateString()}`, 9, false, [107, 114, 128])
          }
        })
        yPos += 10
      }

      // QR Code Section
      addText('SHARE YOUR JOURNEY', 16, true, [59, 130, 246])
      addText('Visit the URL below to view full trip details online', 10, false, [107, 114, 128])
      
      // Share URL
      const shareUrl = `${window.location.origin}/shared/${trip?._id}`
      addText(`${shareUrl}`, 9, false, [59, 130, 246])
      yPos += 10

      // Footer
      doc.setFontSize(8)
      doc.setTextColor(156, 163, 175)
      doc.text('Generated by EcoPlan - Sustainable Travel Platform', pageWidth / 2, pageHeight - 10, { align: 'center' })

      // Save PDF
      const fileName = `${trip?.title?.replace(/\s+/g, '-')}-eco-summary-${Date.now()}.pdf`
      doc.save(fileName)
      
      alert('PDF downloaded successfully!')
    } catch (error) {
      console.error('Download error:', error)
      alert('PDF generation failed: ' + (error as Error).message)
    }
  }

  const downloadHTML = () => {
    try {
      // Get the dialog content
      const dialogElement = document.getElementById('trip-summary-content')
      if (!dialogElement) {
        alert('Summary content not found. Please try again.')
        return
      }

      // Clone the element to avoid modifying the original
      const clone = dialogElement.cloneNode(true) as HTMLElement
      
      // Create a standalone HTML document
      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${trip?.title || 'Eco Trip'} - Trip Summary</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      background: #f3f4f6;
      padding: 20px;
      line-height: 1.6;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      padding: 32px;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    h1 {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 16px;
      background: linear-gradient(to right, #22c55e, #3b82f6, #a855f7);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    h2 {
      font-size: 20px;
      font-weight: bold;
      margin-top: 24px;
      margin-bottom: 12px;
      color: #1f2937;
    }
    h3 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 8px;
      color: #374151;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin: 20px 0;
    }
    .metric-card {
      background: #f9fafb;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    .metric-value {
      font-size: 24px;
      font-weight: bold;
      color: #22c55e;
    }
    .metric-label {
      font-size: 14px;
      color: #6b7280;
      margin-top: 4px;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 16px;
      font-size: 12px;
      font-weight: 600;
      margin: 4px;
    }
    .badge-green {
      background: #dcfce7;
      color: #15803d;
    }
    .badge-purple {
      background: #faf5ff;
      color: #7e22ce;
    }
    .eco-moment {
      background: #f9fafb;
      padding: 12px;
      border-radius: 8px;
      margin-bottom: 12px;
      border-left: 4px solid #22c55e;
    }
    .journey-item {
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #9ca3af;
      font-size: 12px;
    }
    .qr-section {
      text-align: center;
      margin: 20px 0;
      padding: 20px;
      background: #faf5ff;
      border-radius: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>TRIP SUMMARY</h1>
    <h2>${trip?.title || 'Eco Trip'}</h2>
    <p style="color: #6b7280; margin-bottom: 24px;">Date: ${new Date().toLocaleDateString()}</p>
    
    <h2>ENVIRONMENTAL IMPACT</h2>
    <div class="metrics">
      <div class="metric-card">
        <div class="metric-value">${currentCarbon.toFixed(1)} kg</div>
        <div class="metric-label">Real CO2 Footprint</div>
        <p style="font-size: 12px; color: #6b7280; margin-top: 8px;">Tracked from your journey</p>
      </div>
      <div class="metric-card">
        <div class="metric-value" style="color: #3b82f6;">
          ${trip?.predictedCarbon && currentCarbon > 0 
            ? Math.max(0, ((trip.predictedCarbon - currentCarbon) / trip.predictedCarbon * 100)).toFixed(0)
            : '0'}%
        </div>
        <div class="metric-label">Eco Score</div>
        <p style="font-size: 12px; color: #6b7280; margin-top: 8px;">
          vs predicted ${trip?.predictedCarbon?.toFixed(1) || '0'} kg
        </p>
      </div>
    </div>
    
    <h2>ACHIEVEMENTS</h2>
    <div>
      <span class="badge badge-green">
        ${(() => {
          const score = trip?.predictedCarbon && currentCarbon > 0 
            ? Math.max(0, ((trip.predictedCarbon - currentCarbon) / trip.predictedCarbon * 100))
            : 0
          return score >= 50 ? 'Eco Legend - Level 5' 
            : score >= 30 ? 'Eco Warrior - Level 4'
            : score >= 15 ? 'Green Traveler - Level 3'
            : 'Eco Beginner - Level 1'
        })()}
      </span>
      <span class="badge badge-purple">
        ${trip?.predictedCarbon && currentCarbon > 0 
          ? `${Math.max(0, ((trip.predictedCarbon - currentCarbon) / trip.predictedCarbon * 100)).toFixed(0)}% Carbon Reduction`
          : 'Start tracking'}
      </span>
    </div>
    
    <h2>TOP 3 ECO MOMENTS</h2>
    <div class="eco-moment">
      <h3>1. Cycling Through Amsterdam</h3>
      <p style="color: #6b7280; font-size: 14px;">-5.2 kg CO2 - Low carbon transport choice</p>
    </div>
    <div class="eco-moment">
      <h3>2. Solar-Powered Eco Lodge</h3>
      <p style="color: #6b7280; font-size: 14px;">-3.8 kg CO2 - Renewable energy accommodation</p>
    </div>
    <div class="eco-moment">
      <h3>3. Zero-Waste Cafe Visit</h3>
      <p style="color: #6b7280; font-size: 14px;">-2.1 kg CO2 - Supporting local sustainable business</p>
    </div>
    
    ${trip?.itinerary?.length > 0 ? `
    <h2>JOURNEY MAP</h2>
    <div>
      ${trip.itinerary.slice(0, 5).map((item: any, index: number) => `
        <div class="journey-item">
          <strong>${index + 1}. ${item.destination || item.location || 'Destination'}</strong>
          ${item.date ? `<br><span style="color: #6b7280; font-size: 14px;">${new Date(item.date).toLocaleDateString()}</span>` : ''}
        </div>
      `).join('')}
    </div>
    ` : ''}
    
    <div class="qr-section">
      <h2>SHARE YOUR JOURNEY</h2>
      <p style="color: #6b7280; margin-bottom: 12px;">Visit the URL below to view full trip details online</p>
      <p style="color: #3b82f6; word-break: break-all;">
        ${window.location.origin}/shared/${trip?._id}
      </p>
    </div>
    
    <div class="footer">
      Generated by EcoPlan - Sustainable Travel Platform
    </div>
  </div>
</body>
</html>
      `

      // Create blob and download
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${trip?.title?.replace(/\s+/g, '-')}-eco-summary-${Date.now()}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      alert('HTML downloaded successfully!')
    } catch (error) {
      console.error('HTML download error:', error)
      alert('HTML download failed: ' + (error as Error).message)
    }
  }

  const shareSummary = async () => {
    const shareUrl = `${window.location.origin}/shared/${trip?.shareCode || trip?._id}`
    const shareText = `🌍 I just completed my ${trip?.title} trip and saved 23 kg CO₂! That's like planting 3 trees 🌳\n\nCheck out my eco-friendly adventure:`

    if (navigator.share) {
      try {
        // Try native Web Share API first (simpler approach)
        await navigator.share({
          title: `My ${trip?.title} Trip - Eco Summary`,
          text: shareText,
          url: shareUrl
        })
      } catch (err: any) {
        // User cancelled or share failed
        if (err.name !== 'AbortError') {
          // Fallback to clipboard
          try {
            await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`)
            alert('✅ Share text and link copied to clipboard!')
          } catch (clipErr) {
            alert(`Share this: ${shareUrl}`)
          }
        }
      }
    } else {
      // Desktop fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(`${shareText}\n\n${shareUrl}`)
        alert('✅ Share message copied to clipboard! You can now paste it on social media.')
      } catch (err) {
        // Final fallback
        const textarea = document.createElement('textarea')
        textarea.value = `${shareText}\n\n${shareUrl}`
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        alert('✅ Share message copied! Paste it on your favorite social media.')
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        <span className="ml-3 text-muted-foreground">Loading live dashboard...</span>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/trips">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Trips
          </Link>
        </Button>
        <Alert variant="destructive">
          <AlertDescription>Trip not found</AlertDescription>
        </Alert>
      </div>
    )
  }

  const destinations = trip.metadata?.destinations || []

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <Button variant="ghost" asChild className="mb-2 -ml-3">
            <Link href={`/dashboard/trips/${id}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Trip Details
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-foreground">🌍 Live Trip Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            {trip.title} • {destinations.map(d => d.name).join(', ')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-green-500 text-white text-lg px-4 py-2">
            <Activity className="w-4 h-4 mr-2" />
            Trip Active
          </Badge>
          <Button 
            size="sm"
            variant="outline"
            className="border-orange-500 text-orange-600 hover:bg-orange-50"
            onClick={simulateTracking}
            title="Test: Simulate carbon tracking data"
          >
            <TrendingDown className="w-4 h-4 mr-2" />
            Test Tracking
          </Button>
          <Button 
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            onClick={handleFinishTrip}
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Finish Trip
          </Button>
        </div>
      </div>

      <Tabs defaultValue="tracking" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tracking">Real-Time Tracking</TabsTrigger>
          <TabsTrigger value="tips">Eco Tips</TabsTrigger>
          <TabsTrigger value="crowd">Crowd & Alternatives</TabsTrigger>
        </TabsList>

        {/* Tab 1: Real-Time Tracking */}
        <TabsContent value="tracking" className="space-y-6 mt-6">
          {/* Real-Time Carbon Tracker */}
          <RealTimeTracker onCarbonUpdate={setCurrentCarbon} />

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <TrendingDown className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Predicted Footprint</div>
                  <div className="text-xl font-bold text-foreground">
                    {trip.predictedCarbon ? trip.predictedCarbon.toFixed(1) : '0'} kg CO₂
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Trip estimate</div>
                </div>
              </div>
            </Card>

            <Card className="p-4 border-2 border-green-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Activity className={`w-5 h-5 text-green-600 ${currentCarbon > 0 ? 'animate-pulse' : ''}`} />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Real-Time Carbon</div>
                  <div className="text-xl font-bold text-green-600">
                    {currentCarbon.toFixed(1)} kg CO₂
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {currentCarbon > 0 ? '🟢 Tracking active' : 'Start tracking above'}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">Eco Actions</div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0"
                      onClick={() => setShowEcoActionsDialog(true)}
                    >
                      <Info className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                    </Button>
                  </div>
                  <div className="text-xl font-bold text-foreground">0</div>
                  <div className="text-xs text-muted-foreground mt-1">Click info for tips</div>
                </div>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Distance Traveled</div>
                  <div className="text-xl font-bold text-foreground">
                    {((currentCarbon / 0.12) * 0.8).toFixed(1)} km
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    Based on emissions
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Daily Progress */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Daily Carbon Budget</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Today's Emissions</span>
                  <span className="text-foreground font-medium">
                    {currentCarbon.toFixed(1)} / {dailyTarget} kg CO₂
                  </span>
                </div>
                <Progress value={(currentCarbon / dailyTarget) * 100} className="h-3" />
              </div>
              
              {currentCarbon > dailyTarget * 0.8 && (
                <Alert className="border-yellow-500 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertTitle className="text-yellow-800">Approaching Daily Limit</AlertTitle>
                  <AlertDescription className="text-yellow-700">
                    You've used 80% of your daily carbon budget. Consider eco-friendly transport options.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </Card>

          {/* Transport Mode Breakdown */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Transport Mode Breakdown</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm">Walking/Cycling</span>
                </div>
                <span className="text-sm font-medium">45%</span>
              </div>
              <Progress value={45} className="h-2" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-sm">Public Transport</span>
                </div>
                <span className="text-sm font-medium">35%</span>
              </div>
              <Progress value={35} className="h-2" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span className="text-sm">Taxi/Ride Share</span>
                </div>
                <span className="text-sm font-medium">20%</span>
              </div>
              <Progress value={20} className="h-2" />
            </div>
          </Card>
        </TabsContent>

        {/* Tab 2: Eco Tips */}
        <TabsContent value="tips" className="space-y-6 mt-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              <h2 className="text-xl font-semibold">
                Eco-Friendly Tips for {destinations[0]?.name || 'Your Destination'}
              </h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Tailored recommendations to reduce your environmental impact during your trip
            </p>

            <div className="space-y-4">
              {ecoTips.map((tip) => {
                const Icon = tip.icon
                const impactColors = {
                  high: "bg-green-100 text-green-700 border-green-200",
                  medium: "bg-blue-100 text-blue-700 border-blue-200",
                  low: "bg-gray-100 text-gray-700 border-gray-200"
                }

                return (
                  <Card key={tip.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{tip.title}</h3>
                          <Badge variant="outline" className={impactColors[tip.impact]}>
                            {tip.impact === "high" ? "High Impact" : tip.impact === "medium" ? "Medium Impact" : "Low Impact"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{tip.description}</p>
                        <div className="mt-2">
                          <Badge variant="secondary" className="text-xs">
                            {tip.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </Card>

          {/* Carbon Savings Calculator */}
          <Card className="p-6 bg-gradient-to-br from-green-100 to-blue-100 border-2 shadow-md">
            <h3 className="text-lg font-bold mb-4 text-foreground">🌱 Your Impact</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4 border-2 border-green-300 shadow-sm">
                <div className="text-3xl font-bold text-green-700">23 kg</div>
                <div className="text-sm font-semibold text-gray-700">CO₂ Saved</div>
              </div>
              <div className="bg-white rounded-lg p-4 border-2 border-blue-300 shadow-sm">
                <div className="text-3xl font-bold text-blue-700">45 L</div>
                <div className="text-sm font-semibold text-gray-700">Water Saved</div>
              </div>
              <div className="bg-white rounded-lg p-4 border-2 border-purple-300 shadow-sm">
                <div className="text-3xl font-bold text-purple-700">8</div>
                <div className="text-sm font-semibold text-gray-700">Plastic Items Avoided</div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 3: Crowd Data & Alternatives */}
        <TabsContent value="crowd" className="space-y-6 mt-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-orange-500" />
              <h2 className="text-xl font-semibold">Crowd Levels & Eco Alternatives</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Real-time crowd data and eco-friendly alternative recommendations
            </p>

            <div className="space-y-6">
              {poiData.map((poi, index) => {
                const crowdInfo = getCrowdThreshold(poi.crowdLevel)
                const ecoBalance = getEcoBalanceStatus(poi.crowdLevel, poi.ecoScore)

                return (
                  <Card key={index} className="p-5 border-2 bg-card shadow-md">
                    <div className="space-y-4">
                      {/* POI Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-foreground">{poi.name}</h3>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge 
                              variant={crowdInfo.color === "destructive" ? "destructive" : "outline"}
                              className="font-semibold border-2"
                            >
                              <Users className="w-3 h-3 mr-1" />
                              {crowdInfo.status}
                            </Badge>
                            <Badge className={`${ecoBalance.bg} ${ecoBalance.color} border-2 font-semibold`}>
                              <Leaf className="w-3 h-3 mr-1" />
                              Eco Balance: {ecoBalance.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-muted-foreground">Eco Score</div>
                          <div className={`text-3xl font-bold ${poi.ecoScore > 70 ? 'text-green-600' : poi.ecoScore > 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {poi.ecoScore}
                          </div>
                        </div>
                      </div>

                      {/* Crowd Level Bar */}
                      <div className="bg-muted/30 p-3 rounded-lg">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-foreground font-medium">Crowd Level</span>
                          <span className="font-bold text-foreground">{poi.crowdLevel}%</span>
                        </div>
                        <Progress 
                          value={poi.crowdLevel} 
                          className={`h-3 ${poi.crowdLevel > 80 ? '[&>div]:bg-red-500' : poi.crowdLevel > 60 ? '[&>div]:bg-yellow-500' : '[&>div]:bg-green-500'}`}
                        />
                      </div>

                      {/* Eco Balance Meter */}
                      <div className={`p-4 rounded-lg border-2 ${ecoBalance.bg} ${
                        poi.ecoScore > 70 ? 'border-green-300' : 
                        poi.ecoScore > 40 ? 'border-yellow-300' : 
                        'border-red-300'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className={`w-5 h-5 ${ecoBalance.color}`} />
                          <span className={`text-base font-bold ${ecoBalance.color}`}>
                            Eco Balance Meter
                          </span>
                        </div>
                        <div className={`text-sm font-medium ${
                          poi.crowdLevel > 70 ? 'text-orange-800' : 'text-gray-700'
                        }`}>
                          {poi.crowdLevel > 80 
                            ? "⚠️ High crowds significantly impact local environment. Consider alternatives or visit during off-peak hours."
                            : poi.crowdLevel > 60
                            ? "⚠️ Moderate crowd levels. Site may experience environmental stress."
                            : "✅ Good balance between accessibility and environmental preservation."}
                        </div>
                      </div>

                      {/* Alternatives */}
                      {poi.alternatives.length > 0 && (
                        <>
                          <Separator />
                          <div>
                            <div className="flex items-center gap-2 mb-3">
                              <MapPin className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-bold text-foreground">
                                Eco-Friendly Alternatives Nearby
                              </span>
                            </div>
                            <div className="space-y-2">
                              {poi.alternatives.map((alt, altIndex) => (
                                <div 
                                  key={altIndex}
                                  className="flex items-center justify-between p-3 bg-green-100 border-2 border-green-300 rounded-lg hover:bg-green-200 transition-colors cursor-pointer"
                                >
                                  <div className="flex items-center gap-2">
                                    <Leaf className="w-4 h-4 text-green-700" />
                                    <span className="text-sm font-semibold text-green-900">{alt}</span>
                                  </div>
                                  <Badge variant="outline" className="bg-white border-2 font-medium">
                                    {poi.distance + (altIndex * 0.5)} km away
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {/* Recommendation */}
                      {poi.crowdLevel > 70 && (
                        <Alert className="border-2 border-orange-500 bg-orange-100">
                          <AlertTriangle className="h-5 w-5 text-orange-700" />
                          <AlertTitle className="text-orange-900 font-bold">Recommendation Ranking Lowered</AlertTitle>
                          <AlertDescription className="text-orange-800 font-medium">
                            Due to high crowd levels, this location's eco-score has been reduced. 
                            Consider visiting during off-peak hours (early morning or late afternoon) or explore the alternatives above.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          </Card>

          {/* Best Times to Visit */}
          <Card className="p-6 bg-gradient-to-br from-blue-100 to-purple-100 border-2">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-blue-700" />
              <h3 className="text-lg font-bold text-foreground">Best Times to Visit (Lower Crowds)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white rounded-lg p-4 border-2 border-green-300 shadow-sm">
                <div className="font-bold text-green-700 text-base">Early Morning</div>
                <div className="text-sm font-medium text-gray-700">6:00 AM - 9:00 AM</div>
                <Badge className="mt-2 bg-green-200 text-green-900 border-2 border-green-400 font-semibold">Low Crowd</Badge>
              </div>
              <div className="bg-white rounded-lg p-4 border-2 border-yellow-300 shadow-sm">
                <div className="font-bold text-yellow-700 text-base">Afternoon</div>
                <div className="text-sm font-medium text-gray-700">2:00 PM - 4:00 PM</div>
                <Badge className="mt-2 bg-yellow-200 text-yellow-900 border-2 border-yellow-400 font-semibold">Moderate</Badge>
              </div>
              <div className="bg-white rounded-lg p-4 border-2 border-green-300 shadow-sm">
                <div className="font-bold text-green-700 text-base">Late Afternoon</div>
                <div className="text-sm font-medium text-gray-700">5:00 PM - 7:00 PM</div>
                <Badge className="mt-2 bg-green-200 text-green-900 border-2 border-green-400 font-semibold">Low Crowd</Badge>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Trip Summary Dialog */}
      <Dialog open={showSummaryDialog} onOpenChange={setShowSummaryDialog}>
        <DialogContent 
          id="trip-summary-content" 
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
          style={{ backgroundColor: '#ffffff', color: '#000000' }}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2" style={{ color: '#000000' }}>
              <Trophy className="w-5 h-5 text-yellow-500" />
              Trip Completed! 🎉
            </DialogTitle>
            <DialogDescription className="text-sm" style={{ color: '#666666' }}>
              Your personalized trip summary and eco-achievement infographic
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Visual Trip Summary Header */}
            <div className="bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 p-4 rounded-lg text-white">
              <h2 className="text-xl font-bold mb-1">{trip.title}</h2>
              <p className="text-sm opacity-90">
                {destinations.map(d => d.name).join(' → ')}
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Badge className="bg-white/20 backdrop-blur text-white border-0 text-xs px-2 py-0.5">
                  🗓️ {new Date(trip.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(trip.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Badge>
                <Badge className="bg-white/20 backdrop-blur text-white border-0 text-xs px-2 py-0.5">
                  🌍 {destinations.length} Destinations
                </Badge>
              </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3 text-center border-2 border-green-300 bg-green-50" style={{ backgroundColor: '#f0fdf4' }}>
                <div className="text-2xl font-bold text-green-700">{currentCarbon.toFixed(1)} kg</div>
                <div className="text-xs font-semibold text-gray-700 mt-1">Real CO₂ Footprint</div>
                <div className="text-[10px]" style={{ color: '#6b7280' }}>From tracker</div>
              </Card>
              <Card className="p-3 text-center border-2 border-blue-300 bg-blue-50" style={{ backgroundColor: '#eff6ff' }}>
                <div className="text-2xl font-bold text-blue-700">
                  {trip.predictedCarbon && currentCarbon > 0 
                    ? Math.max(0, ((trip.predictedCarbon - currentCarbon) / trip.predictedCarbon * 100)).toFixed(0)
                    : '0'}%
                </div>
                <div className="text-xs font-semibold text-gray-700 mt-1">Eco Score</div>
                <div className="text-[10px]" style={{ color: '#6b7280' }}>
                  {trip.predictedCarbon && currentCarbon > 0 
                    ? (((trip.predictedCarbon - currentCarbon) / trip.predictedCarbon * 100) >= 30 ? 'Excellent!' 
                      : ((trip.predictedCarbon - currentCarbon) / trip.predictedCarbon * 100) >= 15 ? 'Good!' 
                      : 'Keep trying!')
                    : 'Start tracking'}
                </div>
              </Card>
            </div>

            {/* Sustainability Badge */}
            {(() => {
              const ecoScore = trip.predictedCarbon && currentCarbon > 0 
                ? Math.max(0, ((trip.predictedCarbon - currentCarbon) / trip.predictedCarbon * 100))
                : 0
              
              const getBadgeInfo = (score: number) => {
                if (score >= 50) return {
                  title: 'Eco Legend',
                  level: 'Level 5 - Master Traveler',
                  color: 'from-green-400 to-emerald-500',
                  bgColor: 'from-green-50 to-emerald-50',
                  borderColor: 'border-green-300',
                  star: '🌟',
                  rank: 'Top 5%',
                  badges: ['Carbon Negative', 'Green Transport', 'Zero Waste']
                }
                if (score >= 30) return {
                  title: 'Eco Warrior',
                  level: 'Level 4 - Advanced Traveler',
                  color: 'from-blue-400 to-cyan-500',
                  bgColor: 'from-blue-50 to-cyan-50',
                  borderColor: 'border-blue-300',
                  star: '⭐',
                  rank: 'Top 15%',
                  badges: ['Sustainable Transport', 'Low Carbon', 'Eco-Conscious']
                }
                if (score >= 15) return {
                  title: 'Green Traveler',
                  level: 'Level 3 - Intermediate',
                  color: 'from-yellow-400 to-orange-500',
                  bgColor: 'from-yellow-50 to-orange-50',
                  borderColor: 'border-yellow-300',
                  star: '⭐',
                  rank: 'Top 30%',
                  badges: ['Eco-Friendly', 'Making Progress', 'Good Start']
                }
                return {
                  title: 'Eco Beginner',
                  level: 'Level 1 - Getting Started',
                  color: 'from-gray-400 to-gray-500',
                  bgColor: 'from-gray-50 to-gray-100',
                  borderColor: 'border-gray-300',
                  star: '⚪',
                  rank: 'Keep going!',
                  badges: ['Starting Journey', 'Learning', 'Building Habits']
                }
              }
              
              const badgeInfo = getBadgeInfo(ecoScore)
              
              return (
                <Card className={`p-4 bg-gradient-to-br ${badgeInfo.bgColor} border-2 ${badgeInfo.borderColor}`} style={{ backgroundColor: '#fef3c7' }}>
                  <div className="flex items-center gap-3">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${badgeInfo.color} flex items-center justify-center text-white flex-shrink-0`}>
                      <Award className="w-8 h-8" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold" style={{ color: '#000000' }}>{badgeInfo.title}</h3>
                      <p className="text-xs" style={{ color: '#6b7280' }}>{badgeInfo.level}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {badgeInfo.badges.map((badge, idx) => (
                          <Badge key={idx} className="bg-green-600 text-white text-[10px] px-1.5 py-0">{badge}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-3xl font-bold">{badgeInfo.star}</div>
                      <div className="text-xs font-semibold text-gray-700">{badgeInfo.rank}</div>
                    </div>
                  </div>
                </Card>
              )
            })()}

            {/* Adventure Rank */}
            <Card className="p-4 border-2" style={{ backgroundColor: '#ffffff' }}>
              <h3 className="text-base font-bold mb-3 flex items-center gap-2" style={{ color: '#000000' }}>
                <Trophy className="w-4 h-4 text-yellow-500" />
                Adventure Rank
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold">Eco Traveler Rank</span>
                    <span className="text-base font-bold text-green-600">Master</span>
                  </div>
                  <Progress value={87} className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-green-500 [&>div]:to-blue-500" style={{ backgroundColor: '#e5e7eb' }} />
                  <div className="text-[10px]" style={{ color: '#6b7280' }}>Next: Eco Legend (at 95%)</div>
                </div>
                <Separator />
                <div className="grid grid-cols-4 gap-2">
                  <div className="text-center p-1.5 rounded" style={{ backgroundColor: '#f3f4f6' }}>
                    <div className="text-lg">🚶</div>
                    <div className="text-[9px] font-semibold mt-0.5">15 km</div>
                  </div>
                  <div className="text-center p-1.5 rounded" style={{ backgroundColor: '#f3f4f6' }}>
                    <div className="text-lg">🚌</div>
                    <div className="text-[9px] font-semibold mt-0.5">8 trips</div>
                  </div>
                  <div className="text-center p-1.5 rounded" style={{ backgroundColor: '#f3f4f6' }}>
                    <div className="text-lg">🌳</div>
                    <div className="text-[9px] font-semibold mt-0.5">3 trees</div>
                  </div>
                  <div className="text-center p-1.5 rounded" style={{ backgroundColor: '#f3f4f6' }}>
                    <div className="text-lg">♻️</div>
                    <div className="text-[9px] font-semibold mt-0.5">8 items</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Carbon Reduction Breakdown */}
            <Card className="p-4 border-2" style={{ backgroundColor: '#ffffff' }}>
              <h3 className="text-base font-bold mb-3 flex items-center gap-2" style={{ color: '#000000' }}>
                <Leaf className="w-4 h-4 text-green-600" />
                Carbon Savings Breakdown
              </h3>
              {trip.predictedCarbon && currentCarbon > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-start gap-2 p-2 bg-green-50 rounded-lg border-2 border-green-200" style={{ backgroundColor: '#f0fdf4' }}>
                    <div className="text-xl">�</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-green-900 text-xs">Predicted Footprint</div>
                      <div className="text-[10px] text-green-700">Initial forecast for your trip</div>
                    </div>
                    <Badge className="bg-gray-600 text-white text-[10px] px-1.5 py-0">{trip.predictedCarbon.toFixed(1)}kg</Badge>
                  </div>
                  <div className="flex items-start gap-2 p-2 bg-blue-50 rounded-lg border-2 border-blue-200" style={{ backgroundColor: '#eff6ff' }}>
                    <div className="text-xl">�</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-blue-900 text-xs">Actual Footprint (Tracked)</div>
                      <div className="text-[10px] text-blue-700">Real emissions from GPS tracking</div>
                    </div>
                    <Badge className="bg-blue-600 text-white text-[10px] px-1.5 py-0">{currentCarbon.toFixed(1)}kg</Badge>
                  </div>
                  <div className="flex items-start gap-2 p-2 bg-purple-50 rounded-lg border-2 border-purple-200" style={{ backgroundColor: '#faf5ff' }}>
                    <div className="text-xl">✨</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-purple-900 text-xs">Total Saved</div>
                      <div className="text-[10px] text-purple-700">Your eco-friendly choices paid off!</div>
                    </div>
                    <Badge className="bg-green-600 text-white text-[10px] px-1.5 py-0">
                      -{Math.max(0, trip.predictedCarbon - currentCarbon).toFixed(1)}kg
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-sm text-gray-500">Start tracking to see your carbon savings!</div>
                </div>
              )}
            </Card>

            {/* Trip Route Visual */}
            <Card className="p-4 border-2" style={{ backgroundColor: '#ffffff' }}>
              <h3 className="text-base font-bold mb-3">Your Journey Map</h3>
              <div className="bg-gradient-to-br from-blue-50 to-green-50 p-3 rounded-lg border-2 border-blue-200">
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {destinations.map((dest, index) => (
                    <div key={index} className="flex items-center gap-1">
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-base border-2 border-white shadow-lg">
                          {dest.name.charAt(0)}
                        </div>
                        <div className="text-[9px] font-semibold mt-1 text-gray-700">{dest.name}</div>
                      </div>
                      {index < destinations.length - 1 && (
                        <div className="text-lg text-gray-400">→</div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="text-center mt-3">
                  <Badge className="bg-blue-600 text-white text-[10px] px-2 py-0.5">
                    Total: 250 km • {Math.ceil((new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                  </Badge>
                </div>
              </div>
            </Card>

            {/* QR Code Souvenir */}
            <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300" style={{ backgroundColor: '#faf5ff' }}>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold mb-1" style={{ color: '#000000' }}>🎁 Your Digital Souvenir</h3>
                  <p className="text-xs mb-2" style={{ color: '#6b7280' }}>
                    Scan or share this QR code!
                  </p>
                  <div className="flex flex-wrap items-center gap-1 text-xs">
                    <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0" style={{ backgroundColor: '#ffffff', borderColor: '#9333ea' }}>
                      {trip.shareCode || 'XXXXX'}
                    </Badge>
                    <span className="text-[10px]" style={{ color: '#6b7280' }}>
                      • Valid 30 days
                    </span>
                  </div>
                </div>
                <div className="text-center flex-shrink-0">
                  <div className="bg-white p-2 rounded-lg border-2 border-purple-300 shadow-lg">
                    <img 
                      src={generateQRCode()} 
                      alt="Trip QR Code" 
                      className="w-32 h-32"
                    />
                  </div>
                  <p className="text-[10px] mt-1" style={{ color: '#6b7280' }}>Scan to view</p>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
              <Button 
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white text-xs"
                onClick={downloadSummary}
              >
                <Download className="w-3 h-3 mr-1" />
                PDF
              </Button>
              <Button 
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
                onClick={downloadHTML}
              >
                <Download className="w-3 h-3 mr-1" />
                HTML
              </Button>
              <Button 
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs"
                onClick={shareSummary}
              >
                <Share2 className="w-3 h-3 mr-1" />
                Share
              </Button>
              <Button 
                size="sm"
                variant="outline"
                className="text-xs"
                onClick={() => {
                  setShowSummaryDialog(false)
                  router.push('/dashboard/trips')
                }}
              >
                Back
              </Button>
            </div>

            {/* Social Sharing Preview */}
            <Card className="p-2 border-2 border-dashed" style={{ backgroundColor: '#f9fafb', borderColor: '#d1d5db' }}>
              <div className="text-[10px] text-center" style={{ color: '#6b7280' }}>
                💡 <strong>Pro Tip:</strong> Share your eco-achievement! Your trip = planting 3 trees 🌳
              </div>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Eco Actions Info Dialog */}
      <Dialog open={showEcoActionsDialog} onOpenChange={setShowEcoActionsDialog}>
        <DialogContent className="max-w-xl w-[95vw] max-h-[85vh] p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-2 sticky top-0 bg-background z-10 border-b">
            <DialogTitle className="text-xl font-bold text-green-600 flex items-center gap-2">
              <Leaf className="w-5 h-5" />
              How to Increase Eco Actions
            </DialogTitle>
            <DialogDescription className="text-sm">
              Track your sustainable choices during your trip to earn eco points!
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 px-6 py-4 overflow-y-auto max-h-[calc(85vh-180px)]">
            {/* Transport Actions */}
            <Card className="p-3 border-l-4 border-l-blue-500">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Navigation className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-foreground mb-1">🚇 Use Public Transport</h3>
                  <p className="text-xs text-muted-foreground mb-1.5">
                    Take buses, trains, or metro instead of taxis. Reduces CO₂ by up to 45%.
                  </p>
                  <Badge className="bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0">High Impact: -2.5 kg CO₂</Badge>
                </div>
              </div>
            </Card>

            <Card className="p-3 border-l-4 border-l-green-500">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-foreground mb-1">🚴 Walk or Cycle</h3>
                  <p className="text-xs text-muted-foreground mb-1.5">
                    For short distances (under 2km), walk or rent a bike. Zero emissions!
                  </p>
                  <Badge className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0">High Impact: -5.0 kg CO₂</Badge>
                </div>
              </div>
            </Card>

            {/* Waste Actions */}
            <Card className="p-3 border-l-4 border-l-orange-500">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <Leaf className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-foreground mb-1">♻️ Refuse Single-Use Plastics</h3>
                  <p className="text-xs text-muted-foreground mb-1.5">
                    Carry reusable water bottle, shopping bag, and utensils.
                  </p>
                  <Badge className="bg-orange-100 text-orange-700 text-[10px] px-1.5 py-0">Medium Impact: -1.2 kg CO₂</Badge>
                </div>
              </div>
            </Card>

            {/* Food Actions */}
            <Card className="p-3 border-l-4 border-l-purple-500">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-foreground mb-1">🥗 Eat Local & Plant-Based</h3>
                  <p className="text-xs text-muted-foreground mb-1.5">
                    Choose local restaurants and vegetarian options. Plant-based meals have 50% lower footprint.
                  </p>
                  <Badge className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0">High Impact: -3.8 kg CO₂</Badge>
                </div>
              </div>
            </Card>

            {/* Energy Actions */}
            <Card className="p-3 border-l-4 border-l-yellow-500">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                  <ThermometerSun className="w-4 h-4 text-yellow-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-foreground mb-1">❄️ Save Energy in Hotels</h3>
                  <p className="text-xs text-muted-foreground mb-1.5">
                    Turn off AC/heating when out. Use natural light. Reuse towels.
                  </p>
                  <Badge className="bg-yellow-100 text-yellow-700 text-[10px] px-1.5 py-0">Medium Impact: -1.8 kg CO₂</Badge>
                </div>
              </div>
            </Card>

            {/* Water Actions */}
            <Card className="p-3 border-l-4 border-l-cyan-500">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-4 h-4 text-cyan-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-foreground mb-1">💧 Conserve Water</h3>
                  <p className="text-xs text-muted-foreground mb-1.5">
                    Take shorter showers (5 min max). Turn off tap while brushing teeth.
                  </p>
                  <Badge className="bg-cyan-100 text-cyan-700 text-[10px] px-1.5 py-0">Low Impact: -0.5 kg CO₂</Badge>
                </div>
              </div>
            </Card>

            {/* Shopping Actions */}
            <Card className="p-3 border-l-4 border-l-pink-500">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0">
                  <Leaf className="w-4 h-4 text-pink-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-foreground mb-1">🛍️ Support Eco-Businesses</h3>
                  <p className="text-xs text-muted-foreground mb-1.5">
                    Choose shops, restaurants, and tours with eco-certifications.
                  </p>
                  <Badge className="bg-pink-100 text-pink-700 text-[10px] px-1.5 py-0">Medium Impact: -2.1 kg CO₂</Badge>
                </div>
              </div>
            </Card>

            {/* Call to Action */}
            <Alert className="bg-green-50 border-green-200">
              <Leaf className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800 text-sm">Start Tracking Now!</AlertTitle>
              <AlertDescription className="text-green-700 text-xs">
                Every eco action you take reduces your carbon footprint. Track them during your trip to see your total impact!
              </AlertDescription>
            </Alert>
          </div>

          <div className="flex justify-center px-6 py-3 sticky bottom-0 bg-background border-t">
            <Button size="sm" onClick={() => setShowEcoActionsDialog(false)}>
              Got it!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
