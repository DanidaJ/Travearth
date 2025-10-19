const cron = require('node-cron');
const axios = require('axios');
const CrisisAlert = require('../models/CrisisAlert');
const Trip = require('../models/Trip');

class CronJobs {
  /**
   * Start crisis monitoring job
   * Runs every 6 hours to fetch new crisis alerts
   */
  startCrisisMonitoring() {
    const interval = process.env.CRISIS_CHECK_INTERVAL_HOURS || 6;
    
    // Run every X hours: 0 */6 * * *
    cron.schedule(`0 */${interval} * * *`, async () => {
      console.log('🔍 Running crisis monitoring check...');
      
      try {
        await this.fetchReliefWebAlerts();
        await this.deactivateExpiredAlerts();
        await this.checkAffectedTrips();
        
        console.log('✅ Crisis monitoring completed');
      } catch (error) {
        console.error('❌ Crisis monitoring error:', error);
      }
    });

    console.log(`⏰ Crisis monitoring scheduled every ${interval} hours`);
  }

  /**
   * Fetch alerts from ReliefWeb API
   */
  async fetchReliefWebAlerts() {
    try {
      const response = await axios.get('https://api.reliefweb.int/v1/disasters', {
        params: {
          appname: 'Travearth',
          limit: 20,
          filter: {
            field: 'status',
            value: 'current'
          }
        }
      });

      const disasters = response.data?.data || [];
      
      for (const disaster of disasters) {
        const existingAlert = await CrisisAlert.findOne({
          title: disaster.fields.name,
          source: 'ReliefWeb'
        });

        if (!existingAlert) {
          // Create new alert
          const country = disaster.fields.country?.[0];
          const coordinates = await this.getCoordinatesForCountry(country?.name);

          await CrisisAlert.create({
            title: disaster.fields.name,
            description: disaster.fields.description || disaster.fields.name,
            type: this.mapDisasterType(disaster.fields.type?.[0]?.name),
            severity: this.calculateSeverity(disaster),
            location: {
              coordinates: coordinates,
              country: country?.name,
              region: country?.name
            },
            startDate: new Date(disaster.fields.date?.created),
            isActive: true,
            source: 'ReliefWeb',
            sourceUrl: disaster.fields.url,
            metadata: {
              casualties: disaster.fields.stats?.killed || 0,
              displaced: disaster.fields.stats?.displaced || 0
            }
          });

          console.log(`📢 New crisis alert created: ${disaster.fields.name}`);
        }
      }
    } catch (error) {
      console.error('Error fetching ReliefWeb alerts:', error.message);
    }
  }

  /**
   * Map ReliefWeb disaster types to our types
   */
  mapDisasterType(reliefWebType) {
    const typeMap = {
      'Earthquake': 'natural_disaster',
      'Flood': 'natural_disaster',
      'Cyclone': 'natural_disaster',
      'Drought': 'natural_disaster',
      'Epidemic': 'health',
      'Fire': 'environmental',
      'Volcano': 'natural_disaster',
      'Complex Emergency': 'political'
    };

    return typeMap[reliefWebType] || 'other';
  }

  /**
   * Calculate severity based on disaster data
   */
  calculateSeverity(disaster) {
    const casualties = disaster.fields.stats?.killed || 0;
    const displaced = disaster.fields.stats?.displaced || 0;

    if (casualties > 1000 || displaced > 100000) return 'critical';
    if (casualties > 100 || displaced > 10000) return 'high';
    if (casualties > 10 || displaced > 1000) return 'medium';
    return 'low';
  }

  /**
   * Get coordinates for a country (simplified)
   */
  async getCoordinatesForCountry(countryName) {
    // Country capital coordinates (sample data)
    const countryCoords = {
      'Afghanistan': [69.2075, 34.5553],
      'Nepal': [85.3240, 27.7172],
      'Haiti': [-72.2852, 18.5944],
      'Philippines': [121.0244, 14.5995],
      'Indonesia': [106.8650, -6.2088],
      'Japan': [139.6917, 35.6895],
      'United States': [-77.0369, 38.9072],
      'Mexico': [-99.1332, 19.4326],
      'Brazil': [-47.8825, -15.7942],
      'India': [77.2090, 28.6139]
    };

    return countryCoords[countryName] || [0, 0];
  }

  /**
   * Deactivate expired crisis alerts
   */
  async deactivateExpiredAlerts() {
    try {
      const result = await CrisisAlert.updateMany(
        {
          isActive: true,
          endDate: { $lte: new Date() }
        },
        {
          $set: { isActive: false }
        }
      );

      if (result.modifiedCount > 0) {
        console.log(`🔴 Deactivated ${result.modifiedCount} expired alerts`);
      }
    } catch (error) {
      console.error('Error deactivating alerts:', error);
    }
  }

  /**
   * Check for trips affected by crisis alerts
   */
  async checkAffectedTrips() {
    try {
      const activeAlerts = await CrisisAlert.find({ isActive: true });
      const activeTrips = await Trip.find({ 
        status: { $in: ['planning', 'active'] }
      });

      for (const trip of activeTrips) {
        let isAffected = false;
        const affectedAlerts = [];

        for (const alert of activeAlerts) {
          // Check if any trip location is within crisis radius
          for (const item of trip.items) {
            if (item.location?.coordinates) {
              if (alert.affectsLocation(item.location.coordinates)) {
                isAffected = true;
                affectedAlerts.push(alert._id);
                
                // Add alternative suggestions
                if (!alert.alternatives || alert.alternatives.length === 0) {
                  // This could be enhanced with real alternative suggestions
                  alert.alternatives = await this.generateAlternatives(item.location);
                  await alert.save();
                }
              }
            }
          }
        }

        if (isAffected && !trip.affectedByCrisis) {
          trip.affectedByCrisis = true;
          trip.crisisAlerts = affectedAlerts;
          await trip.save();
          
          console.log(`⚠️  Trip ${trip._id} affected by crisis`);
        }
      }
    } catch (error) {
      console.error('Error checking affected trips:', error);
    }
  }

  /**
   * Generate alternative suggestions for affected locations
   */
  async generateAlternatives(location) {
    // This is a simplified version - in production, you'd query nearby safe destinations
    return [
      {
        type: 'destination',
        name: 'Local eco-tourism site',
        description: 'Explore nearby sustainable destinations',
        location: {
          coordinates: [location.coordinates[0] + 1, location.coordinates[1] + 1]
        },
        sustainabilityScore: 85
      }
    ];
  }
}

module.exports = new CronJobs();
