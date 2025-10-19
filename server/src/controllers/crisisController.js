const CrisisAlert = require('../models/CrisisAlert');
const Trip = require('../models/Trip');

/**
 * Get all active crisis alerts
 * GET /api/crisis/alerts
 */
exports.getActiveAlerts = async (req, res) => {
  try {
    const { severity, type, limit = 50 } = req.query;

    const query = { isActive: true };
    if (severity) query.severity = severity;
    if (type) query.type = type;

    const alerts = await CrisisAlert.find(query)
      .sort('-severity -createdAt')
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: alerts.length,
      alerts
    });
  } catch (error) {
    console.error('Error fetching crisis alerts:', error);
    res.status(500).json({ 
      error: 'Failed to fetch crisis alerts',
      message: error.message 
    });
  }
};

/**
 * Check if a location is affected by crisis
 * POST /api/crisis/check-location
 */
exports.checkLocation = async (req, res) => {
  try {
    const { latitude, longitude, radius = 100 } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ 
        error: 'Missing coordinates',
        required: ['latitude', 'longitude']
      });
    }

    const alerts = await CrisisAlert.find({
      isActive: true,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      }
    });

    res.json({
      success: true,
      affected: alerts.length > 0,
      count: alerts.length,
      alerts
    });
  } catch (error) {
    console.error('Error checking location:', error);
    res.status(500).json({ 
      error: 'Failed to check location',
      message: error.message 
    });
  }
};

/**
 * Get crisis alerts for a trip
 * GET /api/crisis/trip/:tripId
 */
exports.getTripAlerts = async (req, res) => {
  try {
    const { tripId } = req.params;

    const trip = await Trip.findById(tripId).populate('crisisAlerts');
    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.json({
      success: true,
      affected: trip.affectedByCrisis,
      count: trip.crisisAlerts.length,
      alerts: trip.crisisAlerts
    });
  } catch (error) {
    console.error('Error fetching trip alerts:', error);
    res.status(500).json({ 
      error: 'Failed to fetch trip alerts',
      message: error.message 
    });
  }
};
