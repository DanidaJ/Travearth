const Trip = require('../models/Trip');
const Hotel = require('../models/Hotel');
const carbonService = require('../services/carbonService');

/**
 * Get eco-recommendations for a trip
 * GET /api/recommendations/:tripId
 */
exports.getRecommendations = async (req, res) => {
  try {
    const { tripId } = req.params;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    const recommendations = [];

    // Analyze carbon footprint
    if (trip.predictedCarbon > 500) {
      recommendations.push({
        type: 'alternative',
        category: 'transport',
        title: 'Consider sustainable transport',
        description: 'Your trip has a high carbon footprint. Consider train or bus instead of flying.',
        impact: 'high',
        potentialSaving: trip.predictedCarbon * 0.7,
        icon: 'train'
      });
    }

    // Check for eco-certified hotels
    const hasEcoHotels = trip.items.some(
      item => item.type === 'hotel' && item.details?.hotel?.ecoCertified
    );
    if (!hasEcoHotels) {
      recommendations.push({
        type: 'alternative',
        category: 'accommodation',
        title: 'Choose eco-certified hotels',
        description: 'Eco-certified hotels use renewable energy and sustainable practices.',
        impact: 'medium',
        potentialSaving: trip.predictedCarbon * 0.15,
        icon: 'hotel'
      });
    }

    // Suggest nearby eco-friendly alternatives
    for (const item of trip.items) {
      if (item.type === 'destination' && item.location?.coordinates) {
        try {
          const nearbyHotels = await Hotel.find({
            isActive: true,
            sustainabilityScore: { $gte: 80 },
            location: {
              $near: {
                $geometry: {
                  type: 'Point',
                  coordinates: item.location.coordinates
                },
                $maxDistance: 10000 // 10km
              }
            }
          }).limit(3);

          if (nearbyHotels.length > 0) {
            recommendations.push({
              type: 'tip',
              category: 'accommodation',
              title: `${nearbyHotels.length} eco-friendly hotels near ${item.name}`,
              description: 'We found highly-rated sustainable accommodations nearby.',
              impact: 'medium',
              data: nearbyHotels.map(h => ({
                name: h.name,
                score: h.sustainabilityScore,
                location: h.location.address
              })),
              icon: 'leaf'
            });
          }
        } catch (error) {
          console.error('Error finding nearby hotels:', error);
        }
      }
    }

    // Activity recommendations
    const activities = trip.items.filter(i => i.type === 'activity');
    if (activities.length === 0) {
      recommendations.push({
        type: 'tip',
        category: 'activity',
        title: 'Add eco-friendly activities',
        description: 'Hiking, cycling, and cultural experiences have low carbon footprints.',
        impact: 'low',
        icon: 'map-pin'
      });
    }

    // Conservation recommendations
    if (trip.overallSustainabilityScore > 70) {
      recommendations.push({
        type: 'tip',
        category: 'conservation',
        title: 'Support local conservation',
        description: 'Your trip has a great sustainability score! Consider supporting local environmental projects.',
        impact: 'low',
        icon: 'heart'
      });
    }

    // General tips
    recommendations.push(
      {
        type: 'tip',
        category: 'general',
        title: 'Pack reusable items',
        description: 'Bring reusable water bottles, bags, and utensils to reduce waste.',
        impact: 'low',
        icon: 'recycle'
      },
      {
        type: 'tip',
        category: 'general',
        title: 'Offset your carbon footprint',
        description: `Consider offsetting ${Math.round(trip.predictedCarbon)}kg CO2 through verified carbon offset programs.`,
        impact: 'medium',
        icon: 'tree'
      }
    );

    // Warnings for high-impact choices
    const highCarbonItems = trip.items.filter(i => i.carbonFootprint > 100);
    if (highCarbonItems.length > 0) {
      recommendations.push({
        type: 'warning',
        category: 'carbon',
        title: 'High carbon activities detected',
        description: `${highCarbonItems.length} activities have high carbon footprints. Consider alternatives.`,
        impact: 'high',
        icon: 'alert-triangle'
      });
    }

    res.json({
      success: true,
      count: recommendations.length,
      tripScore: trip.overallSustainabilityScore,
      carbonFootprint: trip.predictedCarbon,
      recommendations
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ 
      error: 'Failed to generate recommendations',
      message: error.message 
    });
  }
};
