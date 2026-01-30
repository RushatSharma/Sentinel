import time
import requests
import re
from playwright.sync_api import sync_playwright
# Import database save function (Ensure this matches your database.py)
from database import save_scan_result

# --- CONFIGURATION: SENSITIVE FILES TO HUNT ---
SENSITIVE_PATHS = [
    "/.env", "/.git/config", "/.vscode/sftp.json", "/backup.sql", 
    "/ds_store", "/phpinfo.php", "/config.php.bak", "/admin", 
    "/dashboard", "/api-docs", "/swagger.json", "/web.config"
]

# --- MAIN ORCHESTRATOR ---
def run_deep_scan(target_url, user_id=None):
    print(f"[*] Starting MAXED-OUT Deep Scan for {target_url}...")
    
    all_vulns = []

    # PHASE 1: HEADER & COOKIE AUDIT
    print("[*] Phase 1: Security Headers & Cookies...")
    all_vulns.extend(scan_headers_and_cookies(target_url))

    # PHASE 2: SENSITIVE FILE ENUMERATION
    print("[*] Phase 2: Sensitive File Enumeration...")
    all_vulns.extend(scan_sensitive_files(target_url))

    # PHASE 3: ACTIVE BROWSER FUZZING (The "Zap Replacement")
    print("[*] Phase 3: Active Browser Fuzzing (SQLi/XSS)...")
    all_vulns.extend(scan_active_playwright(target_url))

    # AGGREGATE REPORT
    final_report = {
        "target": target_url,
        "vulnerabilities": all_vulns,
        "summary": {
            "high": sum(1 for v in all_vulns if v['severity'] in ['High', 'Critical']),
            "medium": sum(1 for v in all_vulns if v['severity'] == 'Medium'),
            "low": sum(1 for v in all_vulns if v['severity'] == 'Low')
        }
    }
    
    # SAVE TO DB (If User ID provided)
    if user_id:
        try:
            high = final_report['summary']['high']
            med = final_report['summary']['medium']
            low = final_report['summary']['low']
            risk_score = min(100, (high * 25) + (med * 10) + (low * 2))

            save_scan_result(
                user_id=user_id,
                target_url=target_url,
                mode="Deep",
                risk_score=risk_score, 
                vulns_found=len(all_vulns), 
                report_json=final_report 
            )
            print(f"[*] Report saved for user {user_id}")
        except Exception as e:
            print(f"[!] DB Save Error: {e}")

    return final_report

# --- MODULE 1: HEADERS & COOKIES ---
def scan_headers_and_cookies(url):
    vulns = []
    try:
        res = requests.get(url, timeout=10)
        headers = {k.lower(): v for k, v in res.headers.items()}
        
        # A. Header Checks
        if 'content-security-policy' not in headers:
            vulns.append({
                "type": "Missing CSP Header",
                "details": "Content-Security-Policy is missing. This makes the site vulnerable to XSS.",
                "severity": "Medium",
                "fix": "Define a strict CSP (e.g., default-src 'self')."
            })
        
        if 'strict-transport-security' not in headers and url.startswith("https"):
            vulns.append({
                "type": "Missing HSTS Header",
                "details": "HTTP Strict Transport Security is not enabled.",
                "severity": "Low",
                "fix": "Add 'Strict-Transport-Security: max-age=31536000'."
            })

        if 'x-frame-options' not in headers:
            vulns.append({
                "type": "Clickjacking Risk",
                "details": "Site can be framed by attackers (missing X-Frame-Options).",
                "severity": "Low",
                "fix": "Set X-Frame-Options to DENY or SAMEORIGIN."
            })

        # B. Cookie Checks
        for cookie in res.cookies:
            if not cookie.secure and url.startswith("https"):
                vulns.append({
                    "type": "Insecure Cookie",
                    "details": f"Cookie '{cookie.name}' is missing the 'Secure' flag.",
                    "severity": "Medium",
                    "fix": "Set the Secure flag for all cookies."
                })
            if not cookie.has_nonstandard_attr('HttpOnly'):
                vulns.append({
                    "type": "Cookie Theft Risk",
                    "details": f"Cookie '{cookie.name}' is missing 'HttpOnly' flag (accessible via JS).",
                    "severity": "High",
                    "fix": "Set the HttpOnly flag to prevent XSS theft."
                })
    except Exception as e:
        print(f"[!] Header scan failed: {e}")
    
    return vulns

# --- MODULE 2: SENSITIVE FILE FUZZER ---
def scan_sensitive_files(base_url):
    vulns = []
    base_url = base_url.rstrip("/")
    
    for path in SENSITIVE_PATHS:
        target = base_url + path
        try:
            # We use allow_redirects=False to avoid custom 404 pages masking as 200
            res = requests.get(target, timeout=3, allow_redirects=False)
            
            if res.status_code == 200:
                # Basic false positive check: content length > 10 bytes
                if len(res.text) > 10: 
                    vulns.append({
                        "type": "Sensitive File Exposure",
                        "details": f"Publicly accessible sensitive file found: {path}",
                        "severity": "Critical",
                        "fix": f"Immediately delete or restrict access to {path}."
                    })
        except:
            continue
    return vulns

# --- MODULE 3: ACTIVE PLAYWRIGHT FUZZER ---
def scan_active_playwright(target_url):
    alerts = []
    
    # PAYLOADS (The "ZAP" Brain)
    payloads = [
        {"type": "SQL Injection (Deep)", "payload": "' OR '1'='1", "check": ["syntax error", "mysql", "warning", "postgres"]},
        {"type": "Reflected XSS (Deep)", "payload": "<img src=x onerror=alert('SENTINEL')>", "check": []}
    ]

    try:
        with sync_playwright() as p:
            # Launch optimized Chromium
            browser = p.chromium.launch(headless=True)
            # Set user agent to identify our scanner
            context = browser.new_context(user_agent="Sentinel-Security-Bot/2.0")
            page = context.new_page()
            
            # --- 3A. NETWORK MONITOR (500 Errors & Shadow APIs) ---
            def handle_response(response):
                try:
                    # Check for Server Crashes (500 Errors)
                    if response.status >= 500:
                        alerts.append({
                            "type": "Server Error (Potential Vuln)",
                            "details": f"Endpoint {response.url} returned status {response.status}. Input fuzzing might have broken the backend.",
                            "severity": "High",
                            "fix": "Check server logs for uncaught exceptions."
                        })
                    
                    # Check for Shadow APIs (Background JSON calls)
                    if "application/json" in response.headers.get("content-type", ""):
                        if "api" in response.url and "google" not in response.url:
                            alerts.append({
                                "type": "Shadow API Detected",
                                "details": f"Background API call intercepted: {response.method} {response.url}",
                                "severity": "Medium",
                                "fix": "Ensure this endpoint is documented and secured."
                            })
                except: pass

            page.on("response", handle_response)

            try:
                # Navigate to target
                page.goto(target_url, timeout=20000, wait_until="domcontentloaded")
                
                # --- 3B. STORAGE AUDIT (Secrets) ---
                local_storage = page.evaluate("() => JSON.stringify(localStorage)")
                session_storage = page.evaluate("() => JSON.stringify(sessionStorage)")
                
                combined_storage = (local_storage + session_storage).lower()
                
                if "token" in combined_storage or "auth" in combined_storage or "key" in combined_storage:
                     alerts.append({
                        "type": "Insecure Secret Storage",
                        "details": "Found potential Auth Tokens/Keys in LocalStorage or SessionStorage.",
                        "severity": "High",
                        "fix": "Store tokens in HttpOnly Cookies to prevent XSS theft."
                    })

                # --- 3C. ACTIVE FORM FUZZING ---
                # Find all interactive inputs
                inputs = page.locator("input:not([type='hidden']):not([type='submit'])").all()
                
                if not inputs:
                     alerts.append({"type": "Info", "details": "No interactive forms found to fuzz.", "severity": "Low", "fix": "N/A"})
                
                for i, input_el in enumerate(inputs):
                    for attack in payloads:
                        try:
                            # Re-locate to avoid stale element errors
                            current_input = page.locator("input:not([type='hidden']):not([type='submit'])").nth(i)
                            current_input.fill(attack["payload"])
                            current_input.press("Enter")
                            
                            # Wait for page reaction
                            page.wait_for_timeout(500) 
                            
                            content = page.content().lower()
                            
                            # Check 1: SQL Injection Success
                            if attack["type"] == "SQL Injection (Deep)":
                                for error in attack["check"]:
                                    if error in content:
                                        alerts.append({
                                            "type": attack["type"],
                                            "details": f"Payload {attack['payload']} caused DB error: {error}",
                                            "severity": "Critical",
                                            "fix": "Use parameterized queries (Prepared Statements)."
                                        })
                                        break
                                        
                            # Check 2: XSS Success (Reflection)
                            if attack["type"] == "Reflected XSS (Deep)":
                                if attack["payload"] in page.content():
                                    alerts.append({
                                        "type": attack["type"],
                                        "details": f"Payload {attack['payload']} was reflected in the DOM unescaped.",
                                        "severity": "High",
                                        "fix": "Escape all user inputs before rendering."
                                    })

                        except Exception: continue
                            
            except Exception as e:
                print(f"[!] Fuzzing error: {e}")

            browser.close()

    except Exception as e:
        print(f"[!] Playwright Engine failed: {e}")
        return []

    # Deduplicate alerts to keep report clean
    unique_alerts = []
    seen = set()
    for a in alerts:
        key = (a['type'], a['details'])
        if key not in seen:
            seen.add(key)
            unique_alerts.append(a)

    return unique_alerts