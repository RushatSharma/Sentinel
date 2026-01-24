import { motion } from "framer-motion";
import { ArrowRight, Play, Terminal, Activity, ShieldCheck, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

export function HeroSection() {
  return (
    <section className="relative pt-20 pb-32 overflow-hidden text-center">
      <div className="absolute inset-0 grid-background" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      
      <div className="container relative z-10 mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 mx-auto">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sentinel-blue opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sentinel-blue" />
            </span>
            <span className="text-sm font-medium text-muted-foreground">Red Team × Blue Team Integration</span>
          </div>

          {/* Main Headline */}
          <h1 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-6">
            <span className="text-foreground">Bridge the Gap Between</span><br />
            <span className="text-gradient-red">Finding</span> <span className="text-foreground">and</span> <span className="text-gradient-blue">Fixing</span>
          </h1>

          {/* Subheadline */}
          <p className="text-[20px] text-muted-foreground max-w-2xl mx-auto mb-10">
            The compliance-first security platform that discovers Shadow APIs, maps vulnerabilities to GDPR & PCI-DSS, and generates executive-ready reports.
          </p>

          {/* Buttons */}
          
          {/* --- NEW DASHBOARD SCANNER SECTION (Theme Updated) --- */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="max-w-3xl mx-auto"
          >
            {/* Console Container - UPDATED for Theme Support */}
            <div className="terminal-window border-border/40 dark:border-white/10 bg-background/80 dark:bg-[#0a0a0a]/90 backdrop-blur-md shadow-2xl relative overflow-hidden group">
              {/* Top Glow Accent */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-sentinel-blue/50 to-transparent opacity-50" />
              
              {/* Console Header - UPDATED */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02]">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                  </div>
                  <span className="text-[15px] font-mono text-muted-foreground ml-2">sentinel_v2.0_live_env</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
                  <span className="text-[15px] font-mono text-emerald-500 uppercase tracking-wider">System Online</span>
                </div>
              </div>

              {/* Console Content */}
              <div className="p-8 text-left relative">
                {/* Background Grid inside console */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
                
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
                  {/* Left Side: Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-sentinel-blue" />
                      <h3 className="text-xl font-display font-semibold text-foreground">Advanced Security Intelligence</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Deploy heuristic engines to detect <span className="text-sentinel-red">SQL Injection</span>, <span className="text-sentinel-red">XSS</span>, and <span className="text-sentinel-red">Shadow APIs</span>. Automated compliance mapping for GDPR & OWASP.
                    </p>
                    {/* Tags - UPDATED */}
                    <div className="flex gap-2 text-[10px] font-mono text-muted-foreground pt-2">
                      <span className="px-2 py-1 bg-black/5 dark:bg-white/5 rounded border border-black/5 dark:border-white/5">AES-256</span>
                      <span className="px-2 py-1 bg-black/5 dark:bg-white/5 rounded border border-black/5 dark:border-white/5">TLS 1.3</span>
                      <span className="px-2 py-1 bg-black/5 dark:bg-white/5 rounded border border-black/5 dark:border-white/5">SOC2 Type II</span>
                    </div>
                  </div>

                  {/* Right Side: Action Input - UPDATED container background/border */}
                  <div className="w-full md:w-auto md:min-w-[320px] bg-black/5 dark:bg-black/40 p-1 rounded-xl border border-black/5 dark:border-white/10">
                    <div className="flex flex-col gap-2">
                      <div className="relative">
                        <Terminal className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        {/* Input Field - UPDATED background/border */}
                        <input 
                          type="text" 
                          placeholder="https://target-app.com"
                          className="w-full bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-lg py-2.5 pl-10 pr-4 text-sm text-foreground font-mono focus:outline-none focus:border-sentinel-blue/50 focus:bg-sentinel-blue/5 transition-all placeholder:text-muted-foreground/50"
                        />
                      </div>
                      <Button className="w-full bg-sentinel-blue hover:bg-sentinel-blue/90 text-white font-mono text-xs tracking-wider h-10 shadow-[0_0_15px_rgba(0,70,255,0.3)]">
                        <Lock className="w-3 h-3 mr-2" />
                        START_AUDIT
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}