const express = require('express');
const router = express.Router();
const badgeController = require('../controllers/badgeController');

// Get all badges
router.get('/', badgeController.getAllBadges);

// Get user badges
router.get('/user/:userId', badgeController.getUserBadges);

// Check and award badges to user
router.post('/check/:userId', badgeController.checkAndAwardBadges);

// Create new badge (admin)
router.post('/create', badgeController.createBadge);

module.exports = router;
