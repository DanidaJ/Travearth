import { CheckCircle, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export default function RegistrationSuccessPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">Registration Submitted!</h1>
        <p className="text-lg text-muted-foreground mb-6">
          Thank you for registering your hotel with Travearth. Our team will review your submission and contact you
          within 2-3 business days.
        </p>
        <div className="bg-surface p-4 rounded-lg mb-6">
          <h3 className="font-semibold text-foreground mb-2">What happens next?</h3>
          <ul className="text-sm text-muted-foreground space-y-2 text-left max-w-md mx-auto">
            <li>• Our sustainability team will verify your information</li>
            <li>• We'll calculate your hotel's sustainability score</li>
            <li>• You'll receive login credentials to manage your listing</li>
            <li>• Your hotel will be featured on our platform</li>
          </ul>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button className="bg-primary hover:bg-primary-dark text-white" asChild>
            <Link href="/hotels">
              Browse Hotels
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}
