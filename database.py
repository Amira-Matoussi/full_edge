# # import psycopg2
# # import json
# # from datetime import datetime
# # from typing import List, Dict, Optional
# # import os

# # class DatabaseManager:
# #     def __init__(self):
# #         self.conn_params = {
# #             'host': os.getenv('DB_HOST', 'localhost'),
# #             'database': os.getenv('DB_NAME', 'ooredoo_ai'),
# #             'user': os.getenv('DB_USER', 'ooredoo_user'),
# #             'password': os.getenv('DB_PASSWORD', 'mypassword123'),
# #             'port': os.getenv('DB_PORT', '5432')
# #         }
    
# #     def get_connection(self):
# #         return psycopg2.connect(**self.conn_params)
    
# #     def setup_database(self):
# #         with self.get_connection() as conn:
# #             with conn.cursor() as cursor:
# #                 cursor.execute("""
# #                     CREATE TABLE IF NOT EXISTS sessions (
# #                         session_id VARCHAR(255) PRIMARY KEY,
# #                         user_name VARCHAR(255),
# #                         issue_type VARCHAR(100),
# #                         language VARCHAR(10),
# #                         assistant_id INTEGER,
# #                         created_at TIMESTAMP DEFAULT NOW(),
# #                         last_updated TIMESTAMP DEFAULT NOW()
# #                     )
# #                 """)
                
# #                 cursor.execute("""
# #                     CREATE TABLE IF NOT EXISTS conversations (
# #                         id SERIAL PRIMARY KEY,
# #                         session_id VARCHAR(255) REFERENCES sessions(session_id),
# #                         user_message TEXT,
# #                         ai_response TEXT,
# #                         timestamp TIMESTAMP DEFAULT NOW(),
# #                         language VARCHAR(10)
# #                     )
# #                 """)
                
# #             conn.commit()
# #         print("Database tables created successfully")
    
# #     def save_session(self, session_id: str, language: str, assistant_id: int, 
# #                     user_name: str = None, issue_type: str = None):
# #         with self.get_connection() as conn:
# #             with conn.cursor() as cursor:
# #                 cursor.execute("""
# #                     INSERT INTO sessions (session_id, user_name, issue_type, language, assistant_id, last_updated)
# #                     VALUES (%s, %s, %s, %s, %s, NOW())
# #                     ON CONFLICT (session_id) 
# #                     DO UPDATE SET 
# #                         user_name = COALESCE(EXCLUDED.user_name, sessions.user_name),
# #                         issue_type = COALESCE(EXCLUDED.issue_type, sessions.issue_type),
# #                         last_updated = NOW()
# #                 """, (session_id, user_name, issue_type, language, assistant_id))
# #             conn.commit()
    
# #     def save_conversation(self, session_id: str, user_message: str, ai_response: str, language: str):
# #         with self.get_connection() as conn:
# #             with conn.cursor() as cursor:
# #                 cursor.execute("""
# #                     INSERT INTO conversations (session_id, user_message, ai_response, language)
# #                     VALUES (%s, %s, %s, %s)
# #                 """, (session_id, user_message, ai_response, language))
# #             conn.commit()
    
# #     def get_conversation_history(self, session_id: str, limit: int = 10) -> List[Dict]:
# #         with self.get_connection() as conn:
# #             with conn.cursor() as cursor:
# #                 cursor.execute("""
# #                     SELECT user_message, ai_response, timestamp 
# #                     FROM conversations 
# #                     WHERE session_id = %s 
# #                     ORDER BY timestamp DESC 
# #                     LIMIT %s
# #                 """, (session_id, limit))
                
# #                 rows = cursor.fetchall()
# #                 return [
# #                     {
# #                         "user": row[0],
# #                         "ai": row[1], 
# #                         "timestamp": row[2].isoformat()
# #                     }
# #                     for row in reversed(rows)
# #                 ]
# # database.py - REPLACE YOUR EXISTING database.py WITH THIS ENHANCED VERSION
# import psycopg2
# import bcrypt
# import json
# from datetime import datetime
# from typing import List, Dict, Optional
# import os

# class DatabaseManager:
#     def __init__(self):
#         self.conn_params = {
#             'host': os.getenv('DB_HOST', 'localhost'),
#             'database': os.getenv('DB_NAME', 'ooredoo_ai'),
#             'user': os.getenv('DB_USER', 'ooredoo_user'),
#             'password': os.getenv('DB_PASSWORD', 'mypassword123'),
#             'port': os.getenv('DB_PORT', '5432')
#         }
    
#     def get_connection(self):
#         return psycopg2.connect(**self.conn_params)
    
#     def setup_database(self):
#         """Create all necessary tables including users"""
#         with self.get_connection() as conn:
#             with conn.cursor() as cursor:
#                 # Users table - NEW
#                 cursor.execute("""
#                     CREATE TABLE IF NOT EXISTS users (
#                         user_id SERIAL PRIMARY KEY,
#                         email VARCHAR(255) UNIQUE NOT NULL,
#                         password_hash VARCHAR(255) NOT NULL,
#                         full_name VARCHAR(255),
#                         role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
#                         created_at TIMESTAMP DEFAULT NOW(),
#                         last_login TIMESTAMP,
#                         is_active BOOLEAN DEFAULT TRUE
#                     )
#                 """)
                
#                 # Enhanced sessions table with user_id
#                 cursor.execute("""
#                     CREATE TABLE IF NOT EXISTS sessions (
#                         session_id VARCHAR(255) PRIMARY KEY,
#                         user_id INTEGER REFERENCES users(user_id),
#                         user_name VARCHAR(255),
#                         issue_type VARCHAR(100),
#                         language VARCHAR(10),
#                         assistant_id INTEGER,
#                         created_at TIMESTAMP DEFAULT NOW(),
#                         last_updated TIMESTAMP DEFAULT NOW()
#                     )
#                 """)
                
#                 # Enhanced conversations table with user_id and audio
#                 cursor.execute("""
#                     CREATE TABLE IF NOT EXISTS conversations (
#                         id SERIAL PRIMARY KEY,
#                         session_id VARCHAR(255) REFERENCES sessions(session_id),
#                         user_id INTEGER REFERENCES users(user_id),
#                         user_message TEXT,
#                         ai_response TEXT,
#                         audio_path TEXT,
#                         timestamp TIMESTAMP DEFAULT NOW(),
#                         language VARCHAR(10)
#                     )
#                 """)
                
#                 # Create indexes for performance
#                 cursor.execute("""
#                     CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
#                     CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
#                     CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(session_id);
#                     CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
#                 """)
                
#                 # Create default admin user if doesn't exist
#                 cursor.execute("""
#                     SELECT email FROM users WHERE email = 'admin@ooredoo.com'
#                 """)
#                 if not cursor.fetchone():
#                     admin_password = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt())
#                     cursor.execute("""
#                         INSERT INTO users (email, password_hash, full_name, role)
#                         VALUES ('admin@ooredoo.com', %s, 'System Admin', 'admin')
#                     """, (admin_password.decode('utf-8'),))
#                     print("✅ Default admin user created: admin@ooredoo.com / admin123")
                
#             conn.commit()
#         print("✅ Database tables created successfully with authentication")
    
#     # ========== USER AUTHENTICATION METHODS ==========
    
#     def create_user(self, email: str, password: str, full_name: str = None, role: str = "user") -> Optional[int]:
#         """Create a new user with hashed password"""
#         try:
#             password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            
#             with self.get_connection() as conn:
#                 with conn.cursor() as cursor:
#                     cursor.execute("""
#                         INSERT INTO users (email, password_hash, full_name, role)
#                         VALUES (%s, %s, %s, %s)
#                         RETURNING user_id
#                     """, (email, password_hash.decode('utf-8'), full_name, role))
#                     user_id = cursor.fetchone()[0]
#                 conn.commit()
#             print(f"✅ User created: {email} (ID: {user_id})")
#             return user_id
#         except psycopg2.IntegrityError:
#             print(f"❌ User already exists: {email}")
#             return None
#         except Exception as e:
#             print(f"❌ Error creating user: {e}")
#             return None
    
#     def authenticate_user(self, email: str, password: str) -> Optional[Dict]:
#         """Authenticate user and return user data"""
#         try:
#             with self.get_connection() as conn:
#                 with conn.cursor() as cursor:
#                     cursor.execute("""
#                         SELECT user_id, email, password_hash, role, full_name, is_active
#                         FROM users
#                         WHERE email = %s
#                     """, (email,))
                    
#                     user = cursor.fetchone()
#                     if user and user[5]:  # Check if user exists and is active
#                         stored_hash = user[2].encode('utf-8')
#                         if bcrypt.checkpw(password.encode('utf-8'), stored_hash):
#                             # Update last login
#                             cursor.execute("""
#                                 UPDATE users SET last_login = NOW() WHERE user_id = %s
#                             """, (user[0],))
#                             conn.commit()
                            
#                             return {
#                                 "user_id": user[0],
#                                 "email": user[1],
#                                 "role": user[3],
#                                 "full_name": user[4]
#                             }
#             return None
#         except Exception as e:
#             print(f"❌ Authentication error: {e}")
#             return None
    
#     def get_user_by_id(self, user_id: int) -> Optional[Dict]:
#         """Get user data by ID"""
#         try:
#             with self.get_connection() as conn:
#                 with conn.cursor() as cursor:
#                     cursor.execute("""
#                         SELECT user_id, email, role, full_name, created_at, last_login
#                         FROM users
#                         WHERE user_id = %s AND is_active = TRUE
#                     """, (user_id,))
                    
#                     user = cursor.fetchone()
#                     if user:
#                         return {
#                             "user_id": user[0],
#                             "email": user[1],
#                             "role": user[2],
#                             "full_name": user[3],
#                             "created_at": user[4].isoformat() if user[4] else None,
#                             "last_login": user[5].isoformat() if user[5] else None
#                         }
#             return None
#         except Exception as e:
#             print(f"❌ Error getting user: {e}")
#             return None
    
#     # ========== ENHANCED SESSION & CONVERSATION METHODS ==========
    
#     def save_session(self, session_id: str, language: str, assistant_id: int, 
#                     user_id: int = None, user_name: str = None, issue_type: str = None):
#         """Save session with optional user association"""
#         with self.get_connection() as conn:
#             with conn.cursor() as cursor:
#                 cursor.execute("""
#                     INSERT INTO sessions (session_id, user_id, user_name, issue_type, language, assistant_id, last_updated)
#                     VALUES (%s, %s, %s, %s, %s, %s, NOW())
#                     ON CONFLICT (session_id) 
#                     DO UPDATE SET 
#                         user_id = COALESCE(EXCLUDED.user_id, sessions.user_id),
#                         user_name = COALESCE(EXCLUDED.user_name, sessions.user_name),
#                         issue_type = COALESCE(EXCLUDED.issue_type, sessions.issue_type),
#                         last_updated = NOW()
#                 """, (session_id, user_id, user_name, issue_type, language, assistant_id))
#             conn.commit()
    
#     def save_conversation(self, session_id: str, user_message: str, ai_response: str, 
#                          language: str, user_id: int = None, audio_path: str = None):
#         """Save conversation with optional user and audio"""
#         with self.get_connection() as conn:
#             with conn.cursor() as cursor:
#                 cursor.execute("""
#                     INSERT INTO conversations (session_id, user_id, user_message, ai_response, language, audio_path)
#                     VALUES (%s, %s, %s, %s, %s, %s)
#                 """, (session_id, user_id, user_message, ai_response, language, audio_path))
#             conn.commit()
    
#     def get_conversation_history(self, session_id: str = None, user_id: int = None, limit: int = 10) -> List[Dict]:
#         """Get conversation history for session or user"""
#         with self.get_connection() as conn:
#             with conn.cursor() as cursor:
#                 if session_id:
#                     cursor.execute("""
#                         SELECT user_message, ai_response, timestamp, audio_path
#                         FROM conversations 
#                         WHERE session_id = %s 
#                         ORDER BY timestamp DESC 
#                         LIMIT %s
#                     """, (session_id, limit))
#                 elif user_id:
#                     cursor.execute("""
#                         SELECT c.user_message, c.ai_response, c.timestamp, c.audio_path, c.session_id
#                         FROM conversations c
#                         WHERE c.user_id = %s 
#                         ORDER BY c.timestamp DESC 
#                         LIMIT %s
#                     """, (user_id, limit))
#                 else:
#                     return []
                
#                 rows = cursor.fetchall()
#                 return [
#                     {
#                         "user": row[0],
#                         "ai": row[1], 
#                         "timestamp": row[2].isoformat() if row[2] else None,
#                         "audio_path": row[3],
#                         "session_id": row[4] if len(row) > 4 else session_id
#                     }
#                     for row in reversed(rows)
#                 ]
    
#     # ========== ADMIN DASHBOARD METHODS ==========
    
#     def get_all_users(self) -> List[Dict]:
#         """Get all users (admin only)"""
#         with self.get_connection() as conn:
#             with conn.cursor() as cursor:
#                 cursor.execute("""
#                     SELECT user_id, email, full_name, role, created_at, last_login, is_active
#                     FROM users
#                     ORDER BY created_at DESC
#                 """)
                
#                 rows = cursor.fetchall()
#                 return [
#                     {
#                         "user_id": row[0],
#                         "email": row[1],
#                         "full_name": row[2],
#                         "role": row[3],
#                         "created_at": row[4].isoformat() if row[4] else None,
#                         "last_login": row[5].isoformat() if row[5] else None,
#                         "is_active": row[6]
#                     }
#                     for row in rows
#                 ]
    
#     def get_user_statistics(self, user_id: int = None) -> Dict:
#         """Get statistics for dashboard"""
#         with self.get_connection() as conn:
#             with conn.cursor() as cursor:
#                 if user_id:
#                     # Stats for specific user
#                     cursor.execute("""
#                         SELECT 
#                             COUNT(DISTINCT s.session_id) as total_sessions,
#                             COUNT(c.id) as total_conversations,
#                             MAX(c.timestamp) as last_activity
#                         FROM sessions s
#                         LEFT JOIN conversations c ON s.session_id = c.session_id
#                         WHERE s.user_id = %s
#                     """, (user_id,))
#                 else:
#                     # Global stats for admin
#                     cursor.execute("""
#                         SELECT 
#                             COUNT(DISTINCT u.user_id) as total_users,
#                             COUNT(DISTINCT s.session_id) as total_sessions,
#                             COUNT(c.id) as total_conversations,
#                             COUNT(DISTINCT DATE(c.timestamp)) as active_days
#                         FROM users u
#                         LEFT JOIN sessions s ON u.user_id = s.user_id
#                         LEFT JOIN conversations c ON s.session_id = c.session_id
#                     """)
                
#                 result = cursor.fetchone()
#                 columns = [desc[0] for desc in cursor.description]
#                 stats = dict(zip(columns, result)) if result else {}
                
#                 # Convert datetime to string
#                 for key, value in stats.items():
#                     if isinstance(value, datetime):
#                         stats[key] = value.isoformat()
                
#                 return stats
# import psycopg2
# import bcrypt
# import json
# import random
# import string
# from datetime import datetime, timedelta
# from typing import List, Dict, Optional
# import os

# class DatabaseManager:
#     def __init__(self):
#         self.conn_params = {
#             'host': os.getenv('DB_HOST', 'localhost'),
#             'database': os.getenv('DB_NAME', 'ooredoo_ai'),
#             'user': os.getenv('DB_USER', 'ooredoo_user'),
#             'password': os.getenv('DB_PASSWORD', 'mypassword123'),
#             'port': os.getenv('DB_PORT', '5432')
#         }
    
#     def get_connection(self):
#         return psycopg2.connect(**self.conn_params)
    
#     def setup_database(self):
#         """Create all necessary tables including phone verification"""
#         with self.get_connection() as conn:
#             with conn.cursor() as cursor:
#                 # Enhanced users table with phone number
#                 cursor.execute("""
#                     CREATE TABLE IF NOT EXISTS users (
#                         user_id SERIAL PRIMARY KEY,
#                         email VARCHAR(255) UNIQUE NOT NULL,
#                         phone VARCHAR(20),
#                         password_hash VARCHAR(255) NOT NULL,
#                         full_name VARCHAR(255),
#                         role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
#                         created_at TIMESTAMP DEFAULT NOW(),
#                         last_login TIMESTAMP,
#                         is_active BOOLEAN DEFAULT TRUE,
#                         phone_verified BOOLEAN DEFAULT FALSE,
#                         email_verified BOOLEAN DEFAULT FALSE
#                     )
#                 """)

#                 # Add phone column to existing users table if it doesn't exist
#                 try:
#                     cursor.execute("ALTER TABLE users ADD COLUMN phone VARCHAR(20)")
#                     cursor.execute("ALTER TABLE users ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE")
#                     cursor.execute("ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE")
#                     print("✅ Added phone verification columns to users table")
#                 except psycopg2.errors.DuplicateColumn:
#                     print("ℹ️  Phone verification columns already exist")
                
#                 # Phone verification codes table
#                 cursor.execute("""
#                     CREATE TABLE IF NOT EXISTS phone_verifications (
#                         id SERIAL PRIMARY KEY,
#                         phone VARCHAR(20) NOT NULL,
#                         verification_code VARCHAR(6) NOT NULL,
#                         action VARCHAR(50) NOT NULL CHECK (action IN ('register', 'reset_password', 'login')),
#                         created_at TIMESTAMP DEFAULT NOW(),
#                         expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '10 minutes',
#                         used BOOLEAN DEFAULT FALSE,
#                         user_data JSONB,
#                         INDEX(phone, verification_code)
#                     )
#                 """)
                
#                 # Password reset tokens table
#                 cursor.execute("""
#                     CREATE TABLE IF NOT EXISTS password_reset_tokens (
#                         id SERIAL PRIMARY KEY,
#                         user_id INTEGER REFERENCES users(user_id),
#                         token VARCHAR(255) UNIQUE NOT NULL,
#                         method VARCHAR(10) CHECK (method IN ('email', 'phone')),
#                         created_at TIMESTAMP DEFAULT NOW(),
#                         expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '1 hour',
#                         used BOOLEAN DEFAULT FALSE
#                     )
#                 """)
                
#                 # Enhanced sessions table with user_id
#                 cursor.execute("""
#                     CREATE TABLE IF NOT EXISTS sessions (
#                         session_id VARCHAR(255) PRIMARY KEY,
#                         user_id INTEGER REFERENCES users(user_id),
#                         user_name VARCHAR(255),
#                         issue_type VARCHAR(100),
#                         language VARCHAR(10),
#                         assistant_id INTEGER,
#                         created_at TIMESTAMP DEFAULT NOW(),
#                         last_updated TIMESTAMP DEFAULT NOW()
#                     )
#                 """)
                
#                 # Enhanced conversations table with user_id and audio
#                 cursor.execute("""
#                     CREATE TABLE IF NOT EXISTS conversations (
#                         id SERIAL PRIMARY KEY,
#                         session_id VARCHAR(255) REFERENCES sessions(session_id),
#                         user_id INTEGER REFERENCES users(user_id),
#                         user_message TEXT,
#                         ai_response TEXT,
#                         audio_path TEXT,
#                         timestamp TIMESTAMP DEFAULT NOW(),
#                         language VARCHAR(10)
#                     )
#                 """)
                
#                 # Create indexes for performance
#                 cursor.execute("""
#                     CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
#                     CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
#                     CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(session_id);
#                     CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
#                     CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
#                     CREATE INDEX IF NOT EXISTS idx_phone_verifications_phone ON phone_verifications(phone);
#                     CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
#                 """)
                
#                 # Create default admin user if doesn't exist
#                 cursor.execute("""
#                     SELECT email FROM users WHERE email = 'admin@ooredoo.com'
#                 """)
#                 if not cursor.fetchone():
#                     admin_password = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt())
#                     cursor.execute("""
#                         INSERT INTO users (email, password_hash, full_name, role, phone_verified, email_verified)
#                         VALUES ('admin@ooredoo.com', %s, 'System Admin', 'admin', TRUE, TRUE)
#                     """, (admin_password.decode('utf-8'),))
#                     print("✅ Default admin user created: admin@ooredoo.com / admin123")
                
#             conn.commit()
#         print("✅ Database tables created successfully with phone verification")
    
#     # ========== PHONE VERIFICATION METHODS ==========
    
#     def generate_verification_code(self) -> str:
#         """Generate a 6-digit verification code"""
#         return ''.join(random.choices(string.digits, k=6))
    
#     def store_verification_code(self, phone: str, action: str, user_data: Dict = None) -> str:
#         """Store verification code and return it"""
#         verification_code = self.generate_verification_code()
        
#         with self.get_connection() as conn:
#             with conn.cursor() as cursor:
#                 # Invalidate previous codes for this phone
#                 cursor.execute("""
#                     UPDATE phone_verifications 
#                     SET used = TRUE 
#                     WHERE phone = %s AND action = %s AND used = FALSE
#                 """, (phone, action))
                
#                 # Insert new verification code
#                 cursor.execute("""
#                     INSERT INTO phone_verifications (phone, verification_code, action, user_data)
#                     VALUES (%s, %s, %s, %s)
#                 """, (phone, verification_code, action, json.dumps(user_data) if user_data else None))
                
#             conn.commit()
        
#         print(f"✅ Verification code generated for {phone}: {verification_code}")
#         return verification_code
    
#     def verify_phone_code(self, phone: str, code: str, action: str) -> Optional[Dict]:
#         """Verify phone verification code"""
#         with self.get_connection() as conn:
#             with conn.cursor() as cursor:
#                 cursor.execute("""
#                     SELECT id, user_data, created_at, expires_at
#                     FROM phone_verifications
#                     WHERE phone = %s AND verification_code = %s AND action = %s 
#                     AND used = FALSE AND expires_at > NOW()
#                     ORDER BY created_at DESC
#                     LIMIT 1
#                 """, (phone, code, action))
                
#                 result = cursor.fetchone()
#                 if result:
#                     # Mark as used
#                     cursor.execute("""
#                         UPDATE phone_verifications 
#                         SET used = TRUE 
#                         WHERE id = %s
#                     """, (result[0],))
                    
#                     conn.commit()
                    
#                     return {
#                         "id": result[0],
#                         "user_data": json.loads(result[1]) if result[1] else None,
#                         "created_at": result[2],
#                         "expires_at": result[3]
#                     }
        
#         return None
    
#     # ========== ENHANCED USER AUTHENTICATION METHODS ==========
    
#     def create_user(self, email: str, password: str, phone: str = None, full_name: str = None, role: str = "user", phone_verified: bool = False) -> Optional[int]:
#         """Create a new user with optional phone number"""
#         try:
#             password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            
#             with self.get_connection() as conn:
#                 with conn.cursor() as cursor:
#                     cursor.execute("""
#                         INSERT INTO users (email, phone, password_hash, full_name, role, phone_verified)
#                         VALUES (%s, %s, %s, %s, %s, %s)
#                         RETURNING user_id
#                     """, (email, phone, password_hash.decode('utf-8'), full_name, role, phone_verified))
#                     user_id = cursor.fetchone()[0]
#                 conn.commit()
            
#             print(f"✅ User created: {email} (ID: {user_id}) Phone: {phone}")
#             return user_id
#         except psycopg2.IntegrityError as e:
#             if "email" in str(e):
#                 print(f"❌ Email already exists: {email}")
#             elif "phone" in str(e):
#                 print(f"❌ Phone number already exists: {phone}")
#             else:
#                 print(f"❌ User creation failed: {e}")
#             return None
#         except Exception as e:
#             print(f"❌ Error creating user: {e}")
#             return None
    
#     def authenticate_user(self, identifier: str, password: str, login_method: str = "email") -> Optional[Dict]:
#         """Authenticate user by email or phone"""
#         try:
#             with self.get_connection() as conn:
#                 with conn.cursor() as cursor:
#                     if login_method == "email":
#                         field = "email"
#                     elif login_method == "phone":
#                         field = "phone"
#                     else:
#                         return None
                    
#                     cursor.execute(f"""
#                         SELECT user_id, email, phone, password_hash, role, full_name, is_active, phone_verified
#                         FROM users
#                         WHERE {field} = %s
#                     """, (identifier,))
                    
#                     user = cursor.fetchone()
#                     if user and user[6]:  # Check if user exists and is active
#                         stored_hash = user[3].encode('utf-8')
#                         if bcrypt.checkpw(password.encode('utf-8'), stored_hash):
#                             # Update last login
#                             cursor.execute("""
#                                 UPDATE users SET last_login = NOW() WHERE user_id = %s
#                             """, (user[0],))
#                             conn.commit()
                            
#                             return {
#                                 "user_id": user[0],
#                                 "email": user[1],
#                                 "phone": user[2],
#                                 "role": user[4],
#                                 "full_name": user[5],
#                                 "phone_verified": user[7]
#                             }
#             return None
#         except Exception as e:
#             print(f"❌ Authentication error: {e}")
#             return None
    
#     def find_user_by_phone(self, phone: str) -> Optional[Dict]:
#         """Find user by phone number"""
#         try:
#             with self.get_connection() as conn:
#                 with conn.cursor() as cursor:
#                     cursor.execute("""
#                         SELECT user_id, email, phone, role, full_name, is_active
#                         FROM users
#                         WHERE phone = %s AND is_active = TRUE
#                     """, (phone,))
                    
#                     user = cursor.fetchone()
#                     if user:
#                         return {
#                             "user_id": user[0],
#                             "email": user[1],
#                             "phone": user[2],
#                             "role": user[3],
#                             "full_name": user[4]
#                         }
#             return None
#         except Exception as e:
#             print(f"❌ Error finding user by phone: {e}")
#             return None
    
#     def update_user_password(self, user_id: int, new_password: str) -> bool:
#         """Update user password"""
#         try:
#             password_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
            
#             with self.get_connection() as conn:
#                 with conn.cursor() as cursor:
#                     cursor.execute("""
#                         UPDATE users 
#                         SET password_hash = %s 
#                         WHERE user_id = %s
#                     """, (password_hash.decode('utf-8'), user_id))
#                 conn.commit()
            
#             print(f"✅ Password updated for user ID: {user_id}")
#             return True
#         except Exception as e:
#             print(f"❌ Error updating password: {e}")
#             return False
    
#     # ========== PASSWORD RESET METHODS ==========
    
#     def create_password_reset_token(self, user_id: int, method: str) -> str:
#         """Create password reset token"""
#         token = ''.join(random.choices(string.ascii_letters + string.digits, k=32))
        
#         with self.get_connection() as conn:
#             with conn.cursor() as cursor:
#                 # Invalidate previous tokens for this user
#                 cursor.execute("""
#                     UPDATE password_reset_tokens 
#                     SET used = TRUE 
#                     WHERE user_id = %s AND used = FALSE
#                 """, (user_id,))
                
#                 # Create new token
#                 cursor.execute("""
#                     INSERT INTO password_reset_tokens (user_id, token, method)
#                     VALUES (%s, %s, %s)
#                 """, (user_id, token, method))
                
#             conn.commit()
        
#         return token
    
#     def verify_reset_token(self, token: str) -> Optional[int]:
#         """Verify password reset token and return user_id"""
#         with self.get_connection() as conn:
#             with conn.cursor() as cursor:
#                 cursor.execute("""
#                     SELECT user_id
#                     FROM password_reset_tokens
#                     WHERE token = %s AND used = FALSE AND expires_at > NOW()
#                 """, (token,))
                
#                 result = cursor.fetchone()
#                 if result:
#                     # Mark token as used
#                     cursor.execute("""
#                         UPDATE password_reset_tokens 
#                         SET used = TRUE 
#                         WHERE token = %s
#                     """, (token,))
#                     conn.commit()
                    
#                     return result[0]
        
#         return None
    
    
#     # Keep all your existing methods...
#     def save_session(self, session_id: str, language: str, assistant_id: int, 
#                     user_id: int = None, user_name: str = None, issue_type: str = None):
#         """Save session with optional user association"""
#         with self.get_connection() as conn:
#             with conn.cursor() as cursor:
#                 cursor.execute("""
#                     INSERT INTO sessions (session_id, user_id, user_name, issue_type, language, assistant_id, last_updated)
#                     VALUES (%s, %s, %s, %s, %s, %s, NOW())
#                     ON CONFLICT (session_id) 
#                     DO UPDATE SET 
#                         user_id = COALESCE(EXCLUDED.user_id, sessions.user_id),
#                         user_name = COALESCE(EXCLUDED.user_name, sessions.user_name),
#                         issue_type = COALESCE(EXCLUDED.issue_type, sessions.issue_type),
#                         last_updated = NOW()
#                 """, (session_id, user_id, user_name, issue_type, language, assistant_id))
#             conn.commit()
    
#     def save_conversation(self, session_id: str, user_message: str, ai_response: str, 
#                          language: str, user_id: int = None, audio_path: str = None):
#         """Save conversation with optional user and audio"""
#         with self.get_connection() as conn:
#             with conn.cursor() as cursor:
#                 cursor.execute("""
#                     INSERT INTO conversations (session_id, user_id, user_message, ai_response, language, audio_path)
#                     VALUES (%s, %s, %s, %s, %s, %s)
#                 """, (session_id, user_id, user_message, ai_response, language, audio_path))
#             conn.commit()
    
#     def get_conversation_history(self, session_id: str = None, user_id: int = None, limit: int = 10) -> List[Dict]:
#         """Get conversation history for session or user"""
#         with self.get_connection() as conn:
#             with conn.cursor() as cursor:
#                 if session_id:
#                     cursor.execute("""
#                         SELECT user_message, ai_response, timestamp, audio_path
#                         FROM conversations 
#                         WHERE session_id = %s 
#                         ORDER BY timestamp DESC 
#                         LIMIT %s
#                     """, (session_id, limit))
#                 elif user_id:
#                     cursor.execute("""
#                         SELECT c.user_message, c.ai_response, c.timestamp, c.audio_path, c.session_id
#                         FROM conversations c
#                         WHERE c.user_id = %s 
#                         ORDER BY c.timestamp DESC 
#                         LIMIT %s
#                     """, (user_id, limit))
#                 else:
#                     return []
                
#                 rows = cursor.fetchall()
#                 return [
#                     {
#                         "user": row[0],
#                         "ai": row[1], 
#                         "timestamp": row[2].isoformat() if row[2] else None,
#                         "audio_path": row[3],
#                         "session_id": row[4] if len(row) > 4 else session_id
#                     }
#                     for row in reversed(rows)
#                 ]
    
#     def get_all_users(self) -> List[Dict]:
#         """Get all users (admin only)"""
#         with self.get_connection() as conn:
#             with conn.cursor() as cursor:
#                 cursor.execute("""
#                     SELECT user_id, email, phone, full_name, role, created_at, last_login, is_active, phone_verified
#                     FROM users
#                     ORDER BY created_at DESC
#                 """)
                
#                 rows = cursor.fetchall()
#                 return [
#                     {
#                         "user_id": row[0],
#                         "email": row[1],
#                         "phone": row[2],
#                         "full_name": row[3],
#                         "role": row[4],
#                         "created_at": row[5].isoformat() if row[5] else None,
#                         "last_login": row[6].isoformat() if row[6] else None,
#                         "is_active": row[7],
#                         "phone_verified": row[8]
#                     }
#                     for row in rows
#                 ]
    
#     def get_user_statistics(self, user_id: int = None) -> Dict:
#         """Get statistics for dashboard"""
#         with self.get_connection() as conn:
#             with conn.cursor() as cursor:
#                 if user_id:
#                     # Stats for specific user
#                     cursor.execute("""
#                         SELECT 
#                             COUNT(DISTINCT s.session_id) as total_sessions,
#                             COUNT(c.id) as total_conversations,
#                             MAX(c.timestamp) as last_activity
#                         FROM sessions s
#                         LEFT JOIN conversations c ON s.session_id = c.session_id
#                         WHERE s.user_id = %s
#                     """, (user_id,))
#                 else:
#                     # Global stats for admin
#                     cursor.execute("""
#                         SELECT 
#                             COUNT(DISTINCT u.user_id) as total_users,
#                             COUNT(DISTINCT s.session_id) as total_sessions,
#                             COUNT(c.id) as total_conversations,
#                             COUNT(DISTINCT DATE(c.timestamp)) as active_days
#                         FROM users u
#                         LEFT JOIN sessions s ON u.user_id = s.user_id
#                         LEFT JOIN conversations c ON s.session_id = c.session_id
#                     """)
                
#                 result = cursor.fetchone()
#                 columns = [desc[0] for desc in cursor.description]
#                 stats = dict(zip(columns, result)) if result else {}
                
#                 # Convert datetime to string
#                 for key, value in stats.items():
#                     if isinstance(value, datetime):
#                         stats[key] = value.isoformat()
                
#                 return stats
# import psycopg2
# import bcrypt
# import json
# import random
# import string
# from datetime import datetime, timedelta
# from typing import List, Dict, Optional
# import os

# class DatabaseManager:
#     def __init__(self):
#         self.conn_params = {
#             'host': os.getenv('DB_HOST', 'localhost'),
#             'database': os.getenv('DB_NAME', 'ooredoo_ai'),
#             'user': os.getenv('DB_USER', 'ooredoo_user'),
#             'password': os.getenv('DB_PASSWORD', 'mypassword123'),
#             'port': os.getenv('DB_PORT', '5432')
#         }
    
#     def get_connection(self):
#         return psycopg2.connect(**self.conn_params)
    
#     def setup_database(self):
#         """Create all necessary tables with proper transaction handling"""
#         conn = None
#         try:
#             conn = self.get_connection()
#             conn.autocommit = True  # Enable autocommit to avoid transaction issues
            
#             with conn.cursor() as cursor:
#                 # Enhanced users table with phone number
#                 cursor.execute("""
#                     CREATE TABLE IF NOT EXISTS users (
#                         user_id SERIAL PRIMARY KEY,
#                         email VARCHAR(255) UNIQUE NOT NULL,
#                         phone VARCHAR(20),
#                         password_hash VARCHAR(255) NOT NULL,
#                         full_name VARCHAR(255),
#                         role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
#                         created_at TIMESTAMP DEFAULT NOW(),
#                         last_login TIMESTAMP,
#                         is_active BOOLEAN DEFAULT TRUE,
#                         phone_verified BOOLEAN DEFAULT FALSE,
#                         email_verified BOOLEAN DEFAULT FALSE,
#                         avatar_url TEXT
#                     )
#                 """)
                
#                 # Add columns if they don't exist (using DO block to avoid errors)
#                 cursor.execute("""
#                     DO $$ 
#                     BEGIN
#                         IF NOT EXISTS (
#                             SELECT 1 FROM information_schema.columns 
#                             WHERE table_name = 'users' AND column_name = 'phone'
#                         ) THEN
#                             ALTER TABLE users ADD COLUMN phone VARCHAR(20);
#                         END IF;
                        
#                         IF NOT EXISTS (
#                             SELECT 1 FROM information_schema.columns 
#                             WHERE table_name = 'users' AND column_name = 'phone_verified'
#                         ) THEN
#                             ALTER TABLE users ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE;
#                         END IF;
                        
#                         IF NOT EXISTS (
#                             SELECT 1 FROM information_schema.columns 
#                             WHERE table_name = 'users' AND column_name = 'email_verified'
#                         ) THEN
#                             ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
#                         END IF;
#                     END $$;
#                 """)
                
#                 # Phone verification codes table
#                 cursor.execute("""
#                     CREATE TABLE IF NOT EXISTS phone_verifications (
#                         id SERIAL PRIMARY KEY,
#                         phone VARCHAR(20) NOT NULL,
#                         verification_code VARCHAR(6) NOT NULL,
#                         action VARCHAR(50) NOT NULL CHECK (action IN ('register', 'reset_password', 'login')),
#                         created_at TIMESTAMP DEFAULT NOW(),
#                         expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '10 minutes',
#                         used BOOLEAN DEFAULT FALSE,
#                         user_data JSONB
#                     )
#                 """)
                
#                 # Password reset tokens table
#                 cursor.execute("""
#                     CREATE TABLE IF NOT EXISTS password_reset_tokens (
#                         id SERIAL PRIMARY KEY,
#                         user_id INTEGER REFERENCES users(user_id),
#                         token VARCHAR(255) UNIQUE NOT NULL,
#                         method VARCHAR(10) CHECK (method IN ('email', 'phone')),
#                         created_at TIMESTAMP DEFAULT NOW(),
#                         expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '1 hour',
#                         used BOOLEAN DEFAULT FALSE
#                     )
#                 """)
                
#                 # Enhanced sessions table with user_id
#                 cursor.execute("""
#                     CREATE TABLE IF NOT EXISTS sessions (
#                         session_id VARCHAR(255) PRIMARY KEY,
#                         user_id INTEGER REFERENCES users(user_id),
#                         user_name VARCHAR(255),
#                         issue_type VARCHAR(100),
#                         language VARCHAR(10),
#                         assistant_id INTEGER,
#                         created_at TIMESTAMP DEFAULT NOW(),
#                         last_updated TIMESTAMP DEFAULT NOW()
#                     )
#                 """)
                
#                 # Enhanced conversations table with user_id and audio
#                 cursor.execute("""
#                     CREATE TABLE IF NOT EXISTS conversations (
#                         id SERIAL PRIMARY KEY,
#                         session_id VARCHAR(255) REFERENCES sessions(session_id),
#                         user_id INTEGER REFERENCES users(user_id),
#                         user_message TEXT,
#                         ai_response TEXT,
#                         audio_path TEXT,
#                         timestamp TIMESTAMP DEFAULT NOW(),
#                         language VARCHAR(10)
#                     )
#                 """)
                
#                 # Create indexes for performance
#                 cursor.execute("""
#                     CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
#                     CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
#                     CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(session_id);
#                     CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
#                     CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
#                     CREATE INDEX IF NOT EXISTS idx_phone_verifications_phone ON phone_verifications(phone);
#                     CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
#                 """)
                
#                 # Create default admin user if doesn't exist
#                 cursor.execute("""
#                     SELECT email FROM users WHERE email = 'admin@ooredoo.com'
#                 """)
#                 if not cursor.fetchone():
#                     admin_password = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt())
#                     cursor.execute("""
#                         INSERT INTO users (email, password_hash, full_name, role, phone_verified, email_verified, phone)
#                         VALUES ('admin@ooredoo.com', %s, 'System Admin', 'admin', TRUE, TRUE, '+21620192067')
#                     """, (admin_password.decode('utf-8'),))
#                     print("✅ Default admin user created: admin@ooredoo.com / admin123")
                
#             print("✅ Database tables created successfully with phone verification")
#             return True
            
#         except Exception as e:
#             print(f"❌ Database setup error: {e}")
#             if conn:
#                 conn.rollback()
#             return False
#         finally:
#             if conn:
#                 conn.close()
    
#     # ========== PHONE VERIFICATION METHODS ==========
    
#     def generate_verification_code(self) -> str:
#         """Generate a 6-digit verification code"""
#         return ''.join(random.choices(string.digits, k=6))
    
#     def store_verification_code(self, phone: str, action: str, user_data: Dict = None) -> str:
#         """Store verification code and return it"""
#         verification_code = self.generate_verification_code()
        
#         with self.get_connection() as conn:
#             with conn.cursor() as cursor:
#                 # Invalidate previous codes for this phone
#                 cursor.execute("""
#                     UPDATE phone_verifications 
#                     SET used = TRUE 
#                     WHERE phone = %s AND action = %s AND used = FALSE
#                 """, (phone, action))
                
#                 # Insert new verification code
#                 cursor.execute("""
#                     INSERT INTO phone_verifications (phone, verification_code, action, user_data)
#                     VALUES (%s, %s, %s, %s)
#                 """, (phone, verification_code, action, json.dumps(user_data) if user_data else None))
                
#             conn.commit()
        
#         print(f"✅ Verification code generated for {phone}: {verification_code}")
#         return verification_code
    
#     def verify_phone_code(self, phone: str, code: str, action: str) -> Optional[Dict]:
#         """Verify phone verification code"""
#         with self.get_connection() as conn:
#             with conn.cursor() as cursor:
#                 cursor.execute("""
#                     SELECT id, user_data, created_at, expires_at
#                     FROM phone_verifications
#                     WHERE phone = %s AND verification_code = %s AND action = %s 
#                     AND used = FALSE AND expires_at > NOW()
#                     ORDER BY created_at DESC
#                     LIMIT 1
#                 """, (phone, code, action))
                
#                 result = cursor.fetchone()
#                 if result:
#                     # Mark as used
#                     cursor.execute("""
#                         UPDATE phone_verifications 
#                         SET used = TRUE 
#                         WHERE id = %s
#                     """, (result[0],))
                    
#                     conn.commit()
                    
#                     return {
#                         "id": result[0],
#                         "user_data": json.loads(result[1]) if result[1] else None,
#                         "created_at": result[2],
#                         "expires_at": result[3]
#                     }
        
#         return None
    
#     # ========== ENHANCED USER AUTHENTICATION METHODS ==========
    
#     def create_user(self, email: str, password: str, phone: str = None, full_name: str = None, role: str = "user", phone_verified: bool = False) -> Optional[int]:
#         """Create a new user with optional phone number"""
#         try:
#             password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            
#             with self.get_connection() as conn:
#                 with conn.cursor() as cursor:
#                     cursor.execute("""
#                         INSERT INTO users (email, phone, password_hash, full_name, role, phone_verified)
#                         VALUES (%s, %s, %s, %s, %s, %s)
#                         RETURNING user_id
#                     """, (email, phone, password_hash.decode('utf-8'), full_name, role, phone_verified))
#                     user_id = cursor.fetchone()[0]
#                 conn.commit()
            
#             print(f"✅ User created: {email} (ID: {user_id}) Phone: {phone}")
#             return user_id
#         except psycopg2.IntegrityError as e:
#             if "email" in str(e):
#                 print(f"❌ Email already exists: {email}")
#             elif "phone" in str(e):
#                 print(f"❌ Phone number already exists: {phone}")
#             else:
#                 print(f"❌ User creation failed: {e}")
#             return None
#         except Exception as e:
#             print(f"❌ Error creating user: {e}")
#             return None
    
#     def authenticate_user(self, identifier: str, password: str, login_method: str = "email") -> Optional[Dict]:
#         """Authenticate user by email or phone"""
#         try:
#             with self.get_connection() as conn:
#                 with conn.cursor() as cursor:
#                     if login_method == "email":
#                         field = "email"
#                     elif login_method == "phone":
#                         field = "phone"
#                     else:
#                         return None
                    
#                     cursor.execute(f"""
#                         SELECT user_id, email, phone, password_hash, role, full_name, is_active, phone_verified
#                         FROM users
#                         WHERE {field} = %s
#                     """, (identifier,))
                    
#                     user = cursor.fetchone()
#                     if user and user[6]:  # Check if user exists and is active
#                         stored_hash = user[3].encode('utf-8')
#                         if bcrypt.checkpw(password.encode('utf-8'), stored_hash):
#                             # Update last login
#                             cursor.execute("""
#                                 UPDATE users SET last_login = NOW() WHERE user_id = %s
#                             """, (user[0],))
#                             conn.commit()
                            
#                             return {
#                                 "user_id": user[0],
#                                 "email": user[1],
#                                 "phone": user[2],
#                                 "role": user[4],
#                                 "full_name": user[5],
#                                 "phone_verified": user[7]
#                             }
#             return None
#         except Exception as e:
#             print(f"❌ Authentication error: {e}")
#             return None
    
#     def find_user_by_phone(self, phone: str) -> Optional[Dict]:
#         """Find user by phone number"""
#         try:
#             with self.get_connection() as conn:
#                 with conn.cursor() as cursor:
#                     cursor.execute("""
#                         SELECT user_id, email, phone, role, full_name, is_active
#                         FROM users
#                         WHERE phone = %s AND is_active = TRUE
#                     """, (phone,))
                    
#                     user = cursor.fetchone()
#                     if user:
#                         return {
#                             "user_id": user[0],
#                             "email": user[1],
#                             "phone": user[2],
#                             "role": user[3],
#                             "full_name": user[4]
#                         }
#             return None
#         except Exception as e:
#             print(f"❌ Error finding user by phone: {e}")
#             return None
    
#     def find_user_by_email(self, email: str) -> Optional[Dict]:
#         """Find user by email address"""
#         try:
#             with self.get_connection() as conn:
#                 with conn.cursor() as cursor:
#                     cursor.execute("""
#                         SELECT user_id, email, phone, role, full_name, is_active
#                         FROM users
#                         WHERE email = %s AND is_active = TRUE
#                     """, (email,))
                    
#                     user = cursor.fetchone()
#                     if user:
#                         return {
#                             "user_id": user[0],
#                             "email": user[1],
#                             "phone": user[2],
#                             "role": user[3],
#                             "full_name": user[4]
#                         }
#             return None
#         except Exception as e:
#             print(f"❌ Error finding user by email: {e}")
#             return None
    
#     def get_user_by_id(self, user_id: int) -> Optional[Dict]:
#         """Get user data by ID"""
#         try:
#             with self.get_connection() as conn:
#                 with conn.cursor() as cursor:
#                     cursor.execute("""
#                         SELECT user_id, email, phone, role, full_name, created_at, last_login, phone_verified
#                         FROM users
#                         WHERE user_id = %s AND is_active = TRUE
#                     """, (user_id,))
                    
#                     user = cursor.fetchone()
#                     if user:
#                         return {
#                             "user_id": user[0],
#                             "email": user[1],
#                             "phone": user[2],
#                             "role": user[3],
#                             "full_name": user[4],
#                             "created_at": user[5].isoformat() if user[5] else None,
#                             "last_login": user[6].isoformat() if user[6] else None,
#                             "phone_verified": user[7]
#                         }
#             return None
#         except Exception as e:
#             print(f"❌ Error getting user: {e}")
#             return None
    
#     def update_user_password(self, user_id: int, new_password: str) -> bool:
#         """Update user password"""
#         try:
#             password_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
            
#             with self.get_connection() as conn:
#                 with conn.cursor() as cursor:
#                     cursor.execute("""
#                         UPDATE users 
#                         SET password_hash = %s 
#                         WHERE user_id = %s
#                     """, (password_hash.decode('utf-8'), user_id))
#                 conn.commit()
            
#             print(f"✅ Password updated for user ID: {user_id}")
#             return True
#         except Exception as e:
#             print(f"❌ Error updating password: {e}")
#             return False
    
#     # ========== PASSWORD RESET METHODS ==========
    
#     def create_password_reset_token(self, user_id: int, method: str) -> str:
#         """Create password reset token"""
#         token = ''.join(random.choices(string.ascii_letters + string.digits, k=32))
        
#         with self.get_connection() as conn:
#             with conn.cursor() as cursor:
#                 # Invalidate previous tokens for this user
#                 cursor.execute("""
#                     UPDATE password_reset_tokens 
#                     SET used = TRUE 
#                     WHERE user_id = %s AND used = FALSE
#                 """, (user_id,))
                
#                 # Create new token
#                 cursor.execute("""
#                     INSERT INTO password_reset_tokens (user_id, token, method)
#                     VALUES (%s, %s, %s)
#                 """, (user_id, token, method))
                
#             conn.commit()
        
#         return token
    
#     def verify_reset_token(self, token: str) -> Optional[int]:
#         """Verify password reset token and return user_id"""
#         with self.get_connection() as conn:
#             with conn.cursor() as cursor:
#                 cursor.execute("""
#                     SELECT user_id
#                     FROM password_reset_tokens
#                     WHERE token = %s AND used = FALSE AND expires_at > NOW()
#                 """, (token,))
                
#                 result = cursor.fetchone()
#                 if result:
#                     # Mark token as used
#                     cursor.execute("""
#                         UPDATE password_reset_tokens 
#                         SET used = TRUE 
#                         WHERE token = %s
#                     """, (token,))
#                     conn.commit()
                    
#                     return result[0]
        
#         return None
    
#     # ========== SESSION & CONVERSATION METHODS ==========
    
#     def save_session(self, session_id: str, language: str, assistant_id: int, 
#                     user_id: int = None, user_name: str = None, issue_type: str = None):
#         """Save session with optional user association"""
#         with self.get_connection() as conn:
#             with conn.cursor() as cursor:
#                 cursor.execute("""
#                     INSERT INTO sessions (session_id, user_id, user_name, issue_type, language, assistant_id, last_updated)
#                     VALUES (%s, %s, %s, %s, %s, %s, NOW())
#                     ON CONFLICT (session_id) 
#                     DO UPDATE SET 
#                         user_id = COALESCE(EXCLUDED.user_id, sessions.user_id),
#                         user_name = COALESCE(EXCLUDED.user_name, sessions.user_name),
#                         issue_type = COALESCE(EXCLUDED.issue_type, sessions.issue_type),
#                         last_updated = NOW()
#                 """, (session_id, user_id, user_name, issue_type, language, assistant_id))
#             conn.commit()
    
#     def save_conversation(self, session_id: str, user_message: str, ai_response: str, 
#                          language: str, user_id: int = None, audio_path: str = None):
#         """Save conversation with optional user and audio"""
#         with self.get_connection() as conn:
#             with conn.cursor() as cursor:
#                 cursor.execute("""
#                     INSERT INTO conversations (session_id, user_id, user_message, ai_response, language, audio_path)
#                     VALUES (%s, %s, %s, %s, %s, %s)
#                 """, (session_id, user_id, user_message, ai_response, language, audio_path))
#             conn.commit()
    
#     def get_conversation_history(self, session_id: str = None, user_id: int = None, limit: int = 10) -> List[Dict]:
#         """Get conversation history for session or user"""
#         with self.get_connection() as conn:
#             with conn.cursor() as cursor:
#                 if session_id:
#                     cursor.execute("""
#                         SELECT user_message, ai_response, timestamp, audio_path
#                         FROM conversations 
#                         WHERE session_id = %s 
#                         ORDER BY timestamp DESC 
#                         LIMIT %s
#                     """, (session_id, limit))
#                 elif user_id:
#                     cursor.execute("""
#                         SELECT c.user_message, c.ai_response, c.timestamp, c.audio_path, c.session_id
#                         FROM conversations c
#                         WHERE c.user_id = %s 
#                         ORDER BY c.timestamp DESC 
#                         LIMIT %s
#                     """, (user_id, limit))
#                 else:
#                     return []
                
#                 rows = cursor.fetchall()
#                 return [
#                     {
#                         "user": row[0],
#                         "ai": row[1], 
#                         "timestamp": row[2].isoformat() if row[2] else None,
#                         "audio_path": row[3],
#                         "session_id": row[4] if len(row) > 4 else session_id
#                     }
#                     for row in reversed(rows)
#                 ]
    
#     # ========== ADMIN DASHBOARD METHODS ==========
    
#     def get_all_users(self) -> List[Dict]:
#         """Get all users (admin only)"""
#         with self.get_connection() as conn:
#             with conn.cursor() as cursor:
#                 cursor.execute("""
#                     SELECT user_id, email, phone, full_name, role, created_at, last_login, is_active, phone_verified
#                     FROM users
#                     ORDER BY created_at DESC
#                 """)
                
#                 rows = cursor.fetchall()
#                 return [
#                     {
#                         "user_id": row[0],
#                         "email": row[1],
#                         "phone": row[2],
#                         "full_name": row[3],
#                         "role": row[4],
#                         "created_at": row[5].isoformat() if row[5] else None,
#                         "last_login": row[6].isoformat() if row[6] else None,
#                         "is_active": row[7],
#                         "phone_verified": row[8]
#                     }
#                     for row in rows
#                 ]
    
#     def get_user_statistics(self, user_id: int = None) -> Dict:
#         """Get statistics for dashboard"""
#         with self.get_connection() as conn:
#             with conn.cursor() as cursor:
#                 if user_id:
#                     # Stats for specific user
#                     cursor.execute("""
#                         SELECT 
#                             COUNT(DISTINCT s.session_id) as total_sessions,
#                             COUNT(c.id) as total_conversations,
#                             MAX(c.timestamp) as last_activity
#                         FROM sessions s
#                         LEFT JOIN conversations c ON s.session_id = c.session_id
#                         WHERE s.user_id = %s
#                     """, (user_id,))
#                 else:
#                     # Global stats for admin
#                     cursor.execute("""
#                         SELECT 
#                             COUNT(DISTINCT u.user_id) as total_users,
#                             COUNT(DISTINCT s.session_id) as total_sessions,
#                             COUNT(c.id) as total_conversations,
#                             COUNT(DISTINCT DATE(c.timestamp)) as active_days
#                         FROM users u
#                         LEFT JOIN sessions s ON u.user_id = s.user_id
#                         LEFT JOIN conversations c ON s.session_id = c.session_id
#                     """)
                
#                 result = cursor.fetchone()
#                 columns = [desc[0] for desc in cursor.description]
#                 stats = dict(zip(columns, result)) if result else {}
                
#                 # Convert datetime to string
#                 for key, value in stats.items():
#                     if isinstance(value, datetime):
#                         stats[key] = value.isoformat()
                
#                 return stats

# import psycopg2
# import bcrypt
# import json
# import random
# import string
# from datetime import datetime, timedelta
# from typing import List, Dict, Optional
# import os

# class DatabaseManager:
#     def __init__(self):
#         self.conn_params = {
#             'host': os.getenv('DB_HOST', 'localhost'),
#             'database': os.getenv('DB_NAME', 'ooredoo_ai'),
#             'user': os.getenv('DB_USER', 'ooredoo_user'),
#             'password': os.getenv('DB_PASSWORD', 'mypassword123'),
#             'port': os.getenv('DB_PORT', '5432')
#         }
    
#     def get_connection(self):
#         return psycopg2.connect(**self.conn_params)
    
#     def setup_database(self):
#         """Create all necessary tables with proper transaction handling"""
#         conn = None
#         try:
#             conn = self.get_connection()
#             conn.autocommit = True  # Enable autocommit to avoid transaction issues
            
#             with conn.cursor() as cursor:
#                 # Enhanced users table with phone number
#                 cursor.execute("""
#                     CREATE TABLE IF NOT EXISTS users (
#                         user_id SERIAL PRIMARY KEY,
#                         email VARCHAR(255) UNIQUE NOT NULL,
#                         phone VARCHAR(20),
#                         password_hash VARCHAR(255) NOT NULL,
#                         full_name VARCHAR(255),
#                         role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
#                         created_at TIMESTAMP DEFAULT NOW(),
#                         last_login TIMESTAMP,
#                         is_active BOOLEAN DEFAULT TRUE,
#                         phone_verified BOOLEAN DEFAULT FALSE,
#                         email_verified BOOLEAN DEFAULT FALSE,
#                         avatar_url TEXT
#                     )
#                 """)
                
#                 # Add columns if they don't exist (using DO block to avoid errors)
#                 cursor.execute("""
#                     DO $$ 
#                     BEGIN
#                         IF NOT EXISTS (
#                             SELECT 1 FROM information_schema.columns 
#                             WHERE table_name = 'users' AND column_name = 'phone'
#                         ) THEN
#                             ALTER TABLE users ADD COLUMN phone VARCHAR(20);
#                         END IF;
                        
#                         IF NOT EXISTS (
#                             SELECT 1 FROM information_schema.columns 
#                             WHERE table_name = 'users' AND column_name = 'phone_verified'
#                         ) THEN
#                             ALTER TABLE users ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE;
#                         END IF;
                        
#                         IF NOT EXISTS (
#                             SELECT 1 FROM information_schema.columns 
#                             WHERE table_name = 'users' AND column_name = 'email_verified'
#                         ) THEN
#                             ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
#                         END IF;
                        
#                         IF NOT EXISTS (
#                             SELECT 1 FROM information_schema.columns 
#                             WHERE table_name = 'users' AND column_name = 'avatar_url'
#                         ) THEN
#                             ALTER TABLE users ADD COLUMN avatar_url TEXT;
#                         END IF;
#                     END $$;
#                 """)
                
#                 # Phone verification codes table
#                 cursor.execute("""
#                     CREATE TABLE IF NOT EXISTS phone_verifications (
#                         id SERIAL PRIMARY KEY,
#                         phone VARCHAR(20) NOT NULL,
#                         verification_code VARCHAR(6) NOT NULL,
#                         action VARCHAR(50) NOT NULL CHECK (action IN ('register', 'reset_password', 'login')),
#                         created_at TIMESTAMP DEFAULT NOW(),
#                         expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '10 minutes',
#                         used BOOLEAN DEFAULT FALSE,
#                         user_data JSONB
#                     )
#                 """)
                
#                 # Password reset tokens table
#                 cursor.execute("""
#                     CREATE TABLE IF NOT EXISTS password_reset_tokens (
#                         id SERIAL PRIMARY KEY,
#                         user_id INTEGER REFERENCES users(user_id),
#                         token VARCHAR(255) UNIQUE NOT NULL,
#                         method VARCHAR(10) CHECK (method IN ('email', 'phone')),
#                         created_at TIMESTAMP DEFAULT NOW(),
#                         expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '1 hour',
#                         used BOOLEAN DEFAULT FALSE
#                     )
#                 """)
                
#                 # Enhanced sessions table with user_id
#                 cursor.execute("""
#                     CREATE TABLE IF NOT EXISTS sessions (
#                         session_id VARCHAR(255) PRIMARY KEY,
#                         user_id INTEGER REFERENCES users(user_id),
#                         user_name VARCHAR(255),
#                         issue_type VARCHAR(100),
#                         language VARCHAR(10),
#                         assistant_id INTEGER,
#                         created_at TIMESTAMP DEFAULT NOW(),
#                         last_updated TIMESTAMP DEFAULT NOW()
#                     )
#                 """)
                
#                 # Enhanced conversations table with dual audio support
#                 cursor.execute("""
#                     CREATE TABLE IF NOT EXISTS conversations (
#                         id SERIAL PRIMARY KEY,
#                         session_id VARCHAR(255) REFERENCES sessions(session_id),
#                         user_id INTEGER REFERENCES users(user_id),
#                         user_message TEXT,
#                         ai_response TEXT,
#                         user_audio_path TEXT,
#                         ai_audio_path TEXT,
#                         timestamp TIMESTAMP DEFAULT NOW(),
#                         language VARCHAR(10)
#                     )
#                 """)
                
#                 # Update existing conversations table to support dual audio
#                 cursor.execute("""
#                     DO $$ 
#                     BEGIN
#                         -- Add ai_audio_path column if it doesn't exist
#                         IF NOT EXISTS (
#                             SELECT 1 FROM information_schema.columns 
#                             WHERE table_name = 'conversations' AND column_name = 'ai_audio_path'
#                         ) THEN
#                             ALTER TABLE conversations ADD COLUMN ai_audio_path TEXT;
#                         END IF;
                        
#                         -- Rename audio_path to user_audio_path if needed
#                         IF EXISTS (
#                             SELECT 1 FROM information_schema.columns 
#                             WHERE table_name = 'conversations' AND column_name = 'audio_path'
#                         ) AND NOT EXISTS (
#                             SELECT 1 FROM information_schema.columns 
#                             WHERE table_name = 'conversations' AND column_name = 'user_audio_path'
#                         ) THEN
#                             ALTER TABLE conversations RENAME COLUMN audio_path TO user_audio_path;
#                         END IF;
#                     END $$;
#                 """)
                
#                 # Create indexes for performance
#                 cursor.execute("""
#                     CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
#                     CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
#                     CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(session_id);
#                     CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
#                     CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
#                     CREATE INDEX IF NOT EXISTS idx_phone_verifications_phone ON phone_verifications(phone);
#                     CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
#                 """)
                
#                 # Create default admin user if doesn't exist
#                 cursor.execute("""
#                     SELECT email FROM users WHERE email = 'admin@ooredoo.com'
#                 """)
#                 if not cursor.fetchone():
#                     admin_password = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt())
#                     cursor.execute("""
#                         INSERT INTO users (email, password_hash, full_name, role, phone_verified, email_verified, phone)
#                         VALUES ('admin@ooredoo.com', %s, 'System Admin', 'admin', TRUE, TRUE, '+21620192067')
#                     """, (admin_password.decode('utf-8'),))
#                     print("✅ Default admin user created: admin@ooredoo.com / admin123")
                
#             print("✅ Database tables created successfully with dual audio support")
#             return True
            
#         except Exception as e:
#             print(f"❌ Database setup error: {e}")
#             if conn:
#                 conn.rollback()
#             return False
#         finally:
#             if conn:
#                 conn.close()
    
#     def update_conversation_schema(self):
#         """Update conversations table to support both user and AI audio"""
#         try:
#             with self.get_connection() as conn:
#                 with conn.cursor() as cursor:
#                     # Add AI audio path column if it doesn't exist
#                     cursor.execute("""
#                         DO $$ 
#                         BEGIN
#                             IF NOT EXISTS (
#                                 SELECT 1 FROM information_schema.columns 
#                                 WHERE table_name = 'conversations' AND column_name = 'ai_audio_path'
#                             ) THEN
#                                 ALTER TABLE conversations ADD COLUMN ai_audio_path TEXT;
#                             END IF;
#                         END $$;
#                     """)
                    
#                     # Rename existing audio_path to user_audio_path for clarity
#                     cursor.execute("""
#                         DO $$ 
#                         BEGIN
#                             IF EXISTS (
#                                 SELECT 1 FROM information_schema.columns 
#                                 WHERE table_name = 'conversations' AND column_name = 'audio_path'
#                             ) AND NOT EXISTS (
#                                 SELECT 1 FROM information_schema.columns 
#                                 WHERE table_name = 'conversations' AND column_name = 'user_audio_path'
#                             ) THEN
#                                 ALTER TABLE conversations RENAME COLUMN audio_path TO user_audio_path;
#                             END IF;
#                         END $$;
#                     """)
                    
#             print("✅ Conversations table schema updated for dual audio support")
#             return True
#         except Exception as e:
#             print(f"❌ Schema update error: {e}")
#             return False

#     # ========== PHONE VERIFICATION METHODS ==========
    
#     def generate_verification_code(self) -> str:
#         """Generate a 6-digit verification code"""
#         return ''.join(random.choices(string.digits, k=6))
    
#     def store_verification_code(self, phone: str, action: str, user_data: Dict = None) -> str:
#         """Store verification code and return it"""
#         verification_code = self.generate_verification_code()
        
#         with self.get_connection() as conn:
#             with conn.cursor() as cursor:
#                 # Invalidate previous codes for this phone
#                 cursor.execute("""
#                     UPDATE phone_verifications 
#                     SET used = TRUE 
#                     WHERE phone = %s AND action = %s AND used = FALSE
#                 """, (phone, action))
                
#                 # Insert new verification code
#                 cursor.execute("""
#                     INSERT INTO phone_verifications (phone, verification_code, action, user_data)
#                     VALUES (%s, %s, %s, %s)
#                 """, (phone, verification_code, action, json.dumps(user_data) if user_data else None))
                
#             conn.commit()
        
#         print(f"✅ Verification code generated for {phone}: {verification_code}")
#         return verification_code
    
    

    
#     def verify_phone_code(self, phone: str, code: str, action: str) -> Optional[Dict]:
#         """Verify phone verification code"""
#         with self.get_connection() as conn:
#             with conn.cursor() as cursor:
#                 cursor.execute("""
#                     SELECT id, user_data, created_at, expires_at
#                     FROM phone_verifications
#                     WHERE phone = %s AND verification_code = %s AND action = %s 
#                     AND used = FALSE AND expires_at > NOW()
#                     ORDER BY created_at DESC
#                     LIMIT 1
#                 """, (phone, code, action))
                
#                 result = cursor.fetchone()
#                 if result:
#                     # Mark as used
#                     cursor.execute("""
#                         UPDATE phone_verifications 
#                         SET used = TRUE 
#                         WHERE id = %s
#                     """, (result[0],))
                    
#                     conn.commit()
                    
#                     return {
#                         "id": result[0],
#                         "user_data": json.loads(result[1]) if result[1] else None,
#                         "created_at": result[2],
#                         "expires_at": result[3]
#                     }
        
#         return None
    
#     # ========== ENHANCED USER AUTHENTICATION METHODS ==========
    
#     def create_user(self, email: str, password: str, phone: str = None, full_name: str = None, role: str = "user", phone_verified: bool = False) -> Optional[int]:
#         """Create a new user with optional phone number"""
#         try:
#             password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            
#             with self.get_connection() as conn:
#                 with conn.cursor() as cursor:
#                     cursor.execute("""
#                         INSERT INTO users (email, phone, password_hash, full_name, role, phone_verified)
#                         VALUES (%s, %s, %s, %s, %s, %s)
#                         RETURNING user_id
#                     """, (email, phone, password_hash.decode('utf-8'), full_name, role, phone_verified))
#                     user_id = cursor.fetchone()[0]
#                 conn.commit()
            
#             print(f"✅ User created: {email} (ID: {user_id}) Phone: {phone}")
#             return user_id
#         except psycopg2.IntegrityError as e:
#             if "email" in str(e):
#                 print(f"❌ Email already exists: {email}")
#             elif "phone" in str(e):
#                 print(f"❌ Phone number already exists: {phone}")
#             else:
#                 print(f"❌ User creation failed: {e}")
#             return None
#         except Exception as e:
#             print(f"❌ Error creating user: {e}")
#             return None
    
#     def authenticate_user(self, identifier: str, password: str, login_method: str = "email") -> Optional[Dict]:
#         """Authenticate user by email or phone"""
#         try:
#             with self.get_connection() as conn:
#                 with conn.cursor() as cursor:
#                     if login_method == "email":
#                         field = "email"
#                     elif login_method == "phone":
#                         field = "phone"
#                     else:
#                         return None
                    
#                     cursor.execute(f"""
#                         SELECT user_id, email, phone, password_hash, role, full_name, is_active, phone_verified
#                         FROM users
#                         WHERE {field} = %s
#                     """, (identifier,))
                    
#                     user = cursor.fetchone()
#                     if user and user[6]:  # Check if user exists and is active
#                         stored_hash = user[3].encode('utf-8')
#                         if bcrypt.checkpw(password.encode('utf-8'), stored_hash):
#                             # Update last login
#                             cursor.execute("""
#                                 UPDATE users SET last_login = NOW() WHERE user_id = %s
#                             """, (user[0],))
#                             conn.commit()
                            
#                             return {
#                                 "user_id": user[0],
#                                 "email": user[1],
#                                 "phone": user[2],
#                                 "role": user[4],
#                                 "full_name": user[5],
#                                 "phone_verified": user[7]
#                             }
#             return None
#         except Exception as e:
#             print(f"❌ Authentication error: {e}")
#             return None
    
#     def find_user_by_phone(self, phone: str) -> Optional[Dict]:
#         """Find user by phone number"""
#         try:
#             with self.get_connection() as conn:
#                 with conn.cursor() as cursor:
#                     cursor.execute("""
#                         SELECT user_id, email, phone, role, full_name, is_active
#                         FROM users
#                         WHERE phone = %s AND is_active = TRUE
#                     """, (phone,))
                    
#                     user = cursor.fetchone()
#                     if user:
#                         return {
#                             "user_id": user[0],
#                             "email": user[1],
#                             "phone": user[2],
#                             "role": user[3],
#                             "full_name": user[4]
#                         }
#             return None
#         except Exception as e:
#             print(f"❌ Error finding user by phone: {e}")
#             return None
    
#     def find_user_by_email(self, email: str) -> Optional[Dict]:
#         """Find user by email address"""
#         try:
#             with self.get_connection() as conn:
#                 with conn.cursor() as cursor:
#                     cursor.execute("""
#                         SELECT user_id, email, phone, role, full_name, is_active
#                         FROM users
#                         WHERE email = %s AND is_active = TRUE
#                     """, (email,))
                    
#                     user = cursor.fetchone()
#                     if user:
#                         return {
#                             "user_id": user[0],
#                             "email": user[1],
#                             "phone": user[2],
#                             "role": user[3],
#                             "full_name": user[4]
#                         }
#             return None
#         except Exception as e:
#             print(f"❌ Error finding user by email: {e}")
#             return None
    
#     def get_user_by_id(self, user_id: int) -> Optional[Dict]:
#         """Get user data by ID"""
#         try:
#             with self.get_connection() as conn:
#                 with conn.cursor() as cursor:
#                     cursor.execute("""
#                         SELECT user_id, email, phone, role, full_name, created_at, last_login, phone_verified
#                         FROM users
#                         WHERE user_id = %s AND is_active = TRUE
#                     """, (user_id,))
                    
#                     user = cursor.fetchone()
#                     if user:
#                         return {
#                             "user_id": user[0],
#                             "email": user[1],
#                             "phone": user[2],
#                             "role": user[3],
#                             "full_name": user[4],
#                             "created_at": user[5].isoformat() if user[5] else None,
#                             "last_login": user[6].isoformat() if user[6] else None,
#                             "phone_verified": user[7]
#                         }
#             return None
#         except Exception as e:
#             print(f"❌ Error getting user: {e}")
#             return None
    
#     def update_user_password(self, user_id: int, new_password: str) -> bool:
#         """Update user password"""
#         try:
#             password_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
            
#             with self.get_connection() as conn:
#                 with conn.cursor() as cursor:
#                     cursor.execute("""
#                         UPDATE users 
#                         SET password_hash = %s 
#                         WHERE user_id = %s
#                     """, (password_hash.decode('utf-8'), user_id))
#                 conn.commit()
            
#             print(f"✅ Password updated for user ID: {user_id}")
#             return True
#         except Exception as e:
#             print(f"❌ Error updating password: {e}")
#             return False
    
#     # ========== PASSWORD RESET METHODS ==========
    
#     def create_password_reset_token(self, user_id: int, method: str) -> str:
#         """Create password reset token"""
#         token = ''.join(random.choices(string.ascii_letters + string.digits, k=32))
        
#         with self.get_connection() as conn:
#             with conn.cursor() as cursor:
#                 # Invalidate previous tokens for this user
#                 cursor.execute("""
#                     UPDATE password_reset_tokens 
#                     SET used = TRUE 
#                     WHERE user_id = %s AND used = FALSE
#                 """, (user_id,))
                
#                 # Create new token
#                 cursor.execute("""
#                     INSERT INTO password_reset_tokens (user_id, token, method)
#                     VALUES (%s, %s, %s)
#                 """, (user_id, token, method))
                
#             conn.commit()
        
#         return token
    
#     def verify_reset_token(self, token: str) -> Optional[int]:
#         """Verify password reset token and return user_id"""
#         with self.get_connection() as conn:
#             with conn.cursor() as cursor:
#                 cursor.execute("""
#                     SELECT user_id
#                     FROM password_reset_tokens
#                     WHERE token = %s AND used = FALSE AND expires_at > NOW()
#                 """, (token,))
                
#                 result = cursor.fetchone()
#                 if result:
#                     # Mark token as used
#                     cursor.execute("""
#                         UPDATE password_reset_tokens 
#                         SET used = TRUE 
#                         WHERE token = %s
#                     """, (token,))
#                     conn.commit()
                    
#                     return result[0]
        
#         return None
    
#     # ========== SESSION & CONVERSATION METHODS ==========
    
#     def save_session(self, session_id: str, language: str, assistant_id: int, 
#                     user_id: int = None, user_name: str = None, issue_type: str = None):
#         """Save session with optional user association"""
#         with self.get_connection() as conn:
#             with conn.cursor() as cursor:
#                 cursor.execute("""
#                     INSERT INTO sessions (session_id, user_id, user_name, issue_type, language, assistant_id, last_updated)
#                     VALUES (%s, %s, %s, %s, %s, %s, NOW())
#                     ON CONFLICT (session_id) 
#                     DO UPDATE SET 
#                         user_id = COALESCE(EXCLUDED.user_id, sessions.user_id),
#                         user_name = COALESCE(EXCLUDED.user_name, sessions.user_name),
#                         issue_type = COALESCE(EXCLUDED.issue_type, sessions.issue_type),
#                         last_updated = NOW()
#                 """, (session_id, user_id, user_name, issue_type, language, assistant_id))
#             conn.commit()
    
#     def save_conversation(self, session_id: str, user_message: str, ai_response: str, 
#                          language: str, user_id: int = None, user_audio_path: str = None, 
#                          ai_audio_path: str = None):
#         """Save conversation with both user and AI audio paths"""
#         with self.get_connection() as conn:
#             with conn.cursor() as cursor:
#                 cursor.execute("""
#                     INSERT INTO conversations (session_id, user_id, user_message, ai_response, 
#                                              language, user_audio_path, ai_audio_path)
#                     VALUES (%s, %s, %s, %s, %s, %s, %s)
#                 """, (session_id, user_id, user_message, ai_response, language, 
#                       user_audio_path, ai_audio_path))
#             conn.commit()
    
#     def get_conversation_history(self, session_id: str = None, user_id: int = None, limit: int = 10) -> List[Dict]:
#         """Get conversation history for session or user with dual audio support"""
#         with self.get_connection() as conn:
#             with conn.cursor() as cursor:
#                 if session_id:
#                     cursor.execute("""
#                         SELECT user_message, ai_response, timestamp, user_audio_path, ai_audio_path
#                         FROM conversations 
#                         WHERE session_id = %s 
#                         ORDER BY timestamp DESC 
#                         LIMIT %s
#                     """, (session_id, limit))
#                 elif user_id:
#                     cursor.execute("""
#                         SELECT c.user_message, c.ai_response, c.timestamp, c.user_audio_path, 
#                                c.ai_audio_path, c.session_id
#                         FROM conversations c
#                         WHERE c.user_id = %s 
#                         ORDER BY c.timestamp DESC 
#                         LIMIT %s
#                     """, (user_id, limit))
#                 else:
#                     return []
                
#                 rows = cursor.fetchall()
#                 return [
#                     {
#                         "user": row[0],
#                         "ai": row[1], 
#                         "timestamp": row[2].isoformat() if row[2] else None,
#                         "user_audio_path": row[3],
#                         "ai_audio_path": row[4],
#                         "session_id": row[5] if len(row) > 5 else session_id
#                     }
#                     for row in reversed(rows)
#                 ]
    
#     # ========== ADMIN DASHBOARD METHODS ==========
    
#     def get_all_users(self) -> List[Dict]:
#         """Get all users (admin only)"""
#         with self.get_connection() as conn:
#             with conn.cursor() as cursor:
#                 cursor.execute("""
#                     SELECT user_id, email, phone, full_name, role, created_at, last_login, is_active, phone_verified
#                     FROM users
#                     ORDER BY created_at DESC
#                 """)
                
#                 rows = cursor.fetchall()
#                 return [
#                     {
#                         "user_id": row[0],
#                         "email": row[1],
#                         "phone": row[2],
#                         "full_name": row[3],
#                         "role": row[4],
#                         "created_at": row[5].isoformat() if row[5] else None,
#                         "last_login": row[6].isoformat() if row[6] else None,
#                         "is_active": row[7],
#                         "phone_verified": row[8]
#                     }
#                     for row in rows
#                 ]

#     def get_user_statistics(self, user_id: int = None) -> Dict:
#         """Get statistics for dashboard with proper audio recording count"""
#         with self.get_connection() as conn:
#             with conn.cursor() as cursor:
#                 if user_id:
#                     # Stats for specific user - count both user and AI audio
#                     cursor.execute("""
#                     SELECT 
#                         COUNT(DISTINCT s.session_id) as total_sessions,
#                         COUNT(c.id) as total_conversations,
#                         COUNT(CASE WHEN c.user_audio_path IS NOT NULL THEN 1 END) + 
#                         COUNT(CASE WHEN c.ai_audio_path IS NOT NULL THEN 1 END) as total_audio_recordings,
#                         COUNT(CASE WHEN c.user_audio_path IS NOT NULL THEN 1 END) as user_audio_recordings,
#                         COUNT(CASE WHEN c.ai_audio_path IS NOT NULL THEN 1 END) as ai_audio_recordings,
#                         MAX(c.timestamp) as last_activity
#                     FROM sessions s
#                     LEFT JOIN conversations c ON s.session_id = c.session_id
#                     WHERE s.user_id = %s
#                 """, (user_id,))
#                 else:
#                     # Global stats for admin - count both user and AI audio
#                     cursor.execute("""
#                     SELECT 
#                         COUNT(DISTINCT u.user_id) as total_users,
#                         COUNT(DISTINCT s.session_id) as total_sessions,
#                         COUNT(c.id) as total_conversations,
#                         COUNT(CASE WHEN c.user_audio_path IS NOT NULL THEN 1 END) + 
#                         COUNT(CASE WHEN c.ai_audio_path IS NOT NULL THEN 1 END) as total_audio_recordings,
#                         COUNT(CASE WHEN c.user_audio_path IS NOT NULL THEN 1 END) as user_audio_recordings,
#                         COUNT(CASE WHEN c.ai_audio_path IS NOT NULL THEN 1 END) as ai_audio_recordings,
#                         COUNT(DISTINCT DATE(c.timestamp)) as active_days
#                     FROM users u
#                     LEFT JOIN sessions s ON u.user_id = s.user_id
#                     LEFT JOIN conversations c ON s.session_id = c.session_id
#                 """)
                
#                 result = cursor.fetchone()
#                 columns = [desc[0] for desc in cursor.description]
#                 stats = dict(zip(columns, result)) if result else {}
                
#                 # Convert datetime to string
#                 for key, value in stats.items():
#                     if isinstance(value, datetime):
#                         stats[key] = value.isoformat()
                        
#                 print(f"📊 Statistics calculated: {stats}")  # Debug log

#                 return stats
import psycopg2
import bcrypt
import json
import random
import string
import uuid  # Added for generating session IDs for Twilio calls
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import os

class DatabaseManager:
    def __init__(self):
        self.conn_params = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'database': os.getenv('DB_NAME', 'ooredoo_ai'),
            'user': os.getenv('DB_USER', 'ooredoo_user'),
            'password': os.getenv('DB_PASSWORD', 'mypassword123'),
            'port': os.getenv('DB_PORT', '5432')
        }
    
    def get_connection(self):
        return psycopg2.connect(**self.conn_params)
    
    def setup_database(self):
        """Create all necessary tables with proper transaction handling and phone integration"""
        conn = None
        try:
            conn = self.get_connection()
            conn.autocommit = True  # Enable autocommit to avoid transaction issues
            
            with conn.cursor() as cursor:
                # Enhanced users table with phone number
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS users (
                        user_id SERIAL PRIMARY KEY,
                        email VARCHAR(255) UNIQUE NOT NULL,
                        phone VARCHAR(20),
                        password_hash VARCHAR(255) NOT NULL,
                        full_name VARCHAR(255),
                        role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
                        created_at TIMESTAMP DEFAULT NOW(),
                        last_login TIMESTAMP,
                        is_active BOOLEAN DEFAULT TRUE,
                        phone_verified BOOLEAN DEFAULT FALSE,
                        email_verified BOOLEAN DEFAULT FALSE,
                        avatar_url TEXT
                    )
                """)
                
                # Add columns if they don't exist
                cursor.execute("""
                    DO $$ 
                    BEGIN
                        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone') THEN
                            ALTER TABLE users ADD COLUMN phone VARCHAR(20); END IF;
                        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone_verified') THEN
                            ALTER TABLE users ADD COLUMN phone_verified BOOLEAN DEFAULT FALSE; END IF;
                        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email_verified') THEN
                            ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT FALSE; END IF;
                        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'avatar_url') THEN
                            ALTER TABLE users ADD COLUMN avatar_url TEXT; END IF;
                    END $$;
                """)
                
                # Phone verification codes table
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
                
                # Password reset tokens table
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
                
                # Enhanced sessions table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS sessions (
                        session_id VARCHAR(255) PRIMARY KEY,
                        user_id INTEGER REFERENCES users(user_id),
                        user_name VARCHAR(255),
                        issue_type VARCHAR(100),
                        language VARCHAR(10),
                        assistant_id INTEGER,
                        created_at TIMESTAMP DEFAULT NOW(),
                        last_updated TIMESTAMP DEFAULT NOW()
                    )
                """)
                
                # Enhanced conversations table
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS conversations (
                        id SERIAL PRIMARY KEY,
                        session_id VARCHAR(255) REFERENCES sessions(session_id),
                        user_id INTEGER REFERENCES users(user_id),
                        user_message TEXT,
                        ai_response TEXT,
                        user_audio_path TEXT,
                        ai_audio_path TEXT,
                        timestamp TIMESTAMP DEFAULT NOW(),
                        language VARCHAR(10)
                    )
                """)
                
                # Update existing conversations table schema
                cursor.execute("""
                    DO $$ 
                    BEGIN
                        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'ai_audio_path') THEN
                            ALTER TABLE conversations ADD COLUMN ai_audio_path TEXT; END IF;
                        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'audio_path') 
                           AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'user_audio_path') THEN
                            ALTER TABLE conversations RENAME COLUMN audio_path TO user_audio_path; END IF;
                    END $$;
                """)

                # === NEW TWILIO & PHONE INTEGRATION TABLES ===
                
                # Enhanced twilio_calls table for tracking call details
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS twilio_calls (
                        call_sid VARCHAR(255) PRIMARY KEY,
                        session_id VARCHAR(255) REFERENCES sessions(session_id),
                        caller_phone VARCHAR(20) NOT NULL,
                        caller_user_id INTEGER REFERENCES users(user_id),
                        selected_language VARCHAR(10) DEFAULT 'en-US',
                        selected_assistant INTEGER DEFAULT 1,
                        call_status VARCHAR(50) DEFAULT 'in-progress',
                        call_started_at TIMESTAMP DEFAULT NOW(),
                        call_ended_at TIMESTAMP,
                        total_duration INTEGER,
                        created_at TIMESTAMP DEFAULT NOW()
                    )
                """)
                
                # Add call_type to conversations for tracking phone vs web
                cursor.execute("""
                    DO $$ 
                    BEGIN
                        IF NOT EXISTS (
                            SELECT 1 FROM information_schema.columns 
                            WHERE table_name = 'conversations' AND column_name = 'call_type'
                        ) THEN
                            ALTER TABLE conversations ADD COLUMN call_type VARCHAR(20) DEFAULT 'web';
                        END IF;
                    END $$;
                """)
                
                # === INDEXES & DEFAULTS ===

                # Create indexes for performance
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
                    CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
                    CREATE INDEX IF NOT EXISTS idx_conversations_session ON conversations(session_id);
                    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
                    CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
                    CREATE INDEX IF NOT EXISTS idx_phone_verifications_phone ON phone_verifications(phone);
                    CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
                """)
                
                # Create default admin user if doesn't exist
                cursor.execute("SELECT email FROM users WHERE email = 'admin@ooredoo.com'")
                if not cursor.fetchone():
                    admin_password = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt())
                    cursor.execute("""
                        INSERT INTO users (email, password_hash, full_name, role, phone_verified, email_verified, phone)
                        VALUES ('admin@ooredoo.com', %s, 'System Admin', 'admin', TRUE, TRUE, '+21620192067')
                    """, (admin_password.decode('utf-8'),))
                    print("✅ Default admin user created: admin@ooredoo.com / admin123")
                
            print("✅ Database tables created/updated successfully")
            print("✅ Phone integration database setup complete")
            return True
            
        except Exception as e:
            print(f"❌ Database setup error: {e}")
            if conn:
                conn.rollback()
            return False
        finally:
            if conn:
                conn.close()
    def store_email_verification_code(self, email: str, action: str, user_data: Dict = None) -> str:
        """Store email verification code in database"""
        verification_code = self.generate_verification_code()
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                # Clear old codes for this email/action
                cursor.execute("UPDATE phone_verifications SET used = TRUE WHERE phone = %s AND action = %s AND used = FALSE", (email, action))
                
                # Store new code (reusing phone_verifications table with email in phone field)
                cursor.execute("""
                    INSERT INTO phone_verifications (phone, verification_code, action, user_data) 
                    VALUES (%s, %s, %s, %s)
                """, (email, verification_code, action, json.dumps(user_data) if user_data else None))
            conn.commit()
        print(f"✅ Email verification code generated for {email}: {verification_code}")
        return verification_code
    
    def verify_email_code(self, email: str, code: str, action: str) -> Optional[Dict]:
        """Verify email verification code"""
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT id, user_data, created_at, expires_at FROM phone_verifications
                    WHERE phone = %s AND verification_code = %s AND action = %s AND used = FALSE AND expires_at > NOW()
                    ORDER BY created_at DESC LIMIT 1
                """, (email, code, action))
                result = cursor.fetchone()
                if result:
                    cursor.execute("UPDATE phone_verifications SET used = TRUE WHERE id = %s", (result[0],))
                    conn.commit()
                    return {"id": result[0], "user_data": json.loads(result[1]) if result[1] else None, "created_at": result[2], "expires_at": result[3]}
        return None
    def update_conversation_schema(self):
        """Update conversations table to support both user and AI audio"""
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("""
                        DO $$ 
                        BEGIN
                            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'ai_audio_path') THEN
                                ALTER TABLE conversations ADD COLUMN ai_audio_path TEXT; END IF;
                        END $$;
                    """)
                    cursor.execute("""
                        DO $$ 
                        BEGIN
                            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'audio_path') 
                               AND NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'user_audio_path') THEN
                                ALTER TABLE conversations RENAME COLUMN audio_path TO user_audio_path; END IF;
                        END $$;
                    """)
            print("✅ Conversations table schema updated for dual audio support")
            return True
        except Exception as e:
            print(f"❌ Schema update error: {e}")
            return False

    # ========== PHONE VERIFICATION METHODS ==========
    
    def generate_verification_code(self) -> str:
        return ''.join(random.choices(string.digits, k=6))
    
    def store_verification_code(self, phone: str, action: str, user_data: Dict = None) -> str:
        verification_code = self.generate_verification_code()
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("UPDATE phone_verifications SET used = TRUE WHERE phone = %s AND action = %s AND used = FALSE", (phone, action))
                cursor.execute("INSERT INTO phone_verifications (phone, verification_code, action, user_data) VALUES (%s, %s, %s, %s)",
                               (phone, verification_code, action, json.dumps(user_data) if user_data else None))
            conn.commit()
        print(f"✅ Verification code generated for {phone}: {verification_code}")
        return verification_code
    
    def verify_phone_code(self, phone: str, code: str, action: str) -> Optional[Dict]:
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT id, user_data, created_at, expires_at FROM phone_verifications
                    WHERE phone = %s AND verification_code = %s AND action = %s AND used = FALSE AND expires_at > NOW()
                    ORDER BY created_at DESC LIMIT 1
                """, (phone, code, action))
                result = cursor.fetchone()
                if result:
                    cursor.execute("UPDATE phone_verifications SET used = TRUE WHERE id = %s", (result[0],))
                    conn.commit()
                    return {"id": result[0], "user_data": json.loads(result[1]) if result[1] else None, "created_at": result[2], "expires_at": result[3]}
        return None
    
    # ========== ENHANCED USER AUTHENTICATION METHODS ==========
    
    def create_user(self, email: str, password: str, phone: str = None, full_name: str = None, role: str = "user", phone_verified: bool = False) -> Optional[int]:
        try:
            password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
            with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("""
                        INSERT INTO users (email, phone, password_hash, full_name, role, phone_verified)
                        VALUES (%s, %s, %s, %s, %s, %s) RETURNING user_id
                    """, (email, phone, password_hash.decode('utf-8'), full_name, role, phone_verified))
                    user_id = cursor.fetchone()[0]
                conn.commit()
            print(f"✅ User created: {email} (ID: {user_id}) Phone: {phone}")
            return user_id
        except psycopg2.IntegrityError as e:
            if "email" in str(e): print(f"❌ Email already exists: {email}")
            elif "phone" in str(e): print(f"❌ Phone number already exists: {phone}")
            else: print(f"❌ User creation failed: {e}")
            return None
        except Exception as e:
            print(f"❌ Error creating user: {e}")
            return None
    
    def authenticate_user(self, identifier: str, password: str, login_method: str = "email") -> Optional[Dict]:
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    field = "email" if login_method == "email" else "phone" if login_method == "phone" else None
                    if not field: return None
                    
                    cursor.execute(f"SELECT user_id, email, phone, password_hash, role, full_name, is_active, phone_verified FROM users WHERE {field} = %s", (identifier,))
                    user = cursor.fetchone()
                    
                    if user and user[6]:
                        stored_hash = user[3].encode('utf-8')
                        if bcrypt.checkpw(password.encode('utf-8'), stored_hash):
                            cursor.execute("UPDATE users SET last_login = NOW() WHERE user_id = %s", (user[0],))
                            conn.commit()
                            return {"user_id": user[0], "email": user[1], "phone": user[2], "role": user[4], "full_name": user[5], "phone_verified": user[7]}
            return None
        except Exception as e:
            print(f"❌ Authentication error: {e}")
            return None
    
    def find_user_by_phone(self, phone: str) -> Optional[Dict]:
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("SELECT user_id, email, phone, role, full_name, is_active FROM users WHERE phone = %s AND is_active = TRUE", (phone,))
                    user = cursor.fetchone()
                    if user:
                        return {"user_id": user[0], "email": user[1], "phone": user[2], "role": user[3], "full_name": user[4]}
            return None
        except Exception as e:
            print(f"❌ Error finding user by phone: {e}")
            return None
    
    def find_user_by_email(self, email: str) -> Optional[Dict]:
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("SELECT user_id, email, phone, role, full_name, is_active FROM users WHERE email = %s AND is_active = TRUE", (email,))
                    user = cursor.fetchone()
                    if user:
                        return {"user_id": user[0], "email": user[1], "phone": user[2], "role": user[3], "full_name": user[4]}
            return None
        except Exception as e:
            print(f"❌ Error finding user by email: {e}")
            return None
    
    def get_user_by_id(self, user_id: int) -> Optional[Dict]:
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("SELECT user_id, email, phone, role, full_name, created_at, last_login, phone_verified FROM users WHERE user_id = %s AND is_active = TRUE", (user_id,))
                    user = cursor.fetchone()
                    if user:
                        return {"user_id": user[0], "email": user[1], "phone": user[2], "role": user[3], "full_name": user[4], 
                                "created_at": user[5].isoformat() if user[5] else None, "last_login": user[6].isoformat() if user[6] else None, "phone_verified": user[7]}
            return None
        except Exception as e:
            print(f"❌ Error getting user: {e}")
            return None
    
    def update_user_password(self, user_id: int, new_password: str) -> bool:
        try:
            password_hash = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
            with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("UPDATE users SET password_hash = %s WHERE user_id = %s", (password_hash.decode('utf-8'), user_id))
                conn.commit()
            print(f"✅ Password updated for user ID: {user_id}")
            return True
        except Exception as e:
            print(f"❌ Error updating password: {e}")
            return False
    
    # ========== PASSWORD RESET METHODS ==========
    
    def create_password_reset_token(self, user_id: int, method: str) -> str:
        token = ''.join(random.choices(string.ascii_letters + string.digits, k=32))
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("UPDATE password_reset_tokens SET used = TRUE WHERE user_id = %s AND used = FALSE", (user_id,))
                cursor.execute("INSERT INTO password_reset_tokens (user_id, token, method) VALUES (%s, %s, %s)", (user_id, token, method))
            conn.commit()
        return token
    
    def verify_reset_token(self, token: str) -> Optional[int]:
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT user_id FROM password_reset_tokens WHERE token = %s AND used = FALSE AND expires_at > NOW()", (token,))
                result = cursor.fetchone()
                if result:
                    cursor.execute("UPDATE password_reset_tokens SET used = TRUE WHERE token = %s", (token,))
                    conn.commit()
                    return result[0]
        return None
    
    # ========== SESSION & CONVERSATION METHODS ==========
    
    def save_session(self, session_id: str, language: str, assistant_id: int, user_id: int = None, user_name: str = None, issue_type: str = None):
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO sessions (session_id, user_id, user_name, issue_type, language, assistant_id, last_updated)
                    VALUES (%s, %s, %s, %s, %s, %s, NOW())
                    ON CONFLICT (session_id) DO UPDATE SET 
                        user_id = COALESCE(EXCLUDED.user_id, sessions.user_id),
                        user_name = COALESCE(EXCLUDED.user_name, sessions.user_name),
                        issue_type = COALESCE(EXCLUDED.issue_type, sessions.issue_type),
                        last_updated = NOW()
                """, (session_id, user_id, user_name, issue_type, language, assistant_id))
            conn.commit()
    
    def save_conversation(self, session_id: str, user_message: str, ai_response: str, language: str, user_id: int = None, user_audio_path: str = None, ai_audio_path: str = None):
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO conversations (session_id, user_id, user_message, ai_response, language, user_audio_path, ai_audio_path)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (session_id, user_id, user_message, ai_response, language, user_audio_path, ai_audio_path))
            conn.commit()
    
    def get_conversation_history(self, session_id: str = None, user_id: int = None, limit: int = 10) -> List[Dict]:
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                if session_id:
                    cursor.execute("SELECT user_message, ai_response, timestamp, user_audio_path, ai_audio_path FROM conversations WHERE session_id = %s ORDER BY timestamp DESC LIMIT %s", (session_id, limit))
                elif user_id:
                    cursor.execute("SELECT c.user_message, c.ai_response, c.timestamp, c.user_audio_path, c.ai_audio_path, c.session_id FROM conversations c WHERE c.user_id = %s ORDER BY c.timestamp DESC LIMIT %s", (user_id, limit))
                else: return []
                rows = cursor.fetchall()
                return [{"user": r[0], "ai": r[1], "timestamp": r[2].isoformat() if r[2] else None, "user_audio_path": r[3], "ai_audio_path": r[4], "session_id": r[5] if len(r) > 5 else session_id} for r in reversed(rows)]
    
    # ========== ADMIN DASHBOARD METHODS ==========
    
    def get_all_users(self) -> List[Dict]:
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT user_id, email, phone, full_name, role, created_at, last_login, is_active, phone_verified FROM users ORDER BY created_at DESC")
                rows = cursor.fetchall()
                return [{"user_id": r[0], "email": r[1], "phone": r[2], "full_name": r[3], "role": r[4], "created_at": r[5].isoformat() if r[5] else None, "last_login": r[6].isoformat() if r[6] else None, "is_active": r[7], "phone_verified": r[8]} for r in rows]

    def get_user_statistics(self, user_id: int = None) -> Dict:
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                if user_id:
                    cursor.execute("""
                        SELECT COUNT(DISTINCT s.session_id) as total_sessions, COUNT(c.id) as total_conversations,
                               COUNT(CASE WHEN c.user_audio_path IS NOT NULL THEN 1 END) + COUNT(CASE WHEN c.ai_audio_path IS NOT NULL THEN 1 END) as total_audio_recordings,
                               COUNT(CASE WHEN c.user_audio_path IS NOT NULL THEN 1 END) as user_audio_recordings, COUNT(CASE WHEN c.ai_audio_path IS NOT NULL THEN 1 END) as ai_audio_recordings,
                               MAX(c.timestamp) as last_activity
                        FROM sessions s LEFT JOIN conversations c ON s.session_id = c.session_id WHERE s.user_id = %s
                    """, (user_id,))
                else:
                    cursor.execute("""
                        SELECT COUNT(DISTINCT u.user_id) as total_users, COUNT(DISTINCT s.session_id) as total_sessions, COUNT(c.id) as total_conversations,
                               COUNT(CASE WHEN c.user_audio_path IS NOT NULL THEN 1 END) + COUNT(CASE WHEN c.ai_audio_path IS NOT NULL THEN 1 END) as total_audio_recordings,
                               COUNT(CASE WHEN c.user_audio_path IS NOT NULL THEN 1 END) as user_audio_recordings, COUNT(CASE WHEN c.ai_audio_path IS NOT NULL THEN 1 END) as ai_audio_recordings,
                               COUNT(DISTINCT DATE(c.timestamp)) as active_days
                        FROM users u LEFT JOIN sessions s ON u.user_id = s.user_id LEFT JOIN conversations c ON s.session_id = c.session_id
                    """)
                result = cursor.fetchone()
                columns = [desc[0] for desc in cursor.description]
                stats = dict(zip(columns, result)) if result else {}
                for key, value in stats.items():
                    if isinstance(value, datetime): stats[key] = value.isoformat()
                print(f"📊 Statistics calculated: {stats}")
                return stats

    # ========== TWILIO CALL INTEGRATION METHODS ==========

    def create_twilio_call_session(self, call_sid: str, caller_phone: str, caller_user_id: int = None) -> str:
        """Create a new session for a Twilio call with language and assistant tracking"""
        try:
            session_id = str(uuid.uuid4())
            with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("""
                        INSERT INTO sessions (session_id, user_id, language, assistant_id, created_at)
                        VALUES (%s, %s, %s, %s, NOW())
                    """, (session_id, caller_user_id, "en-US", 1))
                    cursor.execute("""
                        INSERT INTO twilio_calls (call_sid, session_id, caller_phone, caller_user_id)
                        VALUES (%s, %s, %s, %s)
                    """, (call_sid, session_id, caller_phone, caller_user_id))
                conn.commit()
            print(f"✅ Created Twilio session {session_id} for call {call_sid}")
            return session_id
        except Exception as e:
            print(f"❌ Error creating Twilio call session: {e}")
            return None

    def update_call_language_and_assistant(self, call_sid: str, language: str, assistant_id: int):
        """Update the language and assistant selection for a call"""
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("""
                        UPDATE twilio_calls SET selected_language = %s, selected_assistant = %s
                        WHERE call_sid = %s
                    """, (language, assistant_id, call_sid))
                    cursor.execute("""
                        UPDATE sessions SET language = %s, assistant_id = %s, last_updated = NOW()
                        WHERE session_id = (SELECT session_id FROM twilio_calls WHERE call_sid = %s)
                    """, (language, assistant_id, call_sid))
                conn.commit()
            print(f"✅ Updated call {call_sid} language: {language}, assistant: {assistant_id}")
        except Exception as e:
            print(f"❌ Error updating call settings: {e}")

    def get_session_from_call_sid(self, call_sid: str) -> Optional[str]:
        """Get session ID from Twilio call SID"""
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("SELECT session_id FROM twilio_calls WHERE call_sid = %s", (call_sid,))
                    result = cursor.fetchone()
                    return result[0] if result else None
        except Exception as e:
            print(f"❌ Error getting session from call SID: {e}")
            return None

    def get_phone_conversation_stats(self) -> List[Dict]:
        """Get statistics for phone conversations"""
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("""
                        SELECT 
                            tc.selected_language, tc.selected_assistant, COUNT(tc.call_sid) as total_calls,
                            AVG(tc.total_duration) as avg_duration, COUNT(DISTINCT tc.caller_user_id) as unique_callers,
                            COUNT(c.id) as total_messages
                        FROM twilio_calls tc
                        LEFT JOIN conversations c ON tc.session_id = c.session_id
                        WHERE tc.call_status = 'completed'
                        GROUP BY tc.selected_language, tc.selected_assistant
                        ORDER BY total_calls DESC
                    """)
                    rows = cursor.fetchall()
                    return [{"language": r[0], "assistant_id": r[1], "total_calls": r[2], "avg_duration": float(r[3]) if r[3] else 0, "unique_callers": r[4], "total_messages": r[5]} for r in rows]
        except Exception as e:
            print(f"❌ Error getting phone stats: {e}")
            return []