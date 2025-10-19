const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['carbon', 'distance', 'eco-choice', 'crisis', 'community', 'milestone'],
    required: true
  },
  tier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  },
  criteria: {
    type: {
      type: String,
      enum: ['carbon_saved', 'trips_completed', 'eco_score', 'high_score_destinations', 'crisis_adapted', 'custom'],
      required: true
    },
    threshold: {
      type: Number,
      required: true
    },
    unit: String
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  points: {
    type: Number,
    default: 10
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Check if user qualifies for this badge
badgeSchema.methods.checkEligibility = async function(userId) {
  const User = mongoose.model('User');
  const Trip = mongoose.model('Trip');
  
  const user = await User.findById(userId);
  if (!user) return false;
  
  switch (this.criteria.type) {
    case 'carbon_saved':
      return user.totalCarbonSaved >= this.criteria.threshold;
    
    case 'trips_completed':
      return user.totalTrips >= this.criteria.threshold;
    
    case 'eco_score':
      return user.ecoScore >= this.criteria.threshold;
    
    case 'high_score_destinations':
      const trips = await Trip.find({ 
        userId, 
        status: 'completed',
        overallSustainabilityScore: { $gte: 80 }
      });
      return trips.length >= this.criteria.threshold;
    
    case 'crisis_adapted':
      const crisisTrips = await Trip.find({
        userId,
        affectedByCrisis: true,
        status: 'completed'
      });
      return crisisTrips.length >= this.criteria.threshold;
    
    default:
      return false;
  }
};

module.exports = mongoose.model('Badge', badgeSchema);
