import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { User, Mail, Shield, LogOut, LayoutDashboard, Key, Clock } from 'lucide-react';
import { account } from '../lib/appwrite';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await account.get();
        setUser(currentUser);
      } catch (err) {
        console.error("Failed to load user:", err);
        navigate('/auth');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await account.deleteSession('current');
      navigate('/auth');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-sentinel-blue/30 border-t-sentinel-blue rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative flex flex-col pb-16 font-sans">
      <Navbar />
      
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 grid-background opacity-50 dark:opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </div>
      
      <main className="container relative z-10 mx-auto px-4 pt-12 max-w-5xl flex flex-col gap-8 flex-grow">
        
        {/* Header Section with Dashboard Navigation */}
        <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="flex flex-col md:flex-row items-center justify-between gap-6 mb-2"
        >
            <div>
                <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground tracking-tight">
                    Operator Profile
                </h1>
                <p className="text-muted-foreground mt-2">Manage your account credentials, security, and access.</p>
            </div>
            <Link to="/dashboard">
                <Button className="bg-sentinel-blue hover:bg-sentinel-blue/90 text-white shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all gap-2 rounded-xl h-11 px-6 font-bold tracking-wide">
                    <LayoutDashboard className="w-4 h-4" /> COMMAND CENTER
                </Button>
            </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Left Column: Identity Card */}
            <motion.div 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: 0.1 }}
                className="md:col-span-1 bg-card/80 backdrop-blur-md border border-border/80 rounded-2xl p-6 shadow-xl flex flex-col items-center text-center h-fit"
            >
                <div className="relative mb-6 mt-4">
                    <div className="absolute inset-0 bg-sentinel-blue/20 blur-xl rounded-full" />
                    <Avatar className="w-28 h-28 border-2 border-sentinel-blue/50 relative z-10 shadow-lg">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}`} />
                        <AvatarFallback className="text-3xl bg-secondary">{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-1">{user?.name}</h2>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6 w-full truncate">
                    <Mail className="w-4 h-4 shrink-0" /> <span className="truncate">{user?.email}</span>
                </div>
                
                <div className="w-full px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 mb-8">
                    <Shield className="w-4 h-4" /> Account Active
                </div>

                <Button 
                    variant="outline" 
                    onClick={handleLogout}
                    className="w-full border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/50 transition-all font-bold"
                >
                    <LogOut className="w-4 h-4 mr-2" /> TERMINATE SESSION
                </Button>
            </motion.div>

            {/* Right Column: Account Details & Settings */}
            <motion.div 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: 0.2 }}
                className="md:col-span-2 space-y-6"
            >
                {/* Personal Information */}
                <div className="bg-card/80 backdrop-blur-md border border-border/80 rounded-2xl p-6 md:p-8 shadow-xl">
                    <h3 className="text-lg font-bold flex items-center gap-2 mb-6 border-b border-border/50 pb-4">
                        <User className="w-5 h-5 text-sentinel-blue" /> Personal Information
                    </h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 sm:items-center gap-2 sm:gap-4">
                            <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider text-[11px]">Full Name</span>
                            <div className="sm:col-span-2 bg-muted/50 px-4 py-3 rounded-xl border border-border/50 text-sm font-mono text-foreground font-medium">
                                {user?.name}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 sm:items-center gap-2 sm:gap-4">
                            <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider text-[11px]">Email Address</span>
                            <div className="sm:col-span-2 bg-muted/50 px-4 py-3 rounded-xl border border-border/50 text-sm font-mono text-foreground font-medium">
                                {user?.email}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 sm:items-center gap-2 sm:gap-4">
                            <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider text-[11px]">Account ID</span>
                            <div className="sm:col-span-2 bg-muted/50 px-4 py-3 rounded-xl border border-border/50 text-xs font-mono text-muted-foreground break-all">
                                {user?.$id}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 sm:items-center gap-2 sm:gap-4">
                            <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider text-[11px]">Member Since</span>
                            <div className="sm:col-span-2 flex items-center gap-2 bg-muted/50 px-4 py-3 rounded-xl border border-border/50 text-sm font-mono text-foreground">
                                <Clock className="w-4 h-4 text-sentinel-blue" />
                                {new Date(user?.$createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security Settings (UI Shell) */}
                <div className="bg-card/80 backdrop-blur-md border border-border/80 rounded-2xl p-6 md:p-8 shadow-xl">
                    <h3 className="text-lg font-bold flex items-center gap-2 mb-6 border-b border-border/50 pb-4 text-foreground">
                        <Key className="w-5 h-5 text-sentinel-blue" /> Security Settings
                    </h3>
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-muted/30 border border-border/50 rounded-xl gap-4">
                            <div>
                                <h4 className="font-bold text-sm text-foreground mb-1">Password Reset</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">Update your account credentials to maintain security.</p>
                            </div>
                            <Button variant="outline" size="sm" className="shrink-0 text-xs border-sentinel-blue/30 text-sentinel-blue hover:bg-sentinel-blue/10" disabled>
                                Update Password
                            </Button>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-muted/30 border border-border/50 rounded-xl gap-4">
                            <div>
                                <h4 className="font-bold text-sm text-foreground mb-1">Two-Factor Authentication</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">Add an extra layer of security to your account.</p>
                            </div>
                            <Button variant="outline" size="sm" className="shrink-0 text-xs" disabled>
                                Enable 2FA
                            </Button>
                        </div>
                    </div>
                </div>

            </motion.div>
        </div>

      </main>
    </div>
  );
}