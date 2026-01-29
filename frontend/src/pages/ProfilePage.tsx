import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Settings, 
  History, 
  ShieldAlert, 
  LogOut, 
  Calendar, 
  FileText, 
  ExternalLink,
  ShieldCheck,
  Shield
} from "lucide-react";
import { format } from "date-fns";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [scanHistory, setScanHistory] = useState<any[]>([]);

  // 1. Fetch User & Scan History on Mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get User
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/auth");
          return;
        }
        setUser(user);

        // Get Scan History
        const { data: history, error } = await supabase
          .from("scan_history")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setScanHistory(history || []);
        
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  // Helper for Risk Badge Color
  const getRiskBadge = (score: number) => {
    if (score >= 75) return <Badge variant="destructive" className="bg-red-600">Critical ({score})</Badge>;
    if (score >= 40) return <Badge className="bg-orange-500 hover:bg-orange-600">Medium ({score})</Badge>;
    return <Badge className="bg-green-500 hover:bg-green-600">Safe ({score})</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-muted"></div>
          <div className="h-4 w-48 rounded bg-muted"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4 md:px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-8 rounded-2xl bg-secondary/30 border border-white/10 backdrop-blur-sm">
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.user_metadata?.full_name || 'User'}`} />
              <AvatarFallback className="text-2xl font-bold">
                {user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
              <h1 className="text-3xl font-display font-bold text-foreground">
                {user?.user_metadata?.full_name || "Sentinel Operative"}
              </h1>
              <div className="flex items-center gap-3 text-muted-foreground">
                <span className="flex items-center gap-1.5 text-sm">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  Verified Account
                </span>
                <span className="h-1 w-1 rounded-full bg-white/20" />
                <span className="text-sm">{user?.email}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
             <Button variant="outline" className="gap-2" onClick={() => navigate('/')}>
               Back to Home
             </Button>
             <Button variant="destructive" className="gap-2" onClick={handleLogout}>
               <LogOut className="w-4 h-4" />
               Sign Out
             </Button>
          </div>
        </div>

        {/* --- TABS SECTION --- */}
        <Tabs defaultValue="history" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mb-8 bg-secondary/50 p-1">
            <TabsTrigger value="overview" className="gap-2">
              <User className="w-4 h-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="w-4 h-4" /> Scan History
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" /> Settings
            </TabsTrigger>
          </TabsList>

          {/* 1. OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Scans Run</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{scanHistory.length}</div>
                  <p className="text-xs text-muted-foreground">+2 from last week</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Risk Score</CardTitle>
                  <ShieldAlert className="h-4 w-4 text-sentinel-red" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {scanHistory.length > 0 
                      ? Math.round(scanHistory.reduce((acc, curr) => acc + (curr.risk_score || 0), 0) / scanHistory.length)
                      : 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Across all projects</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Plan Status</CardTitle>
                  <ShieldCheck className="h-4 w-4 text-sentinel-blue" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Free Tier</div>
                  <p className="text-xs text-muted-foreground">Upgrade for automated reports</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 2. SCAN HISTORY TAB (Replaces Messages) */}
          <TabsContent value="history" className="animate-in fade-in-50 duration-500">
            <Card className="border-white/10 bg-background/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Recent Operations</CardTitle>
                <CardDescription>
                  A log of all heuristic warfare scans executed by this account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {scanHistory.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Shield className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No scans recorded yet. Initialize the engine to see data here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {scanHistory.map((scan) => (
                      <div 
                        key={scan.id} 
                        className="group flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-lg border border-white/5 hover:border-white/20 bg-secondary/10 hover:bg-secondary/30 transition-all duration-200"
                      >
                        <div className="flex items-start gap-4 mb-4 md:mb-0">
                          <div className="p-2 rounded-md bg-background border border-white/10 group-hover:border-sentinel-blue/50 transition-colors">
                            <Shield className="w-5 h-5 text-muted-foreground group-hover:text-sentinel-blue" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-foreground flex items-center gap-2">
                              {scan.target_url}
                              <ExternalLink className="w-3 h-3 opacity-50" />
                            </h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(scan.created_at), 'MMM dd, yyyy')}
                              </span>
                              <span className="flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                {scan.scan_mode || 'Quick'} Scan
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                          <div className="text-right">
                             <div className="mb-1">{getRiskBadge(scan.risk_score || 0)}</div>
                             <p className="text-xs text-muted-foreground">{scan.vulnerabilities_found} Issues Found</p>
                          </div>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                            <FileText className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 3. SETTINGS TAB */}
          <TabsContent value="settings" className="animate-in fade-in-50 duration-500">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your personal information and security preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-2">
                  <Label htmlFor="name">Display Name</Label>
                  <Input 
                    id="name" 
                    defaultValue={user?.user_metadata?.full_name} 
                    className="bg-secondary/50" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    defaultValue={user?.email} 
                    disabled 
                    className="bg-secondary/20 text-muted-foreground cursor-not-allowed" 
                  />
                </div>
                <div className="pt-4">
                  <Button className="bg-sentinel-blue hover:bg-sentinel-blue/90 text-white">
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}