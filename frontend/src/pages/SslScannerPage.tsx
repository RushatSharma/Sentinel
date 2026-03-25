import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Lock, Search, ShieldCheck, ShieldAlert, Terminal as TerminalIcon, Calendar, Server, Key, Shield, Network, Download, Globe } from 'lucide-react';
import { cn } from '../lib/utils';

export default function SslScannerPage() {
  const [target, setTarget] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (!isScanning) return;
    setLogs([]);
    const sequence = [
        "[SYSTEM] Initializing Cryptographic Handshake...",
        `[NETWORK] Resolving target: ${target}`,
        "[CRYPTO] Extracting X.509 Certificate Chain...",
        "[CRYPTO] Parsing public key algorithm and bit-length...",
        "[ANALYSIS] Evaluating cipher suite strength (RSA/AES/GCM)...",
        "[PROBE] Executing SSL/TLS Downgrade Attack Simulation...",
        "[SYSTEM] Aggregating cryptographic vulnerabilities..."
    ];

    let delay = 400; 
    const timeouts = sequence.map(log => {
        const timeout = setTimeout(() => setLogs(prev => [...prev, log]), delay);
        delay += 800 + Math.random() * 600; 
        return timeout;
    });
    return () => timeouts.forEach(clearTimeout);
  }, [isScanning]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!target) return;
    setIsScanning(true);
    setResults(null);
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:5000/api/ssl-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'SSL Analysis failed.');
      setTimeout(() => setResults(data), 1000);
    } catch (err: any) {
      setError(err.message || 'Connection failed.');
    } finally {
      setTimeout(() => setIsScanning(false), 1000);
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
            body: JSON.stringify({ ...results, report_type: 'ssl' }),
        });

        if (!response.ok) throw new Error('Failed to generate report.');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Sentinel_CryptoAudit_${results.target.substring(0,15)}.pdf`;
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

  const gradeColors: Record<string, string> = {
    'A': 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]',
    'B': 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20 shadow-[0_0_30px_rgba(234,179,8,0.2)]',
    'C': 'text-orange-500 bg-orange-500/10 border-orange-500/20 shadow-[0_0_30px_rgba(249,115,22,0.2)]',
    'F': 'text-red-500 bg-red-500/10 border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.2)]',
  };

  return (
    <div className="min-h-screen bg-background relative flex flex-col pb-16 font-sans overflow-x-hidden">
      <Navbar />
      
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }} className="absolute inset-0 grid-background opacity-50 dark:opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-b from-violet-900/5 via-transparent to-background" />
      </div>
      
      <main className="container relative z-10 mx-auto px-4 pt-12 max-w-7xl flex flex-col gap-6 [perspective:1000px] pb-12 flex-grow">
        
        <motion.div initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} transition={{ duration: 0.7 }} className="flex flex-col items-center text-center mb-4 mt-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-6 bg-violet-500/10 border-violet-500/20 text-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                <Lock className={cn("w-3 h-3", isScanning && "animate-pulse")} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Cryptography Inspector</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-foreground mb-6 tracking-tight">
                SSL / TLS <span className="text-violet-500 drop-shadow-[0_0_20px_rgba(139,92,246,0.3)]">Analyzer</span>
            </h1>
            
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mb-10 leading-relaxed">
                Extract cryptographic profiles, verify public key strength, inspect cipher suites, and detect obsolete protocols vulnerable to downgrade attacks.
            </p>

            <form onSubmit={handleScan} className="w-full max-w-3xl relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/30 to-fuchsia-500/30 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-1000" />
                <div className="relative flex items-center bg-card border border-border rounded-full p-1.5 shadow-lg mx-auto">
                    <Search className="w-5 h-5 text-muted-foreground ml-4 shrink-0" />
                    <input
                        type="text"
                        placeholder="Target Domain (e.g., github.com)"
                        className="w-full bg-transparent border-none focus:outline-none text-foreground px-4 py-3 font-mono text-sm placeholder:text-muted-foreground/50"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        disabled={isScanning}
                    />
                    <Button type="submit" disabled={isScanning || !target} className="bg-violet-600 hover:bg-violet-500 text-white px-10 rounded-full font-bold tracking-wider text-sm h-12 transition-all shadow-[0_0_15px_rgba(139,92,246,0.4)]">
                        {isScanning ? 'ANALYZING...' : 'INSPECT'}
                    </Button>
                </div>
            </form>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
            
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-4 flex flex-col gap-6">
                <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden h-64 flex flex-col relative group">
                    <div className="absolute inset-0 bg-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <div className="bg-muted/30 px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
                        <span className="text-xs font-mono font-bold text-foreground/80 flex items-center gap-2">
                            <TerminalIcon className="w-3.5 h-3.5 text-violet-500" /> crypto_engine.log
                        </span>
                    </div>
                    <div className="p-4 font-mono text-[10px] leading-relaxed text-muted-foreground overflow-y-auto flex-1 custom-scrollbar">
                        {logs.length === 0 && !isScanning && !results && <span className="opacity-50 italic">Awaiting target domain...</span>}
                        {logs.map((log, i) => (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i} className="mb-1.5">
                                <span className="text-violet-500 mr-2">❯</span> {log}
                            </motion.div>
                        ))}
                        {isScanning && <div className="animate-pulse text-violet-500 mt-1">_</div>}
                    </div>
                </div>

                <AnimatePresence>
                    {results && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={cn("border rounded-2xl p-8 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[200px]", gradeColors[results.grade])}>
                            <p className="text-[10px] uppercase font-bold tracking-widest mb-2">Security Grade</p>
                            <span className="text-8xl font-display font-bold leading-none">{results.grade}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-8 bg-card border border-border rounded-2xl flex-1 overflow-hidden flex flex-col min-h-[450px] shadow-xl relative">
                <div className="bg-muted/30 px-6 py-4 border-b border-border flex justify-between items-center z-10">
                    <span className="text-sm font-bold flex items-center gap-2 uppercase tracking-tighter text-foreground">
                        <Key className="w-4 h-4 text-violet-500" /> Certificate Data
                    </span>
                    {results && (
                        <Button onClick={handleDownload} disabled={isDownloading} variant="outline" size="sm" className="h-7 text-xs border border-violet-500/30 text-violet-500 bg-violet-500/10 hover:bg-violet-500/20 transition-colors">
                            <Download className="w-3 h-3 mr-2" /> {isDownloading ? 'GENERATING...' : 'EXPORT REPORT'}
                        </Button>
                    )}
                </div>
                
                <div className="flex-1 p-6 md:p-8 bg-muted/10 relative overflow-y-auto custom-scrollbar">
                    
                    {/* --- NEW TLS HANDSHAKE PACKET ANIMATION --- */}
                    <AnimatePresence>
                        {isScanning && (
                            <motion.div 
                                initial={{ opacity: 0 }} 
                                animate={{ opacity: 1 }} 
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-background/90 backdrop-blur-md rounded-b-2xl"
                            >
                                <div className="flex items-center justify-center gap-4 md:gap-12 mb-10 relative w-full max-w-md px-8">
                                    
                                    {/* Client Node */}
                                    <motion.div 
                                        animate={{ boxShadow: ["0 0 0px rgba(139,92,246,0)", "0 0 20px rgba(139,92,246,0.5)", "0 0 0px rgba(139,92,246,0)"] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="z-10 bg-card p-4 rounded-xl border border-violet-500/40"
                                    >
                                        <TerminalIcon className="w-8 h-8 text-violet-400" />
                                    </motion.div>

                                    {/* Connection Track & Packets */}
                                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[50%] md:w-[60%] h-[2px] bg-violet-500/20 overflow-hidden">
                                        {/* ClientHello / Key Exchange Packet (Left to Right) */}
                                        <motion.div 
                                            animate={{ x: [-50, 300] }} 
                                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} 
                                            className="w-6 h-[2px] bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,1)] absolute top-0" 
                                        />
                                        {/* ServerHello / Certificate Packet (Right to Left) */}
                                        <motion.div 
                                            animate={{ x: [300, -50] }} 
                                            transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 0.75 }} 
                                            className="w-6 h-[2px] bg-fuchsia-500 shadow-[0_0_10px_rgba(217,70,239,1)] absolute top-0" 
                                        />
                                    </div>

                                    {/* Center Padlock / Key */}
                                    <motion.div 
                                        animate={{ scale: [0.9, 1.1, 0.9], rotate: [0, 5, -5, 0] }} 
                                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} 
                                        className="z-10 bg-background p-2 rounded-full border-2 border-violet-500/50 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                                    >
                                        <Key className="w-5 h-5 text-violet-500" />
                                    </motion.div>

                                    {/* Server Node */}
                                    <motion.div 
                                        animate={{ boxShadow: ["0 0 20px rgba(217,70,239,0.5)", "0 0 0px rgba(217,70,239,0)", "0 0 20px rgba(217,70,239,0.5)"] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        className="z-10 bg-card p-4 rounded-xl border border-fuchsia-500/40"
                                    >
                                        <Globe className="w-8 h-8 text-fuchsia-400" />
                                    </motion.div>

                                </div>
                                
                                <h3 className="text-lg md:text-xl font-display font-bold text-foreground mb-3 tracking-[0.2em] uppercase text-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]">
                                    Negotiating TLS Handshake
                                </h3>
                                
                                {/* Streaming Certificate Data Visualizer */}
                                <div className="h-6 overflow-hidden flex flex-col items-center">
                                    <motion.div 
                                        animate={{ y: [0, -40] }} 
                                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                        className="flex flex-col items-center gap-1 text-[10px] font-mono text-violet-500/60 uppercase tracking-widest"
                                    >
                                        <span>Exchanging ClientHello...</span>
                                        <span>Verifying Server Certificate...</span>
                                        <span>Extracting Public Key (RSA/ECC)...</span>
                                        <span>Negotiating Cipher Suites...</span>
                                        <span>Establishing Secure Session...</span>
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {!results && !isScanning && (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground/50 italic text-sm absolute inset-0">
                            <Lock className="w-16 h-16 mb-4 opacity-20" />
                            Provide a domain to view its cryptographic profile.
                        </div>
                    )}
                    
                    {error && <div className="p-4 text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl text-sm mb-4">{error}</div>}

                    {results && !isScanning && (
                        <div className="space-y-6">
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                <div className="bg-card border border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.05)] p-4 rounded-xl flex flex-col items-center justify-center text-center relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <Shield className="w-5 h-5 text-violet-500 mb-2" />
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Public Key</p>
                                    <p className="font-mono text-sm font-bold text-foreground mt-1 relative z-10">
                                        {results.cert_details.key_type} <span className="text-violet-500">({results.cert_details.key_size}-bit)</span>
                                    </p>
                                </div>
                                <div className="bg-card border border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.05)] p-4 rounded-xl flex flex-col items-center justify-center text-center md:col-span-2 relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <Network className="w-5 h-5 text-violet-500 mb-2" />
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Negotiated Cipher Suite</p>
                                    <p className="font-mono text-xs md:text-sm font-bold text-foreground mt-1 break-all relative z-10">
                                        {results.cert_details.negotiated_cipher}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-card border border-border p-4 rounded-xl">
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-1 mb-2"><Server className="w-3 h-3"/> Issuer</p>
                                    <p className="font-mono text-sm font-bold truncate text-violet-500">{results.cert_details.issuer}</p>
                                </div>
                                <div className="bg-card border border-border p-4 rounded-xl">
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-1 mb-2"><Search className="w-3 h-3"/> Subject / Domain</p>
                                    <p className="font-mono text-sm font-bold truncate">{results.cert_details.subject}</p>
                                </div>
                                <div className="bg-card border border-border p-4 rounded-xl flex justify-between items-center">
                                    <div>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-1 mb-2"><Calendar className="w-3 h-3"/> Valid From</p>
                                        <p className="font-mono text-sm font-bold">{results.cert_details.valid_from}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-1 mb-2"><Calendar className="w-3 h-3"/> Expires On</p>
                                        <p className="font-mono text-sm font-bold">{results.cert_details.valid_to}</p>
                                    </div>
                                </div>
                                <div className="bg-card border border-border p-4 rounded-xl flex items-center justify-center">
                                    <div className={cn("px-4 py-2 rounded-lg text-sm font-bold w-full text-center border", results.cert_details.days_remaining > 30 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20")}>
                                        {results.cert_details.days_remaining} Days Remaining
                                    </div>
                                </div>
                            </div>

                            {results.cert_details.sans && results.cert_details.sans.length > 0 && (
                                <div className="bg-card border border-border p-5 rounded-xl">
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-3">Subject Alternative Names (SANs)</p>
                                    <div className="flex flex-wrap gap-2">
                                        {results.cert_details.sans.map((san: string, idx: number) => (
                                            <span key={idx} className="px-2 py-1 text-[10px] font-mono rounded bg-muted text-muted-foreground border border-border">
                                                {san}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="bg-card border border-border p-5 rounded-xl">
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-4">Supported TLS Protocols</p>
                                <div className="flex flex-wrap gap-2">
                                    {results.supported_protocols.map((proto: string) => (
                                        <span key={proto} className={cn("px-3 py-1 text-xs font-bold font-mono rounded border", proto.includes("Obsolete") ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20")}>
                                            {proto}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-card border border-border p-5 rounded-xl">
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-4">Cryptographic Findings</p>
                                <ul className="space-y-3">
                                    {results.vulnerabilities.map((v: string, i: number) => (
                                        <li key={i} className={cn("text-sm flex items-start gap-3 p-3 rounded-lg border", v.includes("VULNERABILITY") || v.includes("CRITICAL") ? "bg-red-500/5 border-red-500/20 text-red-500 font-bold" : v.includes("WARNING") ? "bg-yellow-500/5 border-yellow-500/20 text-yellow-500" : "bg-emerald-500/5 border-emerald-500/20 text-emerald-500")}>
                                            {v.includes("VULNERABILITY") || v.includes("CRITICAL") ? <ShieldAlert className="w-5 h-5 mt-0.5 shrink-0" /> : <ShieldCheck className="w-5 h-5 mt-0.5 shrink-0" />}
                                            <span className="leading-relaxed">{v}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
      </main>
    </div>
  );
}