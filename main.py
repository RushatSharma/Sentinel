from utils import print_banner, log, fake_loading_bar
from scanner_logic import scan_sql_injection
from reporter import generate_report
import time
import os

def start_scan():
    # 1. Visuals: Show the Banner first
    print_banner()
    time.sleep(0.5)

    # 2. Input: Ask the user for the URL interactively
    # We use .strip() to remove accidental spaces
    console_input = input("\n [?] Enter Target URL (e.g. http://localhost:5000/): ").strip()

    # Basic Validation: If they hit Enter without typing anything
    if not console_input:
        log("No URL entered. Scan aborted.", level="danger")
        return

    # Auto-fix: If user forgets 'http://', we add it for them
    if not console_input.startswith("http"):
        target_url = "http://" + console_input
        log(f"Protocol missing. Auto-corrected to: {target_url}", level="warning")
    else:
        target_url = console_input

    log(f"Target locked: {target_url}", level="info")
    log("Initializing generic payload modules...", level="info")
    
    # 3. Visuals: Fake loading
    fake_loading_bar("Mapping form entry points")
    
    # 4. The REAL Scan (Logic)
    log("Launching SQL Injection heuristics...", level="info")
    vulnerability = scan_sql_injection(target_url)
    
    # Prepare results for the report
    vuln_list = []
    
    # 5. Analyze Results
    if vulnerability:
        vuln_list.append(vulnerability) # Add to report list
        fake_loading_bar("Analyzing response")
        log("VULNERABILITY CONFIRMED", level="danger")
        log(vulnerability, level="alert")
        log("Recommendation: Sanitize all database inputs.", level="info")
    else:
        log("Scan Complete. No obvious vulnerabilities found on this page.", level="success")
        log("Target appears secure against basic SQL injection.", level="info")

    # 6. Generate the PDF Report
    log("Compiling forensic data...", level="process")
    pdf_filename = generate_report(target_url, vuln_list)
    
    # 7. Final Success Message
    log(f"Audit Report generated successfully: {pdf_filename}", level="success")
    
    # Automatically open the report
    try:
        os.startfile(pdf_filename)
    except:
        pass

if __name__ == "__main__":
    start_scan()