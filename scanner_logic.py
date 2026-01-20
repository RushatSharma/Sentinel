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

# --- SCANNER 1: SQL INJECTION ---
def scan_sql_injection(url):
    payloads = ["'", "\"", "' OR 1=1 --"] 
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
                if form_details["method"] == "post":
                    res = requests.post(target_url, data=data, headers=get_header(), timeout=3)
                else:
                    res = requests.get(target_url, params=data, headers=get_header(), timeout=3)
                
                if "mysql" in res.text.lower() or "syntax error" in res.text.lower():
                    return f"SQL Injection on {target_url} (Payload: {payload})"
            except: continue
    return None

# --- SCANNER 2: XSS ---
def scan_xss(url):
    xss_payload = "<script>alert('XSS')</script>"
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
            if form_details["method"] == "post":
                res = requests.post(target_url, data=data, headers=get_header(), timeout=3)
            else:
                res = requests.get(target_url, params=data, headers=get_header(), timeout=3)
            
            if xss_payload in res.text:
                return f"Reflected XSS on {target_url}"
        except: continue
    return None

# --- SCANNER 3: SHADOW API HUNTER ---
def scan_shadow_apis(url):
    """
    Downloads JS files and looks for hidden API endpoints using Regex.
    """
    detected_apis = []
    try:
        res = requests.get(url, headers=get_header(), timeout=5)
        soup = BeautifulSoup(res.content, "html.parser")
        
        # Find all script sources
        scripts = [script.attrs.get("src") for script in soup.find_all("script") if script.attrs.get("src")]
        
        for script in scripts:
            script_url = urljoin(url, script)
            try:
                js_content = requests.get(script_url, timeout=3).text
                # Regex looking for /api/..., /v1/..., /admin/...
                matches = re.findall(r'["\'](\/(?:api|v1|admin|private)\/[a-zA-Z0-9_\-\/]+)["\']', js_content)
                for match in matches:
                    detected_apis.append(f"Hidden Endpoint '{match}' found in {script}")
            except: continue
    except: pass
    
    # Deduplicate results
    return list(set(detected_apis))