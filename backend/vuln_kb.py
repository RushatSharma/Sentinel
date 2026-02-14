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