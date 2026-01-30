import time
import requests
import re
from playwright.sync_api import sync_playwright
from database import save_scan_result

# --- CONFIGURATION ---
SENSITIVE_PATHS = [
    "/.env", "/.git/config", "/.vscode/sftp.json", "/backup.sql", 
    "/ds_store", "/phpinfo.php", "/config.php.bak", "/admin", 
    "/dashboard", "/api-docs", "/swagger.json", "/web.config"
]

# --- MAIN ORCHESTRATOR ---
def run_deep_scan(target_url, user_id=None):
    print(f"[*] Starting MAXED-OUT Deep Scan for {target_url}...")
    
    all_vulns = []

    # MODULES
    print("[*] Phase 1: Security Headers & Cookies...")
    all_vulns.extend(scan_headers_and_cookies(target_url))

    print("[*] Phase 2: Sensitive File Enumeration...")
    all_vulns.extend(scan_sensitive_files(target_url))

    print("[*] Phase 3: Active Browser Fuzzing...")
    all_vulns.extend(scan_active_playwright(target_url))

    # REPORT AGGREGATION
    final_report = {
        "target": target_url,
        "vulnerabilities": all_vulns,
        "summary": {
            "high": sum(1 for v in all_vulns if v['severity'] in ['High', 'Critical']),
            "medium": sum(1 for v in all_vulns if v['severity'] == 'Medium'),
            "low": sum(1 for v in all_vulns if v['severity'] == 'Low')
        }
    }
    
    # SAVE TO DB
    if user_id:
        try:
            high = final_report['summary']['high']
            med = final_report['summary']['medium']
            low = final_report['summary']['low']
            risk_score = min(100, (high * 25) + (med * 10) + (low * 2))

            save_scan_result(
                user_id=user_id, target_url=target_url, mode="Deep",
                risk_score=risk_score, vulns_found=len(all_vulns), report_json=final_report 
            )
        except Exception as e:
            print(f"[!] DB Save Error: {e}")

    return final_report

# --- MODULE 1: HEADERS & COOKIES ---
def scan_headers_and_cookies(url):
    vulns = []
    try:
        res = requests.get(url, timeout=10)
        headers = {k.lower(): v for k, v in res.headers.items()}
        
        if 'content-security-policy' not in headers:
            vulns.append({
                "type": "Missing CSP Header",
                "details": "Site vulnerable to Cross-Site Scripting (XSS).",
                "severity": "Medium",
                "fix": """# SERVER CONFIGURATION (Nginx)
# ---------------------------------------------------
# Add to server block:
add_header Content-Security-Policy "default-src 'self'; script-src 'self' https://trusted.cdn.com; img-src 'self' data:; style-src 'self' 'unsafe-inline';" always;

# VALIDATION:
# curl -I https://yoursite.com | grep Content-Security-Policy"""
            })
        
        if 'strict-transport-security' not in headers and url.startswith("https"):
            vulns.append({
                "type": "Missing HSTS Header",
                "details": "Connection not forced to HTTPS (MITM Risk).",
                "severity": "Low",
                "fix": """# FORCE HTTPS (HSTS)
# ---------------------------------------------------
# Apache (.htaccess):
Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"

# Nginx:
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;"""
            })

        if 'x-frame-options' not in headers:
            vulns.append({
                "type": "Clickjacking Risk",
                "details": "Site can be framed by attackers.",
                "severity": "Low",
                "fix": """# ANTI-CLICKJACKING HEADER
# ---------------------------------------------------
# Prevents your site from being loaded in an iframe.
# Add to Server Headers:

X-Frame-Options: DENY
# OR
X-Frame-Options: SAMEORIGIN"""
            })

        for cookie in res.cookies:
            if not cookie.secure and url.startswith("https"):
                vulns.append({
                    "type": "Insecure Cookie",
                    "details": f"Cookie '{cookie.name}' missing 'Secure' flag.",
                    "severity": "Medium",
                    "fix": """# COOKIE HARDENING
# ---------------------------------------------------
# Set the 'Secure' flag when setting cookies.
# This ensures cookies are ONLY sent over HTTPS.

# ExpressJS Example:
res.cookie('session', token, { 
  secure: true, 
  httpOnly: true, 
  sameSite: 'strict' 
});"""
                })
            if not cookie.has_nonstandard_attr('HttpOnly'):
                vulns.append({
                    "type": "Cookie Theft Risk",
                    "details": f"Cookie '{cookie.name}' missing 'HttpOnly' flag.",
                    "severity": "High",
                    "fix": """# PREVENT XSS COOKIE THEFT
# ---------------------------------------------------
# Set the 'HttpOnly' flag. 
# This makes the cookie inaccessible to JavaScript (document.cookie).

# Python (Flask):
response.set_cookie('session_id', value, httponly=True, secure=True)"""
                })
    except: pass
    return vulns

# --- MODULE 2: SENSITIVE FILES ---
def scan_sensitive_files(base_url):
    vulns = []
    base_url = base_url.rstrip("/")
    for path in SENSITIVE_PATHS:
        target = base_url + path
        try:
            res = requests.get(target, timeout=3, allow_redirects=False)
            if res.status_code == 200 and len(res.text) > 10:
                vulns.append({
                    "type": "Sensitive File Exposure",
                    "details": f"Publicly accessible file: {path}",
                    "severity": "Critical",
                    "fix": f"""# IMMEDIATE REMEDIATION REQUIRED
# ---------------------------------------------------
# 1. DELETE FILE (If not needed):
ssh user@server
rm /var/www/html{path}

# 2. RESTRICT ACCESS (If needed internally):
# Nginx Block Rule:
location ~ ^/(\.env|\.git|backup\.sql) {{
    deny all;
    return 404;
}}"""
                })
        except: continue
    return vulns

# --- MODULE 3: PLAYWRIGHT FUZZER ---
def scan_active_playwright(target_url):
    alerts = []
    payloads = [
        {"type": "SQL Injection (Deep)", "payload": "' OR '1'='1", "check": ["syntax error", "mysql", "warning", "postgres"]},
        {"type": "Reflected XSS (Deep)", "payload": "<img src=x onerror=alert('SENTINEL')>", "check": []}
    ]

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(user_agent="Sentinel-Security-Bot/2.0")
            page = context.new_page()
            
            # --- 3A. TRAFFIC MONITOR ---
            def handle_response(response):
                try:
                    if response.status >= 500:
                        alerts.append({
                            "type": "Server Error (Potential Vuln)",
                            "details": f"Endpoint {response.url} crashed (Status 500).",
                            "severity": "High",
                            "fix": """# SERVER CRASH INVESTIGATION
# ---------------------------------------------------
# 1. CHECK ERROR LOGS:
tail -f /var/log/nginx/error.log
journalctl -u my-app.service

# 2. FIX UNHANDLED EXCEPTIONS:
# Wrap dangerous DB inputs in try/catch blocks."""
                        })
                except: pass
            page.on("response", handle_response)

            try:
                page.goto(target_url, timeout=20000, wait_until="domcontentloaded")
                
                # --- 3B. STORAGE AUDIT ---
                storage = page.evaluate("() => JSON.stringify(localStorage) + JSON.stringify(sessionStorage)").lower()
                if "token" in storage or "auth" in storage or "key" in storage:
                     alerts.append({
                        "type": "Insecure Secret Storage",
                        "details": "Secrets found in Local/Session Storage.",
                        "severity": "High",
                        "fix": """# SECURE TOKEN STORAGE
# ---------------------------------------------------
# ⛔ STOP storing tokens in localStorage (Vulnerable to XSS).

# ✅ USE HttpOnly Cookies:
# Set-Cookie: access_token=xyz; HttpOnly; Secure; SameSite=Strict;

# This prevents stolen tokens even if XSS exists."""
                    })

                # --- 3C. FORM FUZZING ---
                inputs = page.locator("input:not([type='hidden']):not([type='submit'])").all()
                if not inputs:
                     alerts.append({"type": "Info", "details": "No interactive forms found.", "severity": "Low", "fix": "# NO ACTION REQUIRED\nNo attack surface detected on this page."})
                
                for i, input_el in enumerate(inputs):
                    for attack in payloads:
                        try:
                            current_input = page.locator("input:not([type='hidden']):not([type='submit'])").nth(i)
                            current_input.fill(attack["payload"])
                            current_input.press("Enter")
                            page.wait_for_timeout(500) 
                            content = page.content().lower()
                            
                            if attack["type"] == "SQL Injection (Deep)":
                                for error in attack["check"]:
                                    if error in content:
                                        alerts.append({
                                            "type": attack["type"], "details": f"DB Error triggered by {attack['payload']}", "severity": "Critical",
                                            "fix": """# SQL INJECTION PATCH
# ⛔ CRITICAL: Raw query concatenation detected.

# SECURE PATCH (Parameterized Queries):
# Python: cursor.execute("SELECT * FROM users WHERE id = %s", (user_input,))
# Node.js: db.query('SELECT * FROM users WHERE id = $1', [user_input])"""
                                        })
                                        break
                                        
                            if attack["type"] == "Reflected XSS (Deep)":
                                if attack["payload"] in page.content():
                                    alerts.append({
                                        "type": attack["type"], "details": f"Payload reflected: {attack['payload']}", "severity": "High",
                                        "fix": """# XSS REMEDIATION
# ---------------------------------------------------
# 1. ESCAPE OUTPUT:
# Ensure variables are escaped before rendering.
# React: {variable} (Safe by default)
# HTML: &lt;script&gt;...&lt;/script&gt;

# 2. CSP HEADER:
# Content-Security-Policy: default-src 'self'"""
                                    })
                        except: continue
            except Exception as e: print(f"[!] Fuzzing error: {e}")
            browser.close()
    except: return []

    # Deduplicate
    unique_alerts = []
    seen = set()
    for a in alerts:
        key = (a['type'], a['details'])
        if key not in seen:
            seen.add(key)
            unique_alerts.append(a)
    return unique_alerts