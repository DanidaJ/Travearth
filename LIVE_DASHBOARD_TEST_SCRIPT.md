# 🧪 Quick Test Script - Live Dashboard

## ✅ Pre-Test Checklist

- [ ] Backend running on `http://localhost:5000`
- [ ] Frontend running on `http://localhost:3000`
- [ ] Trip exists in database (ID: `68f4017f36d60482fa39656b`)

---

## 🎯 Test Procedure

### Test 1: Start Trip Button
**URL:** `http://localhost:3000/dashboard/trips/68f4017f36d60482fa39656b`

**Expected:**
- [ ] Page loads without errors
- [ ] Hero image displays (Picsum photo)
- [ ] Green "Start Trip - Go Live" button visible
- [ ] Button has Play icon (▶️)
- [ ] Button is first in actions row

**Pass Criteria:** Button is prominent and clickable

---

### Test 2: Navigation
**Action:** Click "Start Trip - Go Live" button

**Expected:**
- [ ] Navigates to `/dashboard/trips/68f4017f36d60482fa39656b/live`
- [ ] Page loads in < 2 seconds
- [ ] No console errors
- [ ] "Trip Active" badge shows in top right

**Pass Criteria:** Clean navigation with no errors

---

### Test 3: Tab 1 - Real-Time Tracking

#### 3A. Initial State
**Expected:**
- [ ] "Real-Time Tracking" tab is active by default
- [ ] Real-Time Tracker card displays
- [ ] "Start Tracking" button visible
- [ ] Quick Stats grid shows 3 cards
- [ ] Daily Carbon Budget card displays
- [ ] Transport Mode Breakdown shows

**Pass Criteria:** All components render correctly

#### 3B. GPS Tracking
**Action:** Click "Start Tracking"

**Expected:**
- [ ] Browser asks for location permission
- [ ] After allowing: GPS coordinates appear
- [ ] Button changes to "Stop Tracking" (red)
- [ ] Current Emissions counter starts (animated)
- [ ] Progress bar updates

**Pass Criteria:** GPS tracking works, carbon increments

#### 3C. Data Display
**Expected Values:**
- [ ] Total Emissions: `89 kg CO₂` (from trip data)
- [ ] Eco Actions: `12 Completed`
- [ ] Distance Traveled: `24.5 km`
- [ ] Daily Target: `65 kg CO₂`

**Pass Criteria:** Statistics display correctly

#### 3D. Transport Breakdown
**Expected:**
- [ ] Walking/Cycling: 45% (green bar)
- [ ] Public Transport: 35% (blue bar)
- [ ] Taxi/Ride Share: 20% (yellow bar)
- [ ] Progress bars visually accurate

**Pass Criteria:** Charts display proportionally

---

### Test 4: Tab 2 - Eco Tips

#### 4A. Navigation
**Action:** Click "Eco Tips" tab

**Expected:**
- [ ] Tab switches smoothly
- [ ] Content loads instantly (no API call)
- [ ] 9 eco tips display
- [ ] Lightbulb icon in header

**Pass Criteria:** Tab switch is instant

#### 4B. Tip Structure
**Check each tip has:**
- [ ] Icon (appropriate to category)
- [ ] Title (includes destination name)
- [ ] Description text
- [ ] Impact badge (High/Medium/Low)
- [ ] Category badge (Transport/Waste/etc.)

**Example Tip:**
```
🚇 Use Public Transport in New Delhi
[High Impact] [Transport]
Public transportation reduces carbon emissions by 45%...
```

**Pass Criteria:** All 9 tips complete with proper styling

#### 4C. Categories Present
- [ ] Transport (2 tips)
- [ ] Waste (2 tips)
- [ ] Energy (1 tip)
- [ ] Food (2 tips)
- [ ] Water (1 tip)
- [ ] Shopping (1 tip)

**Pass Criteria:** All 6 categories represented

#### 4D. Your Impact Card
**Expected:**
- [ ] CO₂ Saved: `23 kg`
- [ ] Water Saved: `45 L`
- [ ] Plastic Avoided: `8`
- [ ] Gradient background (green to blue)

**Pass Criteria:** Impact metrics display in card

---

### Test 5: Tab 3 - Crowd & Alternatives

#### 5A. Navigation
**Action:** Click "Crowd & Alternatives" tab

**Expected:**
- [ ] Tab switches smoothly
- [ ] POI cards load instantly
- [ ] Users icon in header
- [ ] 3 POI cards display

**Pass Criteria:** Tab content renders

#### 5B. POI #1 - Main Tourist Attraction
**Expected:**
- [ ] Name: "Main Tourist Attraction"
- [ ] Crowd badge: "Very Crowded" (red)
- [ ] Eco Score: `45`
- [ ] Crowd Level: `85%` (red progress bar)
- [ ] Eco Balance Meter: "Poor" (red background)
- [ ] Warning message displays
- [ ] 3 alternatives show:
  - Local Park (2.3 km)
  - Cultural Center (2.8 km)
  - Historic Garden (3.3 km)
- [ ] Orange alert box at bottom

**Pass Criteria:** Crowded POI shows all warnings + alternatives

#### 5C. POI #2 - Shopping District
**Expected:**
- [ ] Name: "Shopping District"
- [ ] Crowd badge: "Crowded" (yellow)
- [ ] Eco Score: `60`
- [ ] Crowd Level: `72%` (yellow progress bar)
- [ ] Eco Balance Meter: "Moderate" (yellow)
- [ ] 2 alternatives show:
  - Local Market (1.5 km)
  - Artisan Quarter (2.0 km)
- [ ] Orange alert box (72% > 70%)

**Pass Criteria:** Moderate crowd shows warning

#### 5D. POI #3 - Beach/Waterfront
**Expected:**
- [ ] Name: "Beach/Waterfront"
- [ ] Crowd badge: "Moderate" (green)
- [ ] Eco Score: `85`
- [ ] Crowd Level: `45%` (green progress bar)
- [ ] Eco Balance Meter: "Excellent" (green)
- [ ] NO alternatives section (not crowded)
- [ ] NO alert box
- [ ] Green success message

**Pass Criteria:** Low crowd POI shows no warnings

#### 5E. Best Times Card
**Expected:**
- [ ] 3 time slots display:
  - Early Morning (6-9 AM) - Low Crowd
  - Afternoon (2-4 PM) - Moderate
  - Late Afternoon (5-7 PM) - Low Crowd
- [ ] Gradient background
- [ ] Clock icon in header

**Pass Criteria:** Time recommendations display

---

### Test 6: Responsive Design

#### 6A. Desktop (1920x1080)
**Expected:**
- [ ] 3-column grids display
- [ ] Cards side-by-side
- [ ] Full tab width
- [ ] Proper spacing

#### 6B. Tablet (768px)
**Expected:**
- [ ] 2-column grids
- [ ] Cards wrap appropriately
- [ ] Tabs full width
- [ ] Touch-friendly buttons

#### 6C. Mobile (375px)
**Action:** Resize browser to mobile width

**Expected:**
- [ ] Single column layout
- [ ] All cards stack vertically
- [ ] Tabs remain accessible
- [ ] Text remains readable
- [ ] No horizontal scroll

**Pass Criteria:** Fully responsive on all devices

---

### Test 7: Performance

#### 7A. Page Load
**Expected:**
- [ ] Live dashboard loads in < 2 seconds
- [ ] No flash of unstyled content
- [ ] Smooth transitions
- [ ] No layout shifts

#### 7B. Tab Switching
**Expected:**
- [ ] Instant tab switches (< 100ms)
- [ ] No re-render flicker
- [ ] Content preserved when switching back

#### 7C. Console
**Check Developer Console:**
- [ ] No errors
- [ ] No warnings
- [ ] Trip data logs correctly

**Pass Criteria:** No console errors, fast loading

---

### Test 8: Data Integration

#### 8A. Trip Data
**Verify from trip object:**
- [ ] Title: "India"
- [ ] Destination: "New Delhi"
- [ ] Country: "India"
- [ ] Predicted Carbon: `89 kg CO₂`
- [ ] Date range displays

**Pass Criteria:** All trip data populates correctly

#### 8B. Eco Tips
**Verify destination in tips:**
- [ ] "Use Public Transport in **New Delhi**"
- [ ] "Try local **Indian** cuisine"
- [ ] Other tips reference location

**Pass Criteria:** Tips are destination-specific

---

### Test 9: Back Navigation

#### 9A. Back to Trip Details
**Action:** Click "Back to Trip Details"

**Expected:**
- [ ] Returns to `/dashboard/trips/68f4017f36d60482fa39656b`
- [ ] Trip details page loads
- [ ] "Start Trip" button still visible

**Pass Criteria:** Navigation works both ways

#### 9B. Back to Trips List
**From trip details, click "Back to Trips"**

**Expected:**
- [ ] Returns to `/dashboard/trips`
- [ ] Trip still shows in Planning tab

**Pass Criteria:** Full navigation flow works

---

## 🎯 Test Results

### Summary
- **Total Tests**: 9 categories, ~80 check items
- **Pass Rate**: ___/80 ✅
- **Failures**: ___ ❌
- **Time Taken**: ___ minutes

### Critical Issues (Must Fix)
1. 
2. 
3. 

### Minor Issues (Nice to Have)
1. 
2. 
3. 

### Excellent (Working Great)
1. 
2. 
3. 

---

## 🐛 Bug Report Template

**Issue:**
**Steps to Reproduce:**
1. 
2. 
3. 

**Expected:**
**Actual:**
**Screenshot:**
**Browser:**
**Console Errors:**

---

## ✅ Sign-Off

**Tested By:** _________________
**Date:** _________________
**Browser:** _________________
**OS:** _________________

**Overall Status:**
- [ ] ✅ All tests passed - Ready for production
- [ ] ⚠️ Minor issues - Deploy with notes
- [ ] ❌ Critical failures - Needs fixes

---

## 📸 Screenshot Checklist

Take screenshots of:
1. [ ] Trip details page with Start button
2. [ ] Live dashboard - Tab 1 (tracking active)
3. [ ] Live dashboard - Tab 2 (eco tips)
4. [ ] Live dashboard - Tab 3 (crowd data)
5. [ ] Mobile view (all tabs)
6. [ ] Console (no errors)

---

**Happy Testing! 🧪✨**
