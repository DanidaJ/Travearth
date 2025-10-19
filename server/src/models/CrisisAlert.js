const mongoose = require('mongoose');

const crisisAlertSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['natural_disaster', 'political', 'health', 'environmental', 'other'],
    required: true
  },
  severity: {
    type: String,
    enum: ['critical', 'high', 'medium', 'low'],
    required: true,
    index: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: [Number], // [longitude, latitude]
    country: String,
    region: String,
    city: String
  },
  affectedRadius: {
    type: Number, // in km
    default: 50
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  source: {
    type: String,
    default: 'ReliefWeb'
  },
  sourceUrl: String,
  
  // Alternative suggestions
  alternatives: [{
    type: {
      type: String,
      enum: ['destination', 'activity', 'route']
    },
    name: String,
    description: String,
    location: {
      type: {
        type: String,
        enum: ['Point']
      },
      coordinates: [Number]
    },
    sustainabilityScore: Number
  }],
  
  // Affected trips tracking
  affectedTrips: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip'
  }],
  
  metadata: {
    casualties: Number,
    displaced: Number,
    economicImpact: Number
  },
  
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
crisisAlertSchema.index({ location: '2dsphere' });
crisisAlertSchema.index({ startDate: 1, endDate: 1 });
crisisAlertSchema.index({ isActive: 1, severity: 1 });

// Update timestamp
crisisAlertSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Check if a location is affected by this crisis
crisisAlertSchema.methods.affectsLocation = function(coordinates) {
  if (!this.location || !this.location.coordinates) return false;
  
  const geolib = require('geolib');
  const distance = geolib.getDistance(
    { latitude: this.location.coordinates[1], longitude: this.location.coordinates[0] },
    { latitude: coordinates[1], longitude: coordinates[0] }
  );
  
  return distance <= (this.affectedRadius * 1000); // Convert km to meters
};

// Auto-deactivate expired alerts
crisisAlertSchema.methods.checkExpiry = function() {
  if (this.endDate && new Date() > this.endDate) {
    this.isActive = false;
    return true;
  }
  return false;
};

module.exports = mongoose.model('CrisisAlert', crisisAlertSchema);
