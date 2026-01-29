from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
# Import existing logic
from scanner_logic import scan_sql_injection, scan_xss, scan_shadow_apis
from port_scanner import scan_ports
from reporter import generate_report
# Import NEW Deep Scanner logic
from deep_scanner import scan_shadow_apis_real, scan_active_zap

import requests
import re
import math

app = Flask(__name__)
CORS(app)

def health_check():
    return "Sentinel Active", 200
# --- HELPER FUNCTIONS (Risk & Compliance) ---
def calculate_dynamic_risk(vuln_type, severity):
    cvss_map = {
        "SQL Injection": 9.8, "XSS": 6.1, "Network Exposure": 5.3,
        "Shadow API Detected": 7.5, "PII Exposure": 8.2, "Simulated: SQL Injection (Deep)": 9.8
    }
    score = cvss_map.get(vuln_type, 5.0)
    base_asset_value = 1000 
    financial_impact = base_asset_value * math.exp(score / 2.5)
    return round(score, 1), round(financial_impact, 2)

def scan_page_content(url):
    findings = []
    try:
        response = requests.get(url, timeout=5) # Increased timeout for stability
        content = response.text
        
        emails = set(re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', content))
        if emails:
            valid_emails = [e for e in emails if "example.com" not in e and "uilib" not in e]
            if valid_emails:
                findings.append({
                    "type": "PII Exposure",
                    "details": f"Found {len(valid_emails)} exposed email addresses (GDPR violation).",
                    "severity": "Medium",
                    "fix": "Obfuscate emails or remove from client-side HTML."
                })
    except:
        pass
    return findings

def get_compliance_and_fix(vuln_type):
    db = {
        "SQL Injection": {"fix": "Use Prepared Statements."},
        "XSS": {"fix": "Sanitize inputs with DOMPurify."},
        "Network Exposure": {"fix": "Close unused ports."},
        "Shadow API Detected": {"fix": "Secure API routes."},
        "PII Exposure": {"fix": "Redact PII from responses."},
        "Active Scan Engine Offline": {"fix": "Start ZAP Daemon."},
        "Simulated: SQL Injection (Deep)": {"fix": "Use Parameterized Queries."}
    }
    return db.get(vuln_type, {"fix": "See OWASP Guidelines."})

# --- ROUTES ---

@app.route('/api/scan', methods=['POST'])
def run_quick_scan():
    """Lightweight scan (~5 seconds)"""
    data = request.json
    target_url = data.get('url')
    if not target_url: return jsonify({"error": "No URL provided"}), 400
    if not target_url.startswith('http'): target_url = 'https://' + target_url

    return jsonify(perform_scan(target_url, mode='quick'))

@app.route('/api/deep-scan', methods=['POST'])
def run_deep_scan():
    """Heavyweight scan (~30-60 seconds)"""
    data = request.json
    target_url = data.get('url')
    if not target_url: return jsonify({"error": "No URL provided"}), 400
    if not target_url.startswith('http'): target_url = 'https://' + target_url

    return jsonify(perform_scan(target_url, mode='deep'))

def perform_scan(target_url, mode):
    report = {
        "target": target_url,
        "vulnerabilities": [],
        "summary": {"high": 0, "medium": 0, "low": 0},
        "financial_risk_total": 0
    }

    # 1. LIVE PII SCAN (Always run)
    pii_findings = scan_page_content(target_url)
    for pii in pii_findings:
        cvss, cost = calculate_dynamic_risk("PII Exposure", pii['severity'])
        report["vulnerabilities"].append({
            "type": "PII Exposure", "details": pii['details'], "severity": pii['severity'],
            "fix": pii['fix'], "cvss": cvss, "est_cost": cost
        })

    # 2. MODE SPECIFIC SCANS
    if mode == 'deep':
        # --- DEEP MODE (Playwright + ZAP) ---
        print("Running Deep Scan...")
        real_shadows = scan_shadow_apis_real(target_url)
        for api in real_shadows:
            cvss, cost = calculate_dynamic_risk("Shadow API Detected", "Medium")
            report["vulnerabilities"].append({
                "type": "Shadow API Detected", "details": api, "severity": "Medium",
                "fix": "Secure API Endpoint", "cvss": cvss, "est_cost": cost
            })
            
        zap_alerts = scan_active_zap(target_url)
        for alert in zap_alerts:
            cvss, cost = calculate_dynamic_risk(alert['type'], alert['severity'])
            report["vulnerabilities"].append({
                "type": alert['type'], "details": alert['details'], "severity": alert['severity'],
                "fix": alert['fix'], "cvss": cvss, "est_cost": cost
            })
    else:
        # --- QUICK MODE (Simulated/Lightweight) ---
        # This was missing in the previous version!
        print("Running Quick Scan...")
        
        # A. Port Scan
        try:
            ports = scan_ports(target_url)
            for p in ports:
                cvss, cost = calculate_dynamic_risk("Network Exposure", "Low")
                report["vulnerabilities"].append({
                    "type": "Network Exposure", "details": f"Port {p} Open", "severity": "Low",
                    "fix": "Close Port", "cvss": cvss, "est_cost": cost
                })
        except: pass

        # B. Regex SQLi Scan
        sqli = scan_sql_injection(target_url)
        if sqli:
            cvss, cost = calculate_dynamic_risk("SQL Injection", "Critical")
            report["vulnerabilities"].append({
                "type": "SQL Injection", "details": sqli, "severity": "Critical",
                "fix": "Use Prepared Statements", "cvss": cvss, "est_cost": cost
            })

        # C. Regex XSS Scan
        xss = scan_xss(target_url)
        if xss:
            cvss, cost = calculate_dynamic_risk("XSS", "High")
            report["vulnerabilities"].append({
                "type": "XSS", "details": xss, "severity": "High",
                "fix": "Sanitize Inputs", "cvss": cvss, "est_cost": cost
            })

        # D. Regex Shadow API
        shadows = scan_shadow_apis(target_url)
        for s in shadows:
            cvss, cost = calculate_dynamic_risk("Shadow API Detected", "Medium")
            report["vulnerabilities"].append({
                "type": "Shadow API Detected", "details": s, "severity": "Medium",
                "fix": "Secure API", "cvss": cvss, "est_cost": cost
            })

    # 3. CALCULATE TOTALS
    for vuln in report["vulnerabilities"]:
        report["financial_risk_total"] += vuln.get("est_cost", 0)
        sev = vuln["severity"]
        if sev in ["Critical", "High"]: report["summary"]["high"] += 1
        elif sev == "Medium": report["summary"]["medium"] += 1
        elif sev == "Low": report["summary"]["low"] += 1

    return report

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

if __name__ == '__main__':
    app.run(debug=True, port=5000)