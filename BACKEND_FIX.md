# 🚀 QUICK START GUIDE - Fix "Failed to fetch trips" Error

## ✅ What I Just Fixed

1. **Created `.env.local`** file with API URL
2. **Added fallback API URL** in case env var is missing
3. **Better error logging** to see what's happening

---

## 🔧 How to Fix the Error

### **Step 1: Make Sure Backend is Running**

```powershell
# Open Terminal 1
cd C:\Users\"Danida Jayakody"\-01-` WORK\ECO\server
npm run dev
```

**You should see:**
```
Server running on port 5000
MongoDB connected successfully
```

**If you see errors:**
- Check MongoDB connection string in `server/.env`
- Make sure MongoDB Atlas is accessible

---

### **Step 2: Restart Frontend** (Important!)

```powershell
# Stop the current dev server (Ctrl + C)
cd C:\Users\"Danida Jayakody"\-01-` WORK\ECO\client

# Clear Next.js cache
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# Restart dev server
npm run dev
```

**Why restart?** Next.js needs to reload to pick up the new `.env.local` file

---

### **Step 3: Test the Connection**

Open browser and go to:

**Test 1: Backend Health Check**
- URL: http://localhost:5000/health
- ✅ Should see: `{"status":"healthy","timestamp":"...","uptime":123}`

**Test 2: Trips API Directly**
- URL: http://localhost:5000/api/trips
- ✅ Should see: `{"success":true,"trips":[],"count":0}`

**Test 3: Frontend Trips Page**
- URL: http://localhost:3000/dashboard/trips
- ✅ Should see: "No upcoming trips" (not an error!)

---

## 🐛 Common Errors & Solutions

### Error: "Failed to fetch trips"

**Cause:** Backend not running or wrong URL

**Solution:**
```powershell
# Check if backend is running
curl http://localhost:5000/health

# If error, start backend:
cd server
npm run dev
```

---

### Error: "CORS policy blocked"

**Cause:** Backend CORS not configured

**Solution:** Already fixed! Server allows `http://localhost:3000`

Check `server/src/server.js` line 19-22:
```javascript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
```

---

### Error: "Cannot connect to MongoDB"

**Cause:** MongoDB Atlas connection issue

**Solution:**
1. Check `server/.env` has correct `MONGODB_URI`
2. Check MongoDB Atlas allows your IP
3. Check network connection

---

### Error: "404 Not Found"

**Cause:** API route doesn't exist

**Solution:** Make sure backend has route registered

Check `server/src/server.js` line 43:
```javascript
app.use('/api/trips', require('./routes/tripRoutes'));
```

---

## 📋 Verification Checklist

Before testing frontend, verify:

- [ ] **Backend running?**
  ```powershell
  curl http://localhost:5000/health
  # Should return: {"status":"healthy",...}
  ```

- [ ] **MongoDB connected?**
  ```
  Check terminal logs for: "MongoDB connected successfully"
  ```

- [ ] **API routes working?**
  ```powershell
  curl http://localhost:5000/api/trips
  # Should return: {"success":true,"trips":[],...}
  ```

- [ ] **Frontend restarted?**
  ```
  Delete .next folder and run npm run dev again
  ```

- [ ] **Browser cache cleared?**
  ```
  Press Ctrl + Shift + R (hard refresh)
  ```

---

## 🎯 Expected Behavior

### **When Backend is Running:**

1. **Trips Page** (`/dashboard/trips`):
   - Shows "No upcoming trips" if database is empty
   - Shows real trips if you've created any
   - NO mock data (Costa Rica/Iceland removed)

2. **Create Trip Page** (`/dashboard/trips/create`):
   - Shows 3-step wizard
   - Live carbon preview updates after 1 second
   - Trip type badge auto-appears
   - "Generate EcoPlan" button saves to MongoDB

---

### **When Backend is NOT Running:**

1. **Trips Page**:
   - Shows error: "Failed to load trips. Make sure the backend is running on http://localhost:5000"
   - Check browser console for detailed error

2. **Create Trip Page**:
   - Live preview won't update
   - "Generate EcoPlan" will fail
   - Error in browser console

---

## 🔍 Debug Mode

Added console logs to help debug. Open browser console (F12) and you'll see:

```javascript
Fetching trips from: http://localhost:5000/api/trips
Trips loaded: {success: true, trips: Array(0), count: 0}
```

If you see errors, they'll show the exact issue.

---

## ✅ Files Changed

1. **`client/.env.local`** (NEW)
   - Sets `NEXT_PUBLIC_API_URL=http://localhost:5000/api`

2. **`client/app/dashboard/trips/page.tsx`**
   - Added fallback API URL
   - Better error handling
   - Console logging for debugging

3. **`client/components/planning/advanced-trip-planner.tsx`**
   - Added fallback API URL
   - Consistent with trips page

---

## 🚀 Quick Test

```powershell
# Terminal 1: Start backend
cd server
npm run dev
# Wait for "Server running on port 5000"

# Terminal 2: Start frontend
cd client
Remove-Item -Recurse -Force .next
npm run dev
# Wait for "Ready on http://localhost:3000"

# Browser: Test
# 1. http://localhost:5000/health  -> Should work
# 2. http://localhost:5000/api/trips -> Should work
# 3. http://localhost:3000/dashboard/trips -> Should work (no error)
```

---

## 🎊 Summary

**Fixed:**
- ✅ Created `.env.local` with API URL
- ✅ Added fallback URL (works even without .env)
- ✅ Better error messages
- ✅ Console logging for debugging

**Next Steps:**
1. Restart BOTH servers
2. Hard refresh browser (Ctrl + Shift + R)
3. Check browser console for logs
4. If still errors, check backend terminal logs

**The error should be gone after restart!** 🚀
