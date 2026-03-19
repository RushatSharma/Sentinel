import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Compass, Search, HardDrive, Activity, AlertTriangle, ShieldCheck, Terminal as TerminalIcon, Download, Zap, Cpu, Server } from 'lucide-react';
import { cn } from '../lib/utils';

export default function InfrastructureScannerPage() {
  const [target, setTarget] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);

  // Slowed down cinematic terminal for the "Sonar" theme
  useEffect(() => {
    
    setLogs([]);
    const sequence = [
        "[SYSTEM] Calibrating Sonar Transceiver...",
        `[NETWORK] Target host acquired: ${target}`,
        "[PROBE] Initiating TCP SYN Stealth Sweep (0-1024)...",
        "[PROBE] Analyzing service banners for version fingerprints...",
        "[PROBE] Mapping firewall response latency...",
        "[SYSTEM] Core infrastructure nodes identified. Expanding scan range...",
        "[SYSTEM] Finalizing topology report and service matrix..."
    ];

    const timeouts: NodeJS.Timeout[] = [];
    let delay = 1500; 

    sequence.forEach((log) => {
        timeouts.push(setTimeout(() => setLogs(prev => [...prev, log]), delay));
        delay += 1200 + Math.random() * 1000; 
    });

    return () => timeouts.forEach(clearTimeout);
  }, [isScanning, target]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) return;
    
    setIsScanning(true);
    setResults(null);
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:5000/api/port-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Infrastructure scan failed.');
      
      setResults(data);
    } catch (err: any) {
      setError(err.message || 'Connection failed. Ensure backend is running.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative flex flex-col pb-16 font-sans">
      <Navbar />
      
      {/* --- UNIFIED FOCUSED GRID BACKGROUND --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }} className="absolute inset-0 grid-background opacity-50 dark:opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </div>
      
      <div className="container relative z-10 mx-auto px-4 pt-12 max-w-7xl flex flex-col gap-8 [perspective:1200px]">
        
        {/* --- HERO SECTION: SONAR LOCK-ON --- */}
        <motion.div 
            initial={{ opacity: 0, scale: 1.1, filter: 'blur(20px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            transition={{ duration: 1.8, type: 'spring', bounce: 0.1 }}
            className="flex flex-col items-center text-center mb-4 mt-2 origin-center"
        >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                <Compass className="w-3 h-3 text-emerald-600 dark:text-emerald-400 animate-spin-slow" />
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Active Sonar Sweep</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-foreground mb-6 tracking-tight">
                Network <span className="text-emerald-600 dark:text-emerald-400 text-glow-emerald">Infrastructure</span> Scanner
            </h1>
            
            <p className="text-base md:text-lg text-muted-foreground max-w-4xl mb-10 leading-relaxed">
                Directly probe the server's architectural entrance points. By executing advanced TCP SYN stealth scans and banner grabbing, Sentinel fingerprints running services like SSH, databases, and mail servers. This module identifies open ports that act as gateways for lateral movement and remote code execution (RCE) attacks.
            </p>

            <form onSubmit={handleScan} className="w-full max-w-3xl relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-1000" />
                <motion.div initial={{ width: "60%" }} animate={{ width: "100%" }} transition={{ duration: 1.2, delay: 0.6, type: 'spring' }} className="relative flex items-center bg-card border border-border rounded-full p-1.5 shadow-lg mx-auto">
                    <Server className="w-5 h-5 text-muted-foreground ml-4 shrink-0" />
                    <input
                        type="text"
                        placeholder="IP Address or Domain (e.g., 192.168.1.1 or example.com)"
                        className="w-full bg-transparent border-none focus:outline-none text-foreground px-4 py-3 font-mono text-base placeholder:text-muted-foreground/50"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        disabled={isScanning}
                    />
                    <Button type="submit" disabled={isScanning || !target} className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 rounded-full font-bold tracking-wider text-sm h-12 transition-all">
                        {isScanning ? 'SWEEPING...' : 'INITIATE SONAR'}
                    </Button>
                </motion.div>
            </form>
        </motion.div>

        {/* --- MAIN SCANNER AREA --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* LEFT: THE SONAR RADAR VISUALIZER */}
            <motion.div 
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1.5, delay: 0.5 }}
                className="lg:col-span-5 bg-card border border-border rounded-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden shadow-xl min-h-[450px]"
            >
                <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_#10b981_0%,_transparent_70%)]" />
                
                {/* Rotating Sonar Beam */}
                <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full border-2 border-emerald-500/20 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border border-emerald-500/10 scale-75" />
                    <div className="absolute inset-0 rounded-full border border-emerald-500/10 scale-50" />
                    
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute w-1/2 h-1/2 top-0 left-1/2 origin-bottom-left bg-gradient-to-tr from-emerald-500/40 to-transparent blur-sm rounded-tr-full"
                        style={{ display: isScanning ? 'block' : 'none' }}
                    />

                    {/* Discovered "Pings" */}
                    <AnimatePresence>
                        {results?.open_ports?.map((p: any, i: number) => (
                            <motion.div
                                key={p.port}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="absolute w-4 h-4 bg-emerald-500 rounded-full shadow-[0_0_15px_#10b981]"
                                style={{ 
                                    left: `${50 + 35 * Math.cos(i * 1.5)}%`, 
                                    top: `${50 + 35 * Math.sin(i * 1.5)}%` 
                                }}
                            >
                                <motion.div 
                                    animate={{ scale: [1, 2.5], opacity: [0.5, 0] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute inset-0 bg-emerald-500 rounded-full"
                                />
                                <span className="absolute top-5 left-1/2 -translate-x-1/2 text-[9px] font-mono text-emerald-400 font-bold whitespace-nowrap">
                                    PORT {p.port}
                                </span>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {!isScanning && !results && <Compass className="w-16 h-16 text-muted-foreground/20 animate-pulse" />}
                    {isScanning && <Activity className="w-12 h-12 text-emerald-500 animate-pulse" />}
                </div>
                
                <div className="mt-8 grid grid-cols-2 gap-4 w-full">
                    <div className="bg-muted/30 p-3 rounded-xl border border-border text-center">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Open Points</p>
                        <p className="text-2xl font-display font-bold text-foreground">{results?.open_ports?.length || 0}</p>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-xl border border-border text-center">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">OS Guess</p>
                        <p className="text-sm font-mono font-bold text-emerald-500 truncate px-2">{results?.os_info || "---"}</p>
                    </div>
                </div>
            </motion.div>

            {/* RIGHT: TERMINAL & LIST */}
            <motion.div 
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1.5, delay: 0.8 }}
                className="lg:col-span-7 flex flex-col gap-6"
            >
                <div className="bg-card border border-emerald-500/30 rounded-2xl shadow-xl overflow-hidden h-48">
                    <div className="bg-muted/30 px-4 py-2 border-b border-emerald-500/20 flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-foreground/80 flex items-center gap-2">
                            <TerminalIcon className="w-3.5 h-3.5 text-emerald-500" /> sonar_engine.exe
                        </span>
                    </div>
                    <div className="p-4 font-mono text-[11px] leading-relaxed text-muted-foreground overflow-y-auto h-36 custom-scrollbar">
                        {logs.map((log, i) => (
                            <div key={i} className="mb-1">
                                <span className="text-emerald-500 mr-2">❯</span> {log}
                            </div>
                        ))}
                        {isScanning && <div className="animate-pulse text-emerald-500 mt-1">_</div>}
                    </div>
                </div>

                <div className="bg-card border border-border rounded-2xl flex-1 min-h-[300px] overflow-hidden flex flex-col">
                    <div className="bg-muted/30 px-6 py-4 border-b border-border flex justify-between items-center">
                        <span className="text-sm font-bold flex items-center gap-2">
                            <Cpu className="w-4 h-4 text-emerald-500" /> DISCOVERED SERVICES
                        </span>
                    </div>
                    <div className="p-4 overflow-y-auto max-h-[400px] custom-scrollbar space-y-3">
                        {!results && !isScanning && (
                            <div className="h-40 flex flex-col items-center justify-center text-muted-foreground/30 italic text-sm">
                                Awaiting sonar data...
                            </div>
                        )}
                        {results?.open_ports?.map((p: any, idx: number) => (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={p.port} 
                                className="flex items-center justify-between p-4 rounded-xl bg-muted/20 border border-border group hover:border-emerald-500/30 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                        <Zap className="w-5 h-5 text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-foreground">Port {p.port}</p>
                                        <p className="text-xs text-muted-foreground font-mono uppercase">{p.service || 'Unknown Service'}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-widest">
                                        OPEN
                                    </span>
                                    <p className="text-[10px] text-muted-foreground mt-1 font-mono italic">{p.version || 'Version Hide'}</p>
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