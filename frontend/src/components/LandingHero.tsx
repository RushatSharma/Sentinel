import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Lock, 
  Shield, 
  Globe, 
  Code, 
  Siren 
} from "lucide-react";

export function LandingHero() {
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check initial theme
    setIsDarkMode(document.documentElement.classList.contains('dark'));

    // Observer to track theme changes for re-triggering animations
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

  const animationKey = isDarkMode ? 'dark' : 'light';
  const liquidTextClass = "transition-all duration-1000 ease-out";

  return (
    <>
      <section className="relative pt-24 pb-8 lg:pt-40 lg:pb-12 overflow-hidden">
        
        {/* --- BACKGROUND EFFECTS --- */}
        {/* UPDATED OPACITY: opacity-40 for Light Mode, dark:opacity-80 for Dark Mode */}
        <div className="absolute inset-0 grid-background pointer-events-none opacity-50 dark:opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />
        
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

              {/* Main Heading */}
              <h1 
                  key={`heading-${animationKey}`}
                  className={`text-6xl md:text-8xl font-bold font-display tracking-tighter leading-none text-black dark:text-white animate-in fade-in zoom-in-90 duration-1000 delay-100 fill-mode-forwards ${liquidTextClass}`}
              >
                Digital Immunity <br />
                <span>
                  For The Modern Web.
                </span>
              </h1>

              {/* Subtext Paragraph 1 */}
              <p 
                  key={`subtext-1-${animationKey}`}
                  className={`text-xl md:text-2xl text-black dark:text-white max-w-2xl mx-auto leading-relaxed animate-in fade-in zoom-in-90 duration-1000 delay-200 fill-mode-forwards ${liquidTextClass}`}
              >
                Sentinel isn't just a scanner. It's a <span className="font-semibold">heuristic warfare engine</span> that predicts vectors before they become breaches.
              </p>

              {/* Subtext Paragraph 2 */}
              <p 
                  key={`subtext-2-${animationKey}`}
                  className={`text-lg md:text-xl text-black dark:text-white max-w-xl mx-auto leading-relaxed animate-in fade-in zoom-in-90 duration-1000 delay-300 fill-mode-forwards ${liquidTextClass}`}
              >
                We don't just find vulnerabilities. We eliminate the logic that makes them possible.
              </p>

              {/* CTA Button */}
              <div 
                  key={`cta-${animationKey}`}
                  className="flex flex-col sm:flex-row items-center justify-center gap-0 pt-2 animate-in fade-in zoom-in-90 duration-1000 delay-500 fill-mode-forwards"
              >
                 {/* Updated Link to point to Quick Scan page */}
                 <Link to="/scan">
                    <Button size="lg" className="h-12 px-8 rounded-full text-base bg-foreground text-background hover:bg-foreground/90 font-semibold shadow-[0_0_20px_-5px_rgba(0,0,0,0.3)] dark:shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] transition-all hover:scale-105">
                      Initialize Scan
                    </Button>
                 </Link>
              </div>
          </div>
        </div>
      </section>

      {/* --- INFINITE TICKER --- */}
      <div className="w-full bg-card overflow-hidden py-3">
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
    </>
  );
}