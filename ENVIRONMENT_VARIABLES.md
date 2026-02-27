# 📝 ENVIRONMENT VARIABLES REFERENCE

## Complete Guide to All Environment Variables

---

## Backend Environment Variables

### Database Configuration

#### `MONGO_URL`
**Description:** MongoDB Atlas connection string  
**Type:** String  
**Format:** `mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority`  
**Example:** `mongodb+srv://restaurant_admin:MyPassword123@cluster0.abc123.mongodb.net/?retryWrites=true&w=majority`  
**Required:** YES  
**Development Default:** `mongodb://localhost:27017`  
**Production Default:** None (must be supplied)  

**How to Get:**
1. MongoDB Atlas → Clusters → Connect
2. Choose "Connect your application"
3. Copy connection string
4. Replace `<password>` with actual password

**Security Notes:**
- ⚠️ Never commit to git
- ⚠️ Rotate password every 90 days
- ✓ Use strong password (20+ characters)
- ✓ Use environment variable in production

---

#### `DB_NAME`
**Description:** MongoDB database name  
**Type:** String  
**Example:** `restaurant_db`  
**Required:** YES  
**Default:** `restaurant_db`  

**Valid Values:**
- `restaurant_db` (production)
- `restaurant_test` (testing)
- `restaurant_dev` (development)

---

### Server Configuration

#### `ENVIRONMENT`
**Description:** Application environment  
**Type:** String (enum)  
**Valid Values:** `development`, `production`  
**Default:** `development`  
**Required:** YES  

**Behavior Differences:**
```
development:
- Debug logging enabled
- CORS allows "*"
- Detailed error messages
- Development settings for external services

production:
- Info logging only
- CORS restricted to specific domains
- Generic error messages
- Live external service credentials
```

---

#### `PORT`
**Description:** Server listening port (for local development)  
**Type:** Integer  
**Example:** `8000`  
**Default:** `8000`  
**Required:** NO (Render sets automatically)  

**Notes:**
- Render will set PORT via environment
- Local development: use 8000
- Ensure port available: `lsof -i :8000`

---

#### `HOST`
**Description:** Server binding address  
**Type:** String  
**Example:** `0.0.0.0`  
**Default:** `0.0.0.0`  
**Required:** NO  

**Values:**
- `0.0.0.0` - Listen on all interfaces (for Render)
- `127.0.0.1` - Localhost only

---

### CORS Configuration

#### `CORS_ORIGINS`
**Description:** Allowed origins for CORS requests  
**Type:** String (comma-separated URLs)  
**Example (dev):** `http://localhost:3000`  
**Example (prod):** `https://restaurant-app.com,https://www.restaurant-app.com`  
**Default:** `*` (allow all)  
**Required:** YES  

**Format:**
```
Single domain:
CORS_ORIGINS=https://restaurant-app.com

Multiple domains (comma-separated, no spaces):
CORS_ORIGINS=https://restaurant-app.com,https://www.restaurant-app.com,https://admin.restaurant-app.com

With port (localhost only):
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

**Security:**
- Development: `*` or `http://localhost:3000`
- Production: Specify exact domains
- Never use `*` in production

**Allowed Methods:** GET, POST, PUT, PATCH, DELETE, OPTIONS  
**Allowed Headers:** All

---

### Payment Configuration

#### `RAZORPAY_KEY_ID`
**Description:** Razorpay public key for payment processing  
**Type:** String  
**Format:** `rzp_test_xxxxxxxxxxxxx` (test) or `rzp_live_xxxxxxxxxxxxx` (live)  
**Example:** `rzp_test_1234567890abcd`  
**Required:** YES  
**Default:** Empty string (payments disabled)  

**How to Get:**
1. Razorpay Dashboard → Settings → API Keys
2. Copy "Key ID"
3. Use `rzp_test_*` for testing
4. Use `rzp_live_*` for production

**Important:**
- Test Key ID is public (safe to expose)
- Key Secret must NEVER be exposed
- Rotate keys every 6 months

---

#### `RAZORPAY_KEY_SECRET`
**Description:** Razorpay secret key for signature verification  
**Type:** String (64 characters)  
**Format:** 64-character hex string  
**Example:** `abcdef1234567890abcdef1234567890...`  
**Required:** YES  
**Default:** Empty string  

**⚠️ CRITICAL SECURITY:**
- ❌ NEVER log this value
- ❌ NEVER commit to git
- ❌ NEVER expose in frontend
- ✓ Store as environment variable
- ✓ Rotate every 6 months
- ✓ Handle like database password

**How to Use:**
1. Get from Razorpay Settings → API Keys
2. Keep in secure location
3. Set as environment variable only
4. Used for payment signature verification

**If Compromised:**
1. Immediately revoke in Razorpay dashboard
2. Generate new key
3. Update environment variables
4. Redeploy immediately

---

### Admin Configuration

#### `ADMIN_PASSWORD`
**Description:** Admin panel login password  
**Type:** String  
**Example:** `SecurePassword123!@#Admin`  
**Required:** YES  
**Default:** `classic@admin2026` (⚠️ CHANGE IN PRODUCTION)  

**Requirements:**
- Minimum 15 characters
- Include uppercase letters
- Include lowercase letters
- Include numbers
- Include special characters (!@#$%^&*)
- Not common words/phrases
- Not previous passwords

**Security:**
- ❌ Never use default password in production
- ❌ Never share password via email
- ✓ Store in password manager
- ✓ Rotate every 90 days
- ✓ Different for each environment

**Change Procedure:**
1. Generate strong password
2. Set `ADMIN_PASSWORD` environment variable
3. Redeploy backend
4. Test login with new password
5. Update password manager

**Example Strong Passwords:**
```
✓ Tr0pic@l$unset#2024!Rain
✓ Blu3M00n*Caf3^Latte@Night
✓ Pizza!Passion#2024&Order
```

---

## Frontend Environment Variables

### API Configuration

#### `REACT_APP_BACKEND_URL`
**Description:** Backend API base URL  
**Type:** String (URL)  
**Format:** `https://domain.com` or `http://localhost:8000`  
**Example (dev):** `http://localhost:8000`  
**Example (prod):** `https://api.restaurant-app.com`  
**Required:** YES  
**Default:** None (must be set)  

**Implementation:**
```javascript
const API_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API = `${API_URL}/api`;
```

**Usage in Components:**
```javascript
// Checkout.jsx
const API = `${BACKEND_URL}/api`;
await axios.post(`${API}/orders`, orderData);
await axios.post(`${API}/payment/create-razorpay-order`, paymentData);

// AdminPanel.jsx
await axios.get(`${API}/orders`);
await axios.patch(`${API}/orders/${orderId}/status`, {status: newStatus});
```

**Setting Values:**

**Development:**
```
REACT_APP_BACKEND_URL=http://localhost:8000
```

**Production:**
```
REACT_APP_BACKEND_URL=https://api.restaurant-app.com
```

**Vercel Configuration:**
1. Project Settings → Environment Variables
2. Add `REACT_APP_BACKEND_URL`
3. Set Production value
4. Apply to all environments
5. Trigger redeploy

---

### Build Configuration

#### `GENERATE_SOURCEMAP`
**Description:** Generate source maps for debugging  
**Type:** Boolean (`true` or `false`)  
**Default:** `true`  
**Required:** NO  

**Values:**
- `true` - Generate source maps (increases build size)
- `false` - Don't generate source maps (smaller bundle)

**Recommendation:**
- Development: `true` (for debugging)
- Production: `false` (for security)

---

#### `INLINE_RUNTIME_CHUNK`
**Description:** Inline webpack runtime chunk  
**Type:** Boolean  
**Default:** `true`  
**Required:** NO  

**Values:**
- `true` - Inline in main bundle (one less request)
- `false` - Separate chunk file

**Recommendation:** `true` for production

---

## Database Environment Variables (MongoDB Atlas)

### Connection Pool

#### Automatic (handled by MongoDB driver)
Connection pooling is automatic with Motor (async driver).

Settings managed by MongoDB Atlas:
- **Max Pool Size:** 100 (default)
- **Min Pool Size:** 10 (default)
- **Max Idle Time:** 30 minutes

No environment variables needed - handled by driver.

---

## Razorpay Webhook Configuration

**Note:** Webhooks configured in Razorpay Dashboard, not via environment variables.

**Setup:**
1. Razorpay Dashboard → Webhooks
2. Add webhook:
   - URL: `https://api.restaurant-app.com/api/payment/webhook`
   - Events: `payment.authorized`, `payment.failed`, `order.paid`
3. Copy webhook signing secret
4. Use in webhook verification (currently done in code)

---

## Environment Variables Checklist

### Development (.env)
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=restaurant_db
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:3000
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=test_secret_xxxxx
ADMIN_PASSWORD=dev_password_123
```

### Staging (.env.staging)
```
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=restaurant_staging
ENVIRONMENT=production
CORS_ORIGINS=https://staging-restaurant-app.vercel.app
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=test_secret_xxxxx
ADMIN_PASSWORD=staging_secure_password_123!@#
```

### Production (.env.production)
```
MONGO_URL=mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority
DB_NAME=restaurant_db
ENVIRONMENT=production
CORS_ORIGINS=https://restaurant-app.com,https://www.restaurant-app.com
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=live_secret_xxxxx
ADMIN_PASSWORD=production_very_secure_password_!@#$%
```

---

## How to Use Environment Variables

### Local Development

1. **Create .env file:**
   ```bash
   cp backend/.env.example backend/.env
   ```

2. **Edit with values:**
   ```
   MONGO_URL=mongodb://localhost:27017
   DB_NAME=restaurant_db
   ENVIRONMENT=development
   ```

3. **Load automatically:**
   ```python
   from dotenv import load_dotenv
   load_dotenv()
   ```

4. **Access in code:**
   ```python
   import os
   mongo_url = os.getenv('MONGO_URL')
   db_name = os.getenv('DB_NAME')
   ```

### Render Deployment

1. **Settings → Environment:**
   ```
   Add variable → Name: MONGO_URL → Value: [paste]
   ```

2. **Render provides automatically:**
   - PORT (set by Render)
   - HOST (must be 0.0.0.0)

3. **Access in code (same as local):**
   ```python
   import os
   mongo_url = os.getenv('MONGO_URL')
   ```

### Vercel Deployment

1. **Project Settings → Environment Variables:**
   ```
   Variable name: REACT_APP_BACKEND_URL
   Value: https://api.restaurant-app.com
   ```

2. **Available in build & runtime:**
   ```javascript
   const apiUrl = process.env.REACT_APP_BACKEND_URL;
   ```

3. **Note:** Must start with `REACT_APP_` to be accessible in frontend

---

## Validation & Error Handling

### Backend Validation

```python
import os

# Essential variables
MONGO_URL = os.getenv('MONGO_URL')
if not MONGO_URL:
    raise ValueError("❌ MONGO_URL not set")

# Optional with defaults
ENVIRONMENT = os.getenv('ENVIRONMENT', 'development')
CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*').split(',')

# Validate production requirements
if ENVIRONMENT == 'production':
    required = ['MONGO_URL', 'RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET']
    missing = [v for v in required if not os.getenv(v)]
    if missing:
        raise ValueError(f"Missing in production: {missing}")
```

### Frontend Validation

```javascript
// Check required variables at build time
const requiredEnv = ['REACT_APP_BACKEND_URL'];
requiredEnv.forEach(envVar => {
    if (!process.env[envVar]) {
        console.error(`❌ Missing environment variable: ${envVar}`);
    }
});

// Validate URL format
const url = new URL(process.env.REACT_APP_BACKEND_URL);
if (!url.protocol.startsWith('http')) {
    console.error('❌ REACT_APP_BACKEND_URL must be valid HTTP(S) URL');
}
```

---

## Troubleshooting Environment Variables

### Issue: "Cannot find environment variable"

**Backend:**
```python
# ❌ Wrong
mongo_url = os.environ['MONGO_URL']  # Crashes if not set

# ✓ Correct
mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
```

**Frontend:**
```javascript
// ❌ Wrong
const url = process.env.API_URL;  // Must start with REACT_APP_

// ✓ Correct
const url = process.env.REACT_APP_BACKEND_URL;
```

### Issue: Environment variables not updating after change

**Solution:**
1. Verify variable is set correctly
2. Restart service:
   - Render: Auto-redeploys on env var change
   - Vercel: Must manually redeploy
3. Check deployment logs
4. Clear browser cache
5. Hard refresh (Ctrl+Shift+R)

### Issue: Different values in dev vs production

**Solution:**
1. Keep development .env local
2. Never commit .env to git
3. Set production vars in Render/Vercel, not code
4. Use .env.example as template
5. Document all variables

---

## Security Best Practices

### ✓ DO

- [ ] Use `.gitignore` to exclude `.env`
- [ ] Keep `.env.example` without secrets
- [ ] Use strong passwords (20+ characters)
- [ ] Rotate keys every 6 months
- [ ] Store in environment variables
- [ ] Log which variables are loaded
- [ ] Validate on startup
- [ ] Use different values per environment

### ❌ DON'T

- [ ] Commit `.env` to git
- [ ] Hardcode secrets
- [ ] Log sensitive values
- [ ] Use default passwords in production
- [ ] Share via email/Slack
- [ ] Use same value for all environments
- [ ] Store plaintext passwords
- [ ] Expose API keys in frontend

---

## Reference Tables

### Required Variables Summary

| Variable | Backend | Frontend | Required | Type |
|----------|---------|----------|----------|------|
| MONGO_URL | ✓ | | YES | string |
| DB_NAME | ✓ | | YES | string |
| ENVIRONMENT | ✓ | | YES | enum |
| CORS_ORIGINS | ✓ | | YES | string |
| RAZORPAY_KEY_ID | ✓ | | YES | string |
| RAZORPAY_KEY_SECRET | ✓ | | YES | string |
| ADMIN_PASSWORD | ✓ | | YES | string |
| REACT_APP_BACKEND_URL | | ✓ | YES | URL |

### Development vs Production

| Variable | Development | Production |
|----------|-------------|------------|
| MONGO_URL | mongodb://localhost:27017 | MongoDB Atlas URL |
| ENVIRONMENT | development | production |
| CORS_ORIGINS | http://localhost:3000 | https://domain.com |
| RAZORPAY_KEY_* | test keys (rzp_test_) | live keys (rzp_live_) |
| ADMIN_PASSWORD | default ok | MUST change |
| REACT_APP_BACKEND_URL | http://localhost:8000 | https://api.domain.com |

---

## Version History

- **v1.0** - Feb 27, 2026 - Initial documentation

---

**Last Updated:** Feb 27, 2026  
**Next Review:** May 27, 2026
