import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Network, Search, AlertTriangle, ShieldCheck, Terminal as TerminalIcon, Route, Bug, Activity, CheckCircle2, ChevronRight, FileJson, Zap, ShieldAlert, Globe, ServerCrash, Download } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ApiFuzzerPage() {
  const [swaggerUrl, setSwaggerUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);

  const [activeTab, setActiveTab] = useState<'terminal' | 'findings'>('terminal');

  // Slowed down the terminal simulation to match the new cinematic bootup
  useEffect(() => {
    if (!isScanning) return;
    
    setLogs([]); // Clear previous logs
    const sequence = [
        "[SYSTEM] Initializing OpenAPI/Swagger Engine...",
        `[NETWORK] Fetching blueprint from: ${swaggerUrl}`,
        "[PARSER] Blueprint loaded. Extracting routing table...",
        "[PARSER] Resolving base URL and authentication schemes...",
        "[SYSTEM] API schema successfully mapped. Commencing Fuzzing...",
        "[FUZZER] Injecting BOLA/IDOR payload matrix...",
        "[FUZZER] Testing endpoints for unauthenticated data exposure...",
        "[FUZZER] Executing API SQLi boundary tests...",
        "[SYSTEM] Audit complete. Compiling threat matrix..."
    ];

    const timeouts: NodeJS.Timeout[] = [];
    let delay = 1500; // Wait 1.5s for the UI to fully "boot" before logging

    sequence.forEach((log) => {
        timeouts.push(setTimeout(() => setLogs(prev => [...prev, log]), delay));
        delay += 1200 + Math.random() * 1000; // Slower typing effect
    });

    return () => timeouts.forEach(clearTimeout);
  }, [isScanning, swaggerUrl]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!swaggerUrl) return;
    
    setIsScanning(true);
    setResults(null);
    setError('');
    setActiveTab('terminal');

    try {
      const response = await fetch('http://127.0.0.1:5000/api/fuzz-api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ swagger_url: swaggerUrl }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to analyze API Blueprint.');
      
      setResults(data);
      if (data.vulnerabilities && data.vulnerabilities.length > 0) {
          setTimeout(() => setActiveTab('findings'), 1500); // Slower tab switch
      }
    } catch (err: any) {
      setError(err.message || 'Connection failed. Ensure backend is running.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleDownload = async () => {
    if (!results) return;
    setIsDownloading(true);
    
    const summary = { high: 0, medium: 0, low: 0 };
    results.vulnerabilities.forEach((v: any) => {
        const sev = v.severity?.toLowerCase();
        if (sev === 'critical' || sev === 'high') summary.high++;
        else if (sev === 'medium') summary.medium++;
        else summary.low++;
    });

    try {
        const response = await fetch('http://127.0.0.1:5000/api/download-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                target: results.target_api, 
                vulnerabilities: results.vulnerabilities,
                summary: summary,
                report_type: 'technical'
            }),
        });

        if (!response.ok) throw new Error('Failed to generate report.');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        const safeName = results.target_api.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        a.download = `Sentinel_API_Audit_${safeName}.pdf`;
        
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    } catch (err: any) {
        setError("Report generation failed: " + err.message);
    } finally {
        setIsDownloading(false);
    }
  };

  const getMethodColor = (method: string) => {
      switch(method.toUpperCase()) {
          case 'GET': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
          case 'POST': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
          case 'PUT': return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30';
          case 'DELETE': return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30';
          case 'PATCH': return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/30';
          default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/30';
      }
  };

  return (
    <div className="min-h-screen bg-background relative flex flex-col pb-16 font-sans">
      <Navbar />
      
      {/* Background Pulse Animation */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.05, 0.15, 0.05] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} // Slower pulse
        className="absolute inset-0 w-full h-full grid-background pointer-events-none dark:opacity-10" 
      />
      
      {/* Perspective wrapper for 3D flip effects */}
      <div className="container relative z-10 mx-auto px-4 pt-12 max-w-7xl flex flex-col gap-6 [perspective:1000px]">
        
        {/* --- HEADER (HUD BOOTUP ANIMATION) --- */}
        <motion.div 
            // Slower duration: 1.5s, less bounce
            initial={{ opacity: 0, rotateX: -30, y: -40, filter: 'blur(15px)', scale: 0.95 }}
            animate={{ opacity: 1, rotateX: 0, y: 0, filter: 'blur(0px)', scale: 1 }}
            transition={{ duration: 1.5, type: 'spring', bounce: 0.2 }}
            className="flex flex-col items-center text-center mb-4 mt-2 origin-top"
        >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 mb-6">
                <Zap className="w-3 h-3 text-purple-600 dark:text-purple-500 animate-pulse" />
                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-500 uppercase tracking-widest">Active API Exploitation</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-foreground mb-6 tracking-tight">
                Advanced API Blueprint <span className="text-purple-600 dark:text-purple-500">Fuzzer</span>
            </h1>
            
            <p className="text-base md:text-lg text-muted-foreground max-w-4xl mb-10 leading-relaxed">
                Modern applications run on APIs, making them the primary target for sophisticated threat actors. Provide a valid OpenAPI or Swagger JSON definition, and Sentinel’s intelligence engine will automatically ingest your routing schema. It dynamically maps all functional endpoints, reverse-engineers expected data structures, and launches high-intensity fuzzing attacks to hunt for critical OWASP API Top 10 vulnerabilities—including Broken Object Level Authorization (BOLA), Unauthenticated Data Exposure, and Mass Assignment flaws.
            </p>

            <form onSubmit={handleScan} className="w-full max-w-3xl relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-1000" />
                <motion.div 
                    // Slower search bar expansion
                    initial={{ width: "60%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.2, delay: 0.6, type: 'spring', bounce: 0.2 }}
                    className="relative flex items-center bg-card border border-border rounded-full p-1.5 shadow-lg mx-auto"
                >
                    <FileJson className="w-5 h-5 text-muted-foreground ml-4 shrink-0" />
                    <input
                        type="text"
                        placeholder="https://petstore.swagger.io/v2/swagger.json"
                        className="w-full bg-transparent border-none focus:outline-none text-foreground px-4 py-3 font-mono text-base placeholder:text-muted-foreground/50"
                        value={swaggerUrl}
                        onChange={(e) => setSwaggerUrl(e.target.value)}
                        disabled={isScanning}
                    />
                    <Button 
                        type="submit" 
                        disabled={isScanning || !swaggerUrl}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-10 rounded-full font-bold tracking-wider text-sm h-12 transition-all"
                    >
                        {isScanning ? 'FUZZING...' : 'INITIATE'}
                    </Button>
                </motion.div>
            </form>
        </motion.div>

        {/* Error State */}
        <AnimatePresence>
            {error && (
                <motion.div 
                    initial={{ opacity: 0, height: 0, filter: 'blur(5px)' }}
                    animate={{ opacity: 1, height: 'auto', filter: 'blur(0px)' }}
                    exit={{ opacity: 0, height: 0, filter: 'blur(5px)' }}
                    transition={{ duration: 0.5 }}
                    className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 p-4 rounded-xl font-mono text-sm flex items-center justify-center gap-3 max-w-3xl mx-auto w-full overflow-hidden"
                >
                    <AlertTriangle className="w-5 h-5 shrink-0" /> {error}
                </motion.div>
            )}
        </AnimatePresence>

        {/* --- TELEMETRY METRICS ROW --- */}
        <AnimatePresence>
            {(isScanning || results) && (
                <motion.div 
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            // Much slower stagger between cards (0.3s instead of 0.15s)
                            transition: { staggerChildren: 0.3, delayChildren: 0.2 } 
                        }
                    }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4"
                >
                    {[
                        { icon: Globe, color: "blue", label: "Target Host", value: results?.target_api || (isScanning ? "Resolving..." : "---") },
                        { icon: Route, color: "purple", label: "Routes Mapped", value: results?.endpoints_mapped || (isScanning ? "..." : "0"), large: true },
                        { icon: Bug, color: results?.vulnerabilities?.length > 0 ? "red" : "emerald", label: "Security Flaws", value: results?.vulnerabilities?.length ?? (isScanning ? "..." : "0"), large: true }
                    ].map((metric, i) => (
                        <motion.div 
                            key={i}
                            variants={{
                                hidden: { opacity: 0, scale: 0.8, filter: 'blur(10px)', y: 20 },
                                visible: { opacity: 1, scale: 1, filter: 'blur(0px)', y: 0, transition: { duration: 1.2, type: 'spring', bounce: 0.3 } }
                            }}
                            className="bg-card border border-border rounded-xl p-5 flex items-center gap-4 shadow-sm"
                        >
                            <div className={cn(
                                "p-3 rounded-lg border",
                                `bg-${metric.color}-500/10 border-${metric.color}-500/20`
                            )}>
                                <metric.icon className={cn("w-6 h-6", `text-${metric.color}-600 dark:text-${metric.color}-400`)} />
                            </div>
                            <div className="overflow-hidden w-full">
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">{metric.label}</p>
                                <p className={cn(
                                    "text-foreground font-mono truncate",
                                    metric.large ? "text-xl font-bold" : "text-sm"
                                )}>
                                    {metric.value}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </AnimatePresence>

        {/* --- MAIN BENTO GRID --- */}
        <AnimatePresence>
            {(isScanning || results) && (
                <motion.div 
                    // Slower grid reveal (1.5s)
                    initial={{ opacity: 0, rotateX: 20, y: 80, scale: 0.95, filter: 'blur(15px)' }}
                    animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, rotateX: -20, y: 80, scale: 0.95, filter: 'blur(15px)' }}
                    transition={{ duration: 1.5, delay: 0.6, type: 'spring', bounce: 0.1 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2 origin-bottom"
                >
                    {/* LEFT COLUMN: API Schema */}
                    <div className="lg:col-span-4 bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden max-h-[800px]">
                        <div className="bg-muted/30 px-5 py-4 border-b border-border flex items-center gap-3 shrink-0">
                            <Network className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <span className="text-sm font-mono text-foreground font-bold">SCHEMA EXPLORER</span>
                        </div>
                        <div className="p-3 overflow-y-auto custom-scrollbar flex-1 space-y-1">
                            {isScanning && !results && (
                                <div className="p-6 text-center text-purple-600/50 dark:text-purple-400/50 font-mono text-sm animate-pulse">
                                    Extracting paths...
                                </div>
                            )}
                            {results?.endpoint_list?.map((ep: any, idx: number) => (
                                <motion.div 
                                    // Slower list pop-in
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: 1.0 + (idx * 0.08) }} 
                                    key={idx} 
                                    className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border group"
                                >
                                    <span className={cn("text-[9px] font-bold px-2 py-1 rounded border uppercase w-14 text-center shrink-0 mt-0.5", getMethodColor(ep.method))}>
                                        {ep.method}
                                    </span>
                                    <span className="font-mono text-xs text-muted-foreground group-hover:text-foreground transition-colors break-all">
                                        {ep.path}
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Terminal + Threats */}
                    <div className="lg:col-span-8 flex flex-col gap-6 max-h-[800px]">
                        
                        {/* TERMINAL CONSOLE */}
                        <motion.div layout className={cn(
                            "bg-card border border-purple-500/30 rounded-xl shadow-sm flex flex-col transition-all duration-700 overflow-hidden shrink-0",
                            results ? "h-48" : "h-full"
                        )}>
                            <div className="bg-muted/30 px-4 py-2 border-b border-purple-500/20 flex flex-wrap gap-2 justify-between items-center shrink-0">
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setActiveTab('terminal')}
                                        className={cn("px-4 py-1.5 rounded-md text-xs font-mono font-bold transition-all flex items-center gap-2", 
                                            activeTab === 'terminal' ? "bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                        )}
                                    >
                                        <TerminalIcon className="w-3.5 h-3.5" /> LIVE LOGS
                                    </button>
                                    <button 
                                        onClick={() => setActiveTab('findings')}
                                        disabled={!results}
                                        className={cn("px-4 py-1.5 rounded-md text-xs font-mono font-bold transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed", 
                                            activeTab === 'findings' ? "bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                        )}
                                    >
                                        <Bug className="w-3.5 h-3.5" /> 
                                        SECURITY FINDINGS
                                        {results?.vulnerabilities?.length > 0 && (
                                            <span className="ml-1 bg-red-500 text-white px-1.5 py-0.5 rounded text-[9px]">
                                                {results.vulnerabilities.length}
                                            </span>
                                        )}
                                    </button>
                                </div>
                                
                                {results && (
                                    <motion.div 
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
                                        className="flex items-center gap-3"
                                    >
                                        <div className="text-xs font-mono text-muted-foreground hidden sm:flex items-center gap-2 bg-background px-3 py-1.5 rounded border border-border">
                                            <span className="text-purple-600 dark:text-purple-400">Target Host:</span> 
                                            <span className="text-foreground truncate max-w-[200px]">{results.target_api}</span>
                                        </div>
                                        <Button
                                            onClick={handleDownload}
                                            disabled={isDownloading}
                                            variant="outline"
                                            size="sm"
                                            className="h-8 px-3 text-xs border-purple-500/50 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 transition-colors"
                                        >
                                            <Download className="w-3 h-3 mr-2" />
                                            {isDownloading ? 'GENERATING...' : 'EXPORT PDF'}
                                        </Button>
                                    </motion.div>
                                )}
                            </div>
                            <div className="p-4 font-mono text-[11px] leading-relaxed text-muted-foreground overflow-y-auto flex-1 custom-scrollbar">
                                {logs.map((log, i) => (
                                    <motion.div 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.3 }}
                                        key={i} 
                                        className="mb-1.5"
                                    >
                                        <span className="text-purple-600 dark:text-purple-500 mr-2">❯</span>
                                        <span className="text-foreground/80">{log}</span>
                                    </motion.div>
                                ))}
                                {isScanning && <div className="animate-pulse text-purple-600 dark:text-purple-500 mt-2">_</div>}
                                {results && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="text-emerald-600 dark:text-emerald-400 mt-4 font-bold">
                                        [✓] Fuzzing sequence completed successfully. Ready for review.
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>

                        {/* THREAT TICKETS */}
                        {results && activeTab === 'findings' && (
                            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                                {results.vulnerabilities.length === 0 ? (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }} className="bg-card border border-emerald-500/30 rounded-xl p-10 flex flex-col items-center justify-center text-center shadow-sm">
                                        <ShieldCheck className="w-16 h-16 text-emerald-600 dark:text-emerald-400 mb-4" />
                                        <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">Zero Anomalies Detected</h3>
                                        <p className="text-muted-foreground text-sm">The targeted API schema withstood all fuzzing payloads without exposing unauthorized data.</p>
                                    </motion.div>
                                ) : (
                                    results.vulnerabilities.map((vuln: any, idx: number) => (
                                        <motion.div 
                                            // Slower ticket reveal
                                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            transition={{ duration: 0.6, delay: idx * 0.15, type: 'spring', bounce: 0.2 }}
                                            key={idx} 
                                            className="bg-card border border-border rounded-xl overflow-hidden shadow-sm group hover:border-purple-500/30 transition-colors"
                                        >
                                            <div className="bg-muted/30 p-4 md:p-5 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                                <div>
                                                    <h3 className="text-lg font-bold text-foreground mb-2">{vuln.type}</h3>
                                                    <div className="inline-flex items-center gap-2 bg-background border border-border px-2.5 py-1 rounded text-xs font-mono text-purple-600 dark:text-purple-400 break-all">
                                                        <ChevronRight className="w-3 h-3 shrink-0" />
                                                        {vuln.url}
                                                    </div>
                                                </div>
                                                <div className={cn(
                                                    "px-3 py-1.5 rounded uppercase tracking-widest text-[10px] font-bold shrink-0 text-center border bg-background",
                                                    vuln.severity === "Critical" ? "text-red-600 dark:text-red-400 border-red-500/20" :
                                                    vuln.severity === "High" ? "text-orange-600 dark:text-orange-400 border-orange-500/20" :
                                                    vuln.severity === "Medium" ? "text-yellow-600 dark:text-yellow-400 border-yellow-500/20" :
                                                    "text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                                )}>
                                                    {vuln.severity} RISK
                                                </div>
                                            </div>

                                            <div className="p-4 md:p-6 space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                                                            <ServerCrash className="w-3.5 h-3.5" /> Exploit Details
                                                        </h4>
                                                        <p className="text-sm text-foreground/80 leading-relaxed mb-4">
                                                            {vuln.description}
                                                        </p>
                                                        <div className="bg-muted/50 border border-border p-3 rounded-lg text-xs font-mono text-foreground/70">
                                                            <span className="text-purple-600 dark:text-purple-400 font-bold">Payload Injection: </span> 
                                                            {vuln.reproduction}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                                                            <ShieldCheck className="w-3.5 h-3.5" /> Required Action
                                                        </h4>
                                                        <p className="text-sm text-foreground/80 leading-relaxed mb-4">
                                                            {vuln.remediation}
                                                        </p>
                                                        {vuln.fix && (
                                                            <div className="bg-muted/50 border border-emerald-500/20 p-3 rounded-lg text-xs font-mono text-emerald-600 dark:text-emerald-400/90 overflow-x-auto shadow-inner">
                                                                <pre><code>{vuln.fix}</code></pre>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

      </div>
    </div>
  );
}