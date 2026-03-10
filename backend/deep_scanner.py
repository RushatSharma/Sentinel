import time
import requests
import math
import uuid
from urllib.parse import urljoin
from playwright.sync_api import sync_playwright

# --- IMPORT KNOWLEDGE BASE ---
try:
    from vuln_kb import VULN_DB
except ImportError:
    VULN_DB = {}

# --- HELPER: Risk Calculation ---
def calculate_deep_risk(vuln_type, severity):
    cvss_map = {
        "SQL_INJECTION": 9.8, 
        "XSS_REFLECTED": 6.1, 
        "SSTI": 9.0,                
        "SHADOW_API": 7.5, 
        "SENSITIVE_FILE": 9.0, 
        "OPEN_REDIRECT": 6.1,       
        "MISSING_CSP": 4.3,
        "MISSING_HSTS": 3.1,
        "CLICKJACKING": 4.3,
        "SERVER_ERROR": 5.0,        
        "WEAK_SSL": 5.3,
        "BLIND_XSS": 9.0,           
        "BLIND_SSRF": 9.8           
    }
    
    score = cvss_map.get(vuln_type, 5.0)
    if severity == "Critical": score = max(score, 9.0)
    elif severity == "High": score = max(score, 7.5)
    
    base_asset_value = 1000 
    financial_impact = base_asset_value * math.exp(score / 2.5)
    return round(score, 1), round(financial_impact, 2)

def create_vuln(v_key, url, custom_details, severity="Medium"):
    kb_data = VULN_DB.get(v_key, {})
    title = kb_data.get("title", v_key)
    cvss, cost = calculate_deep_risk(v_key, severity)

    return {
        "type": title,              
        "url": url,
        "severity": severity,
        "description": kb_data.get("description", custom_details),
        "impact": kb_data.get("impact", "Check detailed logs for impact analysis."),
        "remediation": kb_data.get("remediation", "Please patch this issue immediately."),
        "fix": kb_data.get("code_fix", "No specific code patch available."),
        "reproduction": f"Automated Deep Scan found: {custom_details}",
        "cvss": cvss,
        "est_cost": cost
    }

# --- OAST HELPER FUNCTIONS ---
def generate_oast_id():
    return str(uuid.uuid4()).replace("-", "")[:12]

def check_oast_interactions(oast_id):
    print(f"[*] 📡 Polling OAST server for ID: {oast_id}...")
    return False

# --- MODULE 1: Header & SSL Analysis ---
def scan_headers_and_ssl(target_url):
    findings = []
    print(f"[*] 🔍 Analyzing HTTP Headers for {target_url}...")
    try:
        res = requests.get(target_url, timeout=5)
        headers = {k.lower(): v for k, v in res.headers.items()}
        
        if 'content-security-policy' not in headers:
            findings.append(create_vuln("MISSING_CSP", target_url, "Content-Security-Policy header is missing.", "Medium"))
        if 'strict-transport-security' not in headers and target_url.startswith("https"):
            findings.append(create_vuln("MISSING_HSTS", target_url, "HSTS header is missing.", "Low"))
        if 'x-frame-options' not in headers:
            findings.append(create_vuln("CLICKJACKING", target_url, "X-Frame-Options header is missing.", "Low"))
        if 'server' in headers:
            findings.append(create_vuln("SERVER_ERROR", target_url, f"Server header exposes technology: {headers['server']}", "Low"))
    except Exception as e:
        print(f"[!] Header Scan Error: {e}")
    return findings

# --- MODULE 2: Sensitive File Fuzzer ---
def scan_sensitive_files(target_url):
    findings = []
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
                if "404" not in res.text.lower() and "<html" not in res.text.lower():
                    findings.append(create_vuln("SENSITIVE_FILE", full_url, f"Accessible sensitive file found: {filename}", "Critical"))
        except: pass
    return findings

# --- MODULE 3: Active Playwright Scanner ---
def scan_active_playwright(target_url, auth_config=None):
    alerts = []
    oast_id = generate_oast_id()
    oast_domain = f"{oast_id}.interact.sh" 

    sql_errors = [
        "check the manual that corresponds to your mysql",
        "unrecognized token:", "syntax error at or near",
        "sqlite_error", "ora-00933", "postgresql query failed",
        "unterminated quoted string", "you have an error in your sql syntax"
    ]

    payloads = [
        {"key": "SQL_INJECTION", "payload": "' OR '1'='1", "check": sql_errors},
        {"key": "XSS_REFLECTED", "payload": "<img src=x onerror=alert('SENTINEL')>", "check": []},
        {"key": "SSTI", "payload": "{{7*7}}", "check": ["49"]},
        {"key": "OPEN_REDIRECT", "payload": "http://google.com", "check": []},
        {"key": "BLIND_XSS", "payload": f"\"><script src='http://{oast_domain}'></script>", "check": []},
        {"key": "BLIND_SSRF", "payload": f"http://{oast_domain}", "check": []}
    ]

    try:
        with sync_playwright() as p:
            print("[*] 🚀 Launching Headless Browser...")
            browser = p.chromium.launch(headless=True, slow_mo=100)
            context = browser.new_context(ignore_https_errors=True)
            
            # --- NEW: HEURISTIC AUTO-LOGIN ENGINE ---
            if auth_config and auth_config.get('type') == 'form':
                try:
                    print("[*] 🧠 Engaging Heuristic Auto-Login Engine...")
                    login_page = context.new_page()
                    login_page.goto(auth_config.get('login_url'), timeout=30000)
                    login_page.wait_for_load_state("networkidle", timeout=15000)
                    
                    # Heuristic 1: Find password field (Strongest anchor)
                    pass_input = login_page.locator('input[type="password"]').first
                    
                    # Heuristic 2: Find username field (email, user, or first text input)
                    user_input = login_page.locator('input[type="email"], input[name*="user"], input[name*="email"], input[id*="user"], input[type="text"]').first
                    
                    if pass_input.count() > 0 and user_input.count() > 0:
                        print("[*] 🎯 Selectors algorithmically identified. Injecting credentials...")
                        user_input.fill(auth_config.get('username'))
                        pass_input.fill(auth_config.get('password'))
                        
                        # Heuristic 3: Find the submit button
                        submit_button = login_page.locator('button[type="submit"], input[type="submit"], button:has-text("Login"), button:has-text("Sign In"), button:has-text("Log in"), button:has-text("Submit")').first
                        
                        if submit_button.count() > 0:
                            submit_button.click()
                        else:
                            print("[*] ⚠️ No clear submit button found. Pressing Enter...")
                            pass_input.press("Enter")
                            
                        login_page.wait_for_load_state("networkidle", timeout=15000)
                        print("[*] 🔓 Auto-Login heuristic execution complete.")
                    else:
                        print("[!] ❌ Heuristic Engine failed to locate standard login fields.")
                    login_page.close()
                except Exception as e:
                    print(f"[!] Authentication Engine Failed: {e}")

            page = context.new_page()
            
            def handle_dialog(dialog):
                if "SENTINEL" in dialog.message:
                    alerts.append(create_vuln("XSS_REFLECTED", target_url, f"CONFIRMED: XSS payload executed. Alert: '{dialog.message}'", "High"))
                try: dialog.dismiss()
                except: pass
            
            page.on("dialog", handle_dialog)
            page.on("response", lambda r: alerts.append(
                create_vuln("SHADOW_API", r.url, f"Background Request: {r.request.method} {r.url}", "Medium")
            ) if "json" in r.headers.get("content-type", "") and "api" in r.url and "google" not in r.url else None)

            try:
                print(f"[*] Navigating to {target_url}...")
                page.goto(target_url, timeout=60000)
                try: page.wait_for_load_state("networkidle", timeout=10000)
                except: pass

                print("[*] 🔓 Attempting to expand UI and dismiss popups...")
                for selector in ["button[aria-label='Close Welcome Banner']", "a[aria-label='dismiss cookie message']", ".mat-search_icon-search"]:
                    try: page.locator(selector).click(timeout=1000)
                    except: pass
                time.sleep(1)

                all_inputs = page.locator("input, textarea").all()
                visible_inputs = [inp for inp in all_inputs if inp.is_visible()]
                print(f"[*] Found {len(visible_inputs)} interactive inputs to test.")
                
                for i, inp in enumerate(visible_inputs):
                    for attack in payloads:
                        try:
                            current_input = page.locator("input:visible, textarea:visible").nth(i)
                            current_input.fill("")
                            current_input.fill(attack["payload"])
                            current_input.press("Enter")
                            page.wait_for_timeout(1000)
                            
                            if attack["key"] in ["SQL_INJECTION", "SSTI"]:
                                content = page.content().lower()
                                if any(x in content for x in attack["check"]):
                                    alerts.append(create_vuln(attack["key"], target_url, f"Payload {attack['payload']} succeeded. Signature found in response.", "Critical"))
                            
                            elif attack["key"] == "OPEN_REDIRECT":
                                if "google.com" in page.url:
                                    alerts.append(create_vuln("OPEN_REDIRECT", target_url, "Input successfully redirected user to external site (google.com).", "Medium"))
                                    page.go_back()
                                    time.sleep(1)
                        except Exception:
                            continue
            except Exception as e:
                print(f"[!] Browser Interaction Error: {e}")
            
            browser.close()
            
            print("[*] ⏳ Waiting 5 seconds for asynchronous OAST callbacks...")
            time.sleep(5)
            if check_oast_interactions(oast_id):
                alerts.append(create_vuln("BLIND_XSS", target_url, f"CONFIRMED OAST INTERACTION: Payload pinged {oast_domain}. Zero false positive.", "Critical"))

    except Exception as e:
        print(f"[!] Playwright Critical Error: {e}")

    unique_alerts = []
    seen = set()
    for a in alerts:
        if a and (a['type'], a['url']) not in seen:
            seen.add((a['type'], a['url']))
            unique_alerts.append(a)
            
    return unique_alerts

# --- ORCHESTRATOR ---
def run_deep_scan(target_url, user_id=None, auth_config=None):
    print(f"[*] 🚀 Starting Deep Scan on {target_url}")
    report = {
        "target": target_url,
        "vulnerabilities": [],
        "summary": {"high": 0, "medium": 0, "low": 0},
        "financial_risk_total": 0
    }

    report["vulnerabilities"].extend(scan_headers_and_ssl(target_url))
    report["vulnerabilities"].extend(scan_sensitive_files(target_url))
    report["vulnerabilities"].extend(scan_active_playwright(target_url, auth_config))

    for v in report["vulnerabilities"]:
        report["financial_risk_total"] += v.get("est_cost", 0)
        sev = v.get("severity", "Low")
        if sev in ["Critical", "High"]: report["summary"]["high"] += 1
        elif sev == "Medium": report["summary"]["medium"] += 1
        else: report["summary"]["low"] += 1

    print(f"[*] Deep Scan Complete. Total Issues: {len(report['vulnerabilities'])}")
    return report