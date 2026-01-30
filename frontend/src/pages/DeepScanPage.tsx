import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Navbar } from "../components/Navbar";
import { Button } from "../components/ui/button";
import { 
  Zap, Server, ShieldAlert, Clock, Terminal, Layers, AlertTriangle, FileText 
} from "lucide-react";

export default function DeepScanPage() {
  const [url, setUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleDeepScan = async () => {
    if (!url) return;
    setLoading(true);
    
    // Simulate the initialization time of Playwright
    setTimeout(() => {
        setLoading(false);
        navigate(`/scan-results?url=${encodeURIComponent(url)}&mode=deep`);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-background relative flex flex-col overflow-hidden">
      <Navbar />
      
      {/* Background Effects */}
      <div className="absolute inset-0 w-full h-full grid-background pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />

      {/* Main Container */}
      <div className="container relative z-10 mx-auto px-4 pt-20 pb-6 flex-grow flex items-center justify-center">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start w-full"> 
          
         {/* --- LEFT COLUMN: INFORMATION & WARNINGS --- */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ duration: 0.8 }}
          className="lg:col-span-7 text-left lg:-mt-12" 
        >
             {/* Time Warning Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 mb-8">
              <Clock className="w-4 h-4 text-sentinel-red animate-pulse" />
              <span className="text-sm font-medium text-red-400">Deep Scan Duration: ~45-90 seconds</span>
            </div>

            {/* Heading */}
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
              <span className="text-foreground">Active Heuristic</span><br />
              <span className="bg-gradient-to-r from-sentinel-red to-red-600 bg-clip-text text-transparent">
                Warfare Engine
              </span>
            </h1>

            {/* Description */}
            <div className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl">
              <p className="mb-8 leading-relaxed">
                This is not a passive scan. Sentinel launches a <strong>headless browser instance</strong> to interact with your application, injecting payloads into forms and analyzing dynamic DOM responses.
              </p>
              
              {/* Feature List */}
              <div className="bg-secondary/30 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-sentinel-red" /> Execution Protocol
                </h3>
                <ul className="space-y-4 text-left text-base">
                  <li className="flex items-start gap-3">
                    <div className="mt-1.5 p-1 bg-red-500/10 rounded-md border border-red-500/20">
                        <Server className="w-4 h-4 text-sentinel-red" />
                    </div>
                    <span>
                      <strong className="text-foreground block mb-1">Infrastructure Enumeration</strong>
                      Brute-forces common sensitive files (e.g., <span className="font-mono text-xs bg-muted px-1 rounded">.env</span>, <span className="font-mono text-xs bg-muted px-1 rounded">/backup.sql</span>) to detect leaks.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1.5 p-1 bg-red-500/10 rounded-md border border-red-500/20">
                        <Zap className="w-4 h-4 text-sentinel-red" />
                    </div>
                    <span>
                      <strong className="text-foreground block mb-1">Active Input Fuzzing</strong>
                      Uses <strong className="text-red-400 font-mono text-sm">Playwright</strong> to type SQLi and XSS payloads into real forms and listen for server crashes.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>

          {/* --- RIGHT COLUMN: CONSOLE SCANNER (DEEP SCAN) --- */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="lg:col-span-5 relative w-full max-w-[600px] mx-auto lg:mr-0 lg:ml-auto lg:-mt-18"
          >
            {/* Console Container */}
            <div className="terminal-window border-red-500/20 bg-[#0a0a0a] shadow-[0_0_50px_-12px_rgba(220,38,38,0.3)] relative overflow-hidden group rounded-xl">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent opacity-50" />
              
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50 animate-pulse" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                  </div>
                  <span className="text-sm font-mono text-red-400 ml-2">deep_scan_module</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-sentinel-red" />
                  <span className="text-xs font-mono text-sentinel-red uppercase tracking-wider">Standby</span>
                </div>
              </div>

              <div className="p-6 text-left relative">
                 <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
                
                <div className="relative z-10 flex flex-col gap-6">
                  {/* Info Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-red-500/10 rounded-xl">
                        <Zap className="w-6 h-6 text-sentinel-red" />
                      </div>
                      <h3 className="text-xl font-display font-semibold text-white">Initialize Attack Vector</h3>
                    </div>
                    <p className="text-base text-gray-300 leading-relaxed">
                      Enter root domain. The engine will map the application tree before initiating active attacks.
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs font-mono text-red-300/70">
                        <span className="px-2 py-1 bg-red-500/5 rounded-md border border-red-500/10">Playwright Engine</span>
                        <span className="px-2 py-1 bg-red-500/5 rounded-md border border-red-500/10">Header Analysis</span>
                        <span className="px-2 py-1 bg-red-500/5 rounded-md border border-red-500/10">DOM Fuzzing</span>
                    </div>
                  </div>

                   {/* Input Action Section */}
                   <div className="bg-black/40 p-2 rounded-xl border border-white/10 mt-2 relative overflow-hidden">
                    {loading && (
                        <div className="absolute inset-0 bg-[#0a0a0a] z-20 flex flex-col justify-center p-6 font-mono text-xs text-red-400 space-y-2">
                            <p className="animate-pulse">{">"} Initializing Playwright...</p>
                            <p className="delay-100">{">"} Allocating Chromium [PID: 4922]...</p>
                            <p className="delay-300">{">"} Injecting SQLi Payloads...</p>
                            <p className="delay-500 text-red-500 font-bold">{">"} WARN: Intrusive protocols engaged.</p>
                        </div>
                    )}

                    <div className={`flex flex-col gap-3 transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}>
                      <div className="relative">
                        <Terminal className="absolute left-4 top-3.5 w-5 h-5 text-gray-300" />
                        <input 
                          type="text" 
                          placeholder="https://target-app.com"
                          className="w-full bg-white/5 border border-white/5 rounded-lg py-3 pl-12 pr-4 text-sm text-white font-mono focus:outline-none focus:border-red-500/50 focus:bg-red-500/5 transition-all placeholder:text-gray-500"
                          value={url}
                          onChange={(e) => setUrl(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleDeepScan()}
                        />
                      </div>
                      <Button 
                        onClick={handleDeepScan}
                        disabled={loading || !url}
                        className="w-full bg-red-600 hover:bg-red-500 text-white font-mono text-sm tracking-wider h-12 shadow-[0_0_20px_rgba(220,38,38,0.9)] transition-all"
                      >
                        <Zap className="w-4 h-4 mr-2 fill-current" />
                        LAUNCH_DEEP_ANALYSIS
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}