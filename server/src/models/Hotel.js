const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
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
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    }
  },
  
  // Hotel details
  stars: {
    type: Number,
    min: 1,
    max: 5
  },
  amenities: [String],
  roomTypes: [{
    name: String,
    capacity: Number,
    pricePerNight: Number,
    carbonPerNight: Number
  }],
  
  // Sustainability data
  ecoCertifications: [{
    name: String,
    issuedBy: String,
    validUntil: Date,
    verified: Boolean
  }],
  sustainabilityScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  scoreBreakdown: {
    carbonImpact: { // 40% weight
      type: Number,
      default: 50
    },
    certifications: { // 30% weight
      type: Number,
      default: 50
    },
    communitySupport: { // 20% weight
      type: Number,
      default: 50
    },
    resourceEfficiency: { // 10% weight
      type: Number,
      default: 50
    }
  },
  
  // Eco practices
  ecoPractices: {
    renewableEnergy: {
      type: Boolean,
      default: false
    },
    renewableEnergyPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    waterConservation: Boolean,
    wasteRecycling: Boolean,
    localSourcing: Boolean,
    carbonNeutral: Boolean,
    plasticFree: Boolean
  },
  
  // Carbon data
  carbonFootprintPerNight: {
    type: Number,
    default: 20 // kg CO2
  },
  
  // Community impact
  communityImpact: {
    localEmployees: Number,
    localSuppliersPercentage: Number,
    communityProjects: [String],
    charitableContributions: Number
  },
  
  // B2B data
  registeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verified: {
    type: Boolean,
    default: false
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  visibility: {
    type: String,
    enum: ['basic', 'premium', 'featured'],
    default: 'basic'
  },
  
  // Metrics
  views: {
    type: Number,
    default: 0
  },
  bookings: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviews: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: Number,
    comment: String,
    createdAt: Date
  }],
  
  // Contact info
  contact: {
    phone: String,
    email: String,
    website: String
  },
  
  images: [String],
  
  isActive: {
    type: Boolean,
    default: true
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

// Indexes
hotelSchema.index({ location: '2dsphere' });
hotelSchema.index({ sustainabilityScore: -1 });
hotelSchema.index({ 'location.address.city': 1 });
hotelSchema.index({ 'location.address.country': 1 });

// Update timestamp
hotelSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate sustainability score
hotelSchema.methods.calculateSustainabilityScore = function() {
  const breakdown = this.scoreBreakdown;
  
  // Weighted average: 40% + 30% + 20% + 10% = 100%
  const score = (
    (breakdown.carbonImpact * 0.4) +
    (breakdown.certifications * 0.3) +
    (breakdown.communitySupport * 0.2) +
    (breakdown.resourceEfficiency * 0.1)
  );
  
  this.sustainabilityScore = Math.round(score);
  return this.sustainabilityScore;
};

// Calculate individual score components
hotelSchema.methods.calculateScoreComponents = function() {
  // Carbon Impact Score (lower is better)
  const avgCarbon = 20; // Average hotel carbon per night
  const carbonScore = Math.max(0, 100 - ((this.carbonFootprintPerNight / avgCarbon) * 100));
  this.scoreBreakdown.carbonImpact = Math.min(100, Math.round(carbonScore));
  
  // Certifications Score
  const certCount = this.ecoCertifications.filter(c => c.verified).length;
  this.scoreBreakdown.certifications = Math.min(100, certCount * 25);
  
  // Community Support Score
  const communityFactors = [
    this.communityImpact.localEmployees > 0 ? 25 : 0,
    this.communityImpact.localSuppliersPercentage > 50 ? 25 : 0,
    this.communityImpact.communityProjects?.length > 0 ? 25 : 0,
    this.communityImpact.charitableContributions > 0 ? 25 : 0
  ];
  this.scoreBreakdown.communitySupport = communityFactors.reduce((a, b) => a + b, 0);
  
  // Resource Efficiency Score
  const efficiencyFactors = [
    this.ecoPractices.renewableEnergy ? 20 : 0,
    this.ecoPractices.waterConservation ? 20 : 0,
    this.ecoPractices.wasteRecycling ? 20 : 0,
    this.ecoPractices.localSourcing ? 20 : 0,
    this.ecoPractices.plasticFree ? 20 : 0
  ];
  this.scoreBreakdown.resourceEfficiency = efficiencyFactors.reduce((a, b) => a + b, 0);
  
  // Calculate overall score
  return this.calculateSustainabilityScore();
};

module.exports = mongoose.model('Hotel', hotelSchema);
