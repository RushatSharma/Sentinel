import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { account, databases } from "@/lib/appwrite";
import { Query } from "appwrite";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar"; 
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  LogOut, 
  Calendar, 
  ExternalLink,
  ShieldCheck,
  Shield,
  Trash2,
  AlertTriangle,
  LayoutDashboard,
  Download,
  Loader2,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await account.get();
        if (!currentUser) {
          navigate("/auth");
          return;
        }
        setUser(currentUser);

        const response = await databases.listDocuments(
          import.meta.env.VITE_APPWRITE_DATABASE_ID,
          import.meta.env.VITE_APPWRITE_COLLECTION_ID,
          [
            Query.equal("user_id", currentUser.$id),
            Query.orderDesc("$createdAt")
          ]
        );

        setScanHistory(response.documents || []);
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // --- ACTIONS ---
  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleDeleteAccount = async () => {
    toast({
      title: "Action Required",
      description: "Account deletion protocol initiated. Contact admin for permanent removal.",
    });
    await handleLogout();
  };

  const handleDeleteScan = async (scanId: string) => {
    try {
      await databases.deleteDocument(
        import.meta.env.VITE_APPWRITE_DATABASE_ID,
        import.meta.env.VITE_APPWRITE_COLLECTION_ID,
        scanId
      );
      setScanHistory((prev) => prev.filter((scan) => scan.$id !== scanId));
      toast({ title: "Scan deleted successfully" });
    } catch (error: any) {
      console.error("Delete failed:", error);
      toast({ 
        variant: "destructive", 
        title: "Failed to delete scan",
        description: error.message 
      });
    }
  };

  const handleDownloadReport = async (scan: any, type: 'technical' | 'executive') => {
    try {
      setDownloadingId(scan.$id);
      
      let reportData = {};
      try {
        reportData = typeof scan.report_json === 'string' 
          ? JSON.parse(scan.report_json) 
          : scan.report_json;
      } catch (e) {
        throw new Error("Report data is corrupted.");
      }

      const payload = { ...reportData, report_type: type };

      const response = await fetch('http://127.0.0.1:5000/api/download-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Backend failed to generate PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Sentinel_${type === 'executive' ? 'Exec' : 'Tech'}_${scan.target_url}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({ title: `${type === 'executive' ? 'Executive' : 'Technical'} report downloaded` });

    } catch (error: any) {
      toast({ variant: "destructive", title: "Download Failed", description: error.message });
    } finally {
      setDownloadingId(null);
    }
  };

  const getRiskBadge = (score: number) => {
    if (score >= 75) return <Badge variant="destructive" className="bg-red-600 hover:bg-red-700">Critical ({score})</Badge>;
    if (score >= 40) return <Badge className="bg-orange-500 hover:bg-orange-600 text-white">Medium ({score})</Badge>;
    return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">Safe ({score})</Badge>;
  };

  // --- LAYOUT ---
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      {/* UPDATED: Reduced top margin (mt-4) and padding (py-4) to pull layout up */}
      <div className="flex-1 container mx-auto px-4 py-4 mt-4 max-w-7xl h-[calc(100vh-4rem)]">
        <Tabs defaultValue="overview" className="flex flex-col lg:flex-row gap-6 h-full">
          
          {/* --- LEFT SIDEBAR --- */}
          <aside className="lg:w-72 flex-shrink-0 flex flex-col gap-4">
            
            {/* User Card */}
            <Card className="border border-border bg-card shadow-sm rounded-lg overflow-hidden">
                <div className="h-20 bg-zinc-900 border-b border-border" />
                <CardContent className="pt-0 text-center relative -mt-10 pb-6">
                    <Avatar className="h-20 w-20 mx-auto border-4 border-card shadow-sm">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}`} />
                        <AvatarFallback className="text-xl bg-muted">{loading ? "..." : user?.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="mt-3 space-y-1">
                        <h2 className="text-lg font-bold truncate text-foreground">{loading ? "Loading..." : user?.name}</h2>
                        <p className="text-xs text-muted-foreground truncate">{loading ? "..." : user?.email}</p>
                    </div>

                    <div className="mt-4 flex justify-center">
                        <Badge variant="outline" className="border-emerald-500/50 text-emerald-600 bg-emerald-500/5">
                            <ShieldCheck className="w-3 h-3 mr-1.5" /> Verified
                        </Badge>
                    </div>
                </CardContent>
            </Card>

            {/* Navigation Menu */}
            <nav className="flex-1 flex flex-col gap-2">
                <Card className="border border-border bg-card shadow-sm rounded-lg p-2">
                    <TabsList className="flex flex-col h-auto bg-transparent w-full gap-1 p-0">
                        <TabsTrigger value="overview" className="w-full justify-start px-4 py-2.5 h-auto text-sm font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-muted-foreground rounded-md transition-colors">
                            <LayoutDashboard className="w-4 h-4 mr-3 opacity-70" /> Overview
                        </TabsTrigger>
                        <TabsTrigger value="history" className="w-full justify-start px-4 py-2.5 h-auto text-sm font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-muted-foreground rounded-md transition-colors">
                            <History className="w-4 h-4 mr-3 opacity-70" /> Scan History
                        </TabsTrigger>
                        <TabsTrigger value="user-info" className="w-full justify-start px-4 py-2.5 h-auto text-sm font-medium data-[state=active]:bg-primary/10 data-[state=active]:text-primary text-muted-foreground rounded-md transition-colors">
                            <Settings className="w-4 h-4 mr-3 opacity-70" /> Settings
                        </TabsTrigger>
                    </TabsList>
                </Card>
                
                <Card className="border border-border bg-card shadow-sm rounded-lg p-2 mt-auto">
                    <TabsList className="flex flex-col h-auto bg-transparent w-full p-0">
                         <TabsTrigger value="danger-zone" className="w-full justify-start px-4 py-2.5 h-auto text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 data-[state=active]:bg-red-50 data-[state=active]:text-red-600 rounded-md transition-colors">
                            <AlertTriangle className="w-4 h-4 mr-3 opacity-70" /> Danger Zone
                        </TabsTrigger>
                    </TabsList>
                </Card>

                <Button 
                    variant="outline" 
                    className="w-full justify-start border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground mt-2"
                    onClick={handleLogout}
                >
                    <LogOut className="w-4 h-4 mr-3" /> Sign Out
                </Button>
            </nav>

          </aside>

          {/* --- RIGHT CONTENT AREA --- */}
          <main className="flex-1 h-full overflow-hidden flex flex-col">
            
            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="mt-0 h-full overflow-y-auto pr-1 pb-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-card border border-border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Total Scans</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{loading ? <Loader2 className="animate-spin h-8 w-8" /> : scanHistory.length}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border border-border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Risk Score</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-primary">
                                {loading ? <Loader2 className="animate-spin h-8 w-8" /> : 
                                    scanHistory.length > 0 
                                    ? Math.round(scanHistory.reduce((acc, curr) => acc + (curr.risk_score || 0), 0) / scanHistory.length)
                                    : 0
                                }
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border border-border shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Member Since</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="text-lg font-medium text-foreground flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                {loading ? "..." : format(new Date(user?.$createdAt || new Date()), 'MMM yyyy')}
                             </div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-card border border-border shadow-sm flex-1">
                    <CardHeader className="border-b border-border pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Recent Activity</CardTitle>
                                <CardDescription>Latest security operations</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => navigate('/scan-results')}>
                                New Scan <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground"/></div>
                        ) : scanHistory.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground">No recent activity found.</div>
                        ) : (
                            <div className="divide-y divide-border">
                                {scanHistory.slice(0, 5).map((scan) => (
                                    <div key={scan.$id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                                <Shield className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-sm text-foreground">{scan.target_url}</h4>
                                                <p className="text-xs text-muted-foreground">{format(new Date(scan.$createdAt), 'PPP p')}</p>
                                            </div>
                                        </div>
                                        {getRiskBadge(scan.risk_score || 0)}
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            {/* HISTORY TAB */}
            <TabsContent value="history" className="mt-0 h-full flex flex-col">
                <Card className="bg-card border border-border shadow-sm flex flex-col h-full overflow-hidden">
                    <CardHeader className="border-b border-border flex-shrink-0 bg-muted/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Scan History</CardTitle>
                                <CardDescription>Complete audit log</CardDescription>
                            </div>
                            <Badge variant="outline" className="bg-background">{scanHistory.length} Records</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto p-0">
                        {loading ? (
                            <div className="h-full flex items-center justify-center">
                                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : scanHistory.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                                <Shield className="w-12 h-12 opacity-20" />
                                <p>No scan history available</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-border">
                                {scanHistory.map((scan) => (
                                    <div key={scan.$id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                                        
                                        <div className="flex items-start gap-4 min-w-0">
                                            <div className="mt-1 p-2 rounded-md bg-muted text-muted-foreground border border-border">
                                                <ExternalLink className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-medium text-sm text-foreground truncate">{scan.target_url}</h3>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" /> {format(new Date(scan.$createdAt), 'MMM dd, yyyy')}
                                                    </span>
                                                    <span className="capitalize px-1.5 py-0.5 rounded-sm bg-muted border border-border">
                                                        {scan.scan_mode || 'Quick'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                                            <div className="scale-90">{getRiskBadge(scan.risk_score || 0)}</div>

                                            <div className="flex items-center border border-border rounded-md shadow-sm bg-background">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="h-8 px-3 text-xs hover:bg-muted border-r border-border rounded-none rounded-l-md" disabled={downloadingId === scan.$id}>
                                                            {downloadingId === scan.$id ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Download className="w-3 h-3 mr-2" />}
                                                            Report <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem onClick={() => handleDownloadReport(scan, 'technical')}>
                                                            Technical Report
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDownloadReport(scan, 'executive')}>
                                                            Executive Summary
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>

                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-none rounded-r-md">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Delete Scan Record?</AlertDialogTitle>
                                                            <AlertDialogDescription>This action cannot be undone. The report and all associated data will be permanently removed.</AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={() => handleDeleteScan(scan.$id)}>
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            </div>
                                        </div>

                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            {/* SETTINGS TAB */}
            <TabsContent value="user-info" className="mt-0 h-full">
                <Card className="bg-card border border-border shadow-sm max-w-2xl">
                    <CardHeader className="border-b border-border bg-muted/20">
                        <CardTitle className="text-lg">Profile Settings</CardTitle>
                        <CardDescription>Manage your personal information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="grid gap-2">
                            <Label htmlFor="displayName">Display Name</Label>
                            <Input id="displayName" defaultValue={user?.name} className="bg-background border-border" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" defaultValue={user?.email} disabled className="bg-muted text-muted-foreground border-border" />
                        </div>
                        <div className="pt-2 flex justify-end">
                            <Button className="bg-primary hover:bg-primary/90">Save Changes</Button>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* DANGER ZONE TAB */}
            <TabsContent value="danger-zone" className="mt-0 h-full">
                <Card className="border border-red-500/30 bg-red-50/10 dark:bg-red-950/5 shadow-sm max-w-2xl">
                    <CardHeader className="border-b border-red-500/20">
                        <CardTitle className="text-red-600 dark:text-red-500 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" /> Danger Zone
                        </CardTitle>
                        <CardDescription>
                            Destructive actions that cannot be undone.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between p-4 border border-red-200 dark:border-red-900 rounded-lg bg-background">
                            <div>
                                <h4 className="font-semibold text-foreground">Delete Account</h4>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Permanently remove your account and all data.
                                </p>
                            </div>
                            <Button variant="destructive" onClick={handleDeleteAccount}>Delete Account</Button>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

          </main>
        </Tabs>
      </div>
    </div>
  );
}