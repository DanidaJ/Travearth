"use client"

import type React from "react"

import { useState } from "react"
import { Share2, Copy, Mail, MessageCircle, Check, Users } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ShareTripDialogProps {
  tripId: string
  tripName: string
}

export function ShareTripDialog({ tripId, tripName }: ShareTripDialogProps) {
  const [copied, setCopied] = useState(false)
  const [email, setEmail] = useState("")
  const shareUrl = `https://Travearth.app/shared/${tripId}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleEmailInvite = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle email invitation
    console.log("Sending invite to:", email)
    setEmail("")
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Trip</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="link" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="link">Share Link</TabsTrigger>
            <TabsTrigger value="invite">Invite Collaborators</TabsTrigger>
          </TabsList>

          <TabsContent value="link" className="space-y-4">
            <div>
              <Label htmlFor="shareUrl">Share Link</Label>
              <div className="flex gap-2 mt-2">
                <Input id="shareUrl" value={shareUrl} readOnly />
                <Button onClick={copyToClipboard} variant="outline" size="icon">
                  {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="w-full bg-transparent">
                <Mail className="w-4 h-4 mr-2" />
                Email
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                <MessageCircle className="w-4 h-4 mr-2" />
                Message
              </Button>
            </div>

            <div className="text-xs text-muted-foreground text-center">
              Anyone with this link can view your trip details and carbon footprint
            </div>
          </TabsContent>

          <TabsContent value="invite" className="space-y-4">
            <form onSubmit={handleEmailInvite} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="friend@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary-dark text-white">
                <Users className="w-4 h-4 mr-2" />
                Send Invitation
              </Button>
            </form>

            <div className="text-xs text-muted-foreground text-center">
              Collaborators can edit trip details and track carbon footprint together
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
