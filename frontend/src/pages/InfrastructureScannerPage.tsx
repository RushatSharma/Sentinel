import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Compass, Search, HardDrive, Activity, AlertTriangle, ShieldCheck, Terminal as TerminalIcon, Download, Zap, Cpu, Server } from 'lucide-react';
import { cn } from '../lib/utils';

export default function InfrastructureScannerPage() {
  const [target, setTarget] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isAggressive, setIsAggressive] = useState(false); // NEW: Aggressive mode state
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  // FIXED: Terminal Logic now correctly triggers only when scanning starts
  useEffect(() => {
    if (!isScanning) return; // CRITICAL FIX: Prevent logs from clearing prematurely
    
    setLogs([]);
    const sequence = [
        "[SYSTEM] Calibrating Sonar Transceiver...",
        `[NETWORK] Target host acquired: ${target}`,
        isAggressive ? "[PROBE] Initiating FULL TCP SYN Stealth Sweep (1-65535)..." : "[PROBE] Initiating Standard TCP SYN Sweep (Top 1200)...",
        "[PROBE] Analyzing service banners for version fingerprints...",
        "[PROBE] Mapping firewall response latency...",
        "[SYSTEM] Core infrastructure nodes identified. Expanding scan range...",
        "[SYSTEM] Finalizing topology report and service matrix..."
    ];

    const timeouts: NodeJS.Timeout[] = [];
    let delay = 500; 

    sequence.forEach((log) => {
        const timeout = setTimeout(() => {
            setLogs(prev => [...prev, log]);
        }, delay);
        timeouts.push(timeout);
        delay += 1000 + Math.random() * 800; 
    });

    return () => timeouts.forEach(clearTimeout);
  }, [isScanning]); // Only re-run when isScanning state changes

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) return;
    
    setIsScanning(true);
    setResults(null);
    setError('');

    try {
      // Clean target: Remove protocol if user accidentally typed https://
      const cleanTarget = target.replace(/^https?:\/\//, '').split('/')[0];

      const response = await fetch('http://127.0.0.1:5000/api/port-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // NEW: Pass the aggressive flag to the backend
        body: JSON.stringify({ target: cleanTarget, aggressive: isAggressive }), 
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Infrastructure scan failed.');
      
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'Connection failed. Ensure backend is running.');
      setIsScanning(false);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative flex flex-col pb-16 font-sans overflow-x-hidden">
      <Navbar />
      
      {/* --- UNIFIED FOCUSED GRID BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }} className="absolute inset-0 grid-background opacity-50 dark:opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </div>
      
      <div className="container relative z-10 mx-auto px-4 pt-12 max-w-7xl flex flex-col gap-8 [perspective:1200px]">
        
        {/* --- HERO SECTION --- */}
        <motion.div 
            initial={{ opacity: 0, scale: 0.9, filter: 'blur(15px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.2, type: 'spring' }}
            className="flex flex-col items-center text-center mb-4 mt-2"
        >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                <Compass className={cn("w-3 h-3 text-emerald-600 dark:text-emerald-400", isScanning && "animate-spin")} />
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Active Sonar Sweep</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-foreground mb-6 tracking-tight">
                Network <span className="text-emerald-600 dark:text-emerald-400">Infrastructure</span> Scanner
            </h1>
            
            <p className="text-base md:text-lg text-muted-foreground max-w-4xl mb-10 leading-relaxed">
                Directly probe the server's architectural entrance points. By executing advanced TCP SYN stealth scans and banner grabbing, Sentinel fingerprints running services like SSH, databases, and mail servers.
            </p>

            <form onSubmit={handleScan} className="w-full max-w-3xl relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-1000" />
                <div className="relative flex items-center bg-card border border-border rounded-full p-1.5 shadow-lg mx-auto">
                    <Server className="w-5 h-5 text-muted-foreground ml-4 shrink-0" />
                    <input
                        type="text"
                        placeholder="IP Address or Domain (e.g., 192.168.1.1 or nmap.org)"
                        className="w-full bg-transparent border-none focus:outline-none text-foreground px-4 py-3 font-mono text-sm placeholder:text-muted-foreground/50"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        disabled={isScanning}
                    />
                    <Button type="submit" disabled={isScanning || !target} className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 rounded-full font-bold tracking-wider text-sm h-12 transition-all">
                        {isScanning ? 'SWEEPING...' : 'INITIATE SONAR'}
                    </Button>
                </div>
                
                {/* NEW: Aggressive Scan Toggle */}
                <div className="flex items-center justify-center gap-3 mt-4">
                    <label className="text-sm font-mono text-muted-foreground flex items-center gap-2 cursor-pointer hover:text-emerald-400 transition-colors">
                        <input 
                            type="checkbox" 
                            className="accent-emerald-500 w-4 h-4 cursor-pointer"
                            checked={isAggressive}
                            onChange={(e) => setIsAggressive(e.target.checked)}
                            disabled={isScanning}
                        />
                        Aggressive Scan (All 65,535 Ports) 
                        <span className="text-[10px] text-emerald-500/80 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 ml-2">WARNING: SLOW</span>
                    </label>
                </div>
            </form>
        </motion.div>

        {/* --- MAIN SCANNER AREA --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT: THE SONAR RADAR VISUALIZER */}
            <motion.div 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                className="lg:col-span-5 bg-card border border-border rounded-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-xl min-h-[450px]"
            >
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_#10b981_0%,_transparent_70%)]" />
                
                <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full border-2 border-emerald-500/20 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border border-emerald-500/10 scale-75" />
                    <div className="absolute inset-0 rounded-full border border-emerald-500/10 scale-50" />
                    
                    {/* The Sonar Beam */}
                    {isScanning && (
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute w-1/2 h-1/2 top-0 left-1/2 origin-bottom-left bg-gradient-to-tr from-emerald-500/30 to-transparent blur-sm rounded-tr-full"
                        />
                    )}

                    {/* FIXED: Dynamic Port Pings */}
                    <AnimatePresence>
                        {results?.open_ports?.map((p: any, i: number) => {
                            // Spread the dots evenly around the radar circle
                            const angle = (i * (360 / results.open_ports.length)) * (Math.PI / 180);
                            const radius = 35; // % from center
                            return (
                                <motion.div
                                    key={p.port}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="absolute w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981] z-20"
                                    style={{ 
                                        left: `${50 + radius * Math.cos(angle)}%`, 
                                        top: `${50 + radius * Math.sin(angle)}%` 
                                    }}
                                >
                                    <motion.div animate={{ scale: [1, 2.5], opacity: [0.5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-emerald-500 rounded-full" />
                                    <span className="absolute top-4 left-1/2 -translate-x-1/2 text-[8px] font-mono text-emerald-400 font-bold">:{p.port}</span>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {!isScanning && !results && <Compass className="w-16 h-16 text-muted-foreground/20" />}
                </div>
                
                <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                    <div className="bg-muted/30 p-3 rounded-xl border border-border text-center">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Discovered</p>
                        <p className="text-2xl font-display font-bold text-foreground">{results?.open_ports?.length || 0}</p>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-xl border border-border text-center overflow-hidden">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">OS/Arch</p>
                        <p className="text-xs font-mono font-bold text-emerald-500 truncate">{results?.os_info || "---"}</p>
                    </div>
                </div>
            </motion.div>

            {/* RIGHT: TERMINAL & LIST */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-7 flex flex-col gap-6">
                
                {/* Fixed Terminal Console */}
                <div className="bg-card border border-emerald-500/30 rounded-2xl shadow-xl overflow-hidden h-44">
                    <div className="bg-muted/30 px-4 py-2 border-b border-emerald-500/20 flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-foreground/80 flex items-center gap-2">
                            <TerminalIcon className="w-3.5 h-3.5 text-emerald-500" /> sonar_engine.log
                        </span>
                    </div>
                    <div className="p-4 font-mono text-[10px] leading-relaxed text-muted-foreground overflow-y-auto h-32 custom-scrollbar flex flex-col-reverse">
                        <div>
                            {logs.map((log, i) => (
                                <div key={i} className="mb-1">
                                    <span className="text-emerald-500 mr-2">❯</span> {log}
                                </div>
                            ))}
                            {isScanning && <div className="animate-pulse text-emerald-500 mt-1">_</div>}
                        </div>
                    </div>
                </div>

                <div className="bg-card border border-border rounded-2xl flex-1 overflow-hidden flex flex-col min-h-[300px]">
                    <div className="bg-muted/30 px-6 py-4 border-b border-border flex justify-between items-center">
                        <span className="text-sm font-bold flex items-center gap-2 uppercase tracking-tighter">
                            <Cpu className="w-4 h-4 text-emerald-500" /> Infrastructure Matrix
                        </span>
                        {isScanning && isAggressive && (
                            <span className="text-xs font-mono text-emerald-500 animate-pulse">Scanning 65,535 ports...</span>
                        )}
                    </div>
                    <div className="p-4 overflow-y-auto max-h-[350px] custom-scrollbar space-y-3">
                        {error && <div className="p-4 text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl text-sm">{error}</div>}
                        {!results && !isScanning && (
                            <div className="h-40 flex flex-col items-center justify-center text-muted-foreground/30 italic text-sm">
                                Awaiting target input...
                            </div>
                        )}
                        {results?.open_ports?.map((p: any, idx: number) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                key={p.port} 
                                className="flex items-center justify-between p-4 rounded-xl bg-muted/10 border border-border group hover:border-emerald-500/30 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                        <Zap className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-foreground">PORT {p.port}</p>
                                        <p className="text-xs text-muted-foreground font-mono uppercase">{p.service}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[9px] font-bold px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">OPEN</span>
                                    <p className="text-[10px] text-muted-foreground mt-1 font-mono italic max-w-[150px] truncate">{p.version}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
      </div>
    </div>
  );
}