/**
 * Hotel Seed Script
 * Seeds MongoDB with 2 eco-friendly hotels for each preset destination
 * Run with: node src/seedHotels.js
 */

const mongoose = require('mongoose');
const Hotel = require('./models/Hotel');

// MongoDB connection string
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://jayakodydanida_db_user:Kp6LWVuPt1YtdAN5@travel.bitigpm.mongodb.net/";

// Preset destinations from trip planner
const DESTINATIONS = {
  "France": { capital: "Paris", lat: 48.8566, lng: 2.3522 },
  "Switzerland": { capital: "Bern", lat: 46.9480, lng: 7.4474 },
  "Italy": { capital: "Rome", lat: 41.9028, lng: 12.4964 },
  "Spain": { capital: "Madrid", lat: 40.4168, lng: -3.7038 },
  "Germany": { capital: "Berlin", lat: 52.5200, lng: 13.4050 },
  "United Kingdom": { capital: "London", lat: 51.5074, lng: -0.1278 },
  "Japan": { capital: "Tokyo", lat: 35.6762, lng: 139.6503 },
  "USA": { capital: "New York", lat: 40.7128, lng: -74.0060 },
  "Australia": { capital: "Sydney", lat: -33.8688, lng: 151.2093 },
  "Thailand": { capital: "Bangkok", lat: 13.7563, lng: 100.5018 },
  "UAE": { capital: "Dubai", lat: 25.2048, lng: 55.2708 },
  "India": { capital: "New Delhi", lat: 28.6139, lng: 77.2090 }
};

// Hotel name templates for variety
const hotelNameTemplates = [
  { prefix: "Green", suffix: "Hotel" },
  { prefix: "Eco", suffix: "Lodge" },
  { prefix: "Nature", suffix: "Resort" },
  { prefix: "Sustainable", suffix: "Inn" },
  { prefix: "Earth", suffix: "Suites" },
  { prefix: "Solar", suffix: "Hotel" },
  { prefix: "Organic", suffix: "Stay" },
  { prefix: "Bamboo", suffix: "Lodge" }
];

// Generate realistic hotel data
function generateHotelData(city, country, lat, lng, index) {
  const template = hotelNameTemplates[index % hotelNameTemplates.length];
  const hotelName = `${template.prefix} ${template.suffix} ${city}`;
  
  // Add slight variation to coordinates (within 0.05 degrees ~5km)
  const latOffset = (Math.random() - 0.5) * 0.05;
  const lngOffset = (Math.random() - 0.5) * 0.05;
  
  // Randomize sustainability score (70-95 for eco-friendly hotels)
  const sustainabilityScore = Math.floor(Math.random() * 25) + 70;
  
  // Randomize price ($80-$250 per night)
  const basePrice = Math.floor(Math.random() * 170) + 80;
  
  // Carbon footprint based on sustainability (inverse relationship)
  const carbonFootprint = Math.floor((100 - sustainabilityScore) * 0.3 + 10);
  
  const amenities = [
    "Free WiFi",
    "Breakfast Included",
    "Gym",
    "Restaurant",
    "Room Service",
    "Spa",
    "Pool",
    "Parking",
    "Business Center",
    "Concierge"
  ];
  
  // Randomly select 5-8 amenities
  const selectedAmenities = amenities
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.floor(Math.random() * 4) + 5);
  
  // Eco features based on sustainability score
  const ecoFeatures = [];
  if (sustainabilityScore >= 85) {
    ecoFeatures.push("solar", "recycling", "organic", "water");
  } else if (sustainabilityScore >= 75) {
    ecoFeatures.push("solar", "recycling", "organic");
  } else {
    ecoFeatures.push("recycling", "water");
  }
  
  return {
    name: hotelName,
    description: `Experience sustainable luxury at ${hotelName}, where eco-conscious design meets modern comfort in the heart of ${city}.`,
    location: {
      type: "Point",
      coordinates: [lng + lngOffset, lat + latOffset], // [longitude, latitude] for GeoJSON
      address: {
        city: city,
        country: country,
        street: `${Math.floor(Math.random() * 500) + 1} Green Street`,
        zipCode: `${Math.floor(Math.random() * 90000) + 10000}`
      }
    },
    stars: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
    amenities: selectedAmenities,
    roomTypes: [
      {
        name: "Standard Room",
        capacity: 2,
        pricePerNight: basePrice,
        carbonPerNight: carbonFootprint
      },
      {
        name: "Deluxe Suite",
        capacity: 4,
        pricePerNight: basePrice * 1.5,
        carbonPerNight: carbonFootprint * 1.3
      }
    ],
    ecoCertifications: [
      {
        name: "Green Key Eco-Rating",
        issuedBy: "Foundation for Environmental Education",
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        verified: true
      }
    ],
    sustainabilityScore: sustainabilityScore,
    scoreBreakdown: {
      carbonImpact: Math.min(sustainabilityScore + Math.floor(Math.random() * 10) - 5, 100),
      certifications: Math.min(sustainabilityScore + Math.floor(Math.random() * 10) - 5, 100),
      communitySupport: Math.min(sustainabilityScore + Math.floor(Math.random() * 10) - 5, 100),
      resourceEfficiency: Math.min(sustainabilityScore + Math.floor(Math.random() * 10) - 5, 100)
    },
    ecoPractices: {
      renewableEnergy: sustainabilityScore >= 75,
      renewableEnergyPercentage: sustainabilityScore >= 75 ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 40) + 20,
      waterConservation: sustainabilityScore >= 70,
      wasteRecycling: true,
      localSourcing: sustainabilityScore >= 80,
      carbonNeutral: sustainabilityScore >= 90,
      plasticFree: sustainabilityScore >= 85
    },
    carbonFootprintPerNight: carbonFootprint,
    communityImpact: {
      localEmployees: Math.floor(Math.random() * 50) + 20,
      localSuppliersPercentage: Math.floor(Math.random() * 40) + 60,
      communityProjects: [
        "Local school support",
        "Beach cleanup initiatives",
        "Wildlife conservation"
      ],
      charitableContributions: Math.floor(Math.random() * 50000) + 10000
    },
    verified: true,
    isPremium: sustainabilityScore >= 85,
    visibility: sustainabilityScore >= 85 ? "premium" : "basic",
    views: Math.floor(Math.random() * 1000),
    bookings: Math.floor(Math.random() * 200),
    rating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)), // 3.5 - 5.0
    reviews: [],
    features: ecoFeatures, // For frontend display
    pricePerNight: basePrice // For frontend display
  };
}

// Main seed function
async function seedHotels() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing hotels (optional - comment out if you want to keep existing data)
    console.log('🗑️  Clearing existing hotels...');
    await Hotel.deleteMany({});
    console.log('✅ Existing hotels cleared');

    const hotels = [];

    // Generate 2 hotels for each destination
    for (const [country, data] of Object.entries(DESTINATIONS)) {
      console.log(`📍 Generating hotels for ${data.capital}, ${country}...`);
      
      for (let i = 0; i < 2; i++) {
        const hotelData = generateHotelData(data.capital, country, data.lat, data.lng, i);
        hotels.push(hotelData);
      }
    }

    // Insert all hotels
    console.log(`💾 Inserting ${hotels.length} hotels into database...`);
    const insertedHotels = await Hotel.insertMany(hotels);
    console.log(`✅ Successfully inserted ${insertedHotels.length} hotels`);

    // Display summary
    console.log('\n📊 Summary:');
    console.log('─────────────────────────────────────');
    for (const [country, data] of Object.entries(DESTINATIONS)) {
      const cityHotels = insertedHotels.filter(h => h.location.address.city === data.capital);
      console.log(`${data.capital}, ${country}: ${cityHotels.length} hotels`);
      cityHotels.forEach(h => {
        const price = h.roomTypes && h.roomTypes[0] ? h.roomTypes[0].pricePerNight : 'N/A';
        console.log(`  • ${h.name} (${h.sustainabilityScore}/100, $${price}/night)`);
      });
    }

    console.log('\n✅ Hotel seeding complete!');
    console.log('🌐 Test API: http://localhost:5000/api/hotels/search?city=Paris&country=France');

  } catch (error) {
    console.error('❌ Error seeding hotels:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run seed
seedHotels();
