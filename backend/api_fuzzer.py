import requests
import urllib.parse
import re
from vuln_kb import API_KB

def generate_api_alert(vuln_key, url, method, details):
    kb_data = API_KB.get(vuln_key, {})
    return {
        "type": kb_data.get("title", vuln_key),
        "severity": kb_data.get("severity", "Medium"),
        "url": f"[{method.upper()}] {url}",
        "description": kb_data.get("description", "Vulnerability detected."),
        "impact": kb_data.get("impact", "Check logs."),
        "remediation": kb_data.get("remediation", "Patch endpoint."),
        "fix": kb_data.get("code_fix", "Review API design."),
        "reproduction": details
    }

def parse_swagger(swagger_url):
    try:
        res = requests.get(swagger_url, timeout=10)
        if res.status_code != 200: return None, "Failed to download Swagger file."
        data = res.json()
        
        base_url = ""
        if "openapi" in data:
            servers = data.get("servers", [])
            if servers: base_url = servers[0].get("url", "")
        elif "swagger" in data:
            host = data.get("host", "")
            base_path = data.get("basePath", "")
            scheme = data.get("schemes", ["https"])[0] if data.get("schemes") else "https"
            if host: base_url = f"{scheme}://{host}{base_path}"
                
        if base_url.startswith("/"):
            parsed_src = urllib.parse.urlparse(swagger_url)
            base_url = f"{parsed_src.scheme}://{parsed_src.netloc}{base_url}"
            
        return {"base_url": base_url, "paths": data.get("paths", {})}, None
    except Exception as e:
        return None, str(e)

def fuzz_api(swagger_url):
    blueprint, error = parse_swagger(swagger_url)
    if not blueprint: return {"error": error}
        
    base_url = blueprint["base_url"].rstrip('/')
    paths = blueprint["paths"]
    
    alerts = []
    mapped_endpoints = []
    
    sql_errors = ["syntax error", "mysql_fetch", "ora-", "postgresql", "sqlite3"]
    stack_errors = ["traceback (most recent call last):", "exception:", "java.lang.", "system.argumentnullexception"]
    sensitive_keywords = ["user", "account", "admin", "config", "data", "finance", "auth", "profile", "billing"]
    ignore_auth_keywords = ["login", "register", "signup", "auth/token", "logout", "health", "ping"]

    for path, methods in list(paths.items())[:30]:
        for method, details in methods.items():
            method = method.lower()
            mapped_endpoints.append({"method": method.upper(), "path": path})
            full_url = f"{base_url}{path}"
            
            is_sensitive = any(k in path.lower() for k in sensitive_keywords)
            is_public = any(k in path.lower() for k in ignore_auth_keywords)
            
            # TEST 1: BOLA / IDOR 
            if "{" in path and "}" in path:
                test_path = re.sub(r'\{[^}]+\}', '9999999', path)
                bola_url = f"{base_url}{test_path}"
                try:
                    res = requests.request(method, bola_url, timeout=3)
                    if res.status_code == 200 and len(res.text) > 20:
                        alerts.append(generate_api_alert("BOLA", bola_url, method, "Sent request with manipulated non-existent ID (9999999). Server responded with HTTP 200 and valid data, indicating missing object ownership checks."))
                except: pass

            # TEST 2: UNAUTHENTICATED EXPOSURE
            if method == "get" and is_sensitive and not is_public:
                try:
                    res = requests.get(full_url, timeout=3)
                    if res.status_code == 200 and "application/json" in res.headers.get("Content-Type", ""):
                        alerts.append(generate_api_alert("UNAUTH_ACCESS", full_url, method, "Sensitive endpoint returned HTTP 200 JSON data without an Authorization header."))
                except: pass

            # TEST 3: HTTP METHOD OVERRIDE (BFLA)
            if method == "get" and not is_public:
                try:
                    res = requests.delete(full_url, timeout=3)
                    if res.status_code in [200, 202, 204]:
                        alerts.append(generate_api_alert("BFLA", full_url, "DELETE", "Sent an undocumented HTTP DELETE request to a GET-only endpoint. Server responded with success (HTTP 200/204)."))
                except: pass

            # TEST 4: MASS ASSIGNMENT
            if method in ["post", "put"]:
                try:
                    headers = {"Content-Type": "application/json"}
                    payload = {"is_admin": True, "role": "admin", "access_level": 999, "system_override": 1}
                    res = requests.request(method, full_url, json=payload, headers=headers, timeout=3)
                    if res.status_code in [200, 201] and "is_admin" in res.text.lower():
                        alerts.append(generate_api_alert("MASS_ASSIGNMENT", full_url, method, "Injected undocumented administrative fields ('is_admin': true) in JSON payload. Server accepted and echoed them back in the response."))
                except: pass

            # TEST 5: VERBOSE ERRORS
            try:
                headers = {"Content-Type": "application/json"}
                res = requests.request(method, full_url, data='{"broken_json": ', headers=headers, timeout=3)
                if res.status_code == 500 or any(err in res.text.lower() for err in stack_errors):
                    alerts.append(generate_api_alert("VERBOSE_ERRORS", full_url, method, "Sent malformed JSON payload. Server crashed and returned raw stack trace or 500 Internal Server Error instead of handling the exception safely."))
            except: pass
            
            # TEST 6: SQL INJECTION
            try:
                sqli_url = f"{full_url}?id=1'%20OR%20'1'='1&user=*'"
                res = requests.request(method, sqli_url, timeout=3)
                if any(err in res.text.lower() for err in sql_errors):
                    alerts.append(generate_api_alert("API_SQLI", sqli_url, method, "Injected SQL payload (' OR '1'='1) into URL parameters caused the API to leak a database syntax error."))
            except: pass

            # TEST 7: SSRF (Server-Side Request Forgery)
            if method == "get":
                try:
                    # Inject a localhost port check
                    ssrf_url = f"{full_url}?url=http://127.0.0.1:65535&webhook=http://127.0.0.1:65535"
                    ssrf_res = requests.get(ssrf_url, timeout=4)
                    res_text = ssrf_res.text.lower()
                    if "connection refused" in res_text or "failed to connect" in res_text or "127.0.0.1:65535" in res_text:
                        alerts.append(generate_api_alert("SSRF", ssrf_url, method, "Injected internal localhost URL into parameters. Server response leaked connection errors, proving the API attempts to fetch arbitrary backend internal IPs."))
                except: pass

            # TEST 8: BROKEN AUTHENTICATION (JWT Alg: None)
            if is_sensitive and not is_public:
                try:
                    # 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJ1c2VyIjoiYWRtaW4ifQ.' == {"alg":"none"}.{"user":"admin"}.
                    fake_jwt = "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJ1c2VyIjoiYWRtaW4ifQ."
                    auth_res = requests.get(full_url, headers={"Authorization": f"Bearer {fake_jwt}"}, timeout=3)
                    if auth_res.status_code == 200 and "application/json" in auth_res.headers.get("Content-Type", ""):
                        alerts.append(generate_api_alert("BROKEN_AUTH_TOKEN", full_url, method, "Sent a forged JWT token bypassing signature verification using 'alg: none'. Server accepted it and returned HTTP 200."))
                except: pass

            # TEST 9: INSECURE HTTP METHODS (TRACE)
            if method == "get": # Only check TRACE once per path
                try:
                    trace_res = requests.request("TRACE", full_url, headers={"X-Sentinel-Trace": "Fuzzing"}, timeout=3)
                    if trace_res.status_code == 200 and "X-Sentinel-Trace" in trace_res.text:
                        alerts.append(generate_api_alert("HTTP_TRACE_ENABLED", full_url, "TRACE", "Sent an HTTP TRACE request. Server successfully echoed back the custom 'X-Sentinel-Trace' header, indicating Cross-Site Tracing (XST) risk."))
                except: pass

    unique_alerts = {f"{a['type']}-{a['url']}": a for a in alerts}.values()

    return {
        "target_api": base_url or "Unknown Host",
        "endpoints_mapped": len(mapped_endpoints),
        "endpoint_list": mapped_endpoints,
        "vulnerabilities": list(unique_alerts)
    }