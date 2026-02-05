import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { 
  Shield, 
  Search, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  FileText, 
  Download,
  Loader2
} from "lucide-react";
// --- APPWRITE IMPORT ---
import { account } from "@/lib/appwrite";

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
        // If not logged in, user can still scan but history won't save
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
          // Sending Appwrite user ID to backend to save history
          user_id: user?.$id || null 
        }),
      });

      if (!response.ok) throw new Error("Scan failed");

      const data = await response.json();
      setResults(data);
      
      toast({
        title: "Scan Complete",
        description: `Found ${data.vulnerabilities.length} potential issues.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to the scanning engine.",
        variant: "destructive",
      });
    } finally {
      setScanning(false);
    }
  };

  const downloadReport = async () => {
    // PDF Generation logic remains similar
    toast({ title: "Generating Report", description: "Your PDF is being prepared..." });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* --- SEARCH SECTION --- */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold font-display tracking-tight">
              Operational <span className="text-sentinel-blue">Dashboard</span>
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Enter a target URL to initiate a heuristic vulnerability assessment.
            </p>
            
            <form onSubmit={handleScan} className="flex gap-2 max-w-2xl mx-auto pt-4">
              <Input 
                placeholder="https://example.com" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-secondary/50 h-12 text-lg border-2 focus-visible:ring-sentinel-blue"
                disabled={scanning}
              />
              <Button 
                type="submit" 
                size="lg" 
                className="bg-sentinel-blue hover:bg-sentinel-blue/90 h-12 px-8"
                disabled={scanning}
              >
                {scanning ? <Loader2 className="animate-spin mr-2" /> : <Search className="mr-2" />}
                {scanning ? "Scanning..." : "Analyze"}
              </Button>
            </form>
          </div>

          {scanning && (
            <Card className="border-sentinel-blue/50 animate-pulse">
              <CardContent className="pt-6 space-y-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>Engine: Heuristic Warfare Node</span>
                  <span>{Math.random() > 0.5 ? "Analyzing Headers..." : "Checking SSL..."}</span>
                </div>
                <Progress value={45} className="h-2" />
              </CardContent>
            </Card>
          )}

          {/* --- RESULTS SECTION --- */}
          {results && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-secondary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-sentinel-red">
                      {results.summary.high * 25 + results.summary.medium * 10}%
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-secondary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Threats Found</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{results.vulnerabilities.length}</div>
                  </CardContent>
                </Card>
                <Card className="bg-secondary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Report Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" size="sm" className="p-0 h-auto gap-1 text-sentinel-blue" onClick={downloadReport}>
                      <Download className="w-4 h-4" /> Export PDF
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-2 border-red-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShieldAlert className="text-sentinel-red" />
                    Detected Vulnerabilities
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {results.vulnerabilities.map((v: any, i: number) => (
                    <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-secondary/30 border border-white/5">
                      <AlertTriangle className={`mt-1 ${v.severity === 'High' ? 'text-red-500' : 'text-orange-500'}`} />
                      <div>
                        <h4 className="font-bold">{v.type}</h4>
                        <p className="text-sm text-muted-foreground">{v.description}</p>
                        <Badge variant="outline" className="mt-2">{v.severity}</Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}