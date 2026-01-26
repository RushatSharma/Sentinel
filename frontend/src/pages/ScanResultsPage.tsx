import { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { Activity, Download, ShieldCheck, FileText, Lock, Terminal, ShieldAlert, Globe } from "lucide-react";
import type { ScanReport } from "../types"; 
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Navbar } from "../components/Navbar";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function ScanResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const url = searchParams.get("url");

  const [loading, setLoading] = useState<boolean>(true);
  const [report, setReport] = useState<ScanReport | null>(null);
  const [error, setError] = useState<string>("");
  const [scanLogs, setScanLogs] = useState<string[]>([]);

  // Simulated Scanning Effect
  useEffect(() => {
    if (!url) {
        navigate("/");
        return;
    }

    const logs = [
      "Initializing heuristic engines...",
      `Resolving host: ${url}`,
      "Checking SSL/TLS configuration...",
      "Injecting SQL payloads (Test Mode)...",
      "Analyzing XSS vectors...",
      "Mapping Shadow APIs...",
      "Verifying GDPR compliance...",
      "Generating final report..."
    ];

    // Store timeout IDs for cleanup to prevent duplicate lines
    const timeouts: NodeJS.Timeout[] = [];
    let delay = 0;

    logs.forEach((log) => {
      const id = setTimeout(() => {
        setScanLogs(prev => [...prev, `> ${log}`]);
      }, delay);
      timeouts.push(id);
      delay += 800; // Stagger logs
    });

    // Actual Backend Call
    const fetchScan = async () => {
      try {
        const response = await axios.post("http://127.0.0.1:5000/api/scan", { url });
        
        // Wait for animation to feel "complete" before showing results
        const finalDelay = setTimeout(() => {
            setReport(response.data);
            setLoading(false);
        }, 6500);
        timeouts.push(finalDelay);

      } catch (err) {
        setError("Connection Failed. Ensure the Sentinel Backend is running.");
        setLoading(false);
      }
    };

    fetchScan();

    // CLEANUP FUNCTION: Clears timers on unmount to fix duplicate lines
    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [url, navigate]);

  const handleDownload = async () => {
    if (!report) return;
    try {
      const response = await axios.post("http://127.0.0.1:5000/api/download-report", report, {
        responseType: 'blob',
      });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(new Blob([response.data]));
      link.setAttribute('download', `Sentinel_Report_${Date.now()}.pdf`);
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
          backgroundColor: ["#ef4444", "#f97316", "#22c55e"], // Red, Orange, Green
          borderColor: "transparent",
          hoverOffset: 4
        },
      ],
    };
  };

  // --- RENDERING LOADING STATE (Cyberpunk Terminal) ---
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden p-4">
        {/* Background Grid - Adapted for Theme */}
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
                 Heuristic Audit in Progress
               </p>
             </div>
          </div>

          {/* Expanded Console Window */}
          <div className="w-full bg-[#0f1117] border border-white/10 rounded-xl shadow-2xl overflow-hidden relative group">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#1a1d26] border-b border-white/5">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                </div>
                <div className="text-xs font-mono text-gray-400">root@sentinel-node:~/audit</div>
            </div>

            {/* Terminal Content */}
            <div className="p-6 h-[500px] overflow-y-auto font-mono text-sm relative custom-scrollbar">
                {/* Scanlines Effect */}
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

  // --- RENDERING ERROR STATE ---
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

  // --- RENDERING DASHBOARD (The Heart) ---
  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
                <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl font-display font-bold">Audit Report</h1>
                    <span className="px-3 py-1 bg-sentinel-blue/10 text-sentinel-blue border border-sentinel-blue/20 rounded-full text-xs font-mono uppercase tracking-wider">
                        Completed
                    </span>
                </div>
                <p className="text-muted-foreground flex items-center gap-2">
                    <Globe className="w-4 h-4" /> Target: <span className="text-foreground font-mono">{url}</span>
                </p>
            </div>
            <div className="flex gap-3">
                <Button variant="outline" onClick={() => navigate("/")}>New Scan</Button>
                <Button onClick={handleDownload} className="bg-sentinel-blue hover:bg-sentinel-blue/90 text-white shadow-lg shadow-sentinel-blue/20">
                    <Download className="w-4 h-4 mr-2" /> Download PDF
                </Button>
            </div>
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            {/* Stat 1: Total Vulns */}
            <Card className="glass-card border-l-4 border-l-sentinel-blue">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Vulnerabilities</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold">{report?.vulnerabilities.length}</div>
                    <p className="text-xs text-muted-foreground mt-1">Across 4 heuristic engines</p>
                </CardContent>
            </Card>

            {/* Stat 2: High Risks */}
            <Card className="glass-card border-l-4 border-l-destructive">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Critical Risks</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold text-destructive">
                        {report?.summary.high}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Requires immediate attention</p>
                </CardContent>
            </Card>

             {/* Stat 3: Server Info */}
             <Card className="glass-card border-l-4 border-l-emerald-500">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Server Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-emerald-500 flex items-center gap-2">
                        Online <Activity className="w-5 h-5 animate-pulse" />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Response time: 42ms</p>
                </CardContent>
            </Card>

             {/* Stat 4: Compliance */}
             <Card className="glass-card border-l-4 border-l-orange-500">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Compliance Score</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold text-orange-500">
                        84<span className="text-xl text-muted-foreground">/100</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">GDPR & PCI-DSS check</p>
                </CardContent>
            </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Charts & Overview */}
            <div className="space-y-8">
                <Card className="glass-card h-fit">
                    <CardHeader>
                        <CardTitle>Threat Distribution</CardTitle>
                        <CardDescription>Breakdown by severity</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center p-6">
                        <div className="w-48 h-48 relative">
                             {getDoughnutData() && <Doughnut data={getDoughnutData()!} options={{ cutout: '70%', plugins: { legend: { display: false } } }} />}
                             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <ShieldAlert className="w-8 h-8 text-muted-foreground/50" />
                             </div>
                        </div>
                    </CardContent>
                    <CardContent className="pt-0">
                         <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-destructive" /> Critical</div>
                                <span className="font-bold">{report?.summary.high}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500" /> Medium</div>
                                <span className="font-bold">{report?.summary.medium}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /> Low</div>
                                <span className="font-bold">{report?.summary.low}</span>
                            </div>
                         </div>
                    </CardContent>
                </Card>

                {/* Compliance Card */}
                <Card className="glass-card">
                    <CardHeader>
                        <CardTitle>Regulatory Map</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-3 border rounded-lg bg-secondary/20">
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-semibold">GDPR (EU)</span>
                                <span className="text-sm text-destructive">2 Violations</span>
                            </div>
                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-destructive w-[70%]" />
                            </div>
                        </div>
                        <div className="p-3 border rounded-lg bg-secondary/20">
                            <div className="flex justify-between mb-1">
                                <span className="text-sm font-semibold">OWASP Top 10</span>
                                <span className="text-sm text-orange-500">4 Warnings</span>
                            </div>
                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-orange-500 w-[50%]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Right Column: Vulnerability Ledger (The Feed) */}
            <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b">
                    <FileText className="w-5 h-5 text-sentinel-blue" />
                    <h2 className="text-xl font-bold">Vulnerability Ledger</h2>
                </div>

                {report?.vulnerabilities.length === 0 ? (
                    <Card className="border-emerald-500/20 bg-emerald-500/5">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                                <ShieldCheck className="h-8 w-8 text-emerald-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-emerald-500">System Secure</h3>
                            <p className="text-muted-foreground mt-2 max-w-md">
                                No active vulnerabilities detected in this scan. Your perimeter appears secure against standard heuristic vectors.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {report?.vulnerabilities.map((vuln: any, idx: number) => (
                            <VulnerabilityCard key={idx} data={vuln} />
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}

// Sub-component for individual cards
const VulnerabilityCard = ({ data }: { data: any }) => {
  const severityStyles: any = {
    Critical: "border-l-destructive bg-destructive/5",
    High: "border-l-destructive bg-destructive/5",
    Medium: "border-l-orange-500 bg-orange-500/5",
    Low: "border-l-emerald-500 bg-emerald-500/5"
  };

  const badgeStyles: any = {
    Critical: "bg-destructive text-destructive-foreground",
    High: "bg-destructive text-destructive-foreground",
    Medium: "bg-orange-500 text-white",
    Low: "bg-emerald-500 text-white"
  };

  return (
    <Card className={`glass-card border-l-4 shadow-sm hover:shadow-md transition-all duration-300 ${severityStyles[data.severity] || "border-l-gray-500"}`}>
        <CardContent className="p-6">
            <div className="flex justify-between items-start gap-4 mb-3">
                <div>
                    <h3 className="font-bold text-lg text-foreground">{data.type}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{data.details}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${badgeStyles[data.severity] || "bg-gray-500"}`}>
                    {data.severity}
                </span>
            </div>

            {/* Compliance Tags */}
            {data.compliance && Object.keys(data.compliance).length > 0 && (
                 <div className="flex flex-wrap gap-2 mb-4 mt-3">
                    {Object.entries(data.compliance).map(([std, code]) => (
                        <div key={std} className="flex items-center gap-1.5 px-2 py-1 bg-background border rounded text-[10px] font-mono text-muted-foreground">
                            <Lock className="w-3 h-3" />
                            <span className="font-semibold">{std}:</span> {String(code)}
                        </div>
                    ))}
                 </div>
            )}

            {/* Terminal Fix Section */}
            <div className="mt-4 bg-[#0f1117] rounded-md border border-white/10 overflow-hidden">
                <div className="px-3 py-1.5 bg-white/5 border-b border-white/5 flex items-center gap-2">
                    <Terminal className="w-3 h-3 text-sentinel-blue" />
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">Remediation Protocol</span>
                </div>
                <div className="p-3 overflow-x-auto">
                    <code className="text-sm font-mono text-emerald-400 block whitespace-pre-wrap">
                        {data.fix}
                    </code>
                </div>
            </div>
        </CardContent>
    </Card>
  );
};