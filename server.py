from flask import Flask, request, jsonify
from flask_cors import CORS
from scanner_logic import scan_sql_injection, scan_xss, scan_shadow_apis
from port_scanner import scan_ports

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing (Allows React to talk to Python)

# --- FEATURE: COMPLIANCE MAPPER & AUTO-FIXER ---
def get_compliance_and_fix(vuln_type):
    """
    Returns the Legal Standards and Code Fixes for a given bug.
    """
    db = {
        "SQL Injection": {
            "compliance": {
                "GDPR": "Art. 32: Security of Processing",
                "OWASP": "A03:2021 - Injection",
                "PCI_DSS": "Req 6.5.1: Injection Flaws"
            },
            "fix": "Use Prepared Statements (Parameterized Queries) in your backend code. Never concatenate user input directly into SQL strings."
        },
        "XSS": {
            "compliance": {
                "GDPR": "Art. 32: Confidentiality",
                "OWASP": "A03:2021 - Injection",
                "PCI_DSS": "Req 6.5.7: Cross-Site Scripting"
            },
            "fix": "Sanitize all user inputs using a library like DOMPurify. Implement Content Security Policy (CSP) headers."
        },
        "Network Exposure": {
            "compliance": {
                "GDPR": "Art. 25: Privacy by Design",
                "OWASP": "A05:2021 - Security Misconfiguration",
                "PCI_DSS": "Req 1: Install Firewalls"
            },
            "fix": "Close unused ports on your server firewall (UFW/IPTables). Only expose ports 80/443 for web traffic."
        },
        "Shadow API": {
            "compliance": {
                "GDPR": "Art. 30: Records of Processing",
                "OWASP": "A09:2021 - Logging Failures",
                "PCI_DSS": "Req 2: Remove unnecessary defaults"
            },
            "fix": "Document all API endpoints in Swagger/OpenAPI. Remove debug endpoints from production JavaScript bundles."
        }
    }
    return db.get(vuln_type, {})

# --- API ENDPOINT ---
@app.route('/api/scan', methods=['POST'])
def run_scan():
    data = request.json
    target_url = data.get('url')
    
    if not target_url:
        return jsonify({"error": "No URL provided"}), 400

    print(f"[*] Starting scan for: {target_url}")
    
    # Initialize Report
    report = {
        "target": target_url,
        "vulnerabilities": []
    }

    # 1. Port Scan
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

    # 2. SQL Injection
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

    # 3. XSS
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

    # 4. Shadow API
    shadows = scan_shadow_apis(target_url)
    for s in shadows:
        info = get_compliance_and_fix("Shadow API")
        report["vulnerabilities"].append({
            "type": "Shadow API Detected",
            "details": s,
            "severity": "Medium",
            "compliance": info["compliance"],
            "fix": info["fix"]
        })

    return jsonify(report)

if __name__ == '__main__':
    # Run on port 5000
    app.run(debug=True, port=5000)