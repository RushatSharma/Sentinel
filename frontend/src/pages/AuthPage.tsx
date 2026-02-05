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
// --- APPWRITE IMPORT ---
import { account } from "../lib/appwrite"; 

ChartJS.register(ArcElement, Tooltip, Legend);

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
        "Launching Playwright Headless Engine...",
        "Phase 1: Auditing Security Headers...",
        "Phase 2: Enumerating Sensitive Files...",
        "Phase 3: Active Browser Fuzzing (SQLi)...",
        "Phase 4: Analyzing DOM states...",
        "Compiling deep analysis report..."
    ] : [
        "Initializing heuristic engines...",
        `Resolving host: ${url}`,
        "Scanning page content for PII...",
        "Checking SSL/TLS configuration...",
        "Injecting Regex SQL Payloads...",
        "Analyzing XSS signatures...",
        "Mapping Shadow APIs...",
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
        const endpoint = mode === 'deep' 
            ? `${API_BASE_URL}/api/deep-scan`
            : `${API_BASE_URL}/api/scan`;

        // --- APPWRITE USER ID CAPTURE ---
        let userId = null;
        try {
            const userSession = await account.get();
            userId = userSession.$id;
        } catch (authErr) {
            console.log("No active session found, scanning as guest.");
        }

        // Send ID to Backend to enable Profile History saving
        const response = await axios.post(endpoint, { 
            url, 
            user_id: userId 
        });
        
        const waitTime = mode === 'deep' ? 1000 : 7500; 
        
        const finalDelay = setTimeout(() => {
            setReport(response.data);
            setLoading(false);
        }, waitTime);
        timeouts.push(finalDelay);

      } catch (err) {
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
      const response = await axios.post(`${API_BASE_URL}/api/download-report`, {
        ...report, 
        report_type: type 
      }, {
        responseType: 'blob',
      });
      
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(new Blob([response.data]));
      link.setAttribute('download', `Sentinel_${type}_Report_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  // --- ANALYSIS LOGIC ---
  const doughnutData = useMemo(() => {
    if (!report) return null;
    const high = report.summary.high;
    const medium = report.summary.medium;
    const low = report.summary.low;
    return {
      labels: ["High", "Medium", "Low"],
      datasets: [{
        data: [high, medium, low],
        backgroundColor: ["#E11D48", "#F97316", "#10B981"],
        borderColor: "transparent",
      }],
    };
  }, [report]);

  const groupedVulnerabilities = useMemo(() => {
    if (!report?.vulnerabilities) return [];
    const groups: { [key: string]: any } = {};
    report.vulnerabilities.forEach((vuln: any) => {
        const key = `${vuln.type}|${vuln.severity}|${vuln.fix}`;
        if (!groups[key]) {
            groups[key] = { ...vuln, groupedDetails: [vuln.details], maxCvss: vuln.cvss || 0 };
        } else {
            if (!groups[key].groupedDetails.includes(vuln.details)) groups[key].groupedDetails.push(vuln.details);
            if (vuln.cvss > groups[key].maxCvss) groups[key].maxCvss = vuln.cvss;
        }
    });
    return Object.values(groups);
  }, [report]);

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 font-mono">
      <div className="z-10 w-full max-w-5xl">
        <div className="mb-8 flex items-center gap-6">
          <div className="w-12 h-12 border-4 border-t-sentinel-blue rounded-full animate-spin" />
          <h2 className="text-2xl font-bold tracking-widest uppercase">Sentinel Scan In Progress</h2>
        </div>
        <div className="bg-[#0f1117] border border-white/10 rounded-xl p-6 h-[400px] overflow-y-auto">
          {scanLogs.map((log, i) => (
            <div key={i} className="text-green-500 mb-1">
               <span className="opacity-50">[{new Date().toLocaleTimeString()}]</span> {log}
            </div>
          ))}
          <div className="animate-pulse text-sentinel-blue">_</div>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <ShieldAlert className="w-16 h-16 text-destructive mb-4" />
      <h1 className="text-2xl font-bold">{error}</h1>
      <Button className="mt-4" onClick={() => navigate("/")}>Return to Base</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold">Mission Report</h1>
            <p className="text-muted-foreground font-mono">{url}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/")}>New Scan</Button>
            <Button onClick={() => handleDownload('technical')} className="bg-sentinel-blue">Technical PDF</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* STATS PANEL */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-sentinel-blue" /> Threat Distribution
              </h3>
              <div className="h-48 flex justify-center relative">
                {doughnutData && <Doughnut data={doughnutData} options={{ cutout: '75%', plugins: { legend: { display: false } } }} />}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{report?.vulnerabilities.length}</span>
                  <span className="text-xs text-muted-foreground uppercase">Threats</span>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-4">
               <Card className="p-4 text-center">
                  <p className="text-xs text-muted-foreground uppercase mb-1">Critical</p>
                  <p className="text-2xl font-bold text-red-500">{report?.summary.high}</p>
               </Card>
               <Card className="p-4 text-center">
                  <p className="text-xs text-muted-foreground uppercase mb-1">Risk Total</p>
                  <p className="text-xl font-bold">${report?.financial_risk_total.toLocaleString()}</p>
               </Card>
            </div>
          </div>

          {/* VULNERABILITY LIST */}
          <div className="lg:col-span-8">
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Severity</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groupedVulnerabilities.map((vuln, idx) => (
                    <>
                      <TableRow key={idx} className="cursor-pointer" onClick={() => toggleRow(idx)}>
                        <TableCell>
                          <span className={cn(
                            "px-2 py-1 rounded text-xs font-bold",
                            vuln.severity === 'Critical' || vuln.severity === 'High' ? "bg-red-500/20 text-red-500" : "bg-yellow-500/20 text-yellow-500"
                          )}>{vuln.severity}</span>
                        </TableCell>
                        <TableCell className="font-medium">{vuln.type}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            {expandedRows.includes(idx) ? <ChevronDown /> : <ChevronRight />}
                          </Button>
                        </TableCell>
                      </TableRow>
                      {expandedRows.includes(idx) && (
                        <TableRow className="bg-muted/30">
                          <TableCell colSpan={3} className="p-6">
                            <div className="space-y-4">
                              <div>
                                <h4 className="text-sm font-bold flex items-center gap-2 mb-2">
                                   <AlertTriangle className="w-4 h-4" /> Found On:
                                </h4>
                                <ul className="text-sm list-disc pl-5">
                                   {vuln.groupedDetails.map((d: string, i: number) => <li key={i}>{d}</li>)}
                                </ul>
                              </div>
                              <div className="bg-[#0f1117] p-4 rounded-lg border border-white/10">
                                 <p className="text-xs text-muted-foreground mb-2 flex items-center gap-2">
                                    <Terminal className="w-3 h-3" /> REMEDIATION_STEPS
                                 </p>
                                 <code className="text-emerald-400 text-sm whitespace-pre-wrap">{vuln.fix}</code>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div className={cn("bg-card border rounded-xl shadow-sm", className)}>
        {children}
    </div>
);