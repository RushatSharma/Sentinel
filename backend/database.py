import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv() # Load variables from .env

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")

# Initialize the client if keys exist
if url and key:
    supabase: Client = create_client(url, key)
else:
    print("[!] Warning: Supabase credentials not found. History will not be saved.")
    supabase = None

def save_scan_result(user_id, target_url, mode, risk_score, vulns_found, report_json):
    """
    Inserts a completed scan report into the scan_history table.
    """
    if not supabase or not user_id:
        return None

    data = {
        "user_id": user_id,
        "target_url": target_url,
        "scan_mode": mode,
        "risk_score": risk_score,
        "vulnerabilities_found": vulns_found,
        "report_json": report_json 
    }

    try:
        response = supabase.table("scan_history").insert(data).execute()
        print(f"[+] Scan report saved to database for user {user_id}")
        return response
    except Exception as e:
        print(f"[!] Failed to save history: {e}")
        return None