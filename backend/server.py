from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import requests
import re
import math

# --- LOGIC IMPORTS ---
import scanner_logic 
from port_scanner import scan_ports
from reporter import generate_report
from deep_scanner import run_deep_scan
from database import save_scan_result
# IMPORT THE NEW KNOWLEDGE BASE
from vuln_kb import VULN_DB

app = Flask(__name__)
CORS(app)

# --- HELPER: Risk Calculation ---
def calculate_dynamic_risk(vuln_type, severity):
    """
    Calculates CVSS-based risk scores and estimated financial impact.
    """
    # Map friendly names to base CVSS scores
    cvss_map = {
        "SQL Injection (SQLi)": 9.8,
        "Reflected Cross-Site Scripting (XSS)": 6.1,
        "Stored Cross-Site Scripting (XSS)": 7.5,
        "Network Port Exposure": 5.3,
        "Shadow API Detected": 7.5,
        "PII Exposure (Email/Phone)": 8.2,
        "Sensitive File Exposure": 9.0,
        "Missing Content Security Policy (CSP)": 4.3,
        "HSTS Not Enforced": 3.1,
        "Clickjacking Vulnerability": 4.3,
        "Cookie Missing 'Secure' Flag": 5.0
    }
    
    # Default to 5.0 if not found, or use severity to estimate
    score = cvss_map.get(vuln_type)
    if not score:
        if severity == "Critical": score = 9.5
        elif severity == "High": score = 8.0
        elif severity == "Medium": score = 5.5
        else: score = 2.0

    # Financial Impact Formula: Base * e^(score/2.5)
    base_asset_value = 1000 
    financial_impact = base_asset_value * math.exp(score / 2.5)
    
    return round(score, 1), round(financial_impact, 2)

# --- HELPER: Unified Vulnerability Builder ---
def build_vuln_entry(kb_key, target_url, custom_details=None):
    """
    Merges static KB data (descriptions, remediation) with dynamic scan findings.
    """
    kb_data = VULN_DB.get(kb_key, {})
    
    # Default to generic if key not found
    title = kb_data.get("title", kb_key)
    severity = kb_data.get("severity", "Low")
    
    # Calculate Risk
    cvss, cost = calculate_dynamic_risk(title, severity)

    return {
        "type": title,
        "severity": severity,
        "url": target_url,
        "description": kb_data.get("description", "No description available."),
        "impact": kb_data.get("impact", "Check detailed logs."),
        "remediation": kb_data.get("remediation", "Patch immediately."),
        "reproduction": custom_details or "Automated scan detected this issue.",
        "fix": kb_data.get("code_fix", "No code example."), 
        "cvss": cvss,
        "est_cost": cost
    }

def scan_page_content(url):
    """
    Scans for PII leaks (emails) using Regex.
    Returns a list of finding strings.
    """
    findings = []
    try:
        response = requests.get(url, timeout=5)
        content = response.text
        # Regex for emails
        emails = set(re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', content))
        
        if emails:
            # Filter out common false positives
            valid_emails = [e for e in emails if "example.com" not in e and "uilib" not in e]
            if valid_emails:
                findings.append(f"Found {len(valid_emails)} exposed email addresses: {', '.join(valid_emails[:3])}...")
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
    pii_results = scan_page_content(target_url)
    for result in pii_results:
        # Use the Builder to get rich data
        entry = build_vuln_entry("PII_EXPOSURE", target_url, custom_details=result)
        report["vulnerabilities"].append(entry)

    # 2. Port Scan
    try:
        # Scan ports and aggregate them into one entry
        open_ports = list(scan_ports(target_url))
        if open_ports:
            details = f"Open Ports Detected: {', '.join(map(str, open_ports))}"
            entry = build_vuln_entry("NETWORK_EXPOSURE", target_url, custom_details=details)
            report["vulnerabilities"].append(entry)
    except Exception as e:
        print(f"[!] Port scan error: {e}")

    # 3. SQL Injection (From scanner_logic)
    sqli = scanner_logic.scan_sql_injection(target_url)
    if sqli:
        # SQLi returns a rich dict, but we need to add Risk Metrics
        cvss, cost = calculate_dynamic_risk(sqli['type'], sqli['severity'])
        sqli['cvss'] = cvss
        sqli['est_cost'] = cost
        report["vulnerabilities"].append(sqli)

    # 4. XSS (From scanner_logic)
    xss = scanner_logic.scan_xss(target_url)
    if xss:
        cvss, cost = calculate_dynamic_risk(xss['type'], xss['severity'])
        xss['cvss'] = cvss
        xss['est_cost'] = cost
        report["vulnerabilities"].append(xss)

    # 5. Shadow APIs (From scanner_logic)
    for s in scanner_logic.scan_shadow_apis(target_url):
        cvss, cost = calculate_dynamic_risk(s['type'], s['severity'])
        s['cvss'] = cvss
        s['est_cost'] = cost
        report["vulnerabilities"].append(s)

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
            # Simple risk score algorithm (0-100)
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
        print(f"[!] Deep scan error: {e}")
        return jsonify({"error": "Deep scan engine failed"}), 500

@app.route('/api/download-report', methods=['POST'])
def download_report():
    data = request.json
    report_type = data.get('report_type', 'technical')
    # Filter out report_type from the data passed to the generator
    report_data = {k:v for k,v in data.items() if k != 'report_type'}
    
    try:
        pdf_path = generate_report(report_data, report_type)
        return send_file(pdf_path, as_attachment=True)
    except Exception as e:
        print(f"[!] PDF Generation Error: {e}")
        return jsonify({"error": "PDF generation failed"}), 500

# --- HEALTH CHECK (Keep-Alive) ---
@app.route('/', methods=['GET'])
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "active", "message": "Sentinel Backend is Running"}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)