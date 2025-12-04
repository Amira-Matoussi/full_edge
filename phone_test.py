#!/usr/bin/env python3

import requests
import json
import time
import os

class PhoneCallSimulator:
    def __init__(self):
        self.backend_url = "http://localhost:8000/api/voice-pipeline"
        self.session_id = f"phone_test_{int(time.time())}"
        
    def test_backend_connection(self):
        """Test if the Python backend is running"""
        try:
            response = requests.get("http://localhost:8000/health", timeout=5)
            if response.status_code == 200:
                print("✅ Python backend is running")
                return True
            else:
                print("❌ Python backend returned error:", response.status_code)
                return False
        except requests.exceptions.ConnectionError:
            print("❌ Cannot connect to Python backend. Make sure 'python rag_server.py' is running")
            return False
        except Exception as e:
            print(f"❌ Error checking backend: {e}")
            return False
    
    def simulate_phone_call(self, caller_number="+33123456789"):
        """Simulate a complete phone call flow"""
        print(f"📞 Simulating phone call from {caller_number}")
        print(f"🆔 Session ID: {self.session_id}")
        print("="*50)
        
        # Test backend first
        if not self.test_backend_connection():
            return
        
        conversation_history = []
        
        # Simulate different call scenarios
        test_scenarios = [
            {
                "language": "en-US",
                "assistant": 2,  # Amira
                "messages": [
                    "Hello, I need help with my internet connection",
                    "My internet is very slow",
                    "What can I do to fix this?",
                    "Thank you for your help"
                ]
            },
            {
                "language": "fr-FR", 
                "assistant": 1,  # Slah
                "messages": [
                    "Bonjour, j'ai un problème avec ma facture",
                    "Je ne comprends pas ces frais",
                    "Merci pour votre aide"
                ]
            }
        ]
        
        print("Choose a test scenario:")
        print("1. English customer service (Amira)")
        print("2. French business support (Slah)")
        print("3. Manual conversation")
        
        choice = input("Enter choice (1-3): ").strip()
        
        if choice == "1":
            scenario = test_scenarios[0]
            self.run_scenario(scenario)
        elif choice == "2":
            scenario = test_scenarios[1]
            self.run_scenario(scenario)
        else:
            self.manual_conversation()
    
    def run_scenario(self, scenario):
        """Run a predefined test scenario"""
        print(f"\n🎭 Running {scenario['language']} scenario with assistant {scenario['assistant']}")
        print("="*50)
        
        conversation_history = []
        
        # Welcome message
        assistant_name = "Amira" if scenario['assistant'] == 2 else "Slah"
        print(f"🤖 {assistant_name}: Hello! How can I help you today?")
        
        for i, message in enumerate(scenario['messages']):
            print(f"\n👤 Caller: {message}")
            
            # Send to AI backend
            ai_response = self.send_to_ai(
                transcription=message,
                history=conversation_history,
                language=scenario['language'],
                assistant_id=scenario['assistant']
            )
            
            if ai_response:
                print(f"🤖 {assistant_name}: {ai_response}")
                
                conversation_history.append({
                    "user": message,
                    "ai": ai_response
                })
            else:
                print(f"🤖 {assistant_name}: I'm having technical difficulties.")
            
            # Add delay to simulate natural conversation
            time.sleep(1)
        
        print("\n📞 Call ended")
        print(f"📊 Total exchanges: {len(conversation_history)}")
    
    def manual_conversation(self):
        """Manual conversation mode"""
        print("\n💬 Manual conversation mode")
        print("Type your messages (type 'quit' to end)")
        print("="*50)
        
        conversation_history = []
        assistant_id = 2  # Default to Amira
        language = "en-US"  # Default to English
        assistant_name = "Amira"
        
        print(f"🤖 {assistant_name}: Hello! I'm your AI assistant. How can I help you today?")
        
        while True:
            user_input = input("👤 You: ").strip()
            
            if user_input.lower() in ['quit', 'exit', 'bye', 'goodbye']:
                print(f"🤖 {assistant_name}: Thank you for calling! Have a great day!")
                break
            
            if not user_input:
                continue
            
            # Special commands
            if user_input.startswith('/'):
                if user_input == '/switch':
                    assistant_id = 1 if assistant_id == 2 else 2
                    assistant_name = "Slah" if assistant_id == 1 else "Amira"
                    print(f"🔄 Switched to {assistant_name}")
                    continue
                elif user_input.startswith('/lang'):
                    parts = user_input.split()
                    if len(parts) > 1:
                        language = parts[1]
                        print(f"🌍 Language set to {language}")
                    continue
            
            # Send to AI
            ai_response = self.send_to_ai(
                transcription=user_input,
                history=conversation_history,
                language=language,
                assistant_id=assistant_id
            )
            
            if ai_response:
                print(f"🤖 {assistant_name}: {ai_response}")
                
                conversation_history.append({
                    "user": user_input,
                    "ai": ai_response
                })
            else:
                print(f"🤖 {assistant_name}: I'm having technical difficulties right now.")
        
        print(f"\n📊 Conversation ended. Total exchanges: {len(conversation_history)}")
    
    def send_to_ai(self, transcription, history, language="en-US", assistant_id=2):
        """Send message to AI backend"""
        try:
            payload = {
                "transcription": transcription,
                "history": history,
                "language": language,
                "sessionId": self.session_id,
                "assistantId": assistant_id
            }
            
            response = requests.post(
                self.backend_url,
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get("aiResponse")
            else:
                print(f"⚠️ Backend error {response.status_code}: {response.text}")
                return None
                
        except requests.exceptions.Timeout:
            print("⚠️ Backend request timed out")
            return None
        except requests.exceptions.ConnectionError:
            print("⚠️ Cannot connect to backend")
            return None
        except Exception as e:
            print(f"⚠️ Error sending to AI: {e}")
            return None

def main():
    print("🚀 Phone Call Simulator")
    print("Make sure your Python backend is running: python rag_server.py")
    print("="*60)
    
    simulator = PhoneCallSimulator()
    simulator.simulate_phone_call()

if __name__ == "__main__":
    main()