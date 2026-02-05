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
import { Navbar } from "@/components/Navbar"; // Ensure this import is correct based on your previous fix
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
  ShieldAlert,
  LogOut,
  Calendar,
  ShieldCheck,
  Shield,
  Trash2,
  AlertTriangle,
  Download,
  Loader2,
  ChevronDown
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // State
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [scanHistory, setScanHistory] = useState<any[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Fetch Data
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
        // Don't redirect immediately on error to avoid flicker, just show empty state
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Actions
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
    if (score >= 75) return <Badge variant="destructive" className="bg-red-600">Critical ({score})</Badge>;
    if (score >= 40) return <Badge className="bg-orange-500 hover:bg-orange-600">Medium ({score})</Badge>;
    return <Badge className="bg-green-500 hover:bg-green-600">Safe ({score})</Badge>;
  };

  // REMOVED: The blocking "if (loading) return..." block is gone.
  // The layout below renders immediately.

  return (
    <>
      <Navbar />
      <div className="bg-background pt-20 md:pt-24 pb-4 px-4 md:px-6 min-h-[calc(100vh-80px)]">
        <div className="max-w-6xl mx-auto space-y-4">
          
          {/* HEADER */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl bg-secondary/30 border-2 border-red-500/50 backdrop-blur-sm shadow-lg shadow-red-900/10 w-full animate-in fade-in duration-500">
            <div className="flex items-center gap-5 w-full md:w-auto">
              <Avatar className="h-16 w-16 border-4 border-background shadow-xl shrink-0">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}`} />
                <AvatarFallback>
                    {loading ? "..." : user?.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h1 className="text-2xl font-display font-bold text-foreground truncate">
                  {loading ? "Loading Profile..." : user?.name || "Sentinel Operative"}
                </h1>
                <div className="flex items-center gap-3 text-muted-foreground text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-green-500" /> Verified Operative
                  <span className="h-1 w-1 rounded-full bg-white/20" />
                  {loading ? "..." : user?.email}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
               <Button variant="outline" size="sm" onClick={() => navigate('/')}>Home</Button>
               <Button variant="destructive" size="sm" onClick={handleLogout}><LogOut className="w-4 h-4 mr-2" />Sign Out</Button>
            </div>
          </div>
  
          {/* TABS */}
          <Tabs defaultValue="history" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-4">
              <TabsTrigger value="overview"><User className="w-3.5 h-3.5 mr-2" /> Overview</TabsTrigger>
              <TabsTrigger value="history"><History className="w-3.5 h-3.5 mr-2" /> History</TabsTrigger>
              <TabsTrigger value="user-info"><Settings className="w-3.5 h-3.5 mr-2" /> User Info</TabsTrigger>
              <TabsTrigger value="danger-zone"><AlertTriangle className="w-3.5 h-3.5 mr-2" /> Danger</TabsTrigger>
            </TabsList>
  
            {/* OVERVIEW TAB */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Scans</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : scanHistory.length}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Avg Risk Score</CardTitle>
                    <ShieldAlert className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 
                        scanHistory.length > 0 
                        ? Math.round(scanHistory.reduce((acc, curr) => acc + (curr.risk_score || 0), 0) / scanHistory.length)
                        : 0}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
  
            {/* HISTORY TAB */}
            <TabsContent value="history">
              <Card className="border-2 border-red-500/50">
                <CardHeader><CardTitle>Scan Operations</CardTitle></CardHeader>
                <CardContent>
                  {loading ? (
                     <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                     </div>
                  ) : scanHistory.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">No scans recorded.</div>
                  ) : (
                    <div className="space-y-2">
                      {scanHistory.map((scan) => (
                        <div key={scan.$id} className="flex flex-col md:flex-row items-center justify-between p-3 rounded-lg border border-white/5 bg-secondary/10">
                          
                          {/* Left: Info */}
                          <div className="flex items-center gap-3 w-full md:w-auto">
                             <Shield className="w-8 h-8 text-primary/50" />
                             <div>
                                <h4 className="font-semibold text-sm truncate w-48 md:w-auto">{scan.target_url}</h4>
                                <div className="flex gap-2 text-xs text-muted-foreground">
                                   <span>{format(new Date(scan.$createdAt), 'MMM dd')}</span>
                                   <span>• {scan.scan_mode || 'Quick'}</span>
                                </div>
                             </div>
                          </div>
  
                          {/* Right: Actions */}
                          <div className="flex items-center gap-3 w-full md:w-auto justify-end mt-2 md:mt-0">
                            {getRiskBadge(scan.risk_score || 0)}
                            
                            {/* DOWNLOAD DROPDOWN */}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" disabled={downloadingId === scan.$id}>
                                   {downloadingId === scan.$id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                   <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
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

                            {/* DELETE BUTTON */}
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Scan?</AlertDialogTitle>
                                        <AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction className="bg-red-600" onClick={() => handleDeleteScan(scan.$id)}>
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* User Info & Danger Zone (Simplified for brevity as they don't depend on loading state as critically) */}
            <TabsContent value="user-info">
              <Card className="border-2 border-red-500/50">
                <CardHeader><CardTitle>User Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label>Display Name</Label>
                    <Input defaultValue={user?.name || ""} disabled={loading} className="bg-secondary/50" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Email Address</Label>
                    <Input defaultValue={user?.email || ""} disabled className="bg-secondary/20 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="danger-zone">
               <Card className="border-red-900/50 bg-red-950/10">
                 <CardHeader><CardTitle className="text-red-500">Danger Zone</CardTitle></CardHeader>
                 <CardContent>
                   <Button variant="destructive" onClick={handleDeleteAccount}>Delete Account</Button>
                 </CardContent>
               </Card>
            </TabsContent>

          </Tabs>
        </div>
      </div>
    </>
  );
}