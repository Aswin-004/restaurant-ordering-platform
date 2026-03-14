from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/qr", tags=["QR Ordering"])
db = None


def set_database(database):
    global db
    db = database


@router.get("/table/{table_id}")
async def get_table_info(table_id: str):
    """Return table info for QR code scans. Creates the table record if it doesn't exist."""
    if not table_id or len(table_id) > 50:
        raise HTTPException(status_code=400, detail="Invalid table ID")

    table = await db.tables.find_one({"table_id": table_id}, {"_id": 0})

    if not table:
        # Auto-create table entry for valid QR scans
        table = {
            "table_id": table_id,
            "table_number": table_id,
            "restaurant_name": "Classic Restaurant",
            "status": "available",
            "is_active": True,
        }
        await db.tables.insert_one(table)
        table.pop("_id", None)

    if not table.get("is_active", True):
        raise HTTPException(status_code=404, detail="Table not available")

    return table
