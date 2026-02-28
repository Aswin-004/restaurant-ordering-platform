# 🌐 VERCEL FRONTEND DEPLOYMENT GUIDE

**Restaurant Ordering Platform - Frontend Deployment to Vercel**

---

## 📋 Pre-Deployment Checklist

### Frontend Code Ready?
- ✅ All API calls use `process.env.REACT_APP_BACKEND_URL`
- ✅ No hardcoded `localhost:8000` references
- ✅ No development-only code (console.logs, debuggers)
- ✅ `.env.example` created
- ✅ `npm run build` completes successfully
- ✅ No TypeScript/JSX errors

### Backend Deployed?
- ✅ Render backend is live and working
- ✅ Backend URL available: `https://restaurant-api.onrender.com`
- ✅ CORS configured for Vercel domain

---

## 🔧 STEP 1: Prepare Frontend for Production

### 1. Update API Base URL

In your code, API calls should use:

```javascript
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Example from your Checkout.jsx
const response = await axios.post(`${API}/orders`, orderData);
```

✅ **Status:** Your code already uses this pattern

### 2. Verify No Hardcoded URLs

Search for hardcoded URLs:

```bash
# In VS Code terminal:
grep -r "localhost:8000" frontend/src/
grep -r "http://" frontend/src/
```

Should return: **No results**

✅ **Status:** Your code is clean

### 3. Remove Development Artifacts

```bash
# Search for console.logs and debuggers
grep -r "console.log" frontend/src/
grep -r "debugger" frontend/src/
```

Remove any found before deployment.

### 4. Verify Build Works

```bash
cd frontend
npm run build
```

Should complete without errors:
```
✅ Compiled successfully!
File sizes after gzip:
  ...
```

### 5. Create `.env.example`

Your `frontend/.env.example`:

```dotenv
REACT_APP_BACKEND_URL=https://your-backend.onrender.com
GENERATE_SOURCEMAP=false
```

✅ **Status:** Already created

---

## 🚀 STEP 2: Create Vercel Project

### 1. Go to Vercel Dashboard

```
https://vercel.com/dashboard
```

### 2. Click "Add New" → "Project"

Choose your GitHub repository

### 3. Configure Project

| Setting | Value |
|---------|-------|
| **Framework** | `Create React App` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `build` |
| **Node Version** | `18.x` (default) |

### 4. Add Environment Variables

Before clicking Deploy, set environment variable:

**Name:** `REACT_APP_BACKEND_URL`
**Value:** (Get from your Render deployment)
```
https://restaurant-api.onrender.com
```

**Name:** `GENERATE_SOURCEMAP`
**Value:** `false`

### 5. Deploy

- Click **"Deploy"**
- Wait for build to complete (1-2 minutes)
- Get your **Production URL**

---

## ✅ STEP 3: Verify Frontend Deployment

### 1. Wait for "Ready" Status

Vercel dashboard should show:
```
✅ Deployment Complete
```

### 2. Get Your Frontend URL

Vercel provides:
```
https://your-restaurant-app.vercel.app
```

(Your actual URL will be different)

### 3. Test Frontend

Visit your URL in browser:
```
https://your-restaurant-app.vercel.app
```

Should show:
- ✅ Restaurant homepage loads
- ✅ Menu items display
- ✅ Cart works
- ✅ Checkout form loads
- ✅ Admin panel accessible at `/admin`

### 4. Check Browser Console

Open DevTools (F12) → **Console** tab

Should show:
- ✅ No errors
- ✅ No CORS issues
- ✅ API calls connecting to backend

---

## 🔗 STEP 4: Connect Frontend to Backend

### Update Backend CORS

Since you now have your Vercel URL, update backend:

**In Render Dashboard:**
1. Go to your backend service
2. Go to **Environment** tab
3. Update `CORS_ORIGINS`:

```
CORS_ORIGINS=https://your-restaurant-app.vercel.app
```

4. Click **"Save"** (auto-redeploy)

---

## 🌍 STEP 5: Environment Variables (Complete List)

### For Vercel Dashboard

Set these in project settings:

```
REACT_APP_BACKEND_URL
https://restaurant-api.onrender.com

GENERATE_SOURCEMAP
false
```

---

## 🧪 STEP 6: Test Frontend

### Test 1: Page Load
```
✅ Home page loads completely
✅ All images load
✅ Styling looks correct (Tailwind CSS)
```

### Test 2: Menu Load
```
✅ Menu items display
✅ Prices show correctly
✅ Images load from backend
```

### Test 3: Cart Functionality
```
✅ Add items to cart
✅ Cart count updates
✅ Remove items works
✅ Cart drawer opens/closes
```

### Test 4: Checkout
```
✅ Go to checkout
✅ Form validation works
✅ All fields required
✅ Phone number validated (10 digits)
```

### Test 5: Payment (Test Mode)
```
✅ Click "Pay with Razorpay"
✅ Razorpay modal opens
✅ Use Razorpay test card: 4111 1111 1111 1111
✅ Expiry: Any future date
✅ CVV: Any 3 digits
✅ Payment processes
✅ Order success page shows
```

### Test 6: Admin Panel
```
✅ Go to /admin
✅ Login with: admin / classic@admin2026
✅ Orders tab loads
✅ Specials tab loads
✅ Can update order status
```

### Test 7: Mobile Responsive
```
✅ Use Chrome DevTools mobile mode
✅ All elements display correctly
✅ Touch-friendly buttons work
✅ No horizontal scrolling
```

### Test 8: Network Errors
```
✅ Browser offline → Shows error gracefully
✅ Backend down → Shows appropriate error
✅ No CORS errors in console
```

---

## 📊 Monitoring & Deployment

### View Deployment Status
Vercel > **Deployments** tab

### View Logs
Vercel > **Logs** → **Functions** tab (for API calls)

### Redeploy
Vercel > **Deployments** → **Redeploy** on any commit to `main` (auto-deployed)

### Environment Variables Update
Vercel > **Settings** > **Environment Variables**
- Change requires redeploy
- Click **"Redeploy"** or push new commit

---

## 🐛 Troubleshooting

### "Failed to connect to API"
- Verify `REACT_APP_BACKEND_URL` is set correctly
- Check backend is running and accessible
- Verify CORS origins include your Vercel URL
- Check Network tab in DevTools

### "Blank page loading"
- Check **Logs** in Vercel
- Verify build completed successfully
- Check for JavaScript errors in console
- Try hard refresh (Ctrl+Shift+R)

### "CORS error"
- Backend `CORS_ORIGINS` must include your Vercel URL
- Restart backend after changing CORS
- Check exact URL matches (https://... not http://...)

### "Build failed"
- Check Vercel **Logs**
- Common: Missing environment variables
- Run `npm run build` locally to test
- Check `package.json` scripts exist

### "Razorpay not loading"
- Verify Razorpay script loads (Network tab)
- Check Razorpay credentials in backend
- Test with Razorpay test credentials first
- Check console for errors

---

## 🚀 Optimization Tips

### 1. Enable Vercel Analytics
Vercel > **Settings** > **Analytics** → Enable for performance monitoring

### 2. Enable Vercel Web Vitals
Monitor page performance automatically

### 3. Set Up Auto-Deploy
Vercel > **Settings** > **Git** → Auto-deploy on push to main

### 4. Custom Domain (Optional)
Vercel > **Settings** > **Domains** → Add your domain
- Requires DNS setup (covered later)

---

## 🎯 Final Checklist

- ✅ Vercel account created
- ✅ Project deployed
- ✅ Environment variables set
- ✅ Frontend URL obtained
- ✅ Backend CORS updated with frontend URL
- ✅ Home page loads correctly
- ✅ Menu items display
- ✅ Cart works
- ✅ Checkout form works
- ✅ Admin panel accessible
- ✅ No CORS errors
- ✅ Mobile responsive

---

## 📌 Your Frontend URL

Once deployed:

```
https://your-restaurant-app.vercel.app
```

---

## 🔄 Rollback/Redeploy

### To redeploy current main branch:
Vercel > **Deployments** > Select deployment > **Redeploy**

### To rollback to previous version:
Vercel > **Deployments** > Select previous > **Promote to Production**

---

## 📱 Share Your App

Your production URLs:

**Frontend:** `https://your-restaurant-app.vercel.app`
**Backend:** `https://restaurant-api.onrender.com`
**Admin Panel:** `https://your-restaurant-app.vercel.app/admin`

---

**Next Step:** [Add Custom Domain](CUSTOM_DOMAIN_SETUP.md) (Optional)
