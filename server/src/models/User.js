const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  ecoScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  totalCarbonSaved: {
    type: Number,
    default: 0 // in kg
  },
  totalTrips: {
    type: Number,
    default: 0
  },
  badges: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge'
  }],
  earnedBadges: [{
    badgeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge'
    },
    earnedAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 100 // percentage
    }
  }],
  preferences: {
    notifications: {
      type: Boolean,
      default: true
    },
    darkMode: {
      type: Boolean,
      default: false
    },
    units: {
      type: String,
      enum: ['metric', 'imperial'],
      default: 'metric'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate eco score based on trips
userSchema.methods.calculateEcoScore = async function() {
  const Trip = mongoose.model('Trip');
  const trips = await Trip.find({ userId: this._id, status: 'completed' });
  
  if (trips.length === 0) {
    this.ecoScore = 0;
    return 0;
  }

  let totalScore = 0;
  trips.forEach(trip => {
    if (trip.actualCarbon && trip.predictedCarbon) {
      const savings = trip.predictedCarbon - trip.actualCarbon;
      const percentageSaved = (savings / trip.predictedCarbon) * 100;
      
      // Score: 100 if saved 50%+, scale down from there
      if (percentageSaved >= 50) totalScore += 100;
      else if (percentageSaved >= 0) totalScore += 50 + percentageSaved;
      else totalScore += Math.max(0, 50 + percentageSaved);
    }
  });

  this.ecoScore = Math.min(100, Math.round(totalScore / trips.length));
  return this.ecoScore;
};

module.exports = mongoose.model('User', userSchema);
