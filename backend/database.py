import os
import json
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.id import ID
from dotenv import load_dotenv

load_dotenv()  # Load variables from .env

# Appwrite Configuration
# These should be defined in your .env file
APPWRITE_ENDPOINT = os.environ.get("VITE_APPWRITE_ENDPOINT")
APPWRITE_PROJECT_ID = os.environ.get("VITE_APPWRITE_PROJECT_ID")
APPWRITE_API_KEY = os.environ.get("APPWRITE_API_KEY")  # Use a Secret API Key for backend
DATABASE_ID = os.environ.get("VITE_APPWRITE_DATABASE_ID")
COLLECTION_ID = os.environ.get("VITE_APPWRITE_COLLECTION_ID")

# Initialize the Appwrite Client
client = Client()
if APPWRITE_ENDPOINT and APPWRITE_PROJECT_ID and APPWRITE_API_KEY:
    client.set_endpoint(APPWRITE_ENDPOINT)
    client.set_project(APPWRITE_PROJECT_ID)
    client.set_key(APPWRITE_API_KEY)
    databases = Databases(client)
else:
    print("[!] Warning: Appwrite credentials not found. History will not be saved.")
    databases = None

def save_scan_result(user_id, target_url, mode, risk_score, vulns_found, report_json):
    """
    Saves a scan report to the Appwrite 'scan_history' collection.
    """
    if not databases or not user_id:
        print("[!] Database service unavailable or missing user_id.")
        return None

    # Appwrite requires specific attributes. Ensure these match your Collection settings.
    # Note: Appwrite does not have a native 'jsonb' type like Supabase; 
    # we stringify the report_json to store it in a large string attribute.
    data = {
        "user_id": user_id,
        "target_url": target_url,
        "scan_mode": mode,
        "risk_score": int(risk_score),
        "vulnerabilities_found": int(vulns_found),
        "report_json": json.dumps(report_json) 
    }

    try:
        # Create a new document in the collection
        response = databases.create_document(
            database_id=DATABASE_ID,
            collection_id=COLLECTION_ID,
            document_id=ID.unique(),
            data=data
        )
        print(f"[+] Scan report synced to Appwrite for user {user_id}")
        return response
    except Exception as e:
        print(f"[!] Failed to sync history to Appwrite: {e}")
        return None