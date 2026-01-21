import { useState } from "react";
import { Shield, Lock, Activity, Server, ArrowRight, Play, CheckCircle, Clock, Scale, Menu, X } from "lucide-react";
import { Button } from "../components/ui/button";
import { cn } from "../lib/utils";

// --- COMPONENTS FOR SECTIONS ---

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <nav className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-white/5 bg-background/50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center gap-1 group cursor-pointer">
          <div className="h-2 w-2 bg-primary rounded-full group-hover:animate-pulse shadow-[0_0_10px_#39ff14]" />
          <span className="font-display font-bold text-xl tracking-widest text-white">CYBER</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {["Home", "Product", "Pricing"].map((item) => (
            <a key={item} href="#" className="text-xs font-mono uppercase tracking-widest text-text-secondary hover:text-primary transition-colors">
              {item}
            </a>
          ))}
        </div>

        {/* CTA Button */}
        <div className="hidden md:block">
          <Button className="bg-primary text-black font-bold hover:bg-primary/80 font-mono text-xs uppercase tracking-wider px-6">
            Get Started
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-background border-b border-white/10 p-6 flex flex-col gap-4">
          {["Home", "Product", "Pricing"].map((item) => (
            <a key={item} href="#" className="text-sm font-mono uppercase text-white hover:text-primary">
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
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

      <div className="relative z-10 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5">
          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
          <span className="text-primary text-[10px] font-mono tracking-[0.3em] uppercase">Next Gen Security</span>
        </div>

        <h1 className="font-display text-6xl md:text-8xl font-bold uppercase leading-[0.9] tracking-tighter text-white">
          Cyber Defense <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-gray-600">
            That Evolves Daily
          </span>
        </h1>

        <div className="flex items-center justify-center gap-4 w-full max-w-md mx-auto relative mt-8">
          <div className="h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent flex-1" />
          <Button className="rounded-full h-12 px-8 bg-white text-black hover:bg-gray-200 font-bold tracking-wide">
            Get Protected
          </Button>
          <div className="h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent flex-1" />
        </div>

        <p className="font-mono text-xs text-text-secondary uppercase tracking-widest mt-12">
          1500+ Clients <span className="mx-2 text-primary">•</span> 100% Secure
        </p>
      </div>
    </section>
  );
};

const MissionStatement = () => {
  return (
    <section className="py-24 px-6 border-t border-white/5 bg-background relative">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-16 items-center">
        {/* Left Column: Image */}
        <div className="w-full md:w-1/2 relative group">
          <div className="absolute inset-0 bg-primary/20 blur-2xl group-hover:bg-primary/30 transition-all duration-700 rounded-2xl" />
          <div className="relative h-[400px] w-full bg-card-DEFAULT border border-card-border rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10" />
            {/* Abstract Tech Representation (Placeholder for Hacker Image) */}
            <div className="w-full h-full flex items-center justify-center bg-[#0a0a0a]">
              <Server className="h-24 w-24 text-primary opacity-50" />
            </div>
            <div className="absolute bottom-6 left-6 z-20">
              <p className="font-mono text-xs text-primary uppercase tracking-widest">Protection That Never Sleeps</p>
            </div>
          </div>
        </div>

        {/* Right Column: Text */}
        <div className="w-full md:w-1/2 space-y-8">
          <div className="inline-block px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
            <span className="text-primary text-xs font-mono font-bold uppercase">Who We Are</span>
          </div>
          
          <h2 className="font-display text-2xl md:text-3xl leading-relaxed uppercase text-white">
            At Cyber, we believe threats don't sleep. 
            <span className="text-text-secondary"> Neither should your defense. Semi-intelligent systems powered by real-time data.</span>
          </h2>

          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
            {[
              { val: "200+", label: "AI Algorithms" },
              { val: "1.8k+", label: "Systems Secured" },
              { val: "300+", label: "Partners" },
            ].map((stat, idx) => (
              <div key={idx}>
                <h3 className="text-3xl font-display font-bold text-white">{stat.val}</h3>
                <p className="text-xs font-mono text-text-secondary uppercase mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const FeatureGrid = () => {
  return (
    <section className="py-24 px-6 bg-[#080808]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-4xl font-bold uppercase text-white mb-4">Smarter Each Day,<br/>Stronger Every Hour</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="group bg-card-DEFAULT border border-card-border p-8 rounded-2xl hover:border-primary/50 transition-all duration-300">
            <Activity className="h-10 w-10 text-white mb-6" />
            <h3 className="font-display text-xl font-bold text-white mb-2">Real-Time Threat Detection</h3>
            <p className="text-text-secondary text-sm leading-relaxed">Constant monitoring of your digital perimeter using heuristic scanners.</p>
          </div>

          {/* Card 2 (Highlighted) */}
          <div className="relative bg-card-DEFAULT border border-primary/30 p-8 rounded-2xl flex flex-col items-center justify-center text-center overflow-hidden">
            <div className="absolute inset-0 bg-primary/5" />
            <div className="relative z-10">
              <div className="h-12 w-12 bg-primary rounded-full flex items-center justify-center mb-6 mx-auto shadow-[0_0_20px_#39ff14]">
                <Shield className="h-6 w-6 text-black" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-4">Self-Learning AI Engine</h3>
              <Button className="bg-primary text-black hover:bg-white font-bold rounded-full">Learn More</Button>
            </div>
          </div>

          {/* Card 3 */}
          <div className="group bg-card-DEFAULT border border-card-border p-8 rounded-2xl hover:border-primary/50 transition-all duration-300">
            <Server className="h-10 w-10 text-white mb-6" />
            <h3 className="font-display text-xl font-bold text-white mb-2">Multi-Cloud Protection</h3>
            <p className="text-text-secondary text-sm leading-relaxed">Seamlessly integrates with AWS, Azure, and Google Cloud environments.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

const BentoGrid = () => {
  return (
    <section className="py-24 px-6 relative">
      <div className="max-w-6xl mx-auto">
        <div className="mb-12">
          <h2 className="font-display text-4xl font-bold uppercase text-white">Protection That Gets<br/>Smarter With You</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 grid-rows-2 gap-4 h-auto md:h-[500px]">
          {/* Large Vertical Card */}
          <div className="md:col-span-1 md:row-span-2 bg-card-DEFAULT border border-card-border rounded-2xl p-8 flex flex-col justify-between hover:bg-card-border/50 transition-colors group">
            <Shield className="h-12 w-12 text-primary mb-4" />
            <div>
              <h3 className="font-display text-2xl font-bold text-white mb-2">Future-Proof Security</h3>
              <p className="text-text-secondary text-sm">Built on an architecture that scales infinitely with your data needs.</p>
            </div>
          </div>

          {/* Wide Card */}
          <div className="md:col-span-2 bg-[#151515] border border-primary/20 rounded-2xl p-8 flex items-center gap-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full" />
            <Scale className="h-10 w-10 text-primary shrink-0" />
            <div>
              <h3 className="font-display text-xl font-bold text-white">Scale Without Fear</h3>
              <p className="text-text-secondary text-sm mt-1">Deploy new instances securely in seconds, not days.</p>
            </div>
          </div>

          {/* Small Card 1 */}
          <div className="bg-card-DEFAULT border border-card-border rounded-2xl p-6 flex flex-col justify-center hover:border-white/20 transition-colors">
            <Clock className="h-8 w-8 text-white mb-3" />
            <h3 className="font-display text-lg font-bold text-white">24/7 Monitoring</h3>
          </div>

          {/* Small Card 2 */}
          <div className="bg-card-DEFAULT border border-card-border rounded-2xl p-6 flex flex-col justify-center hover:border-white/20 transition-colors">
            <CheckCircle className="h-8 w-8 text-white mb-3" />
            <h3 className="font-display text-lg font-bold text-white">Compliance Ready</h3>
          </div>
        </div>
      </div>
    </section>
  );
};

const BottomCTA = () => {
  return (
    <section className="py-20 px-6">
      <div className="max-w-7xl mx-auto bg-[#0a0a0a] border border-white/10 rounded-3xl p-12 md:p-24 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
        {/* Background Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-xl">
          <h2 className="font-display text-5xl md:text-6xl font-bold uppercase text-white leading-[0.9]">
            Ready to <br/>
            <span className="text-primary">Outsmart</span> <br/>
            Tomorrow?
          </h2>
        </div>

        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="p-1 rounded-full border border-white/10 bg-black/50 backdrop-blur-sm">
            <Button className="h-16 px-10 rounded-full bg-primary text-black hover:bg-white font-bold text-lg tracking-wide shadow-[0_0_30px_rgba(57,255,20,0.3)] transition-all duration-300">
              Get Protected Now <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
          <p className="text-text-secondary font-mono text-xs uppercase tracking-widest">No Credit Card Required • 14 Day Trial</p>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="py-12 px-6 border-t border-white/10 bg-background text-sm">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-4">
          <div className="flex items-center gap-1">
            <div className="h-2 w-2 bg-primary rounded-full" />
            <span className="font-display font-bold text-lg tracking-widest text-white">CYBER</span>
          </div>
          <p className="text-text-secondary">Next generation security for the modern web.</p>
        </div>
        
        <div>
          <h4 className="font-mono font-bold text-white uppercase mb-4">Product</h4>
          <ul className="space-y-2 text-text-secondary">
            <li><a href="#" className="hover:text-primary">Features</a></li>
            <li><a href="#" className="hover:text-primary">Integrations</a></li>
            <li><a href="#" className="hover:text-primary">Pricing</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-mono font-bold text-white uppercase mb-4">Company</h4>
          <ul className="space-y-2 text-text-secondary">
            <li><a href="#" className="hover:text-primary">About</a></li>
            <li><a href="#" className="hover:text-primary">Careers</a></li>
            <li><a href="#" className="hover:text-primary">Contact</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-mono font-bold text-white uppercase mb-4">Subscribe</h4>
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder="ENTER EMAIL" 
              className="bg-card-DEFAULT border border-card-border px-4 py-2 rounded text-white text-xs font-mono focus:outline-none focus:border-primary w-full"
            />
            <button className="bg-white text-black p-2 rounded hover:bg-primary transition-colors">
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-white/5 flex justify-between text-text-secondary text-xs font-mono">
        <p>© 2026 Sentinel Inc.</p>
        <div className="flex gap-4">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
        </div>
      </div>
    </footer>
  );
};

// --- MAIN PAGE COMPONENT ---

export default function CyberLandingPage() {
  return (
    <div className="bg-background min-h-screen text-text-primary font-sans selection:bg-primary selection:text-black">
      <Navbar />
      <HeroSection />
      <MissionStatement />
      <FeatureGrid />
      <BentoGrid />
      <BottomCTA />
      <Footer />
    </div>
  );
}