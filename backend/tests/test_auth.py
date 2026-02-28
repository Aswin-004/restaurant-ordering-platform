"""
Test suite for authentication endpoints.

Tests:
- Admin login with valid credentials
- Admin login with invalid password
- Admin login with non-existent user
- Token verification
- Expired token handling
- Missing token handling
"""

import pytest
import jwt
from datetime import datetime, timedelta, timezone
# Ensure backend package is importable
import sys, os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
# Example: from backend.server import app


class TestAdminLogin:
    """Test admin login endpoint."""
    
    async def test_login_success(self, client, test_admin_user):
        """Test successful login with valid credentials."""
        response = await client.post(
            "/api/auth/login",
            json={
                "username": "testadmin",
                "password": "TestPass123!"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "testadmin"
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert "expires_in" in data
        assert data["message"] == "Welcome testadmin!"
    
    async def test_login_invalid_password(self, client, test_admin_user):
        """Test login with invalid password."""
        response = await client.post(
            "/api/auth/login",
            json={
                "username": "testadmin",
                "password": "WrongPassword123!"
            }
        )
        
        assert response.status_code == 401
        data = response.json()
        assert data["detail"] == "Invalid credentials"
    
    async def test_login_nonexistent_user(self, client):
        """Test login with non-existent username."""
        response = await client.post(
            "/api/auth/login",
            json={
                "username": "nonexistent",
                "password": "SomePassword123!"
            }
        )
        
        assert response.status_code == 401
        data = response.json()
        assert data["detail"] == "Invalid credentials"
    
    async def test_login_empty_credentials(self, client):
        """Test login with empty credentials."""
        response = await client.post(
            "/api/auth/login",
            json={
                "username": "",
                "password": ""
            }
        )
        
        assert response.status_code == 401
    
    async def test_login_case_sensitive_username(self, client, test_admin_user):
        """Test that username is case-sensitive."""
        response = await client.post(
            "/api/auth/login",
            json={
                "username": "TestAdmin",  # Different case
                "password": "TestPass123!"
            }
        )
        
        assert response.status_code == 401
        assert response.json()["detail"] == "Invalid credentials"


class TestTokenVerification:
    """Test JWT token verification."""
    
    async def test_verify_valid_token(self, client, admin_token):
        """Test verifying a valid token."""
        response = await client.get(
            "/api/auth/verify",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["authenticated"] is True
        assert data["username"] == "testadmin"
    
    async def test_verify_expired_token(self, client, expired_token):
        """Test verifying an expired token."""
        response = await client.get(
            "/api/auth/verify",
            headers={"Authorization": f"Bearer {expired_token}"}
        )
        
        assert response.status_code == 401
        data = response.json()
        assert "expired" in data["detail"].lower()
    
    async def test_verify_missing_token(self, client):
        """Test verification without token."""
        response = await client.get(
            "/api/auth/verify"
        )
        
        assert response.status_code == 401
        data = response.json()
        assert "Missing authorization header" in data["detail"]
    
    async def test_verify_invalid_format(self, client):
        """Test verification with invalid header format."""
        response = await client.get(
            "/api/auth/verify",
            headers={"Authorization": "InvalidFormat token"}
        )
        
        assert response.status_code == 401
        data = response.json()
        assert "Invalid authorization header format" in data["detail"]
    
    async def test_verify_no_bearer_prefix(self, client, admin_token):
        """Test verification without Bearer prefix."""
        response = await client.get(
            "/api/auth/verify",
            headers={"Authorization": f"{admin_token}"}  # Missing "Bearer"
        )
        
        assert response.status_code == 401
    
    async def test_verify_invalid_signature(self, client, invalid_token):
        """Test verification with invalid signature."""
        response = await client.get(
            "/api/auth/verify",
            headers={"Authorization": f"Bearer {invalid_token}"}
        )
        
        assert response.status_code == 401
        data = response.json()
        assert "Invalid token" in data["detail"]


class TestChangePassword:
    """Test change password endpoint."""
    
    async def test_change_password_success(self, client, admin_token, test_admin_user):
        """Test successful password change."""
        response = await client.post(
            "/api/auth/change-password",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "old_password": "TestPass123!",
                "new_password": "NewPass456!@"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Password changed successfully"
        assert data["username"] == "testadmin"
    
    async def test_change_password_wrong_old_password(self, client, admin_token):
        """Test password change with wrong old password."""
        response = await client.post(
            "/api/auth/change-password",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "old_password": "WrongPassword123!",
                "new_password": "NewPass456!@"
            }
        )
        
        assert response.status_code == 401
        data = response.json()
        assert "Old password is incorrect" in data["detail"]
    
    async def test_change_password_same_as_old(self, client, admin_token):
        """Test password change to same password."""
        response = await client.post(
            "/api/auth/change-password",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "old_password": "TestPass123!",
                "new_password": "TestPass123!"  # Same as old
            }
        )
        
        assert response.status_code == 400
        data = response.json()
        assert "must be different" in data["detail"]
    
    async def test_change_password_too_short(self, client, admin_token):
        """Test password change with password too short."""
        response = await client.post(
            "/api/auth/change-password",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "old_password": "TestPass123!",
                "new_password": "Short1!"  # Less than 8 characters
            }
        )
        
        assert response.status_code == 400
        data = response.json()
        assert "at least 8 characters" in data["detail"]
    
    async def test_change_password_without_token(self, client):
        """Test password change without authentication."""
        response = await client.post(
            "/api/auth/change-password",
            json={
                "old_password": "TestPass123!",
                "new_password": "NewPass456!@"
            }
        )
        
        assert response.status_code == 401
    
    async def test_change_password_with_expired_token(self, client, expired_token):
        """Test password change with expired token."""
        response = await client.post(
            "/api/auth/change-password",
            headers={"Authorization": f"Bearer {expired_token}"},
            json={
                "old_password": "TestPass123!",
                "new_password": "NewPass456!@"
            }
        )
        
        assert response.status_code == 401
        assert "expired" in response.json()["detail"].lower()
    
    async def test_password_actually_changed(self, client, test_db, test_admin_user):
        """Test that password is actually updated in database."""
        # First login with old password
        login_response = await client.post(
            "/api/auth/login",
            json={
                "username": "testadmin",
                "password": "TestPass123!"
            }
        )
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]
        
        # Change password
        change_response = await client.post(
            "/api/auth/change-password",
            headers={"Authorization": f"Bearer {token}"},
            json={
                "old_password": "TestPass123!",
                "new_password": "NewPass456!@"
            }
        )
        assert change_response.status_code == 200
        
        # Try to login with old password (should fail)
        old_login = await client.post(
            "/api/auth/login",
            json={
                "username": "testadmin",
                "password": "TestPass123!"
            }
        )
        assert old_login.status_code == 401
        
        # Login with new password (should succeed)
        new_login = await client.post(
            "/api/auth/login",
            json={
                "username": "testadmin",
                "password": "NewPass456!@"
            }
        )
        assert new_login.status_code == 200
        assert new_login.json()["username"] == "testadmin"


class TestLogout:
    """Test logout endpoint."""
    
    async def test_logout_success(self, client, admin_token):
        """Test successful logout."""
        response = await client.post(
            "/api/auth/logout",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "successfully" in data["message"].lower()
        assert data["username"] == "testadmin"
    
    async def test_logout_without_token(self, client):
        """Test logout without token."""
        response = await client.post(
            "/api/auth/logout"
        )
        
        assert response.status_code == 401
