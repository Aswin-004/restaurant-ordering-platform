from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/specials", tags=["specials"])

# Database reference (will be set from server.py)
db = None

def set_database(database):
    global db
    db = database


class SpecialCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    description: str = Field(..., min_length=5, max_length=300)
    original_price: float = Field(..., gt=0)
    special_price: float = Field(..., gt=0)
    image: Optional[str] = None
    is_active: bool = True
    badge: str = "Today's Special"


class SpecialResponse(BaseModel):
    id: str
    name: str
    description: str
    original_price: float
    special_price: float
    discount_percent: int
    image: Optional[str] = None
    is_active: bool
    badge: str
    created_at: datetime
    updated_at: datetime


class SpecialUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    original_price: Optional[float] = None
    special_price: Optional[float] = None
    image: Optional[str] = None
    is_active: Optional[bool] = None
    badge: Optional[str] = None


@router.get("", response_model=List[SpecialResponse])
async def get_specials(active_only: bool = True):
    """Get all specials (optionally only active ones)"""
    query = {"is_active": True} if active_only else {}
    specials = await db.specials.find(query, {"_id": 0}).to_list(100)
    
    # Convert ISO string timestamps back to datetime
    for special in specials:
        if isinstance(special.get('created_at'), str):
            special['created_at'] = datetime.fromisoformat(special['created_at'])
        if isinstance(special.get('updated_at'), str):
            special['updated_at'] = datetime.fromisoformat(special['updated_at'])
    
    return specials


@router.get("/{special_id}", response_model=SpecialResponse)
async def get_special(special_id: str):
    """Get a specific special by ID"""
    special = await db.specials.find_one({"id": special_id}, {"_id": 0})
    if not special:
        raise HTTPException(status_code=404, detail="Special not found")
    
    # Convert timestamps
    if isinstance(special.get('created_at'), str):
        special['created_at'] = datetime.fromisoformat(special['created_at'])
    if isinstance(special.get('updated_at'), str):
        special['updated_at'] = datetime.fromisoformat(special['updated_at'])
    
    return special


@router.post("", response_model=SpecialResponse)
async def create_special(special: SpecialCreate):
    """Create a new special offer"""
    now = datetime.now(timezone.utc)
    
    # Calculate discount percentage
    discount_percent = int(((special.original_price - special.special_price) / special.original_price) * 100)
    
    special_doc = {
        "id": str(uuid.uuid4()),
        "name": special.name,
        "description": special.description,
        "original_price": special.original_price,
        "special_price": special.special_price,
        "discount_percent": discount_percent,
        "image": special.image,
        "is_active": special.is_active,
        "badge": special.badge,
        "created_at": now.isoformat(),
        "updated_at": now.isoformat()
    }
    
    await db.specials.insert_one(special_doc)
    
    # Return with datetime objects
    special_doc['created_at'] = now
    special_doc['updated_at'] = now
    if '_id' in special_doc:
        del special_doc['_id']
    
    return special_doc


@router.put("/{special_id}", response_model=SpecialResponse)
async def update_special(special_id: str, update_data: SpecialUpdate):
    """Update a special offer"""
    special = await db.specials.find_one({"id": special_id})
    if not special:
        raise HTTPException(status_code=404, detail="Special not found")
    
    # Build update dict with only provided fields
    update_dict = {k: v for k, v in update_data.model_dump().items() if v is not None}
    
    if update_dict:
        update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        # Recalculate discount if prices changed
        original = update_dict.get('original_price', special.get('original_price'))
        special_price = update_dict.get('special_price', special.get('special_price'))
        update_dict['discount_percent'] = int(((original - special_price) / original) * 100)
        
        await db.specials.update_one(
            {"id": special_id},
            {"$set": update_dict}
        )
    
    # Fetch updated document
    updated = await db.specials.find_one({"id": special_id}, {"_id": 0})
    
    # Convert timestamps
    if isinstance(updated.get('created_at'), str):
        updated['created_at'] = datetime.fromisoformat(updated['created_at'])
    if isinstance(updated.get('updated_at'), str):
        updated['updated_at'] = datetime.fromisoformat(updated['updated_at'])
    
    return updated


@router.delete("/{special_id}")
async def delete_special(special_id: str):
    """Delete a special offer"""
    result = await db.specials.delete_one({"id": special_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Special not found")
    return {"message": "Special deleted successfully"}


@router.patch("/{special_id}/toggle")
async def toggle_special(special_id: str):
    """Toggle the active status of a special"""
    special = await db.specials.find_one({"id": special_id})
    if not special:
        raise HTTPException(status_code=404, detail="Special not found")
    
    new_status = not special.get('is_active', True)
    await db.specials.update_one(
        {"id": special_id},
        {"$set": {"is_active": new_status, "updated_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"message": f"Special {'activated' if new_status else 'deactivated'}", "is_active": new_status}
