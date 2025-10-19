const carbonService = require('../services/carbonService');
const Trip = require('../models/Trip');

/**
 * Calculate carbon footprint
 * POST /api/carbon/calculate
 */
exports.calculateCarbon = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ 
        error: 'Missing or invalid items array' 
      });
    }

    const carbonData = await carbonService.calculateTripCarbon(items);
    const recommendations = carbonService.getEcoAlternatives(carbonData.total, 'trip');

    res.json({
      success: true,
      carbon: carbonData.total,
      breakdown: carbonData.breakdown,
      rating: carbonService.getCarbonRating(carbonData.total),
      recommendations
    });
  } catch (error) {
    console.error('Error calculating carbon:', error);
    res.status(500).json({ 
      error: 'Failed to calculate carbon',
      message: error.message 
    });
  }
};

/**
 * Get carbon statistics for user
 * GET /api/carbon/stats/:userId
 */
exports.getCarbonStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = 'all' } = req.query;

    let dateFilter = {};
    if (period === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      dateFilter = { createdAt: { $gte: monthAgo } };
    } else if (period === 'year') {
      const yearAgo = new Date();
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      dateFilter = { createdAt: { $gte: yearAgo } };
    }

    const trips = await Trip.find({ 
      userId, 
      status: 'completed',
      ...dateFilter
    });

    // Calculate statistics
    const stats = {
      totalTrips: trips.length,
      totalPredicted: 0,
      totalActual: 0,
      totalSaved: 0,
      averagePerTrip: 0,
      breakdown: {
        flights: 0,
        hotels: 0,
        transport: 0,
        activities: 0
      },
      monthlyTrend: []
    };

    trips.forEach(trip => {
      stats.totalPredicted += trip.predictedCarbon || 0;
      stats.totalActual += trip.actualCarbon || 0;
      
      if (trip.carbonBreakdown) {
        stats.breakdown.flights += trip.carbonBreakdown.flights || 0;
        stats.breakdown.hotels += trip.carbonBreakdown.hotels || 0;
        stats.breakdown.transport += trip.carbonBreakdown.transport || 0;
        stats.breakdown.activities += trip.carbonBreakdown.activities || 0;
      }
    });

    stats.totalSaved = stats.totalPredicted - stats.totalActual;
    stats.averagePerTrip = trips.length > 0 ? stats.totalActual / trips.length : 0;

    // Calculate monthly trend
    const monthlyData = {};
    trips.forEach(trip => {
      const month = trip.createdAt.toISOString().slice(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { predicted: 0, actual: 0, count: 0 };
      }
      monthlyData[month].predicted += trip.predictedCarbon || 0;
      monthlyData[month].actual += trip.actualCarbon || 0;
      monthlyData[month].count += 1;
    });

    stats.monthlyTrend = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      predicted: data.predicted,
      actual: data.actual,
      saved: data.predicted - data.actual,
      trips: data.count
    }));

    res.json({
      success: true,
      period,
      stats
    });
  } catch (error) {
    console.error('Error fetching carbon stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch carbon stats',
      message: error.message 
    });
  }
};
