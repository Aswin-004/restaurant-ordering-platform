from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone

# Import route modules
from routes import orders, menu, payment, specials, auth, admin


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Environment variables with defaults for development
MONGO_URL = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.getenv('DB_NAME', 'restaurant_db')
ENVIRONMENT = os.getenv('ENVIRONMENT', 'development')

# Validate required environment variables
if MONGO_URL == 'mongodb://localhost:27017' and ENVIRONMENT == 'production':
    raise ValueError("❌ MONGO_URL must be set for production (use MongoDB Atlas URL)")

# MongoDB connection
try:
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    logger_init = logging.getLogger(__name__)
    logger_init.info(f"✓ Database: {DB_NAME} configured")
except Exception as e:
    logging.error(f"Failed to connect to MongoDB: {str(e)}")
    raise

# Create the main app without a prefix
app = FastAPI(
    title="Restaurant Ordering API",
    description="Production-ready restaurant ordering system",
    version="1.0.0"
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Set database for route modules
orders.set_database(db)
menu.set_database(db)
payment.set_database(db)
specials.set_database(db)
admin.set_database(db)

# Include all routes (Auth must be first)
api_router.include_router(auth.router)
api_router.include_router(orders.router)
api_router.include_router(menu.router)
api_router.include_router(payment.router)
api_router.include_router(specials.router)
api_router.include_router(admin.router)

# Include the router in the main app
app.include_router(api_router)

# CORS Configuration
def get_cors_origins():
    """
    Get CORS origins based on environment.
    Development: Allow all origins (*)
    Production: Use CORS_ORIGINS environment variable (comma-separated)
    """
    if ENVIRONMENT == 'development':
        return ['*']
    else:
        # Production: Use environment variable for specific origins
        origins_str = os.getenv('CORS_ORIGINS', 'http://localhost:3000')
        # Split by comma and strip whitespace
        origins = [origin.strip() for origin in origins_str.split(',') if origin.strip()]
        return origins if origins else ['http://localhost:3000']

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=get_cors_origins(),
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Configure logging
log_level = logging.DEBUG if ENVIRONMENT == 'development' else logging.INFO
logging.basicConfig(
    level=log_level,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

if __name__ == "__main__":
    import uvicorn
    # Use port from environment variable (10000 for Render, 8000 for local development)
    port = int(os.getenv('PORT', 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)