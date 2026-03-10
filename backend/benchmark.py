import os
import subprocess
import time
import threading

# Global variables for the monitoring thread
max_mem_mb = 0.0
is_running = True

def poll_stats(container_name):
    global max_mem_mb, is_running
    while is_running:
        try:
            # Poll Docker for the specific container's memory usage
            res = subprocess.run(
                ["docker", "stats", "--no-stream", "--format", "{{.MemUsage}}", container_name],
                capture_output=True, text=True, timeout=2
            )
            out = res.stdout.strip()
            
            # Convert to MB
            if out and "/" in out:
                mem_str = out.split("/")[0].strip()
                val = 0.0
                if "MiB" in mem_str: val = float(mem_str.replace("MiB", ""))
                elif "GiB" in mem_str: val = float(mem_str.replace("GiB", "")) * 1024
                elif "KiB" in mem_str: val = float(mem_str.replace("KiB", "")) / 1024
                elif "B" in mem_str: val = float(mem_str.replace("B", "")) / (1024 * 1024)
                
                if val > max_mem_mb:
                    max_mem_mb = val
        except Exception:
            pass
        time.sleep(0.5)

def run_tool(command_list, container_name, display_name):
    global is_running, max_mem_mb
    is_running = True
    max_mem_mb = 0.0
    
    print("\n" + "*"*65)
    print(f"🚀 INITIATING SCAN: {display_name}")
    print("*"*65 + "\n")
    
    start_time = time.time()
    
    monitor_thread = threading.Thread(target=poll_stats, args=(container_name,))
    monitor_thread.start()
    
    # Run the docker command and stream the output LIVE
    process = subprocess.Popen(
        command_list, 
        stdout=subprocess.PIPE, 
        stderr=subprocess.STDOUT, 
        text=True,
        bufsize=1
    )
    
    for line in process.stdout:
        print(line, end="")
        
    process.wait()
    end_time = time.time()
    
    is_running = False
    monitor_thread.join()
    
    total_time = end_time - start_time
    if "Sentinel" in display_name:
        total_time -= 3.0 # Adjust for the sleep timer
    
    print("\n" + "="*65)
    print(f"📊 BENCHMARK RESULTS: {display_name}")
    print("="*65)
    print(f"⏱️  Total Execution Time : {total_time:.2f} Seconds")
    print(f"🧠  Peak Memory Usage    : {max_mem_mb:.2f} MB")
    print("="*65 + "\n")

if __name__ == "__main__":
    # TARGETING THE SQLi PAGE
    target_url = "http://host.docker.internal:80/vulnerabilities/sqli/"
    current_dir = os.getcwd()

    # 1. COMMAND FOR SENTINEL
    sentinel_cmd = [
        "docker", "run", "--rm", "--name", "sentinel_bench", 
        "-m", "2g", "--cpus=1.0", 
        "sentinel-backend", "sh", "-c", 
        f"python -u deep_scanner.py {target_url} && sleep 3"
    ]

    # 2. COMMAND FOR ZAP FULL SCAN (With Cookie Injection)
    zap_cmd = [
        "docker", "run", "--rm", "--name", "zap_bench", 
        "-v", f"{current_dir}:/zap/wrk:rw", "-w", "/zap/wrk", 
        "-m", "2g", "--cpus=1.0", 
        "zaproxy/zap-stable", "zap-full-scan.py", "-t", target_url,
        "-z", '-config replacer.full_list(0).description=auth -config replacer.full_list(0).enabled=true -config replacer.full_list(0).matchtype=REQ_HEADER -config replacer.full_list(0).matchstr=Cookie -config replacer.full_list(0).regex=false -config replacer.full_list(0).replacement="PHPSESSID=1rhk7g6ncq458gsnqtt5pqrkn0; security=low"'
    ]

    # Execute Sentinel
    run_tool(sentinel_cmd, "sentinel_bench", "Sentinel (Authenticated Active Scan)")
    
    print("\nCooling down Docker for 3 seconds before starting ZAP...")
    time.sleep(3)
    
    # Execute ZAP
    run_tool(zap_cmd, "zap_bench", "OWASP ZAP (Authenticated Full Scan)")