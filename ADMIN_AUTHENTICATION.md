# Admin Authentication System - Complete Setup Guide

## Overview

Your backend now has a **complete JWT-based authentication system** for admin access. The admin password is now properly read from the `ADMIN_PASSWORD` environment variable and used to validate login requests.

---

## Files Added/Modified

### New Files:
1. **`backend/routes/auth.py`** - Authentication logic (login, token verification, logout)
2. **`backend/routes/admin.py`** - Protected admin endpoints

### Modified Files:
1. **`backend/server.py`** - Added auth and admin route imports

---

## How It Works

### Endpoints Created:

#### 1. **Login Endpoint** (Public)
```
POST /api/auth/login
```
**Request Body:**
```json
{
  "username": "admin",
  "password": "classic@admin2026"
}
```

**Successful Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "username": "admin",
  "message": "Welcome admin! Token valid for 24 hours."
}
```

**Failed Response (401):**
```json
{
  "detail": "Invalid credentials"
}
```

---

#### 2. **Verify Token Endpoint** (Protected)
```
GET /api/auth/verify
Authorization: Bearer <access_token>
```

**Successful Response (200):**
```json
{
  "authenticated": true,
  "username": "admin",
  "message": "Token is valid"
}
```

---

#### 3. **Admin Dashboard Endpoint** (Protected)
```
GET /api/admin/dashboard
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "total_orders": 42,
  "pending_orders": 5,
  "completed_orders": 37,
  "total_revenue": 12500.50,
  "menu_items_count": 25
}
```

---

#### 4. **Get All Orders** (Protected)
```
GET /api/admin/orders?status_filter=pending
Authorization: Bearer <access_token>
```

---

#### 5. **Update Order Status** (Protected)
```
PUT /api/admin/orders/{order_id}/status
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "preparing",
  "notes": "order is being prepared"
}
```

---

#### 6. **Menu Statistics** (Protected)
```
GET /api/admin/menu/stats
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "total_items": 25,
  "available_items": 23,
  "unavailable_items": 2,
  "categories": ["appetizers", "mains", "desserts"]
}
```

---

#### 7. **Admin Health Check** (Protected)
```
POST /api/admin/health
Authorization: Bearer <access_token>
```

---

## Setup Instructions

### Local Development

1. **Check `.env` file** has the password:
```env
ADMIN_PASSWORD=classic@admin2026
```

2. **Test Login with cURL:**
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "classic@admin2026"
  }'
```

3. **Use the token** for protected endpoints:
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET "http://localhost:8000/api/admin/dashboard" \
  -H "Authorization: Bearer $TOKEN"
```

---

### Production Deployment (Render)

1. **In Render Dashboard:**
   - Go to Environment Variables
   - Add: `ADMIN_PASSWORD=your_secure_password_here`

2. **Use HTTPS Bearer Token:**
```bash
TOKEN="..."
curl -X GET "https://your-api.onrender.com/api/admin/dashboard" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Security Notes

✅ **What's Secure:**
- Password is stored in environment variables (not in code)
- JWT tokens expire after 24 hours
- All admin endpoints require valid token
- No passwords logged or exposed
- CORS handles cross-origin requests safely

⚠️ **Change Security Items:**
- Change `ADMIN_PASSWORD` from `classic@admin2026` to something secure (20+ characters with uppercase, lowercase, numbers, special chars)
- Change `SECRET_KEY` in production to a random value:
  ```bash
  python -c "import secrets; print(secrets.token_urlsafe(32))"
  ```

---

## Frontend Integration

### Using Login Endpoint:

```javascript
// Frontend: Login
async function adminLogin(password) {
  const response = await fetch('http://localhost:8000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'admin',
      password: password
    })
  });

  const data = await response.json();
  localStorage.setItem('adminToken', data.access_token);
  return data;
}

// Frontend: Protected Request
async function getDashboard() {
  const token = localStorage.getItem('adminToken');
  
  const response = await fetch('http://localhost:8000/api/admin/dashboard', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  return await response.json();
}
```

---

## Password Setup For Deployment

### Option A: Keep Simple (Testing)
Use the default: `ADMIN_PASSWORD=classic@admin2026`

### Option B: Generate Secure Password
```bash
# Linux/Mac
openssl rand -base64 20

# PowerShell (Windows)
[System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Random -SetSeed (Get-Random) -Minimum 100000000 -Maximum 999999999).ToString())) | ForEach-Object { $_ + (Get-Random -SetSeed (Get-Random) -Minimum 100000000 -Maximum 999999999) }

# Simple approach: MyRestaurant2026!@#Secure
```

### Where to Set:
- **Local:** `backend/.env` → `ADMIN_PASSWORD=...`
- **Render:** Environment Variables page
- **Vercel:** Not needed (frontend doesn't store passwords)

---

## Testing Checklist

- [ ] Backend starts without errors
- [ ] Login endpoint returns valid JWT token
- [ ] Token works for protected endpoints
- [ ] Wrong password returns 401
- [ ] Expired token returns 401
- [ ] Dashboard shows correct statistics
- [ ] Order status updates work
- [ ] Admin logs are recorded

---

## Architecture

```
Request Flow:
1. Frontend → POST /api/auth/login (username, password)
2. Backend → Validates credentials against ADMIN_PASSWORD env var
3. Backend → Issues JWT token valid for 24 hours
4. Frontend → Stores token in localStorage
5. Frontend → All admin requests include: Authorization: Bearer <token>
6. Backend → Verifies token on each protected endpoint
7. Backend → Returns 401 if token invalid/expired
```

---

## Troubleshooting

**Error: "Invalid token"**
- Token might be expired (24 hour limit)
- Solution: Re-login to get new token

**Error: "Invalid credentials"**
- Username must be: `admin`
- Password must match `ADMIN_PASSWORD` environment variable
- Check `.env` file is loaded

**Error: "Missing authorization header"**
- Protected endpoints require Authorization header
- Format: `Authorization: Bearer <token>`

**Port already in use (8000)**
- Previous process still running
- Kill it: `taskkill /F /IM python.exe` (Windows) or `kill -9 $(lsof -t -i:8000)` (Mac/Linux)

---

## Next Steps

1. ✅ Admin authentication system is now active
2. Test with frontend login form
3. Integrate with React admin panel component
4. Deploy to Render with ADMIN_PASSWORD environment variable
5. Set custom admin password in production
6. Test all admin endpoints in production

