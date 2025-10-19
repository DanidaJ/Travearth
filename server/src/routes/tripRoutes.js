const express = require('express');
const router = express.Router();
const tripController = require('../controllers/tripController');

// Get all trips (for dashboard)
router.get('/', tripController.getAllTrips);

// Create new trip (RESTful route)
router.post('/', tripController.createTrip);

// Create new trip (legacy route for backwards compatibility)
router.post('/create', tripController.createTrip);

// Get all trips for a user
router.get('/user/:userId', tripController.getUserTrips);

// Get single trip
router.get('/:id', tripController.getTrip);

// Update trip
router.put('/:id', tripController.updateTrip);

// Delete trip
router.delete('/:id', tripController.deleteTrip);

// Track GPS location during trip
router.post('/:id/track', tripController.trackLocation);

// Compare predicted vs actual carbon
router.get('/:id/compare', tripController.compareCarbon);

// Generate share code
router.post('/:id/share', tripController.generateShareCode);

// Get trip by share code
router.get('/shared/:shareCode', tripController.getTripByShareCode);

// Mark trip as complete
router.post('/:id/complete', tripController.completeTrip);

module.exports = router;
