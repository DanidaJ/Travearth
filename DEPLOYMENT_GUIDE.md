# Travearth - Full Stack Deployment Guide

Complete guide for deploying the Travearth platform (Next.js frontend + Node.js backend + MongoDB).

## 📋 Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account
- Git repository
- Vercel account (for frontend)
- Railway/Render account (for backend)

## 🗄️ Part 1: Database Setup (MongoDB Atlas)

### Step 1: Create Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up or log in
3. Create a new project: "Travearth"
4. Click "Build a Database"
5. Choose **FREE** tier (M0 Sandbox)
6. Select region closest to your users
7. Click "Create Cluster"

### Step 2: Configure Database Access

1. Go to **Database Access** (left sidebar)
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `Travearth_admin`
5. Generate secure password (save it!)
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

### Step 3: Configure Network Access

1. Go to **Network Access** (left sidebar)
2. Click "Add IP Address"
3. For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
4. For production: Add specific IPs of your servers
5. Click "Confirm"

### Step 4: Get Connection String

1. Go to **Database** → **Connect**
2. Choose "Connect your application"
3. Driver: Node.js, Version: 5.5 or later
4. Copy the connection string:
   ```
   mongodb+srv://Travearth_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Add database name: `/Travearth` before the `?`
   ```
   mongodb+srv://Travearth_admin:yourpassword@cluster0.xxxxx.mongodb.net/Travearth?retryWrites=true&w=majority
   ```

## 🖥️ Part 2: Backend Deployment (Railway)

### Option A: Deploy to Railway

1. Go to [Railway.app](https://railway.app/)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway auto-detects Node.js

#### Configure Environment Variables

Click on your service → **Variables** tab:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://Travearth_admin:yourpassword@cluster0.xxxxx.mongodb.net/Travearth?retryWrites=true&w=majority
CARBON_INTERFACE_API_KEY=your_api_key_here
FRONTEND_URL=https://your-frontend-domain.vercel.app
BACKEND_URL=https://your-backend.railway.app
```

#### Configure Build Settings

1. Root Directory: `server`
2. Build Command: `npm install`
3. Start Command: `npm start`

#### Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Railway will provide a URL: `https://your-backend.railway.app`
4. Test health check: `https://your-backend.railway.app/health`

### Option B: Deploy to Render

1. Go to [Render.com](https://render.com/)
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your repository
5. Configure:
   - **Name**: Travearth-backend
   - **Root Directory**: server
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Add environment variables (same as above)
7. Click "Create Web Service"

## 🌐 Part 3: Frontend Deployment (Vercel)

### Step 1: Prepare Frontend

Create `client/.env.production`:

```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
```

### Step 2: Deploy to Vercel

1. Go to [Vercel.com](https://vercel.com/)
2. Sign up with GitHub
3. Click "Add New Project"
4. Import your repository
5. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: client
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

### Step 3: Environment Variables

In Vercel project settings → **Environment Variables**:

```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
```

### Step 4: Deploy

1. Click "Deploy"
2. Vercel builds and deploys automatically
3. You'll get a URL: `https://your-project.vercel.app`

### Step 5: Update Backend CORS

Update backend `.env` on Railway:

```env
FRONTEND_URL=https://your-project.vercel.app
```

Redeploy backend for changes to take effect.

## 🎯 Part 4: Seed Initial Data

### Seed Badges

SSH into your backend (Railway provides terminal access):

```bash
npm run seed
```

Or run manually:

```bash
node src/seedBadges.js
```

This creates 10 initial badges in the database.

## 🧪 Part 5: Testing

### Test Backend

```bash
curl https://your-backend.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-18T...",
  "uptime": 123.456
}
```

### Test Database Connection

Check backend logs for:
```
✅ MongoDB Connected: cluster0-shard-00-00.xxxxx.mongodb.net
```

### Test API Endpoints

```bash
# Create test user
curl -X POST https://your-backend.railway.app/api/users/create \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'

# Get badges
curl https://your-backend.railway.app/api/badges
```

### Test Frontend

1. Open `https://your-project.vercel.app`
2. Navigate to dashboard
3. Create a trip
4. Verify data saves to database

## 🔒 Part 6: Security & Production Readiness

### Backend Security

Add to `server/src/server.js`:

```javascript
const rateLimit = require('express-rate-limit');

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

Install:
```bash
npm install express-rate-limit
```

### Environment Variables Checklist

**Backend (.env)**:
- ✅ MONGODB_URI (production database)
- ✅ NODE_ENV=production
- ✅ FRONTEND_URL (Vercel URL)
- ✅ CARBON_INTERFACE_API_KEY (optional)

**Frontend (.env.production)**:
- ✅ NEXT_PUBLIC_API_URL (Railway/Render URL)

### Database Indexes

Indexes should auto-create, but verify in MongoDB Atlas:

1. Go to Collections → Indexes
2. Ensure indexes exist for:
   - Users: email (unique)
   - Trips: userId, status
   - Hotels: location (2dsphere), sustainabilityScore
   - CrisisAlerts: location (2dsphere), isActive

## 📊 Part 7: Monitoring

### MongoDB Atlas Monitoring

1. Go to **Monitoring** tab
2. Check:
   - Connection count
   - Query performance
   - Storage usage

### Backend Monitoring

Railway/Render provide:
- CPU usage
- Memory usage
- Request logs
- Error tracking

### Frontend Monitoring

Vercel provides:
- Analytics
- Real User Monitoring
- Edge Network performance

## 🔄 Part 8: CI/CD Setup

### Automatic Deployments

Both Vercel and Railway auto-deploy on git push:

1. Push to `main` branch
2. Backend deploys to Railway
3. Frontend deploys to Vercel
4. Changes live in ~2-5 minutes

### Preview Deployments

- Vercel creates preview URLs for each PR
- Railway can be configured for PR previews

## 🐛 Part 9: Troubleshooting

### Backend Won't Connect to MongoDB

**Error**: `MongoNetworkError: connection timed out`

**Fix**:
1. Check IP whitelist in MongoDB Atlas
2. Verify connection string (no typos)
3. Ensure password doesn't have special characters (URL encode if needed)

### CORS Errors

**Error**: `Access to fetch at 'https://backend...' blocked by CORS`

**Fix**:
1. Verify `FRONTEND_URL` in backend .env
2. Check `cors` configuration in `server.js`
3. Ensure frontend is using correct backend URL

### 502 Bad Gateway

**Fix**:
1. Check backend logs for crashes
2. Verify `PORT` environment variable
3. Ensure backend is listening on `0.0.0.0`, not `localhost`

### API Returns 404

**Fix**:
1. Check route is registered in `server.js`
2. Verify API base path: `/api/...`
3. Check for typos in endpoint URLs

## 📈 Part 10: Scaling

### Database Scaling

MongoDB Atlas:
- Free tier: 512MB storage
- Upgrade to M2/M5 for more capacity
- Enable auto-scaling

### Backend Scaling

Railway/Render:
- Free tier: 512MB RAM
- Upgrade for more resources
- Configure horizontal scaling (multiple instances)

### Frontend Scaling

Vercel:
- Automatically scales with traffic
- Global CDN (Edge Network)
- No configuration needed

## 💰 Cost Estimates

### Free Tier Limits

- **MongoDB Atlas**: 512MB storage (free forever)
- **Railway**: 500 hours/month compute (free trial)
- **Vercel**: 100GB bandwidth/month (free hobby)

### Paid Plans (if needed)

- **MongoDB Atlas**: $0.08/hour (~$57/month for M2)
- **Railway**: $5/month for 500 hours
- **Vercel**: $20/month (Pro plan)

**Total for small scale**: ~$0-30/month

## 🚀 Part 11: Post-Deployment

### 1. Create Admin User

```bash
curl -X POST https://your-backend.railway.app/api/users/create \
  -H "Content-Type: application/json" \
  -d '{
    "email":"admin@Travearth.com",
    "name":"Admin User"
  }'
```

### 2. Add Sample Hotels

Use the hotel registration endpoint to add test data.

### 3. Enable Crisis Monitoring

The cron job runs automatically every 6 hours. Check logs for:
```
⏰ Crisis monitoring scheduled every 6 hours
```

### 4. Set Up Analytics

Consider adding:
- Google Analytics
- Sentry for error tracking
- LogRocket for session replay

### 5. Custom Domain (Optional)

**Frontend**:
1. Go to Vercel → Project Settings → Domains
2. Add your domain (e.g., `Travearth.com`)
3. Configure DNS records

**Backend**:
1. Go to Railway → Project Settings → Networking
2. Add custom domain (e.g., `api.Travearth.com`)

## 📝 Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user configured
- [ ] Network access configured
- [ ] Backend deployed to Railway/Render
- [ ] Backend environment variables set
- [ ] Backend health check passes
- [ ] Badges seeded to database
- [ ] Frontend deployed to Vercel
- [ ] Frontend environment variables set
- [ ] CORS configured correctly
- [ ] API integration tested
- [ ] Crisis monitoring active
- [ ] Custom domains configured (optional)
- [ ] Monitoring set up
- [ ] Error tracking enabled

## 🎉 Success!

Your Travearth platform is now live!

- **Frontend**: https://your-project.vercel.app
- **Backend**: https://your-backend.railway.app
- **Health Check**: https://your-backend.railway.app/health

## 📞 Support

For issues:
1. Check backend logs in Railway/Render
2. Check MongoDB Atlas logs
3. Review Vercel deployment logs
4. Test API endpoints with curl/Postman

---

**Happy Deploying! 🌍♻️**
