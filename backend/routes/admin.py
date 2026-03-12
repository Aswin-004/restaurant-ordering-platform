from fastapi import APIRouter, HTTPException, status, Depends
from typing import List, Optional
from routes.auth import get_current_admin
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["admin"])

# Database dependency will be injected
_db = None

def set_database(database):
    global _db
    _db = database

def get_db():
    return _db

# Models
from pydantic import BaseModel

class AdminDashboard(BaseModel):
    total_orders: int
    pending_orders: int
    completed_orders: int
    total_revenue: float
    menu_items_count: int

class AdminOrderUpdate(BaseModel):
    status: str  # pending, preparing, ready, completed, cancelled
    notes: Optional[str] = None

# Admin Routes - ALL require authentication
@router.get("/dashboard", response_model=AdminDashboard, description="Get dashboard statistics (Admin only)")
async def get_dashboard(current_admin: dict = Depends(get_current_admin)):
    """Get admin dashboard with statistics"""
    try:
        db = get_db()
        
        # Get order statistics
        orders_collection = db.orders
        total_orders = await orders_collection.count_documents({})
        pending_orders = await orders_collection.count_documents({"status": "pending"})
        completed_orders = await orders_collection.count_documents({"status": "completed"})
        
        # Calculate total revenue
        pipeline = [
            {"$match": {"status": "completed"}},
            {"$group": {"_id": None, "total": {"$sum": "$total_amount"}}}
        ]
        revenue_result = await orders_collection.aggregate(pipeline).to_list(1)
        total_revenue = revenue_result[0]['total'] if revenue_result else 0
        
        # Get menu items count
        menu_collection = db.menu
        menu_items_count = await menu_collection.count_documents({})
        
        logger.info(f"Admin dashboard accessed by {current_admin['username']}")
        
        return AdminDashboard(
            total_orders=total_orders,
            pending_orders=pending_orders,
            completed_orders=completed_orders,
            total_revenue=total_revenue,
            menu_items_count=menu_items_count
        )
    except Exception as e:
        logger.error(f"Error fetching admin dashboard: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching dashboard: {str(e)}"
        )

@router.get("/orders", description="Get all orders (Admin only)")
async def get_all_orders(
    status_filter: Optional[str] = None,
    current_admin: dict = Depends(get_current_admin)
):
    """Get all orders with optional status filter"""
    try:
        db = get_db()
        orders_collection = db.orders
        
        query = {}
        if status_filter:
            query["status"] = status_filter
        
        orders = await orders_collection.find(query).sort("created_at", -1).to_list(1000)
        
        for order in orders:
            order.pop("_id", None)
        
        logger.info(f"Admin {current_admin['username']} accessed all orders")
        
        return orders
    except Exception as e:
        logger.error(f"Error fetching admin orders: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching orders: {str(e)}"
        )

@router.put("/orders/{order_id}/status", description="Update order status (Admin only)")
async def update_order_status(
    order_id: str,
    update: AdminOrderUpdate,
    current_admin: dict = Depends(get_current_admin)
):
    """Update order status - Admin only"""
    try:
        db = get_db()
        orders_collection = db.orders
        
        # Validate status
        valid_statuses = ["pending", "preparing", "ready", "completed", "cancelled"]
        if update.status not in valid_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
            )
        
        # Update order
        result = await orders_collection.update_one(
            {"order_id": order_id},
            {"$set": {"status": update.status, "admin_notes": update.notes}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Order {order_id} not found"
            )
        
        logger.info(f"Admin {current_admin['username']} updated order {order_id} status to {update.status}")
        
        return {
            "message": "Order updated successfully",
            "order_id": order_id,
            "new_status": update.status,
            "updated_by": current_admin['username']
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating order status: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating order: {str(e)}"
        )

@router.get("/menu/stats", description="Get menu statistics (Admin only)")
async def get_menu_stats(current_admin: dict = Depends(get_current_admin)):
    """Get menu items statistics"""
    try:
        db = get_db()
        menu_collection = db.menu
        
        # Get total items
        total_items = await menu_collection.count_documents({})
        available_items = await menu_collection.count_documents({"available": True})
        unavailable_items = await menu_collection.count_documents({"available": False})
        
        # Get items by category
        categories = await menu_collection.distinct("category")
        
        logger.info(f"Admin {current_admin['username']} accessed menu stats")
        
        return {
            "total_items": total_items,
            "available_items": available_items,
            "unavailable_items": unavailable_items,
            "categories": categories
        }
    except Exception as e:
        logger.error(f"Error fetching menu stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching menu stats: {str(e)}"
        )

@router.post("/health", description="Admin health check (Admin only)")
async def admin_health_check(current_admin: dict = Depends(get_current_admin)):
    """Health check endpoint for admin"""
    return {
        "status": "healthy",
        "admin": current_admin['username'],
        "message": "Admin API is operational"
    }
