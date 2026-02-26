from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List
import razorpay
import os
import hmac
import hashlib
from datetime import datetime

router = APIRouter(prefix="/payment", tags=["payment"])

# Razorpay client
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")

client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)) if RAZORPAY_KEY_ID else None

# Database dependency
_db = None

def set_database(database):
    global _db
    _db = database


class CartItemPayment(BaseModel):
    item_name: str
    quantity: int
    price: float


class CreateRazorpayOrder(BaseModel):
    customer_name: str
    phone: str
    address: str
    landmark: str = ""
    cart_items: List[CartItemPayment]
    notes: str = ""
    order_type: str
    delivery_area: str


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    order_number: str


def calculate_delivery_charge(area: str, order_type: str) -> float:
    """Server-side delivery charge calculation"""
    if order_type == 'pickup':
        return 0.0
    
    area_lower = area.lower() if area else ''
    
    if 'srm' in area_lower or 'potheri' in area_lower:
        return 20.0
    elif 'guduvanchery' in area_lower:
        return 40.0
    else:
        return -1.0


@router.post("/create-razorpay-order")
async def create_razorpay_order(order_data: CreateRazorpayOrder):
    """Create Razorpay order with server-side validation"""
    if not client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Payment gateway not configured. Please contact restaurant."
        )
    
    try:
        # Server-side calculation
        subtotal = sum(item.price * item.quantity for item in order_data.cart_items)
        delivery_charge = calculate_delivery_charge(order_data.delivery_area, order_data.order_type)
        
        if delivery_charge < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Delivery not available in your area"
            )
        
        total = subtotal + delivery_charge
        
        # Minimum order check
        min_order = 199.0 if order_data.order_type == 'delivery' else 0.0
        if subtotal < min_order:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Minimum order amount is ₹{min_order}"
            )
        
        # Create order in database first
        db = _db
        orders_collection = db.orders
        
        import uuid
        order_id = str(uuid.uuid4())
        timestamp = datetime.utcnow().strftime("%Y%m%d")
        random_suffix = str(uuid.uuid4())[:6].upper()
        order_number = f"ORD-{timestamp}-{random_suffix}"
        
        order_dict = {
            "id": order_id,
            "order_number": order_number,
            "customer_name": order_data.customer_name,
            "phone": order_data.phone,
            "address": order_data.address,
            "landmark": order_data.landmark,
            "items": ", ".join([f"{item.quantity}x {item.item_name}" for item in order_data.cart_items]),
            "cart_items": [{"item_name": item.item_name, "quantity": item.quantity, "price": item.price, "subtotal": item.price * item.quantity} for item in order_data.cart_items],
            "notes": order_data.notes,
            "order_type": order_data.order_type,
            "delivery_area": order_data.delivery_area,
            "delivery_charge": delivery_charge,
            "subtotal": subtotal,
            "total": total,
            "payment_method": "razorpay",
            "payment_status": "pending",
            "status": "pending",
            "estimated_delivery_time": "45-60 minutes",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Create Razorpay order
        amount_paise = int(total * 100)
        razorpay_order = client.order.create({
            "amount": amount_paise,
            "currency": "INR",
            "receipt": order_number,
            "payment_capture": 1
        })
        
        # Update order with razorpay_order_id
        order_dict["razorpay_order_id"] = razorpay_order["id"]
        
        await orders_collection.insert_one(order_dict)
        
        return {
            "razorpay_order_id": razorpay_order["id"],
            "order_number": order_number,
            "amount": total,
            "currency": "INR",
            "key_id": RAZORPAY_KEY_ID
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create order: {str(e)}"
        )


@router.post("/verify-payment")
async def verify_payment(verification: VerifyPaymentRequest):
    """Verify Razorpay payment and update order"""
    if not client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Payment gateway not configured"
        )
    
    try:
        # Verify signature
        generated_signature = hmac.new(
            RAZORPAY_KEY_SECRET.encode(),
            f"{verification.razorpay_order_id}|{verification.razorpay_payment_id}".encode(),
            hashlib.sha256
        ).hexdigest()
        
        db = _db
        orders_collection = db.orders
        
        if generated_signature != verification.razorpay_signature:
            # Mark as failed
            await orders_collection.update_one(
                {"order_number": verification.order_number},
                {"$set": {"payment_status": "failed", "updated_at": datetime.utcnow()}}
            )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid payment signature"
            )
        
        # Update order as paid
        result = await orders_collection.update_one(
            {"order_number": verification.order_number},
            {
                "$set": {
                    "payment_status": "paid",
                    "razorpay_payment_id": verification.razorpay_payment_id,
                    "status": "pending",
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )
        
        return {"status": "success", "message": "Payment verified successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Payment verification failed: {str(e)}"
        )
