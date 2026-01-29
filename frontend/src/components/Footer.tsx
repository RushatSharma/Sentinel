import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Github, Twitter, Linkedin, Send } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-background border-t border-white/10 pt-16 pb-12">
      <div className="container mx-auto px-4 md:px-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* COLUMN 1: BRANDING */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              {/* Theme Responsive Logo */}
              <div className="relative w-10 h-10"> 
                <img src="/LogoBlack.png" alt="Sentinel Logo" className="absolute inset-0 w-full h-full object-contain block dark:hidden" />
                <img src="/LogoWhite.png" alt="Sentinel Logo" className="absolute inset-0 w-full h-full object-contain hidden dark:block" />
              </div>
              <span className="text-2xl font-bold font-display tracking-tight text-foreground">
                SENTINEL
              </span>
            </Link>
            {/* INCREASED TEXT SIZE: text-lg */}
            <p className="text-muted-foreground text-lg leading-relaxed max-w-xs">
              The active heuristic warfare engine. Bridging the gap between offensive discovery and defensive remediation for modern DevSecOps.
            </p>
            <div className="flex items-center gap-5 pt-2">
              <a href="#" className="text-muted-foreground hover:text-sentinel-blue transition-colors">
                <Github className="w-6 h-6" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-sentinel-blue transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-sentinel-blue transition-colors">
                <Linkedin className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* COLUMN 2: PRODUCT */}
          <div>
            {/* INCREASED HEADING SIZE */}
            <h3 className="text-lg font-bold text-foreground mb-6">Platform</h3>
            {/* INCREASED LIST TEXT SIZE: text-base */}
            <ul className="space-y-4 text-base text-muted-foreground">
              <li><Link to="/features" className="hover:text-sentinel-blue transition-colors">Warfare Engine</Link></li>
              <li><Link to="/compliance" className="hover:text-sentinel-blue transition-colors">Compliance Mapping</Link></li>
              <li><Link to="/reporting" className="hover:text-sentinel-blue transition-colors">Risk Reporting</Link></li>
              <li><Link to="#" className="hover:text-sentinel-blue transition-colors">Shadow API Discovery</Link></li>
            </ul>
          </div>

          {/* COLUMN 3: RESOURCES */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-6">Resources</h3>
            <ul className="space-y-4 text-base text-muted-foreground">
              <li><Link to="#" className="hover:text-sentinel-blue transition-colors">Documentation</Link></li>
              <li><Link to="#" className="hover:text-sentinel-blue transition-colors">API Reference</Link></li>
              <li><Link to="#" className="hover:text-sentinel-blue transition-colors">Security Guide</Link></li>
              <li><Link to="#" className="hover:text-sentinel-blue transition-colors">System Status</Link></li>
            </ul>
          </div>

          {/* COLUMN 4: NEWSLETTER */}
          <div>
            <h3 className="text-lg font-bold text-foreground mb-6">Threat Intelligence</h3>
            <p className="text-base text-muted-foreground mb-6">
              Subscribe to our feed for the latest CVEs and zero-day alerts.
            </p>
            <div className="flex gap-3">
              <Input 
                type="email" 
                placeholder="sec-admin@company.com" 
                className="bg-secondary/50 border-red-500 text-lg h-12 focus-visible:ring-sentinel-blue placeholder:text-muted-foreground/70"
              />
              <Button size="icon" className="h-12 w-12 bg-sentinel-blue hover:bg-sentinel-blue/90 text-white shrink-0">
                <Send className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* INCREASED COPYRIGHT TEXT SIZE: text-sm */}
          <p className="text-sm text-muted-foreground text-center md:text-left">
            &copy; {new Date().getFullYear()} Sentinel Security Inc. All rights reserved.
          </p>
          <div className="flex gap-8 text-sm text-muted-foreground">
            <Link to="#" className="hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link to="#" className="hover:text-foreground transition-colors">Cookie Settings</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}