from fastapi import APIRouter, HTTPException, status, Depends, Header
from pydantic import BaseModel
import jwt
import os
from datetime import datetime, timedelta, timezone
import logging
from typing import Optional
import bcrypt

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])

# Configuration
JWT_SECRET = os.getenv('JWT_SECRET', 'change-this-in-production-secret-key-minimum-32-chars')
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 1

# Database dependency will be injected
_db = None

def set_database(database):
    global _db
    _db = database

def get_db():
    return _db

# Models
class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    username: str
    message: str
    expires_in: int

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str

class ChangePasswordResponse(BaseModel):
    message: str
    username: str

# Utility Functions
def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode(), salt).decode()

def verify_password(password: str, password_hash: str) -> bool:
    """Verify a password against a bcrypt hash"""
    return bcrypt.checkpw(password.encode(), password_hash.encode())

# JWT Token Functions
def create_access_token(username: str) -> str:
    """Create a JWT access token"""
    now = datetime.now(timezone.utc)
    expire = now + timedelta(hours=TOKEN_EXPIRE_HOURS)
    payload = {
        'username': username,
        'exp': int(expire.timestamp()),  # Unix timestamp (seconds since epoch)
        'iat': int(now.timestamp())      # Unix timestamp (seconds since epoch)
    }
    try:
        token = jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)
        return token
    except Exception as e:
        logger.error(f"Token creation failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create token")

def verify_token(authorization: Optional[str] = Header(None)) -> dict:
    """Verify JWT token from request header"""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = parts[1]
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        username: str = payload.get("username")
        if username is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token payload",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return {"username": username}
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as e:
        logger.warning(f"Invalid token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Token verification error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token verification failed",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Dependency for protected routes
async def get_current_admin(authorization: Optional[str] = Header(None)) -> dict:
    """Dependency to verify admin authentication"""
    return verify_token(authorization)

# Routes
@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """Admin login endpoint - validates against MongoDB"""
    try:
        db = get_db()
        admins_collection = db.admins
        
        # Find admin user in database
        admin = await admins_collection.find_one({"username": request.username})
        
        if not admin:
            logger.warning(f"Login attempt with non-existent username: {request.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Verify password using bcrypt
        if not verify_password(request.password, admin['password_hash']):
            logger.warning(f"Login attempt with invalid password for user: {request.username}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Create access token
        access_token = create_access_token(username=request.username)
        
        logger.info(f"Successful login for user: {request.username}")
        
        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            username=request.username,
            message=f"Welcome {request.username}!",
            expires_in=TOKEN_EXPIRE_HOURS * 3600
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )

@router.post("/change-password", response_model=ChangePasswordResponse)
async def change_password(
    request: ChangePasswordRequest,
    current_admin: dict = Depends(get_current_admin)
):
    """Change admin password - requires valid JWT token"""
    try:
        # Validate new password
        if len(request.new_password) < 8:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password must be at least 8 characters long"
            )
        
        if request.old_password == request.new_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password must be different from old password"
            )
        
        db = get_db()
        admins_collection = db.admins
        
        # Get current admin from database
        admin = await admins_collection.find_one({"username": current_admin['username']})
        
        if not admin:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Admin user not found"
            )
        
        # Verify old password
        if not verify_password(request.old_password, admin['password_hash']):
            logger.warning(f"Failed password change attempt for user: {current_admin['username']}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Old password is incorrect"
            )
        
        # Hash new password
        new_password_hash = hash_password(request.new_password)
        
        # Update password in database
        result = await admins_collection.update_one(
            {"username": current_admin['username']},
            {
                "$set": {
                    "password_hash": new_password_hash,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        
        if result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update password"
            )
        
        logger.info(f"Password changed for user: {current_admin['username']}")
        
        return ChangePasswordResponse(
            message="Password changed successfully",
            username=current_admin['username']
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error changing password: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error changing password: {str(e)}"
        )

@router.get("/verify")
async def verify_auth(current_admin: dict = Depends(get_current_admin)):
    """Verify if current token is valid"""
    return {
        "authenticated": True,
        "username": current_admin['username'],
        "message": "Token is valid"
    }

@router.post("/logout")
async def logout(current_admin: dict = Depends(get_current_admin)):
    """Logout endpoint (for frontend reference)"""
    logger.info(f"User {current_admin['username']} logged out")
    return {
        "message": "Logged out successfully",
        "username": current_admin['username']
    }
