import { useState, useEffect } from "react";
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
    Siren
} from "lucide-react";

const AboutPage = () => {
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    setMounted(true);
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
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

  // "Happy Accident" Class: 
  // transition-all duration-1000 ease-out -> Creates the fluid morphing/resizing effect.
  const liquidTextClass = "transition-all duration-1000 ease-out";

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden font-sans">
      <Navbar />
      
      <main className="flex-grow relative">
        {/* --- GLOBAL BACKGROUND --- */}
        <div className="absolute inset-0 grid-background pointer-events-none opacity-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />

        {/* --- HERO SECTION --- */}
        <section className="relative pt-24 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-5xl mx-auto text-center space-y-6">
                
                {/* Status Pill */}
                <div 
                    key={`status-${animationKey}`}
                    className={`inline-flex items-center rounded-full border border-border bg-card/50 backdrop-blur-md px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm animate-in fade-in zoom-in-90 duration-1000 fill-mode-forwards ${liquidTextClass}`}
                >
                    <span className="relative flex h-2 w-2 mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    System Operational • v2.4.0
                </div>

                {/* Main Heading - TRUE BLACK */}
                <h1 
                    key={`heading-${animationKey}`}
                    className={`text-6xl md:text-8xl font-bold font-display tracking-tighter leading-none text-black dark:text-white animate-in fade-in zoom-in-90 duration-1000 delay-100 fill-mode-forwards ${liquidTextClass}`}
                >
                  Digital Immunity <br />
                  <span>
                    For The Modern Web.
                  </span>
                </h1>

                {/* Subtext Paragraph 1 - TRUE BLACK */}
                <p 
                    key={`subtext-1-${animationKey}`}
                    className={`text-xl md:text-2xl text-black dark:text-white max-w-2xl mx-auto leading-relaxed animate-in fade-in zoom-in-90 duration-1000 delay-200 fill-mode-forwards ${liquidTextClass}`}
                >
                  Sentinel isn't just a scanner. It's a <span className="font-semibold">heuristic warfare engine</span> that predicts vectors before they become breaches.
                </p>

                {/* Subtext Paragraph 2 - TRUE BLACK */}
                <p 
                    key={`subtext-2-${animationKey}`}
                    className={`text-lg md:text-xl text-black dark:text-white max-w-xl mx-auto leading-relaxed animate-in fade-in zoom-in-90 duration-1000 delay-300 fill-mode-forwards ${liquidTextClass}`}
                >
                  We don't just find vulnerabilities. We eliminate the logic that makes them possible.
                </p>

                {/* CTA Button */}
                <div 
                    key={`cta-${animationKey}`}
                    className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-0 animate-in fade-in zoom-in-90 duration-1000 delay-500 fill-mode-forwards"
                >
                   <Link to="/auth">
                      <Button size="lg" className="h-12 px-8 rounded-full text-base bg-foreground text-background hover:bg-foreground/90 font-semibold shadow-[0_0_20px_-5px_rgba(0,0,0,0.3)] dark:shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] transition-all hover:scale-105">
                        Initialize Scan
                      </Button>
                   </Link>
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

        {/* --- LOGIC OF DEFENSE --- */}
        <section className="py-24 relative">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                    <div className="max-w-2xl">
                        <Badge variant="outline" className="mb-4 border-primary/20 text-primary">Core Philosophy</Badge>
                        <h2 className={`text-4xl md:text-5xl font-bold font-display tracking-tight ${liquidTextClass}`}>The Logic of Defense</h2>
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

        {/* --- ORIGIN & TIMELINE --- */}
        <section className="py-24 border-t border-border bg-muted/20">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-16 items-start">
                    
                    <div className="space-y-8 sticky top-24">
                        <div>
                             <h2 className={`text-3xl md:text-4xl font-bold font-display tracking-tight mb-4 ${liquidTextClass}`}>From Script to Platform</h2>
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