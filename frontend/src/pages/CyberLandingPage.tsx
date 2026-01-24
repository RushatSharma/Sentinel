import { useState } from "react";
import { Shield, Lock, Activity, Server, ArrowRight, X, Menu, Terminal, AlertTriangle, Eye } from "lucide-react";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";

// --- COMPONENTS ---

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-xl border-b border-white/5 bg-background/50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-blue opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-neon-blue"></span>
          </div>
          <span className="font-display font-bold text-xl tracking-widest text-foreground">
            SENTINEL<span className="text-neon-blue">.AI</span>
          </span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {["Red Team", "Blue Team", "Pricing"].map((item) => (
            <a key={item} href="#" className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-neon-blue transition-colors">
              {item}
            </a>
          ))}
        </div>

        {/* CTA Button */}
        <div className="hidden md:block">
          <Button className="bg-neon-blue text-background hover:bg-neon-blue/80 font-mono text-xs uppercase tracking-wider px-6 font-bold shadow-[0_0_20px_rgba(0,200,255,0.3)]">
            Deploy Sentinel
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-foreground" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-background border-b border-border p-6 flex flex-col gap-4">
          {["Red Team", "Blue Team", "Pricing"].map((item) => (
            <a key={item} href="#" className="text-sm font-mono uppercase text-foreground hover:text-neon-blue">
              {item}
            </a>
          ))}
        </div>
      )}
    </nav>
  );
};

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-6 overflow-hidden pt-20">
      {/* Background Effects: Red vs Blue Duality */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-neon-blue/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-neon-red/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
      
      {/* Animated Scan Line */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-50 animate-[float_4s_ease-in-out_infinite]" />

      <div className="relative z-10 max-w-5xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/10 bg-background/50 backdrop-blur-md">
          <div className="flex gap-1">
             <div className="w-1.5 h-1.5 bg-neon-red rounded-full animate-pulse" />
             <div className="w-1.5 h-1.5 bg-neon-blue rounded-full animate-pulse delay-75" />
          </div>
          <span className="text-muted-foreground text-[10px] font-mono tracking-[0.3em] uppercase">
            Live Threat Analysis
          </span>
        </div>

        <h1 className="font-display text-5xl md:text-8xl font-bold uppercase leading-[0.9] tracking-tighter text-foreground">
          Think Like a <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-red to-neon-red/70 drop-shadow-[0_0_10px_rgba(255,50,80,0.5)]">Hacker.</span> <br />
          Defend Like a <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-blue/70 drop-shadow-[0_0_10px_rgba(0,200,255,0.5)]">Pro.</span>
        </h1>

        <p className="max-w-2xl mx-auto text-muted-foreground text-lg leading-relaxed">
          The only platform that combines <span className="text-neon-red">offensive simulation</span> with <span className="text-neon-blue">automated defense</span> to secure your infrastructure in real-time.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6 w-full max-w-md mx-auto relative mt-8">
           <Button className="w-full md:w-auto rounded-full h-12 px-8 bg-neon-blue text-background hover:bg-neon-blue/90 font-bold tracking-wide shadow-[0_0_20px_rgba(0,200,255,0.4)]">
            Start Blue Team (Defense)
          </Button>
          <Button variant="outline" className="w-full md:w-auto rounded-full h-12 px-8 border-neon-red/50 text-neon-red hover:bg-neon-red/10 font-bold tracking-wide shadow-[0_0_10px_rgba(255,50,80,0.2)]">
            Start Red Team (Attack)
          </Button>
        </div>
      </div>
    </section>
  );
};

const FeatureGrid = () => {
  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Red Card: Offensive */}
          <div className="group relative bg-card border border-border p-8 rounded-2xl overflow-hidden hover:border-neon-red/50 transition-all duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
              <AlertTriangle className="text-neon-red w-8 h-8" />
            </div>
            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-neon-red/10 blur-3xl rounded-full group-hover:bg-neon-red/20 transition-all" />
            
            <h3 className="font-mono text-xs text-neon-red mb-4 uppercase tracking-widest">Offensive Engine</h3>
            <h4 className="font-display text-2xl font-bold text-foreground mb-3">Automated Pentesting</h4>
            <p className="text-muted-foreground text-sm">Simulate sophisticated cyber attacks on your own network to identify weak points before they do.</p>
          </div>

          {/* Center Card: Core AI */}
          <div className="relative border-gradient-cyber p-[1px] rounded-2xl">
            <div className="bg-card rounded-2xl h-full p-8 flex flex-col items-center text-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 to-neon-red/5" />
                <div className="h-16 w-16 bg-background rounded-full flex items-center justify-center mb-6 shadow-lg border border-white/10 z-10">
                    <Shield className="h-8 w-8 text-foreground" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground mb-2 z-10">Sentinel Core AI</h3>
                <p className="text-muted-foreground text-sm z-10 mb-6">Real-time arbitration between attack data and defense protocols.</p>
                <Button variant="ghost" className="text-xs font-mono border border-white/10 rounded-full hover:bg-white/5 z-10">
                    View Architecture
                </Button>
            </div>
          </div>

          {/* Blue Card: Defensive */}
          <div className="group relative bg-card border border-border p-8 rounded-2xl overflow-hidden hover:border-neon-blue/50 transition-all duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
              <Lock className="text-neon-blue w-8 h-8" />
            </div>
            <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-neon-blue/10 blur-3xl rounded-full group-hover:bg-neon-blue/20 transition-all" />
            
            <h3 className="font-mono text-xs text-neon-blue mb-4 uppercase tracking-widest">Defensive Engine</h3>
            <h4 className="font-display text-2xl font-bold text-foreground mb-3">Auto-Remediation</h4>
            <p className="text-muted-foreground text-sm">Instantly patch vulnerabilities and block IPs as soon as the Red Engine detects a breach.</p>
          </div>

        </div>
      </div>
    </section>
  );
};

const DashboardPreview = () => {
    return (
        <section className="py-24 px-6 border-t border-border bg-gradient-to-b from-background to-card/50">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-16 space-y-4">
                    <h2 className="font-display text-4xl font-bold text-foreground">Mission Control</h2>
                    <p className="text-muted-foreground">Unified visibility across your entire attack surface.</p>
                </div>
                
                {/* Abstract Dashboard UI */}
                <div className="relative w-full aspect-video bg-card border border-border rounded-xl shadow-2xl overflow-hidden group">
                    {/* Header */}
                    <div className="h-12 border-b border-border bg-secondary/30 flex items-center px-4 gap-2">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500/50" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                            <div className="w-3 h-3 rounded-full bg-green-500/50" />
                        </div>
                        <div className="ml-4 h-6 w-64 bg-secondary/50 rounded text-[10px] font-mono flex items-center px-2 text-muted-foreground">
                            sentinel-dashboard://live-view
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 grid grid-cols-12 gap-6 h-full">
                        {/* Sidebar */}
                        <div className="col-span-2 space-y-2 hidden md:block">
                            {[1,2,3,4,5].map(i => (
                                <div key={i} className="h-8 w-full bg-secondary/30 rounded animate-pulse" style={{animationDelay: `${i * 100}ms`}} />
                            ))}
                        </div>
                        
                        {/* Main Graph Area */}
                        <div className="col-span-12 md:col-span-7 space-y-4">
                            <div className="flex justify-between items-center mb-4">
                                <div className="h-4 w-32 bg-neon-blue/20 rounded" />
                                <div className="h-4 w-16 bg-neon-red/20 rounded" />
                            </div>
                            <div className="h-48 w-full bg-gradient-to-t from-neon-blue/10 to-transparent rounded border border-neon-blue/20 relative">
                                {/* Fake Graph Line */}
                                <svg className="absolute bottom-0 left-0 w-full h-full" preserveAspectRatio="none">
                                    <path d="M0,100 C150,80 300,120 450,60 L450,200 L0,200 Z" fill="rgba(0, 200, 255, 0.1)" />
                                    <path d="M0,100 C150,80 300,120 450,60" fill="none" stroke="rgba(0, 200, 255, 0.8)" strokeWidth="2" />
                                </svg>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="h-24 bg-card border border-border rounded p-4">
                                    <div className="text-neon-blue font-mono text-xs mb-2">Systems Online</div>
                                    <div className="text-3xl font-display font-bold">98.2%</div>
                                </div>
                                <div className="h-24 bg-card border border-border rounded p-4">
                                    <div className="text-neon-red font-mono text-xs mb-2">Active Threats</div>
                                    <div className="text-3xl font-display font-bold">12</div>
                                </div>
                            </div>
                        </div>

                        {/* Logs Panel */}
                        <div className="col-span-12 md:col-span-3 bg-black/40 rounded border border-white/5 p-4 font-mono text-[10px] text-green-400 space-y-1 overflow-hidden">
                            <div className="text-neon-red">> [ALERT] Port 22 Brute force detected</div>
                            <div className="text-muted-foreground">> [INFO] IP 192.168.1.55 flagged</div>
                            <div className="text-neon-blue">> [AUTO] Firewall rule updated</div>
                            <div className="text-muted-foreground">> [INFO] Scanning subnets...</div>
                            <div className="text-neon-blue">> [SUCCESS] Payload neutralized</div>
                             <div className="text-muted-foreground animate-pulse">_</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

// --- MAIN PAGE COMPONENT ---

export default function CyberLandingPage() {
  return (
    <div className="bg-background min-h-screen text-foreground font-sans selection:bg-neon-blue selection:text-black">
      <Navbar />
      <HeroSection />
      <FeatureGrid />
      <DashboardPreview />
      
      {/* Footer Simple */}
      <footer className="py-8 border-t border-white/5 text-center text-xs font-mono text-muted-foreground">
        <p>SENTINEL SECURITY SYSTEMS © 2026</p>
      </footer>
    </div>
  );
}