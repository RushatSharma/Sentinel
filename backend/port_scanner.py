import socket
from vuln_kb import VULN_DB

def scan_ports(target_url):
    try:
        # Clean URL to get hostname
        hostname = target_url.replace("http://", "").replace("https://", "").split("/")[0].split(":")[0]
    except:
        return []

    # --- EXPANDED PORT LIST ---
    ports_to_check = {
        # File & Remote Access
        21: "FTP",
        22: "SSH",
        23: "Telnet",
        
        # Web & Proxies
        80: "HTTP",
        443: "HTTPS",
        8080: "HTTP-Alt / Proxy",
        8443: "HTTPS-Alt",
        
        # Databases
        1433: "MSSQL",
        3306: "MySQL",
        5432: "PostgreSQL",
        6379: "Redis",
        27017: "MongoDB",
        
        # Development & Frameworks
        3000: "React / Node.js",
        4200: "Angular",
        5000: "Flask / Python",
        8000: "Django / Http",
        8081: "Management Console",
        
        # Infrastructure & DevOps
        9000: "SonarQube / PHP-FPM",
        9200: "Elasticsearch",
        5601: "Kibana",
        15672: "RabbitMQ Admin",
        
        # Email & DNS
        25: "SMTP",
        53: "DNS"
    }
    
    open_ports = []
    
    # Pre-fetch KB data for consistent reporting
    kb = VULN_DB.get("NETWORK_EXPOSURE", {})

    # Iterate through all ports
    for port, service in ports_to_check.items():
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            # Short timeout to keep scans fast even with many ports
            sock.settimeout(0.4) 
            result = sock.connect_ex((hostname, port))
            
            if result == 0:
                # RETURN RICH OBJECT
                open_ports.append({
                    "type": "Network Exposure",
                    "severity": kb.get("severity", "Low"),
                    "url": f"{hostname}:{port} ({service})",
                    "description": kb.get("description", f"Port {port} ({service}) is exposed to the public internet."),
                    "impact": kb.get("impact", "Exposed services increase the attack surface and can be bruteforced."),
                    "remediation": kb.get("remediation", "Restrict access via Firewall or VPN."),
                    "reproduction": f"nmap -p {port} {hostname}",
                    "fix": kb.get("code_fix", f"ufw deny {port}/tcp")
                })
            sock.close()
        except:
            continue
        
    return open_ports