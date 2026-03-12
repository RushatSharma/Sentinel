import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Radar, Search, Server, Activity, AlertTriangle, ShieldCheck, Terminal as TerminalIcon, Map, Crosshair, ArrowRight, ShieldAlert, Info } from 'lucide-react';
import { cn } from '../lib/utils';

export default function ReconPage() {
  const [domain, setDomain] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  
  // State for the Master-Detail view
  const [activeNodeIdx, setActiveNodeIdx] = useState<number | null>(null);

  // Simulates terminal output while the backend is doing heavy lifting
  useEffect(() => {
    if (!isScanning) return;
    
    setLogs(["[SYSTEM] Initializing OSINT Mapping Protocol..."]);
    const sequence = [
        `[OSINT] Target acquired: ${domain}`,
        "[OSINT] Querying AlienVault OTX Passive DNS...",
        "[OSINT] Extracting HackerTarget API host records...",
        "[OSINT] Scraping Global Certificate Transparency Logs (crt.sh)...",
        "[NETWORK] Aggregating unique hostnames. Stripping duplicates...",
        "[NETWORK] Firing multi-threaded DNS resolution engine...",
        "[NETWORK] Probing discovered assets for HTTP/HTTPS services...",
        "[SYSTEM] Compiling final attack surface matrix and threat intel..."
    ];

    const timeouts: NodeJS.Timeout[] = [];
    let delay = 1000;

    sequence.forEach((log) => {
        timeouts.push(setTimeout(() => setLogs(prev => [...prev, log]), delay));
        delay += 1200 + Math.random() * 1000;
    });

    return () => timeouts.forEach(clearTimeout);
  }, [isScanning, domain]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!domain) return;
    
    setIsScanning(true);
    setResults(null);
    setError('');
    setActiveNodeIdx(null); // Reset selection on new scan

    try {
      const response = await fetch('http://127.0.0.1:5000/api/recon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });

      if (!response.ok) throw new Error('Failed to fetch OSINT data.');
      const data = await response.json();
      setResults(data);
      if (data.infrastructure && data.infrastructure.length > 0) {
          setActiveNodeIdx(0); // Auto-select the first result
      }
    } catch (err: any) {
      setError(err.message || 'Connection failed. Ensure backend is running.');
    } finally {
      setIsScanning(false);
    }
  };

  const activeNode = results?.infrastructure?.[activeNodeIdx ?? -1];
  const intel = activeNode?.intel || {};

  return (
    <div className="min-h-screen bg-background relative flex flex-col overflow-hidden pb-10">
      <Navbar />
      <div className="absolute inset-0 w-full h-full grid-background pointer-events-none opacity-30" />
      
      <div className="container relative z-10 mx-auto px-4 pt-8 max-w-[1600px] flex flex-col flex-grow">
        
        {/* --- CENTERED HERO SECTION --- */}
        <div className="flex flex-col items-center text-center mb-8 w-full max-w-6xl mx-auto shrink-0">
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sentinel-blue/10 border border-sentinel-blue/20 mb-4">
                <Radar className="w-4 h-4 text-sentinel-blue animate-pulse" />
                <span className="text-sm font-medium text-sentinel-blue uppercase tracking-wider">Passive Intelligence</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-4 leading-tight">
                Attack Surface <span className="text-sentinel-blue">Mapper</span>
            </h1>
            
            <p className="text-base md:text-lg text-muted-foreground mb-6 leading-relaxed max-w-5xl mx-auto">
                Reconnaissance is the critical first phase of the Cyber Kill Chain. Deploy passive OSINT (Open-Source Intelligence) to uncover hidden subdomains, shadow APIs, and forgotten staging servers. By querying global certificate transparency logs and threat intelligence databases (like AlienVault and HackerTarget), Sentinel maps a target's entire external digital footprint without ever sending a single packet to their servers—revealing the exact attack surface a real-world threat actor would exploit.
            </p>

            <form onSubmit={handleScan} className="w-full relative max-w-3xl mx-auto">
                <div className="relative flex items-center bg-card border border-border rounded-xl shadow-lg overflow-hidden focus-within:border-sentinel-blue/50 transition-colors h-14">
                    <Search className="w-6 h-6 text-muted-foreground ml-4 shrink-0" />
                    <input
                        type="text"
                        placeholder="Enter target root domain (e.g., tesla.com)"
                        className="w-full bg-transparent border-none focus:outline-none text-foreground px-4 py-3 font-mono text-base placeholder:text-muted-foreground/50"
                        value={domain}
                        onChange={(e) => setDomain(e.target.value)}
                        disabled={isScanning}
                    />
                    <Button 
                        type="submit" 
                        disabled={isScanning || !domain}
                        className="bg-sentinel-blue hover:bg-sentinel-blue/90 text-white px-8 h-full rounded-none font-bold tracking-wider shrink-0 text-sm"
                    >
                        {isScanning ? 'AGGREGATING...' : 'LAUNCH RECON'}
                    </Button>
                </div>
            </form>
        </div>

        {/* Error State */}
        {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-500 p-4 rounded-xl font-mono text-sm flex items-center justify-center gap-3 mb-6 max-w-3xl mx-auto w-full">
                <AlertTriangle className="w-5 h-5" /> {error}
            </div>
        )}

        {/* --- 3-PANE WORKSPACE --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full min-h-[600px] lg:h-[700px]">
            
            {/* PANE 1: Live Terminal */}
            <div className="lg:col-span-3 bg-card border border-sentinel-blue/50 rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
                <div className="bg-muted/30 px-4 py-4 border-b border-sentinel-blue/20 flex items-center gap-2 shrink-0">
                    <TerminalIcon className="w-5 h-5 text-sentinel-blue" />
                    <span className="text-sm font-mono font-bold text-foreground">recon_engine.log</span>
                </div>
                <div className="p-5 font-mono text-[11px] leading-relaxed text-muted-foreground overflow-y-auto flex-1 custom-scrollbar">
                    {logs.length === 0 && !results && <span className="text-muted-foreground/50 italic text-sm">Ready for target input...</span>}
                    {logs.map((log, i) => (
                        <div key={i} className="animate-in fade-in slide-in-from-left-2 mb-2">
                            <span className="text-sentinel-blue mr-2">❯</span>
                            <span className="text-foreground/80">{log}</span>
                        </div>
                    ))}
                    {isScanning && <div className="animate-pulse text-sentinel-blue mt-2">_</div>}
                    {results && (
                         <div className="text-emerald-500 mt-4 font-bold border-t border-sentinel-blue/20 pt-3">
                             [SUCCESS] {results.total_found} nodes parsed.
                         </div>
                    )}
                </div>
            </div>

            {/* PANE 2: Target List */}
            <div className="lg:col-span-4 bg-card border border-sentinel-blue/50 rounded-xl shadow-sm flex flex-col h-full overflow-hidden">
                <div className="bg-muted/30 px-5 py-4 border-b border-sentinel-blue/20 flex justify-between items-center shrink-0">
                    <span className="text-base font-mono text-foreground font-bold flex items-center gap-2">
                        <Map className="w-5 h-5 text-sentinel-blue" /> ASSET INVENTORY
                    </span>
                    {results && (
                        <span className="text-xs bg-sentinel-blue/10 px-2 py-1 rounded text-sentinel-blue font-mono border border-sentinel-blue/20">
                            {results.total_found} TARGETS
                        </span>
                    )}
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 relative">
                    {!results && !isScanning && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/50">
                            <Server className="w-16 h-16 mb-3" />
                            <p className="font-mono text-sm">Inventory empty.</p>
                        </div>
                    )}
                    
                    {isScanning && !results && (
                         <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="w-10 h-10 border-4 border-sentinel-blue/30 border-t-sentinel-blue rounded-full animate-spin mb-3" />
                        </div>
                    )}

                    {results?.infrastructure.map((node: any, idx: number) => {
                        const isActive = activeNodeIdx === idx;
                        const nodeRisk = node.intel?.risk || "Low"; // Extract the specific risk for this node
                        
                        return (
                            <button 
                                key={idx}
                                onClick={() => setActiveNodeIdx(idx)}
                                className={cn(
                                    "w-full text-left p-4 rounded-lg border transition-all duration-200 flex flex-col gap-3 group",
                                    isActive 
                                        ? "bg-sentinel-blue/10 border-sentinel-blue/40 shadow-[0_0_15px_rgba(59,130,246,0.05)]" 
                                        : "bg-transparent border-transparent hover:bg-muted/50 hover:border-border"
                                )}
                            >
                                <div className="flex justify-between items-start w-full gap-2">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        {/* --- NEW: SEVERITY LED INDICATOR --- */}
                                        <div className={cn(
                                            "w-2 h-2 rounded-full shrink-0",
                                            nodeRisk === "Critical" ? "bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)]" :
                                            nodeRisk === "High" ? "bg-orange-500 shadow-[0_0_5px_rgba(249,115,22,0.8)]" :
                                            nodeRisk === "Medium" ? "bg-yellow-500 shadow-[0_0_5px_rgba(234,179,8,0.8)]" :
                                            "bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]"
                                        )} />
                                        <span className={cn(
                                            "font-mono text-sm truncate pr-2 font-bold transition-colors",
                                            isActive ? "text-foreground" : "text-foreground/70 group-hover:text-foreground"
                                        )}>
                                            {node.subdomain}
                                        </span>
                                    </div>
                                    <span className={cn(
                                        "shrink-0 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border",
                                        node.status === "Offline" ? "bg-red-500/10 text-red-600 border-red-500/20" : 
                                        node.status === "200" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                                        node.status.startsWith("3") ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                                        "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                                    )}>
                                        {node.status === "Offline" ? "OFFLINE" : `HTTP ${node.status}`}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center w-full">
                                    <div className="flex items-center gap-3">
                                        <span className="text-[12px] text-muted-foreground font-mono flex items-center gap-1.5">
                                            <Activity className="w-3.5 h-3.5" /> {node.ip}
                                        </span>
                                        {/* --- NEW: SEVERITY TEXT BADGE --- */}
                                        <span className={cn(
                                            "text-[9px] font-bold uppercase tracking-widest",
                                            nodeRisk === "Critical" ? "text-red-500" :
                                            nodeRisk === "High" ? "text-orange-500" :
                                            nodeRisk === "Medium" ? "text-yellow-500" :
                                            "text-emerald-500"
                                        )}>
                                            {nodeRisk} RISK
                                        </span>
                                    </div>
                                    {isActive && <ArrowRight className="w-4 h-4 text-sentinel-blue animate-in slide-in-from-left-2" />}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* PANE 3: Intelligence Dossier */}
            <div className="lg:col-span-5 bg-card border border-sentinel-blue/50 rounded-xl shadow-sm flex flex-col h-full overflow-hidden relative">
                <div className="bg-muted/30 px-5 py-4 border-b border-sentinel-blue/20 flex items-center gap-2 shrink-0">
                    <Crosshair className="w-5 h-5 text-sentinel-blue" />
                    <span className="text-base font-mono text-foreground font-bold">INTELLIGENCE DOSSIER</span>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                    {!activeNode ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground/50">
                            <ShieldCheck className="w-20 h-20 mb-4" />
                            <p className="font-mono text-sm">Select a target to view intelligence profile.</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div 
                                key={activeNode.subdomain}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="p-6 md:p-8 space-y-8"
                            >
                                {/* Header / Risk Level */}
                                <div className="flex items-start justify-between border-b border-border pb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-foreground mb-2 leading-tight">
                                            {intel.title || "Infrastructure Node"}
                                        </h2>
                                        <p className="text-sm font-mono text-sentinel-blue">{activeNode.subdomain}</p>
                                    </div>
                                    <div className={cn(
                                        "flex flex-col items-center justify-center px-4 py-2 rounded-lg border shrink-0 ml-4",
                                        intel.risk === "Critical" ? "bg-red-500/10 border-red-500/30 text-red-600" :
                                        intel.risk === "High" ? "bg-orange-500/10 border-orange-500/30 text-orange-600" :
                                        intel.risk === "Medium" ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-600" :
                                        "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
                                    )}>
                                        <ShieldAlert className="w-6 h-6 mb-1" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">{intel.risk || "Info"} Risk</span>
                                    </div>
                                </div>

                                {/* Hacker's Playbook */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                                        <AlertTriangle className="w-4 h-4 text-orange-500" /> 
                                        The Hacker's Playbook
                                    </h3>
                                    <div className="bg-muted/30 border border-border p-5 rounded-lg">
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {intel.playbook || "Standard reconnaissance target. Attackers will map it, scan for open ports, and fingerprint the web server."}
                                        </p>
                                    </div>
                                </div>

                                {/* DevSecOps Remediation */}
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-emerald-500" /> 
                                        DevSecOps Remediation
                                    </h3>
                                    <div className="bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-lg">
                                        <p className="text-sm text-muted-foreground leading-relaxed">
                                            {intel.remediation || "Ensure software is patched and default credentials are removed."}
                                        </p>
                                    </div>
                                </div>

                                {/* Next Action */}
                                <div className="pt-6 mt-6 border-t border-border">
                                    <div className="flex items-start gap-4 bg-sentinel-blue/5 border border-sentinel-blue/20 p-5 rounded-lg">
                                        <Info className="w-6 h-6 text-sentinel-blue shrink-0" />
                                        <div>
                                            <span className="block text-xs font-bold text-sentinel-blue uppercase mb-2 tracking-wider">Recommended Next Action</span>
                                            <span className="text-sm text-foreground/90">{intel.next_step || "Run a Deep Scan to identify specific vulnerabilities."}</span>
                                        </div>
                                    </div>
                                </div>

                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}