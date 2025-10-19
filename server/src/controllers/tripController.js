const mongoose = require('mongoose');
const Trip = require('../models/Trip');
const User = require('../models/User');
const Badge = require('../models/Badge');
const carbonService = require('../services/carbonService');

/**
 * Create new trip with predicted carbon calculation
 * POST /api/trips or POST /api/trips/create
 */
exports.createTrip = async (req, res) => {
  try {
    const { 
      userId, 
      title, 
      description, 
      startDate, 
      endDate, 
      items,
      status,
      tripType,
      travelers,
      destinations,
      activities,
      hotels,
      predictedCarbon,
      actualCarbon,
      ecoBenchmark,
      benchmarkRating,
      itinerary
    } = req.body;

    // Validate required fields
    if (!title || !startDate || !endDate) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['title', 'startDate', 'endDate']
      });
    }

    // Use guest user if userId not provided (for demo purposes)
    const effectiveUserId = userId || new mongoose.Types.ObjectId('000000000000000000000000');

    // Calculate predicted carbon footprint if not provided
    let carbonData = {
      total: predictedCarbon || 0,
      breakdown: {}
    };
    
    if (items && items.length > 0) {
      carbonData = await carbonService.calculateTripCarbon(items);
    }

    // Generate unique share code
    const shareCode = Math.random().toString(36).substring(2, 10).toUpperCase();

    // Create trip with new structure
    const trip = new Trip({
      userId: effectiveUserId,
      userId_old: effectiveUserId, // For backwards compatibility
      title,
      description: description || `Trip to ${destinations?.map(d => d.name).join(", ") || "destinations"}`,
      startDate,
      endDate,
      status: status || 'planning',
      tripType: tripType || 'international',
      travelers: travelers || 1,
      items: items || [],
      predictedCarbon: predictedCarbon || carbonData.total,
      actualCarbon: actualCarbon || 0,
      carbonBreakdown: carbonData.breakdown || {},
      ecoBenchmark: ecoBenchmark || {},
      benchmarkRating: benchmarkRating || {},
      shareCode: shareCode,
      isPublic: true,
      // Store destinations, activities, hotels as metadata
      metadata: {
        destinations: destinations || [],
        activities: activities || [],
        hotels: hotels || [],
        itinerary: itinerary || []
      }
    });

    // Calculate sustainability score
    if (typeof trip.calculateSustainabilityScore === 'function') {
      trip.calculateSustainabilityScore();
    }

    await trip.save();

    console.log('✅ Trip saved successfully:', trip._id);

    res.status(201).json({
      success: true,
      trip,
      shareCode,
      carbonData,
      recommendations: carbonData.total > 0 
        ? carbonService.getEcoAlternatives(carbonData.total, 'trip')
        : []
    });
  } catch (error) {
    console.error('❌ Error creating trip:', error);
    res.status(500).json({ 
      error: 'Failed to create trip',
      message: error.message 
    });
  }
};

/**
 * Get all trips (for dashboard)
 * GET /api/trips
 */
exports.getAllTrips = async (req, res) => {
  try {
    const { status, sort = '-createdAt', limit = 100, page = 1 } = req.query;

    const query = {};
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const trips = await Trip.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip)
      .populate('badgesEarned')
      .populate('crisisAlerts');

    const total = await Trip.countDocuments(query);

    console.log(`✅ Found ${trips.length} trips (total: ${total})`);

    res.json({
      success: true,
      count: trips.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      trips
    });
  } catch (error) {
    console.error('❌ Error fetching all trips:', error);
    res.status(500).json({ 
      error: 'Failed to fetch trips',
      message: error.message 
    });
  }
};

/**
 * Get all trips for a user
 * GET /api/trips/user/:userId
 */
exports.getUserTrips = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status, sort = '-createdAt' } = req.query;

    const query = { userId };
    if (status) {
      query.status = status;
    }

    const trips = await Trip.find(query)
      .sort(sort)
      .populate('badgesEarned')
      .populate('crisisAlerts');

    res.json({
      success: true,
      count: trips.length,
      trips
    });
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ 
      error: 'Failed to fetch trips',
      message: error.message 
    });
  }
};

/**
 * Get single trip by ID
 * GET /api/trips/:id
 */
exports.getTrip = async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await Trip.findById(id)
      .populate('userId', 'name email avatar ecoScore')
      .populate('badgesEarned')
      .populate('crisisAlerts');

    if (!trip) {
      return res.status(404).json({ 
        error: 'Trip not found' 
      });
    }

    res.json({
      success: true,
      trip
    });
  } catch (error) {
    console.error('Error fetching trip:', error);
    res.status(500).json({ 
      error: 'Failed to fetch trip',
      message: error.message 
    });
  }
};

/**
 * Update trip and recalculate carbon footprint
 * PUT /api/trips/:id
 */
exports.updateTrip = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    let trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    // Update fields
    Object.keys(updates).forEach(key => {
      if (key !== '_id' && key !== 'userId') {
        trip[key] = updates[key];
      }
    });

    // Recalculate carbon if items changed
    if (updates.items) {
      const carbonData = await carbonService.calculateTripCarbon(trip.items);
      trip.predictedCarbon = carbonData.total;
      trip.carbonBreakdown = carbonData.breakdown;
      trip.calculateSustainabilityScore();
    }

    await trip.save();

    res.json({
      success: true,
      trip,
      recommendations: carbonService.getEcoAlternatives(trip.predictedCarbon, 'trip')
    });
  } catch (error) {
    console.error('Error updating trip:', error);
    res.status(500).json({ 
      error: 'Failed to update trip',
      message: error.message 
    });
  }
};

/**
 * Delete trip
 * DELETE /api/trips/:id
 */
exports.deleteTrip = async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await Trip.findByIdAndDelete(id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.json({
      success: true,
      message: 'Trip deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting trip:', error);
    res.status(500).json({ 
      error: 'Failed to delete trip',
      message: error.message 
    });
  }
};

/**
 * Track GPS location during trip
 * POST /api/trips/:id/track
 */
exports.trackLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ 
        error: 'Missing coordinates',
        required: ['latitude', 'longitude']
      });
    }

    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const coordinates = [longitude, latitude];
    let distance = 0;
    let carbonEmitted = 0;

    // Calculate distance from last tracked point
    if (trip.trackingData.length > 0) {
      const lastPoint = trip.trackingData[trip.trackingData.length - 1];
      distance = carbonService.calculateDistance(
        lastPoint.location.coordinates,
        coordinates
      );
      carbonEmitted = distance * 0.12; // Assuming car transport
    }

    // Add new tracking point
    trip.trackingData.push({
      timestamp: new Date(),
      location: {
        type: 'Point',
        coordinates
      },
      distance: (trip.trackingData[trip.trackingData.length - 1]?.distance || 0) + distance,
      carbonEmitted: (trip.trackingData[trip.trackingData.length - 1]?.carbonEmitted || 0) + carbonEmitted
    });

    // Update actual carbon
    trip.actualCarbon = carbonService.calculateActualCarbon(trip.trackingData);

    await trip.save();

    res.json({
      success: true,
      currentLocation: coordinates,
      totalDistance: trip.trackingData[trip.trackingData.length - 1].distance,
      actualCarbon: trip.actualCarbon,
      predictedCarbon: trip.predictedCarbon,
      difference: trip.predictedCarbon - trip.actualCarbon
    });
  } catch (error) {
    console.error('Error tracking location:', error);
    res.status(500).json({ 
      error: 'Failed to track location',
      message: error.message 
    });
  }
};

/**
 * Compare predicted vs actual carbon footprint
 * GET /api/trips/:id/compare
 */
exports.compareCarbon = async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    if (!trip.actualCarbon) {
      return res.status(400).json({ 
        error: 'No actual carbon data available',
        message: 'Trip must be tracked to compare carbon footprints'
      });
    }

    const comparison = carbonService.compareFootprints(
      trip.predictedCarbon,
      trip.actualCarbon
    );

    // Calculate carbon saved vs conventional travel
    const conventionalCarbon = trip.predictedCarbon * 1.5; // Assume 50% higher
    const savings = carbonService.calculateCarbonSaved(
      trip.actualCarbon,
      conventionalCarbon
    );

    res.json({
      success: true,
      comparison,
      savings,
      breakdown: {
        predicted: trip.carbonBreakdown,
        actual: {
          // Simplified - in production, track actual breakdown
          transport: trip.actualCarbon
        }
      }
    });
  } catch (error) {
    console.error('Error comparing carbon:', error);
    res.status(500).json({ 
      error: 'Failed to compare carbon',
      message: error.message 
    });
  }
};

/**
 * Generate share code for trip
 * POST /api/trips/:id/share
 */
exports.generateShareCode = async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const shareCode = trip.generateShareCode();
    trip.isPublic = true;
    await trip.save();

    const shareUrl = `${process.env.FRONTEND_URL}/shared/${shareCode}`;

    res.json({
      success: true,
      shareCode,
      shareUrl,
      trip
    });
  } catch (error) {
    console.error('Error generating share code:', error);
    res.status(500).json({ 
      error: 'Failed to generate share code',
      message: error.message 
    });
  }
};

/**
 * Get trip by share code
 * GET /api/trips/shared/:shareCode
 */
exports.getTripByShareCode = async (req, res) => {
  try {
    const { shareCode } = req.params;

    const trip = await Trip.findOne({ shareCode, isPublic: true })
      .populate('userId', 'name avatar ecoScore')
      .populate('badgesEarned');

    if (!trip) {
      return res.status(404).json({ 
        error: 'Shared trip not found or not public' 
      });
    }

    res.json({
      success: true,
      trip
    });
  } catch (error) {
    console.error('Error fetching shared trip:', error);
    res.status(500).json({ 
      error: 'Failed to fetch shared trip',
      message: error.message 
    });
  }
};

/**
 * Mark trip as complete and award badges
 * POST /api/trips/:id/complete
 */
exports.completeTrip = async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await Trip.findById(id);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    trip.status = 'completed';
    await trip.save();

    // Update user stats
    const user = await User.findById(trip.userId);
    if (user) {
      user.totalTrips += 1;
      
      if (trip.actualCarbon && trip.predictedCarbon) {
        const saved = trip.predictedCarbon - trip.actualCarbon;
        if (saved > 0) {
          user.totalCarbonSaved += saved;
        }
      }
      
      await user.calculateEcoScore();
      await user.save();

      // Check and award badges
      const badges = await Badge.find({ isActive: true });
      const earnedBadges = [];

      for (const badge of badges) {
        const eligible = await badge.checkEligibility(user._id);
        if (eligible && !user.earnedBadges.some(eb => eb.badgeId.equals(badge._id))) {
          user.earnedBadges.push({
            badgeId: badge._id,
            earnedAt: new Date(),
            progress: 100
          });
          earnedBadges.push(badge);
        }
      }

      if (earnedBadges.length > 0) {
        await user.save();
        trip.badgesEarned = earnedBadges.map(b => b._id);
        await trip.save();
      }

      res.json({
        success: true,
        trip,
        user: {
          ecoScore: user.ecoScore,
          totalTrips: user.totalTrips,
          totalCarbonSaved: user.totalCarbonSaved
        },
        newBadges: earnedBadges
      });
    } else {
      res.json({
        success: true,
        trip
      });
    }
  } catch (error) {
    console.error('Error completing trip:', error);
    res.status(500).json({ 
      error: 'Failed to complete trip',
      message: error.message 
    });
  }
};
