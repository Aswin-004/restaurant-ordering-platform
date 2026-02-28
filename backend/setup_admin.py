#!/usr/bin/env python3
"""
Admin Setup Script - Initialize admin user in MongoDB

Usage:
    python setup_admin.py --username admin --password "YourSecurePassword123!"
    
Or for interactive mode:
    python setup_admin.py
"""

import asyncio
import argparse
import sys
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import bcrypt
from datetime import datetime, timezone

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

async def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode(), salt).decode()

async def setup_admin(username: str, password: str):
    """Create or update admin user in MongoDB"""
    
    # Validate inputs
    if not username or len(username) < 3:
        print("❌ Username must be at least 3 characters")
        return False
    
    if not password or len(password) < 8:
        print("❌ Password must be at least 8 characters")
        return False
    
    try:
        # Connect to MongoDB
        mongo_url = os.getenv('MONGO_URL', 'mongodb://localhost:27017')
        db_name = os.getenv('DB_NAME', 'restaurant_db')
        
        print(f"\n🔗 Connecting to MongoDB...")
        client = AsyncIOMotorClient(mongo_url)
        db = client[db_name]
        
        # Test connection
        await db.command('ping')
        print(f"✅ Connected to database: {db_name}")
        
        admins_collection = db.admins
        
        # Hash the password
        print(f"\n🔐 Hashing password...")
        password_hash = await hash_password(password)
        
        # Check if admin already exists
        existing_admin = await admins_collection.find_one({"username": username})
        
        if existing_admin:
            print(f"\n⚠️  Admin user '{username}' already exists")
            response = input("Do you want to update the password? (y/n): ").strip().lower()
            if response != 'y':
                print("❌ Update cancelled")
                client.close()
                return False
            
            # Update existing admin
            result = await admins_collection.update_one(
                {"username": username},
                {
                    "$set": {
                        "password_hash": password_hash,
                        "updated_at": datetime.now(timezone.utc)
                    }
                }
            )
            
            if result.modified_count > 0:
                print(f"✅ Password updated successfully for admin '{username}'")
            else:
                print(f"⚠️  No changes made")
        else:
            # Create new admin
            admin_doc = {
                "username": username,
                "password_hash": password_hash,
                "created_at": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc)
            }
            
            result = await admins_collection.insert_one(admin_doc)
            print(f"✅ Admin user '{username}' created successfully")
            print(f"   Admin ID: {result.inserted_id}")
        
        # Verify creation
        verify_admin = await admins_collection.find_one({"username": username})
        if verify_admin:
            print(f"✅ Admin verified in database")
            print(f"   Username: {verify_admin['username']}")
            print(f"   Created: {verify_admin['created_at']}")
            print(f"   Updated: {verify_admin['updated_at']}")
        
        # Display collection info
        admin_count = await admins_collection.count_documents({})
        print(f"\n📊 Total admins in database: {admin_count}")
        
        client.close()
        print("\n✅ Setup completed successfully!\n")
        return True
        
    except Exception as e:
        print(f"❌ Error during setup: {str(e)}")
        return False

async def main():
    """Main function with CLI argument parsing"""
    parser = argparse.ArgumentParser(
        description="Initialize admin user in MongoDB"
    )
    parser.add_argument(
        "--username",
        type=str,
        help="Admin username (default: admin)"
    )
    parser.add_argument(
        "--password",
        type=str,
        help="Admin password (will prompt if not provided)"
    )
    
    args = parser.parse_args()
    
    # Get username
    username = args.username or "admin"
    if not args.username:
        print("📝 Admin Setup")
        print("=" * 40)
    
    # Get password
    if args.password:
        password = args.password
    else:
        import getpass
        password = getpass.getpass(f"Enter password for '{username}': ")
        confirm = getpass.getpass("Confirm password: ")
        
        if password != confirm:
            print("❌ Passwords do not match")
            sys.exit(1)
    
    # Run setup
    success = await setup_admin(username, password)
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    asyncio.run(main())
