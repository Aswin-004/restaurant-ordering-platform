# Database-Based Admin Authentication System

## Overview

The admin authentication system has been **upgraded from environment-variable-based to MongoDB-based** with password hashing, JWT tokens, and change password capability.

### What Changed
✅ Admin credentials now stored in MongoDB (not hardcoded in .env)  
✅ Passwords hashed with bcrypt (not plain text)  
✅ JWT tokens with 1-hour expiry (more secure)  
✅ Change password feature available in admin panel  
✅ ADMIN_PASSWORD environment variable **no longer needed**

---

## Architecture Overview

```
Frontend (React)                Backend (FastAPI)              Database (MongoDB)
─────────────────              ────────────────               ──────────────────
Login Form
   ↓
POST /api/auth/login ────→ Check username/password          Query admins collection
   ←──── JWT Token ────────────── Hash verification ←────── Get password_hash
Store in localStorage           Bcrypt compare
   ↓
API Requests with
Bearer Token Header
   ↓
Authorization Header ────→ Verify Token (JWT) ────────→ No DB call needed
   ←──── Allow/Deny ────────────────────────────────→
```

---

## Database Schema

### Admins Collection

```javascript
{
  _id: ObjectId,
  username: string,              // e.g., "admin"
  password_hash: string,         // Bcrypt hash (never plaintext)
  created_at: datetime,
  updated_at: datetime
}
```

### Example Admin Document
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "username": "admin",
  "password_hash": "$2b$12$...", // Bcrypt hash
  "created_at": ISODate("2026-02-28T10:00:00Z"),
  "updated_at": ISODate("2026-02-28T10:00:00Z")
}
```

---

## Backend Implementation

### 1. New/Updated Files

#### `/backend/routes/auth.py` (NEW - COMPLETE REWRITE)
- `POST /api/auth/login` - Database-based login with bcrypt verification
- `POST /api/auth/change-password` - Change admin password (requires JWT)
- `GET /api/auth/verify` - Verify token validity
- `POST /api/auth/logout` - Logout (frontend reference)

#### `/backend/setup_admin.py` (NEW)
- Script to initialize admin user in MongoDB
- Supports CLI arguments and interactive mode
- Hashes passwords with bcrypt

#### `/backend/server.py` (MODIFIED)
- Updated to call `auth.set_database(db)`

#### `/backend/.env.example` (MODIFIED)
- Added: `JWT_SECRET` (required)
- Removed: `ADMIN_PASSWORD` (no longer used)

### 2. Key Functions

#### Password Hashing
```python
def hash_password(password: str) -> str:
    """Hash password using bcrypt (12 rounds)"""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode(), salt).decode()
```

#### Password Verification
```python
def verify_password(password: str, password_hash: str) -> bool:
    """Verify plain password against bcrypt hash"""
    return bcrypt.checkpw(password.encode(), password_hash.encode())
```

#### JWT Token Creation
```python
def create_access_token(username: str) -> str:
    """Create JWT token (1 hour expiry)"""
    expire = datetime.now(timezone.utc) + timedelta(hours=1)
    payload = {'username': username, 'exp': expire.isoformat()}
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")
```

---

## API Endpoints

### 1. Login (Public)

**POST** `/api/auth/login`

**Request:**
```json
{
  "username": "admin",
  "password": "YourPassword123!"
}
```

**Success Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "username": "admin",
  "message": "Welcome admin!",
  "expires_in": 3600
}
```

**Error Response (401):**
```json
{
  "detail": "Invalid credentials"
}
```

---

### 2. Change Password (Protected)

**POST** `/api/auth/change-password`

**Headers Required:**
```
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "old_password": "CurrentPassword123!",
  "new_password": "NewPassword456!"
}
```

**Success Response (200):**
```json
{
  "message": "Password changed successfully",
  "username": "admin"
}
```

**Error Responses:**
```json
// Old password incorrect
{
  "detail": "Old password is incorrect"
}

// New password too short
{
  "detail": "New password must be at least 8 characters long"
}

// New same as old
{
  "detail": "New password must be different from old password"
}

// Token expired
{
  "detail": "Token has expired",
  "headers": {"WWW-Authenticate": "Bearer"}
}
```

---

### 3. Verify Token (Protected)

**GET** `/api/auth/verify`

**Headers Required:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "authenticated": true,
  "username": "admin",
  "message": "Token is valid"
}
```

---

### 4. Logout (Protected)

**POST** `/api/auth/logout`

**Headers Required:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "Logged out successfully",
  "username": "admin"
}
```

---

## Setup Instructions

### Step 1: Install Dependencies
Already installed - verify in `backend/requirements.txt`:
- `bcrypt==4.1.3` ✅
- `pyjwt>=2.10.1` ✅

### Step 2: Set JWT_SECRET in .env

Generate a secure random secret:
```bash
# Using Python
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Example output:
# j7Q9_KpX2mN8yL3vB6wA1cD4eF5gH9jK

# Add to backend/.env:
JWT_SECRET=j7Q9_KpX2mN8yL3vB6wA1cD4eF5gH9jK
```

**DO NOT use the default value in production!**

### Step 3: Initialize Admin in MongoDB

**Interactive Mode:**
```bash
cd backend
python setup_admin.py

# Follow prompts:
# Enter password for 'admin': 
# Confirm password:
```

**CLI Mode:**
```bash
python setup_admin.py --username admin --password "YourSecurePassword123!"
```

**With Different Username:**
```bash
python setup_admin.py --username superadmin --password "MyPassword456!"
```

**Output Example:**
```
📝 Admin Setup
========================================
🔗 Connecting to MongoDB...
✅ Connected to database: restaurant_db

🔐 Hashing password...
✅ Admin user 'admin' created successfully
   Admin ID: 507f1f77bcf86cd799439011
✅ Admin verified in database
   Username: admin
   Created: 2026-02-28 10:00:00+00:00
   Updated: 2026-02-28 10:00:00+00:00

📊 Total admins in database: 1

✅ Setup completed successfully!
```

---

## Frontend Implementation

### AdminPanel.jsx Changes

#### 1. **JWT Storage**
```javascript
// On login success:
localStorage.setItem('admin_token', response.data.access_token);

// On logout:
localStorage.removeItem('admin_token');
```

#### 2. **Authorization Headers**
```javascript
const getAuthHeaders = () => {
  const token = localStorage.getItem('admin_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};
```

#### 3. **API Calls**
```javascript
// Before:
await axios.get(`${API}/orders`);

// After:
await axios.get(`${API}/orders`, {
  headers: getAuthHeaders()
});
```

#### 4. **Change Password Form**
- New "Change Password" button in admin header
- Modal form with:
  - Current password
  - New password  
  - Confirm password
- Validation before submission
- Success/error toast messages

#### 5. **Token Verification on Load**
```javascript
useEffect(() => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    verifyToken(token);
  }
}, []);
```

---

## Security Features

### ✅ What's Secure

1. **Password Hashing**
   - Bcrypt with 12 rounds (slow + salted)
   - Passwords never stored in plaintext
   - Impossible to reverse-engineer original password

2. **JWT Authentication**
   - Token-based, not session-based
   - Short expiry (1 hour)
   - Signed with secret key
   - Frontend can't modify token

3. **Authorization Headers**
   - Every protected request must include valid Bearer token
   - Token verified on server for each request
   - Invalid/expired tokens rejected immediately

4. **Environment Secrets**
   - JWT_SECRET stored in environment variable
   - Never hardcoded in source
   - Different per environment (dev/staging/prod)

5. **Password Validation**
   - Minimum 8 characters for changes
   - Can't reuse same password
   - Old password required to change

### ⚠️ Important Security Notes

**Before Production Deployment:**

1. Generate a secure JWT_SECRET:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```
Set it in Render environment variables as `JWT_SECRET`

2. Set a strong admin password:
```bash
python backend/setup_admin.py --username admin --password "YourVerySecurePassword123!@#"
```

3. Use HTTPS in production (Render provides this)

4. Token stored in localStorage (secure for React apps)
   - Can also use httpOnly cookies for additional security
   - Current implementation is standard for SPAs

5. Audit logs (optional enhancement):
   - Log successful/failed login attempts
   - Log password changes
   - Log admin actions

---

## Testing

### Local Testing

1. **Start Backend:**
```bash
cd backend
python server.py
```

2. **Initialize Admin:**
```bash
python setup_admin.py --password "TestPassword123!"
```

3. **Test with curl:**

Login:
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "TestPassword123!"
  }'
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "username": "admin",
  "message": "Welcome admin!",
  "expires_in": 3600
}
```

Change Password:
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X POST "http://localhost:8000/api/auth/change-password" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "old_password": "TestPassword123!",
    "new_password": "NewPassword456!"
  }'
```

4. **Test Frontend:**
```bash
cd frontend
npm start

# Visit http://localhost:3000/admin
# Login with admin/TestPassword123!
# Click "Change Password"
# Enter old and new password
```

---

## Production Deployment

### Render Backend

1. **Environment Variables** (Add in Render Dashboard):
```
MONGO_URL=mongodb+srv://...
DB_NAME=restaurant_db
ENVIRONMENT=production
CORS_ORIGINS=https://your-app.vercel.app
JWT_SECRET=<generate-secure-key>
```

2. **Initialize Admin:**
```bash
# Run locally first, then on Render:
python backend/setup_admin.py --username admin --password "ProductionPassword123!@#"
```

3. **Verify Deployment:**
```bash
curl -X POST "https://your-api.onrender.com/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "ProductionPassword123!@#"
  }'
```

### Vercel Frontend

1. **Environment Variables:**
   - `REACT_APP_BACKEND_URL=https://your-api.onrender.com`

2. **No code changes needed** - frontend code is production-ready

3. **Browser localStorage** stores JWT token securely

---

## Migration Checklist

- [ ] Update backend/.env with JWT_SECRET
- [ ] Run `python setup_admin.py` to initialize admin
- [ ] Verify previous ADMIN_PASSWORD is removed from .env
- [ ] Test login locally with new credentials
- [ ] Test change password feature
- [ ] Verify all admin endpoints require JWT token
- [ ] Deploy backend to Render with JWT_SECRET
- [ ] Deploy frontend to Vercel
- [ ] Test full login flow in production
- [ ] Change admin password after first login (production)

---

## Troubleshooting

### Login fails with "Invalid credentials"
- Verify admin exists: Check MongoDB `admins` collection
- Verify password matches: Use `setup_admin.py` to reset
- Check MONGO_URL connection string

### Token expired after login
- Normal - token expires after 1 hour
- Frontend will show 401 error with "Token has expired"
- User must login again
- To increase expiry: Change `TOKEN_EXPIRE_HOURS = 1` in auth.py

### CORS error on login
- Verify `CORS_ORIGINS` includes frontend URL
- For development: `CORS_ORIGINS=http://localhost:3000`
- For production: `CORS_ORIGINS=https://your-vercel-app.com`

### JWT_SECRET not found
- Must be set in environment
- Cannot use default value in production
- Generate with: `python -c "import secrets; print(secrets.token_urlsafe(32))"`

### Change password returns "Old password is incorrect"
- Verify old password is entered correctly
- Check caps lock
- Use `setup_admin.py` to reset if forgotten

---

## Files Modified/Created

| File | Change | Reason |
|------|--------|--------|
| `backend/routes/auth.py` | Complete rewrite | Database-based with bcrypt |
| `backend/routes/admin.py` | Updated imports | Uses new auth module |
| `backend/server.py` | Add `auth.set_database()` | Inject database connection |
| `backend/setup_admin.py` | NEW | Initialize admin in MongoDB |
| `backend/.env.example` | Updated | Add JWT_SECRET, remove ADMIN_PASSWORD |
| `frontend/src/pages/AdminPanel.jsx` | Major updates | JWT storage, change password form |

---

## Environment Variables

### Required (Production)
- `JWT_SECRET` - Secure random key (minimum 32 chars)
- `MONGO_URL` - MongoDB Atlas connection
- `DB_NAME` - Database name

### Optional
- `TOKEN_EXPIRE_HOURS` - JWT expiry time (default: 1)
- `CORS_ORIGINS` - Allowed frontend origins

---

## Summary

✅ **Migration Complete**
- Admin authentication now uses MongoDB + bcrypt
- JWT tokens replace environment variable passwords
- Change password feature available
- Production-ready security implementation
- No more hardcoded admin passwords

🚀 **Ready to Deploy**
- Backend: Deploy to Render with JWT_SECRET
- Frontend: Deploy to Vercel (no changes needed)
- Initialize admin with `setup_admin.py`

