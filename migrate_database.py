# migrate_database.py - Run this to update your existing database
import psycopg2
import bcrypt
import os
from typing import Optional

def migrate_database():
    """Migrate existing database to new schema with authentication"""
    
    conn_params = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'database': os.getenv('DB_NAME', 'ooredoo_ai'),
        'user': os.getenv('DB_USER', 'ooredoo_user'),
        'password': os.getenv('DB_PASSWORD', 'mypassword123'),
        'port': os.getenv('DB_PORT', '5432')
    }
    
    try:
        with psycopg2.connect(**conn_params) as conn:
            with conn.cursor() as cursor:
                print("🔄 Starting database migration...")
                
                # Step 1: Create users table
                print("📝 Creating users table...")
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS users (
                        user_id SERIAL PRIMARY KEY,
                        email VARCHAR(255) UNIQUE NOT NULL,
                        password_hash VARCHAR(255) NOT NULL,
                        full_name VARCHAR(255),
                        role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
                        created_at TIMESTAMP DEFAULT NOW(),
                        last_login TIMESTAMP,
                        is_active BOOLEAN DEFAULT TRUE
                    )
                """)
                
                # Step 2: Add user_id column to sessions table (if it doesn't exist)
                print("📝 Updating sessions table...")
                try:
                    cursor.execute("""
                        ALTER TABLE sessions ADD COLUMN user_id INTEGER REFERENCES users(user_id)
                    """)
                    print("✅ Added user_id column to sessions table")
                except psycopg2.errors.DuplicateColumn:
                    print("ℹ️  user_id column already exists in sessions table")
                
                # Step 3: Add user_id and audio_path columns to conversations table
                print("📝 Updating conversations table...")
                try:
                    cursor.execute("""
                        ALTER TABLE conversations ADD COLUMN user_id INTEGER REFERENCES users(user_id)
                    """)
                    print("✅ Added user_id column to conversations table")
                except psycopg2.errors.DuplicateColumn:
                    print("ℹ️  user_id column already exists in conversations table")
                
                try:
                    cursor.execute("""
                        ALTER TABLE conversations ADD COLUMN audio_path TEXT
                    """)
                    print("✅ Added audio_path column to conversations table")
                except psycopg2.errors.DuplicateColumn:
                    print("ℹ️  audio_path column already exists in conversations table")
                
                # Step 4: Create indexes for performance
                print("📝 Creating database indexes...")
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
                    CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
                    CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(session_id);
                    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
                """)
                print("✅ Database indexes created")
                
                # Step 5: Create default admin user
                print("📝 Creating default admin user...")
                cursor.execute("""
                    SELECT email FROM users WHERE email = 'admin@ooredoo.com'
                """)
                if not cursor.fetchone():
                    admin_password = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt())
                    cursor.execute("""
                        INSERT INTO users (email, password_hash, full_name, role)
                        VALUES ('admin@ooredoo.com', %s, 'System Admin', 'admin')
                    """, (admin_password.decode('utf-8'),))
                    print("✅ Default admin user created: admin@ooredoo.com / admin123")
                else:
                    print("ℹ️  Admin user already exists")
                
                conn.commit()
                print("\n🎉 Database migration completed successfully!")
                print("📊 Your existing data has been preserved")
                print("🔐 Authentication system is now ready")
                
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        print("📋 This usually means there's a connection issue or permission problem")
        return False
    
    return True

if __name__ == "__main__":
    migrate_database()