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
import { Navbar } from "@/components/Navbar"; 
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
  Shield,
  Trash2,
  AlertTriangle 
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [scanHistory, setScanHistory] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate("/auth");
          return;
        }
        setUser(user);

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

  const handleDeleteAccount = async () => {
    try {
        const { error } = await supabase.rpc('delete_user');
        if (error) throw error;
        await supabase.auth.signOut();
        toast({
            title: "Account Deleted",
            description: "Your account and data have been permanently removed.",
            variant: "destructive"
        });
        navigate("/");
    } catch (error: any) {
        console.error("Error deleting account:", error);
        toast({
            title: "Error",
            description: "Could not delete account. Please try again.",
            variant: "destructive"
        });
    }
  };

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
    <>
      <Navbar />
      
      {/* Container: pt-24 ensures Mobile Nav doesn't overlap. md:pt-24 preserves PC layout. */}
      <div className="bg-background pt-20 md:pt-24 pb-4 px-4 md:px-6 min-h-[calc(100vh-80px)]">
        
        <div className="max-w-6xl mx-auto space-y-4">
          
          {/* --- HEADER SECTION --- */}
          {/* Responsive: Flex Col on Mobile, Row on Desktop */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl bg-secondary/30 border-2 border-red-500/50 backdrop-blur-sm shadow-lg shadow-red-900/10 animate-in slide-in-from-top-4 duration-500 w-full">
            <div className="flex items-center gap-5 w-full md:w-auto">
              <Avatar className="h-16 w-16 border-4 border-background shadow-xl shrink-0">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.user_metadata?.full_name || 'User'}`} />
                <AvatarFallback className="text-xl font-bold">
                  {user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1 min-w-0">
                <h1 className="text-2xl font-display font-bold text-foreground truncate">
                  {user?.user_metadata?.full_name || "Sentinel Operative"}
                </h1>
                <div className="flex items-center gap-3 text-muted-foreground flex-wrap">
                  <span className="flex items-center gap-1.5 text-xs whitespace-nowrap">
                    <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
                    Verified Account
                  </span>
                  <span className="h-1 w-1 rounded-full bg-white/20 hidden sm:block" />
                  <span className="text-xs truncate max-w-[150px] sm:max-w-none">{user?.email}</span>
                </div>
              </div>
            </div>
            
            {/* Buttons stretch on mobile (flex-1) */}
            <div className="flex gap-2 w-full md:w-auto mt-2 md:mt-0">
               <Button variant="outline" size="sm" className="gap-2 flex-1 md:flex-none" onClick={() => navigate('/')}>
                 Back to Home
               </Button>
               <Button variant="destructive" size="sm" className="gap-2 flex-1 md:flex-none" onClick={handleLogout}>
                 <LogOut className="w-4 h-4" />
                 Sign Out
               </Button>
            </div>
          </div>
  
          {/* --- TABS SECTION --- */}
          <Tabs defaultValue="history" className="w-full">
            {/* UPDATED: grid-cols-2 for Mobile (2x2 grid), md:grid-cols-4 for PC (1 row) */}
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 max-w-full md:max-w-2xl mb-4 bg-secondary/50 p-1 h-auto md:h-10">
              <TabsTrigger value="overview" className="gap-2 text-xs md:text-sm">
                <User className="w-3.5 h-3.5" /> Overview
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2 text-xs md:text-sm">
                <History className="w-3.5 h-3.5" /> Scan History
              </TabsTrigger>
              <TabsTrigger value="user-info" className="gap-2 text-xs md:text-sm">
                <Settings className="w-3.5 h-3.5" /> User Info
              </TabsTrigger>
              <TabsTrigger value="danger-zone" className="gap-2 text-xs md:text-sm data-[state=active]:bg-red-500 data-[state=active]:text-white">
                <AlertTriangle className="w-3.5 h-3.5" /> Danger Zone
              </TabsTrigger>
            </TabsList>
  
            {/* 1. OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-4 animate-in fade-in-50 duration-300">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card className="border-2 border-red-500/20 hover:border-red-500/40 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Scans Run</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{scanHistory.length}</div>
                    <p className="text-xs text-muted-foreground">+2 from last week</p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-red-500/20 hover:border-red-500/40 transition-colors">
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
                <Card className="border-2 border-red-500/20 hover:border-red-500/40 transition-colors">
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
  
            {/* 2. SCAN HISTORY TAB */}
            <TabsContent value="history" className="animate-in fade-in-50 duration-300">
              <Card className="border-2 border-red-500/50 bg-background/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <CardTitle>Recent Operations</CardTitle>
                  <CardDescription>
                    A log of all heuristic warfare scans executed by this account.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {scanHistory.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <Shield className="w-10 h-10 mx-auto mb-3 opacity-20" />
                      <p className="text-sm">No scans recorded yet.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {scanHistory.map((scan) => (
                        <div 
                          key={scan.id} 
                          className="group flex flex-col md:flex-row items-start md:items-center justify-between p-3 rounded-lg border border-white/5 hover:border-white/20 bg-secondary/10 hover:bg-secondary/30 transition-all duration-200"
                        >
                          <div className="flex items-start gap-3 mb-2 md:mb-0 w-full md:w-auto">
                            <div className="p-2 rounded-md bg-background border border-white/10 group-hover:border-sentinel-blue/50 transition-colors shrink-0">
                              <Shield className="w-4 h-4 text-muted-foreground group-hover:text-sentinel-blue" />
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-semibold text-sm text-foreground flex items-center gap-2 truncate">
                                <span className="truncate">{scan.target_url}</span>
                                <ExternalLink className="w-3 h-3 opacity-50 shrink-0" />
                              </h4>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {format(new Date(scan.created_at), 'MMM dd')}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Shield className="w-3 h-3" />
                                  {scan.scan_mode || 'Quick'}
                                </span>
                              </div>
                            </div>
                          </div>
  
                          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end pl-11 md:pl-0">
                            <div className="text-right">
                               <div className="scale-90 origin-left md:origin-right">{getRiskBadge(scan.risk_score || 0)}</div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0">
                              <FileText className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
  
            {/* 3. USER INFORMATION TAB */}
            <TabsContent value="user-info" className="animate-in fade-in-50 duration-300">
              <Card className="border-2 border-red-500/50">
                <CardHeader className="pb-3">
                  <CardTitle>User Information</CardTitle>
                  <CardDescription>
                    Manage your personal information and security preferences.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                  <div className="pt-2">
                    <Button className="bg-sentinel-blue hover:bg-sentinel-blue/90 text-white w-full md:w-auto">
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 4. DANGER ZONE TAB */}
            <TabsContent value="danger-zone" className="animate-in fade-in-50 duration-300">
                <Card className="border-2 border-red-900/50 bg-red-950/10">
                    <CardHeader>
                        <CardTitle className="text-red-500 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            Danger Zone
                        </CardTitle>
                        <CardDescription className="text-red-200/60">
                            Irreversible actions for your account. Proceed with extreme caution.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 border border-red-500/20 bg-background/50 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <h4 className="text-sm font-semibold text-foreground">Delete Account</h4>
                                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                                    Permanently remove your personal details, scan history, and generated reports. This action cannot be undone.
                                </p>
                            </div>
                            
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="destructive" className="bg-red-600 hover:bg-red-700 w-full md:w-auto">
                                        Delete My Account
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="border-red-500/50 bg-[#1a1a1a] max-w-[90%] md:max-w-lg rounded-xl">
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className="text-red-500">Are you absolutely sure?</AlertDialogTitle>
                                        <AlertDialogDescription className="text-gray-400">
                                            This action will permanently delete your Sentinel account and remove your data from our servers.
                                            <br/><br/>
                                            Type <strong>DELETE</strong> to confirm.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter className="flex-col gap-2 md:flex-row">
                                        <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5 hover:text-white mt-2 md:mt-0">Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700 text-white border-0">
                                            Yes, delete my account
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}