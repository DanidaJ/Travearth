# 🗺️ MAP-BASED TRIP PLANNER - QUICK START GUIDE

## 🚀 HOW TO USE

### 1. Start the Application

```bash
# Terminal 1: Backend
cd server
npm start

# Terminal 2: Frontend
cd client
npm run dev
```

Navigate to: **http://localhost:3000/dashboard/trips/create**

---

## 📍 STEP 1: SELECT DESTINATIONS (5 minutes)

### What You'll See:
- ✅ **Your Starting Point**: Colombo, Sri Lanka (hardcoded)
- ✅ **Destination Selector**: Dropdown with 12 countries
- ✅ **Date Pickers**: Going and return dates
- ✅ **Trip Summary**: Real-time distance, days, trip type

### Example Workflow:
```
1. Click destination dropdown → Select "France"
2. Click "Add" → Paris appears in list
3. (Optional) Add more destinations: Switzerland, Italy
4. Click "Going Date" → Select October 20, 2025
5. Click "Return Date" → Select October 25, 2025
6. See trip summary update:
   - 1 Destination
   - 8,500 km
   - 5 Days
   - INTERNATIONAL badge (purple)
7. Click "Continue to Activities"
```

### Visual Indicators:
- 🟢 **Green Badge** = Local (<200km)
- 🔵 **Blue Badge** = Domestic (200-2000km)
- 🟣 **Purple Badge** = International (>2000km)

---

## 🎯 STEP 2: PLAN ACTIVITIES (10 minutes per day)

### What You'll See:
- ✅ **Day Tabs**: One tab for each day of your trip
- ✅ **Add Activity Form**: Name, location, time, type
- ✅ **Activities List**: All activities for the current day
- ✅ **Interactive Map**: Shows hotel + activities with route
- ✅ **Carbon Counter**: Real-time CO₂ calculation

### Example Workflow for Day 1:
```
1. Click "Day 1" tab
2. Fill in activity form:
   - Name: "Visit Eiffel Tower"
   - Location: "Champ de Mars, Paris"
   - Time: 09:00
   - Type: Sightseeing 👁️
3. Click "Add Activity"
4. Activity appears in list showing:
   - Distance from hotel
   - Carbon footprint (0.1 kg CO₂)
5. Map updates with blue marker for Eiffel Tower
6. Add more activities (Louvre, Arc de Triomphe)
7. See route polyline connecting all locations
8. Total day carbon shown: "0.5 kg CO₂"
```

### Activity Types & Carbon Impact:
```
👁️  Sightseeing  → 0.1 kg CO₂   (walking tours, monuments)
🍽️  Dining       → 2.5 kg CO₂   (restaurant meals)
🏔️  Adventure    → 5.0 kg CO₂   (skiing, rafting, extreme sports)
🎭  Cultural     → 0.2 kg CO₂   (museums, theaters, galleries)
🌿  Nature       → 0.05 kg CO₂  (hiking, parks, nature walks)
```

### Map Legend:
- 🟠 **Orange Marker** = Hotel (your accommodation)
- 🔵 **Blue Markers** = Activities (numbered 1, 2, 3...)
- 🔵 **Blue Line** = Your daily route

### Tips:
- Plan activities in geographic order to minimize distance
- Mix activity types for diverse experiences
- Check carbon footprint before adding high-impact activities
- Use time slots to avoid over-scheduling

---

## 🎨 VISUAL TOUR

### Step 1 Screen:
```
┌─────────────────────────────────────────────────────┐
│  🌟 Plan Your Trip                                  │
│  Create a sustainable travel itinerary              │
├─────────────────────────────────────────────────────┤
│  Progress: ① ━━ ② ━━ ③ ━━ ④ ━━ ⑤                   │
│           ▲ Select Destinations                      │
├─────────────────────────────────────────────────────┤
│  📍 Your Starting Point                             │
│  ┌─────────────────────────────────────────────┐   │
│  │ 🏠 Colombo, Sri Lanka                        │   │
│  │ ✈️  Bandaranaike International Airport (CMB) │   │
│  └─────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│  Select Destinations                                 │
│  ┌──────────────────────────┐ [+ Add]              │
│  │ Select a country... ▼     │                      │
│  └──────────────────────────┘                       │
│                                                      │
│  📍 Destinations Added:                             │
│  ┌─────────────────────────────────────────────┐   │
│  │ ① France                              [×]    │   │
│  │   Paris - Charles de Gaulle (CDG)           │   │
│  └─────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│  Travel Dates                                        │
│  Going Date        Return Date                      │
│  📅 Oct 20, 2025   📅 Oct 25, 2025                  │
├─────────────────────────────────────────────────────┤
│  🎯 Trip Summary              🟣 INTERNATIONAL      │
│  ┌────────────┬──────────────┬──────────────┐     │
│  │    1       │   8,500 km   │    5         │     │
│  │ Destination│ Total Dist.  │   Days       │     │
│  └────────────┴──────────────┴──────────────┘     │
├─────────────────────────────────────────────────────┤
│                          [Continue to Activities →] │
└─────────────────────────────────────────────────────┘
```

### Step 2 Screen:
```
┌─────────────────────────────────────────────────────┐
│  🗺️ Your Trip: France                               │
│  Oct 20, 2025 - Oct 25, 2025 (5 days)              │
├─────────────────────────────────────────────────────┤
│  Plan Your Daily Activities                          │
│  ┌─────┬─────┬─────┬─────┬─────┐                  │
│  │Day 1│Day 2│Day 3│Day 4│Day 5│                   │
│  │  3  │     │     │     │     │  (badge = count)  │
│  └──▲──┴─────┴─────┴─────┴─────┘                  │
│     │ Selected                                      │
├─────────────────────────────────────────────────────┤
│  ➕ Add Activity                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │ Activity Name: Visit Eiffel Tower            │  │
│  │ Location: Champ de Mars, Paris               │  │
│  │ Time: 09:00    Type: Sightseeing 👁️         │  │
│  │                   [+ Add Activity]            │  │
│  └──────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────┤
│  Activities (3)                     0.5 kg CO₂      │
│  ┌──────────────────────────────────────────────┐  │
│  │ ① Visit Eiffel Tower                   [🗑️]  │  │
│  │   📍 Champ de Mars  🕐 09:00                 │  │
│  │   2.1 km • 0.1 kg CO₂                        │  │
│  ├──────────────────────────────────────────────┤  │
│  │ ② Louvre Museum                        [🗑️]  │  │
│  │   📍 Rue de Rivoli  🕐 14:00                 │  │
│  │   3.5 km • 0.2 kg CO₂                        │  │
│  ├──────────────────────────────────────────────┤  │
│  │ ③ Arc de Triomphe                      [🗑️]  │  │
│  │   📍 Place Charles de Gaulle  🕐 18:00       │  │
│  │   2.8 km • 0.2 kg CO₂                        │  │
│  └──────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────┤
│  🗺️ Day 1 Route Map                                │
│  ┌──────────────────────────────────────────────┐  │
│  │          🗺️ INTERACTIVE MAP                  │  │
│  │                                               │  │
│  │    🟠 Hotel                                   │  │
│  │     │                                         │  │
│  │     └─── 🔵 ① Eiffel Tower                   │  │
│  │           │                                   │  │
│  │           └─── 🔵 ② Louvre                   │  │
│  │                 │                             │  │
│  │                 └─── 🔵 ③ Arc de Triomphe    │  │
│  │                                               │  │
│  │  (Click markers for details)                 │  │
│  └──────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────┤
│  [← Back to Destinations]  [Continue to Optimize →]│
└─────────────────────────────────────────────────────┘
```

---

## 🎯 TESTING CHECKLIST

### Test Scenario 1: Basic Trip
- [ ] Select 1 destination
- [ ] Pick dates (5 days)
- [ ] See correct distance calculation
- [ ] See trip type badge (LOCAL/DOMESTIC/INTERNATIONAL)
- [ ] Add 3 activities on Day 1
- [ ] See activities in list
- [ ] See markers on map
- [ ] See route polyline
- [ ] Check carbon footprint updates

### Test Scenario 2: Multi-Destination
- [ ] Add France, then Switzerland
- [ ] See cumulative distance
- [ ] Plan activities for Day 1 (France)
- [ ] Switch to Day 3, plan activities
- [ ] Map should update for each day

### Test Scenario 3: Activity Types
- [ ] Add Sightseeing → Check 0.1 kg CO₂
- [ ] Add Dining → Check 2.5 kg CO₂
- [ ] Add Adventure → Check 5.0 kg CO₂
- [ ] Total carbon should sum correctly

### Test Scenario 4: Remove & Edit
- [ ] Add 5 activities
- [ ] Remove middle activity
- [ ] Map should update immediately
- [ ] Activity numbers should re-sequence

---

## 🐛 TROUBLESHOOTING

### Map Not Showing?
```bash
# Check if libraries installed
cd client
npm list react-leaflet leaflet geolib

# Should show:
# react-leaflet@5.0.0
# leaflet@1.9.4
# geolib@3.3.4

# If missing, reinstall:
npm install react-leaflet leaflet geolib --force
```

### Activities Not Adding?
- Check: Activity name filled in?
- Check: Location filled in?
- Check: Browser console for errors (F12)
- Check: Network tab for API calls

### Distance Shows 0 km?
- Ensure destinations have lat/lng coordinates
- Check geolib is installed: `npm list geolib`
- Check browser console for errors

### Map Markers Not Appearing?
- Wait 2-3 seconds for map to load
- Check zoom level (should be 12)
- Check if coordinates are valid
- Look for CDN errors in console

---

## 💡 PRO TIPS

### Planning Efficiently:
1. **Start with major attractions** → Add Eiffel Tower, Louvre first
2. **Group nearby activities** → Plan geographically to reduce distance
3. **Mix activity types** → Balance carbon impact (sightseeing + dining)
4. **Use realistic times** → Don't overbook a single day
5. **Check the map** → Visualize if route makes sense

### Minimizing Carbon:
- Choose **Nature** and **Sightseeing** activities (low CO₂)
- Limit **Adventure** and **Dining** (high CO₂)
- Plan activities close together (reduces transport distance)
- Walk between nearby activities (0 kg CO₂ transport)

### Best Practices:
- Plan 3-5 activities per day (realistic schedule)
- Leave buffer time between activities
- Check distances on map before adding
- Review total day carbon before moving to next day

---

## 📊 EXPECTED RESULTS

### Typical 5-Day Trip to France:
```
Total Distance: ~8,500 km (Colombo → Paris → Colombo)
Trip Type: INTERNATIONAL
Activities per day: 3-4
Total activities: 15-20
Total carbon: 30-50 kg CO₂ (from activities)
Map markers: 15-20 blue pins + 1 orange hotel per day
Route lines: Blue polylines connecting all activities
```

### Carbon Breakdown Example:
```
Day 1: 5.2 kg CO₂
  - Sightseeing: 0.1 kg
  - Dining (Lunch): 2.5 kg
  - Cultural: 0.2 kg
  - Dining (Dinner): 2.5 kg

Day 2: 3.8 kg CO₂
  - Nature: 0.05 kg
  - Sightseeing: 0.1 kg
  - Dining: 2.5 kg
  - Sightseeing: 0.1 kg

...and so on
```

---

## 🚀 WHAT'S WORKING RIGHT NOW

✅ **Step 1**: Destination selection with real-time distance  
✅ **Step 2**: Activity planning with interactive maps  
✅ Real-time carbon calculation  
✅ Distance calculation between activities  
✅ Map visualization with custom markers  
✅ Day-by-day organization  
✅ Activity type classification  
✅ Remove/edit activities  
✅ Trip summary dashboard  

⏳ **Step 3**: AI Optimization (Coming Next)  
⏳ **Step 4**: Drag-drop customization (Coming Next)  
⏳ **Step 5**: Save & world map view (Coming Next)  

---

## 🎉 YOU'RE READY!

Your map-based trip planner is fully functional for Steps 1 & 2. Start planning your eco-friendly trip now!

**Access**: http://localhost:3000/dashboard/trips/create
