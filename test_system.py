from database import DatabaseManager
import os
from dotenv import load_dotenv
load_dotenv(".env.local") 

def test_database():
    print("Testing database connection...")
    try:
        db = DatabaseManager()
        db.setup_database()
        
        # Test saving data
        session_id = "test_session_123"
        db.save_session(session_id, "en-US", 1, "Test User", "billing")
        db.save_conversation(session_id, "Hello", "Hi there! How can I help?", "en-US")
        
        # Test retrieving data
        history = db.get_conversation_history(session_id)
        print(f"Database test successful! Retrieved {len(history)} conversations")
        return True
        
    except Exception as e:
        print(f"Database test failed: {e}")
        return False

def test_data_files():
    print("Testing data files...")
    import glob
    files = glob.glob("./data/use_case_*.json")
    if files:
        print(f"Found {len(files)} data files:")
        for file in files:
            print(f"  - {file}")
        return True
    else:
        print("No data files found in ./data/ folder")
        return False

def test_environment():
    print("Testing environment variables...")
    required_vars = ["GROQ_API_KEY", "DB_HOST", "DB_NAME", "DB_USER", "DB_PASSWORD"]
    missing = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing.append(var)
    
    if missing:
        print(f"Missing environment variables: {missing}")
        return False
    else:
        print("All environment variables found")
        return True

if __name__ == "__main__":
    print("=== System Test ===")
    
    db_ok = test_database()
    data_ok = test_data_files()
    env_ok = test_environment()
    
    if db_ok and data_ok and env_ok:
        print("\n✅ All tests passed! Your system is ready.")
        print("Next steps:")
        print("1. Run: python rag_server.py")
        print("2. In another terminal: npm run dev")
        print("3. Visit: http://localhost:3000")
    else:
        print("\n❌ Some tests failed. Please fix the issues above.")