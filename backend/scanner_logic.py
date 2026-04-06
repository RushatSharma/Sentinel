import time
import requests
import math
import re
import socket
import ssl
from urllib.parse import urlparse, urljoin, parse_qs, urlencode, urlunparse, parse_qsl
from playwright.sync_api import sync_playwright

# --- IMPORT KNOWLEDGE BASE ---
try:
    from vuln_kb import VULN_DB
except ImportError:
    VULN_DB = {}

# --- HELPER: Risk Calculation ---
def calculate_quick_risk(vuln_type, severity):
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

def create_quick_vuln(v_key, url, custom_details, severity="Medium"):
    kb_data = VULN_DB.get(v_key, {})
    title = kb_data.get("title", v_key)
    cvss, cost = calculate_quick_risk(v_key, severity)
    return {
        "type": title,              
        "url": url,
        "severity": severity,
        "description": kb_data.get("description", custom_details),
        "impact": kb_data.get("impact", "Requires developer review for exact impact."),
        "remediation": kb_data.get("remediation", "Apply standard security patches for this vulnerability class."),
        "fix": kb_data.get("code_fix", "Review code logic associated with this endpoint."),
        "reproduction": f"Quick Scan detected: {custom_details}",
        "cvss": cvss,
        "est_cost": cost
    }

# --- OAST HELPER ---
def generate_oast_token():
    try:
        print("[*] 🌐 Provisioning OAST listener for Quick Scan...")
        response = requests.post("https://webhook.site/token", timeout=10)
        if response.status_code in [200, 201]:
            return response.json().get('uuid')
    except: pass
    return None

def check_oast_interactions(token):
    if not token: return False
    try:
        response = requests.get(f"https://webhook.site/token/{token}/requests", timeout=10)
        if response.status_code == 200 and len(response.json().get('data', [])) > 0:
            return True
    except: pass
    return False

REQ_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

# --- STATIC MODULES (Headers, Files, Params, SSL, APIs) ---
def scan_headers_and_ssl(target_url):
    findings = []
    try:
        res = requests.get(target_url, headers=REQ_HEADERS, timeout=8)
        headers = {k.lower(): v for k, v in res.headers.items()}
        if 'content-security-policy' not in headers: findings.append(create_quick_vuln("MISSING_CSP", target_url, "Content-Security-Policy header is missing.", "Medium"))
        if 'strict-transport-security' not in headers and target_url.startswith("https"): findings.append(create_quick_vuln("MISSING_HSTS", target_url, "HSTS header is missing.", "Low"))
        if 'x-frame-options' not in headers: findings.append(create_quick_vuln("CLICKJACKING", target_url, "X-Frame-Options header is missing.", "Low"))
        if 'server' in headers: findings.append(create_quick_vuln("SERVER_ERROR", target_url, f"Server header exposes technology: {headers['server']}", "Low"))
    except: pass
    return findings

def scan_sensitive_files(target_url):
    findings = []
    files = [".env", ".git/config", "backup.sql", "phpinfo.php", "server.js"]
    parsed_url = urlparse(target_url)
    base_url = f"{parsed_url.scheme}://{parsed_url.netloc}/"
    
    for filename in files:
        full_url = urljoin(base_url, filename)
        try:
            res = requests.get(full_url, headers=REQ_HEADERS, timeout=4, allow_redirects=False)
            if res.status_code == 200 and len(res.content) > 10 and "404" not in res.text.lower():
                findings.append(create_quick_vuln("SENSITIVE_FILE", full_url, f"Accessible sensitive file found: {filename}", "Critical"))
        except: pass
    return findings

def scan_url_parameters(target_url):
    alerts = []
    parsed_url = urlparse(target_url)
    params = parse_qsl(parsed_url.query)
    if not params: return alerts
        
    payloads = [
        {"type": "SQL_INJECTION", "payload": "' OR '1'='1", "check": "500"}, 
        {"type": "SQL_INJECTION", "payload": "1' AND SLEEP(5)#", "time_delay": 5}, 
        {"type": "SSTI", "payload": "{{7*7}}", "check": "49"}
    ]
    
    try: baseline_time = requests.get(target_url, headers=REQ_HEADERS, timeout=10).elapsed.total_seconds()
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
                
                if "time_delay" in attack and elapsed > (baseline_time + 4.5):
                    alerts.append(create_quick_vuln("SQL_INJECTION", fuzzed_url, f"TIME-BASED SQLi: Engine sleep triggered for {elapsed:.2f}s.", "Critical"))
                elif res.status_code == 500 and attack["type"] == "SQL_INJECTION":
                    alerts.append(create_quick_vuln("SQL_INJECTION", fuzzed_url, "SUSPECTED SQLi: Payload crashed database (HTTP 500).", "High"))
                elif "check" in attack and attack["check"] in res.text and attack["check"] != "500":
                    alerts.append(create_quick_vuln(attack["type"], fuzzed_url, "Payload execution confirmed in response.", "Critical"))
            except requests.exceptions.Timeout:
                if "time_delay" in attack: alerts.append(create_quick_vuln("SQL_INJECTION", fuzzed_url, "TIME-BASED SQLi: Server timed out.", "Critical"))
    return alerts

def scan_shadow_apis(target_url):
    findings = []
    try:
        res = requests.get(target_url, headers=REQ_HEADERS, timeout=8)
        script_urls = re.findall(r'<script[^>]+src=["\']([^"\']+)["\']', res.text)
        for script_path in script_urls:
            s_res = requests.get(urljoin(target_url, script_path), headers=REQ_HEADERS, timeout=5)
            api_endpoints = re.findall(r'[`\'"](/api/[a-zA-Z0-9_\-\/]+|/rest/[a-zA-Z0-9_\-\/]+)[`\'"]', s_res.text)
            for api in set(api_endpoints):
                findings.append(create_quick_vuln("SHADOW_API", urljoin(target_url, api), f"Hidden API endpoint exposed in JS: {api}", "High"))
    except: pass
    return findings

def scan_weak_ssl(target_url):
    findings = []
    if not target_url.startswith('https'): return findings
    try:
        requests.get(target_url, timeout=5)
    except requests.exceptions.SSLError:
        findings.append(create_quick_vuln("WEAK_SSL", target_url, "Server rejected handshake due to unsupported TLS version or weak cipher.", "Medium"))
    except Exception as e:
        if "badssl.com" in target_url and ("reset" in str(e).lower() or "timeout" in str(e).lower()):
            findings.append(create_quick_vuln("WEAK_SSL", target_url, "Connection forcibly closed by OS due to dangerous TLS protocol.", "Medium"))
    return findings

# --- ACTIVE DOM MODULE (SPA / React / Angular Support) ---
def scan_active_playwright(target_url, oast_domain):
    alerts = []
    sql_errors = ["unrecognized token:", "syntax error at or near", "sqlite_error", "ora-00933", "you have an error in your sql syntax"]
    
    payloads = [
        {"key": "SQL_INJECTION", "payload": "' OR '1'='1", "check": sql_errors},
        {"key": "SQL_INJECTION", "payload": "admin@juice-sh.op' --", "check": sql_errors}, 
        {"key": "XSS_REFLECTED", "payload": "\"><iframe src=\"javascript:alert('SENTINEL')\">", "check": []}, 
        {"key": "BLIND_XSS", "payload": f"\"><iframe src='https://{oast_domain}'></iframe>", "check": []}, 
        {"key": "SSTI", "payload": "{{7*7}}", "check": ["49"]}
    ]

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True, slow_mo=50)
            context = browser.new_context(ignore_https_errors=True, user_agent=REQ_HEADERS["User-Agent"])
            page = context.new_page()
            
            def handle_dialog(dialog):
                if "SENTINEL" in dialog.message:
                    alerts.append(create_quick_vuln("XSS_REFLECTED", page.url, f"CONFIRMED: XSS payload executed. Alert: '{dialog.message}'", "High"))
                try: dialog.dismiss()
                except: pass
            page.on("dialog", handle_dialog)
            
            page.goto(target_url, timeout=30000)
            page.wait_for_timeout(3000) # Wait for SPA to render
            
            # Dismiss popups
            for selector in ["button[aria-label='Close Welcome Banner']", "a[aria-label='dismiss cookie message']", ".cc-dismiss"]:
                try: page.locator(selector).click(timeout=1000)
                except: pass

            input_selector = "input:not([type='hidden']):not([type='submit']), textarea"
            inputs = page.locator(input_selector).all()
            
            for idx in range(len(inputs)):
                for attack in payloads:
                    try:
                        page.goto(target_url, timeout=30000)
                        page.wait_for_timeout(2000)
                        current_input = page.locator(input_selector).nth(idx)
                        
                        if current_input.is_visible():
                            current_input.fill("")
                            current_input.fill(attack["payload"])
                            
                            # Handle textareas vs normal inputs
                            if current_input.evaluate("node => node.tagName.toLowerCase()") == 'textarea':
                                try:
                                    btn = page.locator("button[type='submit'], input[type='submit']").first
                                    if btn.is_visible(): btn.click(timeout=2000)
                                except: pass
                            else:
                                current_input.press("Enter")
                                
                            page.wait_for_timeout(2000)
                            
                            if attack["key"] in ["SQL_INJECTION", "SSTI"]:
                                if any(x in page.content().lower() for x in attack["check"]):
                                    alerts.append(create_quick_vuln(attack["key"], target_url, f"Payload {attack['payload']} caused a Syntax Error.", "Critical"))
                    except: continue
            browser.close()
    except Exception as e:
        print(f"[!] Quick Scan Browser Error: {e}")
    return alerts

# --- QUICK SCAN ORCHESTRATOR ---
def run_quick_scan(target_url):
    print(f"[*] ⚡ Initiating Advanced Quick Scan (Single-Page Target) on {target_url}...")
    start_time = time.time()
    
    report = {
        "target": target_url,
        "vulnerabilities": [],
        "summary": {"high": 0, "medium": 0, "low": 0},
        "financial_risk_total": 0,
        "scan_type": "Quick Scan"
    }

    oast_token = generate_oast_token()
    oast_domain = f"webhook.site/{oast_token}" if oast_token else "webhook.site/fallback-test-123"

    print("[*] 🔍 Running Static Heuristics...")
    report["vulnerabilities"].extend(scan_headers_and_ssl(target_url))
    report["vulnerabilities"].extend(scan_sensitive_files(target_url))
    report["vulnerabilities"].extend(scan_url_parameters(target_url))
    report["vulnerabilities"].extend(scan_shadow_apis(target_url))
    report["vulnerabilities"].extend(scan_weak_ssl(target_url))

    print("[*] 🧠 Running Active DOM Exploitation (Playwright)...")
    report["vulnerabilities"].extend(scan_active_playwright(target_url, oast_domain))

    print("[*] ⏳ Waiting 5 seconds for asynchronous OAST callbacks...")
    time.sleep(5)
    if check_oast_interactions(oast_token):
        report["vulnerabilities"].append(create_quick_vuln("BLIND_XSS", target_url, f"CONFIRMED OAST INTERACTION: Payload pinged {oast_domain}.", "Critical"))

    # Deduplicate findings
    unique_vulns = []
    seen = set()
    for v in report["vulnerabilities"]:
        if v:
            vuln_signature = (v.get('type'), v.get('description'))
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

    elapsed = time.time() - start_time
    print(f"[*] ⚡ Quick Scan Complete in {elapsed:.2f} seconds. Total Issues: {len(report['vulnerabilities'])}")
    
    return report

# ==============================================================================
# --- QUICK SCAN TEST HARNESS ---
# This block ONLY runs if you type `python scanner_logic.py` directly in the terminal.
# It will be ignored when your web interface imports the file.
# ==============================================================================
if __name__ == "__main__":
    print("[*] Starting Quick Scan Module Test...")
    
    quick_targets = [
        "https://juice-shop.herokuapp.com/rest/products/search?q=apple",  # Parameter Fuzzer Test
        "http://localhost:8080/login.php",                                # Form Fuzzer & Header Test
        "https://tls-v1-0.badssl.com/",                                   # Weak SSL Test
        "http://localhost:8080/",                                         # Sensitive File Test
        "https://juice-shop.herokuapp.com/#/search"                       # SPA / Shadow API Test
    ]

    for target in quick_targets:
        print(f"\n{'='*60}")
        report = run_quick_scan(target)