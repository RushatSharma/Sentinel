import { motion } from "framer-motion";
import { ArrowRight, Activity, ShieldCheck, Lock, Terminal } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";

export function HeroSection() {
  return (
    <section className="relative pt-20 pb-32 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 w-full h-full grid-background" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      
      <div className="container relative z-10 mx-auto px-4">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* --- LEFT COLUMN: CONTENT --- */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 text-center lg:text-left mx-auto lg:mx-0 max-w-xl lg:max-w-none lg:pl-14"
          >
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sentinel-blue opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sentinel-blue" />
              </span>
              <span className="text-sm font-medium text-muted-foreground">Red Team × Blue Team Integration</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
              <span className="text-foreground">Bridge the Gap Between</span><br />
              <span className="text-sentinel-red">Finding</span> <span className="text-foreground">and</span> <span className="text-sentinel-blue">Fixing</span>
            </h1>

            {/* Subheadline with Bullet Points */}
            <div className="text-lg md:text-xl text-muted-foreground mb-10 mx-auto lg:mx-0 max-w-3xl">
              <p className="mb-6 leading-relaxed">
                The compliance-first security platform designed to unify offensive discovery with defensive protocols:
              </p>
              
              {/* Vertical Space: Bullet Points */}
              <ul className="space-y-4 text-left inline-block w-full">
                <li className="flex items-start gap-3">
                  {/* Red Dot (Offense) */}
                  <div className="mt-2.5 h-2 w-2 rounded-full bg-sentinel-red shadow-[0_0_8px_hsl(var(--offense-red))] flex-shrink-0" />
                  <span>
                    Discovers <strong className="text-foreground">Shadow APIs</strong> and maps vulnerabilities to <strong className="text-foreground">GDPR & PCI-DSS</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  {/* Blue Dot (Defense) */}
                  <div className="mt-2.5 h-2 w-2 rounded-full bg-sentinel-blue shadow-[0_0_8px_hsl(var(--defense-blue))] flex-shrink-0" />
                  <span>
                    Generates <strong className="text-foreground">executive-ready reports</strong> for immediate compliance auditing.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                   {/* Red Dot (Offense) */}
                  <div className="mt-2.5 h-2 w-2 rounded-full bg-sentinel-red shadow-[0_0_8px_hsl(var(--offense-red))] flex-shrink-0" />
                  <span>
                    Detects complex logic flaws like <strong className="text-foreground">SQL Injection and XSS</strong> in real-time.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                   {/* Blue Dot (Defense) */}
                  <div className="mt-2.5 h-2 w-2 rounded-full bg-sentinel-blue shadow-[0_0_8px_hsl(var(--defense-blue))] flex-shrink-0" />
                  <span>
                    Secure your entire <strong className="text-foreground">SDLC</strong> without slowing down innovation.
                  </span>
                </li>
              </ul>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/dashboard">
                <Button variant="sentinel" size="lg" className="group w-full sm:w-auto text-base px-8 py-6">
                 Explore more tools <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* --- RIGHT COLUMN: CONSOLE SCANNER --- */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="lg:col-span-5 relative w-full max-w-[600px] mx-auto lg:mr-0 lg:ml-auto"
          >
            {/* Console Container */}
            <div className="terminal-window border-white/10 bg-[#0a0a0a] shadow-2xl relative overflow-hidden group">
              {/* Top Glow Accent */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-sentinel-blue/50 to-transparent opacity-50" />
              
              {/* Console Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                  </div>
                  <span className="text-sm font-mono text-gray-300 ml-2">sentinel_v2.0_live_env</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
                  <span className="text-xs font-mono text-emerald-500 uppercase tracking-wider">System Online</span>
                </div>
              </div>

              {/* Console Content */}
              <div className="p-6 text-left relative">
                {/* Background Grid inside console */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
                
                {/* Vertical Stack Layout for Side Column */}
                <div className="relative z-10 flex flex-col gap-6">
                  {/* Info Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-sentinel-blue/10 rounded-xl">
                        <ShieldCheck className="w-6 h-6 text-sentinel-blue" />
                      </div>
                      <h3 className="text-xl font-display font-semibold text-white">Advanced Intelligence</h3>
                    </div>
                    <p className="text-base text-gray-300 leading-relaxed">
                      Deploy heuristic engines to detect <span className="text-sentinel-red font-medium">SQLi</span>, <span className="text-sentinel-red font-medium">XSS</span>, and <span className="text-sentinel-red font-medium">Shadow APIs</span>.
                    </p>
                    <div className="flex flex-wrap gap-2 text-xs font-mono text-gray-300">
                      <span className="px-2 py-1 bg-white/5 rounded-md border border-white/5">AES-256</span>
                      <span className="px-2 py-1 bg-white/5 rounded-md border border-white/5">TLS 1.3</span>
                      <span className="px-2 py-1 bg-white/5 rounded-md border border-white/5">SOC2 Type II</span>
                    </div>
                  </div>

                  {/* Input Action Section */}
                  <div className="bg-black/40 p-2 rounded-xl border border-white/10 mt-2">
                    <div className="flex flex-col gap-3">
                      <div className="relative">
                        <Terminal className="absolute left-4 top-3.5 w-5 h-5 text-gray-300" />
                        <input 
                          type="text" 
                          placeholder="https://target-app.com"
                          className="w-full bg-white/5 border border-white/5 rounded-lg py-3 pl-12 pr-4 text-sm text-white font-mono focus:outline-none focus:border-sentinel-blue/50 focus:bg-sentinel-blue/5 transition-all placeholder:text-gray-400"
                        />
                      </div>
                      <Button className="w-full bg-sentinel-red hover:bg-sentinel-red/90 text-white font-mono text-sm tracking-wider h-12 shadow-[0_0_15px_hsl(var(--offense-red)/0.3)]">
                        <Lock className="w-4 h-4 mr-2" />
                        START_AUDIT
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}