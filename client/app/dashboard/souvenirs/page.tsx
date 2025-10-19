import { Gift, Leaf, MapPin, ShoppingBag, Star } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"

export default function SmartSouvenirsPage() {
  const souvenirs = [
    {
      id: "1",
      name: "Handwoven Coffee Bag",
      location: "Costa Rica",
      price: 25,
      sustainabilityScore: 95,
      description: "Made by local artisans using organic cotton and natural dyes",
      imageUrl: "/coffee-bag.jpg",
      artisan: "Maria's Cooperative",
      carbonFootprint: 0.5,
      tags: ["Fair Trade", "Organic", "Local"],
    },
    {
      id: "2",
      name: "Recycled Glass Jewelry",
      location: "Costa Rica",
      price: 35,
      sustainabilityScore: 92,
      description: "Beautiful jewelry crafted from recycled beach glass",
      imageUrl: "/glass-jewelry.jpg",
      artisan: "Ocean Treasures",
      carbonFootprint: 0.3,
      tags: ["Recycled", "Handmade", "Ocean-Friendly"],
    },
    {
      id: "3",
      name: "Bamboo Utensil Set",
      location: "Costa Rica",
      price: 18,
      sustainabilityScore: 98,
      description: "Sustainable bamboo utensils perfect for eco-conscious travelers",
      imageUrl: "/bamboo-utensils.jpg",
      artisan: "Green Living Co.",
      carbonFootprint: 0.2,
      tags: ["Zero Waste", "Bamboo", "Reusable"],
    },
  ]

  const savedSouvenirs = [
    {
      id: "4",
      name: "Organic Honey",
      location: "Norway",
      price: 22,
      sustainabilityScore: 94,
      imageUrl: "/honey.jpg",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Smart Souvenir Recommendations</h1>
        <p className="text-muted-foreground">Discover sustainable, locally-made souvenirs from your destinations</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Available</span>
            <Gift className="w-5 h-5 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">{souvenirs.length}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Saved</span>
            <Star className="w-5 h-5 text-accent" />
          </div>
          <div className="text-2xl font-bold text-foreground">{savedSouvenirs.length}</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Avg Score</span>
            <Leaf className="w-5 h-5 text-primary" />
          </div>
          <div className="text-2xl font-bold text-foreground">95</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Local Artisans</span>
            <ShoppingBag className="w-5 h-5 text-accent" />
          </div>
          <div className="text-2xl font-bold text-foreground">12</div>
        </Card>
      </div>

      {/* Info Banner */}
      <Card className="p-4 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <Leaf className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-foreground mb-1">Why Smart Souvenirs?</h3>
            <p className="text-sm text-muted-foreground">
              Our AI recommends sustainable, locally-made products that support communities and minimize environmental
              impact. Each item is verified for authenticity and sustainability.
            </p>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="recommended" className="w-full">
        <TabsList>
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
          <TabsTrigger value="purchased">Purchased</TabsTrigger>
        </TabsList>

        <TabsContent value="recommended" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {souvenirs.map((souvenir) => (
              <Card key={souvenir.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48 bg-surface">
                  <Image
                    src={souvenir.imageUrl || "/placeholder.svg"}
                    alt={souvenir.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-white/90 text-foreground border-0">
                      <Leaf className="w-3 h-3 mr-1 text-primary" />
                      {souvenir.sustainabilityScore}
                    </Badge>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-foreground text-lg mb-2">{souvenir.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{souvenir.location}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{souvenir.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {souvenir.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border mb-4">
                    <div>
                      <div className="text-2xl font-bold text-foreground">${souvenir.price}</div>
                      <div className="text-xs text-muted-foreground">{souvenir.artisan}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-accent">{souvenir.carbonFootprint} kg CO₂</div>
                      <div className="text-xs text-muted-foreground">footprint</div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1 bg-primary hover:bg-primary-dark text-white" size="sm">
                      Add to Cart
                    </Button>
                    <Button variant="outline" size="sm">
                      <Star className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="saved" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedSouvenirs.map((souvenir) => (
              <Card key={souvenir.id} className="overflow-hidden">
                <div className="relative h-48 bg-surface">
                  <Image
                    src={souvenir.imageUrl || "/placeholder.svg"}
                    alt={souvenir.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-white/90 text-foreground border-0">
                      <Leaf className="w-3 h-3 mr-1 text-primary" />
                      {souvenir.sustainabilityScore}
                    </Badge>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-foreground text-lg mb-2">{souvenir.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{souvenir.location}</span>
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-4">${souvenir.price}</div>
                  <Button className="w-full bg-primary hover:bg-primary-dark text-white" size="sm">
                    Add to Cart
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="purchased" className="mt-6">
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No purchases yet</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
