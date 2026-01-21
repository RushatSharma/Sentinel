import { useState } from "react";
import axios from "axios";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { Shield, Search, AlertTriangle, CheckCircle, Lock, Terminal, Activity, FileText, Download } from "lucide-react";
import type { ScanReport, Vulnerability } from "./types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for cleaner tailwind classes (Matches your Nexus project utility)
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

function App() {
  const [url, setUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [report, setReport] = useState<ScanReport | null>(null);
  const [error, setError] = useState<string>("");

  const handleScan = async () => {
    if (!url) return;
    setLoading(true);
    setReport(null);
    setError("");

    try {
      // Connect to Python Backend (Port 5000)
      const response = await axios.post("http://127.0.0.1:5000/api/scan", { url });
      setReport(response.data);
    } catch (err) {
      setError("Connection Failed. Ensure the Python Backend is running on Port 5000.");
      console.error(err);
    }
    setLoading(false);

    const handleDownload = async () => {
  if (!report) return;
  try {
    const response = await axios.post("http://127.0.0.1:5000/api/download-report", report, {
      responseType: 'blob', // Important: Treat response as a file, not JSON
    });

    // Create a fake link to trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Sentinel_Report_${Date.now()}.pdf`);
    document.body.appendChild(link);
    link.click();
  } catch (err) {
    console.error("Download failed", err);
  }
};
  };

  // Prepare Chart Data
  const getChartData = () => {
    if (!report) return null;
    const high = report.vulnerabilities.filter(v => v.severity === "Critical" || v.severity === "High").length;
    const medium = report.vulnerabilities.filter(v => v.severity === "Medium").length;
    const low = report.vulnerabilities.filter(v => v.severity === "Low").length;

    return {
      labels: ["Critical", "Medium", "Low"],
      datasets: [
        {
          data: [high, medium, low],
          backgroundColor: ["#f85149", "#d29922", "#2ea043"],
          borderColor: "#0d1117",
          borderWidth: 2,
        },
      ],
    };
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-gray-300 font-mono">
      
      {/* NAVBAR */}
      <nav className="border-b border-border bg-surface/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="text-primary h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold tracking-wider text-white">SENTINEL<span className="text-primary">AUDIT</span></h1>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-success text-xs font-bold tracking-wide">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            SYSTEM ONLINE
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 lg:p-10 space-y-12">
        
        {/* HERO / SEARCH SECTION */}
        <section className="text-center space-y-8 animate-pulse">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-white">Target Acquisition</h2>
            <p className="text-gray-400 max-w-lg mx-auto">Enter the target URL to initiate deep-scan heuristics, shadow API hunting, and compliance mapping.</p>
          </div>

          <div className="flex flex-col md:flex-row justify-center gap-4 max-w-2xl mx-auto">
            <div className="relative w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors h-5 w-5" />
              <input 
                type="text" 
                placeholder="http://localhost:5000"
                className="w-full bg-surface border border-border rounded-xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
            <button 
              onClick={handleScan}
              disabled={loading}
              className="bg-primary hover:bg-blue-600 disabled:bg-surface disabled:text-gray-500 text-white font-bold py-4 px-8 rounded-xl transition-all flex items-center justify-center gap-3 min-w-[160px]"
            >
              {loading ? <Activity className="animate-spin h-5 w-5" /> : <Terminal className="h-5 w-5" />}
              {loading ? "SCANNING" : "INITIATE"}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-200 rounded-xl max-w-2xl mx-auto flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-danger shrink-0" />
              {error}
            </div>
          )}
        </section>

        {/* LOADING STATE */}
        {loading && (
          <div className="text-center py-20">
            <div className="relative w-24 h-24 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-border rounded-full"></div>
              <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin"></div>
              <Shield className="absolute inset-0 m-auto text-primary h-8 w-8 animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Running Heuristics Engine</h3>
              <p className="text-primary font-mono text-sm">Scanning Ports... Parsing JS... Injecting Payloads...</p>
            </div>
          </div>
        )}

        {/* RESULTS DASHBOARD */}
        {report && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* LEFT COLUMN: STATS & CHART */}
            <div className="space-y-6">
              <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-white">
                  <Activity className="text-primary" /> Threat Assessment
                </h3>
                <div className="relative p-4">
                  {getChartData() && <Doughnut data={getChartData()!} options={{ cutout: '70%', plugins: { legend: { display: false } } }} />}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-4xl font-bold text-white">{report.vulnerabilities.length}</span>
                    <span className="text-xs text-gray-500 uppercase tracking-widest">Issues</span>
                  </div>
                </div>
              </div>

              <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl">
                <h3 className="text-lg font-bold mb-4 text-white">Scan Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                    <span className="text-gray-400">Target</span>
                    <span className="text-primary font-mono text-sm truncate max-w-[150px]">{report.target}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-background rounded-lg border border-border">
                    <span className="text-gray-400">Critical / High</span>
                    <span className="text-danger font-bold">{report.summary.high}</span>
                  </div>
                  <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl space-y-4">
  <h3 className="text-lg font-bold text-white">Actions</h3>
  <button 
    onClick={handleDownload}
    className="w-full bg-surface border border-primary text-primary hover:bg-primary hover:text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
  >
    <Download className="h-5 w-5" />
    Download Detailed Report
  </button>
</div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: VULNERABILITY FEED */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                  <FileText className="text-primary" /> Vulnerability Ledger
                </h3>
                <span className="text-sm text-gray-500 font-mono">LIVE FEED</span>
              </div>
              
              <div className="space-y-4">
                {report.vulnerabilities.length === 0 ? (
                  <div className="p-12 bg-surface/50 border border-success/30 rounded-2xl text-center">
                    <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-success" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Target Secure</h3>
                    <p className="text-gray-400">No known vulnerabilities were detected by the heuristic engine.</p>
                  </div>
                ) : (
                  report.vulnerabilities.map((vuln, idx) => (
                    <VulnerabilityCard key={idx} data={vuln} />
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Sub-component for individual cards
const VulnerabilityCard = ({ data }: { data: Vulnerability }) => {
  const severityStyles = {
    Critical: "border-l-danger bg-red-500/5",
    High: "border-l-danger bg-red-500/5",
    Medium: "border-l-warning bg-orange-500/5",
    Low: "border-l-success bg-green-500/5"
  };

  const badgeStyles = {
    Critical: "bg-danger text-white shadow-lg shadow-red-500/20",
    High: "bg-danger text-white shadow-lg shadow-red-500/20",
    Medium: "bg-warning text-black shadow-lg shadow-orange-500/20",
    Low: "bg-success text-black shadow-lg shadow-green-500/20"
  };

  return (
    <div className={cn(
      "bg-surface border border-border rounded-xl border-l-4 p-6 transition-all hover:bg-surface/80",
      severityStyles[data.severity]
    )}>
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h4 className="font-bold text-lg text-white">{data.type}</h4>
            <span className={cn("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide", badgeStyles[data.severity])}>
              {data.severity}
            </span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">{data.details}</p>
        </div>
      </div>

      {/* COMPLIANCE TAGS */}
      {data.compliance && (
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(data.compliance).map(([std, code]) => (
            <div key={std} className="px-3 py-1.5 bg-background border border-border rounded-lg text-xs flex items-center gap-2">
              <Lock className="w-3 h-3 text-gray-500" />
              <span className="text-gray-400 font-bold">{std}:</span>
              <span className="text-gray-300 font-mono">{code}</span>
            </div>
          ))}
        </div>
      )}

      {/* AUTO FIX BOX */}
      <div className="bg-background/80 rounded-lg border border-border overflow-hidden">
        <div className="px-4 py-2 bg-border/30 border-b border-border flex items-center gap-2">
          <Terminal className="h-3 w-3 text-success" />
          <span className="text-xs font-bold text-gray-300 uppercase">Suggested Remediation</span>
        </div>
        <div className="p-4 overflow-x-auto">
          <code className="text-sm text-primary font-mono block whitespace-pre-wrap">
            {data.fix}
          </code>
        </div>
      </div>
    </div>
  );
};

export default App;