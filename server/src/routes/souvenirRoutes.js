const express = require('express');
const router = express.Router();
const souvenirController = require('../controllers/souvenirController');

// Generate smart souvenir for trip
router.post('/generate/:tripId', souvenirController.generateSouvenir);

module.exports = router;
