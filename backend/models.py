from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PREPARING = "preparing"
    READY = "ready"
    OUT_FOR_DELIVERY = "out_for_delivery"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class OrderType(str, Enum):
    DINE_IN = "dine_in"
    TAKEAWAY = "takeaway"
    DELIVERY = "delivery"
    PICKUP = "pickup"


class CartItem(BaseModel):
    item_name: str
    quantity: int
    price: float
    subtotal: float


class OrderCreate(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., min_length=10, max_length=15)
    address: str = Field(..., min_length=5, max_length=500)
    landmark: Optional[str] = None
    items: str = Field(..., min_length=3)
    cart_items: Optional[List[CartItem]] = []
    notes: Optional[str] = None
    order_type: str = "delivery"
    delivery_area: Optional[str] = None
    delivery_charge: float = 0
    subtotal: float = 0
    total: float = 0
    payment_method: str = "cod"
    payment_status: str = "pending"
    estimated_delivery_time: str = "45-60 minutes"


class OrderResponse(BaseModel):
    id: str
    order_number: str
    customer_name: str
    phone: str
    address: str
    landmark: Optional[str] = None
    items: str
    cart_items: Optional[List[dict]] = []
    notes: Optional[str] = None
    order_type: str
    delivery_area: Optional[str] = None
    delivery_charge: float = 0
    subtotal: float = 0
    total: float = 0
    status: str
    payment_method: str = "cod"
    payment_status: str = "pending"
    estimated_time: str = "30-40 minutes"
    estimated_delivery_time: str = "45-60 minutes"
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class MenuItemCreate(BaseModel):
    category: str
    name: str
    price: float
    description: Optional[str] = None
    image: Optional[str] = None
    available: bool = True


class MenuItemResponse(BaseModel):
    id: str
    category: str
    name: str
    price: float
    description: Optional[str] = None
    image: Optional[str] = None
    available: bool

    class Config:
        from_attributes = True


class MenuItemUpdate(BaseModel):
    price: Optional[float] = None
    description: Optional[str] = None
    image: Optional[str] = None
    available: Optional[bool] = None
