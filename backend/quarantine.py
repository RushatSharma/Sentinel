import os
import requests
import base64

# Best practice: Load your API key from your .env file
VT_API_KEY = os.environ.get("VIRUSTOTAL_API_KEY", "")

def get_threat_explanation(engine_results):
    """Generates a simple, human-readable explanation of the threat based on engine signatures."""
    if not engine_results:
        return "No malicious signatures were detected by any of the global security engines. The artifact appears to be clean and safe."
    
    # Combine all engine results into a single string for keyword matching
    combined_results = " ".join([r.get("result", "").lower() for r in engine_results])
    
    if "ransom" in combined_results or "wannacry" in combined_results or "crypt" in combined_results:
        return "Ransomware Threat: This artifact is designed to encrypt your personal files or lock you out of your system, demanding a ransom payment to restore access. Do not execute or interact with this file/domain."
    elif "trojan" in combined_results:
        return "Trojan Horse: This malware disguises itself as a legitimate file or program. Once executed, it secretly creates a backdoor for attackers to steal data, monitor keystrokes, or take control of your system."
    elif "phish" in combined_results or "credential" in combined_results:
        return "Phishing / Credential Stealer: This artifact attempts to deceive users into providing sensitive information such as passwords, banking details, or session tokens via fake login pages or scripts."
    elif "adware" in combined_results:
        return "Adware: This program forcefully displays unwanted advertisements, potentially tracking your browsing behavior and severely degrading system performance."
    elif "worm" in combined_results:
        return "Worm: A self-replicating malware that spreads across networks without requiring user interaction, often consuming massive bandwidth and dropping secondary payloads."
    else:
        return "Generic Malware: Multiple security engines have flagged this artifact as dangerous. It contains malicious code intended to compromise your system's security, privacy, or stability."

def generate_mock_data(artifact, scan_type):
    """Mock data generator so the UI can be tested without an API key."""
    print("[!] No VirusTotal API key found. Returning mock quarantine data.")
    
    is_malicious = "evil" in artifact.lower() or "bad" in artifact.lower()
    
    engines = []
    if is_malicious:
        engines = [
            {"engine": "Kaspersky", "result": "Trojan.Ransom.WannaCry"},
            {"engine": "BitDefender", "result": "Ransom.Win32.WannaCrypt.A"},
            {"engine": "Sophos", "result": "Troj/Wanna-G"},
            {"engine": "McAfee", "result": "Ransom-WannaCry!"},
            {"engine": "Symantec", "result": "Ransom.Wannacry"},
            {"engine": "Avast", "result": "Win32:Malware-gen"}
        ]
    
    return {
        "target": artifact,
        "type": scan_type,
        "malicious_count": 42 if is_malicious else 0,
        "total_engines": 72,
        "status": "Mock Analysis Complete",
        "message": "Add VIRUSTOTAL_API_KEY to your .env to get real intelligence.",
        "engine_results": engines,
        "threat_explanation": get_threat_explanation(engines) # Added explanation
    }

def encode_url_identifier(url):
    url_id = base64.urlsafe_b64encode(url.encode()).decode().strip("=")
    return url_id

def analyze_artifact(artifact, scan_type):
    if not VT_API_KEY:
        return generate_mock_data(artifact, scan_type)

    headers = {"x-apikey": VT_API_KEY}

    if scan_type == "hash":
        url = f"https://www.virustotal.com/api/v3/files/{artifact}"
    elif scan_type == "ip":
        url = f"https://www.virustotal.com/api/v3/ip_addresses/{artifact}"
    elif scan_type == "url":
        url_id = encode_url_identifier(artifact)
        url = f"https://www.virustotal.com/api/v3/urls/{url_id}"
    else:
        return {"error": "Invalid scan type. Must be 'hash', 'ip', or 'url'."}

    try:
        response = requests.get(url, headers=headers)
        
        if response.status_code == 404:
            return {
                "target": artifact,
                "type": scan_type,
                "malicious_count": 0,
                "total_engines": 72,
                "status": "Clean",
                "message": "Artifact not found in VT database (likely clean or never seen).",
                "engine_results": [],
                "threat_explanation": get_threat_explanation([]) # Safe explanation
            }
            
        if response.status_code != 200:
            return {"error": f"VirusTotal API Error: {response.status_code} - {response.text}"}

        data = response.json()
        attributes = data.get("data", {}).get("attributes", {})
        stats = attributes.get("last_analysis_stats", {})
        results = attributes.get("last_analysis_results", {})
        
        malicious_hits = stats.get("malicious", 0) + stats.get("suspicious", 0)
        
        engine_details = []
        for engine_name, engine_data in results.items():
            if engine_data.get("category") in ["malicious", "suspicious"]:
                engine_details.append({
                    "engine": engine_name,
                    "result": engine_data.get("result", "Unspecified Malware")
                })
        
        return {
            "target": artifact,
            "type": scan_type,
            "malicious_count": malicious_hits,
            "total_engines": sum(stats.values()),
            "status": "Malicious" if malicious_hits > 0 else "Clean",
            "message": "Live VT intelligence successfully retrieved.",
            "engine_results": engine_details,
            "threat_explanation": get_threat_explanation(engine_details) # dynamic explanation
        }

    except Exception as e:
        return {"error": f"Containment engine failed: {str(e)}"}