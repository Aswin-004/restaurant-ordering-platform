from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
import razorpay
import os
import hmac
import hashlib

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


class CreatePaymentOrder(BaseModel):
    amount: float
    currency: str = "INR"
    order_id: str


class VerifyPayment(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    order_id: str


@router.post("/create-order")
async def create_payment_order(payment_data: CreatePaymentOrder):
    """Create Razorpay order"""
    if not client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Razorpay not configured"
        )
    
    try:
        # Amount in paise (multiply by 100)
        amount_paise = int(payment_data.amount * 100)
        
        razorpay_order = client.order.create({
            "amount": amount_paise,
            "currency": payment_data.currency,
            "receipt": payment_data.order_id,
            "payment_capture": 1
        })
        
        return {
            "razorpay_order_id": razorpay_order["id"],
            "amount": payment_data.amount,
            "currency": payment_data.currency,
            "key_id": RAZORPAY_KEY_ID
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create payment order: {str(e)}"
        )


@router.post("/verify")
async def verify_payment(verification: VerifyPayment):
    """Verify Razorpay payment signature"""
    if not client:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Razorpay not configured"
        )
    
    try:
        # Verify signature
        generated_signature = hmac.new(
            RAZORPAY_KEY_SECRET.encode(),
            f"{verification.razorpay_order_id}|{verification.razorpay_payment_id}".encode(),
            hashlib.sha256
        ).hexdigest()
        
        if generated_signature != verification.razorpay_signature:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid payment signature"
            )
        
        # Update order in database
        db = _db
        orders_collection = db.orders
        
        await orders_collection.update_one(
            {"order_number": verification.order_id},
            {
                "$set": {
                    "payment_status": "paid",
                    "payment_method": "razorpay",
                    "razorpay_order_id": verification.razorpay_order_id,
                    "razorpay_payment_id": verification.razorpay_payment_id
                }
            }
        )
        
        return {"status": "success", "message": "Payment verified successfully"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Payment verification failed: {str(e)}"
        )
