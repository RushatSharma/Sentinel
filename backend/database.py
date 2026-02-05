import os
import json
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.id import ID
from appwrite.permission import Permission # <--- IMPORT THIS
from appwrite.role import Role             # <--- IMPORT THIS
from dotenv import load_dotenv

load_dotenv()

# Appwrite Configuration
APPWRITE_ENDPOINT = os.environ.get("VITE_APPWRITE_ENDPOINT")
APPWRITE_PROJECT_ID = os.environ.get("VITE_APPWRITE_PROJECT_ID")
APPWRITE_API_KEY = os.environ.get("APPWRITE_API_KEY")
DATABASE_ID = os.environ.get("VITE_APPWRITE_DATABASE_ID")
COLLECTION_ID = os.environ.get("VITE_APPWRITE_COLLECTION_ID")

client = Client()
if APPWRITE_ENDPOINT and APPWRITE_PROJECT_ID and APPWRITE_API_KEY:
    client.set_endpoint(APPWRITE_ENDPOINT)
    client.set_project(APPWRITE_PROJECT_ID)
    client.set_key(APPWRITE_API_KEY)
    databases = Databases(client)
else:
    print("[!] Warning: Appwrite credentials not found.")
    databases = None

def save_scan_result(user_id, target_url, mode, risk_score, vulns_found, report_json):
    if not databases or not user_id:
        return None

    data = {
        "user_id": user_id,
        "target_url": target_url,
        "scan_mode": mode,
        "risk_score": int(risk_score),
        "vulnerabilities_found": int(vulns_found),
        "report_json": json.dumps(report_json) 
    }

    try:
        # --- FIX: GRANT PERMISSIONS TO THE USER ---
        # This allows the specific user_id to Read, Update, and Delete this document
        perms = [
            Permission.read(Role.user(user_id)),
            Permission.update(Role.user(user_id)),
            Permission.delete(Role.user(user_id)),
        ]

        response = databases.create_document(
            database_id=DATABASE_ID,
            collection_id=COLLECTION_ID,
            document_id=ID.unique(),
            data=data,
            permissions=perms # <--- Pass permissions here
        )
        print(f"[+] Scan synced to Appwrite for user {user_id}")
        return response
    except Exception as e:
        print(f"[!] Failed to sync history: {e}")
        return None