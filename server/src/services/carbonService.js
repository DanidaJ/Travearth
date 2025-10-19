const axios = require('axios');
const geolib = require('geolib');

class CarbonCalculationService {
  constructor() {
    // Carbon emission factors (kg CO2 per km)
    this.emissionFactors = {
      flight: {
        short: 0.255, // < 500km
        medium: 0.195, // 500-3000km
        long: 0.150 // > 3000km
      },
      car: 0.12,
      train: 0.041,
      bus: 0.089,
      walk: 0,
      bike: 0
    };
    
    // Hotel carbon per night (kg CO2)
    this.hotelCarbon = {
      default: 20,
      eco: 10,
      luxury: 35
    };
    
    // Activity carbon factors
    this.activityCarbon = {
      hiking: 2,
      museum: 5,
      shopping: 10,
      restaurant: 8,
      water_sports: 15,
      extreme_sports: 25
    };
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  calculateDistance(coord1, coord2) {
    return geolib.getDistance(
      { latitude: coord1[1], longitude: coord1[0] },
      { latitude: coord2[1], longitude: coord2[0] }
    ) / 1000; // Convert to km
  }

  /**
   * Calculate carbon footprint for flight
   */
  async calculateFlightCarbon(origin, destination, passengers = 1) {
    try {
      const distance = this.calculateDistance(origin, destination);
      
      // Use Carbon Interface API if available
      if (process.env.CARBON_INTERFACE_API_KEY) {
        try {
          const response = await axios.post(
            'https://www.carboninterface.com/api/v1/estimates',
            {
              type: 'flight',
              passengers: passengers,
              legs: [{
                departure_airport: origin.iata || 'XXX',
                destination_airport: destination.iata || 'XXX',
                class: 'economy'
              }]
            },
            {
              headers: {
                'Authorization': `Bearer ${process.env.CARBON_INTERFACE_API_KEY}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          if (response.data?.data?.attributes?.carbon_kg) {
            return response.data.data.attributes.carbon_kg;
          }
        } catch (apiError) {
          console.log('Carbon Interface API error, using fallback calculation');
        }
      }
      
      // Fallback calculation
      let emissionFactor;
      if (distance < 500) {
        emissionFactor = this.emissionFactors.flight.short;
      } else if (distance < 3000) {
        emissionFactor = this.emissionFactors.flight.medium;
      } else {
        emissionFactor = this.emissionFactors.flight.long;
      }
      
      return distance * emissionFactor * passengers;
    } catch (error) {
      console.error('Error calculating flight carbon:', error);
      throw error;
    }
  }

  /**
   * Calculate carbon for ground transport
   */
  calculateTransportCarbon(mode, distance) {
    const factor = this.emissionFactors[mode] || this.emissionFactors.car;
    return distance * factor;
  }

  /**
   * Calculate carbon for hotel stay
   */
  calculateHotelCarbon(nights, hotelType = 'default', ecoCertified = false) {
    let baseCarbon = this.hotelCarbon[hotelType] || this.hotelCarbon.default;
    
    // 50% reduction for eco-certified hotels
    if (ecoCertified) {
      baseCarbon *= 0.5;
    }
    
    return nights * baseCarbon;
  }

  /**
   * Calculate carbon for activity
   */
  calculateActivityCarbon(activityType, duration = 1, participants = 1) {
    const baseCarbon = this.activityCarbon[activityType] || 5;
    return baseCarbon * duration * participants;
  }

  /**
   * Calculate predicted carbon for entire trip
   */
  async calculateTripCarbon(tripItems) {
    let totalCarbon = 0;
    const breakdown = {
      flights: 0,
      hotels: 0,
      transport: 0,
      activities: 0
    };

    let previousLocation = null;

    for (const item of tripItems) {
      let itemCarbon = 0;

      switch (item.type) {
        case 'destination':
          if (previousLocation && item.location?.coordinates) {
            // Calculate flight carbon to destination
            itemCarbon = await this.calculateFlightCarbon(
              previousLocation,
              item.location.coordinates
            );
            breakdown.flights += itemCarbon;
          }
          previousLocation = item.location?.coordinates;
          break;

        case 'hotel':
          const nights = item.duration || 1;
          const ecoCertified = item.details?.hotel?.ecoCertified || false;
          itemCarbon = this.calculateHotelCarbon(nights, 'default', ecoCertified);
          breakdown.hotels += itemCarbon;
          break;

        case 'transport':
          const mode = item.details?.transport?.mode || 'car';
          const distance = item.details?.transport?.distance || 0;
          itemCarbon = this.calculateTransportCarbon(mode, distance);
          
          if (mode === 'flight') {
            breakdown.flights += itemCarbon;
          } else {
            breakdown.transport += itemCarbon;
          }
          break;

        case 'activity':
          const activityType = item.details?.activity?.category || 'museum';
          const duration = item.duration || 1;
          const participants = item.details?.activity?.participants || 1;
          itemCarbon = this.calculateActivityCarbon(activityType, duration, participants);
          breakdown.activities += itemCarbon;
          break;
      }

      totalCarbon += itemCarbon;
    }

    return {
      total: Math.round(totalCarbon * 100) / 100,
      breakdown
    };
  }

  /**
   * Calculate actual carbon from GPS tracking data
   */
  calculateActualCarbon(trackingData) {
    if (!trackingData || trackingData.length === 0) return 0;

    let totalCarbon = 0;
    
    for (let i = 1; i < trackingData.length; i++) {
      const prevPoint = trackingData[i - 1];
      const currPoint = trackingData[i];
      
      const distance = this.calculateDistance(
        prevPoint.location.coordinates,
        currPoint.location.coordinates
      );
      
      // Assume average transport mode (car)
      const carbon = distance * this.emissionFactors.car;
      totalCarbon += carbon;
    }

    return Math.round(totalCarbon * 100) / 100;
  }

  /**
   * Get eco-friendly alternatives
   */
  getEcoAlternatives(currentCarbon, tripType) {
    const alternatives = [];
    
    if (currentCarbon > 100) {
      alternatives.push({
        type: 'transport',
        title: 'Consider train instead of flying',
        description: 'Trains emit 80% less CO2 than flights',
        potentialSaving: currentCarbon * 0.8,
        impact: 'high'
      });
    }

    alternatives.push({
      type: 'accommodation',
      title: 'Choose eco-certified hotels',
      description: 'Reduce hotel carbon footprint by 50%',
      potentialSaving: currentCarbon * 0.15,
      impact: 'medium'
    });

    alternatives.push({
      type: 'activity',
      title: 'Opt for low-carbon activities',
      description: 'Hiking, cycling, and local experiences',
      potentialSaving: currentCarbon * 0.1,
      impact: 'low'
    });

    return alternatives;
  }

  /**
   * Compare predicted vs actual carbon
   */
  compareFootprints(predicted, actual) {
    const difference = predicted - actual;
    const percentageDiff = ((difference / predicted) * 100).toFixed(1);
    
    return {
      predicted,
      actual,
      difference: Math.round(difference * 100) / 100,
      percentageDiff: parseFloat(percentageDiff),
      performance: percentageDiff > 0 ? 'better' : 'worse',
      rating: this.getCarbonRating(actual)
    };
  }

  /**
   * Get carbon performance rating
   */
  getCarbonRating(carbonKg) {
    if (carbonKg < 50) return 'excellent';
    if (carbonKg < 150) return 'good';
    if (carbonKg < 300) return 'average';
    if (carbonKg < 500) return 'poor';
    return 'very_poor';
  }

  /**
   * Calculate carbon saved compared to conventional travel
   */
  calculateCarbonSaved(ecoCarbon, conventionalCarbon) {
    const saved = conventionalCarbon - ecoCarbon;
    const percentage = ((saved / conventionalCarbon) * 100).toFixed(1);
    
    return {
      saved: Math.round(saved * 100) / 100,
      percentage: parseFloat(percentage),
      treesEquivalent: Math.round(saved / 21), // 1 tree absorbs ~21kg CO2/year
      milesNotDriven: Math.round(saved / 0.12) // Assuming car emissions
    };
  }
}

module.exports = new CarbonCalculationService();
