const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Badge = require('./models/Badge');

dotenv.config();

const badges = [
  {
    name: 'Eco Warrior',
    description: 'Save over 100kg of CO2 in total trips',
    icon: 'shield',
    category: 'carbon',
    tier: 'bronze',
    criteria: { type: 'carbon_saved', threshold: 100, unit: 'kg' },
    rarity: 'common',
    points: 50
  },
  {
    name: 'Carbon Champion',
    description: 'Save over 500kg of CO2 in total trips',
    icon: 'award',
    category: 'carbon',
    tier: 'gold',
    criteria: { type: 'carbon_saved', threshold: 500, unit: 'kg' },
    rarity: 'rare',
    points: 150
  },
  {
    name: 'Green Traveler',
    description: 'Complete 5 trips',
    icon: 'map',
    category: 'milestone',
    tier: 'bronze',
    criteria: { type: 'trips_completed', threshold: 5, unit: 'trips' },
    rarity: 'common',
    points: 30
  },
  {
    name: 'Journey Master',
    description: 'Complete 20 trips',
    icon: 'compass',
    category: 'milestone',
    tier: 'silver',
    criteria: { type: 'trips_completed', threshold: 20, unit: 'trips' },
    rarity: 'rare',
    points: 100
  },
  {
    name: 'Eco Explorer',
    description: 'Achieve an EcoScore of 70 or higher',
    icon: 'star',
    category: 'eco-choice',
    tier: 'silver',
    criteria: { type: 'eco_score', threshold: 70, unit: 'score' },
    rarity: 'common',
    points: 75
  },
  {
    name: 'Sustainability Star',
    description: 'Achieve an EcoScore of 90 or higher',
    icon: 'zap',
    category: 'eco-choice',
    tier: 'platinum',
    criteria: { type: 'eco_score', threshold: 90, unit: 'score' },
    rarity: 'legendary',
    points: 250
  },
  {
    name: 'Crisis Adapter',
    description: 'Successfully adapt and complete a crisis-affected trip',
    icon: 'alert-circle',
    category: 'crisis',
    tier: 'gold',
    criteria: { type: 'crisis_adapted', threshold: 1, unit: 'trips' },
    rarity: 'epic',
    points: 200
  },
  {
    name: 'Sustainable Chooser',
    description: 'Visit 3 destinations with 80+ sustainability scores',
    icon: 'leaf',
    category: 'eco-choice',
    tier: 'bronze',
    criteria: { type: 'high_score_destinations', threshold: 3, unit: 'destinations' },
    rarity: 'common',
    points: 40
  },
  {
    name: 'Planet Protector',
    description: 'Visit 10 destinations with 80+ sustainability scores',
    icon: 'globe',
    category: 'eco-choice',
    tier: 'gold',
    criteria: { type: 'high_score_destinations', threshold: 10, unit: 'destinations' },
    rarity: 'rare',
    points: 120
  },
  {
    name: 'First Steps',
    description: 'Complete your first eco-friendly trip',
    icon: 'footprints',
    category: 'milestone',
    tier: 'bronze',
    criteria: { type: 'trips_completed', threshold: 1, unit: 'trips' },
    rarity: 'common',
    points: 10
  }
];

async function seedBadges() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing badges
    await Badge.deleteMany({});
    console.log('🗑️  Cleared existing badges');

    // Insert new badges
    await Badge.insertMany(badges);
    console.log(`✅ Seeded ${badges.length} badges`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding badges:', error);
    process.exit(1);
  }
}

seedBadges();
