const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');

// Register new hotel (B2B)
router.post('/register', hotelController.registerHotel);

// Get all hotels
router.get('/list', hotelController.getHotels);

// Search hotels by location (GET with query params)
router.get('/search', hotelController.searchHotelsByQuery);

// Search hotels by location (POST with coordinates)
router.post('/search', hotelController.searchHotels);

// Get single hotel
router.get('/:id', hotelController.getHotel);

// Update hotel
router.put('/:id', hotelController.updateHotel);

// Delete hotel
router.delete('/:id', hotelController.deleteHotel);

// Add review
router.post('/:id/review', hotelController.addReview);

module.exports = router;
