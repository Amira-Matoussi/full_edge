# Create a file: test_sms.py
import requests
import json
import time

# Your verified phone number
YOUR_PHONE = "+21620192067"
BASE_URL = "http://localhost:3000/api"

def test_sms_verification():
    print("🧪 Testing SMS Verification System")
    print("="*50)
    
    # Test 1: Send verification code for registration
    print("\n📱 Step 1: Sending verification code...")
    
    response = requests.post(f"{BASE_URL}/auth/verify-phone", 
        json={
            "phone": YOUR_PHONE,
            "action": "register"
        }
    )
    
    if response.status_code == 200:
        print("✅ Verification code request sent successfully!")
        data = response.json()
        print(f"Response: {data}")
        
        # Wait for SMS to arrive
        print("\n📲 Check your phone for the SMS...")
        verification_code = input("Enter the 6-digit code you received: ")
        
        # Test 2: Complete registration with code
        print("\n👤 Step 2: Testing registration with code...")
        
        reg_response = requests.post(f"{BASE_URL}/auth/register",
            json={
                "email": f"test_{int(time.time())}@example.com",
                "phone": YOUR_PHONE,
                "password": "testpass123",
                "full_name": "Test User",
                "verification_code": verification_code
            }
        )
        
        if reg_response.status_code == 200:
            print("✅ Registration successful!")
            print(f"Response: {reg_response.json()}")
        else:
            print(f"❌ Registration failed: {reg_response.status_code}")
            print(f"Error: {reg_response.text}")
            
    else:
        print(f"❌ SMS send failed: {response.status_code}")
        print(f"Error: {response.text}")

def test_forgot_password():
    print("\n🔐 Testing Forgot Password Flow")
    print("="*50)
    
    # Send reset code
    response = requests.post(f"{BASE_URL}/auth/forgot-password",
        json={
            "method": "phone",
            "identifier": YOUR_PHONE
        }
    )
    
    if response.status_code == 200:
        print("✅ Password reset code sent!")
        
        reset_code = input("Enter the reset code you received: ")
        
        # Test password reset
        reset_response = requests.post(f"{BASE_URL}/auth/reset-password",
            json={
                "phone": YOUR_PHONE,
                "verification_code": reset_code,
                "new_password": "newpass456"
            }
        )
        
        if reset_response.status_code == 200:
            print("✅ Password reset successful!")
        else:
            print(f"❌ Password reset failed: {reset_response.status_code}")
            print(f"Error: {reset_response.text}")
    else:
        print(f"❌ Reset code send failed: {response.status_code}")
        print(f"Error: {response.text}")

if __name__ == "__main__":
    print("Make sure your backend server is running on port 8000")
    print("Make sure your Next.js server is running on port 3000")
    input("Press Enter to continue...")
    
    test_sms_verification()
    
    # Optional: Test forgot password too
    test_again = input("\nTest forgot password flow? (y/n): ")
    if test_again.lower() == 'y':
        test_forgot_password()
    
    print("\n🎉 SMS testing complete!")