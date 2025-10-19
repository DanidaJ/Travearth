"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MapPin, 
  Calendar as CalendarIcon,
  Users, 
  Sparkles, 
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Plus,
  X,
  Navigation,
  Hotel,
  Utensils,
  Plane,
  Train,
  Car,
  Bike,
  ArrowRight,
  Gauge,
  Leaf
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";

// Types
interface Destination {
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
}

interface LiveCarbon {
  totalCarbon: number;
  carbonPerDay: number;
  carbonPerPerson: number;
  percentUsed: number;
  remainingBudget: number;
  rating?: {
    rating: string;
    level: number;
    color: string;
    message: string;
    badge?: string;
  };
}

interface EcoPlan {
  tripType: string;
  duration: number;
  travelers: number;
  itinerary: any[];
  summary: {
    totalCarbon: number;
    carbonPerDay: number;
    carbonPerPerson: number;
    rating: {
      rating: string;
      level: number;
      color: string;
      message: string;
      badge?: string;
    };
    averageSustainabilityScore: number;
  };
  optimizations: any[];
}

export default function AdvancedTripPlanner() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // API URL with fallback
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  
  // Trip data
  const [destinations, setDestinations] = useState<Destination[]>([{ name: "", city: "", country: "", lat: 0, lng: 0 }]);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [travelers, setTravelers] = useState(1);
  
  // Real-time calculations
  const [liveCarbon, setLiveCarbon] = useState<LiveCarbon | null>(null);
  const [tripType, setTripType] = useState("local");
  const [benchmark, setBenchmark] = useState<any>(null);
  const [warningLevel, setWarningLevel] = useState("none");
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Generated plan
  const [ecoPlan, setEcoPlan] = useState<EcoPlan | null>(null);
  const [showOptimizations, setShowOptimizations] = useState(false);

  // Calculate duration (memoized to prevent recalculation)
  const duration = useMemo(() => {
    return startDate && endDate 
      ? differenceInDays(endDate, startDate) + 1 
      : 0;
  }, [startDate, endDate]);

  // Debounced live carbon calculation with memoization
  const calculateLiveCarbon = useCallback(async () => {
    // Only calculate if we have valid destinations with coordinates
    const validDestinations = destinations.filter(d => d.lat && d.lng && d.name);
    
    if (validDestinations.length === 0 || !startDate || !endDate || isCalculating) {
      return;
    }

    setIsCalculating(true);
    
    try {
      const response = await fetch(`${apiUrl}/ecoplan/calculate-live`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinations: validDestinations,
          startDate,
          endDate,
          travelers,
          items: []
        })
      });

      const data = await response.json();
      if (data.success) {
        setLiveCarbon(data.current);
        setTripType(data.tripType);
        setBenchmark(data.benchmark);
        
        // Set warning level
        if (data.warnings.length > 0) {
          setWarningLevel(data.warnings[0].severity);
        } else {
          setWarningLevel("none");
        }
      }
    } catch (error) {
      console.error('Error calculating live carbon:', error);
    } finally {
      setIsCalculating(false);
    }
  }, [destinations, startDate, endDate, travelers, isCalculating]);

  // Debounced effect - wait 1 second after user stops typing
  useEffect(() => {
    const validDestinations = destinations.filter(d => d.lat && d.lng && d.name);
    
    if (validDestinations.length === 0 || !startDate || !endDate) {
      return;
    }

    const timer = setTimeout(() => {
      calculateLiveCarbon();
    }, 1000); // Wait 1 second after last change

    return () => clearTimeout(timer); // Cleanup on every change
  }, [destinations, startDate, endDate, travelers, calculateLiveCarbon]);

  // Memoized helper functions
  const addDestination = useCallback(() => {
    setDestinations(prev => [...prev, { name: "", city: "", country: "", lat: 0, lng: 0 }]);
  }, []);

  const removeDestination = useCallback((index: number) => {
    setDestinations(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateDestination = useCallback((index: number, field: keyof Destination, value: string | number) => {
    setDestinations(prev => {
      const updated = [...prev];
      (updated[index] as any)[field] = value;
      return updated;
    });
  }, []);

  const generatePlan = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/ecoplan/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinations: destinations.filter(d => d.name && d.lat && d.lng),
          startDate,
          endDate,
          travelers,
          preferences: {}
        })
      });

      const data = await response.json();
      if (data.success) {
        setEcoPlan(data.ecoPlan);
        setStep(3);
      }
    } catch (error) {
      console.error('Error generating plan:', error);
    } finally {
      setLoading(false);
    }
  };

  // Memoized icon getter
  const getTripTypeIcon = useMemo(() => {
    switch (tripType) {
      case 'local': return <Navigation className="h-4 w-4" />;
      case 'domestic': return <MapPin className="h-4 w-4" />;
      case 'international': return <Plane className="h-4 w-4" />;
      default: return <MapPin className="h-4 w-4" />;
    }
  }, [tripType]);

  const getTripTypeBadgeColor = () => {
    switch (tripType) {
      case 'local': return 'bg-green-500';
      case 'domestic': return 'bg-blue-500';
      case 'international': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getRatingColor = useCallback((rating: string) => {
    switch (rating) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-blue-500';
      case 'average': return 'text-yellow-500';
      case 'poor': return 'text-orange-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold flex items-center gap-2 mb-2">
          <Sparkles className="h-8 w-8 text-green-500" />
          AI-Powered EcoTrip Planner
        </h1>
        <p className="text-muted-foreground">
          Plan your sustainable journey with intelligent recommendations and real-time carbon tracking
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: "Destinations" },
            { num: 2, label: "Details" },
            { num: 3, label: "Your EcoPlan" }
          ].map((s, i) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold",
                step >= s.num ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600"
              )}>
                {s.num}
              </div>
              <div className="ml-2 flex-1">
                <div className="font-medium">{s.label}</div>
              </div>
              {i < 2 && (
                <div className={cn(
                  "flex-1 h-1 mx-4",
                  step > s.num ? "bg-green-500" : "bg-gray-200"
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Destinations */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Where do you want to go?</CardTitle>
            <CardDescription>
              Add your destinations in order. We'll detect if it's a local, domestic, or international trip.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ScrollArea className="h-[400px] pr-4">
              {destinations.map((dest, index) => (
                <div key={index} className="flex gap-4 mb-4 p-4 border rounded-lg">
                  <div className="flex-1 space-y-3">
                    <div>
                      <Label>Destination Name</Label>
                      <Input
                        placeholder="e.g., Eiffel Tower, Grand Canyon"
                        value={dest.name}
                        onChange={(e) => updateDestination(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>City</Label>
                        <Input
                          placeholder="Paris"
                          value={dest.city}
                          onChange={(e) => updateDestination(index, 'city', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>Country</Label>
                        <Input
                          placeholder="France"
                          value={dest.country}
                          onChange={(e) => updateDestination(index, 'country', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Latitude</Label>
                        <Input
                          type="number"
                          step="0.0001"
                          placeholder="48.8584"
                          value={dest.lat || ""}
                          onChange={(e) => updateDestination(index, 'lat', parseFloat(e.target.value))}
                        />
                      </div>
                      <div>
                        <Label>Longitude</Label>
                        <Input
                          type="number"
                          step="0.0001"
                          placeholder="2.2945"
                          value={dest.lng || ""}
                          onChange={(e) => updateDestination(index, 'lng', parseFloat(e.target.value))}
                        />
                      </div>
                    </div>
                  </div>
                  {destinations.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeDestination(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </ScrollArea>
            
            <Button onClick={addDestination} variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Another Destination
            </Button>
          </CardContent>
          <CardFooter>
            <Button onClick={() => setStep(2)} className="w-full" size="lg">
              Continue to Details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 2: Trip Details */}
      {step === 2 && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Trip Details</CardTitle>
              <CardDescription>
                When are you traveling and how many people?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Number of Travelers</Label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setTravelers(Math.max(1, travelers - 1))}
                  >
                    -
                  </Button>
                  <div className="flex-1 text-center text-2xl font-bold">
                    <Users className="inline h-6 w-6 mr-2" />
                    {travelers}
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setTravelers(travelers + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>

              {duration > 0 && (
                <Alert>
                  <AlertDescription>
                    <strong>{duration} day{duration !== 1 ? 's' : ''}</strong> trip to{' '}
                    <strong>{destinations.filter(d => d.name).length} destination{destinations.filter(d => d.name).length !== 1 ? 's' : ''}</strong>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Live Carbon Preview */}
          {liveCarbon && benchmark && (
            <Card className={cn(
              "border-2",
              warningLevel === "critical" && "border-red-500",
              warningLevel === "warning" && "border-yellow-500",
              warningLevel === "none" && "border-green-500"
            )}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Gauge className="h-5 w-5" />
                      Live Carbon Estimate
                    </CardTitle>
                    <CardDescription>Real-time footprint as you plan</CardDescription>
                  </div>
                  <Badge className={getTripTypeBadgeColor()}>
                    {getTripTypeIcon}
                    <span className="ml-1">{tripType.toUpperCase()}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Carbon Budget Usage</span>
                    <span className={getRatingColor(liveCarbon.rating?.rating || 'average')}>
                      {liveCarbon.percentUsed}%
                    </span>
                  </div>
                  <Progress 
                    value={liveCarbon.percentUsed} 
                    className={cn(
                      liveCarbon.percentUsed > 100 && "bg-red-200",
                      liveCarbon.percentUsed <= 100 && liveCarbon.percentUsed > 75 && "bg-yellow-200"
                    )}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{liveCarbon.totalCarbon}</div>
                    <div className="text-xs text-muted-foreground">kg CO₂</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{liveCarbon.carbonPerDay}</div>
                    <div className="text-xs text-muted-foreground">kg/day</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{liveCarbon.remainingBudget}</div>
                    <div className="text-xs text-muted-foreground">kg remaining</div>
                  </div>
                </div>

                {liveCarbon.rating && (
                  <Alert className={cn(
                    liveCarbon.rating.rating === 'excellent' && "border-green-500",
                    liveCarbon.rating.rating === 'good' && "border-blue-500",
                    liveCarbon.rating.rating === 'average' && "border-yellow-500",
                    liveCarbon.rating.rating === 'poor' && "border-orange-500",
                    liveCarbon.rating.rating === 'critical' && "border-red-500"
                  )}>
                    <AlertDescription className="flex items-center gap-2">
                      {liveCarbon.rating.rating === 'excellent' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                      {liveCarbon.rating.rating === 'critical' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                      <span>{liveCarbon.rating.message}</span>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex gap-4">
            <Button onClick={() => setStep(1)} variant="outline" size="lg" className="flex-1">
              Back
            </Button>
            <Button 
              onClick={generatePlan} 
              disabled={loading || !startDate || !endDate || destinations.filter(d => d.name && d.lat && d.lng).length === 0}
              size="lg" 
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating AI Plan...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate EcoPlan
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Generated EcoPlan */}
      {step === 3 && ecoPlan && (
        <div className="space-y-6">
          {/* Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Leaf className="h-6 w-6 text-green-500" />
                Your Personalized EcoPlan
              </CardTitle>
              <CardDescription>
                {ecoPlan.tripType} trip • {ecoPlan.duration} days • {ecoPlan.itinerary.length} destinations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold">{ecoPlan.summary.totalCarbon}</div>
                  <div className="text-sm text-muted-foreground">Total CO₂ (kg)</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold">{ecoPlan.summary.carbonPerDay}</div>
                  <div className="text-sm text-muted-foreground">Per Day (kg)</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className={cn("text-3xl font-bold", getRatingColor(ecoPlan.summary.rating.rating))}>
                    {ecoPlan.summary.rating.rating.toUpperCase()}
                  </div>
                  <div className="text-sm text-muted-foreground">Eco Rating</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-3xl font-bold">{ecoPlan.summary.averageSustainabilityScore}</div>
                  <div className="text-sm text-muted-foreground">Avg Score</div>
                </div>
              </div>

              {ecoPlan.summary.rating.badge && (
                <Alert className="border-green-500">
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Eligible for Badge:</strong> {ecoPlan.summary.rating.badge} 🏆
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Optimizations */}
          {ecoPlan.optimizations.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingDown className="h-5 w-5 text-blue-500" />
                      Optimization Suggestions
                    </CardTitle>
                    <CardDescription>
                      {ecoPlan.optimizations.length} ways to reduce your carbon footprint
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowOptimizations(!showOptimizations)}
                  >
                    {showOptimizations ? "Hide" : "Show"}
                  </Button>
                </div>
              </CardHeader>
              {showOptimizations && (
                <CardContent className="space-y-3">
                  {ecoPlan.optimizations.map((opt, index) => (
                    <Alert key={index} className={cn(
                      opt.priority === 'high' && "border-orange-500",
                      opt.priority === 'medium' && "border-yellow-500"
                    )}>
                      <AlertDescription className="flex items-center justify-between">
                        <span>
                          <span className="mr-2">{opt.icon}</span>
                          {opt.message}
                        </span>
                        {opt.savings && (
                          <Badge variant="outline" className="text-green-600">
                            -{opt.savings}kg CO₂
                          </Badge>
                        )}
                      </AlertDescription>
                    </Alert>
                  ))}
                </CardContent>
              )}
            </Card>
          )}

          {/* Itinerary */}
          <Card>
            <CardHeader>
              <CardTitle>Day-by-Day Itinerary</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {ecoPlan.itinerary.map((day, index) => (
                    <Card key={index} className="border-2">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            {day.destination}
                          </CardTitle>
                          <Badge variant="outline">
                            {day.duration} day{day.duration !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <CardDescription>
                          {format(new Date(day.startDate), "MMM dd")} - {format(new Date(day.endDate), "MMM dd")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Transport */}
                        {day.transport && (
                          <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                            <div className="text-2xl">{day.transport.icon}</div>
                            <div className="flex-1">
                              <div className="font-semibold">{day.transport.name}</div>
                              <div className="text-sm text-muted-foreground">{day.transport.description}</div>
                              <div className="flex gap-4 mt-2 text-sm">
                                <span>⏱️ {day.transport.duration} min</span>
                                <span>💰 ${day.transport.cost.toFixed(2)}</span>
                                <span>🌱 {day.transportCarbon}kg CO₂</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Activities */}
                        <div>
                          <Label className="mb-2 block">Suggested Activities</Label>
                          <div className="space-y-2">
                            {day.activities.slice(0, 3).map((activity: any, i: number) => (
                              <div key={i} className="flex items-center gap-3 p-2 border rounded-lg">
                                <span className="text-xl">{activity.icon}</span>
                                <div className="flex-1">
                                  <div className="font-medium text-sm">{activity.name}</div>
                                  <div className="text-xs text-muted-foreground">{activity.description}</div>
                                </div>
                                <Badge variant="outline" className="text-green-600">
                                  {activity.sustainabilityScore}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Carbon Summary */}
                        <div className="flex justify-between items-center pt-3 border-t">
                          <span className="text-sm font-semibold">Day Carbon Total:</span>
                          <span className="text-lg font-bold">{day.totalCarbon}kg CO₂</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button onClick={() => setStep(2)} variant="outline" size="lg">
              Edit Plan
            </Button>
            <Button size="lg" className="flex-1">
              Save & Start Trip
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
