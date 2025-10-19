const Hotel = require('../models/Hotel');

/**
 * Register new hotel (B2B)
 * POST /api/hotels/register
 */
exports.registerHotel = async (req, res) => {
  try {
    const hotelData = req.body;

    // Create hotel
    const hotel = new Hotel(hotelData);

    // Calculate sustainability scores
    hotel.calculateScoreComponents();

    await hotel.save();

    res.status(201).json({
      success: true,
      hotel,
      message: 'Hotel registered successfully. Pending verification.'
    });
  } catch (error) {
    console.error('Error registering hotel:', error);
    res.status(500).json({ 
      error: 'Failed to register hotel',
      message: error.message 
    });
  }
};

/**
 * Get all hotels with filtering and sorting
 * GET /api/hotels/list
 */
exports.getHotels = async (req, res) => {
  try {
    const { 
      city, 
      country, 
      minScore = 0, 
      maxPrice, 
      ecoCertified,
      sort = '-sustainabilityScore',
      limit = 50,
      page = 1
    } = req.query;

    const query = { isActive: true };

    if (city) query['location.address.city'] = new RegExp(city, 'i');
    if (country) query['location.address.country'] = new RegExp(country, 'i');
    if (minScore) query.sustainabilityScore = { $gte: parseInt(minScore) };
    if (ecoCertified === 'true') query['ecoCertifications.0'] = { $exists: true };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const hotels = await Hotel.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .skip(skip)
      .select('-reviews'); // Exclude reviews for list view

    const total = await Hotel.countDocuments(query);

    res.json({
      success: true,
      count: hotels.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      hotels
    });
  } catch (error) {
    console.error('Error fetching hotels:', error);
    res.status(500).json({ 
      error: 'Failed to fetch hotels',
      message: error.message 
    });
  }
};

/**
 * Search hotels by city/country (GET with query params)
 * GET /api/hotels/search?city=Paris&country=France&limit=6
 */
exports.searchHotelsByQuery = async (req, res) => {
  try {
    const { city, country, limit = 6, minScore = 0 } = req.query;

    if (!city && !country) {
      return res.status(400).json({ 
        error: 'Missing search parameters',
        message: 'Please provide city or country'
      });
    }

    const query = { isActive: { $ne: false } }; // Include docs without isActive field

    if (city) {
      query['location.address.city'] = new RegExp(city, 'i');
    }
    if (country) {
      query['location.address.country'] = new RegExp(country, 'i');
    }
    if (minScore) {
      query.sustainabilityScore = { $gte: parseInt(minScore) };
    }

    const hotels = await Hotel.find(query)
      .sort('-sustainabilityScore')
      .limit(parseInt(limit))
      .select('-reviews'); // Exclude reviews for performance

    // Map to frontend format
    const formattedHotels = hotels.map(hotel => ({
      _id: hotel._id,
      name: hotel.name,
      description: hotel.description,
      location: {
        city: hotel.location.address.city,
        address: hotel.location.address.street,
        country: hotel.location.address.country,
        coordinates: hotel.location.coordinates
      },
      pricePerNight: hotel.roomTypes && hotel.roomTypes[0] ? hotel.roomTypes[0].pricePerNight : 120,
      rating: hotel.stars || hotel.rating || 4,
      sustainabilityScore: hotel.sustainabilityScore,
      features: [],
      amenities: hotel.amenities || []
    }));

    // Add features based on ecoPractices
    formattedHotels.forEach(hotel => {
      const original = hotels.find(h => h._id.toString() === hotel._id.toString());
      if (original && original.ecoPractices) {
        if (original.ecoPractices.renewableEnergy) hotel.features.push('solar');
        if (original.ecoPractices.wasteRecycling) hotel.features.push('recycling');
        if (original.ecoPractices.localSourcing) hotel.features.push('organic');
        if (original.ecoPractices.waterConservation) hotel.features.push('water');
      }
    });

    res.json(formattedHotels);
  } catch (error) {
    console.error('Error searching hotels by query:', error);
    res.status(500).json({ 
      error: 'Failed to search hotels',
      message: error.message 
    });
  }
};

/**
 * Search hotels near a location
 * POST /api/hotels/search
 */
exports.searchHotels = async (req, res) => {
  try {
    const { latitude, longitude, radius = 50, minScore = 0 } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ 
        error: 'Missing coordinates',
        required: ['latitude', 'longitude']
      });
    }

    const hotels = await Hotel.find({
      isActive: true,
      sustainabilityScore: { $gte: minScore },
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: radius * 1000 // Convert km to meters
        }
      }
    }).limit(20);

    res.json({
      success: true,
      count: hotels.length,
      hotels
    });
  } catch (error) {
    console.error('Error searching hotels:', error);
    res.status(500).json({ 
      error: 'Failed to search hotels',
      message: error.message 
    });
  }
};

/**
 * Get single hotel
 * GET /api/hotels/:id
 */
exports.getHotel = async (req, res) => {
  try {
    const { id } = req.params;

    const hotel = await Hotel.findById(id)
      .populate('reviews.userId', 'name avatar');

    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    // Increment views
    hotel.views += 1;
    await hotel.save();

    res.json({
      success: true,
      hotel
    });
  } catch (error) {
    console.error('Error fetching hotel:', error);
    res.status(500).json({ 
      error: 'Failed to fetch hotel',
      message: error.message 
    });
  }
};

/**
 * Update hotel
 * PUT /api/hotels/:id
 */
exports.updateHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    let hotel = await Hotel.findById(id);
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    Object.keys(updates).forEach(key => {
      if (key !== '_id') {
        hotel[key] = updates[key];
      }
    });

    // Recalculate scores if relevant fields changed
    if (updates.ecoPractices || updates.ecoCertifications || updates.carbonFootprintPerNight) {
      hotel.calculateScoreComponents();
    }

    await hotel.save();

    res.json({
      success: true,
      hotel
    });
  } catch (error) {
    console.error('Error updating hotel:', error);
    res.status(500).json({ 
      error: 'Failed to update hotel',
      message: error.message 
    });
  }
};

/**
 * Delete hotel
 * DELETE /api/hotels/:id
 */
exports.deleteHotel = async (req, res) => {
  try {
    const { id } = req.params;

    const hotel = await Hotel.findByIdAndDelete(id);
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    res.json({
      success: true,
      message: 'Hotel deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting hotel:', error);
    res.status(500).json({ 
      error: 'Failed to delete hotel',
      message: error.message 
    });
  }
};

/**
 * Add review to hotel
 * POST /api/hotels/:id/review
 */
exports.addReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, rating, comment } = req.body;

    if (!userId || !rating) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['userId', 'rating']
      });
    }

    const hotel = await Hotel.findById(id);
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    hotel.reviews.push({
      userId,
      rating,
      comment,
      createdAt: new Date()
    });

    // Update average rating
    const totalRating = hotel.reviews.reduce((sum, review) => sum + review.rating, 0);
    hotel.rating = totalRating / hotel.reviews.length;

    await hotel.save();

    res.json({
      success: true,
      hotel,
      message: 'Review added successfully'
    });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ 
      error: 'Failed to add review',
      message: error.message 
    });
  }
};
