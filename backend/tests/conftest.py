"""
Pytest configuration and fixtures for backend testing.

This file provides:
1. Test database connection
2. Test client for FastAPI
3. Admin user fixtures
4. JWT token fixtures
5. MongoDB setup/teardown
"""

import pytest
import httpx
import sys
import os
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt

# Set JWT_SECRET in environment BEFORE importing routes
# This ensures all modules use the same secret for token generation/verification
JWT_SECRET = 'test-secret-key-minimum-32-characters-for-testing'
os.environ['JWT_SECRET'] = JWT_SECRET

# Ensure parent directory is in sys.path for absolute imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

# Import after path configuration and JWT_SECRET is set
from backend.server import app
from backend.routes import auth, orders, menu, payment, specials, admin

# Configuration
TEST_MONGO_URL = os.getenv('TEST_MONGO_URL', 'mongodb://localhost:27017')
TEST_DB_NAME = 'test_restaurant_db'

def hash_password(password: str) -> str:
    """Hash password using bcrypt."""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode(), salt).decode()

# Use function scope to avoid event loop conflicts
@pytest.fixture
async def test_db():
    """Create test database connection for each test."""
    from motor.motor_asyncio import AsyncIOMotorClient
    
    client = AsyncIOMotorClient(TEST_MONGO_URL)
    db = client[TEST_DB_NAME]
    
    # Clean up before test
    try:
        collections = await db.list_collection_names()
        for collection in collections:
            await db[collection].delete_many({})
    except Exception:
        pass
    
    yield db
    
    # Clean up after test
    try:
        collections = await db.list_collection_names()
        for collection in collections:
            await db[collection].delete_many({})
    except Exception:
        pass
    
    # Close connection
    client.close()

@pytest.fixture
async def client(test_db):
    """Create AsyncClient for testing."""
    # Inject test database into all route modules
    auth.set_database(test_db)
    orders.set_database(test_db)
    menu.set_database(test_db)
    payment.set_database(test_db)
    specials.set_database(test_db)
    admin.set_database(test_db)
    
    # Create async client with ASGI transport
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        yield client

@pytest.fixture
async def test_admin_user(test_db):
    """Create a test admin user in database."""
    admin_doc = {
        "username": "testadmin",
        "password_hash": hash_password("TestPass123!"),
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    result = await test_db.admins.insert_one(admin_doc)
    admin_doc["_id"] = result.inserted_id
    return admin_doc

@pytest.fixture
async def admin_token(test_admin_user):
    """Create JWT token for test admin."""
    now = datetime.now(timezone.utc)
    payload = {
        'username': test_admin_user['username'],
        'exp': int(now.timestamp()) + 3600,  # 1 hour from now
        'iat': int(now.timestamp())
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm='HS256')
    return token

@pytest.fixture
async def expired_token():
    """Create an expired JWT token with integer timestamps."""
    now = datetime.now(timezone.utc)
    payload = {
        'username': 'testadmin',
        'exp': int((now - timedelta(hours=1)).timestamp()),
        'iat': int((now - timedelta(hours=2)).timestamp())
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm='HS256')
    return token

@pytest.fixture
async def invalid_token():
    """Create an invalid JWT token with bad signature."""
    return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature"

@pytest.fixture
async def test_menu_item(test_db):
    """Create a test menu item."""
    item = {
        "name": "Test Item",
        "description": "A test menu item",
        "category": "test",
        "price": 9.99,
        "image_url": "https://example.com/image.jpg",
        "available": True,
        "rating": 4.5
    }
    result = await test_db.menu.insert_one(item)
    item["_id"] = result.inserted_id
    return item

@pytest.fixture
async def test_order_data():
    """Create test order data with all required fields for OrderCreate."""
    return {
        "customer_name": "Test Customer",
        "customer_email": "test@example.com",
        "customer_phone": "9123456789",
        "address": "123 Main Street, City, State, 12345",
        "landmark": "Near Park",
        "items": "Test Item x2",
        "cart_items": [
            {"item_name": "Test Item", "quantity": 2, "price": 9.99, "subtotal": 19.98}
        ],
        "order_type": "delivery",
        "delivery_area": "srm",
        "delivery_charge": 2.00,
        "subtotal": 19.98,
        "total": 21.98,
        "payment_method": "cod",
        "payment_status": "pending",
        "estimated_delivery_time": "45-60 minutes",
        "notes": "Test order"
    }
