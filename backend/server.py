from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import requests
import re
import math
import threading

# --- LOGIC IMPORTS ---
import scanner_logic 
from port_scanner import scan_ports, run_infrastructure_scan
from reporter import generate_report
from deep_scanner import run_deep_scan
from database import save_scan_result
import recon_engine 
import api_fuzzer 
from vuln_kb import VULN_DB
import quarantine
import ssl_scanner

app = Flask(__name__)
CORS(app)

# --- HELPER: Risk Calculation ---
def calculate_dynamic_risk(vuln_type, severity):
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
    
    score = cvss_map.get(vuln_type)
    if not score:
        if severity == "Critical": score = 9.5
        elif severity == "High": score = 8.0
        elif severity == "Medium": score = 5.5
        else: score = 2.0

    base_asset_value = 1000 
    financial_impact = base_asset_value * math.exp(score / 2.5)
    
    return round(score, 1), round(financial_impact, 2)

# --- HELPER: Unified Vulnerability Builder ---
def build_vuln_entry(kb_key, target_url, custom_details=None):
    kb_data = VULN_DB.get(kb_key, {})
    title = kb_data.get("title", kb_key)
    severity = kb_data.get("severity", "Low")
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
    findings = []
    try:
        response = requests.get(url, timeout=5)
        content = response.text
        emails = set(re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', content))
        
        if emails:
            valid_emails = [e for e in emails if "example.com" not in e and "uilib" not in e]
            if valid_emails:
                findings.append(f"Found {len(valid_emails)} exposed email addresses: {', '.join(valid_emails[:3])}...")
    except: pass
    return findings


# ==========================================
# --- BACKGROUND WORKERS (THREAD LOGIC) ---
# ==========================================

def bg_quick_scan(target_url, user_id, scan_id):
    try:
        print(f"[*] Background Quick Scan started for: {target_url}")
        report = scanner_logic.run_quick_scan(target_url)
        
        if user_id:
            try:
                vulns = len(report.get("vulnerabilities", []))
                high_sev = sum(1 for v in report.get("vulnerabilities", []) if v.get("severity") in ["High", "Critical"])
                risk_score = min(100, high_sev * 25 + vulns * 5)
                save_scan_result(user_id, target_url, "Quick Scan", risk_score, vulns, report)
            except Exception as e: print(f"[!] DB Sync Error (Quick Scan): {e}")
    except Exception as e:
        print(f"[!] Background Error during Quick Scan: {e}")

def bg_deep_scan(target_url, user_id, auth_config, scan_id):
    try:
        print(f"[*] Background Deep Scan started for: {target_url}")
        report = run_deep_scan(target_url, user_id=user_id, auth_config=auth_config) 
        
        if user_id:
            try:
                vulns = len(report.get("vulnerabilities", []))
                high_sev = sum(1 for v in report.get("vulnerabilities", []) if v.get("severity") in ["High", "Critical"])
                risk_score = min(100, high_sev * 25 + vulns * 5)
                save_scan_result(user_id, target_url, "Deep Scan", risk_score, vulns, report)
            except Exception as e: print(f"[!] DB Sync Error (Deep Scan): {e}")
    except Exception as e:
        print(f"[!] Background Deep scan engine failed: {e}")

def bg_recon(domain, user_id, scan_id):
    try:
        print(f"[*] Background OSINT Recon started for: {domain}")
        report = recon_engine.run_recon(domain)
        
        if user_id:
            try:
                save_scan_result(
                    user_id=user_id, target_url=domain, mode="OSINT Recon",
                    risk_score=0, vulns_found=0, report_json=report
                )
            except Exception as e: print(f"[!] DB Sync Error (Recon): {e}")
    except Exception as e:
        print(f"[!] Background OSINT mapping failed: {e}")

def bg_api_fuzz(swagger_url, user_id, scan_id):
    try:
        print(f"[*] Background API Fuzzer started for: {swagger_url}")
        report = api_fuzzer.fuzz_api(swagger_url)
        if "error" in report: 
            print(f"[!] Fuzzer internal error: {report['error']}")
            return
            
        if user_id:
            try:
                vulns = len(report.get("vulnerabilities", []))
                risk_score = min(100, vulns * 15) 
                save_scan_result(
                    user_id=user_id, target_url=swagger_url, mode="API Fuzzer",
                    risk_score=risk_score, vulns_found=vulns, report_json=report
                )
            except Exception as e: print(f"[!] DB Sync Error (Fuzzer): {e}")
    except Exception as e:
        print(f"[!] Background API Fuzzing engine failed: {e}")

def bg_port_scan(target, user_id, is_aggressive, scan_id):
    try:
        print(f"[*] Background Port Scan started for: {target}")
        results = run_infrastructure_scan(target, aggressive=is_aggressive) 
        if "error" in results: 
            print(f"[!] Port scan internal error: {results['error']}")
            return
            
        if user_id:
            try:
                open_ports = len(results.get("open_ports", []))
                risk_score = min(100, open_ports * 10)
                save_scan_result(
                    user_id=user_id, target_url=target, mode="Port Scan",
                    risk_score=risk_score, vulns_found=open_ports, report_json=results
                )
            except Exception as e: print(f"[!] DB Sync Error (Port Scan): {e}")
    except Exception as e:
        print(f"[!] Background Port Scan failed: {e}")

def bg_quarantine(artifact, scan_type, user_id, scan_id):
    try:
        print(f"[*] Background Quarantine Analysis started for: {artifact}")
        report = quarantine.analyze_artifact(artifact, scan_type)
        if "error" in report: 
            print(f"[!] Quarantine internal error: {report['error']}")
            return
            
        if user_id:
            try:
                is_malicious = report.get("status") == "Malicious"
                risk = 100 if is_malicious else 0
                save_scan_result(
                    user_id=user_id, target_url=artifact, mode="Quarantine",
                    risk_score=risk, vulns_found=1 if is_malicious else 0, report_json=report
                )
            except Exception as e: print(f"[!] DB Sync Error (Quarantine): {e}")
    except Exception as e:
        print(f"[!] Background Quarantine engine failed: {str(e)}")

def bg_ssl_scan(target, user_id, scan_id):
    try:
        print(f"[*] Background SSL Scan started for: {target}")
        report = ssl_scanner.analyze_ssl(target)
        if "error" in report: 
            print(f"[!] SSL scan internal error: {report['error']}")
            return
            
        if user_id:
            try:
                grade = report.get("grade", "F")
                risk_map = {"A": 0, "B": 25, "C": 50, "F": 100}
                risk_score = risk_map.get(grade, 50)
                vulns = len(report.get("vulnerabilities", []))
                
                save_scan_result(
                    user_id=user_id, target_url=target, mode="SSL Analyzer",
                    risk_score=risk_score, vulns_found=vulns, report_json=report
                )
            except Exception as e: print(f"[!] DB Sync Error (SSL): {e}")
    except Exception as e:
        print(f"[!] Background Crypto Engine Failed: {str(e)}")


# ==========================
# --- API ROUTES ---
# ==========================

@app.route('/api/scan', methods=['POST'])
def run_quick_scan_api():
    data = request.json
    target_url = data.get('url')
    user_id = data.get('user_id')
    scan_id = data.get('scan_id') # Optional: For frontend listeners
    
    if not target_url:
        return jsonify({"error": "No target URL provided."}), 400
        
    thread = threading.Thread(target=bg_quick_scan, args=(target_url, user_id, scan_id))
    thread.start()
    
    return jsonify({"status": "Scan Initiated", "scan_id": scan_id}), 200

@app.route('/api/deep-scan', methods=['POST'])
def handle_deep_scan():
    data = request.json
    target_url = data.get('url')
    user_id = data.get('user_id')
    auth_config = data.get('auth_config') 
    scan_id = data.get('scan_id')

    if not target_url: return jsonify({"error": "No URL provided"}), 400
    if not target_url.startswith('http'): target_url = 'https://' + target_url

    thread = threading.Thread(target=bg_deep_scan, args=(target_url, user_id, auth_config, scan_id))
    thread.start()

    return jsonify({"status": "Scan Initiated", "scan_id": scan_id}), 200

@app.route('/api/download-report', methods=['POST'])
def download_report():
    data = request.json
    report_type = data.get('report_type', 'technical')
    report_data = {k:v for k,v in data.items() if k != 'report_type'}
    
    try:
        pdf_path = generate_report(report_data, report_type)
        return send_file(pdf_path, as_attachment=True)
    except Exception as e:
        # THIS WILL NOW PRINT THE EXACT CAUSE OF THE CRASH
        print("\n[!] CRITICAL PDF GENERATION ERROR:")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"PDF engine failed: {str(e)}"}), 500

@app.route('/api/recon', methods=['POST'])
def handle_recon():
    data = request.json
    domain = data.get('domain')
    user_id = data.get('user_id') 
    scan_id = data.get('scan_id')
    
    if not domain: return jsonify({"error": "No domain provided"}), 400
        
    thread = threading.Thread(target=bg_recon, args=(domain, user_id, scan_id))
    thread.start()

    return jsonify({"status": "Scan Initiated", "scan_id": scan_id}), 200

@app.route('/api/fuzz-api', methods=['POST'])
def handle_api_fuzz():
    data = request.json
    swagger_url = data.get('swagger_url')
    user_id = data.get('user_id') 
    scan_id = data.get('scan_id')
    
    if not swagger_url: return jsonify({"error": "No Swagger URL provided"}), 400
        
    thread = threading.Thread(target=bg_api_fuzz, args=(swagger_url, user_id, scan_id))
    thread.start()

    return jsonify({"status": "Scan Initiated", "scan_id": scan_id}), 200

@app.route('/api/port-scan', methods=['POST'])
def port_scan_api():
    data = request.json
    target = data.get('target')
    user_id = data.get('user_id')
    is_aggressive = data.get('aggressive', False) 
    scan_id = data.get('scan_id')
    
    if not target: return jsonify({"error": "Target is required"}), 400
        
    thread = threading.Thread(target=bg_port_scan, args=(target, user_id, is_aggressive, scan_id))
    thread.start()

    return jsonify({"status": "Scan Initiated", "scan_id": scan_id}), 200

@app.route('/api/quarantine', methods=['POST'])
def handle_quarantine():
    data = request.json
    artifact = data.get('artifact')
    scan_type = data.get('type')
    user_id = data.get('user_id') 
    scan_id = data.get('scan_id')

    if not artifact or not scan_type:
        return jsonify({"error": "Artifact and scan type are required"}), 400

    thread = threading.Thread(target=bg_quarantine, args=(artifact, scan_type, user_id, scan_id))
    thread.start()

    return jsonify({"status": "Scan Initiated", "scan_id": scan_id}), 200

@app.route('/api/ssl-scan', methods=['POST'])
def handle_ssl_scan():
    data = request.json
    target = data.get('target')
    user_id = data.get('user_id')
    scan_id = data.get('scan_id')
    
    if not target: 
        return jsonify({"error": "Target domain is required"}), 400
        
    thread = threading.Thread(target=bg_ssl_scan, args=(target, user_id, scan_id))
    thread.start()

    return jsonify({"status": "Scan Initiated", "scan_id": scan_id}), 200

@app.route('/', methods=['GET'])
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "active", "message": "Sentinel Backend is Running"}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)