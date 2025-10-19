# Frontend Integration Guide

This guide shows how to replace mock data with real API calls in the frontend components.

## Environment Setup

Create `client/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Example: Updating Dashboard Page

### Before (Mock Data):

```typescript
// app/dashboard/page.tsx
const mockTrips = [
  { id: "1", title: "Tokyo Adventure", ... }
];
```

### After (Real API):

```typescript
'use client';

import { useEffect, useState } from 'react';
import { APIClient } from '@/lib/api-client';

export default function DashboardPage() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = 'your_user_id'; // Get from auth context

  useEffect(() => {
    async function fetchTrips() {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trips/user/${userId}`);
        const data = await response.json();
        setTrips(data.trips);
      } catch (error) {
        console.error('Error fetching trips:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchTrips();
  }, [userId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {trips.map(trip => (
        <TripCard key={trip._id} trip={trip} />
      ))}
    </div>
  );
}
```

## Component Updates

### 1. Trip List Component

```typescript
// components/dashboard/trip-card.tsx
'use client';

import { useEffect, useState } from 'react';

export function TripList({ userId }: { userId: string }) {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/trips/user/${userId}`)
      .then(res => res.json())
      .then(data => setTrips(data.trips));
  }, [userId]);

  return (
    <div>
      {trips.map(trip => (
        <TripCard key={trip._id} trip={trip} />
      ))}
    </div>
  );
}
```

### 2. Carbon Calculator

```typescript
// components/carbon/carbon-calculator.tsx
async function calculateCarbon(tripItems: TripItem[]) {
  const response = await fetch('http://localhost:5000/api/carbon/calculate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items: tripItems })
  });
  
  const data = await response.json();
  return data;
}
```

### 3. Badge Showcase

```typescript
// components/gamification/badge-showcase.tsx
'use client';

import { useEffect, useState } from 'react';

export function BadgeShowcase({ userId }: { userId: string }) {
  const [badges, setBadges] = useState({ earned: [], unearned: [] });

  useEffect(() => {
    fetch(`http://localhost:5000/api/badges/user/${userId}`)
      .then(res => res.json())
      .then(data => setBadges(data));
  }, [userId]);

  return (
    <div>
      <div className="earned-badges">
        {badges.earned.map(badge => (
          <BadgeCard key={badge._id} badge={badge} earned />
        ))}
      </div>
      <div className="locked-badges">
        {badges.unearned.map(badge => (
          <BadgeCard key={badge._id} badge={badge} locked />
        ))}
      </div>
    </div>
  );
}
```

### 4. Leaderboard

```typescript
// components/gamification/leaderboard.tsx
'use client';

import { useEffect, useState } from 'react';

export function Leaderboard() {
  const [data, setData] = useState([]);
  const [sortBy, setSortBy] = useState('ecoScore');

  useEffect(() => {
    fetch(`http://localhost:5000/api/leaderboard?sortBy=${sortBy}`)
      .then(res => res.json())
      .then(data => setData(data.leaderboard));
  }, [sortBy]);

  return (
    <div>
      <Tabs value={sortBy} onValueChange={setSortBy}>
        <TabsList>
          <TabsTrigger value="ecoScore">EcoScore</TabsTrigger>
          <TabsTrigger value="carbonSaved">Carbon Saved</TabsTrigger>
          <TabsTrigger value="trips">Trips</TabsTrigger>
        </TabsList>
      </Tabs>

      {data.map(user => (
        <div key={user.userId}>
          #{user.rank} {user.name} - {user.ecoScore}
        </div>
      ))}
    </div>
  );
}
```

### 5. Crisis Alert Banner

```typescript
// components/crisis/crisis-alert-banner.tsx
'use client';

import { useEffect, useState } from 'react';

export function CrisisAlertBanner() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/crisis/alerts?severity=critical,high')
      .then(res => res.json())
      .then(data => setAlerts(data.alerts));
  }, []);

  return (
    <div>
      {alerts.map(alert => (
        <Alert key={alert._id} variant={alert.severity}>
          <AlertTitle>{alert.title}</AlertTitle>
          <AlertDescription>{alert.description}</AlertDescription>
        </Alert>
      ))}
    </div>
  );
}
```

### 6. GPS Tracker

```typescript
// components/carbon/gps-tracker.tsx
async function trackLocation(tripId: string, latitude: number, longitude: number) {
  const response = await fetch(`http://localhost:5000/api/trips/${tripId}/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ latitude, longitude })
  });
  
  const data = await response.json();
  return data;
}

// In component
const handleTrack = async () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const result = await trackLocation(
        tripId,
        position.coords.latitude,
        position.coords.longitude
      );
      
      setActualCarbon(result.actualCarbon);
      setDistance(result.totalDistance);
    });
  }
};
```

### 7. Hotel Search

```typescript
// components/hotels/hotel-search.tsx
async function searchHotels(latitude: number, longitude: number, radius: number) {
  const response = await fetch('http://localhost:5000/api/hotels/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ latitude, longitude, radius, minScore: 70 })
  });
  
  const data = await response.json();
  return data.hotels;
}
```

### 8. Recommendations

```typescript
// components/recommendations/eco-recommendations.tsx
'use client';

import { useEffect, useState } from 'react';

export function EcoRecommendations({ tripId }: { tripId: string }) {
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/recommendations/${tripId}`)
      .then(res => res.json())
      .then(data => setRecommendations(data.recommendations));
  }, [tripId]);

  return (
    <div>
      {recommendations.map((rec, idx) => (
        <RecommendationCard key={idx} recommendation={rec} />
      ))}
    </div>
  );
}
```

### 9. Smart Souvenir

```typescript
// components/souvenir/smart-souvenir.tsx
async function generateSouvenir(tripId: string) {
  const response = await fetch(`http://localhost:5000/api/souvenir/generate/${tripId}`, {
    method: 'POST'
  });
  
  const data = await response.json();
  return {
    qrCode: data.qrCode,
    shareUrl: data.shareUrl,
    shareCode: data.shareCode
  };
}

// In component
const handleGenerate = async () => {
  const souvenir = await generateSouvenir(tripId);
  setQrCode(souvenir.qrCode);
  setShareUrl(souvenir.shareUrl);
};
```

### 10. Trip Creation Form

```typescript
// app/dashboard/trips/create/page.tsx
async function createTrip(tripData: any) {
  const response = await fetch('http://localhost:5000/api/trips/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tripData)
  });
  
  const data = await response.json();
  return data;
}

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const tripData = {
    userId: 'user_id_here',
    title: tripTitle,
    description: tripDescription,
    startDate: startDate,
    endDate: endDate,
    items: tripItems
  };
  
  const result = await createTrip(tripData);
  
  if (result.success) {
    router.push(`/dashboard/trips/${result.trip._id}`);
  }
};
```

## Error Handling

Always wrap API calls in try-catch blocks:

```typescript
async function fetchData() {
  try {
    const response = await fetch('http://localhost:5000/api/...');
    
    if (!response.ok) {
      throw new Error('API request failed');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
    // Show error toast/notification
    toast.error('Failed to load data');
    return null;
  }
}
```

## Loading States

```typescript
function Component() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const result = await fetchData();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!data) return <EmptyState />;

  return <div>{/* Render data */}</div>;
}
```

## Authentication (To Be Added)

Once you add authentication, update all API calls:

```typescript
const token = getAuthToken(); // From your auth context

const response = await fetch('http://localhost:5000/api/...', {
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
});
```

## Testing

Test the integration:

1. Start backend: `cd server && npm run dev`
2. Start frontend: `cd client && npm run dev`
3. Create a test user
4. Create a test trip
5. Verify data appears correctly

## Next Steps

1. Remove all mock data from components
2. Add proper error boundaries
3. Implement loading skeletons
4. Add toast notifications
5. Set up authentication
6. Configure production API URLs
