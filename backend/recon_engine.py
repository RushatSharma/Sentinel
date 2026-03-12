import requests
import socket
import concurrent.futures
from urllib.parse import urlparse

# --- IMPORT KNOWLEDGE BASE ---
try:
    from vuln_kb import RECON_KB
except ImportError:
    RECON_KB = {}

def classify_subdomain(subdomain, status):
    """Matches a subdomain to the Hacker's Playbook intelligence."""
    # Fallback default if KB is missing or not matched
    default_intel = RECON_KB.get("default", {
        "title": "Standard Web Infrastructure",
        "risk": "Low",
        "playbook": "This appears to be standard web infrastructure. Attackers will map it, scan for open ports, and fingerprint the web server.",
        "remediation": "Keep all server software up to date. Close all non-essential ports.",
        "next_step": "Run a standard vulnerability scan."
    })

    if status == "Offline":
        return RECON_KB.get("subdomain_takeover", default_intel)
        
    for key, data in RECON_KB.items():
        if key in ["subdomain_takeover", "default"]:
            continue
        for keyword in data.get("keywords", []):
            if keyword in subdomain:
                return data
                
    return default_intel

def query_alienvault(domain):
    subs = set()
    try:
        res = requests.get(f"https://otx.alienvault.com/api/v1/indicators/domain/{domain}/passive_dns", timeout=10)
        if res.status_code == 200:
            for entry in res.json().get('passive_dns', []):
                hostname = entry.get('hostname', '').lower()
                if hostname.endswith(domain):
                    subs.add(hostname)
    except Exception: pass
    return subs

def query_hackertarget(domain):
    subs = set()
    try:
        res = requests.get(f"https://api.hackertarget.com/hostsearch/?q={domain}", timeout=10)
        if res.status_code == 200:
            for line in res.text.split('\n'):
                if ',' in line:
                    hostname = line.split(',')[0].lower()
                    if hostname.endswith(domain):
                        subs.add(hostname)
    except Exception: pass
    return subs

def query_crtsh(domain):
    subs = set()
    try:
        res = requests.get(f"https://crt.sh/?q=%.{domain}&output=json", timeout=10)
        if res.status_code == 200:
            for entry in res.json():
                names = entry.get('name_value', '').lower().split('\n')
                for n in names:
                    if '*' not in n and n.endswith(domain):
                        subs.add(n)
    except Exception: pass
    return subs

def resolve_host(sub):
    """Resolves IP, checks HTTP status, and attaches Hacker's Playbook intel."""
    try:
        ip = socket.gethostbyname(sub)
        status = "Offline"
        
        # Fast port 80/443 check
        try:
            resp = requests.get(f"http://{sub}", timeout=2, allow_redirects=False)
            status = str(resp.status_code)
        except requests.exceptions.RequestException:
            try:
                resp = requests.get(f"https://{sub}", timeout=2, allow_redirects=False)
                status = str(resp.status_code)
            except: pass
            
        return {
            "subdomain": sub,
            "ip": ip,
            "status": status,
            "intel": classify_subdomain(sub, status)
        }
    except Exception:
        return None # Fails to resolve DNS

def run_recon(domain):
    # Clean input
    if domain.startswith("http"):
        domain = urlparse(domain).netloc
    domain = domain.replace("www.", "")

    print(f"[*] 🌍 Aggregating OSINT for: {domain}")
    subdomains = set()

    # Query multiple intelligence sources
    print("[*] 🔍 Querying AlienVault OTX...")
    subdomains.update(query_alienvault(domain))
    
    print("[*] 🔍 Querying HackerTarget...")
    subdomains.update(query_hackertarget(domain))
    
    print("[*] 🔍 Querying Certificate Transparency (crt.sh)...")
    subdomains.update(query_crtsh(domain))

    if not subdomains:
        subdomains.add(domain)

    print(f"[*] 🎯 Found {len(subdomains)} unique subdomains. Resolving IPs via ThreadPool...")

    results = []
    # Cap at 50 to ensure the web UI doesn't hang during live demos
    target_subs = list(subdomains)[:50] 

    # Launch 10 concurrent threads for massive speed boost
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        future_to_sub = {executor.submit(resolve_host, sub): sub for sub in target_subs}
        for future in concurrent.futures.as_completed(future_to_sub):
            data = future.result()
            if data:
                results.append(data)

    # Sort results so active HTTP servers appear at the top
    results.sort(key=lambda x: (x['status'] == 'Offline', x['subdomain']))

    print(f"[*] ✅ Recon Complete. Mapped {len(results)} active assets.")
    
    return {
        "target": domain,
        "total_found": len(results),
        "infrastructure": results
    }