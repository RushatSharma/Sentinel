import time
import requests
import math
from urllib.parse import urljoin
from playwright.sync_api import sync_playwright

# --- IMPORT KNOWLEDGE BASE ---
# Ensures your report has rich descriptions, impacts, and remediation code.
try:
    from vuln_kb import VULN_DB
except ImportError:
    VULN_DB = {}

# --- HELPER: Risk Calculation ---
def calculate_deep_risk(vuln_type, severity):
    # Map friendly names or keys to CVSS scores
    cvss_map = {
        "SQL_INJECTION": 9.8, 
        "XSS_REFLECTED": 6.1, 
        "SSTI": 9.0,                # Critical: Remote Code Execution
        "SHADOW_API": 7.5, 
        "SENSITIVE_FILE": 9.0, 
        "OPEN_REDIRECT": 6.1,       # Medium: Phishing Risk
        "MISSING_CSP": 4.3,
        "MISSING_HSTS": 3.1,
        "CLICKJACKING": 4.3,
        "SERVER_ERROR": 5.0,        # Low: Info Leak
        "WEAK_SSL": 5.3
    }
    
    score = cvss_map.get(vuln_type, 5.0)
    
    # Adjust score based on severity
    if severity == "Critical": score = max(score, 9.0)
    elif severity == "High": score = max(score, 7.5)
    
    # Financial Impact Formula
    base_asset_value = 1000 
    financial_impact = base_asset_value * math.exp(score / 2.5)
    return round(score, 1), round(financial_impact, 2)

def create_vuln(v_key, url, custom_details, severity="Medium"):
    """
    Creates a vulnerability entry by merging dynamic findings (custom_details)
    with static rich text from the Knowledge Base (VULN_DB).
    """
    # 1. Fetch Static Data from KB
    kb_data = VULN_DB.get(v_key, {})
    
    # 2. Get Readable Title
    title = kb_data.get("title", v_key)
    
    # 3. Calculate Risk
    cvss, cost = calculate_deep_risk(v_key, severity)

    # 4. Build the Rich Entry
    return {
        "type": title,              
        "url": url,
        "severity": severity,
        
        # RICH TEXT FIELDS (From VulnKB)
        "description": kb_data.get("description", custom_details),
        "impact": kb_data.get("impact", "Check detailed logs for impact analysis."),
        "remediation": kb_data.get("remediation", "Please patch this issue immediately."),
        "fix": kb_data.get("code_fix", "No specific code patch available."),
        
        # DYNAMIC FIELDS (From Scanner)
        "reproduction": f"Automated Deep Scan found: {custom_details}",
        
        "cvss": cvss,
        "est_cost": cost
    }

# --- MODULE 1: Header & SSL Analysis ---
def scan_headers_and_ssl(target_url):
    findings = []
    print(f"[*] 📡 Analyzing HTTP Headers for {target_url}...")
    try:
        res = requests.get(target_url, timeout=5)
        headers = {k.lower(): v for k, v in res.headers.items()}
        
        # 1. CSP Check
        if 'content-security-policy' not in headers:
            findings.append(create_vuln("MISSING_CSP", target_url, "Content-Security-Policy header is missing.", "Medium"))
            
        # 2. HSTS Check
        if 'strict-transport-security' not in headers and target_url.startswith("https"):
            findings.append(create_vuln("MISSING_HSTS", target_url, "HSTS header is missing.", "Low"))
            
        # 3. Clickjacking (X-Frame-Options)
        if 'x-frame-options' not in headers:
            findings.append(create_vuln("CLICKJACKING", target_url, "X-Frame-Options header is missing.", "Low"))

        # 4. Server Info Leak
        if 'server' in headers:
            findings.append(create_vuln("SERVER_ERROR", target_url, f"Server header exposes technology: {headers['server']}", "Low"))
            
    except Exception as e:
        print(f"[!] Header Scan Error: {e}")
        
    return findings

# --- MODULE 2: Sensitive File Fuzzer ---
def scan_sensitive_files(target_url):
    findings = []
    # Expanded list of Dangerous Files
    files = [
        ".env", ".git/config", "backup.sql", "database.sql", 
        "phpinfo.php", ".DS_Store", "web.config", "server.js",
        "config.json", "id_rsa", "docker-compose.yml", "swagger.json"
    ]
    
    print(f"[*] 📂 Fuzzing {len(files)} sensitive files...")
    
    for filename in files:
        full_url = urljoin(target_url, filename)
        try:
            res = requests.get(full_url, timeout=3, allow_redirects=False)
            if res.status_code == 200 and len(res.content) > 10:
                # Stricter Check: Ignore if it looks like a generic HTML 404 page
                if "404" not in res.text.lower() and "<html" not in res.text.lower():
                    findings.append(create_vuln(
                        "SENSITIVE_FILE", full_url, 
                        f"Accessible sensitive file found: {filename}", "Critical"
                    ))
        except: pass
    return findings

# --- MODULE 3: Active Playwright Scanner (The Engine) ---
def scan_active_playwright(target_url):
    alerts = []
    
    # 1. SQL Injection Signatures (Strict to avoid False Positives)
    sql_errors = [
        "check the manual that corresponds to your mysql",
        "unrecognized token:", "syntax error at or near",
        "sqlite_error", "ora-00933", "postgresql query failed",
        "unterminated quoted string", "you have an error in your sql syntax"
    ]

    # 2. ATTACK PAYLOADS
    payloads = [
        # SQLi
        {"key": "SQL_INJECTION", "payload": "' OR '1'='1", "check": sql_errors},
        
        # XSS (Event Based)
        {"key": "XSS_REFLECTED", "payload": "<img src=x onerror=alert('SENTINEL')>", "check": []},
        
        # SSTI (Server-Side Template Injection) - New!
        # If the server calculates 7*7 and shows 49, it is vulnerable.
        {"key": "SSTI", "payload": "{{7*7}}", "check": ["49"]},
        
        # Open Redirect - New!
        # Attempts to force the browser to navigate to Google.
        {"key": "OPEN_REDIRECT", "payload": "http://google.com", "check": []}
    ]

    try:
        with sync_playwright() as p:
            print("[*] 🎭 Launching Headless Browser...")
            # slow_mo helps avoid race conditions on SPAs
            browser = p.chromium.launch(headless=True, slow_mo=100)
            context = browser.new_context(ignore_https_errors=True)
            page = context.new_page()
            
            # --- LISTENER 1: XSS Detection (Sure Shot) ---
            def handle_dialog(dialog):
                if "SENTINEL" in dialog.message:
                    alerts.append(create_vuln(
                        "XSS_REFLECTED", target_url, 
                        f"CONFIRMED: XSS payload executed. Alert: '{dialog.message}'", "High"
                    ))
                    try: dialog.dismiss()
                    except: pass
                else:
                    try: dialog.dismiss()
                    except: pass
            page.on("dialog", handle_dialog)
            
            # --- LISTENER 2: Shadow API Detection ---
            # Catches background JSON requests
            page.on("response", lambda r: alerts.append(
                create_vuln("SHADOW_API", r.url, f"Background Request: {r.request.method} {r.url}", "Medium")
            ) if "json" in r.headers.get("content-type", "") and "api" in r.url and "google" not in r.url else None)

            try:
                print(f"[*] Navigating to {target_url}...")
                page.goto(target_url, timeout=60000)
                
                try: page.wait_for_load_state("networkidle", timeout=10000)
                except: pass

                # --- STEP 1: POPUP DISMISSAL ---
                print("[*] 🧹 Attempting to dismiss popups...")
                try: page.locator("button[aria-label='Close Welcome Banner']").click(timeout=1000)
                except: pass
                try: page.locator("a[aria-label='dismiss cookie message']").click(timeout=1000)
                except: pass

                # --- STEP 2: UI UNLOCKING (Juice Shop Fix) ---
                print("[*] 🔓 Attempting to expand search bars...")
                try: page.locator(".mat-search_icon-search").click(timeout=1000)
                except: pass
                
                time.sleep(1) # Wait for animation

                # --- STEP 3: FIND INPUTS ---
                # Look for VISIBLE inputs only
                all_inputs = page.locator("input, textarea").all()
                visible_inputs = [inp for inp in all_inputs if inp.is_visible()]
                print(f"[*] Found {len(visible_inputs)} interactive inputs to test.")
                
                # --- STEP 4: ATTACK LOOP ---
                for i, inp in enumerate(visible_inputs):
                    for attack in payloads:
                        try:
                            # Re-locate to avoid StaleElementReference
                            current_input = page.locator("input:visible, textarea:visible").nth(i)
                            current_input.fill("")
                            current_input.fill(attack["payload"])
                            current_input.press("Enter")
                            
                            # Wait for reaction
                            page.wait_for_timeout(1000)
                            
                            # CHECK A: Text Content (SQLi / SSTI)
                            content = page.content().lower()
                            if attack["key"] in ["SQL_INJECTION", "SSTI"]:
                                if any(x in content for x in attack["check"]):
                                    sev = "Critical" if attack["key"] == "SQL_INJECTION" else "Critical"
                                    alerts.append(create_vuln(
                                        attack["key"], target_url, 
                                        f"Payload {attack['payload']} succeeded. Signature found in response.", sev
                                    ))
                            
                            # CHECK B: URL Navigation (Open Redirect)
                            if attack["key"] == "OPEN_REDIRECT":
                                if "google.com" in page.url:
                                    alerts.append(create_vuln(
                                        "OPEN_REDIRECT", target_url, 
                                        "Input successfully redirected user to external site (google.com).", "Medium"
                                    ))
                                    page.go_back() # Return to continue testing
                                    time.sleep(1)

                        except Exception as e:
                            continue
                            
            except Exception as e:
                print(f"[!] Browser Interaction Error: {e}")
            
            browser.close()
    except Exception as e:
        print(f"[!] Playwright Critical Error: {e}")

    # Deduplication
    unique_alerts = []
    seen = set()
    for a in alerts:
        if a and (a['type'], a['url']) not in seen:
            seen.add((a['type'], a['url']))
            unique_alerts.append(a)
            
    return unique_alerts

# --- ORCHESTRATOR ---
def run_deep_scan(target_url, user_id=None):
    print(f"[*] 🚀 Starting Deep Scan on {target_url}")
    report = {
        "target": target_url,
        "vulnerabilities": [],
        "summary": {"high": 0, "medium": 0, "low": 0},
        "financial_risk_total": 0
    }

    # 1. Run Header Analysis
    report["vulnerabilities"].extend(scan_headers_and_ssl(target_url))

    # 2. Run Sensitive File Fuzzer
    report["vulnerabilities"].extend(scan_sensitive_files(target_url))

    # 3. Run Active Playwright Scanner
    report["vulnerabilities"].extend(scan_active_playwright(target_url))

    # Summary Stats
    for v in report["vulnerabilities"]:
        report["financial_risk_total"] += v.get("est_cost", 0)
        sev = v.get("severity", "Low")
        if sev in ["Critical", "High"]: report["summary"]["high"] += 1
        elif sev == "Medium": report["summary"]["medium"] += 1
        else: report["summary"]["low"] += 1

    print(f"[*] Deep Scan Complete. Total Issues: {len(report['vulnerabilities'])}")
    return report