const amadeusService = require('../services/amadeusService');

/**
 * Search for flight offers
 * POST /api/flights/search
 * Body: { origin, destination, departureDate, adults, travelClass }
 */
exports.searchFlights = async (req, res) => {
  try {
    const { origin, destination, departureDate, adults = 1, travelClass = 'ECONOMY' } = req.body;

    // Validate required fields
    if (!origin || !destination || !departureDate) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: origin, destination, departureDate'
      });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(departureDate)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    const result = await amadeusService.searchFlights(
      origin,
      destination,
      departureDate,
      adults,
      travelClass
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }

  } catch (error) {
    console.error('Flight search error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Search for multi-city flights
 * POST /api/flights/multi-city
 * Body: { routes: [{origin, destination, date}], adults, travelClass }
 */
exports.searchMultiCity = async (req, res) => {
  try {
    const { routes, adults = 1, travelClass = 'ECONOMY' } = req.body;

    if (!routes || !Array.isArray(routes) || routes.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid routes array'
      });
    }

    // Validate each route
    for (const route of routes) {
      if (!route.origin || !route.destination || !route.date) {
        return res.status(400).json({
          success: false,
          error: 'Each route must have origin, destination, and date'
        });
      }
    }

    const result = await amadeusService.searchMultiCityFlights(
      routes,
      adults,
      travelClass
    );

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }

  } catch (error) {
    console.error('Multi-city search error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Search for airports
 * GET /api/flights/airports?keyword=london
 */
exports.searchAirports = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        error: 'Missing keyword parameter'
      });
    }

    const result = await amadeusService.searchAirports(keyword);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }

  } catch (error) {
    console.error('Airport search error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * Get airline information
 * GET /api/flights/airline/:code
 */
exports.getAirlineInfo = async (req, res) => {
  try {
    const { code } = req.params;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Missing airline code'
      });
    }

    const result = await amadeusService.getAirlineInfo(code);

    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }

  } catch (error) {
    console.error('Airline info error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
