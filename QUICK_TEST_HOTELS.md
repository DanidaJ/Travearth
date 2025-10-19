## 🎯 Quick Test: Hotel API & Frontend

### ✅ What's Complete
1. ✅ **24 hotels seeded** into MongoDB (2 per destination)
2. ✅ **API endpoint created**: `GET /api/hotels/search`
3. ✅ **Backend server** successfully starts on port 5000
4. ✅ **Frontend Step 2** UI ready to display hotels

---

### 🧪 Testing Instructions

#### **Step 1: Start Backend** (If not running)
```powershell
cd server
npm start
```

**Expected Output**:
```
🚀 Travearth Backend running on port 5000
📍 Environment: development
✅ Mongoose connected to MongoDB
```

#### **Step 2: Test Hotel API**

**Option A: Use Browser**
1. Open browser
2. Go to: `http://localhost:5000/api/hotels/search?city=Paris&country=France&limit=2`
3. Should see JSON array with 2 Paris hotels

**Option B: Use Postman/Insomnia**
1. GET request to: `http://localhost:5000/api/hotels/search`
2. Query params:
   - `city`: Paris
   - `country`: France
   - `limit`: 2
3. Should return 2 hotels with eco scores

**Expected Response**:
```json
[
  {
    "_id": "...",
    "name": "Green Hotel Paris",
    "description": "Experience sustainable luxury...",
    "location": {
      "city": "Paris",
      "address": "123 Green Street",
      "country": "France",
      "coordinates": [2.3522, 48.8566]
    },
    "pricePerNight": 156,
    "rating": 5,
    "sustainabilityScore": 94,
    "features": ["solar", "recycling", "organic", "water"],
    "amenities": ["Free WiFi", "Breakfast Included", "Gym", ...]
  },
  {
    "_id": "...",
    "name": "Eco Lodge Paris",
    "sustainabilityScore": 84,
    ...
  }
]
```

#### **Step 3: Test Frontend**

**Start Frontend**:
```powershell
cd client
npm run dev
```

**Test Flow**:
1. Go to: `http://localhost:3000/dashboard/trips/create`
2. **Step 1**: Select destination
   - Country: France
   - Dates: Oct 20-25
   - Click "Continue to Hotels"
3. **Step 2**: Hotels should load
   - Should see "Loading hotels..." briefly
   - Then 2 hotel cards appear:
     - Green Hotel Paris (Eco Score: ~94)
     - Eco Lodge Paris (Eco Score: ~84)
   - Click on a hotel → Green border + checkmark
   - "Hotel Selected ✓" badge appears
4. **Step 3**: Click "Continue to Activities"
5. **Step 4**: Complete flow → Carbon shows real numbers (not "N/A")

---

### 🔍 Troubleshooting

#### Hotels Don't Load
**Check 1**: Backend running?
```powershell
# In browser, visit:
http://localhost:5000/api/hotels/search?city=Paris&country=France
# Should return JSON, not error
```

**Check 2**: Console errors?
- Open browser DevTools (F12)
- Go to Console tab
- Look for fetch errors or API errors

**Check 3**: Network tab
- DevTools → Network tab
- Filter: XHR
- Should see request to `/api/hotels/search?city=Paris&country=France&limit=6`
- Check response

#### Carbon Still Shows "N/A"
**Check 1**: Backend response has carbon data
```javascript
// In browser console on Step 4:
console.log(optimizationResult);
// Should show: { summary: { totalCarbon: 2277.5, ... } }
```

**Check 2**: typeof checks working
- Check new-trip-planner.tsx lines 1272-1305
- Should have: `typeof optimizationResult.summary?.totalCarbon === 'number'`

#### Wrong Hotels Load
**Check 1**: API query params
- Open DevTools → Network
- Check request URL
- Should match destination city/country

**Check 2**: MongoDB data
```bash
cd server
node -e "require('./src/seedHotels.js')"
# Re-seed if needed
```

---

### 📊 API Endpoints Available

#### Search Hotels
```
GET /api/hotels/search

Query Params:
- city (required): "Paris"
- country (required): "France"
- limit (optional): 6 (default)
- minScore (optional): 70 (minimum eco score)

Returns: Array of hotels sorted by sustainability score
```

#### Get Hotel by ID
```
GET /api/hotels/:id

Returns: Single hotel object
```

#### Register New Hotel
```
POST /api/hotels/register

Body: Hotel object (see HOTEL_SETUP_COMPLETE.md for structure)

Returns: Created hotel
```

---

### 🎯 Success Criteria

✅ **Backend Test Passed**:
- API returns 2 hotels for Paris
- Hotels have name, location, price, eco score, features
- Response time < 1 second

✅ **Frontend Test Passed**:
- Step 1 → Step 2 transition works
- Hotels display in grid (2 visible)
- Can select hotel (green border + checkmark)
- Step 2 → Step 3 transition works
- Carbon shows numbers (not "N/A")

✅ **End-to-End Test Passed**:
- Select destination → Hotels load → Select hotel → Activities load → Carbon calculated
- All eco scores display correctly
- Hotel selection persists throughout flow

---

### 🚀 Quick Start Commands

**Terminal 1 (Backend)**:
```powershell
cd server
npm start
```

**Terminal 2 (Frontend)**:
```powershell
cd client
npm run dev
```

**Browser**:
```
http://localhost:3000/dashboard/trips/create
```

---

### 📝 Files to Check

If issues arise, check these files:

1. **Backend API**:
   - `server/src/routes/hotelRoutes.js` (line 11: search route)
   - `server/src/controllers/hotelController.js` (lines 83-145: search function)

2. **Frontend**:
   - `client/components/planning/new-trip-planner.tsx`
     - Lines 137-142: Hotel state
     - Lines 144-171: fetchHotelsForDestinations function
     - Lines 817-970: Step 2 UI
     - Lines 1272-1305: Carbon display fix

3. **Database**:
   - `server/src/seedHotels.js` (re-run if data issues)
   - MongoDB: `travel` database, `hotels` collection

---

**Status**: ✅ Ready to test
**Next Action**: Start both servers → Test in browser
**Estimated Time**: 3-5 minutes

