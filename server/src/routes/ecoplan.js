/**
 * EcoPlan Routes
 * AI-powered trip planning and optimization
 */

const express = require('express');
const router = express.Router();
const ecoPlanController = require('../controllers/ecoPlanController');

// Generate auto eco-plan
router.post('/generate', ecoPlanController.generatePlan);

// Optimize existing trip
router.post('/optimize/:tripId', ecoPlanController.optimizeTrip);

// Get eco-benchmark for trip parameters
router.post('/benchmark', ecoPlanController.getBenchmark);

// Compare trip against benchmark
router.post('/compare/:tripId', ecoPlanController.compareWithBenchmark);

// Get transport options between two points
router.post('/transport-options', ecoPlanController.getTransportOptions);

// Get activity suggestions for destination
router.post('/activities', ecoPlanController.getActivitySuggestions);

// Real-time carbon calculation (live as user builds trip)
router.post('/calculate-live', ecoPlanController.calculateLive);

module.exports = router;
