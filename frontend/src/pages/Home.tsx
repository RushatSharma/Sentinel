import { useState } from "react";
import { Activity, Play, Globe, ShieldAlert, ArrowRight, Zap } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [url, setUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleQuickScan = async () => {
    if (!url) return;
    setLoading(true);
    
    // Default to Quick Mode (Real PII + CVSS)
    setTimeout(() => {
        setLoading(false);
        navigate(`/results?url=${encodeURIComponent(url)}&mode=quick`);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 relative overflow-hidden">
      
      {/* Background Grid */}
      <div className="absolute inset-0 w-full h-full grid-background opacity-20 pointer-events-none" />

      <div className="z-10 w-full max-w-4xl text-center space-y-8">
        
        {/* BADGE */}
        <div className="inline-flex items-center rounded-full border border-sentinel-blue/30 bg-sentinel-blue/10 px-4 py-1.5 text-sm font-medium text-sentinel-blue shadow-lg mb-4">
            <span className="flex h-2 w-2 rounded-full bg-sentinel-blue mr-2 animate-pulse"></span>
            Sentinel v3.0 // Active Intelligence
        </div>

        {/* HERO */}
        <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight">
            <span className="text-foreground">Secure your</span> <br />
            <span className="bg-gradient-to-r from-sentinel-blue to-cyan-400 bg-clip-text text-transparent">
              Digital Perimeter
            </span>
        </h1>
        
        <p className="text-muted-foreground text-xl max-w-2xl mx-auto leading-relaxed">
            Instant heuristic analysis for PII exposure, compliance violations, and surface vulnerabilities. 
            <span className="text-foreground font-semibold"> No installation required.</span>
        </p>

        {/* CONSOLE CONTAINER (QUICK SCAN) */}
        <div className="w-full max-w-2xl mx-auto relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-sentinel-blue to-cyan-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative flex items-center bg-[#0f1117] rounded-xl border border-white/10 shadow-2xl overflow-hidden p-2">
              
              {/* UPDATED PROMPT: Indicates the active mode */}
              <div className="pl-4 pr-3 text-muted-foreground font-mono text-sm select-none">
                  sentinel@quick-mode:~#
              </div>
              
              {/* UPDATED PLACEHOLDER: Shows command syntax for clarity */}
              <Input 
                placeholder="quick-scan --target https://example.com" 
                className="h-14 border-0 bg-transparent text-lg focus-visible:ring-0 pl-2 pr-32 font-mono text-green-400 placeholder:text-gray-600"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleQuickScan()}
              />
              
              {/* UPDATED BUTTON: Explicit action label */}
              <Button 
                  onClick={handleQuickScan} 
                  disabled={loading || !url} 
                  className="h-10 px-6 bg-sentinel-blue hover:bg-sentinel-blue/90 text-white font-mono font-bold tracking-wide transition-all rounded-lg"
              >
                  {loading ? <Activity className="mr-2 h-4 w-4 animate-spin" /> : "RUN_QUICK_SCAN"}
              </Button>
            </div>
        </div>

        {/* SECONDARY ACTIONS */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-center gap-6">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Globe className="w-4 h-4 text-emerald-500" /> Live Content Extraction</span>
                <span className="hidden md:inline text-gray-700">|</span>
                <span className="flex items-center gap-1"><ShieldAlert className="w-4 h-4 text-orange-500" /> CVSS v3.1 Scoring</span>
            </div>

            {/* REDIRECT TO DEEP SCAN */}
            <Button 
                variant="ghost" 
                className="text-sentinel-blue hover:text-sentinel-blue hover:bg-sentinel-blue/10 gap-2 group"
                onClick={() => navigate('/deep-scan')}
            >
                <Zap className="w-4 h-4" />
                Advanced Deep Scan Tools
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
        </div>

      </div>
    </div>
  );
}