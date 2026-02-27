# 🚀 PRODUCTION DEPLOYMENT GUIDE

## Complete Guide to Deploy Restaurant Ordering System

---

## 📋 Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Step 1: MongoDB Atlas Setup](#step-1-mongodb-atlas-setup)
3. [Step 2: Razorpay Configuration](#step-2-razorpay-configuration)
4. [Step 3: Backend Deployment (Render)](#step-3-backend-deployment-render)
5. [Step 4: Frontend Deployment (Vercel)](#step-4-frontend-deployment-vercel)
6. [Step 5: Custom Domain Setup](#step-5-custom-domain-setup)
7. [Step 6: Security Hardening](#step-6-security-hardening)
8. [Step 7: Testing Production](#step-7-testing-production)
9. [Step 8: Backup & Monitoring](#step-8-backup--monitoring)
10. [Troubleshooting](#troubleshooting)

---

## ✅ Pre-Deployment Checklist

### Backend Requirements
- [ ] All hardcoded credentials removed
- [ ] Environment variables configured
- [ ] `.env.example` created
- [ ] `requirements.txt` cleaned (no dev dependencies)
- [ ] CORS properly configured
- [ ] Database connection string updated to MongoDB Atlas
- [ ] Razorpay credentials set
- [ ] Admin password changed from default

### Frontend Requirements
- [ ] API URL uses environment variables
- [ ] No localhost URLs in code
- [ ] Razorpay script loads properly
- [ ] `npm run build` works without errors
- [ ] `.env.example` created
- [ ] Console logs cleaned up

### Development Files to Ignore
- [ ] `node_modules/`
- [ ] `__pycache__/`
- [ ] `.venv/`
- [ ] `.env` (never commit!)
- [ ] `*.pyc`

---

## Step 1: MongoDB Atlas Setup

### A. Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Click "Sign Up" and create an account
3. Create a new project named "restaurant-ordering"

### B. Create a Cluster
1. Click "Create" to create a new cluster
2. Choose "M0" (Free Tier) - sufficient for production
3. Select your preferred region (closest to your users)
4. Create cluster (takes 2-3 minutes)

### C. Set Up Database User
1. Go to **Security** → **Database Access**
2. Click **"Add New Database User"**
3. Set username: `restaurant_admin`
4. Set password: (Generate secure password, 20+ characters)
5. Select **"Built-in Role: 'Atlas admin'"**
6. Click **"Add User"**

**IMPORTANT:** Save the password securely!

### D. Configure Network Access
1. Go to **Security** → **Network Access**
2. Click **"Add IP Address"**
3. Select **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ For production, restrict this to Render IPs only
4. Click **"Confirm"**

### E. Get Connection String
1. Go to **Databases** → **Clusters**
2. Click **"Connect"**
3. Choose **"Connect your application"**
4. Copy the connection string
5. It will look like: `mongodb+srv://restaurant_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

### F. Replace Password in Connection String
- Replace `<password>` with the actual password you created
- Example: `mongodb+srv://restaurant_admin:MySecurePassword123@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

### G. Create Database Collections
1. In MongoDB Atlas, click **"Browse Collections"**
2. Create database: `restaurant_db`
3. Create collections:
   - `orders`
   - `menu_items`
   - `deliveries` (optional)

---

## Step 2: Razorpay Configuration

### A. Create Razorpay Account
1. Go to https://razorpay.com
2. Click **"Sign Up"** and create account
3. Complete KYC verification

### B. Get API Credentials
1. Log in to Razorpay Dashboard
2. Go to **Settings** → **API Keys**
3. Copy:
   - **Key ID** (looks like `rzp_test_xxxxx`)
   - **Key Secret** (paste this in Render securely)
4. ⚠️ **NEVER** share Key Secret publicly!

### C. Test Mode vs Live Mode
- Start with **Test Mode** for testing
- Switch to **Live Mode** for production
- Test credentials use `rzp_test_*` prefix
- Live credentials use `rzp_live_*` prefix

---

## Step 3: Backend Deployment (Render)

### A. Prepare Backend
1. Ensure `requirements.txt` is up to date:
   ```bash
   pip freeze > requirements.txt
   ```
2. Create `.env.example` (done ✓)
3. Ensure all environment variables are set

### B. Create Render Account
1. Go to https://render.com
2. Sign up with GitHub (recommended for auto-deploy)
3. Connect your GitHub repository

### C. Create New Web Service
1. Click **"New Web Service"**
2. Select your GitHub repository
3. Configure settings:
   - **Name:** `restaurant-api`
   - **Environment:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn server:app --host 0.0.0.0 --port 10000`
   - **Instance Type:** Free
4. Click **"Create Web Service"**

### D. Set Environment Variables in Render
1. Go to your service's **Environment** tab
2. Click **"Add Environment Variable"**
3. Add each variable:

```
MONGO_URL=mongodb+srv://restaurant_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
DB_NAME=restaurant_db
ENVIRONMENT=production
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=YOUR_SECRET
ADMIN_PASSWORD=unique_secure_password_here
```

**IMPORTANT:** 
- Copy-paste values carefully
- Do NOT include quotes
- Use secure passwords (20+ characters)

### E. Configure CORS for Frontend
After frontend is deployed:
1. Get your Vercel domain (e.g., `restaurant-ordering.vercel.app`)
2. Update `CORS_ORIGINS`:
   ```
   https://restaurant-ordering.vercel.app,https://yourdomain.com
   ```
3. Save and Render will auto-redeploy

### F. Monitor Deployment
1. Go to **Logs** tab
2. Watch for messages:
   - ✓ "Application startup complete" = Success
   - ❌ "Application failed to start" = Error
3. Check **Events** tab for deployment status

### G. Get Backend URL
- Your backend URL: `https://restaurant-api.onrender.com`
- API endpoint: `https://restaurant-api.onrender.com/api`
- Test it: Visit `https://restaurant-api.onrender.com/api/`

---

## Step 4: Frontend Deployment (Vercel)

### A. Prepare Frontend
1. Ensure `.env` has correct backend URL:
   ```
   REACT_APP_BACKEND_URL=https://restaurant-api.onrender.com
   ```
2. Test build locally:
   ```bash
   cd frontend
   npm run build
   ```
3. Ensure build succeeds without errors

### B. Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub (recommended)
3. Connect your repository

### C. Deploy to Vercel
1. Click **"New Project"**
2. Select your GitHub repository
3. Configure:
   - **Framework Preset:** Create React App
   - **Root Directory:** `./frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
4. Click **"Deploy"**

### D. Set Environment Variables in Vercel
1. Go to **Settings** → **Environment Variables**
2. Add:
   ```
   REACT_APP_BACKEND_URL=https://restaurant-api.onrender.com
   ```
3. Select environment: **Production**, **Preview**, **Development**
4. Click **"Save"**
5. Vercel will automatically redeploy

### E. Monitor Deployment
1. Check **Deployments** tab
2. Look for:
   - ✓ "Ready" = Success
   - ⏳ "Building" = In progress
   - ❌ "Error" = Failed

### F. Get Frontend URL
- Your frontend URL: `https://restaurant-ordering-app.vercel.app`
- Preview URL shows after successful deployment

### G. Test Frontend
1. Visit your Vercel URL
2. Check browser console for errors
3. Test order placement
4. Verify API calls reach backend

---

## Step 5: Custom Domain Setup

### A. Purchase Domain
1. Go to domain registrar (GoDaddy, Namecheap, etc.)
2. Search and buy your domain (e.g., `restaurant-app.com`)
3. Save the domain registrar username/password

### B. Connect Domain to Vercel (Frontend)

#### Option 1: Transfer Domain to Vercel
1. In Vercel: **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain
4. Follow Vercel's nameserver instructions
5. Update nameservers at domain registrar

#### Option 2: Use Domain Registrar's DNS
1. In Vercel: **Settings** → **Domains**
2. Click **"Add Domain"**
3. Choose **"Using External Nameservers"**
4. Copy the CNAME/A record values
5. Add records in your domain registrar's DNS settings:
   - Type: `CNAME`
   - Name: `www`
   - Value: `cname.vercel-dns.com`
   - Type: `A`
   - Name: `@`
   - Value: `76.76.19.132`

### C. Connect Domain to Render (Backend API)
1. In Render: **Settings** → **Custom Domains**
2. Click **"Add Custom Domain"**
3. Enter subdomain: `api.restaurant-app.com`
4. Copy provided DNS records
5. Add in domain registrar:
   - Type: `CNAME`
   - Name: `api`
   - Value: (provided by Render)

### D. Update Frontend Environment Variables
1. In Vercel: **Settings** → **Environment Variables**
2. Update `REACT_APP_BACKEND_URL`:
   ```
   https://api.restaurant-app.com
   ```
3. Redeploy

### E. Update Backend CORS
1. In Render: Environment variables
2. Update `CORS_ORIGINS`:
   ```
   https://restaurant-app.com,https://www.restaurant-app.com
   ```
3. Redeploy

### F. Verify SSL (HTTPS)
- Vercel: Auto-configured ✓
- Render: Auto-configured ✓
- Custom domain: Auto-configured ✓

---

## Step 6: Security Hardening

### A. Backend Security
- [ ] Change default admin password
- [ ] Update Razorpay credentials to LIVE keys
- [ ] Restrict CORS to specific domains
- [ ] Enable HTTPS enforcement
- [ ] Set up request rate limiting
- [ ] Remove all console.log from backend
- [ ] Use environment variables for all secrets

### B. Frontend Security
- [ ] Remove all console.log, debugger statements
- [ ] Validate all user inputs
- [ ] Never expose API keys in frontend
- [ ] Use HTTPS for all API calls
- [ ] Implement CSRF protection
- [ ] Add Content Security Policy headers

### C. Database Security
- [ ] Enable MongoDB encryption at rest
- [ ] Use strong passwords (20+ characters)
- [ ] Restrict IP access to Render IPs only
- [ ] Enable audit logging
- [ ] Regular backups enabled

### D. Payment Security
- [ ] Use LIVE Razorpay keys (not test keys)
- [ ] Verify all payments server-side
- [ ] Never store card details
- [ ] Implement idempotency keys
- [ ] Log all payment transactions

---

## Step 7: Testing Production

### A. Functional Testing
1. **Create Account & Login**
   - Visit production URL
   - Try admin login
   - Verify session works

2. **Place Order**
   - Add items to cart
   - Complete checkout form
   - Attempt payment

3. **Payment Testing**
   - Use Razorpay test card: `4111 1111 1111 1111`
   - Expiry: Any future date
   - CVV: Any 3 digits
   - Verify payment success/failure handling

4. **Admin Panel**
   - Access `/admin`
   - Login with credentials
   - View and update orders
   - Verify order status changes

### B. Performance Testing
1. Check page load times
2. Monitor API response times
3. Test with slow network (DevTools)
4. Check mobile responsiveness

### C. Security Testing
1. Check for hardcoded credentials
2. Verify CORS headers
3. Test HTTPS enforcement
4. Check for sensitive data in logs

---

## Step 8: Backup & Monitoring

### A. MongoDB Backup
1. **Enable Automatic Backups**
   - MongoDB Atlas → Settings → Backup
   - Enable "Automatic Backup"
   - Frequency: Daily
   - Retention: 30 days

2. **Manual Backup**
   ```bash
   mongodump --uri "your_connection_string"
   ```

3. **Restore from Backup**
   ```bash
   mongorestore --uri "your_connection_string" ./dump
   ```

### B. Monitoring Setup

#### Render Monitoring
1. Go to **Logs** in Render dashboard
2. Monitor for errors
3. Set up email alerts for failures

#### Vercel Monitoring
1. Go to **Analytics** in Vercel
2. Monitor performance metrics
3. Check response times and error rates

#### MongoDB Monitoring
1. MongoDB Atlas → Charts
2. Create dashboard with order metrics
3. Monitor database size and usage

### C. Alerting
- Set up email notifications for deployment failures
- Monitor error rates in production
- Check database size alerts

---

## Troubleshooting

### Backend Issues

#### "Connection refused" to MongoDB
**Problem:** Backend can't connect to MongoDB Atlas  
**Solution:**
1. Verify `MONGO_URL` is correct
2. Check IP whitelist in MongoDB Atlas
3. Confirm password is correct
4. Test connection string locally

#### CORS errors "Origin not allowed"
**Problem:** Frontend can't reach backend  
**Solution:**
1. Check `CORS_ORIGINS` environment variable
2. Verify frontend domain is listed
3. Restart Render service

#### Uvicorn startup fails
**Problem:** Backend won't start  
**Solution:**
1. Check logs for specific error
2. Verify all environment variables set
3. Test locally: `uvicorn server:app --reload`
4. Check requirements.txt for conflicts

### Frontend Issues

#### "Cannot find module" errors
**Problem:** Build fails with module errors  
**Solution:**
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install`
3. Run `npm run build`

#### White screen on load
**Problem:** Frontend loads but shows blank page  
**Solution:**
1. Check browser console for errors
2. Verify `REACT_APP_BACKEND_URL` is set
3. Check Network tab for failed requests
4. Verify API is responding

#### API calls return 404
**Problem:** Frontend can't reach backend API  
**Solution:**
1. Check `REACT_APP_BACKEND_URL` value
2. Verify backend is running
3. Test API endpoint directly in browser
4. Check Render logs for errors

### Payment Issues

#### Razorpay payment button not working
**Problem:** Payment doesn't initiate  
**Solution:**
1. Verify Razorpay script loads (check Network tab)
2. Check Razorpay credentials
3. Ensure HTTPS is used (not HTTP)
4. Check Razorpay API limits

#### Payment verification fails
**Problem:** Payment goes through but order shows failed  
**Solution:**
1. Check Razorpay signature verification
2. Verify webhook is configured in Razorpay
3. Check MongoDB order is being created
4. Review backend logs

### Domain Issues

#### Domain shows "Connection Refused"
**Problem:** Domain not working  
**Solution:**
1. Wait 24-48 hours for DNS propagation
2. Verify nameservers are correct
3. Flush DNS cache: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (Mac)
4. Use online DNS checker

#### SSL certificate not loading
**Problem:** HTTPS not working  
**Solution:**
1. Vercel auto-provisions SSL (usually instant)
2. Render auto-provisions SSL (usually instant)
3. Wait up to 1 hour for certificate
4. Check domain verification in provider

---

## 📞 Support & Resources

### Documentation
- FastAPI: https://fastapi.tiangolo.com
- Vercel: https://vercel.com/docs
- Render: https://render.com/docs
- MongoDB Atlas: https://www.mongodb.com/docs/atlas
- Razorpay: https://razorpay.com/docs

### Common Commands

```bash
# Test backend locally
uvicorn server:app --reload --port 8000

# Build frontend
npm run build

# Test production build locally
npm run build && serve -s build -l 3000

# Database backup
mongodump --uri "your_connection_string" --out ./backup

# Clear DNS cache
ipconfig /flushdns  # Windows
sudo dscacheutil -flushcache  # Mac
```

---

## 🎉 Deployment Complete!

Once all steps are complete, you have a **production-ready** restaurant ordering system!

**Next Steps:**
1. ✓ Monitor production daily first week
2. ✓ Set up analytics and monitoring
3. ✓ Create backup routine
4. ✓ Plan scaling for growth
5. ✓ Consider mobile app development

**Happy Deployment! 🚀**
