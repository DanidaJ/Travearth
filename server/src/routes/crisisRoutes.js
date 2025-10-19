const express = require('express');
const router = express.Router();
const crisisController = require('../controllers/crisisController');

// Get all active crisis alerts
router.get('/alerts', crisisController.getActiveAlerts);

// Get alerts affecting a location
router.post('/check-location', crisisController.checkLocation);

// Get alerts for a trip
router.get('/trip/:tripId', crisisController.getTripAlerts);

module.exports = router;
