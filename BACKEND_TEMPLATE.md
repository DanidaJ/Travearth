# 🔧 Backend Quick Start Template

## Node.js + Express + Firebase Setup

### 1. Initialize Backend

```powershell
cd "c:\Users\Danida Jayakody\-01- WORK\ECO\server"
npm init -y
```

### 2. Install Dependencies

```powershell
npm install express cors dotenv firebase firebase-admin
npm install --save-dev typescript @types/express @types/node @types/cors ts-node nodemon
```

### 3. Create `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### 4. Update `package.json` Scripts

```json
{
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

### 5. Create `.env`

```env
PORT=3001
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
CARBON_INTERFACE_API_KEY=your-api-key
CORS_ORIGIN=http://localhost:3000
```

### 6. Project Structure

```
server/
├── src/
│   ├── index.ts                 # Entry point
│   ├── config/
│   │   └── firebase.ts          # Firebase config
│   ├── routes/
│   │   ├── trips.ts             # Trip routes
│   │   ├── carbon.ts            # Carbon routes
│   │   ├── users.ts             # User routes
│   │   ├── badges.ts            # Badge routes
│   │   ├── alerts.ts            # Alert routes
│   │   └── recommendations.ts   # Recommendation routes
│   ├── controllers/
│   │   ├── tripController.ts
│   │   ├── carbonController.ts
│   │   ├── userController.ts
│   │   └── ...
│   ├── services/
│   │   ├── carbonCalculator.ts  # Carbon calculations
│   │   ├── gamification.ts      # Badge/score logic
│   │   ├── recommendations.ts   # Eco tips engine
│   │   └── crisisMonitor.ts     # Alert system
│   ├── models/
│   │   └── types.ts             # TypeScript types
│   └── middleware/
│       ├── auth.ts              # Authentication
│       └── errorHandler.ts      # Error handling
├── .env
├── package.json
└── tsconfig.json
```

## 📝 Sample Implementation

### `src/index.ts`

```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import tripRoutes from './routes/trips';
import carbonRoutes from './routes/carbon';
import userRoutes from './routes/users';
import badgeRoutes from './routes/badges';
import alertRoutes from './routes/alerts';
import recommendationRoutes from './routes/recommendations';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());

// Routes
app.use('/api/trips', tripRoutes);
app.use('/api/carbon', carbonRoutes);
app.use('/api/users', userRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/recommendations', recommendationRoutes);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
```

### `src/config/firebase.ts`

```typescript
import admin from 'firebase-admin';

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
});

export const db = admin.firestore();
export default admin;
```

### `src/routes/trips.ts`

```typescript
import express from 'express';
import {
  createTrip,
  getTrip,
  updateTrip,
  deleteTrip,
  getUserTrips,
} from '../controllers/tripController';

const router = express.Router();

router.post('/', createTrip);
router.get('/:id', getTrip);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);
router.get('/user/:userId', getUserTrips);

export default router;
```

### `src/controllers/tripController.ts`

```typescript
import { Request, Response } from 'express';
import { db } from '../config/firebase';

export const createTrip = async (req: Request, res: Response) => {
  try {
    const tripData = req.body;
    const tripRef = await db.collection('trips').add({
      ...tripData,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({
      id: tripRef.id,
      ...tripData,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create trip' });
  }
};

export const getTrip = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tripDoc = await db.collection('trips').doc(id).get();

    if (!tripDoc.exists) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.json({ id: tripDoc.id, ...tripDoc.data() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trip' });
  }
};

export const updateTrip = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.collection('trips').doc(id).update(req.body);
    res.json({ message: 'Trip updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update trip' });
  }
};

export const deleteTrip = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.collection('trips').doc(id).delete();
    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete trip' });
  }
};

export const getUserTrips = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const tripsSnapshot = await db
      .collection('trips')
      .where('userId', '==', userId)
      .get();

    const trips = tripsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
};
```

### `src/services/carbonCalculator.ts`

```typescript
interface CarbonComponents {
  flights: number;
  accommodation: number;
  activities: number;
  transportation: number;
}

export class CarbonCalculator {
  // Carbon emissions in kg CO2
  private static readonly EMISSIONS = {
    flight: {
      economy: 0.15, // per km
      business: 0.3,
      first: 0.45,
    },
    hotel: {
      standard: 15, // per night
      ecoFriendly: 8,
      luxury: 25,
    },
    car: {
      petrol: 0.2, // per km
      electric: 0.05,
      hybrid: 0.12,
    },
    activity: {
      low: 5, // per activity
      medium: 15,
      high: 30,
    },
  };

  static calculateFlightCarbon(
    distance: number,
    flightClass: 'economy' | 'business' | 'first' = 'economy'
  ): number {
    return distance * this.EMISSIONS.flight[flightClass];
  }

  static calculateHotelCarbon(
    nights: number,
    type: 'standard' | 'ecoFriendly' | 'luxury' = 'standard'
  ): number {
    return nights * this.EMISSIONS.hotel[type];
  }

  static calculateTransportCarbon(
    distance: number,
    vehicleType: 'petrol' | 'electric' | 'hybrid' = 'petrol'
  ): number {
    return distance * this.EMISSIONS.car[vehicleType];
  }

  static calculateActivityCarbon(
    intensity: 'low' | 'medium' | 'high' = 'medium'
  ): number {
    return this.EMISSIONS.activity[intensity];
  }

  static calculateTotalCarbon(components: CarbonComponents): number {
    return (
      components.flights +
      components.accommodation +
      components.activities +
      components.transportation
    );
  }

  static getEcoBenchmark(days: number, destinations: number): number {
    // Base: 50 kg per day, adjusted for destinations
    return days * 50 * (1 + destinations * 0.2);
  }
}
```

### `src/services/gamification.ts`

```typescript
import { db } from '../config/firebase';

interface Badge {
  id: string;
  name: string;
  criteria: {
    type: string;
    value: number;
  };
}

export class GamificationService {
  static async checkAndAwardBadges(userId: string, tripData: any) {
    const badges = await this.getAvailableBadges();
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const earnedBadges = userData?.badges || [];

    const newBadges: string[] = [];

    for (const badge of badges) {
      if (earnedBadges.includes(badge.id)) continue;

      const earned = await this.checkBadgeCriteria(userId, badge, tripData);
      if (earned) {
        newBadges.push(badge.id);
      }
    }

    if (newBadges.length > 0) {
      await db
        .collection('users')
        .doc(userId)
        .update({
          badges: [...earnedBadges, ...newBadges],
        });
    }

    return newBadges;
  }

  static async updateEcoScore(userId: string, points: number) {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    const currentScore = userDoc.data()?.ecoScore || 0;

    await userRef.update({
      ecoScore: currentScore + points,
    });

    // Update leaderboard
    await this.updateLeaderboard(userId);
  }

  static async updateLeaderboard(userId: string) {
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();

    await db.collection('leaderboard').doc(userId).set({
      userId,
      ecoScore: userData?.ecoScore || 0,
      carbonSaved: userData?.totalCarbonSaved || 0,
      tripsCompleted: userData?.trips?.length || 0,
      updatedAt: new Date().toISOString(),
    });

    // Recalculate ranks
    await this.recalculateRanks();
  }

  private static async recalculateRanks() {
    const snapshot = await db
      .collection('leaderboard')
      .orderBy('ecoScore', 'desc')
      .get();

    const batch = db.batch();
    snapshot.docs.forEach((doc, index) => {
      batch.update(doc.ref, { rank: index + 1 });
    });

    await batch.commit();
  }

  private static async getAvailableBadges(): Promise<Badge[]> {
    const snapshot = await db.collection('badges').get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Badge));
  }

  private static async checkBadgeCriteria(
    userId: string,
    badge: Badge,
    tripData: any
  ): Promise<boolean> {
    // Implement badge criteria checking logic
    // Example: Check if carbon saved exceeds threshold
    switch (badge.criteria.type) {
      case 'carbon_saved':
        return tripData.carbonSaved >= badge.criteria.value;
      case 'trips_completed':
        const userDoc = await db.collection('users').doc(userId).get();
        return (userDoc.data()?.trips?.length || 0) >= badge.criteria.value;
      default:
        return false;
    }
  }
}
```

## 🚀 Run the Backend

```powershell
# Development mode
npm run dev

# Production build
npm run build
npm start
```

## 🧪 Test API Endpoints

Use Postman or curl:

```bash
# Create a trip
curl -X POST http://localhost:3001/api/trips \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Costa Rica Adventure",
    "userId": "user123",
    "startDate": "2025-03-15",
    "endDate": "2025-03-22"
  }'

# Get trip
curl http://localhost:3001/api/trips/TRIP_ID
```

## 🔗 Connect Frontend

Update `client/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## 📚 Next Steps

1. Implement all remaining routes
2. Add authentication middleware
3. Connect external APIs (Carbon Interface, etc.)
4. Add input validation
5. Implement rate limiting
6. Add logging
7. Write tests
8. Deploy to cloud

---

This template provides a solid foundation. Customize based on your specific needs!
