from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from scanner_logic import scan_sql_injection, scan_xss, scan_shadow_apis
from port_scanner import scan_ports
from reporter import generate_report
from deep_scanner import run_deep_scan
import requests
import re
import math

app = Flask(__name__)
CORS(app)

def health_check():
    return "Sentinel Active", 200

# --- HELPER: Risk Calculation ---
def calculate_dynamic_risk(vuln_type, severity):
    cvss_map = {
        "SQL Injection": 9.8, "XSS": 6.1, "Network Exposure": 5.3,
        "Shadow API Detected": 7.5, "PII Exposure": 8.2, 
        "Missing CSP Header": 4.3, "Missing HSTS Header": 3.1,
        "Clickjacking Risk": 4.3, "Insecure Cookie": 5.0,
        "Sensitive File Exposure": 8.5, "Insecure Secret Storage": 7.2
    }
    score = cvss_map.get(vuln_type, 5.0)
    base_asset_value = 1000 
    financial_impact = base_asset_value * math.exp(score / 2.5)
    return round(score, 1), round(financial_impact, 2)

def scan_page_content(url):
    findings = []
    try:
        response = requests.get(url, timeout=5)
        content = response.text
        
        # Simple Regex to find exposed emails (PII)
        emails = set(re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', content))
        if emails:
            valid_emails = [e for e in emails if "example.com" not in e and "uilib" not in e and "node_modules" not in e]
            if valid_emails:
                findings.append({
                    "type": "PII Exposure",
                    "details": f"Found {len(valid_emails)} exposed email addresses (GDPR violation).",
                    "severity": "Medium",
                    "fix": """# PII DATA MASKING PROTOCOL
# ---------------------------------------------------
# STEP 1: LOCATE SOURCE
# grep -r "email" ./src/components

# STEP 2: APPLY SERVER-SIDE MASKING (Example in NodeJS)
# function maskEmail(email) {
#   return email.replace(/(?<=.{2}).(?=.*@)/g, "*");
# }

# STEP 3: REVIEW LOGGING POLICY
# Ensure PII is not being written to access.log or error.log"""
                })
    except: pass
    return findings

# --- ROUTES ---

@app.route('/api/scan', methods=['POST'])
def run_quick_scan():
    """Lightweight scan (~5 seconds)."""
    data = request.json
    target_url = data.get('url')
    if not target_url: return jsonify({"error": "No URL provided"}), 400
    if not target_url.startswith('http'): target_url = 'https://' + target_url

    return jsonify(perform_quick_scan(target_url))

@app.route('/api/deep-scan', methods=['POST'])
def handle_deep_scan():
    """Heavyweight scan (Playwright)."""
    data = request.json
    target_url = data.get('url')
    if not target_url: return jsonify({"error": "No URL provided"}), 400
    if not target_url.startswith('http'): target_url = 'https://' + target_url

    try:
        report = run_deep_scan(target_url, user_id=None)
        return jsonify(report)
    except Exception as e:
        print(f"Deep Scan Error: {e}")
        return jsonify({"error": "Deep scan failed to initialize"}), 500

@app.route('/api/download-report', methods=['POST'])
def download_report():
    data = request.json
    report_type = data.get('report_type', 'technical')
    report_data = {k:v for k,v in data.items() if k != 'report_type'}
    
    if not report_data or 'vulnerabilities' not in report_data:
        return jsonify({"error": "No valid report data provided"}), 400
    
    try:
        pdf_path = generate_report(report_data, report_type)
        return send_file(pdf_path, as_attachment=True)
    except Exception as e:
        print(f"Report error: {e}")
        return jsonify({"error": "Failed"}), 500

# --- QUICK SCAN LOGIC ---
def perform_quick_scan(target_url):
    report = {
        "target": target_url,
        "vulnerabilities": [],
        "summary": {"high": 0, "medium": 0, "low": 0},
        "financial_risk_total": 0
    }

    print(f"[*] Running Quick Scan for {target_url}...")

    # 1. LIVE PII SCAN
    pii_findings = scan_page_content(target_url)
    for pii in pii_findings:
        cvss, cost = calculate_dynamic_risk("PII Exposure", pii['severity'])
        report["vulnerabilities"].append({
            "type": "PII Exposure", "details": pii['details'], "severity": pii['severity'],
            "fix": pii['fix'], "cvss": cvss, "est_cost": cost
        })

    # 2. PORT SCAN
    try:
        ports = scan_ports(target_url)
        for p in ports:
            # Extract port number for the fix script
            port_num = ''.join(filter(str.isdigit, p.split(' ')[1])) 
            cvss, cost = calculate_dynamic_risk("Network Exposure", "Low")
            report["vulnerabilities"].append({
                "type": "Network Exposure", "details": p, "severity": "Low",
                "fix": f"""# PORT CLOSURE PROCEDURE
# ---------------------------------------------------
# STEP 1: IDENTIFY PROCESS
sudo lsof -i :{port_num}

# STEP 2: STOP SERVICE (If not required)
sudo systemctl stop <service_name>
sudo systemctl disable <service_name>

# STEP 3: UPDATE FIREWALL (UFW)
sudo ufw deny {port_num}/tcp
sudo ufw reload""",
                "cvss": cvss, "est_cost": cost
            })
    except: pass

    # 3. REGEX SQLi SCAN
    sqli = scan_sql_injection(target_url)
    if sqli:
        cvss, cost = calculate_dynamic_risk("SQL Injection", "Critical")
        report["vulnerabilities"].append({
            "type": "SQL Injection", "details": sqli, "severity": "Critical",
            "fix": """# SQL INJECTION PATCH
# ⛔ CRITICAL: Raw query concatenation detected.

# VULNERABLE CODE:
# query = "SELECT * FROM users WHERE id = " + user_input

# SECURE PATCH (Parameterized Queries):
# Python: cursor.execute("SELECT * FROM users WHERE id = %s", (user_input,))
# Node.js: db.query('SELECT * FROM users WHERE id = $1', [user_input])""", 
            "cvss": cvss, "est_cost": cost
        })

    # 4. REGEX XSS SCAN
    xss = scan_xss(target_url)
    if xss:
        cvss, cost = calculate_dynamic_risk("XSS", "High")
        report["vulnerabilities"].append({
            "type": "XSS", "details": xss, "severity": "High",
            "fix": """# XSS DEFENSE PROTOCOL
# ---------------------------------------------------
# 1. INPUT VALIDATION:
# Reject inputs containing <script>, <iframe>, or 'javascript:'

# 2. OUTPUT ENCODING:
# Use libraries like DOMPurify before rendering HTML.
# clean = DOMPurify.sanitize(dirty);

# 3. ENABLE CSP HEADER:
# Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted.cdn.com;""", 
            "cvss": cvss, "est_cost": cost
        })

    # 5. REGEX SHADOW API SCAN
    shadows = scan_shadow_apis(target_url)
    for s in shadows:
        cvss, cost = calculate_dynamic_risk("Shadow API Detected", "Medium")
        report["vulnerabilities"].append({
            "type": "Shadow API Detected", "details": s, "severity": "Medium",
            "fix": """# API HARDENING
# ---------------------------------------------------
# 1. AUTHENTICATION:
# Ensure this endpoint requires a valid JWT/OAuth2 token.

# 2. RATE LIMITING (Nginx Example):
# limit_req_zone $binary_remote_addr zone=mylimit:10m rate=10r/s;

# 3. SWAGGER DOCUMENTATION:
# Register this endpoint in openapi.yaml to ensure visibility.""", 
            "cvss": cvss, "est_cost": cost
        })

    # CALCULATE TOTALS
    for vuln in report["vulnerabilities"]:
        report["financial_risk_total"] += vuln.get("est_cost", 0)
        sev = vuln["severity"]
        if sev in ["Critical", "High"]: report["summary"]["high"] += 1
        elif sev == "Medium": report["summary"]["medium"] += 1
        elif sev == "Low": report["summary"]["low"] += 1

    return report

if __name__ == '__main__':
    app.run(debug=True, port=5000)