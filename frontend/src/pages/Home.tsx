import { useState } from "react";
import axios from "axios";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { Search, Activity, Play, Download, CheckCircle, FileText, Lock, Terminal } from "lucide-react";
import type { ScanReport, Vulnerability } from "../types";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

export default function Home() {
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
      const response = await axios.post("http://127.0.0.1:5000/api/scan", { url });
      setReport(response.data);
    } catch (err) {
      setError("Connection Failed. Ensure the Python Backend is running on Port 5000.");
      console.error(err);
    }
    setLoading(false);
  };

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
          backgroundColor: ["#ef4444", "#f97316", "#22c55e"],
          borderColor: "#1e293b",
          borderWidth: 2,
        },
      ],
    };
  };

  return (
    <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* HERO SECTION */}
      <div className="text-center mb-16 space-y-6">
        <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium bg-secondary text-secondary-foreground">
          <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
          Sentinel v2.0 Live
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
          Advanced Security Intelligence
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Deploy heuristic engines to detect SQL Injection, XSS, and Shadow APIs.
          Automated compliance mapping for GDPR & OWASP.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto mt-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Target URL (e.g. http://localhost:5000)" 
              className="pl-10 h-12 bg-secondary/50 border-input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <Button onClick={handleScan} disabled={loading} size="lg" className="h-12 px-8">
            {loading ? <Activity className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
            {loading ? "Scanning..." : "Start Audit"}
          </Button>
        </div>
        {error && <div className="text-destructive font-medium bg-destructive/10 p-3 rounded-lg max-w-lg mx-auto">{error}</div>}
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 space-y-6">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 border-4 border-muted rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin"></div>
            <Lock className="absolute inset-0 m-auto h-8 w-8 text-primary animate-pulse" />
          </div>
          <p className="text-xl font-mono text-primary animate-pulse">Engaging Heuristic Modules...</p>
        </div>
      )}

      {/* RESULTS DASHBOARD */}
      {report && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          
          {/* LEFT COLUMN: STATS */}
          <div className="lg:col-span-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" /> Threat Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative p-2">
                  {getChartData() && <Doughnut data={getChartData()!} options={{ cutout: '75%', plugins: { legend: { display: false } } }} />}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-5xl font-bold">{report.vulnerabilities.length}</span>
                    <span className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Detected</span>
                  </div>
                </div>
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                    <span className="text-sm font-medium">Critical / High</span>
                    <span className="text-destructive font-bold">{report.summary.high}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-secondary/50 rounded-lg">
                    <span className="text-sm font-medium">Medium</span>
                    <span className="text-orange-500 font-bold">{report.summary.medium}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Button onClick={handleDownload} variant="outline" className="w-full h-12 border-primary/20 hover:bg-primary/5">
                  <Download className="mr-2 h-4 w-4" /> Download Full Report
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: VULNERABILITY FEED */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" /> Vulnerability Ledger
              </h2>
              <span className="text-xs font-mono text-muted-foreground px-2 py-1 bg-secondary rounded">LIVE FEED</span>
            </div>

            {report.vulnerabilities.length === 0 ? (
              <Card className="border-green-500/20 bg-green-500/5">
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                  <h3 className="text-2xl font-bold text-green-500">System Secure</h3>
                  <p className="text-muted-foreground mt-2">No active vulnerabilities detected in this scan.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {report.vulnerabilities.map((vuln, idx) => (
                  <VulnerabilityCard key={idx} data={vuln} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const VulnerabilityCard = ({ data }: { data: Vulnerability }) => {
  const severityColor = {
    Critical: "text-destructive border-destructive/30 bg-destructive/5",
    High: "text-destructive border-destructive/30 bg-destructive/5",
    Medium: "text-orange-500 border-orange-500/30 bg-orange-500/5",
    Low: "text-green-500 border-green-500/30 bg-green-500/5"
  };

  return (
    <Card className={`transition-all hover:bg-secondary/40 border-l-4 ${severityColor[data.severity].split(' ')[1]}`}>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h4 className="font-bold text-lg">{data.type}</h4>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${severityColor[data.severity]}`}>
                {data.severity}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{data.details}</p>
          </div>
        </div>

        {data.compliance && (
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.entries(data.compliance).map(([std, code]) => (
              <div key={std} className="px-2 py-1 bg-secondary rounded text-xs flex items-center gap-2 border">
                <Lock className="w-3 h-3 text-muted-foreground" />
                <span className="font-semibold text-muted-foreground">{std}:</span>
                <span className="font-mono">{code}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 bg-black/40 rounded-lg overflow-hidden border">
          <div className="px-4 py-2 bg-secondary/50 border-b flex items-center gap-2">
            <Terminal className="h-3 w-3 text-primary" />
            <span className="text-xs font-mono text-muted-foreground uppercase">Suggested Remediation</span>
          </div>
          <div className="p-4 overflow-x-auto">
            <code className="text-sm font-mono text-primary block">{data.fix}</code>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};