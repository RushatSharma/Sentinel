from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import requests
import re
import math

# --- LOGIC IMPORTS ---
# Fixed the ImportError by importing the module directly
import scanner_logic 
from port_scanner import scan_ports
from reporter import generate_report
from deep_scanner import run_deep_scan
from database import save_scan_result 

app = Flask(__name__)
CORS(app)

# --- HELPER: Risk Calculation ---
def calculate_dynamic_risk(vuln_type, severity):
    """
    Calculates CVSS-based risk scores and estimated financial impact.
    """
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
    """
    Scans for PII leaks (emails) using Regex.
    """
    findings = []
    try:
        response = requests.get(url, timeout=5)
        content = response.text
        emails = set(re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', content))
        if emails:
            valid_emails = [e for e in emails if "example.com" not in e and "uilib" not in e]
            if valid_emails:
                findings.append({
                    "type": "PII Exposure",
                    "details": f"Found {len(valid_emails)} exposed email addresses.",
                    "severity": "Medium",
                    "fix": "# PII DATA MASKING: Apply server-side masking filters."
                })
    except: pass
    return findings

# --- QUICK SCAN ORCHESTRATOR ---
def perform_quick_scan(target_url):
    """
    Orchestrates the individual scanning modules into a single report.
    """
    report = {
        "target": target_url,
        "vulnerabilities": [],
        "summary": {"high": 0, "medium": 0, "low": 0},
        "financial_risk_total": 0
    }

    # 1. PII Scan
    for pii in scan_page_content(target_url):
        cvss, cost = calculate_dynamic_risk("PII Exposure", pii['severity'])
        report["vulnerabilities"].append({**pii, "cvss": cvss, "est_cost": cost})

    # 2. Port Scan
    try:
        for p in scan_ports(target_url):
            cvss, cost = calculate_dynamic_risk("Network Exposure", "Low")
            report["vulnerabilities"].append({
                "type": "Network Exposure", "details": p, "severity": "Low",
                "fix": "# FIREWALL: Use 'ufw deny <port>' to close exposed services.",
                "cvss": cvss, "est_cost": cost
            })
    except: pass

    # 3. SQL Injection (From scanner_logic module)
    sqli = scanner_logic.scan_sql_injection(target_url)
    if sqli:
        cvss, cost = calculate_dynamic_risk("SQL Injection", "Critical")
        report["vulnerabilities"].append({
            "type": "SQL Injection", "details": sqli, "severity": "Critical",
            "fix": "# PATCH: Use Parameterized Queries (Prepared Statements).",
            "cvss": cvss, "est_cost": cost
        })

    # 4. XSS (From scanner_logic module)
    xss = scanner_logic.scan_xss(target_url)
    if xss:
        cvss, cost = calculate_dynamic_risk("XSS", "High")
        report["vulnerabilities"].append({
            "type": "XSS", "details": xss, "severity": "High",
            "fix": "# DEFENSE: Implement Content Security Policy (CSP) and output encoding.",
            "cvss": cvss, "est_cost": cost
        })

    # 5. Shadow APIs (From scanner_logic module)
    for s in scanner_logic.scan_shadow_apis(target_url):
        cvss, cost = calculate_dynamic_risk("Shadow API Detected", "Medium")
        report["vulnerabilities"].append({
            "type": "Shadow API Detected", "details": s, "severity": "Medium",
            "fix": "# HARDENING: Ensure endpoint requires OAuth2/JWT tokens.",
            "cvss": cvss, "est_cost": cost
        })

    # Final Summary Calculation
    for vuln in report["vulnerabilities"]:
        report["financial_risk_total"] += vuln.get("est_cost", 0)
        sev = vuln["severity"]
        if sev in ["Critical", "High"]: report["summary"]["high"] += 1
        elif sev == "Medium": report["summary"]["medium"] += 1
        else: report["summary"]["low"] += 1

    return report

# --- API ROUTES ---

@app.route('/api/scan', methods=['POST'])
def run_quick_scan_api():
    data = request.json
    target_url = data.get('url')
    user_id = data.get('user_id') 

    if not target_url: return jsonify({"error": "No URL provided"}), 400
    if not target_url.startswith('http'): target_url = 'https://' + target_url

    # Execute Scan
    report = perform_quick_scan(target_url)

    # Sync to Appwrite if User ID exists
    if user_id:
        try:
            high = report['summary']['high']
            med = report['summary']['medium']
            risk_score = min(100, (high * 25) + (med * 10))

            save_scan_result(
                user_id=user_id,
                target_url=target_url,
                mode="Quick",
                risk_score=risk_score,
                vulns_found=len(report['vulnerabilities']),
                report_json=report
            )
        except Exception as e:
            print(f"[!] History Sync Error: {e}")

    return jsonify(report)

@app.route('/api/deep-scan', methods=['POST'])
def handle_deep_scan():
    data = request.json
    target_url = data.get('url')
    user_id = data.get('user_id')

    if not target_url: return jsonify({"error": "No URL provided"}), 400
    if not target_url.startswith('http'): target_url = 'https://' + target_url

    try:
        # Passes session ID for internal deep scan tracking
        report = run_deep_scan(target_url, user_id=user_id) 
        return jsonify(report)
    except Exception as e:
        return jsonify({"error": "Deep scan engine failed"}), 500

@app.route('/api/download-report', methods=['POST'])
def download_report():
    data = request.json
    report_type = data.get('report_type', 'technical')
    report_data = {k:v for k,v in data.items() if k != 'report_type'}
    
    try:
        pdf_path = generate_report(report_data, report_type)
        return send_file(pdf_path, as_attachment=True)
    except Exception as e:
        return jsonify({"error": "PDF generation failed"}), 500

# --- HEALTH CHECK (Keep-Alive) ---
@app.route('/', methods=['GET'])
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "active", "message": "Sentinel Backend is Running"}), 200


if __name__ == '__main__':
    app.run(debug=True, port=5000)