# backend/vuln_kb.py

VULN_DB = {
    # --- INJECTION ATTACKS ---
    "SQL_INJECTION": {
        "title": "SQL Injection (SQLi)",
        "severity": "Critical",
        "description": (
            "The application allows unvalidated user input to interfere with backend database queries. "
            "This vulnerability allows attackers to manipulate the SQL statement to access, modify, or delete "
            "data unauthorizedly."
        ),
        "impact": (
            "CRITICAL DATA BREACH RISK. Attackers can dump the entire customer database, including passwords, "
            "emails, and transaction history. In many cases, this leads to full administrative takeover "
            "and severe regulatory fines (GDPR/CCPA)."
        ),
        "remediation": (
            "1. USE PREPARED STATEMENTS: Stop using string concatenation to build queries.\n"
            "2. INPUT VALIDATION: Enforce strict allow-lists for all user inputs.\n"
            "3. LEAST PRIVILEGE: Ensure the database user has only the permissions necessary."
        ),
        "code_fix": (
            "# VULNERABLE:\n"
            "cursor.execute('SELECT * FROM users WHERE name = ' + user_input)\n\n"
            "# SECURE (Python/Psycopg2):\n"
            "cursor.execute('SELECT * FROM users WHERE name = %s', (user_input,))"
        )
    },
    "XSS_REFLECTED": {
        "title": "Reflected Cross-Site Scripting (XSS)",
        "severity": "High",
        "description": (
            "The application reflects user input (such as URL parameters) back to the browser without "
            "proper escaping or sanitization. This allows attackers to execute malicious JavaScript "
            "in the victim's session."
        ),
        "impact": (
            "ACCOUNT TAKEOVER RISK. Attackers can steal session cookies/tokens, redirect users to "
            "phishing sites, or perform actions on behalf of the user without their consent."
        ),
        "remediation": (
            "1. CONTEXTUAL ENCODING: Encode data before rendering it in HTML/JS contexts.\n"
            "2. CONTENT SECURITY POLICY (CSP): Implement a strict CSP to block unauthorized script execution.\n"
            "3. HTTPONLY COOKIES: Flag sensitive cookies as HttpOnly so scripts cannot read them."
        ),
        "code_fix": (
            "\n"
            "\n"
            "<div dangerouslySetInnerHTML={{ __html: userInput }} />\n\n"
            "\n"
            "<div>{userInput}</div>"
        )
    },
    "XSS_STORED": {
        "title": "Stored Cross-Site Scripting (XSS)",
        "severity": "Critical",
        "description": (
            "Malicious scripts are permanently stored on the target server (e.g., in a database, forum post, "
            "or comment field). The victim retrieves the malicious script when they view the stored data."
        ),
        "impact": (
            "WIDESPREAD INFECTION. Unlike Reflected XSS, Stored XSS affects every user who views the "
            "compromised page, potentially leading to mass account theft or worm-like propagation."
        ),
        "remediation": (
            "1. SANITIZE ON INPUT: Use libraries like DOMPurify to strip dangerous tags.\n"
            "2. ENCODE ON OUTPUT: Convert special characters to HTML entities before rendering.\n"
            "3. CSP: Restrict script execution sources."
        ),
        "code_fix": (
            "// Node.js (using DOMPurify)\n"
            "const clean = DOMPurify.sanitize(dirtyInput);\n"
            "db.save(clean);"
        )
    },

    # --- API & INFRASTRUCTURE ---
    "SHADOW_API": {
        "title": "Shadow API Detected",
        "severity": "Medium",
        "description": (
            "Undocumented API endpoints were found referenced in client-side JavaScript. "
            "These 'Shadow APIs' are often development or legacy routes that were not intended for public access."
        ),
        "impact": (
            "UNAUTHORIZED ACCESS RISK. Shadow APIs often lack the rigorous authentication checks applied "
            "to public-facing endpoints, allowing attackers to access internal data or administrative functions."
        ),
        "remediation": (
            "1. AUDIT: Review the discovered endpoints and decommission unused ones.\n"
            "2. AUTHENTICATION: Ensure all API routes (even internal ones) require valid JWT/OAuth tokens.\n"
            "3. MINIFICATION: Remove source maps and internal comments from production builds."
        ),
        "code_fix": (
            "// Ensure all routes use protected middleware\n"
            "app.use('/api/v1/admin', requireAuth, adminRoutes);"
        )
    },
    "SENSITIVE_FILE": {
        "title": "Sensitive File Exposure",
        "severity": "Critical",
        "description": (
            "Critical configuration or environment files were found publicly accessible on the server. "
            "These files often contain API keys, database passwords, and internal routing logic."
        ),
        "impact": (
            "FULL SYSTEM COMPROMISE. Exposure of files like .env or .git/config allows attackers to "
            "clone your source code, access cloud infrastructure, and steal customer data immediately."
        ),
        "remediation": (
            "1. BLOCK ACCESS: Configure Nginx/Apache to deny access to dotfiles (.*).\n"
            "2. ROTATE CREDENTIALS: Assume all exposed keys are compromised and generate new ones immediately."
        ),
        "code_fix": (
            "# Nginx Block Rule\n"
            "location ~ /\\. {\n"
            "    deny all;\n"
            "}"
        )
    },
    "NETWORK_EXPOSURE": {
        "title": "Network Port Exposure",
        "severity": "Low",
        "description": "Unnecessary network ports (e.g., 22, 8080, 3306) are open to the public internet.",
        "impact": "BRUTE FORCE RISK. Open services like SSH or MySQL allow attackers to attempt credential stuffing or exploit service-level vulnerabilities.",
        "remediation": "Configure firewall rules (UFW/AWS Security Groups) to block ingress traffic on non-web ports.",
        "code_fix": (
            "# Ubuntu UFW\n"
            "sudo ufw deny 22/tcp\n"
            "sudo ufw allow 80/tcp\n"
            "sudo ufw allow 443/tcp"
        )
    },
    "PII_EXPOSURE": {
        "title": "PII Exposure (Email/Phone)",
        "severity": "Medium",
        "description": (
            "The application leaks Personally Identifiable Information (PII) such as email addresses or "
            "phone numbers in the source code or HTTP response. This violates privacy regulations (GDPR/CCPA)."
        ),
        "impact": (
            "PRIVACY VIOLATION. Scrapers can harvest these emails for phishing campaigns, spam, or "
            "social engineering attacks against your users."
        ),
        "remediation": (
            "1. MASK DATA: Obfuscate emails (e.g., u***@example.com) on the server side.\n"
            "2. REMOVE COMMENTS: Ensure developers aren't leaving contact info in HTML comments."
        ),
        "code_fix": (
            "\n"
            "\n\n"
            "\n"
            ""
        )
    },
    "SERVER_ERROR": {
        "title": "Verbose Server Error (Information Leakage)",
        "severity": "Medium",
        "description": (
            "The application returns verbose error messages (stack traces, SQL errors) to the client "
            "when unexpected input is received."
        ),
        "impact": (
            "RECONNAISSANCE AID. Stack traces reveal internal file paths, framework versions, and logic "
            "flaws that attackers use to craft precise exploits."
        ),
        "remediation": (
            "Disable debug mode in production. Catch all exceptions and return generic '500 Internal Server Error' messages."
        ),
        "code_fix": (
            "# Flask/Django\n"
            "DEBUG = False\n"
            "app.config['PROPAGATE_EXCEPTIONS'] = False"
        )
    },

    # --- CLIENT-SIDE SECURITY ---
    "MISSING_CSP": {
        "title": "Missing Content Security Policy (CSP)",
        "severity": "Medium",
        "description": "The Content-Security-Policy HTTP header is missing or insecurely configured.",
        "impact": "Increases susceptibility to XSS and Data Injection attacks.",
        "remediation": "Implement a CSP header that restricts script sources to trusted domains.",
        "code_fix": "Content-Security-Policy: default-src 'self'; script-src 'self' https://trusted.cdn.com;"
    },
    "MISSING_HSTS": {
        "title": "HSTS Not Enforced",
        "severity": "Low",
        "description": (
            "HTTP Strict Transport Security (HSTS) header is missing. This tells browsers to ONLY "
            "connect via HTTPS."
        ),
        "impact": (
            "MAN-IN-THE-MIDDLE RISK. Attackers can downgrade connections to HTTP (SSL Stripping) "
            "and intercept unencrypted traffic."
        ),
        "remediation": "Enable HSTS with a long max-age duration.",
        "code_fix": "Strict-Transport-Security: max-age=63072000; includeSubDomains; preload"
    },
    "CLICKJACKING": {
        "title": "Clickjacking Vulnerability",
        "severity": "Low",
        "description": (
            "The X-Frame-Options header is missing or set to ALLOW. This allows the site to be embedded "
            "in an iframe on a malicious site."
        ),
        "impact": (
            "UI REDRESS ATTACK. Attackers can overlay invisible buttons over your site, tricking users "
            "into performing unintended actions (e.g., 'Delete Account')."
        ),
        "remediation": "Set X-Frame-Options to DENY or SAMEORIGIN.",
        "code_fix": "X-Frame-Options: SAMEORIGIN"
    },
    "INSECURE_COOKIE": {
        "title": "Cookie Missing 'Secure' Flag",
        "severity": "Medium",
        "description": "A cookie was detected without the 'Secure' flag, meaning it can be transmitted over unencrypted HTTP.",
        "impact": "SESSION HIJACKING. If a user connects via HTTP, their session ID can be intercepted in cleartext.",
        "remediation": "Ensure all cookies have the Secure flag enabled.",
        "code_fix": "Set-Cookie: session_id=xyz; Secure; SameSite=Strict"
    },
    "COOKIE_THEFT": {
        "title": "Cookie Missing 'HttpOnly' Flag",
        "severity": "High",
        "description": "A sensitive cookie (likely a session token) does not have the 'HttpOnly' flag set.",
        "impact": (
            "XSS EXPLOITATION. Malicious JavaScript can read this cookie (`document.cookie`) and send it "
            "to an attacker, bypassing authentication."
        ),
        "remediation": "Enable the HttpOnly flag for all session identifiers.",
        "code_fix": "Set-Cookie: session_id=xyz; Secure; HttpOnly"
    },
    "INSECURE_STORAGE": {
        "title": "Insecure Storage of Secrets",
        "severity": "High",
        "description": (
            "Sensitive data (API keys, JWTs, Passwords) was found stored in LocalStorage or SessionStorage. "
            "This storage is accessible to any JavaScript running on the page."
        ),
        "impact": (
            "DATA THEFT VIA XSS. Any XSS vulnerability immediately leads to full account compromise because "
            "scripts can simply read `localStorage.getItem('token')`."
        ),
        "remediation": "Store session tokens in HttpOnly, Secure cookies. Never store sensitive data in Web Storage.",
        "code_fix": "// Remove this:\nlocalStorage.setItem('token', jwt);\n// Use Server-Side Cookies instead."
    },

    # --- ADVANCED LOGIC FLAWS ---
    "CSRF": {
        "title": "Cross-Site Request Forgery (CSRF)",
        "severity": "Medium",
        "description": (
            "The application does not verify that a state-changing request originated from a trusted user session. "
            "Attackers can force users to execute actions (e.g., change password) without their knowledge."
        ),
        "impact": "UNAUTHORIZED ACTIONS. Attackers can change user emails, passwords, or transfer funds.",
        "remediation": "Implement Anti-CSRF tokens for all state-changing forms (POST/PUT/DELETE).",
        "code_fix": "<input type='hidden' name='csrf_token' value='{{ csrf_token }}'>"
    },
    "SSRF": {
        "title": "Server-Side Request Forgery (SSRF)",
        "severity": "Critical",
        "description": (
            "The application fetches data from a URL provided by the user without validation. "
            "Attackers can force the server to make requests to internal resources (e.g., AWS Metadata)."
        ),
        "impact": (
            "CLOUD TAKEOVER. Attackers can access internal admin panels or retrieve cloud instance credentials "
            "(e.g., http://169.254.169.254/latest/meta-data/)."
        ),
        "remediation": "Validate and whitelist user-supplied URLs. Disable HTTP redirects on backend fetchers.",
        "code_fix": "if not url.startswith('https://trusted-domain.com'):\n    raise SecurityException('Invalid Host')"
    },
    "IDOR": {
        "title": "Insecure Direct Object Reference (IDOR)",
        "severity": "High",
        "description": (
            "The application exposes internal object IDs (e.g., /user/1234) and does not verify if the "
            "requesting user owns that object."
        ),
        "impact": "DATA LEAKAGE. Attackers can iterate through IDs to view or modify other users' private data.",
        "remediation": "Implement ownership checks on every data access request.",
        "code_fix": (
            "record = db.get(id)\n"
            "if record.owner_id != current_user.id:\n"
            "    return HTTP_403_FORBIDDEN"
        )
    },
    "BROKEN_AUTH": {
        "title": "Broken Authentication",
        "severity": "Critical",
        "description": (
            "Weakness in session management or credential handling. Includes default passwords, "
            "weak hashing algorithms, or lack of brute-force protection."
        ),
        "impact": "ACCOUNT TAKEOVER. Attackers can guess passwords or bypass login controls completely.",
        "remediation": "Implement Rate Limiting, Multi-Factor Authentication (MFA), and use strong hashing (Argon2/Bcrypt).",
        "code_fix": "limit = RateLimit(limit=5, period=60) # Block after 5 failed attempts"
    },
    "XXE": {
        "title": "XML External Entity (XXE)",
        "severity": "High",
        "description": (
            "The application parses XML input containing references to external entities. "
            "This can allow attackers to view files on the application server filesystem."
        ),
        "impact": "LOCAL FILE DISCLOSURE. Attackers can read /etc/passwd or other sensitive system files.",
        "remediation": "Disable DTD processing and external entity resolution in your XML parser.",
        "code_fix": "parser.setFeature(xml.sax.handler.feature_external_ges, False)"
    },
    # backend/vuln_kb.py (Add these new keys)
    "SSTI": {
        "title": "Server-Side Template Injection (SSTI)",
        "severity": "Critical",
        "description": "The application blindly evaluates user input as a template code. This allows attackers to inject commands that run on the server.",
        "impact": "REMOTE CODE EXECUTION (RCE). Attackers can read sensitive files, install malware, or delete the database.",
        "remediation": "Treat all user input as data, not code. Use 'Logic-less' templates like Mustache or properly configure auto-escaping.",
        "code_fix": "# VULNERABLE (Flask/Jinja2):\nreturn render_template_string('Hello ' + user_input)\n\n# SECURE:\nreturn render_template('hello.html', name=user_input)"
    },
    "OPEN_REDIRECT": {
        "title": "Open Redirect Vulnerability",
        "severity": "Medium",
        "description": "The application redirects users to a URL provided in the input without validation.",
        "impact": "PHISHING AID. Attackers use your domain to look trustworthy while redirecting victims to malware/scam sites.",
        "remediation": "Validate the redirect URL against a whitelist of trusted domains before redirecting.",
        "code_fix": "if not url.startswith('https://mysite.com'):\n    return abort(400)"
    },
    "WEAK_SSL": {
        "title": "Weak SSL/TLS Configuration",
        "severity": "High",
        "description": "The server accepts connections using old protocols (TLS 1.0/1.1) or has an expired certificate.",
        "impact": "MAN-IN-THE-MIDDLE. Attackers can intercept encrypted traffic.",
        "remediation": "Disable TLS 1.0/1.1 in your web server config. Use Let's Encrypt for valid certificates.",
        "code_fix": "# Nginx\nssl_protocols TLSv1.2 TLSv1.3;"
    }
}


# --- RECONNAISSANCE & OSINT KNOWLEDGE BASE ---
# This maps subdomain keywords and server statuses to actionable threat intelligence.


RECON_KB = {
    "staging_dev": {
        "keywords": ["stage", "dev", "test", "uat", "sandbox", "qa", "beta"],
        "title": "Staging / Development Environment",
        "risk": "High",
        "playbook": "Attackers heavily target staging servers. Developers often clone production databases here for testing, but forget to enable Web Application Firewalls (WAFs), leave 'Debug Mode' on, or use default credentials like 'admin/password'. A compromised dev server is often a backdoor into the main network.",
        "remediation": "Never expose staging environments to the public internet. Restrict access via strict IP whitelisting or an internal corporate VPN. Ensure production data is heavily anonymized before being used in QA.",
        "next_step": "Copy this URL and run a Sentinel Deep Scan to hunt for exposed debug endpoints or weak login portals."
    },
    "api_endpoints": {
        "keywords": ["api", "graphql", "rest", "v1", "v2", "v3", "ws", "socket"],
        "title": "Exposed API Infrastructure",
        "risk": "Medium",
        "playbook": "Finding an API subdomain tells an attacker the application relies on programmatic data exchange. Hackers will hunt for the API documentation (Swagger/OpenAPI files) and test for BOLA (Broken Object Level Authorization)—e.g., changing '?user_id=1' to '?user_id=2' to steal other users' data.",
        "remediation": "Implement strict rate limiting, ensure all endpoints require JWT or OAuth token validation, and regularly audit for Shadow APIs (undocumented endpoints).",
        "next_step": "Feed this endpoint into a specialized API Fuzzer to test for authentication bypass and mass assignment vulnerabilities."
    },
    "admin_panels": {
        "keywords": ["admin", "portal", "cpanel", "manage", "dashboard", "backoffice", "staff"],
        "title": "Administrative / Employee Portal",
        "risk": "Critical",
        "playbook": "This is the holy grail for threat actors. If an attacker can brute-force, bypass, or phish credentials for an admin portal, they gain total control over the application, user data, and potentially the underlying server.",
        "remediation": "Admin portals must be hidden behind a VPN, require enforcing Multi-Factor Authentication (MFA), and have strict account lockout policies after failed login attempts.",
        "next_step": "Run a Deep Scan with 'Smart Auth Bypass' enabled to test for SQL injection on the login fields."
    },
    "vpn_remote": {
        "keywords": ["vpn", "citrix", "remote", "webmail", "sso", "auth", "login"],
        "title": "Remote Access / Authentication Gateway",
        "risk": "Critical",
        "playbook": "VPN and SSO subdomains are prime targets for Ransomware gangs. Attackers will use credential stuffing (using passwords leaked from other breaches) or exploit known CVEs in VPN software (like Fortinet or Pulse Secure) to gain an initial foothold into the corporate intranet.",
        "remediation": "Ensure the VPN appliance firmware is strictly patched. Enforce MFA for all remote access. Monitor logs for impossible travel anomalies (e.g., a login from India and Russia within 10 minutes).",
        "next_step": "Audit the service for known CVEs based on the software version exposed in the HTTP headers."
    },
    "cloud_storage": {
        "keywords": ["s3", "bucket", "storage", "assets", "cdn", "media", "cloud"],
        "title": "Cloud Storage / CDN Asset",
        "risk": "Low",
        "playbook": "Often points to an AWS S3 bucket or Azure Blob. Hackers will attempt to access this URL directly using cloud enumeration tools to see if the bucket permissions are misconfigured (e.g., allowing anonymous users to list or upload files).",
        "remediation": "Ensure cloud storage buckets block public access by default. Use strict IAM policies to ensure only authorized applications can read/write to the bucket.",
        "next_step": "Attempt to browse the root URL. If it returns an XML list of files, you have an exposed bucket."
    },
    "subdomain_takeover": {
        "keywords": ["_unreachable_"], # Triggered by status, not keyword
        "title": "Potential Subdomain Takeover",
        "risk": "Critical",
        "playbook": "If a subdomain resolves to an IP but is 'Unreachable' or returns a 404/NXDOMAIN, it might be pointing to a discontinued cloud service (like an old GitHub Page, Heroku app, or AWS bucket). A hacker can register that exact abandoned bucket name, effectively taking control of the 'target.com' subdomain to launch highly-trusted phishing attacks.",
        "remediation": "Regularly audit DNS records. If a cloud service is no longer in use, immediately delete the CNAME or A record pointing to it from your DNS registrar.",
        "next_step": "Check the CNAME record of this subdomain. If it points to a third-party service, verify if the resource is still actively claimed."
    },
    "default": {
        "title": "Standard Web Infrastructure",
        "risk": "Low",
        "playbook": "This appears to be standard web infrastructure. Attackers will map it, scan for open ports (like SSH 22 or RDP 3389), and fingerprint the web server version to hunt for outdated software.",
        "remediation": "Keep all server software (Nginx, Apache, IIS) up to date. Close all non-essential ports via a strict firewall configuration.",
        "next_step": "Run a standard vulnerability scan to check for outdated headers and basic misconfigurations."
    },
}

# --- API SECURITY KNOWLEDGE BASE (OWASP API TOP 10) ---
# --- API SECURITY KNOWLEDGE BASE (OWASP API TOP 10) ---
API_KB = {
    "BOLA": {
        "title": "Broken Object Level Authorization (BOLA)",
        "severity": "Critical",
        "description": "The API endpoint does not properly validate if the current user has permission to access the requested object ID.",
        "impact": "Attackers can manipulate IDs in the API request to view, edit, or delete data belonging to other users.",
        "remediation": "Implement strict authorization checks at the code level. Ensure the server verifies that the currently authenticated user owns the requested object ID before returning data.",
        "code_fix": "if requested_user_id != current_jwt_user_id:\n    return abort(403, 'Unauthorized Access')"
    },
    "BFLA": {
        "title": "Broken Function Level Authorization",
        "severity": "High",
        "description": "The API accepts destructive HTTP methods (like DELETE or PUT) on endpoints where they should not be allowed, or allows standard users to execute admin functions.",
        "impact": "Attackers can escalate their privileges or delete massive amounts of data by overriding intended HTTP methods.",
        "remediation": "Strictly define allowed HTTP methods at the router level and explicitly require administrative scopes for state-changing endpoints.",
        "code_fix": "@app.route('/api/users', methods=['GET']) # Explicitly block DELETE/PUT"
    },
    "UNAUTH_ACCESS": {
        "title": "Missing Authentication on Sensitive Route",
        "severity": "Critical",
        "description": "A sensitive API endpoint (e.g., profile, settings, data) returns data without requiring a valid authentication token.",
        "impact": "Anyone on the internet can interact with this API and scrape its data without logging in.",
        "remediation": "Enforce strict token validation on all endpoints except public authentication routes (like /login or /register).",
        "code_fix": "Authorization: Bearer <token>"
    },
    "API_SQLI": {
        "title": "API Data Injection (SQLi/NoSQLi)",
        "severity": "Critical",
        "description": "The API endpoint blindly passes JSON payload data or URL parameters directly into a backend database query.",
        "impact": "Attackers can bypass authentication, read the entire database, or drop tables via the API.",
        "remediation": "Never concatenate strings to build queries. Use an ORM (Object-Relational Mapper) or Parameterized Queries.",
        "code_fix": "cursor.execute('SELECT * FROM users WHERE id = %s', (user_id,))"
    },
    "MASS_ASSIGNMENT": {
        "title": "Mass Assignment / Auto-Binding Flaw",
        "severity": "High",
        "description": "The API endpoint blindly maps client-provided JSON payloads to internal object models without filtering out protected properties.",
        "impact": "Attackers can inject hidden fields (e.g., 'is_admin': true, 'role': 'admin') to escalate privileges or overwrite sensitive system configurations.",
        "remediation": "Use Data Transfer Objects (DTOs) or explicitly whitelist the properties that can be updated by the client.",
        "code_fix": "allowed_fields = ['email', 'first_name']\nuser.update({k: v for k, v in payload.items() if k in allowed_fields})"
    },
    "VERBOSE_ERRORS": {
        "title": "Security Misconfiguration (Verbose Errors)",
        "severity": "Medium",
        "description": "The API returns raw stack traces, database syntax errors, or framework details when sent malformed JSON data.",
        "impact": "Leaks internal backend logic, directory structures, and database types, giving attackers a blueprint to craft more severe attacks.",
        "remediation": "Implement a global exception handler that catches all crashes and returns standardized, generic error messages.",
        "code_fix": "@app.errorhandler(Exception)\ndef handle_error(e):\n    return jsonify({'error': 'An internal error occurred'}), 500"
    },
    "SSRF": {
        "title": "Server-Side Request Forgery (SSRF)",
        "severity": "Critical",
        "description": "The API endpoint accepts a URL via parameters and fetches it without validating the destination, allowing access to internal networks.",
        "impact": "Attackers can force the server to execute internal port scanning, access cloud metadata APIs (like AWS IMDS), or bypass firewalls.",
        "remediation": "Validate all user-supplied URLs against a strict allowlist. Block requests to internal IP addresses (e.g., 127.0.0.1, 169.254.169.254).",
        "code_fix": "if is_internal_ip(url):\n    return abort(400, 'Invalid destination URL')"
    },
    "BROKEN_AUTH_TOKEN": {
        "title": "Improper Authentication (Token Bypass)",
        "severity": "Critical",
        "description": "The API improperly validates authorization tokens. It accepts forged JWTs using the 'alg: none' vulnerability.",
        "impact": "Attackers can forge arbitrary authentication tokens to bypass login mechanisms entirely and assume any identity.",
        "remediation": "Use robust JWT libraries. Strictly enforce the expected signing algorithm (e.g., RS256) and reject tokens with 'alg: none'.",
        "code_fix": "jwt.decode(token, PUBLIC_KEY, algorithms=['RS256']) # Enforce secure algorithm"
    },
    "HTTP_TRACE_ENABLED": {
        "title": "Insecure HTTP Method Enabled (TRACE)",
        "severity": "Medium",
        "description": "The API server allows the HTTP TRACE method, which echoes back the received request entirely.",
        "impact": "Attackers can exploit this via Cross-Site Tracing (XST) to steal sensitive HTTP headers, including HttpOnly authorization cookies.",
        "remediation": "Disable the TRACE and TRACK methods at the web server or application proxy level.",
        "code_fix": "# Nginx config:\nif ($request_method = TRACE) {\n    return 405;\n}"
    }
}