const Amadeus = require('amadeus');

// Initialize Amadeus client
const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_API_KEY || 'fdA0UhXU3rB7zWQjLvHbbGnD7LZVkybE',
  clientSecret: process.env.AMADEUS_API_SECRET || 'aoGx5dk1IdfgrkVn'
});

/**
 * Search for flight offers between two airports
 * @param {string} originCode - IATA airport code (e.g., 'CMB')
 * @param {string} destinationCode - IATA airport code (e.g., 'BKK')
 * @param {string} departureDate - Date in YYYY-MM-DD format
 * @param {number} adults - Number of adult passengers (default: 1)
 * @param {string} travelClass - ECONOMY or BUSINESS (default: ECONOMY)
 * @returns {Promise} Flight offers with prices and carbon data
 */
async function searchFlights(originCode, destinationCode, departureDate, adults = 1, travelClass = 'ECONOMY') {
  try {
    const response = await amadeus.shopping.flightOffersSearch.get({
      originLocationCode: originCode,
      destinationLocationCode: destinationCode,
      departureDate: departureDate,
      adults: adults,
      travelClass: travelClass,
      max: 5, // Get top 5 offers
      currencyCode: 'USD'
    });

    // Process and format the response
    const offers = response.data.map(offer => {
      const itinerary = offer.itineraries[0]; // First itinerary
      const segment = itinerary.segments[0]; // First segment
      
      // Extract carbon emissions if available
      const carbonEmissions = segment.co2Emissions ? 
        segment.co2Emissions[0].weight : null;

      return {
        id: offer.id,
        price: {
          total: parseFloat(offer.price.total),
          currency: offer.price.currency
        },
        airline: segment.carrierCode,
        flight: {
          number: segment.number,
          departure: {
            airport: segment.departure.iataCode,
            time: segment.departure.at
          },
          arrival: {
            airport: segment.arrival.iataCode,
            time: segment.arrival.at
          },
          duration: itinerary.duration,
          cabin: offer.travelerPricings[0].fareDetailsBySegment[0].cabin
        },
        carbon: {
          weight: carbonEmissions,
          unit: 'KG'
        },
        numberOfStops: itinerary.segments.length - 1,
        validatingAirline: offer.validatingAirlineCodes[0]
      };
    });

    return {
      success: true,
      data: offers
    };

  } catch (error) {
    console.error('Amadeus API Error:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.errors || error.message
    };
  }
}

/**
 * Get flight offers for multi-city trip
 * @param {Array} routes - Array of {origin, destination, date} objects
 * @param {number} adults - Number of passengers
 * @param {string} travelClass - ECONOMY or BUSINESS
 * @returns {Promise} All flight offers for the trip
 */
async function searchMultiCityFlights(routes, adults = 1, travelClass = 'ECONOMY') {
  try {
    const allOffers = [];

    for (const route of routes) {
      const offers = await searchFlights(
        route.origin,
        route.destination,
        route.date,
        adults,
        travelClass
      );

      if (offers.success) {
        allOffers.push({
          route: {
            from: route.origin,
            to: route.destination,
            date: route.date
          },
          offers: offers.data
        });
      }
    }

    return {
      success: true,
      data: allOffers
    };

  } catch (error) {
    console.error('Multi-city search error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get airport information
 * @param {string} keyword - City name or airport code
 * @returns {Promise} List of matching airports
 */
async function searchAirports(keyword) {
  try {
    const response = await amadeus.referenceData.locations.get({
      keyword: keyword,
      subType: 'AIRPORT,CITY'
    });

    return {
      success: true,
      data: response.data.map(location => ({
        code: location.iataCode,
        name: location.name,
        city: location.address.cityName,
        country: location.address.countryName,
        coordinates: {
          lat: location.geoCode.latitude,
          lng: location.geoCode.longitude
        }
      }))
    };

  } catch (error) {
    console.error('Airport search error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get airline information
 * @param {string} airlineCode - IATA airline code
 * @returns {Promise} Airline details
 */
async function getAirlineInfo(airlineCode) {
  try {
    const response = await amadeus.referenceData.airlines.get({
      airlineCodes: airlineCode
    });

    return {
      success: true,
      data: response.data[0]
    };

  } catch (error) {
    console.error('Airline info error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  searchFlights,
  searchMultiCityFlights,
  searchAirports,
  getAirlineInfo
};
