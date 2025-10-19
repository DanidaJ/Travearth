/**
 * EcoPlan Controller
 * Handles trip planning, optimization, and eco-benchmark calculations
 */

const Trip = require('../models/Trip');
const Hotel = require('../models/Hotel');
const User = require('../models/User');
const ecoPlanService = require('../services/ecoPlanService');
const carbonService = require('../services/carbonService');

/**
 * Generate auto eco-plan for trip
 * POST /api/ecoplan/generate
 */
exports.generatePlan = async (req, res) => {
  try {
    const {
      userId,
      destinations,
      startDate,
      endDate,
      travelers = 1,
      preferences = {}
    } = req.body;

    // Validate input
    if (!destinations || destinations.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one destination is required'
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start and end dates are required'
      });
    }

    // Generate eco-plan
    const ecoPlan = await ecoPlanService.generateEcoPlan({
      destinations,
      startDate,
      endDate,
      travelers,
      preferences
    }, Hotel);

    // If userId provided, save as draft trip
    let savedTrip = null;
    if (userId) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Create trip from ecoplan
      savedTrip = new Trip({
        user: userId,
        title: `Trip to ${destinations.map(d => d.name || d.city).join(', ')}`,
        description: `${ecoPlan.tripType} trip with ${destinations.length} destinations`,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: 'planning',
        tripType: ecoPlan.tripType,
        travelers,
        items: ecoPlan.itinerary.map(day => ({
          type: 'destination',
          name: day.destination,
          location: day.location,
          startDate: day.startDate,
          endDate: day.endDate,
          carbonFootprint: day.totalCarbon,
          sustainabilityScore: day.sustainabilityScore,
          details: {
            transport: day.transport,
            activities: day.activities,
            hotels: day.accommodationSuggestions
          }
        })),
        predictedCarbon: ecoPlan.summary.totalCarbon,
        ecoBenchmark: ecoPlan.benchmark,
        benchmarkRating: ecoPlan.summary.rating
      });

      await savedTrip.save();
    }

    res.json({
      success: true,
      ecoPlan,
      savedTrip: savedTrip ? {
        id: savedTrip._id,
        title: savedTrip.title,
        status: savedTrip.status
      } : null,
      message: savedTrip 
        ? 'EcoPlan generated and saved as draft' 
        : 'EcoPlan generated successfully'
    });

  } catch (error) {
    console.error('Error generating eco-plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate eco-plan',
      error: error.message
    });
  }
};

/**
 * Optimize existing trip
 * POST /api/ecoplan/optimize/:tripId
 */
exports.optimizeTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { focusAreas = ['transport', 'accommodation', 'activities'] } = req.body;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Extract destinations from trip items
    const destinations = trip.items
      .filter(item => item.location)
      .map(item => ({
        name: item.name,
        city: item.location.city,
        lat: item.location.lat,
        lng: item.location.lng,
        country: item.location.country
      }));

    // Generate optimized plan
    const optimizedPlan = await ecoPlanService.generateEcoPlan({
      destinations,
      startDate: trip.startDate,
      endDate: trip.endDate,
      travelers: trip.travelers || 1,
      preferences: { focusAreas }
    }, Hotel);

    // Calculate savings
    const currentCarbon = trip.predictedCarbon || 0;
    const optimizedCarbon = optimizedPlan.summary.totalCarbon;
    const savings = currentCarbon - optimizedCarbon;
    const savingsPercent = currentCarbon > 0 ? Math.round((savings / currentCarbon) * 100) : 0;

    res.json({
      success: true,
      current: {
        carbon: currentCarbon,
        rating: trip.benchmarkRating
      },
      optimized: {
        carbon: optimizedCarbon,
        rating: optimizedPlan.summary.rating
      },
      savings: {
        carbon: Math.round(savings * 100) / 100,
        percent: savingsPercent
      },
      optimizedPlan,
      recommendations: optimizedPlan.optimizations
    });

  } catch (error) {
    console.error('Error optimizing trip:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to optimize trip',
      error: error.message
    });
  }
};

/**
 * Get eco-benchmark for trip parameters
 * POST /api/ecoplan/benchmark
 */
exports.getBenchmark = async (req, res) => {
  try {
    const { destinations, startDate, endDate } = req.body;

    if (!destinations || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Destinations and dates are required'
      });
    }

    // Calculate duration
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    // Detect trip type
    const tripType = ecoPlanService.detectTripType(destinations);

    // Get benchmark
    const benchmark = ecoPlanService.getEcoBenchmark(tripType, durationDays);

    res.json({
      success: true,
      benchmark
    });

  } catch (error) {
    console.error('Error getting benchmark:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get benchmark',
      error: error.message
    });
  }
};

/**
 * Compare trip against benchmark
 * POST /api/ecoplan/compare/:tripId
 */
exports.compareWithBenchmark = async (req, res) => {
  try {
    const { tripId } = req.params;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({
        success: false,
        message: 'Trip not found'
      });
    }

    // Calculate duration
    const durationDays = Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24));

    // Get benchmark
    const tripType = trip.tripType || ecoPlanService.detectTripType(
      trip.items.filter(item => item.location).map(item => ({
        lat: item.location.lat,
        lng: item.location.lng
      }))
    );

    const benchmark = ecoPlanService.getEcoBenchmark(tripType, durationDays);

    // Rate footprint
    const predictedRating = ecoPlanService.rateFootprint(trip.predictedCarbon || 0, benchmark);
    
    let actualRating = null;
    if (trip.actualCarbon) {
      actualRating = ecoPlanService.rateFootprint(trip.actualCarbon, benchmark);
    }

    // Calculate performance
    let performance = null;
    if (trip.actualCarbon) {
      const difference = trip.predictedCarbon - trip.actualCarbon;
      const percentBetter = trip.predictedCarbon > 0 
        ? Math.round((difference / trip.predictedCarbon) * 100) 
        : 0;

      performance = {
        difference: Math.round(difference * 100) / 100,
        percentBetter,
        status: percentBetter >= 20 ? 'excellent' : percentBetter >= 0 ? 'good' : 'exceeded'
      };
    }

    res.json({
      success: true,
      tripType,
      benchmark,
      predicted: {
        carbon: trip.predictedCarbon,
        rating: predictedRating
      },
      actual: trip.actualCarbon ? {
        carbon: trip.actualCarbon,
        rating: actualRating
      } : null,
      performance
    });

  } catch (error) {
    console.error('Error comparing with benchmark:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to compare with benchmark',
      error: error.message
    });
  }
};

/**
 * Get transport recommendations between two points
 * POST /api/ecoplan/transport-options
 */
exports.getTransportOptions = async (req, res) => {
  try {
    const { origin, destination } = req.body;

    if (!origin || !destination) {
      return res.status(400).json({
        success: false,
        message: 'Origin and destination are required'
      });
    }

    // Calculate distance
    const geolib = require('geolib');
    const distance = geolib.getDistance(
      { latitude: origin.lat, longitude: origin.lng },
      { latitude: destination.lat, longitude: destination.lng }
    ) / 1000; // km

    // Get transport recommendations
    const options = ecoPlanService.recommendTransportMode(origin, destination, distance);

    // Calculate carbon for each option
    const optionsWithCarbon = options.map(option => ({
      ...option,
      totalCarbon: Math.round(option.carbonPerKm * distance * 100) / 100,
      totalCost: Math.round(option.cost * 100) / 100,
      totalDuration: option.duration
    }));

    res.json({
      success: true,
      distance: Math.round(distance * 100) / 100,
      origin,
      destination,
      options: optionsWithCarbon
    });

  } catch (error) {
    console.error('Error getting transport options:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get transport options',
      error: error.message
    });
  }
};

/**
 * Get activity suggestions for destination
 * POST /api/ecoplan/activities
 */
exports.getActivitySuggestions = async (req, res) => {
  try {
    const { destination, duration = 3 } = req.body;

    if (!destination) {
      return res.status(400).json({
        success: false,
        message: 'Destination is required'
      });
    }

    const activities = ecoPlanService.generateActivitySuggestions(destination, duration);

    res.json({
      success: true,
      destination,
      duration,
      activities
    });

  } catch (error) {
    console.error('Error getting activity suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get activity suggestions',
      error: error.message
    });
  }
};

/**
 * Real-time carbon calculation as user builds trip
 * POST /api/ecoplan/calculate-live
 */
exports.calculateLive = async (req, res) => {
  try {
    const {
      destinations = [],
      startDate,
      endDate,
      travelers = 1,
      items = [] // Partial trip items
    } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Start and end dates are required'
      });
    }

    // Calculate duration
    const durationDays = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));

    // Detect trip type
    const tripType = destinations.length > 0 
      ? ecoPlanService.detectTripType(destinations)
      : 'local';

    // Get benchmark
    const benchmark = ecoPlanService.getEcoBenchmark(tripType, durationDays);

    // Calculate carbon for current items
    let totalCarbon = 0;
    for (const item of items) {
      if (item.carbonFootprint) {
        totalCarbon += item.carbonFootprint * travelers;
      }
    }

    // Rate against benchmark
    const rating = ecoPlanService.rateFootprint(totalCarbon, benchmark);

    // Calculate what's left in budget
    const remainingBudget = benchmark.goodThreshold - totalCarbon;
    const percentUsed = Math.round((totalCarbon / benchmark.goodThreshold) * 100);

    res.json({
      success: true,
      tripType,
      benchmark,
      current: {
        totalCarbon: Math.round(totalCarbon * 100) / 100,
        carbonPerDay: Math.round((totalCarbon / durationDays) * 100) / 100,
        carbonPerPerson: Math.round((totalCarbon / travelers) * 100) / 100,
        rating,
        percentUsed,
        remainingBudget: Math.round(remainingBudget * 100) / 100
      },
      warnings: totalCarbon > benchmark.goodThreshold ? [
        {
          type: 'benchmark_exceeded',
          message: `Trip exceeds eco-benchmark by ${Math.round(totalCarbon - benchmark.goodThreshold)}kg CO2`,
          severity: totalCarbon > benchmark.poorThreshold ? 'critical' : 'warning'
        }
      ] : []
    });

  } catch (error) {
    console.error('Error calculating live carbon:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate carbon',
      error: error.message
    });
  }
};

module.exports = exports;
