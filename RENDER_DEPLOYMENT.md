# 🚀 RENDER BACKEND DEPLOYMENT GUIDE

**Restaurant Ordering Platform - Backend Deployment to Render**

---

## 📋 Pre-Deployment Checklist

### Backend Code Ready?
- ✅ `server.py` uses environment variables for configuration
- ✅ `requirements.txt` includes all dependencies
- ✅ CORS configured for dynamic origins
- ✅ No hardcoded secrets in code
- ✅ `.env.example` created with all required variables
- ✅ `PORT` environment variable support added

### MongoDB Atlas Ready?
- ✅ MongoDB Atlas cluster created
- ✅ Database user created (restaurant_admin)
- ✅ IP whitelist allows 0.0.0.0/0 (or Render IP)
- ✅ Connection string ready: `mongodb+srv://restaurant_admin:PASSWORD@cluster0.xxxxx.mongodb.net/`

### Razorpay Ready?
- ✅ Razorpay account created
- ✅ LIVE API keys obtained (not test keys)
- ✅ Key ID and Secret saved securely

---

## 🔧 STEP 1: Prepare Your Backend

### 1. Verify Deployment-Ready Code

Check `backend/server.py` has:

```python
# CORS Configuration
def get_cors_origins():
    if ENVIRONMENT == 'development':
        return ['*']
    else:
        origins_str = os.getenv('CORS_ORIGINS', 'http://localhost:3000')
        origins = [origin.strip() for origin in origins_str.split(',') if origin.strip()]
        return origins if origins else ['http://localhost:3000']

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=get_cors_origins(),
    ...
)

# Port from environment variable
if __name__ == "__main__":
    port = int(os.getenv('PORT', 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
```

✅ **Status:** Already updated in your code

### 2. Verify requirements.txt

Your `backend/requirements.txt` should have:

```
fastapi==0.110.1
uvicorn[standard]==0.25.0
motor==3.3.1
pymongo==4.5.0
python-dotenv==1.0.1
pydantic>=2.6.4
razorpay==2.0.0
bcrypt==4.1.3
passlib>=1.7.4
python-jose>=3.3.0
requests>=2.31.0
python-multipart>=0.0.9
```

✅ **Status:** Your requirements.txt is complete

### 3. Create `.env.example`

Your `backend/.env.example` should list all required variables:

```
MONGO_URL=mongodb+srv://restaurant_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
DB_NAME=restaurant_db
ENVIRONMENT=production
CORS_ORIGINS=https://your-app.vercel.app
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_secret_key
ADMIN_PASSWORD=your_secure_password_20_chars_min
```

✅ **Status:** Already created in your project

---

## 🚀 STEP 2: Create Render Web Service

### 1. Go to Render Dashboard

```
https://render.com
```

### 2. Click "New Web Service"

- **Repository:** Select your GitHub repository
- **Branch:** Main (or your deployment branch)

### 3. Configure Web Service

| Setting | Value |
|---------|-------|
| **Name** | `restaurant-api` |
| **Runtime** | `Python 3` |
| **Region** | Select closest to users (e.g., Singapore, India) |
| **Root Directory** | `backend` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn server:app --host 0.0.0.0 --port 10000` |
| **Instance Type** | `Free` (or Starter+ for production) |

### 4. Add Environment Variables

Click **"Environment"** tab and add each variable:

```
MONGO_URL=mongodb+srv://restaurant_admin:YOUR_ACTUAL_PASSWORD@cluster0.abc123def.mongodb.net/?retryWrites=true&w=majority

DB_NAME=restaurant_db

ENVIRONMENT=production

CORS_ORIGINS=https://your-app.vercel.app

RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx

RAZORPAY_KEY_SECRET=your_razorpay_secret_key

ADMIN_PASSWORD=YourSecurePassword123!@#

TIMEZONE=Asia/Kolkata
```

⚠️ **IMPORTANT:**
- Replace `YOUR_ACTUAL_PASSWORD` with your MongoDB password
- Replace Razorpay keys with LIVE keys (not test keys)
- Set strong `ADMIN_PASSWORD` (20+ characters)
- Copy values carefully - no quotes needed

### 5. Deploy

- Click **"Deploy"**
- Wait for build to complete (2-5 minutes)
- Check **"Logs"** tab for any errors

---

## ✅ STEP 3: Verify Backend Deployment

### 1. Wait for "Live" Status

In Render dashboard, watch status:
- 🟡 Building → 🟢 Live

### 2. Get Your Backend URL

Once deployed, find **Service URL** in Render:

```
https://restaurant-api.onrender.com
```

(Your actual URL will be different)

### 3. Test Backend Health

Visit in browser:

```
https://restaurant-api.onrender.com/api
```

Should return:
```json
{"message": "Hello World"}
```

### 4. Check Logs for Errors

In Render > **Logs** tab:

✅ **Success indicators:**
```
INFO:     Application startup complete
INFO:     Uvicorn running on http://0.0.0.0:10000
```

❌ **Error indicators:**
```
ModuleNotFoundError
Connection refused to MongoDB
CORS error
```

---

## 🔐 STEP 4: Backend Environment Variables (Complete List)

### For Render Dashboard

Copy-paste each variable exactly (without quotes):

```
MONGO_URL
mongodb+srv://restaurant_admin:d76ITx4VWa1OMCSh@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority

DB_NAME
restaurant_db

ENVIRONMENT
production

CORS_ORIGINS
https://your-restaurant-app.vercel.app

RAZORPAY_KEY_ID
rzp_live_xxxxxxxxxxxxx

RAZORPAY_KEY_SECRET
your_actual_secret_key_here

ADMIN_PASSWORD
YourSecurePassword123!
```

---

## 🌐 STEP 5: Connect Frontend to Backend

After backend is deployed:

1. Copy your **Render URL**: `https://restaurant-api.onrender.com`
2. Go to **Vercel Dashboard**
3. Set frontend environment variable:
   ```
   REACT_APP_BACKEND_URL=https://restaurant-api.onrender.com
   ```
4. Redeploy frontend

---

## 🧪 STEP 6: Test Backend

### Test 1: Health Check
```bash
curl https://restaurant-api.onrender.com/api
# Should return: {"message": "Hello World"}
```

### Test 2: MongoDB Connection
```bash
curl https://restaurant-api.onrender.com/api/menu
# Should return menu items (may be empty if not seeded)
```

### Test 3: CORS Headers
```bash
curl -H "Origin: https://your-app.vercel.app" https://restaurant-api.onrender.com/api
# Should have CORS headers
```

---

## 📊 Monitoring & Logs

### View Logs
Render > Service > **Logs** tab

### Redeploy
Render > Service > **Deploy** button (manual redeploy)

### Auto-Deploy
Enable in Render > **Settings** > **Auto-Deploy** = On

---

## 🐛 Troubleshooting

### "Application failed to start"
- Check **Logs** for specific error
- Verify all environment variables set
- Check `requirements.txt` completeness
- Ensure MongoDB connection string is valid

### "Connection refused to MongoDB"
- Verify MongoDB IP whitelist includes Render IPs
- Check connection string password
- Confirm MongoDB cluster is running

### "CORS error on frontend"
- Update `CORS_ORIGINS` with correct Vercel URL
- Redeploy backend after changing
- Check frontend is using correct backend URL

### "502 Bad Gateway"
- Backend might be crashing
- Check Logs for runtime errors
- Verify all required packages installed

---

## 🎯 Final Checklist

- ✅ Render account created
- ✅ Web Service deployed
- ✅ All environment variables set
- ✅ Backend URL obtained
- ✅ Health endpoint working
- ✅ MongoDB connected
- ✅ Logs show no errors
- ✅ CORS configured for frontend

---

## 📌 Your Backend URL

Once deployed, your API endpoint will be:

```
https://restaurant-api.onrender.com/api
```

Share this with frontend deployment!

---

**Next Step:** [Deploy Frontend to Vercel](VERCEL_DEPLOYMENT.md)
