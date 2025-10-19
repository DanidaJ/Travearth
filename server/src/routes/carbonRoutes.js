const express = require('express');
const router = express.Router();
const carbonController = require('../controllers/carbonController');

// Calculate carbon for trip items
router.post('/calculate', carbonController.calculateCarbon);

// Get carbon statistics for user
router.get('/stats/:userId', carbonController.getCarbonStats);

module.exports = router;
