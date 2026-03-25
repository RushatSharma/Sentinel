import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { ShieldAlert, ShieldCheck, Terminal as TerminalIcon, Download, Search, FileDigit, Globe, Link2, Activity, ShieldBan } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export default function QuarantinePage() {
  const { user } = useAuth();

  const [artifact, setArtifact] = useState('');
  const [scanType, setScanType] = useState<'hash' | 'ip' | 'url'>('hash');
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!isScanning) return;
    
    setLogs([]);
    const sequence = [
        "[SYSTEM] Engaging Quarantine Containment Protocols...",
        `[INTEL] Target artifact acquired: ${artifact.substring(0, 20)}...`,
        "[NETWORK] Establishing secure link to Global Threat Intelligence...",
        "[ENGINE] Distributing payload to 72 isolated sandboxes...",
        "[ANALYSIS] Executing behavioral heuristics and static signature checks...",
        "[ANALYSIS] Cross-referencing zero-day malware databases...",
        "[SYSTEM] Aggregating engine verdicts. Finalizing confidence score..."
    ];

    const timeouts: NodeJS.Timeout[] = [];
    let delay = 600; 

    sequence.forEach((log) => {
        timeouts.push(setTimeout(() => setLogs(prev => [...prev, log]), delay));
        delay += 800 + Math.random() * 600; 
    });

    return () => timeouts.forEach(clearTimeout);
  }, [isScanning, artifact]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artifact.trim()) return;
    
    setIsScanning(true);
    setResults(null);
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:5000/api/quarantine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            artifact, 
            type: scanType,
            user_id: user?.$id
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Containment analysis failed.');
      
      setTimeout(() => setResults(data), 1500);
    } catch (err: any) {
      setError(err.message || 'Connection failed. Ensure backend is running.');
      setIsScanning(false);
    } finally {
      setTimeout(() => setIsScanning(false), 1500);
    }
  };

  const handleDownload = async () => {
    if (!results) return;
    setIsDownloading(true);
    setError('');

    try {
        const response = await fetch('http://127.0.0.1:5000/api/download-report', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                target: results.target, 
                scanType: results.type,
                malicious_count: results.malicious_count,
                total_engines: results.total_engines,
                engine_results: results.engine_results || [],
                threat_explanation: results.threat_explanation, 
                report_type: 'quarantine' 
            }),
        });

        if (!response.ok) throw new Error('Failed to generate report.');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Sentinel_Quarantine_${results.target.substring(0,10)}.pdf`;
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

  const TOTAL_ENGINES = 72;
  const dummyEngines = Array.from({ length: TOTAL_ENGINES }).map((_, i) => ({
      id: i,
      isMalicious: results ? i < (results.malicious_count || 0) : false
  }));

  // Default is Green (Clean/Waiting). Only becomes Orange if malicious is > 0.
  const isMalicious = results && results.malicious_count > 0;

  const theme = {
      text: isMalicious ? "text-orange-500" : "text-emerald-500",
      bgLight: isMalicious ? "bg-orange-500/10" : "bg-emerald-500/10",
      borderLight: isMalicious ? "border-orange-500/20" : "border-emerald-500/20",
      button: isMalicious ? "bg-orange-600 hover:bg-orange-700" : "bg-emerald-600 hover:bg-emerald-700",
      glow: isMalicious ? "from-orange-600/20 to-red-600/20" : "from-emerald-600/20 to-teal-600/20",
  };

  return (
    // Removed slow transition-colors duration-1000 so theme toggling matches Home.tsx exactly
    <div className="min-h-screen bg-background relative flex flex-col pb-12 font-sans overflow-x-hidden">
      <Navbar />
      
      {/* Exact match to Home.tsx Background Grid */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }} className="absolute inset-0 grid-background opacity-50 dark:opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </div>
      
      <main className="container relative z-8 mx-auto px-4 pt-6 pb-6 max-w-7xl flex flex-col gap-8 [perspective:1200px] flex-grow">
        
        <motion.div initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} transition={{ duration: 0.7 }} className="flex flex-col items-center text-center mb-4 mt-2">
            <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-6 transition-colors", theme.bgLight, theme.borderLight)}>
                {isMalicious ? <ShieldBan className={cn("w-3 h-3 text-orange-500", isScanning && "animate-pulse")} /> : <ShieldCheck className={cn("w-3 h-3 text-emerald-500", isScanning && "animate-pulse")} />}
                <span className={cn("text-[10px] font-bold uppercase tracking-widest", theme.text)}>
                    {isMalicious ? "THREAT DETECTED" : isScanning ? "ANALYZING..." : "SYSTEM SECURE"}
                </span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-foreground mb-6 tracking-tight transition-colors">
                The <span className={theme.text}>Quarantine</span> Zone
            </h1>
            
            <p className="text-base md:text-lg text-muted-foreground max-w-4xl mb-10 leading-relaxed">
                Query global threat intelligence to detect malware, ransomware, and malicious infrastructure. Enter a file hash (MD5/SHA-256), a suspicious IP address, or a URL. 
            </p>

            <form onSubmit={handleScan} className="w-full max-w-4xl relative group">
                <div className={cn("absolute -inset-1 rounded-2xl blur opacity-50 group-hover:opacity-100 transition duration-1000 bg-gradient-to-r", theme.glow)} />
                <div className="relative bg-card border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col">
                    <div className="bg-muted/30 border-b border-border p-3 flex justify-center gap-4">
                        {[
                            { id: 'hash', label: 'File Hash', icon: FileDigit },
                            { id: 'ip', label: 'IP Address', icon: Globe },
                            { id: 'url', label: 'Domain / URL', icon: Link2 }
                        ].map((type) => (
                            <button 
                                key={type.id}
                                type="button"
                                onClick={() => setScanType(type.id as any)}
                                className={cn("px-4 py-1.5 rounded-full text-xs font-bold font-mono transition-all flex items-center gap-2", scanType === type.id ? cn("text-white shadow-lg", theme.button) : "text-muted-foreground hover:bg-muted")}
                            >
                                <type.icon className="w-3 h-3" /> {type.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center p-2 h-16">
                        <Search className="w-5 h-5 text-muted-foreground ml-4 shrink-0" />
                        <input
                            type="text"
                            placeholder={scanType === 'hash' ? "Enter MD5, SHA-1, or SHA-256 hash (e.g., evil)..." : scanType === 'ip' ? "Enter suspicious IPv4 address..." : "Enter fully qualified domain or URL..."}
                            className="w-full h-full bg-transparent border-none focus:outline-none text-foreground px-4 font-mono text-sm placeholder:text-muted-foreground/40"
                            value={artifact}
                            onChange={(e) => setArtifact(e.target.value)}
                            disabled={isScanning}
                            spellCheck="false"
                        />
                        <Button type="submit" disabled={isScanning || !artifact.trim()} className={cn("text-white font-bold tracking-wider text-sm h-10 px-8 transition-all rounded-xl mr-2", theme.button)}>
                            {isScanning ? 'ANALYZING...' : 'CONTAIN'}
                        </Button>
                    </div>
                </div>
            </form>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-4 flex flex-col gap-6">
                <div className={cn("bg-card border rounded-2xl shadow-xl overflow-hidden h-64 flex flex-col transition-colors", theme.borderLight)}>
                    <div className={cn("bg-muted/30 px-4 py-3 border-b flex items-center justify-between shrink-0", theme.borderLight)}>
                        <span className="text-xs font-mono font-bold text-foreground/80 flex items-center gap-2">
                            <TerminalIcon className={cn("w-3.5 h-3.5", theme.text)} /> containment.log
                        </span>
                    </div>
                    <div className="p-4 font-mono text-[10px] leading-relaxed text-muted-foreground overflow-y-auto flex-1 custom-scrollbar">
                        {logs.length === 0 && !isScanning && !results && <span className="opacity-50 italic">Awaiting artifact...</span>}
                        {logs.map((log, i) => (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i} className="mb-1.5">
                                <span className={cn("mr-2", log.includes("SYSTEM") ? theme.text : "text-muted-foreground")}>❯</span> {log}
                            </motion.div>
                        ))}
                        {isScanning && <div className={cn("animate-pulse mt-1", theme.text)}>_</div>}
                    </div>
                </div>

                <AnimatePresence>
                    {results && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={cn("bg-card border rounded-2xl p-6 shadow-sm text-center relative overflow-hidden transition-colors", theme.borderLight)}>
                            <div className={cn("absolute inset-0 opacity-10", theme.bgLight)} />
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-2 relative z-10">Detection Ratio</p>
                            <div className="flex items-center justify-center gap-2 relative z-10">
                                <span className={cn("text-5xl font-display font-bold", theme.text)}>{results.malicious_count || 0}</span>
                                <span className="text-2xl text-muted-foreground font-light">/ {TOTAL_ENGINES}</span>
                            </div>
                            <p className={cn("text-xs font-bold mt-4 uppercase tracking-widest relative z-10", theme.text)}>
                                {isMalicious ? "MALICIOUS ARTIFACT DETECTED" : "ARTIFACT IS SECURE & CLEAN"}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-8 bg-card border border-border rounded-2xl flex-1 overflow-hidden flex flex-col min-h-[500px] shadow-xl relative">
                <div className="bg-muted/30 px-6 py-4 border-b border-border flex justify-between items-center z-10">
                    <span className="text-sm font-bold flex items-center gap-2 uppercase tracking-tighter text-foreground">
                        <Activity className={cn("w-4 h-4", theme.text)} /> Analysis Engines
                    </span>
                    {results && (
                        <Button onClick={handleDownload} disabled={isDownloading} variant="outline" size="sm" className={cn("h-7 text-xs border transition-colors hover:bg-muted", theme.borderLight, theme.text, theme.bgLight)}>
                            <Download className="w-3 h-3 mr-2" /> {isDownloading ? 'GENERATING...' : 'EXPORT REPORT'}
                        </Button>
                    )}
                </div>
                
                {/* Changed to bg-muted/20 to natively adapt to light/dark themes smoothly */}
                <div className="flex-1 p-8 flex flex-col items-center justify-center bg-muted/20 relative overflow-y-auto custom-scrollbar">
                    
                    <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                         {isMalicious ? <ShieldBan className={cn("w-64 h-64 text-orange-500")} /> : <ShieldCheck className={cn("w-64 h-64 text-emerald-500")} />}
                    </div>

                    {!results && !isScanning && (
                        <div className="flex flex-col items-center justify-center text-muted-foreground/50 italic text-sm z-10 h-full">
                            Enter an artifact to begin global engine analysis.
                        </div>
                    )}

                    {error && <div className="p-4 text-orange-500 bg-orange-500/10 border border-orange-500/20 rounded-xl text-sm mb-4 z-10">{error}</div>}

                    {(isScanning || results) && (
                        <div className="flex flex-col items-center w-full z-10">
                            
                            {results?.threat_explanation && (
                                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={cn("w-full max-w-3xl bg-card border rounded-xl p-5 mb-8 text-left shadow-lg", theme.borderLight)}>
                                    <h3 className={cn("text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2", theme.text)}>
                                        <Activity className="w-4 h-4" /> Intelligence Summary
                                    </h3>
                                    <p className={cn("text-sm leading-relaxed", isMalicious ? "text-orange-700 dark:text-orange-200" : "text-emerald-700 dark:text-emerald-200")}>
                                        {results.threat_explanation}
                                    </p>
                                </motion.div>
                            )}

                            <div className="grid grid-cols-8 md:grid-cols-12 gap-2 md:gap-3 mb-8 w-full max-w-3xl place-items-center">
                                <AnimatePresence>
                                    {dummyEngines.map((engine, idx) => {
                                        const delay = isScanning ? 0 : idx * 0.02;
                                        return (
                                            <motion.div
                                                key={engine.id}
                                                initial={false}
                                                animate={
                                                    isScanning 
                                                        ? { backgroundColor: "rgba(16, 185, 129, 0.4)", scale: [1, 1.1, 1], rotateY: 0 } 
                                                        : { 
                                                            backgroundColor: engine.isMalicious ? "rgba(249, 115, 22, 0.9)" : "rgba(16, 185, 129, 0.2)", 
                                                            rotateY: 180, 
                                                            scale: engine.isMalicious ? 1.1 : 1,
                                                            boxShadow: engine.isMalicious ? "0 0 15px rgba(249, 115, 22, 0.8)" : "none"
                                                          }
                                                }
                                                transition={{ duration: isScanning ? 1.5 : 0.6, repeat: isScanning ? Infinity : 0, delay: isScanning ? Math.random() * 2 : delay }}
                                                className="w-6 h-6 md:w-8 md:h-8 rounded-md border border-foreground/10 flex items-center justify-center"
                                            >
                                                {!isScanning && engine.isMalicious && (
                                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: delay + 0.3 }} style={{ rotateY: 180 }}>
                                                        <ShieldAlert className="w-4 h-4 text-white" />
                                                    </motion.div>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>

                            {/* Threat Signatures block with standard bg-card adaptiveness */}
                            {isMalicious && results?.engine_results?.length > 0 && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5 }} className="w-full max-w-3xl bg-card border border-orange-500/30 rounded-xl p-4 mt-4 shadow-lg">
                                    <h3 className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <ShieldAlert className="w-4 h-4" /> Threat Signatures Detected
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                                        {results.engine_results.map((engine: any, idx: number) => (
                                            <div key={idx} className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 flex flex-col gap-1">
                                                <span className="text-xs font-bold text-foreground/90">{engine.engine}</span>
                                                <span className="text-[10px] font-mono text-orange-600 dark:text-orange-400 break-all">{engine.result}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
      </main>
    </div>
  );
}
