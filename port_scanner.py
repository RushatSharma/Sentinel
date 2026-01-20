import socket

def scan_ports(target_url):
    """
    Scans common ports to see if the server is exposed.
    """
    # Clean the URL to get just the hostname
    try:
        hostname = target_url.replace("http://", "").replace("https://", "").split("/")[0].split(":")[0]
    except:
        return []

    ports_to_check = {
        21: "FTP",
        22: "SSH",
        80: "HTTP",
        443: "HTTPS",
        3306: "MySQL Database",
        5000: "Dev Server",
        8080: "Alt HTTP"
    }
    
    open_ports = []
    
    # Fast scan with short timeout
    for port, service in ports_to_check.items():
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(0.5) 
        result = sock.connect_ex((hostname, port))
        if result == 0:
            open_ports.append(f"Port {port} ({service}) is OPEN")
        sock.close()
        
    return open_ports