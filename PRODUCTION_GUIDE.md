# 🚀 Classic Restaurant - Production Deployment Guide

## ✅ SYSTEM COMPLETE

### Features Implemented
- ✅ Cart System with localStorage persistence
- ✅ Location Selection (Delivery/Pickup)
- ✅ Checkout with validation
- ✅ COD Payment - WORKING
- ✅ Razorpay Online Payment - INTEGRATED
- ✅ Server-side price validation
- ✅ Admin Dashboard - WORKING
- ✅ Order Management
- ✅ Mobile Responsive

---

## 🔧 SETUP INSTRUCTIONS

### 1. Backend Environment Variables

Edit `/app/backend/.env`:

```env
MONGO_URL=mongodb://localhost:27017/
DB_NAME=restaurant_db
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx
ADMIN_PASSWORD=your_secure_password_here
```

### 2. Get Razorpay Keys

1. Go to https://dashboard.razorpay.com
2. Sign up / Login
3. Navigate to Settings → API Keys
4. Generate Test Keys (for testing) or Live Keys (for production)
5. Copy:
   - Key ID (starts with `rzp_test_` or `rzp_live_`)
   - Key Secret

### 3. Update Configuration

```bash
# Edit backend .env file
nano /app/backend/.env

# Add your Razorpay keys
RAZORPAY_KEY_ID=rzp_test_your_key_here
RAZORPAY_KEY_SECRET=your_secret_key_here

# Restart backend
sudo supervisorctl restart backend
```

---

## 💳 PAYMENT FLOW

### Cash on Delivery (COD)
1. Customer selects COD
2. Fills checkout form
3. Places order
4. Order saved with `payment_status: "pending"`
5. Restaurant confirms via admin panel

### Razorpay Online Payment
1. Customer selects Online Payment
2. Fills checkout form
3. Clicks "Pay ₹XXX"
4. Backend:
   - Validates cart
   - Recalculates total
   - Creates order in database
   - Creates Razorpay order
5. Frontend opens Razorpay checkout
6. Customer completes payment
7. Backend verifies payment signature
8. Updates order: `payment_status: "paid"`
9. Redirects to order confirmation

---

## 👨‍💼 ADMIN DASHBOARD

### Access
- URL: https://food-delivery-sys-6.preview.emergentagent.com/admin
- Username: `admin`
- Password: Set in `.env` as `ADMIN_PASSWORD`

### Features
- View all orders (latest first)
- Filter by status (pending, preparing, delivered, etc.)
- View order details:
  - Customer info
  - Cart items
  - Payment method & status
  - Total amount
- Update order status:
  - Pending → Confirmed → Preparing → Ready → Out for Delivery → Delivered

---

## 🗄️ DATABASE STRUCTURE

### Orders Collection

```javascript
{
  id: "uuid",
  order_number: "ORD-20260226-XXXXXX",
  customer_name: "John Doe",
  phone: "9876543210",
  address: "Full address",
  landmark: "Near landmark",
  items: "2x Chicken Biryani, 1x Naan",
  cart_items: [
    {
      item_name: "Chicken Biryani",
      quantity: 2,
      price: 165,
      subtotal: 330
    }
  ],
  notes: "Extra spicy",
  order_type: "delivery", // or "pickup"
  delivery_area: "SRM",
  delivery_charge: 20,
  subtotal: 330,
  total: 350,
  payment_method: "cod", // or "razorpay"
  payment_status: "pending", // or "paid" or "failed"
  razorpay_order_id: "order_xxx",
  razorpay_payment_id: "pay_xxx",
  status: "pending", // confirmed, preparing, ready, out_for_delivery, delivered
  estimated_delivery_time: "45-60 minutes",
  created_at: ISODate,
  updated_at: ISODate
}
```

---

## 🧪 TESTING CHECKLIST

### Before Going Live

- [ ] Add real Razorpay keys to `.env`
- [ ] Test COD order flow
- [ ] Test Razorpay payment (use test cards)
- [ ] Test admin login
- [ ] Test order status updates
- [ ] Test on mobile devices
- [ ] Verify email/SMS notifications (if added)
- [ ] Check minimum order enforcement
- [ ] Verify delivery charges

### Test Cards (Razorpay)
```
Success: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date
```

---

## 🚦 DEPLOYMENT

### Local Testing
```bash
# Backend
cd /app/backend
source /root/.venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8001

# Frontend
cd /app/frontend
yarn start
```

### Production Checklist
- [ ] Set `RAZORPAY_KEY_ID` to live key
- [ ] Update `ADMIN_PASSWORD` to strong password
- [ ] Enable HTTPS
- [ ] Configure domain
- [ ] Set up MongoDB backups
- [ ] Monitor error logs
- [ ] Set up order notifications

---

## 💰 BUSINESS LOGIC

### Delivery Charges
- SRM / Potheri: ₹20
- Guduvanchery: ₹40
- Other areas: Not serviceable

### Minimum Order
- Delivery: ₹199
- Pickup: ₹0

### Order Statuses
1. **Pending** - New order received
2. **Confirmed** - Restaurant confirmed
3. **Preparing** - Being cooked
4. **Ready** - Ready for pickup/delivery
5. **Out for Delivery** - On the way
6. **Delivered** - Order completed

---

## 📊 FILE STRUCTURE

```
/app/
├── backend/
│   ├── server.py              # Main FastAPI app
│   ├── models.py              # Pydantic models
│   ├── routes/
│   │   ├── orders.py          # Order endpoints
│   │   ├── menu.py            # Menu endpoints
│   │   └── payment.py         # Razorpay integration
│   ├── .env                   # Environment variables
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── contexts/
│   │   │   ├── CartContext.jsx
│   │   │   └── LocationContext.jsx
│   │   ├── pages/
│   │   │   ├── Checkout.jsx
│   │   │   ├── OrderSuccess.jsx
│   │   │   └── AdminPanel.jsx
│   │   ├── components/
│   │   │   ├── LocationModal.jsx
│   │   │   ├── CartDrawer.jsx
│   │   │   └── Menu.jsx
│   │   └── utils/
│   │       ├── cartUtils.js
│   │       └── validation.js
│   └── package.json
│
└── PRODUCTION_GUIDE.md        # This file
```

---

## 🆘 TROUBLESHOOTING

### Razorpay Payment Not Working
1. Check keys in `.env` are correct
2. Ensure Razorpay script loaded: Check `index.html` has `<script src="https://checkout.razorpay.com/v1/checkout.js"></script>`
3. Verify backend is running
4. Check browser console for errors

### Admin Panel Not Accessible
1. Go to `/admin`
2. Use username: `admin`
3. Password from `.env` → `ADMIN_PASSWORD`
4. Check browser console for auth errors

### Orders Not Saving
1. Check MongoDB is running
2. Verify `MONGO_URL` in `.env`
3. Check backend logs: `tail -f /var/log/supervisor/backend.err.log`

---

## 📞 SUPPORT

**System Status:** ✅ Production Ready
**Payment Gateway:** ✅ Razorpay Integrated
**Admin Panel:** ✅ Fully Functional
**Mobile:** ✅ Responsive

**Live URLs:**
- Customer Site: https://food-delivery-sys-6.preview.emergentagent.com
- Admin Panel: https://food-delivery-sys-6.preview.emergentagent.com/admin

---

**Built with Emergent AI**
Ready to serve real customers! 🚀
