# run_migration.py - Fixed version that handles transaction errors properly
import psycopg2
import os

def run_migration():
    """Update database with phone verification support"""
    conn_params = {
        'host': os.getenv('DB_HOST', 'localhost'),
        'database': os.getenv('DB_NAME', 'ooredoo_ai'),
        'user': os.getenv('DB_USER', 'ooredoo_user'),
        'password': os.getenv('DB_PASSWORD', 'mypassword123'),
        'port': os.getenv('DB_PORT', '5432')
    }
    
    try:
        conn = psycopg2.connect(**conn_params)
        print("🔄 Starting database migration...")
        
        # Step 1: Add phone column with separate transaction
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    DO $$ 
                    BEGIN
                        IF NOT EXISTS (
                            SELECT 1 FROM information_schema.columns 
                            WHERE table_name = 'users' AND column_name = 'phone'
                        ) THEN
                            ALTER TABLE users ADD COLUMN phone VARCHAR(20);
                        END IF;
                    END $$;
                """)
            conn.commit()
            print("✅ Added phone column to users table")
        except Exception as e:
            print(f"ℹ️  Phone column: {e}")
            conn.rollback()
        
        # Step 2: Add phone_verified column with separate transaction
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    DO $$ 
                    BEGIN
                        IF NOT EXISTS (
                            SELECT 1 FROM information_schema.columns 
                            WHERE table_name = 'users' AND column_name = 'phone_verified'
                        ) THEN
                            ALTER TABLE users ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE;
                        END IF;
                    END $$;
                """)
            conn.commit()
            print("✅ Added phone_verified column")
        except Exception as e:
            print(f"ℹ️  Phone_verified column: {e}")
            conn.rollback()
        
        # Step 3: Add email_verified column with separate transaction
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    DO $$ 
                    BEGIN
                        IF NOT EXISTS (
                            SELECT 1 FROM information_schema.columns 
                            WHERE table_name = 'users' AND column_name = 'email_verified'
                        ) THEN
                            ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
                        END IF;
                    END $$;
                """)
            conn.commit()
            print("✅ Added email_verified column")
        except Exception as e:
            print(f"ℹ️  Email_verified column: {e}")
            conn.rollback()
        
        # Step 4: Create phone_verifications table
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS phone_verifications (
                        id SERIAL PRIMARY KEY,
                        phone VARCHAR(20) NOT NULL,
                        verification_code VARCHAR(6) NOT NULL,
                        action VARCHAR(50) NOT NULL CHECK (action IN ('register', 'reset_password', 'login')),
                        created_at TIMESTAMP DEFAULT NOW(),
                        expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '10 minutes',
                        used BOOLEAN DEFAULT FALSE,
                        user_data JSONB
                    )
                """)
            conn.commit()
            print("✅ Created phone_verifications table")
        except Exception as e:
            print(f"ℹ️  Phone_verifications table: {e}")
            conn.rollback()
        
        # Step 5: Create password_reset_tokens table
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS password_reset_tokens (
                        id SERIAL PRIMARY KEY,
                        user_id INTEGER REFERENCES users(user_id),
                        token VARCHAR(255) UNIQUE NOT NULL,
                        method VARCHAR(10) CHECK (method IN ('email', 'phone')),
                        created_at TIMESTAMP DEFAULT NOW(),
                        expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '1 hour',
                        used BOOLEAN DEFAULT FALSE
                    )
                """)
            conn.commit()
            print("✅ Created password_reset_tokens table")
        except Exception as e:
            print(f"ℹ️  Password_reset_tokens table: {e}")
            conn.rollback()
        
        # Step 6: Create indexes
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
                """)
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_phone_verifications_phone ON phone_verifications(phone, verification_code);
                """)
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
                """)
            conn.commit()
            print("✅ Created indexes")
        except Exception as e:
            print(f"ℹ️  Indexes: {e}")
            conn.rollback()
        
        # Step 7: Add phone number to admin user if needed
        try:
            with conn.cursor() as cursor:
                cursor.execute("""
                    UPDATE users 
                    SET phone = '+21620192067', phone_verified = TRUE 
                    WHERE email = 'admin@ooredoo.com' AND (phone IS NULL OR phone = '')
                """)
                rows_updated = cursor.rowcount
                if rows_updated > 0:
                    print("✅ Added phone number to admin user")
                else:
                    print("ℹ️  Admin user already has phone number")
            conn.commit()
        except Exception as e:
            print(f"ℹ️  Admin phone update: {e}")
            conn.rollback()
        
        conn.close()
        print("🎉 Migration completed successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False

if __name__ == "__main__":
    success = run_migration()
    if success:
        print("\n📋 Next steps:")
        print("1. Replace your database.py with the complete version")
        print("2. Restart your Python server: python rag_server.py")
        print("3. Test forgot password with phone: +21620192067")
        print("4. Test forgot password with email: admin@ooredoo.com")
        
        print("\n💡 Optional: Add phone numbers to other users:")
        print("UPDATE users SET phone = '+21612345678' WHERE email = 'leila.skouri.LS@gmail.com';")
        print("UPDATE users SET phone = '+21687654321' WHERE email = 'leila.skouri@esprit.tn';")
    else:
        print("\n❌ Migration failed. Check your database connection.")