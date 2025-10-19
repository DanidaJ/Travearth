/**
 * EcoPlan Generation Service
 * Generates intelligent, eco-optimized trip itineraries with sustainability scoring
 * Detects trip type (local/domestic/international) and applies appropriate benchmarks
 */

const geolib = require('geolib');
const axios = require('axios');

// Eco-benchmark thresholds (kg CO2 per person per day)
const ECO_BENCHMARKS = {
  local: {
    excellent: 5,      // <5 kg CO2/day
    good: 10,          // 5-10 kg CO2/day
    average: 20,       // 10-20 kg CO2/day
    poor: 30,          // 20-30 kg CO2/day
    critical: Infinity // >30 kg CO2/day
  },
  domestic: {
    excellent: 15,
    good: 30,
    average: 50,
    poor: 75,
    critical: Infinity
  },
  international: {
    excellent: 50,
    good: 100,
    average: 200,
    poor: 300,
    critical: Infinity
  }
};

// Trip type distance thresholds (km)
const TRIP_TYPE_THRESHOLDS = {
  local: 200,        // Within 200km = local
  domestic: 2000     // Within same country, <2000km = domestic
};

/**
 * Detect trip type based on distances between destinations
 */
function detectTripType(destinations) {
  if (!destinations || destinations.length === 0) {
    return 'local';
  }

  // Calculate total trip distance
  let totalDistance = 0;
  let maxDistance = 0;
  let homeLocation = destinations[0]; // Assume first destination is home/starting point

  for (let i = 1; i < destinations.length; i++) {
    const distance = geolib.getDistance(
      { latitude: destinations[i - 1].lat, longitude: destinations[i - 1].lng },
      { latitude: destinations[i].lat, longitude: destinations[i].lng }
    ) / 1000; // Convert to km

    totalDistance += distance;
    
    // Distance from home
    const distanceFromHome = geolib.getDistance(
      { latitude: homeLocation.lat, longitude: homeLocation.lng },
      { latitude: destinations[i].lat, longitude: destinations[i].lng }
    ) / 1000;

    maxDistance = Math.max(maxDistance, distanceFromHome);
  }

  // Determine trip type
  if (maxDistance < TRIP_TYPE_THRESHOLDS.local) {
    return 'local';
  }

  // Check if international (simplified - in production use country codes)
  const hasInternational = destinations.some(dest => dest.country !== destinations[0].country);
  
  if (hasInternational || maxDistance > TRIP_TYPE_THRESHOLDS.domestic) {
    return 'international';
  }

  return 'domestic';
}

/**
 * Get eco-benchmark for trip
 */
function getEcoBenchmark(tripType, durationDays) {
  const benchmarks = ECO_BENCHMARKS[tripType] || ECO_BENCHMARKS.domestic;
  
  return {
    tripType,
    durationDays,
    excellentThreshold: benchmarks.excellent * durationDays,
    goodThreshold: benchmarks.good * durationDays,
    averageThreshold: benchmarks.average * durationDays,
    poorThreshold: benchmarks.poor * durationDays,
    perDayBenchmarks: benchmarks,
    recommendation: `For a ${durationDays}-day ${tripType} trip, aim for under ${benchmarks.good * durationDays}kg CO2 (${benchmarks.good}kg/day)`
  };
}

/**
 * Rate footprint against benchmark
 */
function rateFootprint(totalCarbon, benchmark) {
  if (totalCarbon <= benchmark.excellentThreshold) {
    return {
      rating: 'excellent',
      level: 5,
      color: '#10b981',
      message: '🌟 Outstanding! Well below eco-benchmark',
      badge: 'Eco Champion'
    };
  } else if (totalCarbon <= benchmark.goodThreshold) {
    return {
      rating: 'good',
      level: 4,
      color: '#22c55e',
      message: '✅ Great! Within eco-benchmark',
      badge: 'Green Traveler'
    };
  } else if (totalCarbon <= benchmark.averageThreshold) {
    return {
      rating: 'average',
      level: 3,
      color: '#f59e0b',
      message: '⚠️ Average - Consider optimization',
      badge: null
    };
  } else if (totalCarbon <= benchmark.poorThreshold) {
    return {
      rating: 'poor',
      level: 2,
      color: '#ef4444',
      message: '❌ High impact - Optimization needed',
      badge: null
    };
  } else {
    return {
      rating: 'critical',
      level: 1,
      color: '#dc2626',
      message: '🚨 Critical - Significantly exceeds benchmark',
      badge: null
    };
  }
}

/**
 * Generate eco-optimized activity suggestions for a destination
 */
function generateActivitySuggestions(destination, duration) {
  const baseActivities = [
    // Low carbon activities
    {
      type: 'walking_tour',
      name: `Walking Tour of ${destination.name || destination.city}`,
      carbonPerHour: 0,
      sustainabilityScore: 100,
      duration: 2,
      description: 'Explore on foot with a local guide',
      icon: '🚶'
    },
    {
      type: 'cycling',
      name: 'Bike Rental & City Exploration',
      carbonPerHour: 0,
      sustainabilityScore: 95,
      duration: 3,
      description: 'Eco-friendly cycling tour',
      icon: '🚴'
    },
    {
      type: 'local_market',
      name: 'Local Market Visit',
      carbonPerHour: 0.5,
      sustainabilityScore: 90,
      duration: 2,
      description: 'Support local vendors and artisans',
      icon: '🛍️'
    },
    {
      type: 'nature_hike',
      name: 'Nature Trail Hiking',
      carbonPerHour: 0,
      sustainabilityScore: 100,
      duration: 4,
      description: 'Explore natural beauty',
      icon: '🥾'
    },
    {
      type: 'museum',
      name: 'Museum & Cultural Center',
      carbonPerHour: 1,
      sustainabilityScore: 80,
      duration: 2,
      description: 'Learn local history and culture',
      icon: '🏛️'
    },
    // Medium carbon activities
    {
      type: 'public_transport_tour',
      name: 'Public Transport City Tour',
      carbonPerHour: 2,
      sustainabilityScore: 75,
      duration: 3,
      description: 'Use local transit system',
      icon: '🚇'
    },
    {
      type: 'kayaking',
      name: 'Kayaking or Water Sports',
      carbonPerHour: 3,
      sustainabilityScore: 70,
      duration: 2,
      description: 'Low-impact water activities',
      icon: '🛶'
    },
    // Higher carbon (but included for choice)
    {
      type: 'car_excursion',
      name: 'Shared Car Excursion',
      carbonPerHour: 5,
      sustainabilityScore: 50,
      duration: 4,
      description: 'Group tour by car (shared)',
      icon: '🚗'
    }
  ];

  // Select activities based on duration
  const recommendedCount = Math.min(Math.ceil(duration * 1.5), 8);
  return baseActivities.slice(0, recommendedCount);
}

/**
 * Suggest eco-friendly hotels
 */
async function suggestHotels(destination, Hotel) {
  try {
    // Search for hotels near destination with high sustainability scores
    const hotels = await Hotel.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [destination.lng, destination.lat]
          },
          $maxDistance: 50000 // 50km radius
        }
      },
      sustainabilityScore: { $gte: 70 } // Only suggest sustainable hotels
    })
    .sort({ sustainabilityScore: -1 })
    .limit(5);

    return hotels;
  } catch (error) {
    console.error('Error fetching hotels:', error);
    return [];
  }
}

/**
 * Calculate optimal transport mode between destinations
 */
function recommendTransportMode(origin, destination, distance) {
  const modes = [];

  // Walking (< 5km)
  if (distance < 5) {
    modes.push({
      mode: 'walking',
      name: 'Walking',
      carbonPerKm: 0,
      duration: Math.ceil(distance / 5 * 60), // 5 km/h
      cost: 0,
      sustainabilityScore: 100,
      recommended: true,
      icon: '🚶',
      description: 'Zero emissions, healthy choice'
    });
  }

  // Cycling (< 20km)
  if (distance < 20) {
    modes.push({
      mode: 'cycling',
      name: 'Cycling',
      carbonPerKm: 0,
      duration: Math.ceil(distance / 15 * 60), // 15 km/h
      cost: 5,
      sustainabilityScore: 100,
      recommended: true,
      icon: '🚴',
      description: 'Eco-friendly and scenic'
    });
  }

  // Train (any distance)
  modes.push({
    mode: 'train',
    name: 'Train',
    carbonPerKm: 0.041,
    duration: Math.ceil(distance / 80 * 60), // 80 km/h average
    cost: distance * 0.15,
    sustainabilityScore: 90,
    recommended: distance < 1000,
    icon: '🚆',
    description: 'Lowest carbon motorized option'
  });

  // Bus (< 1000km)
  if (distance < 1000) {
    modes.push({
      mode: 'bus',
      name: 'Bus',
      carbonPerKm: 0.089,
      duration: Math.ceil(distance / 60 * 60), // 60 km/h
      cost: distance * 0.10,
      sustainabilityScore: 75,
      recommended: distance < 500,
      icon: '🚌',
      description: 'Affordable and relatively low carbon'
    });
  }

  // Electric Car Share (< 500km)
  if (distance < 500) {
    modes.push({
      mode: 'electric_car',
      name: 'Electric Car (Shared)',
      carbonPerKm: 0.05,
      duration: Math.ceil(distance / 70 * 60), // 70 km/h
      cost: distance * 0.25,
      sustainabilityScore: 70,
      recommended: false,
      icon: '🔌',
      description: 'Clean energy vehicle sharing'
    });
  }

  // Car (rental/personal)
  modes.push({
    mode: 'car',
    name: 'Car',
    carbonPerKm: 0.12,
    duration: Math.ceil(distance / 80 * 60), // 80 km/h
    cost: distance * 0.30,
    sustainabilityScore: 40,
    recommended: false,
    icon: '🚗',
    description: 'Flexible but higher emissions'
  });

  // Flight (> 300km)
  if (distance > 300) {
    const flightCarbon = distance < 1500 ? 0.255 : distance < 3500 ? 0.195 : 0.150;
    modes.push({
      mode: 'flight',
      name: 'Flight',
      carbonPerKm: flightCarbon,
      duration: Math.ceil(distance / 600 * 60) + 120, // 600 km/h + 2h airport time
      cost: distance * 0.12,
      sustainabilityScore: 20,
      recommended: false,
      icon: '✈️',
      description: 'Fastest but highest emissions'
    });
  }

  // Sort by sustainability score
  return modes.sort((a, b) => b.sustainabilityScore - a.sustainabilityScore);
}

/**
 * Generate complete eco-optimized itinerary
 */
async function generateEcoPlan(tripData, Hotel) {
  const {
    destinations,
    startDate,
    endDate,
    travelers = 1,
    preferences = {}
  } = tripData;

  // Calculate trip duration
  const start = new Date(startDate);
  const end = new Date(endDate);
  const durationDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

  // Detect trip type
  const tripType = detectTripType(destinations);

  // Get eco-benchmark
  const benchmark = getEcoBenchmark(tripType, durationDays);

  // Generate day-by-day itinerary
  const itinerary = [];
  let totalPredictedCarbon = 0;
  let currentDate = new Date(start);

  // Calculate days per destination
  const daysPerDestination = Math.floor(durationDays / destinations.length);
  const extraDays = durationDays % destinations.length;

  for (let i = 0; i < destinations.length; i++) {
    const destination = destinations[i];
    const stayDuration = daysPerDestination + (i < extraDays ? 1 : 0);

    // Transport to this destination (if not first)
    let transportCarbon = 0;
    let transportMode = null;

    if (i > 0) {
      const prevDestination = destinations[i - 1];
      const distance = geolib.getDistance(
        { latitude: prevDestination.lat, longitude: prevDestination.lng },
        { latitude: destination.lat, longitude: destination.lng }
      ) / 1000; // km

      // Get transport recommendations
      const transportOptions = recommendTransportMode(prevDestination, destination, distance);
      transportMode = transportOptions[0]; // Most eco-friendly option

      transportCarbon = distance * transportMode.carbonPerKm * travelers;
      totalPredictedCarbon += transportCarbon;
    }

    // Generate activities for this destination
    const activities = generateActivitySuggestions(destination, stayDuration);

    // Calculate accommodation carbon
    const nightsStay = stayDuration;
    const hotelCarbon = 20 * nightsStay * travelers; // 20kg per night per person
    totalPredictedCarbon += hotelCarbon;

    // Calculate activity carbon
    let activityCarbon = 0;
    activities.slice(0, stayDuration * 2).forEach(activity => {
      activityCarbon += activity.carbonPerHour * activity.duration;
    });
    totalPredictedCarbon += activityCarbon;

    // Suggest hotels
    const hotelSuggestions = await suggestHotels(destination, Hotel);

    // Build destination entry
    itinerary.push({
      destination: destination.name || destination.city,
      location: {
        lat: destination.lat,
        lng: destination.lng,
        country: destination.country
      },
      startDate: new Date(currentDate),
      endDate: new Date(currentDate.getTime() + stayDuration * 24 * 60 * 60 * 1000),
      duration: stayDuration,
      transport: transportMode,
      transportCarbon: Math.round(transportCarbon * 100) / 100,
      accommodationSuggestions: hotelSuggestions.slice(0, 3),
      accommodationCarbon: Math.round(hotelCarbon * 100) / 100,
      activities: activities.slice(0, stayDuration * 2),
      activityCarbon: Math.round(activityCarbon * 100) / 100,
      totalCarbon: Math.round((transportCarbon + hotelCarbon + activityCarbon) * 100) / 100,
      sustainabilityScore: calculateDestinationScore(transportMode, activities)
    });

    // Advance date
    currentDate = new Date(currentDate.getTime() + stayDuration * 24 * 60 * 60 * 1000);
  }

  // Calculate carbon per day
  const carbonPerDay = totalPredictedCarbon / durationDays;

  // Rate against benchmark
  const rating = rateFootprint(totalPredictedCarbon, benchmark);

  // Generate optimization suggestions
  const optimizations = generateOptimizationSuggestions(itinerary, totalPredictedCarbon, benchmark);

  return {
    tripType,
    duration: durationDays,
    travelers,
    benchmark,
    itinerary,
    summary: {
      totalDestinations: destinations.length,
      totalCarbon: Math.round(totalPredictedCarbon * 100) / 100,
      carbonPerDay: Math.round(carbonPerDay * 100) / 100,
      carbonPerPerson: Math.round(totalPredictedCarbon / travelers * 100) / 100,
      rating,
      averageSustainabilityScore: Math.round(
        itinerary.reduce((sum, day) => sum + day.sustainabilityScore, 0) / itinerary.length
      )
    },
    optimizations,
    generatedAt: new Date()
  };
}

/**
 * Calculate destination sustainability score
 */
function calculateDestinationScore(transport, activities) {
  const transportScore = transport ? transport.sustainabilityScore : 100;
  const avgActivityScore = activities.reduce((sum, a) => sum + a.sustainabilityScore, 0) / activities.length;
  return Math.round((transportScore * 0.4 + avgActivityScore * 0.6));
}

/**
 * Generate optimization suggestions
 */
function generateOptimizationSuggestions(itinerary, totalCarbon, benchmark) {
  const suggestions = [];

  // Check if exceeds benchmark
  if (totalCarbon > benchmark.goodThreshold) {
    suggestions.push({
      type: 'warning',
      priority: 'high',
      message: `Your trip exceeds the eco-benchmark by ${Math.round(totalCarbon - benchmark.goodThreshold)}kg CO2`,
      icon: '⚠️'
    });
  }

  // Check transport modes
  itinerary.forEach((day, index) => {
    if (day.transport && day.transport.mode === 'flight' && day.transport.sustainabilityScore < 50) {
      suggestions.push({
        type: 'transport',
        priority: 'high',
        destination: day.destination,
        message: `Consider train instead of flight to ${day.destination} - save ~${Math.round(day.transportCarbon * 0.7)}kg CO2`,
        icon: '🚆',
        savings: Math.round(day.transportCarbon * 0.7)
      });
    }
  });

  // Check hotel selections
  itinerary.forEach((day) => {
    if (day.accommodationSuggestions.length > 0) {
      suggestions.push({
        type: 'accommodation',
        priority: 'medium',
        destination: day.destination,
        message: `Choose eco-certified hotels in ${day.destination} - save ~${Math.round(day.accommodationCarbon * 0.5)}kg CO2`,
        icon: '🏨',
        savings: Math.round(day.accommodationCarbon * 0.5)
      });
    }
  });

  // Check activity carbon
  const highCarbonActivities = itinerary.flatMap(day => 
    day.activities.filter(a => a.sustainabilityScore < 60)
  );

  if (highCarbonActivities.length > 0) {
    suggestions.push({
      type: 'activities',
      priority: 'low',
      message: `Swap ${highCarbonActivities.length} high-carbon activities for walking/cycling options`,
      icon: '🚶',
      savings: Math.round(highCarbonActivities.reduce((sum, a) => sum + a.carbonPerHour * a.duration, 0) * 0.8)
    });
  }

  // Calculate total potential savings
  const totalSavings = suggestions.reduce((sum, s) => sum + (s.savings || 0), 0);

  if (totalSavings > 0) {
    suggestions.unshift({
      type: 'summary',
      priority: 'info',
      message: `Potential carbon savings: ${Math.round(totalSavings)}kg CO2 (${Math.round(totalSavings / totalCarbon * 100)}%)`,
      icon: '💡',
      savings: totalSavings
    });
  }

  return suggestions;
}

module.exports = {
  generateEcoPlan,
  detectTripType,
  getEcoBenchmark,
  rateFootprint,
  recommendTransportMode,
  generateActivitySuggestions,
  suggestHotels,
  ECO_BENCHMARKS,
  TRIP_TYPE_THRESHOLDS
};
