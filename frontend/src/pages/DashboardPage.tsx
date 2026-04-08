import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { 
    Activity, ShieldAlert, History, Radar, Lock, 
    Zap, Network, Search, ChevronRight, FileText, 
    AlertTriangle, Server, ShieldCheck, Filter, 
    ArrowUpDown, ArrowUp, ArrowDown, ArrowRight,
    Download, Trash2, Briefcase, Loader2, Globe, FileSearch,
    User, Mail, LayoutGrid
} from 'lucide-react';
import { cn } from '../lib/utils';
import { account, databases } from '../lib/appwrite';
import { Query } from 'appwrite';
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

// --- NEW IMPORTS FOR CUSTOM UI ALERTS ---
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

export default function DashboardPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [metrics, setMetrics] = useState({ totalRisk: 0, criticalThreats: 0, totalScans: 0 });

  const [searchTarget, setSearchTarget] = useState('');
  const [filterEngine, setFilterEngine] = useState('all');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });
  
  const [activeDownloadMenu, setActiveDownloadMenu] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  // --- NEW STATE FOR CUSTOM MODALS ---
  const [scanToDelete, setScanToDelete] = useState<string | null>(null);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const currentUser = await account.get();
        setUser(currentUser);

        if (DATABASE_ID && COLLECTION_ID) {
            const response = await databases.listDocuments(
                DATABASE_ID,
                COLLECTION_ID,
                [
                    Query.equal('user_id', currentUser.$id),
                    Query.orderDesc('$createdAt'),
                    Query.limit(100) 
                ]
            );
            
            const docs = response.documents;
            setHistory(docs);

            let totalRisk = 0;
            let criticalThreats = 0;
            
            docs.forEach((doc: any) => {
                totalRisk += doc.risk_score || 0;
                const vulns = doc.vulns_found ?? doc.vulnerabilities_found ?? 0;
                if (doc.risk_score > 75) criticalThreats += vulns;
            });

            setMetrics({
                totalRisk: docs.length ? Math.round(totalRisk / docs.length) : 0, 
                criticalThreats,
                totalScans: docs.length
            });
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // --- REFACTORED DELETE LOGIC ---
  const executeDelete = async () => {
    if (!scanToDelete) return;
    
    try {
        await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, scanToDelete);
        setHistory(prev => prev.filter(item => item.$id !== scanToDelete));
    } catch (error) {
        console.error("Failed to delete scan:", error);
        setErrorAlert("Failed to delete the record. Please check your connection and try again.");
    } finally {
        setScanToDelete(null); // Close the modal
    }
  };

  const handleDownloadReport = async (scan: any, type: 'executive' | 'technical') => {
      const downloadId = `${scan.$id}-${type}`;
      setIsDownloading(downloadId); 
      
      try {
          const rawReportData = typeof scan.report_json === 'string' 
              ? JSON.parse(scan.report_json) 
              : (scan.report_json || {});

          const engine = scan.scan_mode || scan.mode || '';
          let reportType = type;
          if (engine === 'OSINT Recon') reportType = 'recon';
          if (engine === 'SSL Analyzer') reportType = 'ssl';
          if (engine === 'Quarantine') reportType = 'quarantine';

          const targetUrl = scan.target_url || scan.target || 'Unknown_Target';

          const response = await fetch(`${API_BASE_URL}/api/download-report`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  ...rawReportData, 
                  target: targetUrl, 
                  report_type: reportType,
              }),
          });

          if (!response.ok) throw new Error(`Server responded with ${response.status}: ${response.statusText}`);

          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `Sentinel_${engine.replace(/\s+/g, '_')}_${new Date().getTime()}.pdf`;
          document.body.appendChild(a);
          a.click();
          
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          setActiveDownloadMenu(null);
          
      } catch (error) {
          console.error("PDF Generation Failed:", error);
          setErrorAlert("Failed to generate the report. Please check if your backend server is running properly.");
      } finally {
          setIsDownloading(null);
      }
  };

  const processedHistory = useMemo(() => {
    let result = [...history];

    if (searchTarget.trim() !== '') {
        result = result.filter(scan => {
            const target = scan.target_url || scan.target || '';
            return target.toLowerCase().includes(searchTarget.toLowerCase());
        });
    }

    if (filterEngine !== 'all') {
        result = result.filter(scan => (scan.scan_mode || scan.mode) === filterEngine);
    }

    result.sort((a, b) => {
        let aVal, bVal;

        switch (sortConfig.key) {
            case 'date':
                aVal = new Date(a.$createdAt).getTime();
                bVal = new Date(b.$createdAt).getTime();
                break;
            case 'target':
                aVal = (a.target_url || a.target || '').toLowerCase();
                bVal = (b.target_url || b.target || '').toLowerCase();
                break;
            case 'engine':
                aVal = (a.scan_mode || a.mode || '').toLowerCase();
                bVal = (b.scan_mode || b.mode || '').toLowerCase();
                break;
            case 'findings':
                aVal = a.vulnerabilities_found ?? a.vulns_found ?? 0;
                bVal = b.vulnerabilities_found ?? b.vulns_found ?? 0;
                break;
            case 'risk':
                aVal = a.risk_score || 0;
                bVal = b.risk_score || 0;
                break;
            default:
                aVal = 0; bVal = 0;
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
    });

    return result;
  }, [history, searchTarget, filterEngine, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig(current => ({
        key,
        direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const getSortIcon = (key: string) => {
      if (sortConfig.key !== key) return <ArrowUpDown className="w-4 h-4 ml-1 opacity-40 group-hover:opacity-100 transition-opacity" />;
      return sortConfig.direction === 'asc' 
        ? <ArrowUp className="w-4 h-4 ml-1 text-primary" /> 
        : <ArrowDown className="w-4 h-4 ml-1 text-primary" />;
  };

  const getIconForMode = (mode: string) => {
    switch(mode) {
      case 'Deep Scan': return <ShieldAlert className="w-4 h-4 text-purple-500" />;
      case 'Quick Scan': return <Zap className="w-4 h-4 text-blue-500" />;
      case 'OSINT Recon': return <Globe className="w-4 h-4 text-indigo-500" />;
      case 'API Fuzzer': return <Network className="w-4 h-4 text-emerald-500" />;
      case 'SSL Analyzer': return <Lock className="w-4 h-4 text-cyan-500" />;
      case 'Quarantine': return <FileSearch className="w-4 h-4 text-orange-500" />;
      default: return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const tools = [
    { name: 'Quick Scan', path: '/scan', icon: Zap, color: 'blue', desc: 'Rapid surface vulnerability audit.' },
    { name: 'Deep Scan', path: '/deep-scan', icon: Search, color: 'purple', desc: 'Intensive Playwright heuristic engine.' },
    { name: 'SSL Analyzer', path: '/ssl-scan', icon: Lock, color: 'cyan', desc: 'X.509 & downgrade attack simulation.' },
    { name: 'OSINT Recon', path: '/recon', icon: Radar, color: 'indigo', desc: 'Attack surface & subdomain mapping.' },
    { name: 'API Fuzzer', path: '/api-fuzzer', icon: Network, color: 'emerald', desc: 'Swagger & endpoint exploitation.' },
  ];

  const uniqueEngines = Array.from(new Set(history.map(item => item.scan_mode || item.mode))).filter(Boolean);

  const getRiskColor = (score: number) => {
      if (score >= 75) return 'text-red-600 bg-red-500/10 border-red-500/20';
      if (score >= 40) return 'text-orange-600 bg-orange-500/10 border-orange-500/20';
      if (score >= 1) return 'text-yellow-600 bg-yellow-500/10 border-yellow-500/20';
      return 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20';
  };

  return (
    <div className="min-h-screen bg-background relative flex flex-col pb-16 font-sans">
      <Navbar />
      
      <div className="fixed inset-0 z-0 pointer-events-none bg-muted/20" />
      
      <main className="container relative z-10 mx-auto px-4 pt-10 max-w-[1400px] flex flex-col gap-8 flex-grow">
        
        <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, ease: "easeOut" }} 
            className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-card border border-border rounded-2xl p-6 lg:p-8 shadow-sm"
        >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 max-w-3xl">
                <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-background shadow-sm shrink-0">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || 'User'}`} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">U</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                            Welcome back, {user?.name?.split(' ')[0] || 'User'}
                        </h1>
                        <span className="hidden sm:flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-md border border-primary/20">
                            <ShieldCheck className="w-3.5 h-3.5" /> Security Admin
                        </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3 max-w-2xl">
                        Monitor your global security posture, analyze incoming threat intelligence, and deploy active countermeasures. Your Sentinel dashboard provides real-time visibility across all connected endpoints and assets.
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-muted-foreground">
                        <span className="flex items-center gap-1.5 bg-muted px-2.5 py-1.5 rounded-md border border-border/50">
                            <Mail className="w-3.5 h-3.5 text-foreground/70" /> {user?.email || 'Loading...'}
                        </span>
                        <span className="flex items-center gap-1.5 bg-muted px-2.5 py-1.5 rounded-md border border-border/50">
                            <Server className="w-3.5 h-3.5 text-foreground/70" /> Workspace: Default
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex flex-col items-start lg:items-end gap-3 w-full lg:w-auto mt-2 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-border">
                <div className="flex items-center gap-3 bg-secondary/50 px-4 py-3 rounded-xl border border-border w-full lg:w-auto">
                    <div className="relative flex h-3 w-3 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-semibold text-foreground leading-none">System Online</span>
                        <span className="text-[11px] text-muted-foreground font-medium mt-1">All services operational</span>
                    </div>
                </div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-mono pl-1 lg:pl-0">
                    Last Sync: Just now
                </span>
            </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-xl p-5 lg:p-6 shadow-sm flex items-center gap-4 lg:gap-5 hover:shadow-md transition-shadow">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
                    <History className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-3">
                    <h3 className="text-4xl font-bold text-foreground leading-none">{loading ? '-' : metrics.totalScans}</h3>
                    <p className="text-sm font-medium text-muted-foreground leading-tight">Total<br/>Scans</p>
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-xl p-5 lg:p-6 shadow-sm flex items-center gap-4 lg:gap-5 hover:shadow-md transition-shadow">
                <div className="p-3 rounded-xl bg-red-500/10 text-red-500 shrink-0">
                    <ShieldAlert className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-3">
                    <h3 className="text-4xl font-bold text-foreground leading-none">{loading ? '-' : metrics.criticalThreats}</h3>
                    <p className="text-sm font-medium text-muted-foreground leading-tight">Critical<br/>Threats</p>
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border border-border rounded-xl p-5 lg:p-6 shadow-sm flex items-center gap-4 lg:gap-5 hover:shadow-md transition-shadow">
                 <div className={cn("p-3 rounded-xl shrink-0", metrics.totalRisk > 50 ? "bg-orange-500/10 text-orange-500" : "bg-emerald-500/10 text-emerald-500")}>
                    <Activity className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-3">
                    <h3 className={cn("text-4xl font-bold leading-none", metrics.totalRisk > 50 ? 'text-orange-500' : 'text-emerald-500')}>
                        {loading ? '-' : metrics.totalRisk > 75 ? 'F' : metrics.totalRisk > 50 ? 'C' : metrics.totalRisk > 25 ? 'B' : 'A'}
                    </h3>
                    <p className="text-sm font-medium text-muted-foreground leading-tight">Global<br/>Grade</p>
                </div>
            </motion.div>
        </div>

        <div className="mt-4">
            <div className="flex items-center gap-2 mb-4">
                <LayoutGrid className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold text-foreground">Quick Access</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {tools.map((tool, idx) => (
                    <Link key={idx} to={tool.path} className="block group">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            transition={{ delay: 0.4 + (idx * 0.1) }}
                            className="bg-card border border-border rounded-xl p-5 h-full transition-all duration-200 hover:border-primary/50 hover:shadow-md flex flex-col"
                        >
                            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-colors", `bg-${tool.color}-500/10 text-${tool.color}-500 group-hover:bg-${tool.color}-500 group-hover:text-white`)}>
                                <tool.icon className="w-5 h-5" />
                            </div>
                            <h3 className="font-semibold text-foreground text-sm mb-2 transition-colors flex items-center justify-between">
                                {tool.name} <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-muted-foreground" />
                            </h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">{tool.desc}</p>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-4 bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col h-[600px]">
            
            <div className="bg-muted/20 px-6 py-4 border-b border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
                <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <h2 className="text-lg font-semibold text-foreground">Scan History</h2>
                </div>
                
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input 
                            type="text" 
                            placeholder="Search targets..." 
                            className="w-full bg-background border border-border rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-shadow"
                            value={searchTarget}
                            onChange={(e) => setSearchTarget(e.target.value)}
                        />
                    </div>
                    <div className="relative w-full sm:w-auto">
                        <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <select 
                            className="w-full sm:w-auto appearance-none bg-background border border-border rounded-md pl-9 pr-9 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-shadow cursor-pointer"
                            value={filterEngine}
                            onChange={(e) => setFilterEngine(e.target.value)}
                        >
                            <option value="all">All Tools</option>
                            {uniqueEngines.map(engine => (
                                <option key={engine as string} value={engine as string}>{engine as string}</option>
                            ))}
                        </select>
                        <ChevronRight className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none rotate-90" />
                    </div>
                </div>
            </div>
            
            <div className="flex-1 overflow-auto relative pb-16">
                <table className="w-full text-left border-collapse min-w-[900px]">
                    <thead className="sticky top-0 z-20 bg-card shadow-sm border-b border-border">
                        <tr className="text-muted-foreground text-xs uppercase tracking-wider select-none bg-muted/10">
                            <th className="px-6 py-4 font-medium">
                                <button onClick={() => handleSort('date')} className="flex items-center hover:text-foreground transition-colors group">
                                    Date {getSortIcon('date')}
                                </button>
                            </th>
                            <th className="px-6 py-4 font-medium">
                                <button onClick={() => handleSort('target')} className="flex items-center hover:text-foreground transition-colors group">
                                    Target {getSortIcon('target')}
                                </button>
                            </th>
                            <th className="px-6 py-4 font-medium">
                                <button onClick={() => handleSort('engine')} className="flex items-center hover:text-foreground transition-colors group">
                                    Tool {getSortIcon('engine')}
                                </button>
                            </th>
                            <th className="px-6 py-4 font-medium">
                                <button onClick={() => handleSort('findings')} className="flex items-center hover:text-foreground transition-colors group">
                                    Status {getSortIcon('findings')}
                                </button>
                            </th>
                            <th className="px-6 py-4 font-medium">
                                <button onClick={() => handleSort('risk')} className="flex items-center hover:text-foreground transition-colors group">
                                    Risk {getSortIcon('risk')}
                                </button>
                            </th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-border">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground animate-pulse">
                                    Loading history data...
                                </td>
                            </tr>
                        ) : processedHistory.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-16 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <History className="w-10 h-10 opacity-20" />
                                        <p>No scan records found.</p>
                                        {(searchTarget || filterEngine !== 'all') && (
                                            <Button variant="ghost" onClick={() => { setSearchTarget(''); setFilterEngine('all'); }} className="mt-2 text-primary hover:bg-primary/10">
                                                Clear Filters
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            processedHistory.map((scan, idx) => {
                                const vulns = scan.vulnerabilities_found ?? scan.vulns_found ?? 0;
                                const engineType = scan.scan_mode || scan.mode || 'Unknown';
                                const targetUrl = scan.target_url || scan.target || 'Unknown';

                                return (
                                <tr key={scan.$id || idx} className="hover:bg-muted/30 transition-colors">
                                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                                        <span className="font-medium text-foreground">{new Date(scan.$createdAt).toLocaleDateString()}</span>
                                        <span className="text-xs ml-2">{new Date(scan.$createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </td>
                                    
                                    <td className="px-6 py-4 font-medium text-foreground break-all whitespace-normal min-w-[200px] max-w-[300px]">
                                        {targetUrl}
                                    </td>

                                    <td className="px-6 py-4">
                                        <span className="flex items-center gap-2 text-sm text-foreground whitespace-nowrap">
                                            {getIconForMode(engineType)}
                                            {engineType}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {vulns > 0 ? (
                                            <span className="flex items-center gap-1.5 text-red-500 font-medium text-sm whitespace-nowrap">
                                                <AlertTriangle className="w-4 h-4" /> {vulns} Issues
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-emerald-500 font-medium text-sm whitespace-nowrap">
                                                <ShieldCheck className="w-4 h-4" /> Secure
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn("px-2.5 py-1 rounded-md border text-xs font-semibold whitespace-nowrap inline-block", getRiskColor(scan.risk_score))}>
                                            Score: {scan.risk_score}
                                        </span>
                                    </td>
                                    
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            
                                            {/* PDF DOWNLOAD BUTTON & MENU */}
                                            <div className="relative">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => setActiveDownloadMenu(activeDownloadMenu === scan.$id ? null : scan.$id)} 
                                                    className={cn("h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10", activeDownloadMenu === scan.$id && "bg-primary/10 text-primary")}
                                                    title="Download Reports"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </Button>

                                                {activeDownloadMenu === scan.$id && (
                                                    <>
                                                        <div 
                                                            className="fixed inset-0 z-40" 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setActiveDownloadMenu(null);
                                                            }} 
                                                        />
                                                        
                                                        <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-lg z-50 overflow-hidden animate-in fade-in zoom-in-95">
                                                            <div className="p-1 flex flex-col relative z-50">
                                                                {['OSINT Recon', 'SSL Analyzer', 'Quarantine'].includes(engineType) ? (
                                                                     <button 
                                                                     onClick={(e) => {
                                                                         e.stopPropagation();
                                                                         handleDownloadReport(scan, 'technical');
                                                                     }}
                                                                     disabled={isDownloading === `${scan.$id}-technical`}
                                                                     className="flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors text-left disabled:opacity-50"
                                                                 >
                                                                     {isDownloading === `${scan.$id}-technical` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} 
                                                                     {isDownloading === `${scan.$id}-technical` ? 'Generating...' : 'Export Report'}
                                                                 </button>
                                                                ) : (
                                                                    <>
                                                                    <button 
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDownloadReport(scan, 'executive');
                                                                        }}
                                                                        disabled={isDownloading === `${scan.$id}-executive`}
                                                                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors text-left disabled:opacity-50"
                                                                    >
                                                                        {isDownloading === `${scan.$id}-executive` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Briefcase className="w-4 h-4" />} 
                                                                        {isDownloading === `${scan.$id}-executive` ? 'Generating...' : 'Executive Summary'}
                                                                    </button>
                                                                    <button 
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleDownloadReport(scan, 'technical');
                                                                        }}
                                                                        disabled={isDownloading === `${scan.$id}-technical`}
                                                                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors text-left disabled:opacity-50"
                                                                    >
                                                                        {isDownloading === `${scan.$id}-technical` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Terminal className="w-4 h-4" />} 
                                                                        {isDownloading === `${scan.$id}-technical` ? 'Generating...' : 'Technical Details'}
                                                                    </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            {/* DELETE BUTTON */}
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => setScanToDelete(scan.$id)} 
                                                className="h-8 w-8 text-muted-foreground hover:text-red-500 hover:bg-red-500/10" 
                                                title="Delete Record"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                            
                                        </div>
                                    </td>
                                </tr>
                            )})
                        )}
                    </tbody>
                </table>
            </div>
        </motion.div>
        
        {/* --- CUSTOM MODALS --- */}
        <AlertDialog open={!!scanToDelete} onOpenChange={(open) => !open && setScanToDelete(null)}>
            <AlertDialogContent className="bg-card border border-border">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-foreground">Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground">
                        This action cannot be undone. This will permanently delete the scan record and remove this data from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="bg-transparent text-foreground hover:bg-muted">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={executeDelete} className="bg-red-600 text-white hover:bg-red-700">
                        Continue
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!errorAlert} onOpenChange={(open) => !open && setErrorAlert(null)}>
            <AlertDialogContent className="bg-card border border-border">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-red-500 flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" /> Error
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-foreground">
                        {errorAlert}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction onClick={() => setErrorAlert(null)} className="bg-primary text-primary-foreground hover:bg-primary/90">
                        OK
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

      </main>
    </div>
  );
}