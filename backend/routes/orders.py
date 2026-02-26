from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from models import (
    OrderCreate,
    OrderResponse,
    OrderStatusUpdate,
    OrderStatus,
    CartItem
)
from datetime import datetime
import uuid

router = APIRouter(prefix="/orders", tags=["orders"])

# Database dependency will be injected
_db = None

def set_database(database):
    global _db
    _db = database

def get_db():
    return _db


def generate_order_number():
    """Generate a unique order number"""
    timestamp = datetime.utcnow().strftime("%Y%m%d")
    random_suffix = str(uuid.uuid4())[:6].upper()
    return f"ORD-{timestamp}-{random_suffix}"


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
        # Area not serviceable
        return -1.0


def validate_order_data(order: OrderCreate) -> dict:
    """
    Server-side order validation and calculation
    Returns: dict with validated data or raises HTTPException
    """
    errors = []
    
    # Validate cart items exist
    if not order.cart_items or len(order.cart_items) == 0:
        errors.append("Cart is empty")
    
    # Recalculate subtotal from cart items
    calculated_subtotal = 0.0
    for item in order.cart_items:
        if item.quantity <= 0:
            errors.append(f"Invalid quantity for {item.item_name}")
        if item.price < 0:
            errors.append(f"Invalid price for {item.item_name}")
        
        # Recalculate item subtotal
        item.subtotal = item.price * item.quantity
        calculated_subtotal += item.subtotal
    
    # Validate customer details
    if not order.customer_name or len(order.customer_name.strip()) < 2:
        errors.append("Invalid customer name")
    
    if not order.phone or len(order.phone.replace(" ", "").replace("-", "")) < 10:
        errors.append("Invalid phone number")
    
    # Validate delivery details
    if order.order_type == 'delivery':
        if not order.address or len(order.address.strip()) < 10:
            errors.append("Invalid delivery address")
        if not order.delivery_area:
            errors.append("Delivery area is required")
    
    # Recalculate delivery charge
    calculated_delivery_charge = calculate_delivery_charge(
        order.delivery_area or '',
        order.order_type
    )
    
    if calculated_delivery_charge < 0:
        errors.append("Delivery not available in your area")
    
    # Calculate total
    calculated_total = calculated_subtotal + calculated_delivery_charge
    
    # Validate minimum order
    min_order = 199.0 if order.order_type == 'delivery' else 0.0
    if calculated_subtotal < min_order:
        errors.append(f"Minimum order amount is ₹{min_order}")
    
    if errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"message": "Order validation failed", "errors": errors}
        )
    
    return {
        "subtotal": round(calculated_subtotal, 2),
        "delivery_charge": round(calculated_delivery_charge, 2),
        "total": round(calculated_total, 2)
    }


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(order: OrderCreate):
    """Create a new order with server-side validation and calculation"""
    try:
        db = get_db()
        orders_collection = db.orders
        
        # Validate and recalculate order data
        validated_data = validate_order_data(order)
        
        order_dict = order.dict()
        order_dict["id"] = str(uuid.uuid4())
        order_dict["order_number"] = generate_order_number()
        order_dict["status"] = OrderStatus.PENDING.value
        order_dict["created_at"] = datetime.utcnow()
        order_dict["updated_at"] = datetime.utcnow()
        
        # Override with server-calculated values
        order_dict["subtotal"] = validated_data["subtotal"]
        order_dict["delivery_charge"] = validated_data["delivery_charge"]
        order_dict["total"] = validated_data["total"]
        order_dict["payment_status"] = "pending"
        
        # Ensure cart_items are properly formatted
        if order_dict.get("cart_items"):
            order_dict["cart_items"] = [item.dict() for item in order.cart_items]

        result = await orders_collection.insert_one(order_dict)
        
        if result.inserted_id:
            created_order = await orders_collection.find_one({"id": order_dict["id"]})
            created_order.pop("_id", None)
            return OrderResponse(**created_order)
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create order"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating order: {str(e)}"
        )


@router.get("", response_model=List[OrderResponse])
async def get_all_orders(
    status_filter: str = None,
    limit: int = 50,
    skip: int = 0
):
    """Get all orders with optional status filter"""
    try:
        db = get_db()
        orders_collection = db.orders
        
        query = {}
        if status_filter:
            query["status"] = status_filter

        orders = await orders_collection.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
        
        for order in orders:
            order.pop("_id", None)
        
        return [OrderResponse(**order) for order in orders]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching orders: {str(e)}"
        )


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: str):
    """Get a specific order by ID"""
    try:
        db = get_db()
        orders_collection = db.orders
        
        order = await orders_collection.find_one({"id": order_id})
        
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with ID {order_id} not found"
            )
        
        order.pop("_id", None)
        return OrderResponse(**order)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching order: {str(e)}"
        )


@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(order_id: str, status_update: OrderStatusUpdate):
    """Update order status"""
    try:
        db = get_db()
        orders_collection = db.orders
        
        order = await orders_collection.find_one({"id": order_id})
        
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with ID {order_id} not found"
            )

        update_data = {
            "status": status_update.status.value,
            "updated_at": datetime.utcnow()
        }

        result = await orders_collection.update_one(
            {"id": order_id},
            {"$set": update_data}
        )

        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update order status"
            )

        updated_order = await orders_collection.find_one({"id": order_id})
        updated_order.pop("_id", None)
        return OrderResponse(**updated_order)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating order status: {str(e)}"
        )


@router.delete("/{order_id}")
async def delete_order(order_id: str):
    """Delete an order (admin only)"""
    try:
        db = get_db()
        orders_collection = db.orders
        
        result = await orders_collection.delete_one({"id": order_id})
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with ID {order_id} not found"
            )
        
        return {"message": "Order deleted successfully", "order_id": order_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting order: {str(e)}"
        )


@router.get("/number/{order_number}", response_model=OrderResponse)
async def get_order_by_number(order_number: str):
    """Get order by order number for customer tracking"""
    try:
        db = get_db()
        orders_collection = db.orders
        
        order = await orders_collection.find_one({"order_number": order_number})
        
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order with number {order_number} not found"
            )
        
        order.pop("_id", None)
        return OrderResponse(**order)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching order: {str(e)}"
        )
