from fastapi import APIRouter, HTTPException, status, Depends, Header
from pydantic import BaseModel
import jwt
import os
from datetime import datetime, timedelta, timezone
import logging
from typing import Optional

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["auth"])

# Configuration
ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD', 'classic@admin2026')
ADMIN_USERNAME = 'admin'
SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-change-in-production-12345')
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 24

# Models
class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    username: str
    message: str

class TokenPayload(BaseModel):
    username: str
    exp: datetime

# JWT Token Functions
def create_access_token(username: str) -> str:
    """Create a JWT access token"""
    expire = datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRE_HOURS)
    payload = {
        'username': username,
        'exp': expire.isoformat()
    }
    try:
        token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
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
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
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
    """Admin login endpoint"""
    # Validate credentials
    if request.username != ADMIN_USERNAME:
        logger.warning(f"Login attempt with invalid username: {request.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    if request.password != ADMIN_PASSWORD:
        logger.warning(f"Login attempt with invalid password for user: {request.username}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Create token
    access_token = create_access_token(username=ADMIN_USERNAME)
    
    logger.info(f"Successful login for user: {ADMIN_USERNAME}")
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        username=ADMIN_USERNAME,
        message=f"Welcome {ADMIN_USERNAME}! Token valid for {TOKEN_EXPIRE_HOURS} hours."
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
