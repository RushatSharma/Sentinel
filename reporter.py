from fpdf import FPDF
import time
import os
import re

class AdvancedPDF(FPDF):
    def header(self):
        # Professional Header
        self.set_font('Arial', 'B', 10)
        self.set_text_color(128, 128, 128) # Grey
        self.cell(0, 10, 'CONFIDENTIAL SECURITY AUDIT', 0, 0, 'L')
        self.cell(0, 10, 'SENTINEL AUDIT v2.0', 0, 1, 'R')
        self.line(10, 20, 200, 20)
        self.ln(15)

    def footer(self):
        # Page Numbers
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

    def chapter_title(self, title):
        self.set_font('Arial', 'B', 14)
        self.set_fill_color(240, 240, 240) # Light Grey
        self.set_text_color(0, 0, 0)
        self.cell(0, 10, title, 0, 1, 'L', 1)
        self.ln(5)

    def chapter_body(self, body):
        self.set_font('Arial', '', 11)
        self.multi_cell(0, 6, body)
        self.ln()

def generate_report(report_data):
    pdf = AdvancedPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)

    # --- TITLE PAGE ---
    pdf.set_font('Arial', 'B', 24)
    pdf.set_text_color(44, 62, 80) # Dark Blue
    pdf.cell(0, 40, "Security Assessment Report", 0, 1, 'C')
    
    pdf.set_font('Arial', '', 14)
    pdf.cell(0, 10, f"Target: {report_data['target']}", 0, 1, 'C')
    pdf.cell(0, 10, f"Date: {time.strftime('%Y-%m-%d %H:%M:%S')}", 0, 1, 'C')
    pdf.ln(20)

    # Executive Summary Box
    pdf.set_fill_color(255, 244, 229) # Light Orange background
    pdf.rect(10, pdf.get_y(), 190, 40, 'F')
    pdf.set_y(pdf.get_y() + 5)
    pdf.set_x(15)
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 10, "Executive Summary", 0, 1)
    
    summary = report_data['summary']
    summary_text = (
        f"SentinelAudit identified {len(report_data['vulnerabilities'])} issues.\n"
        f"Critical/High Risks: {summary['high']}  |  Medium Risks: {summary['medium']}  |  Low Risks: {summary['low']}"
    )
    pdf.set_x(15)
    pdf.set_font('Arial', '', 11)
    pdf.multi_cell(180, 6, summary_text)
    pdf.ln(25)

    # --- DETAILED FINDINGS ---
    for i, vuln in enumerate(report_data['vulnerabilities'], 1):
        # Title Bar with Severity Color
        pdf.set_font('Arial', 'B', 12)
        if vuln['severity'] in ['Critical', 'High']:
            pdf.set_text_color(204, 0, 0) # Red
        elif vuln['severity'] == 'Medium':
            pdf.set_text_color(204, 102, 0) # Orange
        else:
            pdf.set_text_color(0, 128, 0) # Green
            
        pdf.cell(0, 10, f"#{i}: {vuln['type']} ({vuln['severity']})", 0, 1)
        pdf.set_text_color(0, 0, 0) # Reset to black

        # Details
        pdf.set_font('Arial', 'B', 10)
        pdf.cell(0, 6, "Technical Details:", 0, 1)
        pdf.set_font('Arial', '', 10)
        pdf.multi_cell(0, 6, vuln['details'])
        pdf.ln(2)

        # Compliance
        if vuln.get('compliance'):
            pdf.set_font('Arial', 'B', 10)
            pdf.cell(0, 6, "Compliance Violations:", 0, 1)
            pdf.set_font('Courier', '', 9) # Monospace for data
            for std, code in vuln['compliance'].items():
                pdf.cell(0, 5, f" - {std}: {code}", 0, 1)
            pdf.ln(2)

        # Fix
        pdf.set_font('Arial', 'B', 10)
        pdf.set_text_color(0, 102, 204) # Blue for Fix
        pdf.cell(0, 6, "Remediation Strategy:", 0, 1)
        pdf.set_font('Courier', '', 9)
        pdf.set_fill_color(245, 245, 245) # Light grey box
        pdf.multi_cell(0, 6, vuln['fix'], 1, 'L', True)
        
        pdf.ln(10)
        pdf.set_text_color(0, 0, 0)

    # --- SAVE FILE ---
    if not os.path.exists("reports"):
        os.makedirs("reports")
    
    clean_name = re.sub(r'[\\/*?:"<>|]', '_', report_data['target'].replace("http://", "").replace("https://", ""))
    filename = f"reports/Audit_{clean_name}_{int(time.time())}.pdf"
    pdf.output(filename)
    return filename