# NeoFin API Configuration - Deployment Guide

## ✅ Changes Made

### 1. **Centralized API Configuration** (`client/src/api.js`)
- Created a centralized axios instance with dynamic base URL
- Uses `import.meta.env.VITE_API_URL` environment variable
- Fallback to `http://localhost:5000/api` for local development
- Enabled `withCredentials: true` for CORS support

### 2. **Environment Files**
- **`.env`** - Local development (localhost:5000)
- **`.env.production`** - Production build (Render backend URL)
- **`.env.example`** - Template for documentation

### 3. **Updated Files**
All API calls now use the centralized `api` instance:
- ✅ `client/src/context/GlobalContext.jsx` - All transaction CRUD operations
- ✅ `client/src/components/AddTransaction.jsx` - AI parsing (text, voice, image)
- ✅ `client/src/App.jsx` - Subscription detection

### 4. **Backend CORS** (`server/index.js`)
Already configured to allow:
- `http://localhost:5173` (local dev)
- Your Vercel deployment URL
- All Vercel preview URLs via regex pattern

---

## 🚀 Deployment Instructions

### **For Vercel (Frontend)**

1. **Set Environment Variable in Vercel Dashboard:**
   - Go to your Vercel project settings
   - Navigate to **Environment Variables**
   - Add: `VITE_API_URL` = `https://neofin-backend.onrender.com/api`
   - Apply to: **Production**, **Preview**, and **Development**

2. **Redeploy:**
   ```bash
   git add .
   git commit -m "Configure dynamic API URL with environment variables"
   git push
   ```
   Vercel will auto-deploy with the new environment variable.

### **For Render (Backend)**

Your backend is already configured correctly! The CORS settings allow:
- Localhost for development
- Your Vercel deployment URL
- All Vercel preview deployments

---

## 🧪 Testing

### **Local Development:**
```bash
# In client folder
npm run dev
```
Should connect to `http://localhost:5000/api` (from `.env`)

### **Production:**
Visit: https://neofin-fvaryaiey-manan-kumars-projects-51531793.vercel.app/

The app should now:
- ✅ Load transactions from Render backend
- ✅ Add new transactions
- ✅ Use AI features (parse, subscriptions)
- ✅ No CORS errors

---

## 🔍 Verification Checklist

Open browser DevTools (F12) → Console:
1. Look for: `🌐 API URL: https://neofin-backend.onrender.com/api`
2. Check Network tab - API calls should go to Render URL
3. No CORS errors in console
4. Transactions load successfully

---

## 📝 Important Notes

1. **Environment Variables in Vite:**
   - Must start with `VITE_` prefix
   - Accessible via `import.meta.env.VITE_*`
   - Embedded at build time (not runtime)

2. **Vercel Deployment:**
   - `.env.production` is automatically used for production builds
   - Environment variables in Vercel dashboard override `.env.production`
   - Always set env vars in Vercel dashboard for security

3. **Security:**
   - `.env` is gitignored (local secrets safe)
   - `.env.production` can be committed (no secrets, just URLs)
   - Never commit API keys or sensitive data

---

## 🐛 Troubleshooting

**If data still doesn't load:**

1. **Check Vercel Environment Variables:**
   - Ensure `VITE_API_URL` is set correctly
   - Redeploy after adding env vars

2. **Check Backend Status:**
   - Visit: https://neofin-backend.onrender.com/
   - Should show: `{"message": "NeoFin Server Online 🟢"}`

3. **Check Browser Console:**
   - Look for the API URL being used
   - Check for CORS or network errors

4. **Render Free Tier:**
   - Backend may spin down after inactivity
   - First request might take 30-60 seconds to wake up

---

## 🎯 Next Steps

1. Set `VITE_API_URL` in Vercel dashboard
2. Redeploy frontend
3. Test the live app
4. Monitor for any errors

Your app should now work perfectly! 🎉
