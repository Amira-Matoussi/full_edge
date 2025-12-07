"""
Trello utility functions for RAG Server
Handles Trello card creation
"""
import os
import requests

# Trello configuration
TRELLO_API_KEY = os.getenv("TRELLO_API_KEY")
TRELLO_TOKEN = os.getenv("TRELLO_TOKEN")
TRELLO_LIST_ID = os.getenv("TRELLO_LIST_ID")


def create_trello_card(title: str, description: str) -> str | None:
    """
    Create a Trello card in the configured list.
    Returns the card's short URL if successful, otherwise None.
    """
    if not (TRELLO_API_KEY and TRELLO_TOKEN and TRELLO_LIST_ID):
        print("⚠️ Trello not configured properly in environment variables")
        return None

    url = "https://api.trello.com/1/cards"
    query = {
        "idList": TRELLO_LIST_ID,
        "key": TRELLO_API_KEY,
        "token": TRELLO_TOKEN,
        "name": title,
        "desc": description,
    }

    try:
        response = requests.post(url, params=query, timeout=10)
        if response.status_code == 200:
            card = response.json()
            print(f"✅ Trello card created: {card.get('shortUrl')}")
            return card.get("shortUrl")
        else:
            print(f"❌ Trello error {response.status_code}: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Trello request failed: {e}")
        return None
