import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Button } from '../components/ui/button';
import { 
    Activity, ShieldAlert, History, Radar, Lock, 
    Zap, Network, Search, ChevronRight, FileText, 
    AlertTriangle, Server, ShieldCheck, Filter, ArrowUpDown, ArrowUp, ArrowDown, ArrowRight 
} from 'lucide-react';
import { cn } from '../lib/utils';
import { account, databases } from '../lib/appwrite';
import { Query } from 'appwrite';
import { AuroraTextEffect } from '../components/AuroraTextEffect'; // Imported Aurora effect

const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

export default function DashboardPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [metrics, setMetrics] = useState({ totalRisk: 0, criticalThreats: 0, totalScans: 0 });

  const [searchTarget, setSearchTarget] = useState('');
  const [filterEngine, setFilterEngine] = useState('all');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });

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
                if (doc.risk_score > 75) criticalThreats += doc.vulnerabilities_found || 0;
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

  const processedHistory = useMemo(() => {
    let result = [...history];

    if (searchTarget.trim() !== '') {
        result = result.filter(scan => 
            scan.target_url?.toLowerCase().includes(searchTarget.toLowerCase())
        );
    }

    if (filterEngine !== 'all') {
        result = result.filter(scan => scan.scan_mode === filterEngine);
    }

    result.sort((a, b) => {
        let aVal, bVal;

        switch (sortConfig.key) {
            case 'date':
                aVal = new Date(a.$createdAt).getTime();
                bVal = new Date(b.$createdAt).getTime();
                break;
            case 'target':
                aVal = a.target_url?.toLowerCase() || '';
                bVal = b.target_url?.toLowerCase() || '';
                break;
            case 'engine':
                aVal = a.scan_mode?.toLowerCase() || '';
                bVal = b.scan_mode?.toLowerCase() || '';
                break;
            case 'findings':
                aVal = a.vulnerabilities_found || 0;
                bVal = b.vulnerabilities_found || 0;
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
      if (sortConfig.key !== key) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-50 group-hover:opacity-100 transition-opacity" />;
      return sortConfig.direction === 'asc' 
        ? <ArrowUp className="w-3 h-3 ml-1 text-sentinel-blue" /> 
        : <ArrowDown className="w-3 h-3 ml-1 text-sentinel-blue" />;
  };

  const tools = [
    { name: 'Quick Scan', path: '/scan', icon: Zap, color: 'red', desc: 'Rapid passive reconnaissance & surface audit.' },
    { name: 'Deep Scan', path: '/deep-scan', icon: Search, color: 'purple', desc: 'Active Playwright heuristic & fuzzing engine.' },
    { name: 'SSL Analyzer', path: '/ssl-scan', icon: Lock, color: 'cyan', desc: 'X.509 cryptography & downgrade attack simulation.' },
    { name: 'OSINT Recon', path: '/recon', icon: Radar, color: 'blue', desc: 'External attack surface & subdomain mapping.' },
    { name: 'API Fuzzer', path: '/api-fuzzer', icon: Network, color: 'emerald', desc: 'Swagger ingestion & BOLA/IDOR exploitation.' },
  ];

  const uniqueEngines = Array.from(new Set(history.map(item => item.scan_mode))).filter(Boolean);

  const getRiskColor = (score: number) => {
      if (score >= 75) return 'text-red-500 bg-red-500/10 border-red-500/20';
      if (score >= 40) return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      if (score >= 1) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
  };

  return (
    <div className="min-h-screen bg-background relative flex flex-col pb-16 font-sans overflow-x-hidden">
      <Navbar />
      
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }} className="absolute inset-0 grid-background opacity-50 dark:opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </div>
      
      <main className="container relative z-10 mx-auto px-4 pt-12 max-w-[1400px] flex flex-col gap-8 [perspective:1200px] flex-grow">
        
        {/* HEADER SECTION */}
        <motion.div 
            initial={{ opacity: 0, y: -40, rotateX: 30 }} 
            animate={{ opacity: 1, y: 0, rotateX: 0 }} 
            transition={{ duration: 0.8, type: 'spring', bounce: 0.3 }} 
            className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-4"
        >
            <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-4 bg-sentinel-blue/10 border-sentinel-blue/30 text-sentinel-blue">
                    <Activity className="w-3 h-3 animate-pulse" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Unified Command Center</span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground tracking-tight flex flex-wrap items-center gap-x-3">
                    Welcome back, 
                    <AuroraTextEffect 
                        text={user?.name?.split(' ')[0] || 'Operator'} 
                        textClassName="font-display font-bold"
                    />
                </h1>
            </div>
            <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-card/80 backdrop-blur-md border border-border/80 rounded-lg shadow-sm flex items-center gap-3">
                    <Server className="w-4 h-4 text-emerald-500" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Engine Status</span>
                        <span className="text-xs font-mono text-emerald-500">ONLINE & SYNCED</span>
                    </div>
                </div>
            </div>
        </motion.div>

        {/* METRICS ROW - ADDED BORDERS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card/80 backdrop-blur-md border border-border/80 hover:border-border transition-colors rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-sentinel-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="p-3 rounded-xl bg-sentinel-blue/10 border border-sentinel-blue/20">
                        <History className="w-6 h-6 text-sentinel-blue" />
                    </div>
                </div>
                <h3 className="text-4xl font-display font-bold text-foreground mb-1 relative z-10">{loading ? '-' : metrics.totalScans}</h3>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider relative z-10">Total Operations</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card/80 backdrop-blur-md border border-border/80 hover:border-border transition-colors rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                        <ShieldAlert className="w-6 h-6 text-red-500" />
                    </div>
                </div>
                <h3 className="text-4xl font-display font-bold text-foreground mb-1 relative z-10">{loading ? '-' : metrics.criticalThreats}</h3>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider relative z-10">Critical Threats Found</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card/80 backdrop-blur-md border border-border/80 hover:border-border transition-colors rounded-2xl p-6 shadow-xl relative overflow-hidden group flex flex-col justify-between">
                 <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 relative z-10">Average Security Posture</p>
                    <div className="flex items-end gap-3 relative z-10">
                        <span className={cn("text-6xl font-display font-bold leading-none", metrics.totalRisk > 50 ? 'text-orange-500' : 'text-emerald-500')}>
                            {loading ? '-' : metrics.totalRisk > 75 ? 'F' : metrics.totalRisk > 50 ? 'C' : metrics.totalRisk > 25 ? 'B' : 'A'}
                        </span>
                        <span className="text-sm text-muted-foreground mb-1">Global Grade</span>
                    </div>
                </div>
                <div className="w-full bg-secondary h-1.5 rounded-full mt-4 relative z-10 overflow-hidden">
                    <div className={cn("h-full", metrics.totalRisk > 50 ? 'bg-orange-500' : 'bg-emerald-500')} style={{ width: `${Math.max(10, 100 - metrics.totalRisk)}%` }} />
                </div>
            </motion.div>
        </div>

        {/* QUICK LAUNCH HUB - ADDED BORDERS */}
        <div className="mt-4">
            <h2 className="text-lg font-bold font-display mb-4 flex items-center gap-2 text-foreground">
                <Zap className="w-5 h-5 text-sentinel-blue" /> Quick Launch Hub
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {tools.map((tool, idx) => (
                    <Link key={idx} to={tool.path} className="block group">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }} 
                            animate={{ opacity: 1, scale: 1 }} 
                            transition={{ delay: 0.4 + (idx * 0.1) }}
                            className={cn(
                                "bg-card/80 backdrop-blur-md border border-border/80 rounded-xl p-5 h-full transition-all duration-300 hover:-translate-y-1 shadow-sm",
                                `hover:border-${tool.color}-500/50 hover:shadow-[0_0_20px_rgba(var(--${tool.color}-500),0.1)]`
                            )}
                        >
                            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-colors", `bg-${tool.color}-500/10 text-${tool.color}-500 group-hover:bg-${tool.color}-500 group-hover:text-white`)}>
                                <tool.icon className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-foreground text-sm mb-2 group-hover:text-sentinel-blue transition-colors flex items-center justify-between">
                                {tool.name} <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                            </h3>
                            <p className="text-xs text-muted-foreground leading-relaxed">{tool.desc}</p>
                        </motion.div>
                    </Link>
                ))}
            </div>
        </div>

        {/* FIXED HEIGHT ACTIVITY STREAM WITH STICKY HEADER */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-4 bg-card/80 backdrop-blur-md border border-border/80 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[550px]">
            
            <div className="bg-muted/30 px-6 py-4 border-b border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
                <span className="text-sm font-bold flex items-center gap-2 uppercase tracking-tighter text-foreground">
                    <FileText className="w-4 h-4 text-sentinel-blue" /> Operation History
                </span>
                
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input 
                            type="text" 
                            placeholder="Search targets..." 
                            className="w-full bg-background border border-border rounded-lg pl-9 pr-4 py-1.5 text-sm focus:outline-none focus:border-sentinel-blue/50 transition-colors font-mono"
                            value={searchTarget}
                            onChange={(e) => setSearchTarget(e.target.value)}
                        />
                    </div>
                    <div className="relative w-full sm:w-auto">
                        <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <select 
                            className="w-full sm:w-auto appearance-none bg-background border border-border rounded-lg pl-9 pr-8 py-1.5 text-sm focus:outline-none focus:border-sentinel-blue/50 transition-colors font-mono cursor-pointer"
                            value={filterEngine}
                            onChange={(e) => setFilterEngine(e.target.value)}
                        >
                            <option value="all">All Engines</option>
                            {uniqueEngines.map(engine => (
                                <option key={engine} value={engine}>{engine}</option>
                            ))}
                        </select>
                        <ChevronRight className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none rotate-90" />
                    </div>
                </div>
            </div>
            
            {/* Scrollable Container */}
            <div className="flex-1 overflow-auto custom-scrollbar relative">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur-md shadow-sm border-b border-border">
                        <tr className="text-muted-foreground text-[10px] uppercase tracking-widest select-none">
                            <th className="px-6 py-4">
                                <button onClick={() => handleSort('date')} className="flex items-center font-bold hover:text-foreground transition-colors group">
                                    Date & Time {getSortIcon('date')}
                                </button>
                            </th>
                            <th className="px-6 py-4">
                                <button onClick={() => handleSort('target')} className="flex items-center font-bold hover:text-foreground transition-colors group">
                                    Target {getSortIcon('target')}
                                </button>
                            </th>
                            <th className="px-6 py-4">
                                <button onClick={() => handleSort('engine')} className="flex items-center font-bold hover:text-foreground transition-colors group">
                                    Engine Type {getSortIcon('engine')}
                                </button>
                            </th>
                            <th className="px-6 py-4">
                                <button onClick={() => handleSort('findings')} className="flex items-center font-bold hover:text-foreground transition-colors group">
                                    Findings {getSortIcon('findings')}
                                </button>
                            </th>
                            <th className="px-6 py-4">
                                <button onClick={() => handleSort('risk')} className="flex items-center font-bold hover:text-foreground transition-colors group">
                                    Risk Assessment {getSortIcon('risk')}
                                </button>
                            </th>
                            <th className="px-6 py-4 text-right font-bold cursor-default">Action</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-border">
                        {loading ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground animate-pulse font-mono">
                                    Fetching telemetry data...
                                </td>
                            </tr>
                        ) : processedHistory.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <History className="w-10 h-10 opacity-20" />
                                        <p>No operations match your filters.</p>
                                        {(searchTarget || filterEngine !== 'all') && (
                                            <Button variant="outline" size="sm" onClick={() => { setSearchTarget(''); setFilterEngine('all'); }}>
                                                Clear Filters
                                            </Button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            processedHistory.map((scan, idx) => (
                                <tr key={scan.$id || idx} className="hover:bg-muted/30 transition-colors group">
                                    <td className="px-6 py-4 font-mono text-xs text-muted-foreground whitespace-nowrap">
                                        {new Date(scan.$createdAt).toLocaleDateString()} <span className="opacity-50 ml-1">{new Date(scan.$createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-foreground font-medium truncate max-w-[200px]">
                                        {scan.target_url}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 rounded bg-secondary border border-border text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                                            {scan.scan_mode}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {scan.vulnerabilities_found > 0 ? (
                                            <span className="flex items-center gap-1.5 text-red-500 font-bold text-xs whitespace-nowrap">
                                                <AlertTriangle className="w-3.5 h-3.5" /> {scan.vulnerabilities_found} Threats
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 text-emerald-500 font-bold text-xs whitespace-nowrap">
                                                <ShieldCheck className="w-3.5 h-3.5" /> Clean
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn("px-2.5 py-1 rounded border text-[10px] font-bold uppercase tracking-wider whitespace-nowrap", getRiskColor(scan.risk_score))}>
                                            Risk: {scan.risk_score}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-sentinel-blue opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap">
                                            View Logs <ChevronRight className="w-3 h-3 ml-1" />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </motion.div>

      </main>
    </div>
  );
}