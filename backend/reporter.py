from fpdf import FPDF
import time
import os
import re
import math

class AdvancedPDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 10)
        self.set_text_color(100, 116, 139) # Slate 500
        self.cell(0, 10, 'CONFIDENTIAL SECURITY AUDIT', 0, 0, 'L')
        self.set_text_color(30, 58, 138) # Sentinel Blueish
        self.cell(0, 10, 'SENTINEL INTELLIGENCE', 0, 1, 'R')
        
        self.set_draw_color(30, 58, 138)
        self.set_line_width(0.5)
        self.line(10, 20, 200, 20)
        self.ln(15)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 8)
        self.set_text_color(128, 128, 128)
        self.cell(0, 10, f'Page {self.page_no()}', 0, 0, 'C')

    def draw_metric_card(self, x, y, w, h, title, value, subtitle, color):
        self.set_xy(x, y)
        self.set_fill_color(255, 255, 255)
        self.set_draw_color(226, 232, 240)
        self.rect(x, y, w, h, 'DF')
        self.set_fill_color(*color)
        self.rect(x, y, 2, h, 'F')
        
        self.set_xy(x + 5, y + 5)
        self.set_font('Arial', 'B', 9)
        self.set_text_color(148, 163, 184)
        self.cell(w-10, 5, title.upper(), 0, 2)
        
        self.set_font('Arial', 'B', 16)
        self.set_text_color(15, 23, 42)
        self.cell(w-10, 8, value, 0, 2)
        
        self.set_font('Arial', '', 8)
        self.set_text_color(100, 116, 139)
        self.cell(w-10, 5, subtitle, 0, 0)

    # NEW: Draws a visual stacked bar chart for severity
    def draw_severity_chart(self, x, y, w, h, summary):
        total = summary['high'] + summary['medium'] + summary['low']
        if total == 0: total = 1 # Prevent divide by zero
        
        high_w = (summary['high'] / total) * w
        med_w = (summary['medium'] / total) * w
        low_w = (summary['low'] / total) * w
        
        # Draw Background
        self.set_xy(x, y)
        self.set_fill_color(241, 245, 249)
        self.rect(x, y, w, h, 'F')
        
        # Draw High Segment (Red)
        current_x = x
        if high_w > 0:
            self.set_fill_color(220, 38, 38)
            self.rect(current_x, y, high_w, h, 'F')
            current_x += high_w
            
        # Draw Medium Segment (Orange)
        if med_w > 0:
            self.set_fill_color(249, 115, 22)
            self.rect(current_x, y, med_w, h, 'F')
            current_x += med_w
            
        # Draw Low Segment (Green)
        if low_w > 0:
            self.set_fill_color(22, 163, 74)
            self.rect(current_x, y, low_w, h, 'F')

        # Legend/Labels below chart
        self.set_xy(x, y + h + 2)
        self.set_font('Arial', 'B', 8)
        self.set_text_color(100, 116, 139)
        self.cell(w, 5, f"DISTRIBUTION: {summary['high']} CRITICAL | {summary['medium']} MODERATE | {summary['low']} LOW", 0, 0, 'C')

    def chapter_title(self, label):
        self.set_font('Arial', 'B', 14)
        self.set_text_color(15, 23, 42)
        self.cell(0, 10, label, 0, 1, 'L')
        self.ln(2)

    def body_text(self, text):
        self.set_font('Arial', '', 11)
        self.set_text_color(51, 65, 85)
        self.multi_cell(0, 6, text)
        self.ln()

def calculate_business_metrics(summary):
    financial_risk = (summary['high'] * 50000) + (summary['medium'] * 10000) + (summary['low'] * 1000)
    hours = (summary['high'] * 8) + (summary['medium'] * 4) + (summary['low'] * 1)
    dev_days = max(1, math.ceil(hours / 8))
    
    prob = 5
    if summary['high'] > 0: prob = 95
    elif summary['medium'] > 2: prob = 65
    elif summary['medium'] > 0: prob = 35
    elif summary['low'] > 0: prob = 15
    
    return financial_risk, dev_days, prob

def get_grade_info(summary):
    if summary['high'] > 0:
        return "F", (220, 38, 38), "CRITICAL RISK", "Immediate Action Required"
    elif summary['medium'] > 2:
        return "C", (249, 115, 22), "MODERATE RISK", "Schedule Remediation"
    elif summary['medium'] > 0 or summary['low'] > 0:
        return "B", (234, 179, 8), "LOW RISK", "Monitor & Fix"
    else:
        return "A", (22, 163, 74), "SYSTEM SECURE", "Approved for Deployment"

def get_executive_summary_text(grade):
    if grade == "F":
        return (
            "The application security posture is currently CRITICAL. Multiple high-severity vulnerabilities "
            "were detected that could lead to immediate data breaches, financial loss, or reputational damage. "
            "It is highly recommended to HALT any production deployments until these issues are resolved. "
            "Budget should be allocated for an immediate security sprint."
        )
    elif grade == "C":
        return (
            "The application demonstrates a MODERATE risk profile. While no immediate catastrophic flaws were found, "
            "the cumulative effect of medium-severity issues presents a viable attack surface for determined actors. "
            "Remediation should be prioritized in the upcoming development cycle."
        )
    elif grade == "B":
        return (
            "The application is generally secure with a LOW risk profile. Identified issues are primarily "
            "configuration warnings or best-practice deviations. These should be addressed during regular maintenance "
            "windows to maintain a strong security posture."
        )
    else:
        return (
            "The application meets all defined security baselines. No significant vulnerabilities were detected. "
            "The system is approved for deployment. Continuous monitoring is recommended to ensure this status is maintained."
        )

# NEW: Aggregation Logic for Technical Report
def aggregate_vulnerabilities(vulnerabilities):
    groups = {}
    for v in vulnerabilities:
        # Group key based on Type, Severity, and Fix (Fix implies the root cause)
        key = (v['type'], v['severity'], v['fix'])
        
        if key not in groups:
            groups[key] = {
                'type': v['type'],
                'severity': v['severity'],
                'fix': v['fix'],
                'targets': []
            }
        
        # Add the specific detail (e.g., port number or URL) to the list
        if v['details'] not in groups[key]['targets']:
            groups[key]['targets'].append(v['details'])
            
    return list(groups.values())

def generate_report(report_data, report_type='technical'):
    pdf = AdvancedPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)

    # --- HEADER INFO ---
    report_title = "Executive Security Summary" if report_type == 'executive' else "Technical Vulnerability Report"
    
    pdf.set_font('Arial', 'B', 24)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 10, report_title, 0, 1, 'L')
    
    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(100, 116, 139)
    pdf.cell(0, 6, f"Target: {report_data.get('target', 'Unknown')}", 0, 1, 'L')
    pdf.cell(0, 6, f"Generated: {time.strftime('%Y-%m-%d %H:%M:%S')}", 0, 1, 'L')
    pdf.ln(10)

    # --- GRADE CARD (Shared) ---
    summary = report_data.get('summary', {'high': 0, 'medium': 0, 'low': 0})
    grade, color, grade_title, grade_action = get_grade_info(summary)
    
    pdf.set_fill_color(248, 250, 252)
    pdf.set_draw_color(226, 232, 240)
    pdf.rect(10, pdf.get_y(), 190, 35, 'FD')
    
    current_y = pdf.get_y()
    pdf.set_fill_color(255, 255, 255)
    pdf.set_draw_color(*color)
    pdf.set_line_width(1)
    pdf.ellipse(13, current_y + 5.5, 24, 24, 'FD')
    
    pdf.set_xy(13, current_y + 11)
    pdf.set_font('Arial', 'B', 24)
    pdf.set_text_color(*color)
    pdf.cell(24, 13, grade, 0, 0, 'C')
    
    pdf.set_xy(45, current_y + 8)
    pdf.set_font('Arial', 'B', 14)
    pdf.cell(100, 6, grade_title, 0, 2)
    
    pdf.set_font('Arial', '', 10)
    pdf.set_text_color(71, 85, 105)
    pdf.cell(100, 6, grade_action, 0, 0)
    
    pdf.ln(35) 

    # --- METRICS (Shared) ---
    pdf.ln(5)
    fin_risk, dev_days, prob = calculate_business_metrics(summary)
    
    start_x = 10
    card_w = 60
    card_h = 30
    gap = 5
    y_pos = pdf.get_y()
    
    pdf.draw_metric_card(start_x, y_pos, card_w, card_h, "Est. Financial Risk", f"${fin_risk:,.2f}", "Potential loss exposure", (220, 38, 38))
    pdf.draw_metric_card(start_x + card_w + gap, y_pos, card_w, card_h, "Remediation Effort", f"{dev_days} Days", "Est. developer time", (249, 115, 22))
    pdf.draw_metric_card(start_x + (card_w + gap)*2, y_pos, card_w, card_h, "Breach Probability", f"{prob}%", "Based on severity vectors", (37, 99, 235))
    
    pdf.set_y(y_pos + card_h + 10)

    # ================= EXECUTIVE MODE =================
    if report_type == 'executive':
        pdf.ln(5)
        pdf.chapter_title("Visual Risk Distribution")
        
        # Draw Charts
        chart_y = pdf.get_y()
        pdf.draw_severity_chart(10, chart_y, 190, 8, summary)
        
        pdf.ln(15)
        
        pdf.chapter_title("Strategic Analysis")
        pdf.body_text(get_executive_summary_text(grade))
        
        pdf.ln(5)
        pdf.chapter_title("Business Impact Overview")
        pdf.body_text(
            f"The assessment identified {len(report_data.get('vulnerabilities', []))} unique security findings. "
            f"Of these, {summary['high']} are classified as Critical/High severity. "
            "These vulnerabilities represent direct pathways for attackers to compromise sensitive company data or disrupt services."
        )
        
        pdf.ln(5)
        pdf.chapter_title("Recommended Management Actions")
        pdf.set_font('Arial', '', 11)
        pdf.cell(5, 6, "-", 0, 0)
        pdf.multi_cell(0, 6, "Review the estimated remediation timeline and allocate developer resources accordingly.")
        pdf.cell(5, 6, "-", 0, 0)
        pdf.multi_cell(0, 6, "Prioritize fixing 'Critical' issues before any new feature releases.")
        pdf.cell(5, 6, "-", 0, 0)
        pdf.multi_cell(0, 6, "Schedule a follow-up penetration test once fixes are deployed.")

    # ================= TECHNICAL MODE (Aggregated) =================
    else:
        pdf.ln(5)
        pdf.chapter_title("Technical Findings Matrix")
        
        # Table Header
        pdf.set_font('Arial', 'B', 10)
        pdf.set_fill_color(241, 245, 249)
        pdf.set_text_color(71, 85, 105)
        pdf.cell(15, 10, "#", 1, 0, 'C', 1)
        pdf.cell(30, 10, "Severity", 1, 0, 'C', 1)
        pdf.cell(145, 10, "Vulnerability", 1, 1, 'L', 1)
        
        pdf.set_font('Arial', '', 10)
        pdf.set_text_color(51, 65, 85)
        
        raw_vulnerabilities = report_data.get('vulnerabilities', [])
        
        # AGGREGATE VULNERABILITIES HERE
        grouped_vulnerabilities = aggregate_vulnerabilities(raw_vulnerabilities)
        
        if not grouped_vulnerabilities:
            pdf.ln(10)
            pdf.cell(190, 10, "No vulnerabilities detected.", 1, 1, 'C')
        
        for i, vuln in enumerate(grouped_vulnerabilities, 1):
            sev = vuln['severity']
            if sev == 'Critical': pdf.set_text_color(220, 38, 38)
            elif sev == 'High': pdf.set_text_color(239, 68, 68)
            elif sev == 'Medium': pdf.set_text_color(249, 115, 22)
            else: pdf.set_text_color(22, 163, 74)
            
            pdf.ln(2) 
            
            # Row Info
            pdf.cell(15, 10, str(i), 1, 0, 'C')
            pdf.cell(30, 10, sev.upper(), 1, 0, 'C')
            
            pdf.set_text_color(15, 23, 42)
            
            # Show Count if grouped
            target_count = len(vuln['targets'])
            title_text = f"{vuln['type']}"
            if target_count > 1:
                title_text += f" ({target_count} Instances Detected)"
            
            pdf.cell(145, 10, title_text, 1, 1, 'L')
            
            # Details Block (Listing targets)
            pdf.ln(2)
            pdf.set_x(25)
            pdf.set_font('Arial', '', 9)
            pdf.set_text_color(71, 85, 105)
            
            # Format target list
            if target_count > 1:
                details_text = "Affected Targets:\n" + "\n".join([f"  - {t}" for t in vuln['targets']])
            else:
                details_text = f"Details: {vuln['targets'][0]}"
                
            pdf.multi_cell(175, 5, details_text)
            
            # Code Fix Block
            pdf.ln(2)
            pdf.set_x(25)
            pdf.set_font('Courier', '', 8)
            pdf.set_fill_color(248, 250, 252)
            pdf.set_text_color(22, 163, 74)
            pdf.multi_cell(175, 5, f"Remediation:\n{vuln['fix']}", 1, 'L', True)
            
            pdf.ln(3)
            pdf.set_font('Arial', '', 10) # Reset

    # --- SAVE ---
    if not os.path.exists("reports"):
        os.makedirs("reports")
    
    target_clean = report_data.get('target', 'unknown').replace("http://", "").replace("https://", "")
    clean_name = re.sub(r'[\\/*?:"<>|]', '_', target_clean)
    suffix = "Executive" if report_type == 'executive' else "Technical"
    filename = f"reports/Sentinel_{suffix}_{clean_name}_{int(time.time())}.pdf"
    
    pdf.output(filename)
    return filename