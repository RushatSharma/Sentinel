import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
    Shield, 
    Zap, 
    Globe, 
    Lock, 
    Code, 
    Target,
    ArrowRight,
    CheckCircle2,
    Server,
    Database,
    Cpu,
    TerminalSquare,
    Layers,
    GitBranch,
    Activity,
    Search,
    FileText,
    Siren,
    Terminal,
    Hash,
    BarChart3,
    Wifi,
    HardDrive,
    Network,
    AlertTriangle,
    ShieldAlert,
    LockKeyhole,
    RefreshCw
} from "lucide-react";

const AboutPage = () => {
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [randomHex, setRandomHex] = useState<string[]>([]);
  const [threatLogs, setThreatLogs] = useState<{time: string, type: string, status: string}[]>([]);
  
  useEffect(() => {
    setMounted(true);
    
    // Theme Observer
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });

    // Generate random hex data
    const generateHex = () => {
        const chars = "0123456789ABCDEF";
        const lines = [];
        for(let i=0; i<12; i++) {
            let line = "";
            for(let j=0; j<24; j++) {
                line += chars[Math.floor(Math.random() * chars.length)];
            }
            lines.push(line);
        }
        setRandomHex(lines);
    };

    // Generate random threat logs
    const generateThreatLog = () => {
         const types = ["SQL Injection", "XSS Attempt", "Brute Force", "Packet Flood", "C2 Beacon", "Zero-Day"];
         const statuses = ["BLOCKED", "MITIGATED", "ISOLATED"];
         const newLog = {
             time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
             type: types[Math.floor(Math.random() * types.length)],
             status: statuses[Math.floor(Math.random() * statuses.length)]
         };
         // Keep last 5 logs
         setThreatLogs(prev => [newLog, ...prev].slice(0, 5));
    };
    
    generateHex();
    generateThreatLog();
    const hexInterval = setInterval(generateHex, 1500);
    const logInterval = setInterval(generateThreatLog, 2500);

    return () => {
        observer.disconnect();
        clearInterval(hexInterval);
        clearInterval(logInterval);
    };
  }, []);

  const teamMembers = [
    { name: "Alex Cipher", role: "Lead Researcher", initial: "AC", expertise: "Exploit Dev" },
    { name: "Sarah Firewall", role: "Infrastructure", initial: "SF", expertise: "Cloud Sec" },
    { name: "Mike Vector", role: "Threat Analyst", initial: "MV", expertise: "Malware Analysis" },
    { name: "Emily Hash", role: "Cryptography", initial: "EH", expertise: "Zero-Knowledge" },
  ];

  const timelineEvents = [
    {
      year: "2023",
      title: "The Python Script",
      desc: "Sentinel begins as a simple 50-line port scanner written during a CTF competition to automate recon.",
      icon: <TerminalSquare className="w-5 h-5" />
    },
    {
      year: "2024",
      title: "The Heuristic Engine",
      desc: "Integration of CVSS risk scoring and basic pattern matching, moving from simple scanning to intelligent analysis.",
      icon: <Cpu className="w-5 h-5" />
    },
    {
      year: "2025",
      title: "Sentinel Cloud Platform",
      desc: "Full-scale SaaS launch with Dashboard, API access, PDF reporting, and team collaboration features.",
      icon: <Globe className="w-5 h-5" />
    }
  ];

  const animationKey = isDarkMode ? 'dark' : 'light';
  const liquidTextClass = "transition-all duration-1000 ease-out";

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden font-sans">
      <Navbar />
      
      <main className="flex-grow relative">
        {/* --- GLOBAL BACKGROUND --- */}
        <div className="absolute inset-0 grid-background pointer-events-none opacity-40 dark:opacity-20" />
        
        {/* --- HERO SECTION: COMPACT COMMAND CENTER --- */}
        {/* lg:h-[calc(100vh-64px)] ensures it fits perfectly on desktop without scrolling */}
        <section className="relative pt-4 pb-4 lg:pt-0 lg:pb-0 overflow-hidden min-h-[calc(100vh-64px)] lg:h-[calc(100vh-64px)] flex flex-col justify-center">
          <div className="container mx-auto px-4 relative z-10 h-full flex-grow flex flex-col py-4">
            
            {/* The Main Flex Container */}
            <div className="flex flex-col lg:flex-row gap-0 border border-border bg-background/40 backdrop-blur-md shadow-2xl flex-grow rounded-lg overflow-hidden h-full">
                
                {/* 1. LEFT ZONE: Main Interface (65% Width) */}
                <div className="lg:w-[65%] p-6 lg:p-10 flex flex-col justify-between relative border-b lg:border-b-0 lg:border-r border-border h-full">
                    
                    {/* Top Decor */}
                    <div className="flex justify-between items-start">
                         <div 
                            key={`badge-${animationKey}`}
                            className={`inline-flex items-center gap-2 px-3 py-1 text-xs font-mono font-bold tracking-widest text-primary uppercase border-l-2 border-primary pl-3 ${liquidTextClass}`}
                        >
                            <span>// System Architecture v2.4</span>
                        </div>
                        <div className="hidden sm:flex gap-1.5">
                             <div className="w-1.5 h-1.5 bg-muted-foreground/30 rounded-sm" />
                             <div className="w-1.5 h-1.5 bg-muted-foreground/30 rounded-sm" />
                             <div className="w-1.5 h-1.5 bg-primary rounded-sm animate-pulse" />
                        </div>
                    </div>

                    {/* Center Content */}
                    <div className="space-y-6 max-w-2xl my-auto">
                        <h1 
                            key={`heading-${animationKey}`}
                            className={`text-4xl lg:text-6xl xl:text-7xl font-bold font-display tracking-tight leading-[0.95] text-foreground animate-in fade-in slide-in-from-left-8 duration-1000 delay-100 fill-mode-forwards ${liquidTextClass}`}
                        >
                          Engineering <br />
                          Trust In A <br />
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sentinel-blue to-purple-500">
                            Zero-Trust
                          </span> World.
                        </h1>

                        <p 
                            key={`subtext-1-${animationKey}`}
                            className={`text-base lg:text-lg text-muted-foreground leading-relaxed animate-in fade-in slide-in-from-left-8 duration-1000 delay-200 fill-mode-forwards ${liquidTextClass}`}
                        >
                          Sentinel is the blueprint for modern defense. We don't just patch holes; we re-architect your security posture from the ground up.
                        </p>
                        
                        <div className="flex flex-wrap gap-3 animate-in fade-in slide-in-from-left-8 duration-1000 delay-300 fill-mode-forwards">
                             <Link to="/auth">
                                <Button size="lg" className="rounded-none h-10 border border-primary bg-primary/10 hover:bg-primary hover:text-white text-primary px-6 transition-all text-sm">
                                    [ INITIALIZE_SCAN ]
                                </Button>
                             </Link>
                             <Link to="/features">
                                <Button variant="ghost" size="lg" className="rounded-none h-10 border-b border-muted-foreground/30 hover:border-primary px-6 text-sm">
                                    Read Protocol
                                </Button>
                             </Link>
                        </div>

                        {/* THREAT CONDITION GAUGE */}
                        <div className="p-3 bg-card/50 border border-border/50 rounded-lg animate-in fade-in slide-in-from-left-8 duration-1000 delay-400 fill-mode-forwards relative overflow-hidden max-w-sm">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                     <AlertTriangle className="w-3 h-3 text-orange-500 animate-pulse" />
                                     <span className="text-[10px] font-mono font-bold text-muted-foreground tracking-wider">THREAT CON</span>
                                </div>
                                <span className="text-[10px] font-mono font-bold text-orange-500 animate-pulse">ELEVATED</span>
                            </div>

                            {/* Segmented Bar */}
                            <div className="flex gap-0.5 h-2">
                                {[...Array(4)].map((_, i) => <div key={`safe-${i}`} className="flex-1 bg-emerald-500/80 rounded-[1px]" />)}
                                {[...Array(3)].map((_, i) => <div key={`elevated-${i}`} className="flex-1 bg-orange-500 animate-pulse rounded-[1px]" />)}
                                {[...Array(3)].map((_, i) => <div key={`critical-${i}`} className="flex-1 bg-muted/30 rounded-[1px]" />)}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Status Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-border/50 opacity-80 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 fill-mode-forwards">
                        <div>
                            <div className="text-[10px] uppercase text-muted-foreground tracking-wider mb-0.5 flex items-center gap-1"><Activity className="w-3 h-3" /> Uptime</div>
                            <div className="font-mono text-base font-bold">99.99%</div>
                        </div>
                        <div>
                            <div className="text-[10px] uppercase text-muted-foreground tracking-wider mb-0.5 flex items-center gap-1"><Shield className="w-3 h-3" /> Blocked</div>
                            <div className="font-mono text-base font-bold text-sentinel-blue">1.2M+</div>
                        </div>
                        <div>
                            <div className="text-[10px] uppercase text-muted-foreground tracking-wider mb-0.5 flex items-center gap-1"><Lock className="w-3 h-3" /> Encrypt</div>
                            <div className="font-mono text-base font-bold">AES-256</div>
                        </div>
                        <div>
                            <div className="text-[10px] uppercase text-muted-foreground tracking-wider mb-0.5 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Audit</div>
                            <div className="font-mono text-base font-bold text-emerald-500">SOC2</div>
                        </div>
                    </div>
                </div>

                {/* 2. RIGHT ZONE: Compact Telemetry Sidebar (35% Width) */}
                <div className="lg:w-[35%] bg-card/20 relative flex flex-col font-mono text-xs overflow-hidden bg-muted/10 h-full">
                    
                    {/* Sidebar Header (Fixed) */}
                    <div className="p-3 border-b border-border bg-muted/30 flex justify-between items-center shrink-0">
                        <span className="text-muted-foreground font-bold">LIVE TELEMETRY</span>
                        <div className="flex gap-2 items-center">
                             <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                             <span className="text-[10px] text-red-500 font-bold">ON</span>
                        </div>
                    </div>

                    {/* Module A: Network Map (Fixed) */}
                    <div className="p-4 border-b border-border space-y-2 shrink-0">
                        <div className="flex justify-between items-center text-muted-foreground">
                            <span className="flex items-center gap-2 text-[10px]"><Globe className="w-3 h-3" /> NODES</span>
                            <span className="text-emerald-500 text-[9px]">SYNC</span>
                        </div>
                        <div className="h-16 w-full bg-black/20 dark:bg-white/5 rounded border border-border/50 relative overflow-hidden">
                            <div className="absolute top-1/2 left-1/4 w-1 h-1 bg-sentinel-blue rounded-full animate-ping" />
                            <div className="absolute top-1/3 left-1/2 w-1 h-1 bg-purple-500 rounded-full animate-ping delay-700" />
                            <div className="absolute bottom-1/4 right-1/4 w-1 h-1 bg-emerald-500 rounded-full animate-ping delay-1000" />
                            <div className="absolute inset-0 grid-background opacity-20" />
                        </div>
                    </div>

                     {/* MODULE D: Active Threat Log (Flexible) */}
                     <div className="p-4 border-b border-border space-y-2 flex-1 min-h-0 bg-background/30 flex flex-col">
                         <div className="flex justify-between items-center shrink-0">
                             <span className="text-[10px] text-muted-foreground flex items-center gap-2">
                                 <ShieldAlert className="w-3 h-3 text-orange-500" /> DEFENSE_LOG
                             </span>
                         </div>
                         <div className="space-y-1.5 overflow-hidden relative font-mono text-[9px] flex-1">
                            {threatLogs.map((log, i) => (
                                <div key={i} className="flex justify-between items-center animate-in slide-in-from-top-1 duration-300 border-b border-border/30 pb-0.5 last:border-0">
                                    <div className="flex gap-2">
                                        <span className="text-muted-foreground/50">{log.time}</span>
                                        <span className="text-foreground truncate max-w-[100px]">{log.type}</span>
                                    </div>
                                    <span className="text-emerald-500 font-bold">{log.status}</span>
                                </div>
                            ))}
                         </div>
                     </div>

                    {/* Module B: Scrolling Hex (Flexible) */}
                    <div className="p-4 space-y-2 relative border-b border-border flex-1 min-h-0 flex flex-col">
                        <div className="flex justify-between items-center shrink-0">
                            <span className="text-[10px] text-muted-foreground flex items-center gap-2"><HardDrive className="w-3 h-3" /> STREAM</span>
                        </div>
                        <div className="opacity-40 text-[9px] leading-tight font-mono break-all overflow-hidden text-muted-foreground flex-1">
                            {randomHex.map((line, i) => (
                                <div key={i} className="animate-in fade-in duration-300">{line}</div>
                            ))}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent h-[30%] w-full animate-scan pointer-events-none" />
                    </div>

                     {/* MODULE E: Encryption (Fixed) */}
                    <div className="p-3 border-b border-border shrink-0 bg-muted/20">
                         <div className="flex justify-between items-center mb-2">
                             <span className="text-[10px] text-muted-foreground flex items-center gap-2">
                                 <LockKeyhole className="w-3 h-3" /> KEYS
                             </span>
                             <RefreshCw className="w-3 h-3 text-muted-foreground/70 animate-[spin_4s_linear_infinite]" />
                         </div>
                         <div className="flex items-center justify-between gap-2">
                             <div className="space-y-0.5 flex-1">
                                 <div className="text-[8px] font-mono text-foreground/80 truncate">{randomHex[0]?.substring(0,12)}...</div>
                                 <div className="h-0.5 w-full bg-sentinel-blue/40 animate-pulse" />
                             </div>
                             <div className="space-y-0.5 flex-1 text-right">
                                 <div className="text-[8px] font-mono text-foreground/80 truncate ml-auto">{randomHex[1]?.substring(0,12)}...</div>
                                 <div className="h-0.5 w-full bg-emerald-500/40 animate-pulse delay-500" />
                             </div>
                         </div>
                    </div>

                    {/* Module C: Server Load (Fixed) */}
                    <div className="p-4 bg-muted/10 shrink-0">
                         <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <Activity className="w-3 h-3 text-sentinel-blue" />
                                <span className="text-[10px] text-muted-foreground">LOAD</span>
                            </div>
                            <span className="text-xs font-bold">42%</span>
                         </div>
                         <div className="space-y-1.5">
                             <div className="flex items-center gap-2 text-[9px] text-muted-foreground/60">
                                <span className="w-6">CPU</span>
                                <div className="h-1 flex-grow bg-muted/50 overflow-hidden rounded-full"><div className="h-full w-[45%] bg-sentinel-blue rounded-full" /></div>
                             </div>
                             <div className="flex items-center gap-2 text-[9px] text-muted-foreground/60">
                                <span className="w-6">MEM</span>
                                <div className="h-1 flex-grow bg-muted/50 overflow-hidden rounded-full"><div className="h-full w-[30%] bg-emerald-500 rounded-full" /></div>
                             </div>
                         </div>
                    </div>

                </div>

            </div>
          </div>
        </section>

        {/* --- INFINITE TICKER --- */}
        <div className="w-full bg-card border-y border-border overflow-hidden py-3">
             <div className="flex animate-ticker whitespace-nowrap">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex items-center gap-12 px-6">
                        <span className="flex items-center gap-2 text-sm font-mono text-muted-foreground"><Activity className="w-4 h-4 text-sentinel-blue" /> REAL-TIME MONITORING</span>
                        <span className="flex items-center gap-2 text-sm font-mono text-muted-foreground"><Lock className="w-4 h-4 text-sentinel-blue" /> ZERO-TRUST ARCHITECTURE</span>
                        <span className="flex items-center gap-2 text-sm font-mono text-muted-foreground"><Shield className="w-4 h-4 text-sentinel-blue" /> AUTOMATED REMEDIATION</span>
                        <span className="flex items-center gap-2 text-sm font-mono text-muted-foreground"><Globe className="w-4 h-4 text-sentinel-blue" /> GLOBAL THREAT INTELLIGENCE</span>
                        <span className="flex items-center gap-2 text-sm font-mono text-muted-foreground"><Code className="w-4 h-4 text-sentinel-blue" /> API-FIRST DESIGN</span>
                         <span className="flex items-center gap-2 text-sm font-mono text-muted-foreground"><Siren className="w-4 h-4 text-sentinel-red" /> ACTIVE THREAT MITIGATION</span>
                    </div>
                  ))}
             </div>
        </div>

        {/* --- THE PIPELINE --- */}
        <section className="py-24 border-b border-border bg-muted/20">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className={`text-3xl md:text-4xl font-bold font-display tracking-tight ${liquidTextClass}`}>The Sentinel Pipeline</h2>
                    <p className={`text-muted-foreground mt-2 text-base md:text-lg ${liquidTextClass}`}>From discovery to defense in three autonomous steps.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    <div className="hidden md:block absolute top-12 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-transparent via-border to-transparent border-t border-dashed border-muted-foreground/30" />

                    {[ 
                        { icon: Search, color: "text-sentinel-blue", title: "1. Deep Discovery", desc: "Our engine maps your entire attack surface, identifying open ports, exposed secrets, and shadow APIs." },
                        { icon: Cpu, color: "text-purple-500", title: "2. Heuristic Analysis", desc: "We don't just match signatures. We simulate attacks to verify vulnerabilities and eliminate false positives." },
                        { icon: FileText, color: "text-emerald-500", title: "3. Actionable Reporting", desc: "Generate ISO 27001-compliant PDFs with developer-friendly remediation code snippets." }
                    ].map((step, idx) => (
                        <div key={idx} className="relative flex flex-col items-center text-center group">
                            <div className="w-24 h-24 rounded-2xl bg-card border border-border shadow-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 z-10">
                                <step.icon className={`w-10 h-10 ${step.color}`} />
                            </div>
                            <h3 className={`text-xl md:text-2xl font-bold mb-2 ${liquidTextClass}`}>{step.title}</h3>
                            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* --- ANATOMY OF DEFENSE --- */}
        <section className="py-24 relative">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div className="max-w-2xl">
                        <Badge variant="outline" className="mb-4 border-primary/20 text-primary">Core Philosophy</Badge>
                        <h2 className={`text-4xl md:text-5xl font-bold font-display tracking-tight ${liquidTextClass}`}>The Anatomy of Defense</h2>
                        <p className={`text-lg md:text-xl text-muted-foreground mt-4 leading-relaxed ${liquidTextClass}`}>
                            Traditional security is reactive. Sentinel is heuristic. We built an engine that thinks like a hacker to protect you like a fortress.
                        </p>
                    </div>
                    <Button variant="ghost" className="hidden md:flex gap-2">
                        Read the Whitepaper <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[220px]">
                    {/* Card 1: Zero Trust */}
                    <div className="md:col-span-2 group relative overflow-hidden rounded-2xl border border-border bg-card/50 p-6 hover:bg-card hover:border-sentinel-blue/30 transition-all duration-500">
                        <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                            <Shield className="w-32 h-32 text-sentinel-blue" />
                        </div>
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div className="w-10 h-10 rounded-lg bg-sentinel-blue/10 flex items-center justify-center text-sentinel-blue">
                                <Lock className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2">Zero-Trust Architecture</h3>
                                <p className="text-muted-foreground text-sm max-w-md">We verify every packet, every request, and every identity.</p>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Heuristics */}
                    <div className="md:row-span-2 group relative overflow-hidden rounded-2xl border border-border bg-card/50 p-6 hover:bg-card hover:border-red-500/30 transition-all duration-500">
                         <div className="absolute bottom-0 right-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
                            <Target className="w-48 h-48 text-red-500" />
                        </div>
                        <div className="relative z-10 h-full flex flex-col">
                            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 mb-6">
                                <Zap className="w-5 h-5" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Active Heuristics</h3>
                            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                                Static firewalls are obsolete. Sentinel uses behavioral analysis to detect patterns.
                            </p>
                            <div className="mt-auto space-y-3">
                                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><CheckCircle2 className="w-3.5 h-3.5 text-red-500" /> Pattern Matching</div>
                                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground"><CheckCircle2 className="w-3.5 h-3.5 text-red-500" /> Anomaly Detection</div>
                            </div>
                        </div>
                    </div>

                    {/* Smaller Cards */}
                    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card/50 p-6 hover:bg-card hover:shadow-lg transition-all duration-500">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4"><Code className="w-5 h-5" /></div>
                        <h3 className="text-lg font-bold mb-2">DevSecOps</h3>
                        <p className="text-xs text-muted-foreground">CI/CD pipeline integration.</p>
                    </div>

                    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card/50 p-6 hover:bg-card hover:shadow-lg transition-all duration-500">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4"><Globe className="w-5 h-5" /></div>
                        <h3 className="text-lg font-bold mb-2">Global Compliance</h3>
                        <p className="text-xs text-muted-foreground">ISO 27001, SOC2, GDPR.</p>
                    </div>

                    {/* Stats */}
                    <div className="md:col-span-2 lg:col-span-3 group relative overflow-hidden rounded-2xl border border-border bg-card/50 p-6 flex items-center justify-between hover:bg-card transition-all duration-500">
                        <div className="flex flex-col justify-center">
                            <h3 className="text-lg font-bold">Community Powered</h3>
                            <p className="text-xs text-muted-foreground mt-1">Join 10,000+ security engineers.</p>
                        </div>
                        <div className="flex gap-8 text-center">
                            <div><div className="text-2xl font-bold font-mono">1M+</div><div className="text-[10px] uppercase tracking-wider text-muted-foreground">Scans</div></div>
                            <div><div className="text-2xl font-bold font-mono">0ms</div><div className="text-[10px] uppercase tracking-wider text-muted-foreground">Latency</div></div>
                            <div className="hidden sm:block"><div className="text-2xl font-bold font-mono">99.9%</div><div className="text-[10px] uppercase tracking-wider text-muted-foreground">Uptime</div></div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* --- PROTOCOL EVOLUTION --- */}
        <section className="py-24 border-t border-border bg-muted/20">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-16 items-start">
                    
                    <div className="space-y-8 sticky top-24">
                        <div>
                             <h2 className={`text-3xl md:text-4xl font-bold font-display tracking-tight mb-4 ${liquidTextClass}`}>Protocol Evolution</h2>
                             <p className={`text-lg md:text-xl text-muted-foreground leading-relaxed ${liquidTextClass}`}>
                                Sentinel wasn't founded in a boardroom. It was founded in a server room at 3 AM during a massive DDoS attack.
                             </p>
                        </div>
                        
                        {/* Terminal Decoration */}
                        <div className="rounded-xl bg-[#0f1117] border border-white/10 p-4 font-mono text-xs shadow-2xl">
                             <div className="flex gap-2 mb-4 border-b border-white/5 pb-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/50" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                                <div className="w-3 h-3 rounded-full bg-green-500/50" />
                             </div>
                             <div className="space-y-2 text-green-400/80">
                                <p>root@sentinel:~# ./deploy_core.sh</p>
                                <p>[INFO] Initializing Heuristic Engine...</p>
                                <p>[INFO] Loading Threat Database v2026.02.11...</p>
                                <p className="text-blue-400">[NET] Listening on Port 443...</p>
                                <p className="animate-pulse">_</p>
                             </div>
                        </div>
                    </div>

                    <div className="relative border-l border-border pl-8 space-y-12">
                         {timelineEvents.map((event, index) => (
                            <div key={index} className="relative group">
                                <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full border border-border bg-background group-hover:border-primary group-hover:scale-125 transition-all duration-300" />
                                <span className="text-xs font-mono text-primary mb-1 block">{event.year}</span>
                                <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                                <p className="text-muted-foreground leading-relaxed text-sm">{event.desc}</p>
                            </div>
                         ))}
                    </div>

                </div>
            </div>
        </section>

        {/* --- TEAM GRID --- */}
        <section className="py-24 border-t border-border">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className={`text-3xl md:text-4xl font-bold font-display tracking-tight ${liquidTextClass}`}>The Architects</h2>
                    <p className={`text-muted-foreground mt-2 text-base md:text-lg ${liquidTextClass}`}>Built by researchers, not marketers.</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {teamMembers.map((member, i) => (
                        <div key={i} className="group p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 text-center">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center text-xl font-bold text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all duration-300">
                                {member.initial}
                            </div>
                            <h3 className="font-bold text-foreground">{member.name}</h3>
                            <p className="text-xs text-primary font-medium uppercase tracking-wider mt-1 mb-2">{member.role}</p>
                            <Badge variant="secondary" className="text-[10px] h-5">{member.expertise}</Badge>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* --- FAQ --- */}
        <section className="py-24 bg-muted/20 border-t border-border">
            <div className="container mx-auto px-4 max-w-3xl">
                <h2 className={`text-3xl md:text-4xl font-bold font-display tracking-tight text-center mb-12 ${liquidTextClass}`}>Common Inquiries</h2>
                <Accordion type="single" collapsible className="w-full space-y-4">
                    <AccordionItem value="item-1" className="border border-border bg-card rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline text-base font-medium">How does Sentinel differ from standard firewalls?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed pt-2 pb-4">
                            Standard firewalls operate on static rules (allow/deny). Sentinel is an active heuristic engine. It analyzes traffic behavior, request patterns, and payload signatures in real-time to detect zero-day exploits that traditional firewalls would miss.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2" className="border border-border bg-card rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline text-base font-medium">Is my scan data private?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed pt-2 pb-4">
                            Absolutely. We employ a Zero-Knowledge architecture. Your reports are encrypted at rest using AES-256, and our row-level security policies ensure only your User ID has read access.
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3" className="border border-border bg-card rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline text-base font-medium">Can I integrate this into CI/CD?</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground leading-relaxed pt-2 pb-4">
                            Yes. Sentinel exposes a RESTful API compatible with GitHub Actions, GitLab CI, and Jenkins. You can set it to automatically fail builds if critical vulnerabilities are detected.
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </section>

        {/* --- CTA --- */}
        <section className="py-24 border-t border-border relative overflow-hidden">
             <div className="absolute inset-0 bg-sentinel-blue/5 pointer-events-none" />
             <div className="container mx-auto px-4 text-center relative z-10">
                <h2 className={`text-4xl md:text-6xl font-bold font-display tracking-tighter mb-6 ${liquidTextClass}`}>Secure Your Infrastructure.</h2>
                <p className={`text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 ${liquidTextClass}`}>
                    Join thousands of developers who sleep soundly because Sentinel is awake.
                </p>
                <div className="flex justify-center gap-4">
                    <Link to="/auth">
                        <Button size="lg" className="h-14 px-10 text-lg rounded-full shadow-xl shadow-primary/20 transition-all hover:scale-105">
                            Start Free Scan <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </Link>
                </div>
             </div>
        </section>

      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;