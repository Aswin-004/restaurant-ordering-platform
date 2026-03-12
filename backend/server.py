from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
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

# Environment variables
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

# Create FastAPI app
app = FastAPI(
    title="Restaurant Ordering API",
    description="Production-ready restaurant ordering system",
    version="1.0.0"
)

# ---------------- CORS FIX (THIS WAS BROKEN) ----------------

origins = [
    "http://localhost:3000",
    "https://restaurant-ordering-platform-jade.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------

# Create router with /api prefix
api_router = APIRouter(prefix="/api")

# Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)

    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()

    await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)

    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])

    return status_checks

# Inject database into routes
orders.set_database(db)
menu.set_database(db)
payment.set_database(db)
specials.set_database(db)
admin.set_database(db)
auth.set_database(db)

# Include routers
api_router.include_router(auth.router)
api_router.include_router(orders.router)
api_router.include_router(menu.router)
api_router.include_router(payment.router)
api_router.include_router(specials.router)
api_router.include_router(admin.router)

app.include_router(api_router)

# Logging
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
    port = int(os.getenv('PORT', 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)