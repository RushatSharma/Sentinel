import socket
import concurrent.futures

# --- CONFIGURATION & CONSTANTS ---
# Map common port numbers to service names for quick identification
COMMON_PORTS = {
    21: "ftp", 22: "ssh", 23: "telnet", 25: "smtp", 53: "dns",
    80: "http", 110: "pop3", 111: "rpc", 135: "msrpc", 139: "netbios",
    143: "imap", 443: "https", 445: "smb", 993: "imaps", 995: "pop3s",
    1433: "mssql", 1521: "oracle", 3306: "mysql", 3389: "rdp",
    5432: "postgresql", 5900: "vnc", 6379: "redis", 8080: "http-alt",
    8443: "https-alt", 27017: "mongodb"
}

def grab_banner(ip, port):
    """
    Attempts to retrieve service version information (Banner Grabbing).
    """
    try:
        # Create a socket for banner grabbing with a short timeout
        s = socket.socket()
        s.settimeout(1.5)
        s.connect((ip, port))
        
        # For web ports, send a basic probe to trigger a response header
        if port in [80, 443, 8080, 8443]:
            s.send(b"GET / HTTP/1.1\r\nHost: target\r\n\r\n")
            
        data = s.recv(1024).decode('utf-8', errors='ignore').strip()
        s.close()
        
        if data:
            # Extract common server headers if present
            for line in data.split('\n'):
                if any(x in line for x in ["Server:", "SSH-", "vsFTPd", "banner"]):
                    return line.replace('\r', '').strip()
            # Return first line of raw data if no header is matched
            return data.split('\n')[0][:50].strip()
        return "Version Hidden"
    except:
        return "Version Hidden"

def scan_port(ip, port):
    """
    Checks if a specific TCP port is open.
    """
    try:
        # Use AF_INET for IPv4 and SOCK_STREAM for TCP
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(0.5)  # Fast timeout for high-speed scanning
        result = s.connect_ex((ip, port))  # Returns 0 if port is open
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
    """
    Function used by Quick Scan to check a specific set of critical ports.
    """
    open_ports = []
    try:
        ip = socket.gethostbyname(target_host)
        # Scan only highly critical common ports defined in our map
        for port in COMMON_PORTS.keys():
            res = scan_port(ip, port)
            if res:
                open_ports.append(port)
    except:
        pass
    return open_ports

def run_infrastructure_scan(target, aggressive=False):
    """
    Main entry point for the dedicated Infrastructure Scanner page.
    Supports aggressive scanning of the full port range (1-65535).
    """
    open_ports = []
    
    # Resolve target hostname to IP address
    try:
        ip = socket.gethostbyname(target)
    except socket.gaierror:
        return {"error": "Failed to resolve hostname or invalid IP."}

    # Determine range: Full scan (65k) or Top Vulnerable ports (~1200)
    if aggressive:
        ports_to_scan = range(1, 65536)
        max_workers = 500  # Higher threading for full range
    else:
        # Scan common ports + typical dev ranges (8000-9000)
        ports_to_scan = list(COMMON_PORTS.keys()) + list(range(8000, 9100))
        max_workers = 200

    # Multi-threaded execution for high performance
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        # Submit all port scanning tasks to the thread pool
        future_to_port = {executor.submit(scan_port, ip, port): port for port in ports_to_scan}
        
        for future in concurrent.futures.as_completed(future_to_port):
            result = future.result()
            if result:
                open_ports.append(result)
                
    # Sort results numerically for the frontend
    open_ports = sorted(open_ports, key=lambda x: x['port'])
    
    return {
        "target": target,
        "ip": ip,
        "open_ports": open_ports,
        "os_info": "Linux/Unix (Heuristic Guess)" if any(p['port'] == 22 for p in open_ports) else "Unknown OS",
        "total_scanned": len(ports_to_scan)
    }