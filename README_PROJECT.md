# 🌍 EcoTravel - Sustainable Travel Planning Platform

> Plan eco-friendly trips, track carbon footprint in real-time, and earn rewards for sustainable choices.

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

## ✨ Features

### 🎯 Core Features
- **Smart Trip Planning** - AI-powered destination recommendations with carbon impact predictions
- **Real-Time Carbon Tracking** - GPS-based footprint monitoring during trips
- **Flight Search Integration** - Amadeus API for real flight data with carbon calculations
- **Interactive Maps** - Geocoding with OpenCage API and distance calculations
- **Hotel Partner Dashboard** - B2B features for eco-certified accommodations
- **Gamification** - Dynamic badges (Eco Legend, Eco Warrior, Green Traveler, Beginner)
- **Share & Download** - PDF/HTML trip summaries with QR codes
- **Live Dashboard** - Real-time eco tips and crowd data

### 📊 Tracking & Analytics
- Predicted vs actual carbon footprint comparison
- Eco score percentage calculations
- Transport mode breakdown
- Daily carbon budget monitoring
- Destination-specific sustainability metrics

### 🎨 UI/UX
- Dark mode with consistent theming
- Responsive design (mobile, tablet, desktop)
- shadcn/ui component library
- Smooth animations and transitions
- Accessibility features

## 🏗️ Architecture

```
ECO/
├── client/                 # Next.js 15 Frontend
│   ├── app/               # App Router pages
│   │   ├── dashboard/    # User dashboard
│   │   ├── explore/      # Eco destinations
│   │   ├── hotels/       # Hotel features
│   │   └── shared/       # Trip sharing
│   ├── components/        # React components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── planning/     # Trip planner
│   │   ├── carbon/       # Carbon tracker
│   │   ├── maps/         # Map components
│   │   └── souvenir/     # QR souvenir
│   └── lib/              # Utilities & API client
│
└── server/                # Node.js + Express Backend
    ├── src/
    │   ├── controllers/  # Route handlers
    │   ├── models/       # MongoDB schemas
    │   ├── routes/       # API routes
    │   ├── services/     # Business logic (Amadeus, etc.)
    │   └── middleware/   # Auth, validation
    └── server.js         # Entry point
```

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 15.2.4 (App Router)
- **Language**: TypeScript
- **UI Library**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **Maps**: Leaflet.js
- **PDF Generation**: jsPDF
- **Date Handling**: date-fns
- **Geolocation**: geolib

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **APIs**: 
  - Amadeus (Flight data)
  - OpenCage (Geocoding)
- **Authentication**: JWT (planned)

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB 7.0+
- npm or yarn

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd ECO
```

### 2. Install Dependencies

**Client:**
```bash
cd client
npm install
```

**Server:**
```bash
cd server
npm install
```

### 3. Environment Variables

**Client** (`client/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_OPENCAGE_API_KEY=your_opencage_key
```

**Server** (`server/.env`):
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ecotravel
JWT_SECRET=your_jwt_secret
OPENCAGE_API_KEY=your_opencage_key
AMADEUS_API_KEY=your_amadeus_key
AMADEUS_API_SECRET=your_amadeus_secret
FRONTEND_URL=http://localhost:3000
```

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

Access the app at: `http://localhost:3000`

## 🎮 Usage

### Creating a Trip
1. Navigate to Dashboard
2. Click "New Trip" or use trip planner
3. Add destinations (autocomplete enabled)
4. Select dates and activities
5. View predicted carbon footprint
6. Save trip

### Live Trip Tracking
1. Go to trip details
2. Click "Start Live Tracking"
3. Enable GPS permissions
4. Monitor real-time carbon emissions
5. Get eco-friendly tips
6. Complete trip to see summary

### Viewing Shared Trips
1. Scan QR code from trip summary
2. Or visit: `/shared/[SHARECODE]`
3. View trip details and carbon impact
4. Get inspired to create your own

## 🔌 API Endpoints

### Trips
- `GET /api/trips` - List user trips
- `POST /api/trips` - Create new trip
- `GET /api/trips/:id` - Get trip details
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip
- `GET /api/trips/shared/:shareCode` - Get shared trip
- `POST /api/trips/:id/share` - Generate share code

### Flights (Amadeus Integration)
- `POST /api/flights/search` - Search flights
- `POST /api/flights/multi-city` - Multi-destination search
- `GET /api/flights/airports?keyword=` - Airport lookup
- `GET /api/flights/airline/:code` - Airline info

### Hotels
- `POST /api/hotels/register` - Register hotel partner
- `GET /api/hotels/dashboard` - Get dashboard data

## 🎯 Key Features Explained

### Carbon Tracking Algorithm
```typescript
// Predicted carbon based on:
- Flight emissions: 0.115 kg CO₂/km (economy), 2.6x for business
- Transport mode: Public transport, taxi, walking
- Accommodation: Hotel type and eco-certifications
- Activities: Carbon intensity ratings

// Real-time tracking:
- GPS location updates
- Distance calculations
- Mode of transport detection
- Continuous carbon accumulation
```

### Eco Score Calculation
```typescript
ecoScore = ((predictedCarbon - actualCarbon) / predictedCarbon) × 100

Badges:
- ≥50%: Eco Legend (Level 5) 🌟
- ≥30%: Eco Warrior (Level 4) ⭐  
- ≥15%: Green Traveler (Level 3) ⭐
- <15%: Eco Beginner (Level 1) ⚪
```

## 📱 PWA Features (Planned)
- Offline mode
- Install prompt
- Push notifications
- Background sync

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 Documentation

Comprehensive documentation available in markdown files:
- `QUICKSTART.md` - Quick setup guide
- `DEPLOYMENT_GUIDE.md` - Production deployment
- `AMADEUS_INTEGRATION.md` - Flight API setup
- `CARBON_TRACKING_FIX.md` - Real-time tracking details
- `SHARED_TRIP_REAL_DATA.md` - Share functionality

## 🐛 Known Issues & Fixes

See individual documentation files for fixes:
- `BUG_FIXES_GEOCODING.md`
- `PERFORMANCE_FIXES.md`
- `SYNTAX_FIXES.md`

## 🔮 Roadmap

- [ ] User authentication (JWT)
- [ ] Social features (follow travelers)
- [ ] Leaderboards
- [ ] More API integrations (hotels, activities)
- [ ] Mobile app (React Native)
- [ ] AI trip recommendations
- [ ] Carbon offset purchases
- [ ] Community challenges

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 👥 Team

Built with 💚 for sustainable travel

## 🙏 Acknowledgments

- Amadeus API for flight data
- OpenCage for geocoding
- shadcn/ui for beautiful components
- Next.js team for amazing framework

---

**Made with ❤️ and ♻️ for a sustainable planet** 🌍
