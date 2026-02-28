"""
Test suite for protected admin routes.

Tests:
- Admin endpoints without token (denied)
- Admin endpoints with valid token (allowed)
- Admin endpoints with expired token (denied)
- Dashboard statistics
- Order list retrieval
- Order status update
"""

import pytest
from datetime import datetime, timezone
# Ensure backend package is importable
import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
# Example: from backend.server import app


class TestAdminProtectedRoutes:
    """Test protection of admin endpoints."""
    
    async def test_dashboard_without_token(self, client):
        """Test accessing dashboard without token."""
        response = await client.get("/api/admin/dashboard")
        
        assert response.status_code == 401
        assert "Missing authorization header" in response.json()["detail"]
    
    async def test_dashboard_with_valid_token(self, client, admin_token, test_db):
        """Test accessing dashboard with valid token."""
        # Create some test data
        await test_db.orders.insert_many([
            {
                "order_id": "order1",
                "customer_name": "Test 1",
                "status": "pending",
                "total_amount": 100.00,
                "created_at": datetime.now(timezone.utc)
            },
            {
                "order_id": "order2",
                "customer_name": "Test 2",
                "status": "completed",
                "total_amount": 200.00,
                "created_at": datetime.now(timezone.utc)
            }
        ])
        
        response = await client.get(
            "/api/admin/dashboard",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "total_orders" in data
        assert "pending_orders" in data
        assert "completed_orders" in data
        assert "total_revenue" in data
        assert "menu_items_count" in data
    
    async def test_dashboard_with_expired_token(self, client, expired_token):
        """Test accessing dashboard with expired token."""
        response = await client.get(
            "/api/admin/dashboard",
            headers={"Authorization": f"Bearer {expired_token}"}
        )
        
        assert response.status_code == 401
        assert "expired" in response.json()["detail"].lower()


class TestAdminOrders:
    """Test admin order endpoints."""
    
    async def test_get_orders_without_token(self, client):
        """Test getting orders without token."""
        response = await client.get("/api/admin/orders")
        
        assert response.status_code == 401
    
    async def test_get_orders_with_valid_token(self, client, admin_token, test_db):
        """Test getting orders with valid token."""
        # Create test orders
        await test_db.orders.insert_many([
            {
                "order_id": "order1",
                "customer_name": "Customer 1",
                "status": "pending",
                "total_amount": 100.00,
                "created_at": datetime.now(timezone.utc)
            },
            {
                "order_id": "order2",
                "customer_name": "Customer 2",
                "status": "completed",
                "total_amount": 200.00,
                "created_at": datetime.now(timezone.utc)
            }
        ])
        
        response = await client.get(
            "/api/admin/orders",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        orders = response.json()
        assert len(orders) == 2
    
    async def test_get_orders_filtered_by_status(self, client, admin_token, test_db):
        """Test getting orders filtered by status."""
        # Create test orders
        await test_db.orders.insert_many([
            {
                "order_id": "order1",
                "customer_name": "Customer 1",
                "status": "pending",
                "total_amount": 100.00,
                "created_at": datetime.now(timezone.utc)
            },
            {
                "order_id": "order2",
                "customer_name": "Customer 2",
                "status": "completed",
                "total_amount": 200.00,
                "created_at": datetime.now(timezone.utc)
            }
        ])
        
        response = await client.get(
            "/api/admin/orders?status_filter=pending",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        orders = response.json()
        assert len(orders) == 1
        assert orders[0]["status"] == "pending"


class TestAdminUpdateOrder:
    """Test admin order update endpoints."""
    
    async def test_update_order_without_token(self, client):
        """Test updating order without token."""
        response = await client.put(
            "/api/admin/orders/order1/status",
            json={"status": "preparing", "notes": "test"}
        )
        
        assert response.status_code == 401
    
    async def test_update_order_with_valid_token(self, client, admin_token, test_db):
        """Test updating order with valid token."""
        # Create test order
        await test_db.orders.insert_one({
            "order_id": "order1",
            "customer_name": "Customer 1",
            "status": "pending",
            "total_amount": 100.00,
            "created_at": datetime.now(timezone.utc)
        })
        
        response = await client.put(
            "/api/admin/orders/order1/status",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"status": "preparing", "notes": "Being prepared"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["new_status"] == "preparing"
    
    async def test_update_order_invalid_status(self, client, admin_token, test_db):
        """Test updating order with invalid status."""
        # Create test order
        await test_db.orders.insert_one({
            "order_id": "order1",
            "customer_name": "Customer 1",
            "status": "pending",
            "total_amount": 100.00,
            "created_at": datetime.now(timezone.utc)
        })
        
        response = await client.put(
            "/api/admin/orders/order1/status",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"status": "invalid_status", "notes": "test"}
        )
        
        assert response.status_code == 400
        assert "Invalid status" in response.json()["detail"]
    
    async def test_update_nonexistent_order(self, client, admin_token):
        """Test updating non-existent order."""
        response = await client.put(
            "/api/admin/orders/nonexistent/status",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"status": "preparing", "notes": "test"}
        )
        
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
    
    async def test_update_order_with_valid_statuses(self, client, admin_token, test_db):
        """Test updating order with all valid statuses."""
        valid_statuses = ["pending", "preparing", "ready", "completed", "cancelled"]
        
        for status in valid_statuses:
            # Create fresh order
            await test_db.orders.insert_one({
                "order_id": f"order_{status}",
                "customer_name": "Customer",
                "status": "pending",
                "total_amount": 100.00,
                "created_at": datetime.now(timezone.utc)
            })
            
            response = await client.put(
                f"/api/admin/orders/order_{status}/status",
                headers={"Authorization": f"Bearer {admin_token}"},
                json={"status": status, "notes": "test"}
            )
            
            assert response.status_code == 200


class TestAdminMenuStats:
    """Test admin menu statistics."""
    
    async def test_menu_stats_without_token(self, client):
        """Test accessing menu stats without token."""
        response = await client.get("/api/admin/menu/stats")
        
        assert response.status_code == 401
    
    async def test_menu_stats_with_valid_token(self, client, admin_token, test_db):
        """Test accessing menu stats with valid token."""
        # Create test menu items
        await test_db.menu.insert_many([
            {
                "name": "Item 1",
                "category": "appetizers",
                "price": 9.99,
                "available": True
            },
            {
                "name": "Item 2",
                "category": "mains",
                "price": 14.99,
                "available": True
            },
            {
                "name": "Item 3",
                "category": "desserts",
                "price": 7.99,
                "available": False
            }
        ])
        
        response = await client.get(
            "/api/admin/menu/stats",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["total_items"] == 3
        assert data["available_items"] == 2
        assert data["unavailable_items"] == 1
        assert "appetizers" in data["categories"]
        assert "mains" in data["categories"]
        assert "desserts" in data["categories"]


class TestAdminHealth:
    """Test admin health check endpoint."""
    
    async def test_health_without_token(self, client):
        """Test health check without token."""
        response = await client.post("/api/admin/health")
        
        assert response.status_code == 401
    
    async def test_health_with_valid_token(self, client, admin_token):
        """Test health check with valid token."""
        response = await client.post(
            "/api/admin/health",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["admin"] == "testadmin"
        assert "operational" in data["message"].lower()
