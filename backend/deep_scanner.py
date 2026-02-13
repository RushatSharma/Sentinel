import time
import requests
import re
from playwright.sync_api import sync_playwright
from database import save_scan_result
# IMPORT KNOWLEDGE BASE
from vuln_kb import VULN_DB

SENSITIVE_PATHS = [
    "/.env", "/.git/config", "/.vscode/sftp.json", "/backup.sql", 
    "/ds_store", "/phpinfo.php", "/config.php.bak", "/admin", 
    "/dashboard", "/api-docs", "/swagger.json", "/web.config"
]

def create_vuln(key, target, reproduction_steps):
    kb = VULN_DB.get(key, {})
    return {
        "type": kb.get("title", key),
        "severity": kb.get("severity", "Low"),
        "url": target,
        "description": kb.get("description", "No description."),
        "impact": kb.get("impact", "Check detailed logs."),
        "remediation": kb.get("remediation", "Patch immediately."),
        "reproduction": reproduction_steps,
        "fix": kb.get("code_fix", "No code example.")
    }

def run_deep_scan(target_url, user_id=None):
    print(f"[*] Starting ACCURATE Deep Scan for {target_url}...")
    all_vulns = []

    print("[*] Phase 1: Security Headers & Cookies...")
    all_vulns.extend(scan_headers_and_cookies(target_url))

    print("[*] Phase 2: Sensitive File Enumeration...")
    all_vulns.extend(scan_sensitive_files(target_url))

    print("[*] Phase 3: Active Browser Fuzzing (SQLi/XSS)...")
    all_vulns.extend(scan_active_playwright(target_url))

    final_report = {
        "target": target_url,
        "vulnerabilities": all_vulns,
        "summary": {
            "high": sum(1 for v in all_vulns if v['severity'] in ['High', 'Critical']),
            "medium": sum(1 for v in all_vulns if v['severity'] == 'Medium'),
            "low": sum(1 for v in all_vulns if v['severity'] == 'Low')
        }
    }
    
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
        except Exception as e:
            print(f"[!] Database Save Error: {e}")

    return final_report

def scan_headers_and_cookies(url):
    vulns = []
    try:
        res = requests.get(url, timeout=10)
        headers = {k.lower(): v for k, v in res.headers.items()}
        
        if 'content-security-policy' not in headers:
            vulns.append(create_vuln("MISSING_CSP", url, "Inspect HTTP Response Headers. CSP is missing."))
        
    except Exception as e:
        print(f"[!] Header scan failed: {e}")
    return vulns

def scan_sensitive_files(base_url):
    vulns = []
    base_url = base_url.rstrip("/")
    for path in SENSITIVE_PATHS:
        target = base_url + path
        try:
            res = requests.get(target, timeout=3, allow_redirects=False)
            if res.status_code == 200 and len(res.text) > 10:
                vulns.append(create_vuln(
                    "SENSITIVE_FILE",
                    target,
                    f"Directly access {target} in browser. File content is visible."
                ))
        except: continue
    return vulns

def scan_active_playwright(target_url):
    alerts = []
    payloads = [
        {"key": "SQL_INJECTION", "payload": "' OR '1'='1", "check": ["syntax error", "mysql", "sql"]},
        {"key": "XSS_REFLECTED", "payload": "<img src=x onerror=alert('SENTINEL')>", "check": []}
    ]

    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            
            # Shadow API Listener
            page.on("response", lambda r: alerts.append(
                create_vuln("SHADOW_API", r.url, f"Background Request: {r.method} {r.url}")
            ) if "json" in r.headers.get("content-type", "") and "api" in r.url and "google" not in r.url else None)

            try:
                page.goto(target_url, timeout=20000)
                inputs = page.locator("input:not([type='hidden'])").all()
                
                for i, _ in enumerate(inputs):
                    for attack in payloads:
                        try:
                            inp = page.locator("input:not([type='hidden'])").nth(i)
                            inp.fill(attack["payload"])
                            inp.press("Enter")
                            page.wait_for_timeout(500)
                            content = page.content().lower()
                            
                            # SQLi Check
                            if attack["key"] == "SQL_INJECTION":
                                if any(x in content for x in attack["check"]):
                                    alerts.append(create_vuln(
                                        "SQL_INJECTION", target_url, 
                                        f"Injected {attack['payload']} into input field. Observed DB error."
                                    ))
                            
                            # XSS Check
                            if attack["key"] == "XSS_REFLECTED":
                                if attack["payload"] in page.content():
                                    alerts.append(create_vuln(
                                        "XSS_REFLECTED", target_url, 
                                        f"Injected {attack['payload']}. Payload reflected in DOM."
                                    ))
                        except: continue
            except: pass
            browser.close()
    except: pass

    # Simple Deduplication
    unique_alerts = []
    seen = set()
    for a in alerts:
        if a and (a['type'], a['url']) not in seen:
            seen.add((a['type'], a['url']))
            unique_alerts.append(a)
    return unique_alerts