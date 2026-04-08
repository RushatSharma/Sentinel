import os
import json
from appwrite.client import Client
from appwrite.services.databases import Databases
from appwrite.id import ID
from appwrite.permission import Permission 
from appwrite.role import Role             
from dotenv import load_dotenv

load_dotenv()

# Appwrite Configuration
APPWRITE_ENDPOINT = os.environ.get("VITE_APPWRITE_ENDPOINT")
APPWRITE_PROJECT_ID = os.environ.get("VITE_APPWRITE_PROJECT_ID")
APPWRITE_API_KEY = os.environ.get("APPWRITE_API_KEY")
DATABASE_ID = os.environ.get("VITE_APPWRITE_DATABASE_ID")
COLLECTION_ID = os.environ.get("VITE_APPWRITE_COLLECTION_ID")

print("\n--- APPWRITE BACKEND CONFIG CHECK ---")
print(f"ENDPOINT: {APPWRITE_ENDPOINT}")
print(f"PROJECT_ID: {APPWRITE_PROJECT_ID}")
print(f"API_KEY: {'[SET]' if APPWRITE_API_KEY else '[MISSING]'} -> REQUIRED FOR BACKEND SAVES")
print(f"DATABASE_ID: {DATABASE_ID}")
print(f"COLLECTION_ID: {COLLECTION_ID}")
print("-------------------------------------\n")

client = Client()
if APPWRITE_ENDPOINT and APPWRITE_PROJECT_ID and APPWRITE_API_KEY:
    client.set_endpoint(APPWRITE_ENDPOINT)
    client.set_project(APPWRITE_PROJECT_ID)
    client.set_key(APPWRITE_API_KEY)
    databases = Databases(client)
else:
    databases = None

def save_scan_result(user_id, target_url, mode, risk_score, vulns_found, report_json):
    print(f"\n[*] DB SYNC INITIATED: {mode} on {target_url}")
    
    if not databases:
        print("[!] DB SYNC ABORTED: 'databases' object is None. You are missing APPWRITE_API_KEY in backend/.env")
        return None
        
    if not user_id:
        print("[!] DB SYNC ABORTED: No 'user_id' received from frontend.")
        return None

    data = {
        "user_id": str(user_id),
        "target_url": str(target_url)[:250], # Truncated to prevent standard 255 limit crashes
        "scan_mode": str(mode),
        "risk_score": int(risk_score),
        "vulnerabilities_found": int(vulns_found),
        "report_json": json.dumps(report_json) 
    }

    try:
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
            permissions=perms 
        )
        print(f"[+] DB SYNC SUCCESS: {mode} saved for user {user_id}")
        return response
    except Exception as e:
        print(f"[!] DB SYNC FAILED: Appwrite rejected the document.")
        print(f"    ERROR DETAILS: {str(e)}")
        return None