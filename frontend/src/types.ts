export interface ComplianceInfo {
  GDPR?: string;
  OWASP?: string;
  PCI_DSS?: string;
}

export interface Vulnerability {
  type: string;
  details: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  compliance?: ComplianceInfo;
  fix: string;
}

export interface ScanReport {
  target: string;
  vulnerabilities: Vulnerability[];
  summary: {
    high: number;
    medium: number;
    low: number;
  };
}