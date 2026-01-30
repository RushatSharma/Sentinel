import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { 
    Activity, ShieldCheck, FileText, Terminal, 
    ShieldAlert, Globe, ChevronDown, ChevronRight, AlertTriangle, CheckCircle2, 
    Server, Radio, Briefcase, DollarSign, Clock, TrendingUp, Fingerprint
} from "lucide-react";
import type { ScanReport } from "../types"; 
import { Button } from "../components/ui/button";
import { Navbar } from "../components/Navbar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { cn } from "../lib/utils";

ChartJS.register(ArcElement, Tooltip, Legend);

// ✅ DEFINING THE API URL DYNAMICALLY
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

export default function ScanResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const url = searchParams.get("url");
  const mode = searchParams.get("mode") || "quick"; 

  const [loading, setLoading] = useState<boolean>(true);
  const [report, setReport] = useState<ScanReport | null>(null);
  const [error, setError] = useState<string>("");
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  
  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  const toggleRow = (idx: number) => {
    setExpandedRows(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  useEffect(() => {
    if (!url) {
        navigate("/");
        return;
    }

    const logs = mode === 'deep' ? [
        "Initializing Deep Scan protocols...",
        `Target: ${url}`,
        "Launching headless browser engine...",
        "Intercepting background network traffic...",
        "Connecting to OWASP ZAP Daemon...",
        "Fuzzing input vectors (Active Scan)...",
        "Analyzing response anomalies...",
        "Compiling deep analysis report..."
    ] : [
        "Initializing heuristic engines...",
        `Resolving host: ${url}`,
        "Scanning page content for PII...",
        "Checking SSL/TLS configuration...",
        "Injecting SQL payloads (Test Mode)...",
        "Analyzing XSS vectors...",
        "Mapping Shadow APIs...",
        "Verifying GDPR compliance...",
        "Calculating financial risk exposure...",
        "Generating final report..."
    ];

    const timeouts: NodeJS.Timeout[] = [];
    let delay = 0;

    logs.forEach((log) => {
      const id = setTimeout(() => {
        setScanLogs(prev => [...prev, `> ${log}`]);
      }, delay);
      timeouts.push(id);
      delay += 800; 
    });

    const fetchScan = async () => {
      try {
        // ✅ FIXED: Using API_BASE_URL instead of localhost
        const endpoint = mode === 'deep' 
            ? `${API_BASE_URL}/api/deep-scan`
            : `${API_BASE_URL}/api/scan`;

        const response = await axios.post(endpoint, { url });
        
        const waitTime = mode === 'deep' ? 1000 : 7500; 
        
        const finalDelay = setTimeout(() => {
            setReport(response.data);
            setLoading(false);
        }, waitTime);
        timeouts.push(finalDelay);

      } catch (err) {
        console.error("Scan failed:", err);
        setError("Connection Failed. Ensure the Sentinel Backend is running.");
        setLoading(false);
      }
    };

    fetchScan();

    return () => timeouts.forEach(clearTimeout);
  }, [url, navigate, mode]);

  const handleDownload = async (type: 'technical' | 'executive') => {
    if (!report) return;
    try {
      // ✅ FIXED: Using API_BASE_URL here too
      const response = await axios.post(`${API_BASE_URL}/api/download-report`, {
        ...report, 
        report_type: type 
      }, {
        responseType: 'blob',
      });
      
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(new Blob([response.data]));
      
      const filename = type === 'executive' 
        ? `Sentinel_Executive_Summary_${Date.now()}.pdf`
        : `Sentinel_Technical_Report_${Date.now()}.pdf`;
        
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  const getDoughnutData = () => {
    if (!report) return null;
    const high = report.vulnerabilities.filter((v: any) => v.severity === "Critical" || v.severity === "High").length;
    const medium = report.vulnerabilities.filter((v: any) => v.severity === "Medium").length;
    const low = report.vulnerabilities.filter((v: any) => v.severity === "Low").length;

    return {
      labels: ["Critical", "Medium", "Low"],
      datasets: [
        {
          data: [high, medium, low],
          backgroundColor: ["#E11D48", "#F97316", "#10B981"],
          borderColor: "transparent",
          hoverOffset: 4
        },
      ],
    };
  };

  const getRiskAssessment = (summary: { high: number; medium: number; low: number }) => {
    if (summary.high > 0) {
        return {
            grade: "F",
            color: "text-destructive",
            bgColor: "bg-destructive/10",
            borderColor: "border-destructive/30",
            title: "Critical Security Risk Detected",
            description: "This application contains severe security flaws that could lead to immediate data theft, financial loss, or total system compromise. It is unsafe for production deployment.",
            action: "IMMEDIATE ACTION REQUIRED"
        };
    } else if (summary.medium > 2) {
        return {
            grade: "C",
            color: "text-orange-500",
            bgColor: "bg-orange-500/10",
            borderColor: "border-orange-500/30",
            title: "Moderate Risk Level",
            description: "Several security gaps were found. While not immediately catastrophic, these issues could be exploited by determined attackers to gain unauthorized access.",
            action: "SCHEDULE REMEDIATION"
        };
    } else if (summary.medium > 0 || summary.low > 0) {
        return {
            grade: "B",
            color: "text-yellow-500",
            bgColor: "bg-yellow-500/10",
            borderColor: "border-yellow-500/30",
            title: "Low Risk - Review Needed",
            description: "The system is generally secure but contains minor configuration issues. These should be fixed during the next maintenance cycle to ensure best practices.",
            action: "MONITOR & FIX"
        };
    } else {
        return {
            grade: "A",
            color: "text-emerald-500",
            bgColor: "bg-emerald-500/10",
            borderColor: "border-emerald-500/30",
            title: "System Secure",
            description: "No significant vulnerabilities were detected. The application security posture is strong and adheres to current safety standards.",
            action: "APPROVED FOR DEPLOYMENT"
        };
    }
  };

  const calculateBusinessMetrics = (reportData: any) => {
    const summary = reportData.summary;
    
    const financialRisk = reportData.financial_risk_total || 
        ((summary.high * 50000) + (summary.medium * 10000) + (summary.low * 1000));
    
    const hours = (summary.high * 8) + (summary.medium * 4) + (summary.low * 1);
    const devDays = Math.max(1, Math.ceil(hours / 8)); 

    let probability = 5; 
    if (summary.high > 0) probability = 95;
    else if (summary.medium > 2) probability = 65;
    else if (summary.medium > 0) probability = 35;
    else if (summary.low > 0) probability = 15;

    return {
        financialRisk: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(financialRisk),
        devDays: devDays,
        probability: probability
    };
  };

  const groupedVulnerabilities = useMemo(() => {
    if (!report?.vulnerabilities) return [];
    const groups: { [key: string]: any } = {};
    
    report.vulnerabilities.forEach((vuln: any) => {
        const key = `${vuln.type}|${vuln.severity}|${vuln.fix}`;
        if (!groups[key]) {
            groups[key] = {
                ...vuln,
                groupedDetails: [vuln.details],
                maxCvss: vuln.cvss || 0 
            };
        } else {
            if (!groups[key].groupedDetails.includes(vuln.details)) {
                groups[key].groupedDetails.push(vuln.details);
            }
            if (vuln.cvss > groups[key].maxCvss) {
                groups[key].maxCvss = vuln.cvss;
            }
        }
    });
    return Object.values(groups);
  }, [report]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden p-4">
        <div className="absolute inset-0 w-full h-full grid-background opacity-50 pointer-events-none" />
        <div className="z-10 w-full max-w-5xl flex flex-col items-center">
          <div className="mb-8 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
             <div className="relative">
                <div className="w-20 h-20 border-4 border-sentinel-blue/30 rounded-full animate-spin-slow" />
                <div className="absolute inset-0 border-t-4 border-sentinel-blue rounded-full animate-spin" />
             </div>
             <div>
               <h2 className="text-4xl font-bold font-display tracking-widest text-foreground">
                 SENTINEL<span className="text-sentinel-blue">scan</span>
               </h2>
               <p className="text-sm text-muted-foreground uppercase tracking-[0.2em] mt-1">
                 {mode === 'deep' ? "Deep Analysis in Progress" : "Heuristic Audit in Progress"}
               </p>
             </div>
          </div>
          <div className="w-full bg-[#0f1117] border border-white/10 rounded-xl shadow-2xl overflow-hidden relative group">
            <div className="flex items-center justify-between px-4 py-3 bg-[#1a1d26] border-b border-white/5">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                </div>
                <div className="text-xs font-mono text-gray-400">root@sentinel-node:~/audit</div>
            </div>
            <div className="p-6 h-[500px] overflow-y-auto font-mono text-sm relative custom-scrollbar">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[1] pointer-events-none opacity-20 bg-[length:100%_2px,3px_100%]" />
                {scanLogs.map((log, i) => (
                <div key={i} className="mb-2 last:animate-pulse text-green-500">
                    <span className="text-sentinel-blue mr-3 opacity-70">[{new Date().toLocaleTimeString()}]</span>
                    {log}
                </div>
                ))}
                <div className="animate-pulse text-sentinel-blue mt-2">_</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <ShieldAlert className="w-20 h-20 text-destructive mb-6" />
            <h1 className="text-3xl font-bold mb-2">Audit Failed</h1>
            <p className="text-muted-foreground mb-8">{error}</p>
            <Button onClick={() => navigate("/")}>Return to Base</Button>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-display font-bold flex items-center gap-3">
                    Mission Report <span className="text-muted-foreground text-lg font-normal">#SNT-{Date.now().toString().slice(-6)}</span>
                </h1>
                <p className="text-muted-foreground flex items-center gap-2 mt-1 font-mono text-sm">
                    <Globe className="w-4 h-4" /> {url} 
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-secondary text-[10px] uppercase border">
                        {mode} Mode
                    </span>
                </p>
            </div>
            <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => navigate("/")}>New Scan</Button>
                
                <Button 
                    onClick={() => handleDownload('technical')} 
                    className="bg-sentinel-blue hover:bg-sentinel-blue/90 text-white shadow-lg shadow-sentinel-blue/20"
                >
                    <Terminal className="w-4 h-4 mr-2" /> Technical Report
                </Button>

                <Button 
                    onClick={() => handleDownload('executive')} 
                    className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-500/20"
                >
                    <Briefcase className="w-4 h-4 mr-2" /> Executive Summary
                </Button>
            </div>
        </div>

        {/* HUD STATS STRIP */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 mb-8 border rounded-xl bg-card/50 backdrop-blur-sm overflow-hidden divide-x divide-y md:divide-y-0">
            <div className="p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Total Threats</span>
                <span className="text-4xl font-bold font-display">{report?.vulnerabilities.length}</span>
            </div>
            <div className="p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Critical Risks</span>
                <span className="text-4xl font-bold font-display text-sentinel-red">{report?.summary.high}</span>
            </div>
            <div className="p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Server Status</span>
                <span className="text-xl font-bold font-mono text-emerald-500 flex items-center gap-2">
                    ONLINE <Activity className="w-4 h-4 animate-pulse" />
                </span>
            </div>
            <div className="p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">Compliance</span>
                <span className="text-4xl font-bold font-display text-orange-500">84%</span>
            </div>
        </div>

        {/* EXECUTIVE SUMMARY & BUSINESS IMPACT */}
        {report && (
            <div className="mb-8 space-y-6">
                <div className={cn("border-2 rounded-xl p-6 shadow-sm relative overflow-hidden flex flex-col md:flex-row gap-6 items-center", 
                    getRiskAssessment(report.summary).bgColor, 
                    getRiskAssessment(report.summary).borderColor
                )}>
                    <div className={cn("w-24 h-24 rounded-full border-4 flex items-center justify-center bg-background shrink-0 shadow-lg", 
                        getRiskAssessment(report.summary).color,
                        getRiskAssessment(report.summary).borderColor
                    )}>
                        <span className="text-5xl font-display font-bold">{getRiskAssessment(report.summary).grade}</span>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                            <Briefcase className={cn("w-5 h-5", getRiskAssessment(report.summary).color)} />
                            <h3 className={cn("text-xl font-bold uppercase tracking-wide", getRiskAssessment(report.summary).color)}>
                                {getRiskAssessment(report.summary).title}
                            </h3>
                        </div>
                        <p className="text-muted-foreground text-lg leading-relaxed max-w-4xl">
                            {getRiskAssessment(report.summary).description}
                        </p>
                    </div>
                    <div className={cn("px-4 py-2 rounded-lg border-2 font-bold uppercase tracking-wider text-sm whitespace-nowrap bg-background shadow-sm", 
                         getRiskAssessment(report.summary).color,
                         getRiskAssessment(report.summary).borderColor
                    )}>
                        {getRiskAssessment(report.summary).action}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-card border rounded-xl p-5 flex items-center gap-4 shadow-sm hover:border-sentinel-blue/50 transition-colors">
                        <div className="p-3 bg-destructive/10 rounded-full">
                            <DollarSign className="w-6 h-6 text-destructive" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Est. Financial Exposure</p>
                            <p className="text-2xl font-bold font-display">{calculateBusinessMetrics(report).financialRisk}</p>
                            <p className="text-xs text-muted-foreground">Real-time CVSS Valuation</p>
                        </div>
                    </div>
                    <div className="bg-card border rounded-xl p-5 flex items-center gap-4 shadow-sm hover:border-sentinel-blue/50 transition-colors">
                        <div className="p-3 bg-orange-500/10 rounded-full">
                            <Clock className="w-6 h-6 text-orange-500" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Remediation Effort</p>
                            <p className="text-2xl font-bold font-display">{calculateBusinessMetrics(report).devDays} Days</p>
                            <p className="text-xs text-muted-foreground">Estimated dev time to fix</p>
                        </div>
                    </div>
                    <div className="bg-card border rounded-xl p-5 flex items-center gap-4 shadow-sm hover:border-sentinel-blue/50 transition-colors">
                        <div className="p-3 bg-sentinel-blue/10 rounded-full">
                            <TrendingUp className="w-6 h-6 text-sentinel-blue" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">Breach Probability</p>
                            <p className="text-2xl font-bold font-display">{calculateBusinessMetrics(report).probability}%</p>
                            <p className="text-xs text-muted-foreground">Based on severity vectors</p>
                        </div>
                    </div>
                </div>
            </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT PANEL: INTELLIGENCE */}
            <div className="lg:col-span-5 space-y-6">
                
                {/* 1. Threat Distribution Chart */}
                <div className="bg-card border rounded-xl p-6 shadow-sm">
                    <h3 className="font-semibold mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-sentinel-blue" /> Threat Distribution
                    </h3>
                    <div className="flex justify-center mb-6">
                        <div className="w-48 h-48 relative">
                             {getDoughnutData() && <Doughnut data={getDoughnutData()!} options={{ cutout: '75%', plugins: { legend: { display: false } } }} />}
                             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-3xl font-bold">{report?.vulnerabilities.length}</span>
                                <span className="text-xs text-muted-foreground uppercase">Issues</span>
                             </div>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm p-2 bg-muted/30 rounded">
                            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-sentinel-red" /> Critical / High</span>
                            <span className="font-mono font-bold">{report?.summary.high}</span>
                        </div>
                        <div className="flex justify-between text-sm p-2 bg-muted/30 rounded">
                            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-orange-500" /> Medium</span>
                            <span className="font-mono font-bold">{report?.summary.medium}</span>
                        </div>
                        <div className="flex justify-between text-sm p-2 bg-muted/30 rounded">
                            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Low</span>
                            <span className="font-mono font-bold">{report?.summary.low}</span>
                        </div>
                    </div>
                </div>

                {/* 2. Side-by-Side Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col h-full">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-emerald-500" /> Compliance
                        </h3>
                        <div className="space-y-4 flex-1">
                            <div>
                                <div className="flex justify-between mb-1 text-xs font-medium">
                                    <span>GDPR (EU)</span>
                                    <span className="text-orange-500">Review</span>
                                </div>
                                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-500 w-[70%]" />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-1 text-xs font-medium">
                                    <span>PCI-DSS</span>
                                    <span className="text-emerald-500">Passing</span>
                                </div>
                                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-[92%]" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-card border rounded-xl p-6 shadow-sm flex flex-col h-full">
                        <h3 className="font-semibold mb-4 flex items-center gap-2">
                            <Server className="w-5 h-5 text-blue-500" /> Network
                        </h3>
                        <div className="space-y-3 flex-1">
                            <div className="flex justify-between items-center text-sm border-b border-border/50 pb-2">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Globe className="w-3 h-3" /> Port 443
                                </span>
                                <span className="text-emerald-500 font-mono text-xs bg-emerald-500/10 px-1.5 py-0.5 rounded">SECURE</span>
                            </div>
                            <div className="flex justify-between items-center text-sm border-b border-border/50 pb-2">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Radio className="w-3 h-3" /> Port 80
                                </span>
                                <span className="text-orange-500 font-mono text-xs bg-orange-500/10 px-1.5 py-0.5 rounded">OPEN</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground flex items-center gap-2">
                                    <Terminal className="w-3 h-3" /> SSH
                                </span>
                                <span className="text-muted-foreground font-mono text-xs">FILTERED</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL: THREAT MATRIX (GROUPED & CLEANER) */}
            <div className="lg:col-span-7">
                <div className="bg-card border rounded-xl shadow-sm overflow-hidden lg:h-[700px] flex flex-col">
                    <div className="px-6 py-4 border-b flex justify-between items-center bg-muted/20 shrink-0">
                        <h2 className="font-bold flex items-center gap-2">
                            <FileText className="w-5 h-5 text-sentinel-blue" /> Vulnerability Matrix
                        </h2>
                        <span className="text-xs font-mono text-muted-foreground px-2 py-1 bg-background border rounded">
                            {groupedVulnerabilities.length} UNIQUE THREATS
                        </span>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[100px]">Severity</TableHead>
                                    <TableHead>Vulnerability Type</TableHead>
                                    <TableHead className="hidden md:table-cell">Compliance</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {groupedVulnerabilities.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                            No vulnerabilities detected. System is secure.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    groupedVulnerabilities.map((vuln: any, idx: number) => (
                                        <>
                                            <TableRow 
                                                key={idx} 
                                                className={cn(
                                                    "cursor-pointer hover:bg-muted/50 transition-colors",
                                                    expandedRows.includes(idx) && "bg-muted/30"
                                                )}
                                                onClick={() => toggleRow(idx)}
                                            >
                                                <TableCell>
                                                    <BadgeSeverity severity={vuln.severity} />
                                                </TableCell>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        {vuln.type === "PII Exposure" && <Fingerprint className="w-4 h-4 text-purple-500" />}
                                                        {vuln.type === "Network Exposure" && <Globe className="w-4 h-4 text-blue-500" />}
                                                        <span>{vuln.type}</span>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground md:hidden mt-1 line-clamp-1">
                                                        {vuln.groupedDetails.length > 1 
                                                            ? `${vuln.groupedDetails.length} instances detected` 
                                                            : vuln.groupedDetails[0]}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    {vuln.compliance && Object.keys(vuln.compliance).length > 0 ? (
                                                        <div className="flex gap-2">
                                                            {Object.keys(vuln.compliance).map(k => (
                                                                <span key={k} className="text-[10px] border px-1.5 py-0.5 rounded bg-background uppercase text-muted-foreground">{k}</span>
                                                            ))}
                                                        </div>
                                                    ) : <span className="text-muted-foreground">-</span>}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                        {expandedRows.includes(idx) ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                            
                                            {/* EXPANDED ROW CONTENT */}
                                            {expandedRows.includes(idx) && (
                                                <TableRow className="bg-muted/10 hover:bg-muted/10">
                                                    <TableCell colSpan={4} className="p-0">
                                                        <div className="p-6 border-b space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                                <div className="space-y-2">
                                                                    <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                                                                        <AlertTriangle className="w-4 h-4" /> Affected Targets
                                                                    </h4>
                                                                    <div className="text-sm max-h-32 overflow-y-auto bg-background/50 p-2 rounded border">
                                                                        {vuln.groupedDetails.length > 1 ? (
                                                                            <ul className="list-disc pl-4 space-y-1">
                                                                                {vuln.groupedDetails.map((d: string, i: number) => (
                                                                                    <li key={i}>{d}</li>
                                                                                ))}
                                                                            </ul>
                                                                        ) : (
                                                                            <p>{vuln.groupedDetails[0]}</p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-3">
                                                                    <h4 className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                                                                        <CheckCircle2 className="w-4 h-4" /> Impact Analysis
                                                                    </h4>
                                                                    {/* CVSS Badge */}
                                                                    {vuln.maxCvss > 0 && (
                                                                        <div className="flex items-center gap-2 mb-2">
                                                                            <span className="text-xs font-mono font-bold bg-slate-800 text-white px-2 py-1 rounded">
                                                                                CVSS {vuln.maxCvss}
                                                                            </span>
                                                                            <span className="text-xs text-muted-foreground">Severity Score</span>
                                                                        </div>
                                                                    )}
                                                                    <p className="text-sm leading-relaxed">
                                                                        {vuln.severity === 'Critical' ? 'Immediate exploitation possible. Data loss imminent. This vulnerability enables remote code execution or direct database access.' : 
                                                                         vuln.severity === 'High' ? 'Significant risk to integrity and availability. Attackers could manipulate data or deny service to legitimate users.' :
                                                                         'Moderate risk. While not immediately exploitable without other factors, it violates security best practices and should be remediated in the next sprint.'}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            {/* Terminal Code Block */}
                                                            <div className="mt-4">
                                                                <div className="flex items-center justify-between bg-[#1a1d26] px-4 py-2 rounded-t-lg border border-b-0 border-white/10">
                                                                    <span className="text-xs font-mono text-gray-400 flex items-center gap-2">
                                                                        <Terminal className="w-3 h-3" /> REMEDIATION_PROTOCOL.sh
                                                                    </span>
                                                                    <span className="text-[10px] text-gray-500">BASH</span>
                                                                </div>
                                                                <div className="bg-[#0f1117] p-4 rounded-b-lg border border-white/10 overflow-x-auto">
                                                                    <code className="text-sm font-mono text-emerald-400 whitespace-pre-wrap">
                                                                        {vuln.fix}
                                                                    </code>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}

// Helper for Severity Badges
const BadgeSeverity = ({ severity }: { severity: string }) => {
    const styles: any = {
        Critical: "bg-red-500/15 text-red-600 border-red-500/20",
        High: "bg-orange-500/15 text-orange-600 border-orange-500/20",
        Medium: "bg-yellow-500/15 text-yellow-600 border-yellow-500/20",
        Low: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20"
    };

    return (
        <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase", styles[severity] || "bg-gray-500/15 text-gray-600 border-gray-500/20")}>
            {severity}
        </span>
    );
};