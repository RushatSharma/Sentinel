from flask import Flask, request, jsonify
from flask_cors import CORS
from scanner_logic import scan_sql_injection, scan_xss, scan_shadow_apis
from port_scanner import scan_ports

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

# --- HELPER: COMPLIANCE & FIX DATABASE ---
def get_compliance_and_fix(vuln_type):
    db = {
        "SQL Injection": {
            "compliance": {
                "GDPR": "Art. 32: Security of Processing",
                "OWASP": "A03:2021 - Injection",
                "PCI_DSS": "Req 6.5.1: Injection Flaws"
            },
            "fix": "Use Prepared Statements (Parameterized Queries). Never concatenate input directly into SQL."
        },
        "XSS": {
            "compliance": {
                "GDPR": "Art. 32: Confidentiality",
                "OWASP": "A03:2021 - Injection",
                "PCI_DSS": "Req 6.5.7: Cross-Site Scripting"
            },
            "fix": "Sanitize all user inputs with DOMPurify. Enable Content Security Policy (CSP)."
        },
        "Network Exposure": {
            "compliance": {
                "GDPR": "Art. 25: Privacy by Design",
                "OWASP": "A05:2021 - Security Misconfiguration",
                "PCI_DSS": "Req 1: Install Firewalls"
            },
            "fix": "Close unused ports using UFW/IPTables. Only expose ports 80/443."
        },
        "Shadow API Detected": {
            "compliance": {
                "GDPR": "Art. 30: Records of Processing",
                "OWASP": "A09:2021 - Logging Failures",
                "PCI_DSS": "Req 2: Remove unnecessary defaults"
            },
            "fix": "Remove debug endpoints from production code. Secure all API routes with auth."
        }
    }
    return db.get(vuln_type, {})

@app.route('/api/scan', methods=['POST'])
def run_scan():
    data = request.json
    target_url = data.get('url')
    
    if not target_url:
        return jsonify({"error": "No URL provided"}), 400

    print(f"[*] Starting scan for: {target_url}")
    
    # 1. Initialize Report Structure
    report = {
        "target": target_url,
        "vulnerabilities": [],
        "summary": {"high": 0, "medium": 0, "low": 0} # This was missing!
    }

    # 2. RUN SCANS
    
    # Port Scan
    ports = scan_ports(target_url)
    for p in ports:
        info = get_compliance_and_fix("Network Exposure")
        report["vulnerabilities"].append({
            "type": "Network Exposure",
            "details": p,
            "severity": "Low",
            "compliance": info["compliance"],
            "fix": info["fix"]
        })

    # SQL Injection
    sqli = scan_sql_injection(target_url)
    if sqli:
        info = get_compliance_and_fix("SQL Injection")
        report["vulnerabilities"].append({
            "type": "SQL Injection",
            "details": sqli,
            "severity": "Critical",
            "compliance": info["compliance"],
            "fix": info["fix"]
        })

    # XSS
    xss = scan_xss(target_url)
    if xss:
        info = get_compliance_and_fix("XSS")
        report["vulnerabilities"].append({
            "type": "XSS",
            "details": xss,
            "severity": "High",
            "compliance": info["compliance"],
            "fix": info["fix"]
        })

    # Shadow APIs
    shadows = scan_shadow_apis(target_url)
    for s in shadows:
        info = get_compliance_and_fix("Shadow API Detected")
        report["vulnerabilities"].append({
            "type": "Shadow API Detected",
            "details": s,
            "severity": "Medium",
            "compliance": info["compliance"],
            "fix": info["fix"]
        })

    # 3. CALCULATE SUMMARY (The Fix)
    for vuln in report["vulnerabilities"]:
        sev = vuln["severity"]
        if sev in ["Critical", "High"]:
            report["summary"]["high"] += 1
        elif sev == "Medium":
            report["summary"]["medium"] += 1
        elif sev == "Low":
            report["summary"]["low"] += 1

    return jsonify(report)

if __name__ == '__main__':
    app.run(debug=True, port=5000)