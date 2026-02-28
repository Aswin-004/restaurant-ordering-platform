from fastapi import APIRouter, HTTPException, status
from typing import List
from backend.models import MenuItemCreate, MenuItemResponse, MenuItemUpdate
from datetime import datetime
import uuid

router = APIRouter(prefix="/menu", tags=["menu"])

# Database dependency will be injected
_db = None

def set_database(database):
    global _db
    _db = database

def get_db():
    return _db


@router.get("", response_model=List[MenuItemResponse])
async def get_menu(category: str = None, available_only: bool = True):
    """Get menu items with optional category filter"""
    try:
        db = get_db()
        menu_collection = db.menu
        
        query = {}
        if category:
            query["category"] = category
        if available_only:
            query["available"] = True

        items = await menu_collection.find(query).sort("category", 1).to_list(1000)
        
        for item in items:
            item.pop("_id", None)
        
        return [MenuItemResponse(**item) for item in items]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching menu: {str(e)}"
        )


@router.get("/categories")
async def get_categories():
    """Get all menu categories"""
    try:
        db = get_db()
        menu_collection = db.menu
        
        categories = await menu_collection.distinct("category")
        return {"categories": categories}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching categories: {str(e)}"
        )


@router.post("", response_model=MenuItemResponse, status_code=status.HTTP_201_CREATED)
async def create_menu_item(item: MenuItemCreate):
    """Create a new menu item (admin only)"""
    try:
        db = get_db()
        menu_collection = db.menu
        
        item_dict = item.dict()
        item_dict["id"] = str(uuid.uuid4())
        item_dict["created_at"] = datetime.utcnow()
        item_dict["updated_at"] = datetime.utcnow()

        result = await menu_collection.insert_one(item_dict)
        
        if result.inserted_id:
            created_item = await menu_collection.find_one({"id": item_dict["id"]})
            created_item.pop("_id", None)
            return MenuItemResponse(**created_item)
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create menu item"
            )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating menu item: {str(e)}"
        )


@router.get("/{item_id}", response_model=MenuItemResponse)
async def get_menu_item(item_id: str):
    """Get a specific menu item"""
    try:
        db = get_db()
        menu_collection = db.menu
        
        item = await menu_collection.find_one({"id": item_id})
        
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Menu item with ID {item_id} not found"
            )
        
        item.pop("_id", None)
        return MenuItemResponse(**item)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching menu item: {str(e)}"
        )


@router.patch("/{item_id}", response_model=MenuItemResponse)
async def update_menu_item(item_id: str, item_update: MenuItemUpdate):
    """Update a menu item (admin only)"""
    try:
        db = get_db()
        menu_collection = db.menu
        
        item = await menu_collection.find_one({"id": item_id})
        
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Menu item with ID {item_id} not found"
            )

        update_data = {k: v for k, v in item_update.dict().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()

        result = await menu_collection.update_one(
            {"id": item_id},
            {"$set": update_data}
        )

        if result.modified_count == 0 and len(update_data) > 1:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update menu item"
            )

        updated_item = await menu_collection.find_one({"id": item_id})
        updated_item.pop("_id", None)
        return MenuItemResponse(**updated_item)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating menu item: {str(e)}"
        )


@router.delete("/{item_id}")
async def delete_menu_item(item_id: str):
    """Delete a menu item (admin only)"""
    try:
        db = get_db()
        menu_collection = db.menu
        
        result = await menu_collection.delete_one({"id": item_id})
        
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Menu item with ID {item_id} not found"
            )
        
        return {"message": "Menu item deleted successfully", "item_id": item_id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting menu item: {str(e)}"
        )
