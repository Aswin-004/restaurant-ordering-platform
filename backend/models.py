from pydantic import BaseModel, Field
from typing import Optional
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


class OrderItemCreate(BaseModel):
    name: str
    quantity: int = 1
    price: Optional[float] = None
    notes: Optional[str] = None


class OrderCreate(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., min_length=10, max_length=15)
    address: str = Field(..., min_length=5, max_length=500)
    items: str = Field(..., min_length=3)
    notes: Optional[str] = None
    order_type: OrderType = OrderType.DELIVERY


class OrderResponse(BaseModel):
    id: str
    order_number: str
    customer_name: str
    phone: str
    address: str
    items: str
    notes: Optional[str] = None
    order_type: str
    status: str
    estimated_time: str = "30-40 minutes"
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
