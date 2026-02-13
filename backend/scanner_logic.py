import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import random
import re

# --- CONFIG: STEALTH HEADERS ---
USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36"
]

def get_header():
    return {"User-Agent": random.choice(USER_AGENTS)}

# --- HELPER FUNCTIONS ---
def get_forms(url):
    try:
        content = requests.get(url, headers=get_header(), timeout=5).content
        soup = BeautifulSoup(content, "html.parser")
        return soup.find_all("form")
    except:
        return []

def get_form_details(form):
    details = {}
    action = form.attrs.get("action", "").lower()
    method = form.attrs.get("method", "get").lower()
    inputs = []
    for input_tag in form.find_all("input"):
        input_type = input_tag.attrs.get("type", "text")
        input_name = input_tag.attrs.get("name")
        input_value = input_tag.attrs.get("value", "")
        inputs.append({"type": input_type, "name": input_name, "value": input_value})
    
    details["action"] = action
    details["method"] = method
    details["inputs"] = inputs
    return details

# --- SCANNER 1: SQL INJECTION (Enhanced) ---
def scan_sql_injection(url):
    payloads = ["'", "\"", "' OR 1=1 --", "' UNION SELECT 1,2,3 --"] 
    forms = get_forms(url)
    if not forms: return None

    for form in forms:
        form_details = get_form_details(form)
        for payload in payloads:
            data = {}
            for input_tag in form_details["inputs"]:
                if not input_tag["name"]: continue
                if input_tag["type"] == "hidden" or input_tag.get("value"):
                    try: data[input_tag["name"]] = input_tag["value"] + payload
                    except: pass
                elif input_tag["type"] != "submit":
                    data[input_tag["name"]] = f"test{payload}"
            
            target_url = urljoin(url, form_details["action"])
            try:
                method = form_details["method"]
                if method == "post":
                    res = requests.post(target_url, data=data, headers=get_header(), timeout=3)
                else:
                    res = requests.get(target_url, params=data, headers=get_header(), timeout=3)
                
                # Check for SQL errors
                if any(x in res.text.lower() for x in ["mysql", "syntax error", "sql", "database error"]):
                    return {
                        "type": "SQL Injection",
                        "severity": "Critical",
                        "url": target_url,
                        "description": "The application allows unvalidated user input to interfere with backend database queries.",
                        "impact": "Attackers can steal all customer data, modify balances, or bypass authentication panels completely. This is a catastrophic breach risk.",
                        "reproduction": f"1. Navigate to {url}\n2. Submit the form ({method.upper()}) with payload: {payload}\n3. Observe database error in response.",
                        "remediation": "Use Parameterized Queries (Prepared Statements) for all database access. Never concatenate strings into SQL queries."
                    }
            except: continue
    return None

# --- SCANNER 2: XSS (Enhanced) ---
def scan_xss(url):
    xss_payload = "<script>alert('SENTINEL_XSS')</script>"
    forms = get_forms(url)
    if not forms: return None

    for form in forms:
        form_details = get_form_details(form)
        data = {}
        for input_tag in form_details["inputs"]:
            if not input_tag["name"]: continue
            if input_tag["type"] != "submit":
                data[input_tag["name"]] = xss_payload
        
        target_url = urljoin(url, form_details["action"])
        try:
            method = form_details["method"]
            if method == "post":
                res = requests.post(target_url, data=data, headers=get_header(), timeout=3)
            else:
                res = requests.get(target_url, params=data, headers=get_header(), timeout=3)
            
            if xss_payload in res.text:
                return {
                    "type": "Reflected XSS",
                    "severity": "High",
                    "url": target_url,
                    "description": "The application reflects user input back to the browser without sanitization.",
                    "impact": "Attackers can execute malicious scripts in users' browsers, stealing session cookies, redirecting users to phishing sites, or performing actions on their behalf.",
                    "reproduction": f"1. Send a {method.upper()} request to {target_url}\n2. Inject payload: {xss_payload}\n3. The script executes in the browser.",
                    "remediation": "Contextually encode all user data before rendering it in HTML. Implement a Content Security Policy (CSP)."
                }
        except: continue
    return None

# --- SCANNER 3: SHADOW API HUNTER (Enhanced) ---
def scan_shadow_apis(url):
    detected_apis = []
    try:
        res = requests.get(url, headers=get_header(), timeout=5)
        soup = BeautifulSoup(res.content, "html.parser")
        
        scripts = [script.attrs.get("src") for script in soup.find_all("script") if script.attrs.get("src")]
        
        for script in scripts:
            script_url = urljoin(url, script)
            try:
                js_content = requests.get(script_url, timeout=3).text
                matches = re.findall(r'["\'](\/(?:api|v1|admin|private)\/[a-zA-Z0-9_\-\/]+)["\']', js_content)
                for match in matches:
                    detected_apis.append({
                        "type": "Shadow API Endpoint",
                        "severity": "Medium",
                        "url": urljoin(url, match),
                        "description": f"An undocumented API endpoint '{match}' was found leaked in client-side JavaScript.",
                        "impact": "Shadow APIs often lack the rigorous authentication/authorization checks of public APIs, allowing unauthorized data access.",
                        "reproduction": f"1. Inspect source code of {script_url}\n2. Locate endpoint: {match}\n3. Send direct request to endpoint.",
                        "remediation": "Audit all exposed endpoints. Remove debug/admin routes from production JS bundles."
                    })
            except: continue
    except: pass
    
    return detected_apis