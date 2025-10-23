# Nyumba App Deployment Guide

## 🚀 Quick Deployment Options

### Frontend Deployment (Vercel - Recommended)

1. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "New Project"
   - Import `nyumba-app` repository
   - Select the `nyumba-frontend` folder as the root directory

2. **Configure Build Settings:**
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Environment Variables:**
   ```
   VITE_GOOGLE_CLIENT_ID=your-actual-google-client-id
   VITE_API_BASE_URL=https://your-backend-url.com/api
   ```

### Backend Deployment Options

#### Option 1: Railway (Recommended)
1. Go to [railway.app](https://railway.app)
2. Connect your GitHub account
3. Deploy from `nyumba-app` repository
4. Select `nyumba-backend` as the root directory
5. Add environment variables (see below)

#### Option 2: Render
1. Go to [render.com](https://render.com)
2. Connect your GitHub account
3. Create a new Web Service
4. Select `nyumba-app` repository
5. Set root directory to `nyumba-backend`
6. Build Command: `npm install`
7. Start Command: `npm start`

#### Option 3: Heroku
1. Install Heroku CLI
2. Run: `heroku create your-app-name`
3. Set buildpack: `heroku buildpacks:set heroku/nodejs`
4. Configure environment variables
5. Deploy: `git push heroku master`

## 🔧 Required Environment Variables

### Backend (.env)
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/nyumba-app
JWT_SECRET=your-super-secret-jwt-key-here
GOOGLE_CLIENT_ID=your-google-oauth-client-id
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
PORT=5000
```

### Frontend (.env)
```
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
VITE_API_BASE_URL=https://your-backend-url.com/api
```

## 📋 Pre-Deployment Checklist

### 1. Database Setup (MongoDB Atlas)
- [ ] Create MongoDB Atlas account
- [ ] Create a new cluster
- [ ] Create database user
- [ ] Whitelist IP addresses (0.0.0.0/0 for all IPs)
- [ ] Get connection string

### 2. Google OAuth Setup
- [ ] Go to [Google Cloud Console](https://console.cloud.google.com)
- [ ] Create new project or select existing
- [ ] Enable Google+ API
- [ ] Create OAuth 2.0 credentials
- [ ] Add authorized domains (your frontend URL)

### 3. Cloudinary Setup (Image Storage)
- [ ] Create [Cloudinary](https://cloudinary.com) account
- [ ] Get Cloud Name, API Key, and API Secret from dashboard

### 4. Update API URLs
- [ ] Update `VITE_API_BASE_URL` in frontend to point to deployed backend
- [ ] Update CORS settings in backend to allow frontend domain

## 🔄 Deployment Steps

### Step 1: Deploy Backend First
1. Choose a backend hosting platform (Railway/Render/Heroku)
2. Connect your GitHub repository
3. Configure environment variables
4. Deploy and get the backend URL

### Step 2: Deploy Frontend
1. Update `VITE_API_BASE_URL` to your backend URL
2. Deploy to Vercel/Netlify
3. Update Google OAuth authorized domains with your frontend URL

### Step 3: Update CORS Settings
Update your backend CORS configuration to include your frontend domain:

```javascript
// In server.js
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'http://localhost:5174', 
    'https://your-frontend-domain.vercel.app'
  ],
  credentials: true
};
```

## 🐛 Common Issues & Solutions

### Issue: CORS Errors
**Solution:** Add your frontend domain to CORS whitelist in backend

### Issue: Environment Variables Not Loading
**Solution:** Ensure all required env vars are set in your hosting platform

### Issue: Google OAuth Not Working
**Solution:** Add your production domain to Google OAuth authorized domains

### Issue: Database Connection Failed
**Solution:** Check MongoDB Atlas IP whitelist and connection string

## 📱 Mobile App Deployment (Future)

For React Native mobile app deployment:
- **iOS:** Use Xcode and App Store Connect
- **Android:** Use Android Studio and Google Play Console

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [MongoDB Atlas Setup](https://docs.atlas.mongodb.com)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

---

**Need Help?** Check the issues section in the GitHub repository or contact the development team.