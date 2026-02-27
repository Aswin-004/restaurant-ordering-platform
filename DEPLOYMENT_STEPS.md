# 📋 STEP-BY-STEP DEPLOYMENT SEQUENCE

## Complete Order of Operations for Production Deployment

**Estimated Time:** 2-3 hours  
**Difficulty Level:** Intermediate  
**Requirements:** GitHub account, credit card for domains, Razorpay account

---

## PHASE 1: Pre-Deployment Preparation (30-45 minutes)

### Step 1.1: Verify Code Quality
```bash
# Navigate to project root
cd /path/to/project

# Check backend code
cd backend
python -m pytest  # Run tests if available

# Build and test frontend
cd ../frontend
npm run build     # Should complete without errors
npm run test      # Run tests if available
```

### Step 1.2: Create .env Files Locally
```bash
# Backend .env (for local testing)
cd backend
cp .env.example .env
# Edit .env with test mongodb url

# Frontend .env (for local testing)
cd frontend
cp .env.example .env
# Edit .env with REACT_APP_BACKEND_URL=http://localhost:8000
```

### Step 1.3: Test Locally
```bash
# Terminal 1 - Backend
cd backend
uvicorn server:app --reload

# Terminal 2 - Frontend
cd frontend
npm start

# Visit http://localhost:3000 in browser
# Test checkout and admin panel
```

### Step 1.4: Prepare Credentials Document
Create a secure document (keep in password manager like 1Password, LastPass):
- MongoDB Atlas password
- Razorpay Key ID & Secret
- Admin password (unique)
- Domain registrar login
- Vercel & Render credentials

---

## PHASE 2: External Services Setup (45-60 minutes)

### Step 2.1: MongoDB Atlas Setup
**Time: 15-20 minutes**

```
Actions:
1. Create MongoDB Atlas account (https://www.mongodb.com/cloud/atlas)
2. Create free tier cluster (M0)
3. Create database user "restaurant_admin"
4. Configure network access (allow all for now)
5. Get connection string
6. Create database "restaurant_db" with collections:
   - orders
   - menu_items

Result: MONGO_URL=mongodb+srv://restaurant_admin:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### Step 2.2: Razorpay Account Setup
**Time: 10-15 minutes**

```
Actions:
1. Create Razorpay merchant account (https://razorpay.com)
2. Complete KYC verification
3. Get API Keys from dashboard
4. Keep in TEST mode for now

Result:
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=test_secret_xxxxxxxxxxxxx
```

### Step 2.3: GitHub Setup
**Time: 5 minutes**

```
Actions:
1. Create GitHub account if needed
2. Create new repository: "restaurant-ordering-system"
3. Add .gitignore:
   ```
   .env
   .env.local
   node_modules/
   __pycache__/
   .venv/
   *.pyc
   ```
4. Push project to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/restaurant-ordering-system
   git push -u origin main
   ```
```

### Step 2.4: Domain Registration
**Time: 5-10 minutes**

```
Actions:
1. Choose registrar (GoDaddy, Namecheap, etc.)
2. Buy domain (e.g., restaurant-app.com)
3. Note nameserver change options
4. Keep dashboard open for later

Keep active in background - you'll configure DNS later
```

---

## PHASE 3: Backend Deployment to Render (30-45 minutes)

### Step 3.1: Create Render Account
**Time: 5 minutes**

```
Actions:
1. Go to https://render.com
2. Sign up with GitHub account
3. Authorize GitHub connection
4. Dashboard should show your repositories
```

### Step 3.2: Deploy Backend Service
**Time: 10-15 minutes**

```
Actions:
1. In Render dashboard: Click "New +" → "Web Service"
2. Select repository: "restaurant-ordering-system"
3. Configure:
   - Name: restaurant-api
   - Root Directory: backend
   - Environment: Python 3
   - Build Command: pip install -r requirements.txt
   - Start Command: uvicorn server:app --host 0.0.0.0 --port 10000
   - Instance Type: Free
4. Create Web Service (auto-deploys)

Watch logs - should see "Application startup complete"
```

### Step 3.3: Set Environment Variables
**Time: 10-15 minutes**

```
Actions:
1. Go to service → Settings → Environment
2. Add each variable (use values from Step 2):

MONGO_URL=mongodb+srv://restaurant_admin:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
DB_NAME=restaurant_db
ENVIRONMENT=production
CORS_ORIGINS=http://localhost:3000
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=test_secret_xxxxxxxxxxxxx
ADMIN_PASSWORD=YourSecureAdminPassword123!@#

3. Click Save
4. Render will auto-redeploy

Wait for "Ready" status in Events
```

### Step 3.4: Verify Backend
**Time: 5 minutes**

```
Actions:
1. Get backend URL from deploy (e.g., https://restaurant-api.onrender.com)
2. Test in browser:
   - Visit: https://restaurant-api.onrender.com/api/
   - Should see: {"message":"Hello World"}
3. Check logs for errors
```

**Backend URL for later:** `https://restaurant-api.onrender.com`

---

## PHASE 4: Frontend Deployment to Vercel (20-30 minutes)

### Step 4.1: Create Vercel Account
**Time: 5 minutes**

```
Actions:
1. Go to https://vercel.com
2. Sign up with GitHub
3. Grant repository access
4. Dashboard ready
```

### Step 4.2: Deploy Frontend
**Time: 10 minutes**

```
Actions:
1. In Vercel: "Add New..." → "Project"
2. Select repository: "restaurant-ordering-system"
3. Configure Framework: "Create React App"
4. Configure:
   - Root Directory: frontend
   - Build Command: npm run build
   - Output Directory: build
5. Deploy (auto-builds and deploys)

Watch deployment progress - should see "Deployment Complete"
```

### Step 4.3: Set Environment Variables
**Time: 10 minutes**

```
Actions:
1. Go to Project Settings → Environment Variables
2. Add:
   REACT_APP_BACKEND_URL = https://restaurant-api.onrender.com
3. Apply to: Production, Preview, Development
4. Trigger redeploy:
   - Go to Deployments
   - Click "Redeploy" on latest deployment
5. Wait for "Ready" status
```

### Step 4.4: Verify Frontend
**Time: 5 minutes**

```
Actions:
1. Get frontend URL (e.g., https://restaurant-ordering-app.vercel.app)
2. Visit in browser
3. Check:
   - Page loads without errors
   - Open DevTools → Console (no errors)
   - Open DevTools → Network (API calls work)
   - Test adding items to cart
   - Test going to checkout (should see order form)
```

**Frontend URL for later:** `https://restaurant-ordering-app.vercel.app`

---

## PHASE 5: Domain Configuration (30-45 minutes)

### Step 5.1: Change Frontend Domain
**Time: 10-15 minutes**

```
If using Vercel nameservers:
1. In Vercel: Settings → Domains
2. Add Domain: "restaurant-app.com"
3. Save nameserver values from Vercel
4. Go to domain registrar
5. Change nameservers to Vercel values
6. Wait up to 48 hours for DNS propagation

If using registrar's DNS:
1. In Vercel: Settings → Domains
2. Add Domain: "restaurant-app.com"
3. Choose "Using External Nameservers"
4. Copy CNAME records from Vercel
5. Go to domain registrar → DNS Settings
6. Add A record: @ → 76.76.19.132
7. Add CNAME record: www → cname.vercel-dns.com
```

### Step 5.2: Change Backend Domain
**Time: 10-15 minutes**

```
Actions:
1. In Render: Settings → Custom Domains
2. Add Domain: "api.restaurant-app.com"
3. Copy CNAME value
4. Go to domain registrar → DNS Settings
5. Add CNAME record:
   Name: api
   Value: (from Render)
6. Wait up to 1 hour for DNS propagation
```

### Step 5.3: Update Frontend Configuration
**Time: 5 minutes**

```
Actions:
1. In Vercel: Environment Variables
2. Update REACT_APP_BACKEND_URL:
   From: https://restaurant-api.onrender.com
   To: https://api.restaurant-app.com
3. Save
4. Redeploy
5. Wait for "Ready" status
```

### Step 5.4: Update Backend CORS
**Time: 5 minutes**

```
Actions:
1. In Render: Environment Variables
2. Update CORS_ORIGINS:
   From: http://localhost:3000
   To: https://restaurant-app.com,https://www.restaurant-app.com,https://api.restaurant-app.com
3. Save
4. Auto-redeploys
```

### Step 5.5: Verify Domain Setup
**Time: 5 minutes**

```bash
# Check DNS propagation
nslookup restaurant-app.com
nslookup api.restaurant-app.com

# Or use online tool: https://www.whatsmydns.net/
```

---

## PHASE 6: Production Testing (30-45 minutes)

### Step 6.1: Functional Testing
**Time: 15-20 minutes**

```
Test Checklist:
□ Visit https://restaurant-app.com in browser
□ Page loads without errors
□ Header & footer display correctly
□ Can view menu items
□ Can add items to cart
□ Can go to checkout
□ Can see order summary
□ All form fields work

Test Admin Panel:
□ Visit https://restaurant-app.com/admin
□ Login with admin credentials
□ Can see orders list
□ Can update order status
□ Can logout
```

### Step 6.2: Payment Testing
**Time: 10-15 minutes**

```
Test Payment Flow:
1. Add items to cart
2. Go to checkout
3. Fill all form fields
4. Select "Razorpay" payment
5. Click "Pay with Razorpay"
6. Use test card:
   Card Number: 4111111111111111
   Name: Any
   Expiry: 12/25
   CVV: 123
7. Should see success page
8. Verify order appears in admin panel
```

### Step 6.3: API Testing
**Time: 5-10 minutes**

```bash
# Test backend API
curl https://api.restaurant-app.com/api/

# Should return:
# {"message":"Hello World"}

# Test CORS
curl -H "Origin: https://restaurant-app.com" \
     -H "Access-Control-Request-Method: POST" \
     https://api.restaurant-app.com/api/
```

### Step 6.4: Performance Testing
**Time: 5 minutes**

```
Test in Browser DevTools:
1. Open DevTools → Performance tab
2. Load https://restaurant-app.com
3. Record page load
4. Check:
   - First Contentful Paint < 3 seconds
   - Largest Contentful Paint < 5 seconds
   - Cumulative Layout Shift < 0.1

Check Network tab:
   - All requests successful (200/201 status)
   - API responses < 500ms
   - No blocked resources
```

---

## PHASE 7: Security Hardening (15-20 minutes)

### Step 7.1: Update Razorpay to LIVE Keys
**Time: 10 minutes**

```
Actions:
1. Log into Razorpay dashboard
2. Settings → API Keys
3. Copy LIVE keys (rzp_live_* prefix)
4. In Render: Update environment variables:
   RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
   RAZORPAY_KEY_SECRET=live_secret_xxxxxxxxxxxxx
5. Save and auto-redeploy
6. Test payment with live test card
```

### Step 7.2: Enable HTTPS Enforcement
**Time: 5 minutes**

```
Already Enabled:
✓ Vercel: Auto HTTPS with auto-renewal
✓ Render: Auto HTTPS with auto-renewal
✓ Custom domain: Inherits HTTPS

Verification:
1. Visit http://restaurant-app.com (note: HTTP not HTTPS)
2. Should auto-redirect to HTTPS
3. Check in browser: Lock icon visible
```

### Step 7.3: Update Database Network Access
**Time: 5 minutes**

```
Actions:
1. In MongoDB Atlas: Network Access
2. Remove "Allow access from anywhere" (0.0.0.0/0)
3. Add Render IP ranges (if you know them) OR
4. Keep current setting with strong password

For future hardening:
1. Get Render IP: in Render service logs, look for "Outbound IP"
2. Add specific IP to MongoDB
3. Remove broader access
```

---

## PHASE 8: Backup & Monitoring (10-15 minutes)

### Step 8.1: Enable Database Backups
**Time: 5 minutes**

```
Actions:
1. MongoDB Atlas → Backup
2. Enable "Automatic Backup"
3. Frequency: Daily
4. Retention: 30 days (or more)
5. Note: Free tier has daily backups
```

### Step 8.2: Set Up Monitoring
**Time: 10 minutes**

```
Render Monitoring:
1. In service: Logs section
2. Set up error alerting (email notifications)

Vercel Monitoring:
1. Settings → Analytics
2. Review key metrics

Consider:
- MongoDB monitoring dashboard
- Error tracking (Sentry)
- Uptime monitoring (UptimeRobot)
```

---

## PHASE 9: Final Verification (10 minutes)

### Checklist Before Going Live

```
Backend:
□ All environment variables set
□ API responds without errors
□ CORS configured correctly
□ Database backups enabled
□ Logs being collected
□ Performance acceptable

Frontend:
□ Loads without errors
□ API calls successful
□ Payment flow works (with live keys)
□ Admin panel accessible
□ Mobile responsive

Security:
□ HTTPS enforced
□ No secrets in code
□ Admin password changed
□ Razorpay live keys active
□ Database access restricted

Domain:
□ Frontend domain working
□ Backend domain working
□ SSL certificates valid
□ DNS propagated

Backups:
□ Database backups enabled
□ Backup restoration tested
□ Backup schedule documented
```

---

## PHASE 10: Go-Live & Documentation (5 minutes)

### Step 10.1: Update Documentation
```bash
# Create PRODUCTION_README.md
- Link to frontend: https://restaurant-app.com
- Link to backend API: https://api.restaurant-app.com  
- Admin panel: https://restaurant-app.com/admin
- Contact for support
```

### Step 10.2: Notify Stakeholders
```
Notification Template:
"Restaurant Ordering System is now LIVE!
- Customer Site: https://restaurant-app.com
- Admin Panel: https://restaurant-app.com/admin
- Support Email: [your-email]

Payment Processing: ACTIVE (Live Razorpay)
"
```

### Step 10.3: Post-Launch Tasks
```
Immediate (Day 1):
□ Monitor site every hour
□ Check logs for errors
□ Respond to any issues
□ Verify payments are processing

Within 1 Week:
□ Analyze user behavior
□ Check performance metrics
□ Review error logs
□ Plan improvements

Within 1 Month:
□ Full security audit
□ Backup restoration test
□ Performance optimization
□ Feature enhancements
```

---

## Summary Timeline

| Phase | Time | Task |
|-------|------|------|
| 1 | 30-45 min | Code prep & local testing |
| 2 | 45-60 min | External services (MongoDB, Razorpay, GitHub, Domain) |
| 3 | 30-45 min | Render backend deployment |
| 4 | 20-30 min | Vercel frontend deployment |
| 5 | 30-45 min | Domain configuration |
| 6 | 30-45 min | Production testing |
| 7 | 15-20 min | Security hardening |
| 8 | 10-15 min | Backups & monitoring |
| 9 | 10 min | Final verification |
| 10 | 5 min | Go-live notification |
| **TOTAL** | **3-4 hours** | **Full deployment** |

---

## Emergency Rollback Plan

If something breaks in production:

```
1. Immediate (within 5 minutes):
   - Disable Razorpay payments temporarily
   - Update admin password
   - Check error logs
   - Assess severity

2. Short term (within 30 minutes):
   - Deploy hotfix to affected service
   - Or revert to previous deployment
   - Verify issue resolved
   - Test critical flows

3. Extended (1-24 hours):
   - Root cause analysis
   - Implement permanent fix
   - Security audit if needed
   - Deploy permanent solution

4. Post-incident (1-7 days):
   - Document what happened
   - Improve monitoring
   - Update runbooks
```

---

## Contact & Support

**Deployment Questions?**
- Render Support: https://render.com/support
- Vercel Support: https://vercel.com/support
- MongoDB Support: https://www.mongodb.com/support
- Razorpay Support: https://razorpay.com/support

**Good luck with your deployment! 🚀**
