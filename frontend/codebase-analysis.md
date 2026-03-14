# Restaurant Ordering System — Codebase Analysis

---

## Backend Orders API

- **Route file:** backend/routes/orders.py
- **Order endpoints (from router prefix and code):**
  - POST /orders — Create order (response model: OrderResponse)
  - Likely additional endpoints for status update, tracking, and fetching orders (see OrderStatusUpdate, OrderResponse usage).
- **Fetch order by order number/ID:**
  - The router uses /orders prefix. Based on typical FastAPI patterns and the presence of OrderResponse, there is likely a GET /orders/{order_number} or similar endpoint.
- **Request format (OrderCreate):**

```json
{
  "customer_name": "John Doe",
  "phone": "9876543210",
  "address": "123 Main St",
  "landmark": "Near Park",
  "items": "2x Biryani, 1x Noodles",
  "cart_items": [
    { "item_name": "Biryani", "quantity": 2, "price": 190, "subtotal": 380 },
    { "item_name": "Noodles", "quantity": 1, "price": 150, "subtotal": 150 }
  ],
  "notes": "No onions",
  "order_type": "delivery"
}
```

- **Example response (OrderResponse):**

```json
{
  "id": "abc123",
  "order_number": "ORD-20260313-ABCDEF",
  "customer_name": "John Doe",
  "phone": "9876543210",
  "address": "123 Main St",
  "landmark": "Near Park",
  "items": "2x Biryani, 1x Noodles",
  "cart_items": [
    { "item_name": "Biryani", "quantity": 2, "price": 190, "subtotal": 380 },
    { "item_name": "Noodles", "quantity": 1, "price": 150, "subtotal": 150 }
  ],
  "notes": "No onions",
  "order_type": "delivery",
  "delivery_area": "Potheri",
  "delivery_charge": 20,
  "subtotal": 530,
  "total": 550,
  "status": "pending",
  "payment_method": "cod",
  "payment_status": "pending",
  "estimated_time": "30-40 minutes",
  "estimated_delivery_time": "45-60 minutes",
  "created_at": "2026-03-13T12:00:00",
  "updated_at": "2026-03-13T12:05:00"
}
```

---

## Order Status Values

- **Defined in:** backend/models.py, class OrderStatus
- **Possible values:**
  - pending
  - confirmed
  - preparing
  - ready
  - out_for_delivery
  - delivered
  - completed
  - cancelled

---

## Navbar Component

- **File path:** frontend/src/components/Header.jsx
- **Description:**
  - The Header component manages top navigation.
  - Navigation links are defined in the navItems array:
    - Home, Menu, About, Location
  - Uses scroll-to-section for homepage, and navigate('/') for other pages.
  - Responsive design with mobile menu toggle.

---

## Tailwind Theme

- **File path:** frontend/tailwind.config.js
- **Color palette:**
  - Custom brand colors:
    - DEFAULT: #b30000
    - dark: #8B0000
    - light: #d43d3d
    - 50: #fff1f1
    - 100: #ffe0e0
    - 600: #b30000
    - 700: #8B0000
    - 800: #6B0000
    - 900: #4a0000
  - Other custom colors: gold, cream, background, foreground, card

---

## Sample Order Object

- **Schema:** backend/models.py, class OrderResponse
- **Example:**

```json
{
  "id": "abc123",
  "order_number": "ORD-20260313-ABCDEF",
  "customer_name": "John Doe",
  "phone": "9876543210",
  "address": "123 Main St",
  "landmark": "Near Park",
  "items": "2x Biryani, 1x Noodles",
  "cart_items": [
    { "item_name": "Biryani", "quantity": 2, "price": 190, "subtotal": 380 },
    { "item_name": "Noodles", "quantity": 1, "price": 150, "subtotal": 150 }
  ],
  "notes": "No onions",
  "order_type": "delivery",
  "delivery_area": "Potheri",
  "delivery_charge": 20,
  "subtotal": 530,
  "total": 550,
  "status": "pending",
  "payment_method": "cod",
  "payment_status": "pending",
  "estimated_time": "30-40 minutes",
  "estimated_delivery_time": "45-60 minutes",
  "created_at": "2026-03-13T12:00:00",
  "updated_at": "2026-03-13T12:05:00"
}
```

---

Let me know if you need deeper code samples or further breakdowns.
