import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { 
    User, Mail, LogOut, ShieldCheck, Activity,
    Clock, Monitor, Smartphone, MapPin, Globe, Trash2
} from 'lucide-react';
import { account } from '../lib/appwrite'; 
import { cn } from '../lib/utils';
import { Navbar } from '../components/Navbar'; 
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = await account.get();
        setUser(currentUser);

        // Fetch all active sessions for this account (Real Data!)
        const sessionList = await account.listSessions();
        setSessions(sessionList.sessions);
      } catch (err) {
        console.error("Failed to load user data:", err);
        navigate('/auth');
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      navigate('/auth');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await account.deleteSession(sessionId);
      setSessions(sessions.filter(session => session.$id !== sessionId));
    } catch (error) {
      console.error("Failed to revoke session:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans overflow-x-hidden relative">
      <Navbar /> 
      
      {/* RESTORED: Animated Grid Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }} className="absolute inset-0 grid-background opacity-50 dark:opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </div>
      
      <main className="container relative z-10 mx-auto px-4 pt-12 pb-24 flex-grow max-w-4xl flex flex-col gap-6">
        
        {/* PAGE HEADER */}
        <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5 }}
            className="text-center mb-4"
        >
            <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                Account Settings
            </h1>
            <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
                Manage your personal information, security preferences, and active sessions.
            </p>
        </motion.div>

        {/* 1. CENTERED PROFILE CARD */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1, duration: 0.5 }}
            className="bg-card/80 backdrop-blur-md border border-border/80 rounded-3xl p-8 md:p-12 shadow-xl flex flex-col items-center text-center relative overflow-hidden"
        >
            <div className="relative mb-6 w-32 h-32 flex items-center justify-center">
                <Avatar className="w-28 h-28 border-4 border-background shadow-lg relative z-10 rounded-full">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}&backgroundColor=2563eb&textColor=ffffff`} className="object-cover" />
                    <AvatarFallback className="text-3xl bg-blue-600 text-white font-bold">
                        {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                </Avatar>
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-2">{user?.name}</h2>
            <div className="inline-flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6 bg-muted/50 px-4 py-1.5 rounded-full border border-border/50">
                <Mail className="w-4 h-4 text-blue-600 shrink-0" /> <span>{user?.email}</span>
            </div>
            
            <div className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-semibold mb-8">
                <ShieldCheck className="w-4 h-4" /> Active Administrator
            </div>

            {/* Centered Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
                <Link to="/dashboard" className="w-full sm:w-auto">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 px-8 font-medium shadow-sm transition-all">
                        <Activity className="w-4 h-4 mr-2" /> Command Center
                    </Button>
                </Link>
                <Button 
                    variant="outline" 
                    onClick={handleLogout}
                    className="w-full sm:w-auto border-border text-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-colors h-11 px-8 font-medium rounded-xl"
                >
                    <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </Button>
            </div>
        </motion.div>

        {/* 2. HORIZONTAL INFO CARD: PROFILE INFORMATION */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-card/80 backdrop-blur-md border border-border/80 rounded-3xl p-6 md:p-8 shadow-xl"
        >
            <h3 className="text-base font-semibold flex items-center gap-2 mb-6 text-foreground border-b border-border/50 pb-4">
                <User className="w-5 h-5 text-blue-600" /> Profile Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-background border border-border/80 rounded-2xl p-4 flex flex-col justify-center">
                    <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 mb-1">
                        Full Name
                    </span>
                    <span className="text-sm text-foreground font-semibold truncate">{user?.name}</span>
                </div>
                
                <div className="bg-background border border-border/80 rounded-2xl p-4 flex flex-col justify-center">
                    <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 mb-1">
                        Email Address
                    </span>
                    <span className="text-sm text-blue-600 truncate">{user?.email}</span>
                </div>

                <div className="bg-background border border-border/80 rounded-2xl p-4 flex flex-col justify-center">
                    <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 mb-1">
                        Account ID
                    </span>
                    <span className="text-xs font-mono text-muted-foreground truncate">{user?.$id}</span>
                </div>

                <div className="bg-background border border-border/80 rounded-2xl p-4 flex flex-col justify-center">
                    <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 mb-1">
                        Member Since
                    </span>
                    <span className="text-sm text-foreground truncate">
                        {new Date(user?.$createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                </div>
            </div>
        </motion.div>

        {/* 3. HORIZONTAL INFO CARD: SESSION MANAGEMENT */}
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-card/80 backdrop-blur-md border border-border/80 rounded-3xl p-6 md:p-8 shadow-xl"
        >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-border/50 pb-4 gap-4">
                <h3 className="text-base font-semibold flex items-center gap-2 text-foreground">
                    <Globe className="w-5 h-5 text-blue-600" /> Session Management
                </h3>
                <span className="text-xs bg-blue-600/10 text-blue-600 px-3 py-1 rounded-full font-medium border border-blue-600/20">
                    {sessions.length} Active Connection(s)
                </span>
            </div>
            
            <div className="space-y-3">
                {sessions.map((session) => (
                    <div key={session.$id} className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-background border border-border/80 rounded-2xl gap-4 hover:border-blue-600/30 transition-colors">
                        
                        <div className="flex items-start gap-4">
                            {/* Device Icon */}
                            <div className="relative p-3 bg-muted rounded-xl">
                                {session.clientName.toLowerCase().includes('mobile') || session.osName.toLowerCase().includes('ios') || session.osName.toLowerCase().includes('android') ? (
                                    <Smartphone className="w-5 h-5 text-muted-foreground" />
                                ) : (
                                    <Monitor className="w-5 h-5 text-muted-foreground" />
                                )}
                                
                                {session.current && (
                                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-background"></span>
                                    </span>
                                )}
                            </div>

                            {/* Device Info */}
                            <div>
                                <h4 className="font-semibold text-sm text-foreground mb-1 flex items-center gap-2">
                                    {session.osName} — {session.clientName}
                                    {session.current && (
                                        <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                                            This Device
                                        </span>
                                    )}
                                </h4>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {session.ip} ({session.countryCode || 'Unknown'})</span>
                                    <span className="hidden sm:inline text-border">•</span>
                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Last active: {new Date(session.$createdAt).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        {!session.current && (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleRevokeSession(session.$id)}
                                className="shrink-0 text-xs text-destructive hover:bg-destructive hover:text-white border-destructive/30 self-start md:self-center rounded-xl"
                            >
                                <Trash2 className="w-3.5 h-3.5 mr-2" /> Revoke Access
                            </Button>
                        )}
                    </div>
                ))}

                {sessions.length === 0 && (
                     <div className="text-center p-8 border border-dashed border-border/80 rounded-2xl">
                         <p className="text-sm text-muted-foreground">No active sessions detected.</p>
                     </div>
                )}
            </div>
        </motion.div>

      </main>
    </div>
  );
}