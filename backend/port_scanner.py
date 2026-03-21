import socket
import concurrent.futures

# --- CONFIGURATION & CONSTANTS ---
COMMON_PORTS = {
    21: "ftp", 22: "ssh", 23: "telnet", 25: "smtp", 53: "dns",
    80: "http", 110: "pop3", 111: "rpc", 135: "msrpc", 139: "netbios",
    143: "imap", 443: "https", 445: "smb", 993: "imaps", 995: "pop3s",
    1433: "mssql", 1521: "oracle", 3306: "mysql", 3389: "rdp",
    5432: "postgresql", 5900: "vnc", 6379: "redis", 8080: "http-alt",
    8443: "https-alt", 27017: "mongodb"
}

def grab_banner(ip, port):
    """Attempts to retrieve service version information (Banner Grabbing)."""
    try:
        s = socket.socket()
        s.settimeout(1.0) # Shortened timeout for banner grab
        s.connect((ip, port))
        
        if port in [80, 443, 8080, 8443]:
            s.send(b"GET / HTTP/1.1\r\nHost: target\r\n\r\n")
            
        data = s.recv(1024).decode('utf-8', errors='ignore').strip()
        s.close()
        
        if data:
            for line in data.split('\n'):
                if any(x in line for x in ["Server:", "SSH-", "vsFTPd", "banner"]):
                    return line.replace('\r', '').strip()
            return data.split('\n')[0][:50].strip()
        return "Version Hidden"
    except:
        return "Version Hidden"

def scan_port(ip, port, timeout=0.5):
    """Checks if a specific TCP port is open with dynamic timeout."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(timeout) 
        result = s.connect_ex((ip, port))
        s.close()
        
        if result == 0:
            service_name = COMMON_PORTS.get(port, "unknown")
            version_info = grab_banner(ip, port)
            return {
                "port": port,
                "service": service_name,
                "version": version_info
            }
    except:
        pass
    return None

def scan_ports(target_host):
    """Function used by Quick Scan to check critical ports."""
    open_ports = []
    try:
        ip = socket.gethostbyname(target_host)
        for port in COMMON_PORTS.keys():
            res = scan_port(ip, port, timeout=0.5)
            if res:
                open_ports.append(port)
    except:
        pass
    return open_ports

def run_infrastructure_scan(target, aggressive=False):
    """Main entry point for the Infrastructure Scanner page."""
    open_ports = []
    
    try:
        ip = socket.gethostbyname(target)
    except socket.gaierror:
        return {"error": "Failed to resolve hostname or invalid IP."}

    # --- AGGRESSIVE OPTIMIZATIONS ---
    if aggressive:
        ports_to_scan = range(1, 65536)
        max_workers = 1000  # High concurrency
        scan_timeout = 0.1  # Very fast timeout to prevent network lockup on 65k ports
    else:
        ports_to_scan = list(COMMON_PORTS.keys()) + list(range(8000, 9100))
        max_workers = 300
        scan_timeout = 0.5  # Standard timeout

    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        # Pass the dynamic scan_timeout to the worker
        future_to_port = {executor.submit(scan_port, ip, port, scan_timeout): port for port in ports_to_scan}
        
        for future in concurrent.futures.as_completed(future_to_port):
            result = future.result()
            if result:
                open_ports.append(result)
                
    # Sort results numerically
    open_ports = sorted(open_ports, key=lambda x: x['port'])
    
    return {
        "target": target,
        "ip": ip,
        "open_ports": open_ports,
        "os_info": "Linux/Unix (Heuristic Guess)" if any(p['port'] == 22 for p in open_ports) else "Unknown OS",
        "total_scanned": len(ports_to_scan)
    }