import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { 
  Search, 
  AlertTriangle, 
  ShieldAlert, 
  Download,
  Loader2
} from "lucide-react";
// --- APPWRITE IMPORT ---
import { account } from "@/lib/appwrite";
import { cn } from "@/lib/utils";

export default function Home() {
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check for Appwrite Session on mount
  useEffect(() => {
    account.get()
      .then((session) => setUser(session))
      .catch(() => {
        setUser(null);
      });
  }, []);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setScanning(true);
    setResults(null);

    try {
      const response = await fetch("http://localhost:5000/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          url,
          user_id: user?.$id || null 
        }),
      });

      if (!response.ok) throw new Error("Scan failed");

      const data = await response.json();
      
      // Artificial delay to let the scanner UI show before revealing results
      setTimeout(() => {
          setResults(data);
          toast({
            title: "Scan Complete",
            description: `Found ${data.vulnerabilities.length} potential issues.`,
          });
      }, 500);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to the scanning engine.",
        variant: "destructive",
      });
    } finally {
      setTimeout(() => setScanning(false), 500);
    }
  };

  const downloadReport = async () => {
    toast({ title: "Generating Report", description: "Your PDF is being prepared..." });
    // PDF Generation logic remains here
  };

  return (
    <div className="min-h-screen bg-background relative flex flex-col font-sans overflow-x-hidden">
      <Navbar />
      
      {/* --- FOCUSED GRID BACKGROUND (Exact match to Landing Page) --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 grid-background opacity-50 dark:opacity-100" 
        />
        {/* Gradient overlay to create the spotlight focus effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </div>
      
      {/* perspective:1200px added to enable the 3D Holographic Tabletop effect */}
      <main className="container relative z-10 mx-auto pt-24 pb-12 px-4 [perspective:1200px] flex-grow">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* --- SEARCH SECTION (Target Lock Animation) --- */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, filter: 'blur(12px)', y: 40 }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', y: 0 }}
            transition={{ duration: 0.9, type: 'spring', bounce: 0.3 }}
            className="text-center space-y-4"
          >
            <h1 className="text-4xl md:text-6xl font-bold font-display tracking-tight text-foreground">
              Operational <span className="text-sentinel-blue">Dashboard</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Enter a target URL to initiate a heuristic vulnerability assessment.
            </p>
            
            <form onSubmit={handleScan} className="flex gap-2 max-w-2xl mx-auto pt-4 relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-sentinel-blue/20 to-cyan-600/20 rounded-xl blur opacity-50 group-hover:opacity-100 transition duration-500" />
              <div className="relative flex w-full gap-2">
                  <Input 
                    placeholder="https://example.com" 
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="bg-card h-14 text-lg border-border focus-visible:ring-sentinel-blue shadow-lg"
                    disabled={scanning}
                  />
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="bg-sentinel-blue hover:bg-sentinel-blue/90 h-14 px-8 text-white font-bold shadow-lg transition-transform active:scale-95"
                    disabled={scanning}
                  >
                    {scanning ? <Loader2 className="animate-spin w-5 h-5" /> : <Search className="w-5 h-5 mr-2" />}
                    {scanning ? "" : "Analyze"}
                  </Button>
              </div>
            </form>
          </motion.div>

          {/* --- ACTIVE SCANNING STATE --- */}
          <AnimatePresence>
              {scanning && !results && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, filter: 'blur(5px)' }}
                    className="max-w-2xl mx-auto pt-4"
                >
                    <Card className="border-sentinel-blue/50 bg-card/80 backdrop-blur-sm shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                      <CardContent className="pt-6 space-y-4">
                        <div className="flex justify-between text-sm mb-2 font-mono text-sentinel-blue">
                          <span className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" /> Heuristic Warfare Node
                          </span>
                          <span className="animate-pulse">Injecting Payloads...</span>
                        </div>
                        <Progress value={45} className="h-2 bg-sentinel-blue/20">
                            <div className="h-full bg-sentinel-blue animate-pulse rounded-full" style={{ width: '45%' }} />
                        </Progress>
                      </CardContent>
                    </Card>
                </motion.div>
              )}
          </AnimatePresence>

          {/* --- RESULTS SECTION (Holographic Tabletop & Deck Deal) --- */}
          <AnimatePresence>
              {results && !scanning && (
                <motion.div 
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: { staggerChildren: 0.2 } // Staggers the deal
                        }
                    }}
                    className="space-y-6 pt-4"
                >
                  
                  {/* METRIC CARDS (Flipping up from lying flat on the X-Axis) */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Card 1 */}
                    <motion.div variants={{
                        hidden: { opacity: 0, rotateX: -90, y: 40, transformOrigin: "bottom" },
                        visible: { opacity: 1, rotateX: 0, y: 0, transition: { type: "spring", bounce: 0.5, duration: 0.8 } }
                    }}>
                        <Card className="bg-card border-border shadow-md hover:border-sentinel-blue/30 transition-colors">
                          <CardHeader className="pb-2 border-b border-border/50 bg-muted/20">
                            <CardTitle className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Risk Score</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-4">
                            <div className="text-4xl font-display font-bold text-sentinel-red">
                              {results.summary.high * 25 + results.summary.medium * 10}%
                            </div>
                          </CardContent>
                        </Card>
                    </motion.div>

                    {/* Card 2 */}
                    <motion.div variants={{
                        hidden: { opacity: 0, rotateX: -90, y: 40, transformOrigin: "bottom" },
                        visible: { opacity: 1, rotateX: 0, y: 0, transition: { type: "spring", bounce: 0.5, duration: 0.8 } }
                    }}>
                        <Card className="bg-card border-border shadow-md hover:border-sentinel-blue/30 transition-colors">
                          <CardHeader className="pb-2 border-b border-border/50 bg-muted/20">
                            <CardTitle className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Threats Found</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-4">
                            <div className="text-4xl font-display font-bold text-foreground">
                                {results.vulnerabilities.length}
                            </div>
                          </CardContent>
                        </Card>
                    </motion.div>

                    {/* Card 3 */}
                    <motion.div variants={{
                        hidden: { opacity: 0, rotateX: -90, y: 40, transformOrigin: "bottom" },
                        visible: { opacity: 1, rotateX: 0, y: 0, transition: { type: "spring", bounce: 0.5, duration: 0.8 } }
                    }}>
                        <Card className="bg-card border-border shadow-md hover:border-sentinel-blue/30 transition-colors h-full">
                          <CardHeader className="pb-2 border-b border-border/50 bg-muted/20">
                            <CardTitle className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Action</CardTitle>
                          </CardHeader>
                          <CardContent className="pt-4 flex items-center justify-center h-[calc(100%-50px)]">
                            <Button variant="ghost" className="w-full text-sentinel-blue hover:bg-sentinel-blue/10 hover:text-sentinel-blue font-bold tracking-wider text-xs" onClick={downloadReport}>
                              <Download className="w-4 h-4 mr-2" /> EXPORT PDF
                            </Button>
                          </CardContent>
                        </Card>
                    </motion.div>

                  </div>

                  {/* THREAT LIST (Vertical Unroll) */}
                  <motion.div 
                    variants={{
                        hidden: { opacity: 0, y: 60, scale: 0.95 },
                        visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", bounce: 0.3, duration: 0.8 } }
                    }}
                  >
                      <Card className="border border-red-500/20 bg-card shadow-lg overflow-hidden">
                        <CardHeader className="bg-muted/30 border-b border-border">
                          <CardTitle className="flex items-center gap-2 text-foreground font-display text-xl">
                            <ShieldAlert className="text-sentinel-red w-6 h-6" />
                            Detected Vulnerabilities
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                          {results.vulnerabilities.length === 0 ? (
                              <div className="text-center py-8 text-emerald-500 font-mono">
                                  No critical vulnerabilities detected on the surface.
                              </div>
                          ) : (
                              results.vulnerabilities.map((v: any, i: number) => (
                                <motion.div 
                                    key={i} 
                                    variants={{
                                        hidden: { opacity: 0, y: 20, scale: 0.98 },
                                        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4 } }
                                    }}
                                    className="flex items-start gap-4 p-5 rounded-xl bg-background border border-border hover:border-border/80 transition-colors group"
                                >
                                  <AlertTriangle className={cn(
                                      "mt-1 shrink-0 transition-transform group-hover:scale-110",
                                      v.severity === 'High' ? 'text-red-500' : 
                                      v.severity === 'Medium' ? 'text-orange-500' : 'text-yellow-500'
                                  )} />
                                  <div className="w-full">
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-foreground text-lg">{v.type}</h4>
                                        <Badge variant="outline" className={cn(
                                            "uppercase tracking-widest text-[10px] font-bold border",
                                            v.severity === 'High' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                                            v.severity === 'Medium' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 
                                            'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                                        )}>
                                            {v.severity}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground leading-relaxed">{v.description}</p>
                                  </div>
                                </motion.div>
                              ))
                          )}
                        </CardContent>
                      </Card>
                  </motion.div>
                </motion.div>
              )}
          </AnimatePresence>

        </div>
      </main>
    </div>
  );
}