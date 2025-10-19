const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Create user
router.post('/create', userController.createUser);

// Get user
router.get('/:id', userController.getUser);

// Update user
router.put('/:id', userController.updateUser);

// Get user eco-score
router.get('/:id/eco-score', userController.getEcoScore);

module.exports = router;
