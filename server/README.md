# Travearth Backend API

Node.js + Express + MongoDB backend for the Travearth sustainable tourism platform.

## 🚀 Features

- ✅ **Trip Management** - Create, update, track trips with carbon calculations
- ✅ **Carbon Footprint** - Predicted & actual carbon tracking with real-time GPS
- ✅ **Sustainability Scoring** - 4-factor algorithm for hotels and destinations
- ✅ **Gamification** - Badge system with automated award logic
- ✅ **Crisis Monitoring** - Automated alerts from ReliefWeb API
- ✅ **Hotel B2B** - Registration, management, eco-certification
- ✅ **Smart Souvenir** - QR code generation for trip summaries
- ✅ **Recommendations** - AI-powered eco-friendly suggestions
- ✅ **Leaderboard** - Global rankings by EcoScore, carbon saved, trips

## 📦 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB Atlas
- **ODM**: Mongoose
- **Scheduling**: node-cron
- **APIs**: Carbon Interface, ReliefWeb
- **Libraries**: axios, geolib, qrcode, helmet, cors

## 🏗️ Project Structure

```
server/
├── src/
│   ├── server.js              # Express app entry point
│   ├── config/
│   │   └── database.js        # MongoDB connection
│   ├── models/
│   │   ├── User.js            # User schema with EcoScore
│   │   ├── Trip.js            # Trip schema with carbon tracking
│   │   ├── Hotel.js           # Hotel schema with sustainability
│   │   ├── Badge.js           # Badge schema with criteria
│   │   └── CrisisAlert.js     # Crisis alert schema
│   ├── controllers/
│   │   ├── tripController.js
│   │   ├── hotelController.js
│   │   ├── badgeController.js
│   │   ├── carbonController.js
│   │   ├── userController.js
│   │   ├── crisisController.js
│   │   ├── souvenirController.js
│   │   ├── recommendationController.js
│   │   └── leaderboardController.js
│   ├── routes/
│   │   ├── tripRoutes.js
│   │   ├── hotelRoutes.js
│   │   ├── badgeRoutes.js
│   │   ├── carbonRoutes.js
│   │   ├── userRoutes.js
│   │   ├── crisisRoutes.js
│   │   ├── souvenirRoutes.js
│   │   ├── recommendationRoutes.js
│   │   └── leaderboardRoutes.js
│   ├── services/
│   │   ├── carbonService.js   # Carbon calculation logic
│   │   └── cronJobs.js        # Crisis monitoring jobs
│   └── seedBadges.js          # Database seeding
├── .env.example               # Environment variables template
├── package.json
└── README.md
```

## ⚙️ Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
```env
# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/Travearth?retryWrites=true&w=majority

# Optional: Carbon Interface API for accurate flight emissions
CARBON_INTERFACE_API_KEY=your_api_key_here

# URLs
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000
```

### 3. Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP (or allow 0.0.0.0/0 for development)
5. Get your connection string and add it to `.env`

### 4. Seed Initial Data

```bash
npm run seed
```

This creates 10 badges in the database.

### 5. Start the Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

Server will run on `http://localhost:5000`

## 📡 API Endpoints

### Trips
- `POST /api/trips/create` - Create trip with carbon calculation
- `GET /api/trips/user/:userId` - Get user's trips
- `GET /api/trips/:id` - Get single trip
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip
- `POST /api/trips/:id/track` - Track GPS location
- `GET /api/trips/:id/compare` - Compare predicted vs actual carbon
- `POST /api/trips/:id/share` - Generate share code
- `GET /api/trips/shared/:shareCode` - Get shared trip
- `POST /api/trips/:id/complete` - Mark trip complete & award badges

### Carbon
- `POST /api/carbon/calculate` - Calculate carbon for items
- `GET /api/carbon/stats/:userId` - Get user carbon statistics

### Hotels (B2B)
- `POST /api/hotels/register` - Register new hotel
- `GET /api/hotels/list` - Get all hotels (filtered, sorted)
- `POST /api/hotels/search` - Search hotels near location
- `GET /api/hotels/:id` - Get single hotel
- `PUT /api/hotels/:id` - Update hotel
- `DELETE /api/hotels/:id` - Delete hotel
- `POST /api/hotels/:id/review` - Add review

### Badges & Gamification
- `GET /api/badges` - Get all badges
- `GET /api/badges/user/:userId` - Get user badges (earned + locked)
- `POST /api/badges/check/:userId` - Check and award new badges
- `POST /api/badges/create` - Create new badge (admin)

### Users
- `POST /api/users/create` - Create user
- `GET /api/users/:id` - Get user
- `PUT /api/users/:id` - Update user
- `GET /api/users/:id/eco-score` - Get/recalculate EcoScore

### Crisis Monitoring
- `GET /api/crisis/alerts` - Get active crisis alerts
- `POST /api/crisis/check-location` - Check if location affected
- `GET /api/crisis/trip/:tripId` - Get trip-specific alerts

### Smart Souvenir
- `POST /api/souvenir/generate/:tripId` - Generate QR code & data

### Recommendations
- `GET /api/recommendations/:tripId` - Get eco recommendations

### Leaderboard
- `GET /api/leaderboard?sortBy=ecoScore` - Global rankings

## 🧮 Carbon Calculation

### Emission Factors (kg CO2/km)
- **Flight**: 0.255 (short), 0.195 (medium), 0.150 (long)
- **Car**: 0.12
- **Train**: 0.041
- **Bus**: 0.089
- **Walk/Bike**: 0

### Hotel Carbon (kg CO2/night)
- **Default**: 20
- **Eco-certified**: 10 (50% reduction)
- **Luxury**: 35

### External API Integration
Uses **Carbon Interface API** for accurate flight emissions when API key provided.

## 🏆 Sustainability Score Algorithm

Hotels and destinations are scored 0-100 using:
- **40%** - Carbon Impact (lower is better)
- **30%** - Eco Certifications (verified badges)
- **20%** - Community Support (local employment, projects)
- **10%** - Resource Efficiency (renewable energy, recycling)

## 🔍 Crisis Monitoring

Automated cron job runs every 6 hours:
1. Fetches disasters from **ReliefWeb API**
2. Creates crisis alerts in database
3. Checks affected trips using geospatial queries
4. Suggests alternative eco-friendly destinations

## 🎮 Badge System

### Badge Criteria Types:
- `carbon_saved` - Total kg CO2 saved
- `trips_completed` - Number of finished trips
- `eco_score` - EcoScore threshold
- `high_score_destinations` - Visits to 80+ score places
- `crisis_adapted` - Completed crisis-affected trips

### Tiers:
Bronze → Silver → Gold → Platinum

### Rarity:
Common → Rare → Epic → Legendary

## 🛠️ Development

### Add New Route

1. Create controller in `src/controllers/`
2. Create route in `src/routes/`
3. Register route in `src/server.js`

### Add New Model

1. Create schema in `src/models/`
2. Add indexes for performance
3. Add instance methods as needed

### Testing API

Use **Postman** or **Thunder Client** (VS Code extension).

Example request:
```json
POST http://localhost:5000/api/trips/create
Content-Type: application/json

{
  "userId": "user_id_here",
  "title": "Tokyo Adventure",
  "startDate": "2025-11-01",
  "endDate": "2025-11-07",
  "items": [
    {
      "type": "destination",
      "name": "Tokyo",
      "location": {
        "coordinates": [139.6917, 35.6895]
      }
    }
  ]
}
```

## 🔒 Security

- Helmet.js for HTTP headers
- CORS configuration
- Input validation (express-validator)
- Rate limiting (recommended for production)
- Authentication (to be added)

## 📊 Database Indexes

For optimal performance:
- User: email (unique), ecoScore
- Trip: userId, status, dates, geospatial
- Hotel: geospatial, sustainabilityScore, city, country
- Badge: category, tier
- CrisisAlert: geospatial, isActive, severity, dates

## 🚀 Deployment

### Recommended Platforms:
- **Backend**: Railway, Render, AWS, Google Cloud
- **Database**: MongoDB Atlas (free tier available)

### Environment Variables for Production:
```env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
FRONTEND_URL=https://your-frontend-domain.com
```

## 📝 Next Steps

1. ✅ Connect MongoDB Atlas
2. ✅ Test all endpoints
3. ⏳ Add authentication (JWT/OAuth)
4. ⏳ Implement rate limiting
5. ⏳ Add unit tests
6. ⏳ Set up CI/CD pipeline
7. ⏳ Add Redis caching
8. ⏳ Implement WebSockets for real-time tracking

## 🐛 Troubleshooting

### MongoDB Connection Failed
- Check your MongoDB Atlas connection string
- Ensure IP whitelist includes your IP
- Verify database user credentials

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill
```

### Crisis Monitoring Not Running
- Check cron job syntax
- Verify ReliefWeb API is accessible
- Check server logs for errors

## 📄 License

MIT

## 👨‍💻 Author

Travearth Team

---

**Built with ❤️ for a sustainable future 🌍**
