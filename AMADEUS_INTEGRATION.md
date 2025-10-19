# 🛫 Amadeus Flight API Integration - Quick Start

## ✅ Setup Complete

The Amadeus API has been successfully integrated into your ECO Travel Planner application!

### What's Included

1. **Backend Service** (`server/src/services/amadeusService.js`)
   - Flight search (single and multi-city)
   - Airport search
   - Airline information
   - Real-time carbon emissions data

2. **API Routes** (`server/src/routes/flights.js`)
   - `POST /api/flights/search` - Search flights
   - `POST /api/flights/multi-city` - Multi-city trip search
   - `GET /api/flights/airports?keyword=london` - Search airports
   - `GET /api/flights/airline/:code` - Get airline info

3. **Frontend Hook** (`client/hooks/use-flights.ts`)
   - Ready-to-use React hook for flight operations
   - TypeScript interfaces included
   - Error handling built-in

4. **API Client** (`client/lib/api-client.ts`)
   - Updated with flight API methods
   - Type-safe requests

---

## 🔑 API Credentials

Your Amadeus credentials are already configured in the service:

```
API Key: fdA0UhXU3rB7zWQjLvHbbGnD7LZVkybE
API Secret: aoGx5dk1IdfgrkVn
```

**⚠️ Security Note**: For production, move these to environment variables:
- Create `server/.env` file
- Add: `AMADEUS_API_KEY=your_key` and `AMADEUS_API_SECRET=your_secret`
- The service will automatically use env vars if available

---

## 📖 Usage Examples

### 1. Search Flights (Single Route)

```typescript
import { useFlights } from '@/hooks/use-flights'

function MyComponent() {
  const { searchFlights, loading, error, flightOffers } = useFlights()

  const handleSearch = async () => {
    const offers = await searchFlights({
      origin: 'CMB',          // Colombo
      destination: 'BKK',     // Bangkok
      departureDate: '2025-11-15',
      adults: 2,
      travelClass: 'ECONOMY'
    })
    
    console.log(offers)
  }

  return (
    <div>
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Searching...' : 'Search Flights'}
      </button>
      
      {error && <div>Error: {error}</div>}
      
      {flightOffers.map(offer => (
        <div key={offer.id}>
          <div>{offer.airline} {offer.flight.number}</div>
          <div>${offer.price.total} {offer.price.currency}</div>
          <div>Carbon: {offer.carbon.weight} {offer.carbon.unit}</div>
        </div>
      ))}
    </div>
  )
}
```

### 2. Multi-City Search

```typescript
const { searchMultiCity } = useFlights()

const searchMultipleDestinations = async () => {
  const routes = [
    { origin: 'CMB', destination: 'BKK', date: '2025-11-15' },
    { origin: 'BKK', destination: 'SIN', date: '2025-11-20' },
    { origin: 'SIN', destination: 'CMB', date: '2025-11-25' }
  ]

  const results = await searchMultiCity(routes, 2, 'ECONOMY')
  
  results.forEach(routeResult => {
    console.log(`Route: ${routeResult.route.from} → ${routeResult.route.to}`)
    console.log(`Offers: ${routeResult.offers.length}`)
  })
}
```

### 3. Search Airports

```typescript
const { searchAirports } = useFlights()

const findAirports = async (cityName: string) => {
  const airports = await searchAirports(cityName)
  
  airports.forEach(airport => {
    console.log(`${airport.name} (${airport.code})`)
    console.log(`${airport.city}, ${airport.country}`)
  })
}

// Usage
findAirports('London') // Returns LHR, LGW, STN, etc.
```

### 4. Get Airline Info

```typescript
const { getAirlineInfo } = useFlights()

const airlineDetails = await getAirlineInfo('SQ') // Singapore Airlines
console.log(airlineDetails)
```

---

## 🎯 Integration with Trip Planner

To integrate with your existing `new-trip-planner.tsx`:

```typescript
// Add to imports
import { useFlights } from '@/hooks/use-flights'

// Inside component
const { searchFlights, loading, flightOffers } = useFlights()

// When user selects dates in Step 2
useEffect(() => {
  if (departureDate && destinations.length > 0) {
    loadFlightOffers()
  }
}, [departureDate, destinations])

const loadFlightOffers = async () => {
  // Search for first leg
  const firstLeg = await searchFlights({
    origin: CURRENT_LOCATION.airport.code,
    destination: destinations[0].airport.code,
    departureDate: format(departureDate, 'yyyy-MM-dd'),
    adults: 1,
    travelClass: selectedClass
  })
  
  // Display real prices and carbon data
  setRealFlightData(firstLeg)
}
```

---

## 📊 Response Structure

### Flight Offer Object

```typescript
{
  id: "1",
  price: {
    total: 245.80,
    currency: "USD"
  },
  airline: "TG",  // Thai Airways
  flight: {
    number: "308",
    departure: {
      airport: "CMB",
      time: "2025-11-15T10:00:00"
    },
    arrival: {
      airport: "BKK",
      time: "2025-11-15T14:30:00"
    },
    duration: "PT4H30M",  // ISO 8601 duration
    cabin: "ECONOMY"
  },
  carbon: {
    weight: 180,  // Real carbon emissions
    unit: "KG"
  },
  numberOfStops: 0,  // Direct flight
  validatingAirline: "TG"
}
```

---

## 🚀 Testing the API

### 1. Start the Server

```bash
cd server
npm run dev
```

### 2. Test with cURL

```bash
# Search flights
curl -X POST http://localhost:5000/api/flights/search \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "CMB",
    "destination": "BKK",
    "departureDate": "2025-11-15",
    "adults": 1,
    "travelClass": "ECONOMY"
  }'

# Search airports
curl http://localhost:5000/api/flights/airports?keyword=bangkok
```

### 3. Test from Frontend

Navigate to: http://localhost:3000/dashboard/trips/create
- The flight section in Step 2 can now be connected to real data

---

## 🎨 Next Steps

### Update Trip Planner UI

1. **Replace Mock Data with Real API Calls**
   ```typescript
   // Instead of calculated mock data
   const mockCarbon = distance * 0.115
   
   // Use Amadeus data
   const realOffer = flightOffers[0]
   const realCarbon = realOffer.carbon.weight
   const realPrice = realOffer.price.total
   ```

2. **Add Date Picker**
   - Users select actual departure dates
   - Pass dates to Amadeus API

3. **Show Multiple Offers**
   - Display 3-5 flight options per route
   - Let users compare prices and carbon
   - Add filters (stops, airlines, time)

4. **Add "Select Flight" Button**
   - Save selected offer ID to trip data
   - Store price and carbon in database

5. **Show Real Airlines**
   - Fetch airline logos
   - Display airline ratings
   - Show baggage allowance

### Additional Features

- [ ] **Return Flight Search**: Separate API call for return journey
- [ ] **Price Alerts**: Monitor price changes
- [ ] **Seat Selection**: Integrate seat maps
- [ ] **Booking Integration**: Link to airline booking pages
- [ ] **Calendar View**: Show prices across multiple dates
- [ ] **Alternative Airports**: Suggest nearby airports with better prices

---

## 📝 Rate Limits

Amadeus Test API Limits:
- **Free Tier**: 10,000 API calls/month
- **Rate**: ~4 requests/second
- **Data**: Test data (not real-time production data)

For production:
- Upgrade to Production API
- Get real-time prices and availability
- Access to booking APIs

---

## 🐛 Troubleshooting

### API Returns Empty Results

- Check date format (must be YYYY-MM-DD)
- Date must be in the future
- Airport codes must be valid IATA codes (3 letters)
- Some routes may not have direct flights

### "Invalid Credentials" Error

- Verify API key and secret are correct
- Check if credentials are expired
- Ensure no extra spaces in env variables

### CORS Errors

- Server includes CORS headers
- Check `server/src/server.js` CORS configuration
- Frontend URL must match allowed origin

---

## 📚 API Documentation

- **Amadeus Docs**: https://developers.amadeus.com/self-service/category/flights
- **Flight Offers Search**: https://developers.amadeus.com/self-service/category/flights/api-doc/flight-offers-search
- **Airport Search**: https://developers.amadeus.com/self-service/category/flights/api-doc/airport-and-city-search

---

## 💡 Pro Tips

1. **Cache Results**: Store flight searches to reduce API calls
2. **Background Refresh**: Update prices every 30 minutes
3. **Fallback Data**: Keep mock calculations as fallback
4. **Error Handling**: Show mock data if API fails
5. **Loading States**: Always show loading indicators
6. **Date Validation**: Check dates are valid before API call

---

## ✅ Current Status

- [x] Amadeus SDK installed (client & server)
- [x] Service layer created
- [x] API routes configured
- [x] Controller with validation
- [x] Frontend hook created
- [x] API client updated
- [x] TypeScript types defined
- [ ] UI integration (Step 2 of trip planner)
- [ ] Real-time price display
- [ ] Flight selection persistence

---

**Ready to use! 🎉** 

Start by testing the API with the examples above, then integrate into your Step 2 flight section for real pricing and carbon data.
