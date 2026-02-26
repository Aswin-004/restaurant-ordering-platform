# Classic Restaurant Website - Product Requirements Document

## Original Problem Statement
Create a high-converting, modern restaurant website for Classic Restaurant in Potheri (near SRM University) to increase dine-in traffic, takeaway orders, and online presence.

**Business Details:**
- Location: 29, Pillayar Koil Street, Potheri, Chennai 603203
- Contact: +918056070976
- Timings: 11:00 AM – 11:00 PM (All days)
- Cuisine: North Indian, Chinese, Seafood, Biryani, Pasta, Fast Food
- Avg Cost: ₹500 for two | Rating: 4.0 ★ (62+ reviews)

**User Choices:**
1. Color Scheme: Maroon (#8B0000), Gold (#D4AF37), Cream (#FFF8DC)
2. Images: Stock food images + actual menu photos provided
3. Features: Google Maps, WhatsApp (+918056070976), Phone integration, Online ordering from site
4. Development: Full-stack with menu management backend
5. Menu: Actual menu items from restaurant

## Architecture & Tech Stack
- Frontend: React + Tailwind CSS + Shadcn UI
- Backend: FastAPI + Python
- Database: MongoDB
- Deployment: Emergent Cloud Platform

## What's Been Implemented (December 26, 2025)

### ✅ Frontend (Completed)
**Components Created:**
1. **Header.jsx** - Sticky navigation with phone number, responsive menu
2. **Hero.jsx** - Hero section with restaurant interior image, rating badge, CTAs, urgency banner
3. **BestSellers.jsx** - 4 signature dishes with images, prices, order buttons, student combo banner
4. **WhyChooseUs.jsx** - 6 reasons with icons (affordable, location, vegetarian-friendly, quick service, clean, digital payments)
5. **Reviews.jsx** - 4 customer testimonials with avatars and ratings
6. **Menu.jsx** - Full menu with 5 categories (Biryani, Tandoori, Chinese, Roti/Naan, Pasta), searchable, accordion-style
7. **Gallery.jsx** - 6 images (food + ambience) with hover effects
8. **Location.jsx** - Google Maps embed, address cards, timings, contact info, Get Directions button
9. **OrderSection.jsx** - 3 order options (Online, Call, WhatsApp) with dialog for online ordering
10. **Footer.jsx** - Complete footer with links, contact, hours, social media
11. **FloatingButtons.jsx** - WhatsApp floating button, scroll-to-top, mobile sticky order button

**Features Implemented:**
- ✅ Maroon/Gold/Cream color scheme
- ✅ Conversion-optimized design with multiple CTAs
- ✅ Urgency triggers ("Hungry? We're Open Now!")
- ✅ Social proof (ratings, reviews)
- ✅ Mobile-first responsive design
- ✅ WhatsApp integration for quick orders
- ✅ Call-to-action buttons throughout
- ✅ Student-focused messaging
- ✅ Google Maps integration
- ✅ Smooth scroll navigation
- ✅ Professional food photography
- ✅ Search functionality in menu
- ✅ Mock online ordering form (frontend only)

### 📊 Current Status
- Frontend: 100% Complete (Mock data)
- Backend: Not started
- Database: Not started
- Integration: Not started

## Prioritized Backlog

### P0 Features (Backend Development - Next Phase)
1. **Order Management System**
   - Order model (customer info, items, status, timestamp)
   - POST /api/orders - Create new order
   - GET /api/orders - List all orders (admin)
   - GET /api/orders/{id} - Get order details
   - PATCH /api/orders/{id}/status - Update order status
   - Real-time order notifications

2. **Menu Management**
   - Menu model (category, item name, price, availability, image)
   - GET /api/menu - Fetch full menu
   - POST /api/menu - Add menu item (admin)
   - PATCH /api/menu/{id} - Update menu item (admin)
   - DELETE /api/menu/{id} - Remove item (admin)
   - Availability toggle

3. **Admin Dashboard**
   - Basic authentication for admin
   - View incoming orders
   - Update order status
   - Manage menu items
   - View customer contact info

4. **Frontend-Backend Integration**
   - Replace mock data with API calls
   - Order submission to backend
   - Real menu data fetching
   - Error handling & loading states
   - Success confirmations

### P1 Features (Enhancements)
1. WhatsApp Business API integration for automated messages
2. SMS notifications for order confirmations
3. Table reservation system
4. Customer reviews submission system
5. Image upload for menu items
6. Special offers/promotions management
7. Analytics dashboard (orders, popular items, revenue)

### P2 Features (Future)
1. Payment gateway integration (Razorpay/Stripe)
2. Loyalty program/points system
3. Order tracking with real-time updates
4. Push notifications
5. Multi-language support (Tamil/English)
6. Delivery partner integration
7. Customer accounts with order history

## API Contracts (To Be Implemented)

### Orders API
```
POST /api/orders
Request: { name, phone, address, items, notes, orderType }
Response: { orderId, status, estimatedTime }

GET /api/orders
Response: [{ orderId, customer, items, status, timestamp }]

PATCH /api/orders/{id}/status
Request: { status: "pending" | "confirmed" | "preparing" | "ready" | "delivered" }
```

### Menu API
```
GET /api/menu
Response: { categories: [{ name, items: [{ name, price, available, image }] }] }

POST /api/menu
Request: { category, name, price, image }

PATCH /api/menu/{id}
Request: { price?, available?, image? }
```

## Next Tasks
1. Create MongoDB models for Orders and Menu
2. Implement FastAPI endpoints for order management
3. Implement menu management endpoints
4. Add basic admin authentication
5. Integrate frontend with backend APIs
6. Remove mock data from frontend
7. Test end-to-end order flow
8. Add error handling and validations
9. Deploy and test on production
10. SEO optimization (meta tags, structured data)
