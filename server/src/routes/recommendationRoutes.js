const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');

// Get recommendations for trip
router.get('/:tripId', recommendationController.getRecommendations);

module.exports = router;
