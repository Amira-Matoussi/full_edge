# avatar_migration.py - Run this to add avatar support to your database
import psycopg2
import os
from typing import Dict, Optional  # Add this import

def run_avatar_migration():
    """Add avatar_url column to users table and update database methods"""
    conn_params = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'database': os.getenv('DB_NAME', 'ooredoo_ai'),
        'user': os.getenv('DB_USER', 'ooredoo_user'),
        'password': os.getenv('DB_PASSWORD', 'mypassword123'),
        'port': os.getenv('DB_PORT', '5432')
    }
    
    try:
        conn = psycopg2.connect(**conn_params)
        print("🔄 Starting avatar migration...")
        
        # Add avatar_url column
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    DO $$ 
                    BEGIN
                        IF NOT EXISTS (
                            SELECT 1 FROM information_schema.columns 
                            WHERE table_name = 'users' AND column_name = 'avatar_url'
                        ) THEN
                            ALTER TABLE users ADD COLUMN avatar_url TEXT;
                            CREATE INDEX IF NOT EXISTS idx_users_avatar ON users(avatar_url);
                        END IF;
                    END $$;
                """)
            conn.commit()
            print("✅ Added avatar_url column to users table")
        except Exception as e:
            print(f"ℹ️  Avatar column: {e}")
            conn.rollback()
        
        conn.close()
        print("🎉 Avatar migration completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False

# Add these methods to your database.py file in the DatabaseManager class

def update_user_profile(self, user_id: int, full_name: str = None, phone: str = None) -> bool:
    """Update user profile information"""
    try:
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                # Build dynamic update query
                updates = []
                params = []
                
                if full_name is not None:
                    updates.append("full_name = %s")
                    params.append(full_name)
                
                if phone is not None:
                    updates.append("phone = %s")
                    params.append(phone)
                
                if not updates:
                    return True  # Nothing to update
                
                params.append(user_id)
                query = f"""
                    UPDATE users 
                    SET {', '.join(updates)}
                    WHERE user_id = %s
                """
                
                cursor.execute(query, params)
            conn.commit()
        
        print(f"✅ Profile updated for user ID: {user_id}")
        return True
    except Exception as e:
        print(f"❌ Error updating user profile: {e}")
        return False

def update_user_avatar(self, user_id: int, avatar_url: str = None) -> bool:
    """Update user avatar URL"""
    try:
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    UPDATE users 
                    SET avatar_url = %s 
                    WHERE user_id = %s
                """, (avatar_url, user_id))
            conn.commit()
        
        print(f"✅ Avatar updated for user ID: {user_id}")
        return True
    except Exception as e:
        print(f"❌ Error updating avatar: {e}")
        return False

def get_user_by_id_with_avatar(self, user_id: int) -> Optional[Dict]:
    """Get user data by ID with avatar support - UPDATE YOUR EXISTING METHOD"""
    try:
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT user_id, email, phone, role, full_name, created_at, 
                           last_login, phone_verified, email_verified, avatar_url
                    FROM users
                    WHERE user_id = %s AND is_active = TRUE
                """, (user_id,))
                
                user = cursor.fetchone()
                if user:
                    return {
                        "user_id": user[0],
                        "email": user[1],
                        "phone": user[2],
                        "role": user[3],
                        "full_name": user[4],
                        "created_at": user[5].isoformat() if user[5] else None,
                        "last_login": user[6].isoformat() if user[6] else None,
                        "phone_verified": user[7] if user[7] is not None else False,
                        "email_verified": user[8] if user[8] is not None else False,
                        "avatar_url": user[9]
                    }
        return None
    except Exception as e:
        print(f"❌ Error getting user: {e}")
        return None

if __name__ == "__main__":
    success = run_avatar_migration()
    if success:
        print("\n📋 Next steps:")
        print("1. Add the database methods to your database.py file")
        print("2. Add the backend endpoints to your rag_server.py file") 
        print("3. Replace your navigation.tsx component")
        print("4. Create the profile page at app/profile/page.tsx")
        print("5. Create the API routes in app/api/profile/")
        print("6. Create uploads directory: mkdir -p public/uploads/avatars")
        print("7. Restart your servers")
    else:
        print("\n❌ Migration failed. Check your database connection.")