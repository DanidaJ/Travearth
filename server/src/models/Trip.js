const mongoose = require('mongoose');

const tripItemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['destination', 'hotel', 'activity', 'transport'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: String
  },
  date: Date,
  duration: Number, // in days or hours
  carbonFootprint: {
    type: Number,
    default: 0
  },
  sustainabilityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  details: {
    transport: {
      mode: {
        type: String,
        enum: ['flight', 'car', 'train', 'bus', 'walk', 'bike']
      },
      distance: Number // in km
    },
    hotel: {
      stars: Number,
      ecoCertified: Boolean,
      certifications: [String]
    },
    activity: {
      category: String,
      participants: Number
    }
  }
});

const tripSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Trip type classification
  tripType: {
    type: String,
    enum: ['local', 'domestic', 'international'],
    default: 'local'
  },
  // Number of travelers
  travelers: {
    type: Number,
    default: 1,
    min: 1
  },
  // Eco-benchmark data
  ecoBenchmark: {
    excellentThreshold: Number,
    goodThreshold: Number,
    averageThreshold: Number,
    poorThreshold: Number,
    perDayBenchmarks: {
      excellent: Number,
      good: Number,
      average: Number,
      poor: Number
    }
  },
  // Benchmark rating
  benchmarkRating: {
    rating: {
      type: String,
      enum: ['excellent', 'good', 'average', 'poor', 'critical']
    },
    level: {
      type: Number,
      min: 1,
      max: 5
    },
    color: String,
    message: String,
    badge: String
  },
  userId_old: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Made optional for demo/guest users
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['planning', 'confirmed', 'active', 'completed', 'cancelled'],
    default: 'planning',
    index: true
  },
  items: [tripItemSchema],
  
  // Carbon footprint data
  predictedCarbon: {
    type: Number,
    default: 0 // in kg CO2
  },
  actualCarbon: {
    type: Number,
    default: 0
  },
  carbonBreakdown: {
    flights: { type: Number, default: 0 },
    hotels: { type: Number, default: 0 },
    transport: { type: Number, default: 0 },
    activities: { type: Number, default: 0 }
  },
  
  // GPS tracking
  trackingData: [{
    timestamp: Date,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: [Number] // [longitude, latitude]
    },
    distance: Number, // cumulative distance in km
    carbonEmitted: Number // cumulative carbon in kg
  }],
  
  // Sustainability metrics
  overallSustainabilityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  
  // Badges earned during this trip
  badgesEarned: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge'
  }],
  
  // Sharing
  shareCode: {
    type: String,
    unique: true,
    sparse: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  
  // Crisis handling
  affectedByCrisis: {
    type: Boolean,
    default: false
  },
  crisisAlerts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CrisisAlert'
  }],
  
  // Additional metadata for trip planner
  metadata: {
    destinations: [mongoose.Schema.Types.Mixed],
    activities: [mongoose.Schema.Types.Mixed],
    hotels: [mongoose.Schema.Types.Mixed],
    itinerary: [mongoose.Schema.Types.Mixed]
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

// Indexes for performance
tripSchema.index({ 'items.location': '2dsphere' });
tripSchema.index({ 'trackingData.location': '2dsphere' });
tripSchema.index({ startDate: 1, endDate: 1 });

// Update timestamp before saving
tripSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate predicted carbon footprint
tripSchema.methods.calculatePredictedCarbon = function() {
  let total = 0;
  const breakdown = {
    flights: 0,
    hotels: 0,
    transport: 0,
    activities: 0
  };

  this.items.forEach(item => {
    if (item.carbonFootprint) {
      total += item.carbonFootprint;
      
      // Categorize
      if (item.type === 'destination' || (item.type === 'transport' && item.details.transport?.mode === 'flight')) {
        breakdown.flights += item.carbonFootprint;
      } else if (item.type === 'hotel') {
        breakdown.hotels += item.carbonFootprint;
      } else if (item.type === 'transport') {
        breakdown.transport += item.carbonFootprint;
      } else if (item.type === 'activity') {
        breakdown.activities += item.carbonFootprint;
      }
    }
  });

  this.predictedCarbon = total;
  this.carbonBreakdown = breakdown;
  return total;
};

// Calculate overall sustainability score
tripSchema.methods.calculateSustainabilityScore = function() {
  if (this.items.length === 0) {
    this.overallSustainabilityScore = 50;
    return 50;
  }

  const totalScore = this.items.reduce((sum, item) => sum + (item.sustainabilityScore || 50), 0);
  this.overallSustainabilityScore = Math.round(totalScore / this.items.length);
  return this.overallSustainabilityScore;
};

// Generate unique share code
tripSchema.methods.generateShareCode = function() {
  if (!this.shareCode) {
    this.shareCode = `trip-${this._id.toString().slice(-8)}-${Date.now().toString(36)}`;
  }
  return this.shareCode;
};

module.exports = mongoose.model('Trip', tripSchema);
