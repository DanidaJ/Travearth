const express = require('express');
const router = express.Router();
const flightsController = require('../controllers/flightsController');

// Search for flight offers
router.post('/search', flightsController.searchFlights);

// Search for multi-city flights
router.post('/multi-city', flightsController.searchMultiCity);

// Search for airports
router.get('/airports', flightsController.searchAirports);

// Get airline information
router.get('/airline/:code', flightsController.getAirlineInfo);

module.exports = router;
