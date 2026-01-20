from fpdf import FPDF
import time
import os
import re

class PDFReport(FPDF):
    def header(self):
        # Logo or Title in Header
        self.set_font('Arial', 'B', 16)
        self.set_text_color(50, 50, 50) # Dark Grey
        self.cell(0, 10, 'SentinelAudit - Security Assessment Report', 0, 1, 'C')
        self.ln(10)

    def footer(self):
        # Page footer
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.set_text_color(128)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

def generate_report(target_url, vulnerabilities):
    """
    Generates a PDF report based on scan results.
    """
    
    # 1. Create the PDF Object
    pdf = PDFReport()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)
    
    # 2. Add Project Meta-Data
    pdf.set_font("Arial", "B", 12)
    pdf.cell(0, 10, f"Target URL: {target_url}", 0, 1)
    pdf.cell(0, 10, f"Scan Date: {time.strftime('%Y-%m-%d %H:%M:%S')}", 0, 1)
    pdf.ln(10) # Line break

    # 3. Add Executive Summary
    pdf.set_font("Arial", "B", 14)
    pdf.set_text_color(0, 102, 204) # Blue color for headers
    pdf.cell(0, 10, "Executive Summary", 0, 1)
    pdf.set_text_color(0, 0, 0) # Reset to black
    pdf.set_font("Arial", "", 11)
    
    if vulnerabilities:
        summary_text = (
            f"SentinelAudit detected {len(vulnerabilities)} critical security issues on the target system. "
            "Immediate remediation is recommended to prevent potential data breaches."
        )
    else:
        summary_text = (
            "SentinelAudit completed the scan and found no obvious high-severity vulnerabilities "
            "based on the current heuristic definitions."
        )
    
    pdf.multi_cell(0, 7, summary_text)
    pdf.ln(10)

    # 4. Detailed Findings Section
    pdf.set_font("Arial", "B", 14)
    pdf.set_text_color(204, 0, 0) # Red color for Vulnerabilities
    pdf.cell(0, 10, "Detailed Findings", 0, 1)
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("Arial", "", 11)

    if vulnerabilities:
        for i, vuln in enumerate(vulnerabilities, 1):
            # Print the vulnerability in Red/Bold
            pdf.set_font("Arial", "B", 11)
            pdf.cell(0, 10, f"{i}. CRITICAL: SQL Injection Detected", 0, 1)
            
            # Print details
            pdf.set_font("Arial", "", 10)
            pdf.multi_cell(0, 6, f"Details: {vuln}")
            pdf.ln(2)
            
            # Print Recommendation
            pdf.set_font("Arial", "I", 10)
            pdf.multi_cell(0, 6, "Remediation: Use Prepared Statements (Parameterized Queries) to prevent SQL injection.")
            pdf.ln(5)
            # Draw a line separator
            pdf.line(10, pdf.get_y(), 200, pdf.get_y())
            pdf.ln(5)
    else:
        pdf.multi_cell(0, 10, "No specific vulnerabilities to report.")

    # 5. Save the File with a CUSTOM NAME
    if not os.path.exists("reports"):
        os.makedirs("reports")
    
    # --- FILENAME LOGIC START ---
    # Convert 'http://localhost:5000/' -> 'localhost_5000'
    clean_name = target_url.replace("http://", "").replace("https://", "")
    # Replace illegal characters (colon, slash, question mark) with underscore
    clean_name = re.sub(r'[\\/*?:"<>|]', '_', clean_name)
    # Remove trailing underscores
    clean_name = clean_name.strip("_")
    
    # Final name format: Audit_localhost_5000.pdf
    filename = f"reports/Audit_{clean_name}.pdf"
    # --- FILENAME LOGIC END ---

    pdf.output(filename)
    return filename