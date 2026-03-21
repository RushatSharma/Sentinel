import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { Lock, Search, ShieldCheck, ShieldAlert, Terminal as TerminalIcon, Calendar, Server, Key, Shield, Network, Download } from 'lucide-react';
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
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </div>
      
      <main className="container relative z-10 mx-auto px-4 pt-12 max-w-7xl flex flex-col gap-6 [perspective:1000px] pb-12 flex-grow">
        
        <motion.div initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} transition={{ duration: 0.7 }} className="flex flex-col items-center text-center mb-4 mt-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-6 bg-indigo-500/10 border-indigo-500/20 text-indigo-500">
                <Lock className={cn("w-3 h-3", isScanning && "animate-pulse")} />
                <span className="text-[10px] font-bold uppercase tracking-widest">Cryptography Inspector</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-foreground mb-6 tracking-tight">
                SSL / TLS <span className="text-indigo-500">Analyzer</span>
            </h1>
            
            <p className="text-base md:text-lg text-muted-foreground max-w-3xl mb-10 leading-relaxed">
                Extract cryptographic profiles, verify public key strength, inspect cipher suites, and detect obsolete protocols vulnerable to downgrade attacks.
            </p>

            <form onSubmit={handleScan} className="w-full max-w-3xl relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600/20 to-blue-600/20 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-1000" />
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
                    <Button type="submit" disabled={isScanning || !target} className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 rounded-full font-bold tracking-wider text-sm h-12 transition-all">
                        {isScanning ? 'ANALYZING...' : 'INSPECT'}
                    </Button>
                </div>
            </form>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
            
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-4 flex flex-col gap-6">
                <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden h-64 flex flex-col">
                    <div className="bg-muted/30 px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
                        <span className="text-xs font-mono font-bold text-foreground/80 flex items-center gap-2">
                            <TerminalIcon className="w-3.5 h-3.5 text-indigo-500" /> crypto_engine.log
                        </span>
                    </div>
                    <div className="p-4 font-mono text-[10px] leading-relaxed text-muted-foreground overflow-y-auto flex-1 custom-scrollbar">
                        {logs.length === 0 && !isScanning && !results && <span className="opacity-50 italic">Awaiting target domain...</span>}
                        {logs.map((log, i) => (
                            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={i} className="mb-1.5">
                                <span className="text-indigo-500 mr-2">❯</span> {log}
                            </motion.div>
                        ))}
                        {isScanning && <div className="animate-pulse text-indigo-500 mt-1">_</div>}
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
                        <Key className="w-4 h-4 text-indigo-500" /> Certificate Data
                    </span>
                    {/* --- EXPORT REPORT BUTTON --- */}
                    {results && (
                        <Button onClick={handleDownload} disabled={isDownloading} variant="outline" size="sm" className="h-7 text-xs border border-indigo-500/20 text-indigo-500 bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors">
                            <Download className="w-3 h-3 mr-2" /> {isDownloading ? 'GENERATING...' : 'EXPORT REPORT'}
                        </Button>
                    )}
                </div>
                
                <div className="flex-1 p-6 md:p-8 bg-muted/10 relative overflow-y-auto custom-scrollbar">
                    {!results && !isScanning && (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground/50 italic text-sm absolute inset-0">
                            <Lock className="w-16 h-16 mb-4 opacity-20" />
                            Provide a domain to view its cryptographic profile.
                        </div>
                    )}
                    
                    {error && <div className="p-4 text-red-500 bg-red-500/10 border border-red-500/20 rounded-xl text-sm mb-4">{error}</div>}

                    {results && (
                        <div className="space-y-6">
                            
                            {/* --- Advanced Cryptography Metrics --- */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                <div className="bg-card border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.05)] p-4 rounded-xl flex flex-col items-center justify-center text-center">
                                    <Shield className="w-5 h-5 text-indigo-500 mb-2" />
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Public Key</p>
                                    <p className="font-mono text-sm font-bold text-foreground mt-1">
                                        {results.cert_details.key_type} <span className="text-indigo-500">({results.cert_details.key_size}-bit)</span>
                                    </p>
                                </div>
                                <div className="bg-card border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.05)] p-4 rounded-xl flex flex-col items-center justify-center text-center md:col-span-2">
                                    <Network className="w-5 h-5 text-indigo-500 mb-2" />
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Negotiated Cipher Suite</p>
                                    <p className="font-mono text-xs md:text-sm font-bold text-foreground mt-1 break-all">
                                        {results.cert_details.negotiated_cipher}
                                    </p>
                                </div>
                            </div>

                            {/* Certificate Metadata */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-card border border-border p-4 rounded-xl">
                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-1 mb-2"><Server className="w-3 h-3"/> Issuer</p>
                                    <p className="font-mono text-sm font-bold truncate text-indigo-500">{results.cert_details.issuer}</p>
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

                            {/* Hidden SAN Domains */}
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

                            {/* Supported Protocols */}
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

                            {/* Vulnerabilities */}
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