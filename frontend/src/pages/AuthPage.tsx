import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    CheckCircle,
    CheckCircle2,
    Eye,
    EyeOff,
    Menu,
    Moon,
    Sun,
    X,
    Shield, 
    Lock
} from "lucide-react";
import AuthWhiteImg from "@/assets/AuthWhite.webp"; 
import AuthBlackImg from "@/assets/AuthBlack.webp"; 
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

// --- Header Component ---
const AuthHeader = ({ isDarkMode, toggleTheme }: { isDarkMode: boolean; toggleTheme: () => void }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigation = [
        { name: "Home", href: "/" },
        { name: "Dashboard", href: "/dashboard" },
    ];

    return (
        <header className="absolute top-0 left-0 right-0 p-4 bg-transparent z-20">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="flex items-center space-x-2">
                    <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-sentinel-blue/10">
                         <Shield className="w-5 h-5 text-sentinel-blue" />
                    </div>
                    <span className="text-xl font-bold font-display text-foreground">SENTINEL</span>
                </Link>
                <nav className="hidden lg:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center space-x-8">
                    {navigation.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            className={({ isActive }) =>
                                cn(
                                    "font-medium text-foreground transition-colors hover:text-sentinel-blue py-2 relative",
                                    "after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-center after:scale-x-0 after:bg-sentinel-blue after:transition-transform after:duration-300",
                                    isActive && "text-sentinel-blue after:scale-x-100"
                                )
                            }
                        >
                            {item.name}
                        </NavLink>
                    ))}
                </nav>
                <div className="hidden lg:flex items-center space-x-2">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-md bg-secondary hover:bg-muted transition-colors border border-border"
                        aria-label="Toggle Theme"
                    >
                        {isDarkMode ? (
                            <Sun className="w-5 h-5" />
                        ) : (
                            <Moon className="w-5 h-5" />
                        )}
                    </button>
                    <Link to="/" className="hidden sm:flex">
                        <Button variant="outline" className="btn-outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Home
                        </Button>
                    </Link>
                </div>
                <div className="lg:hidden">
                    <button
                        className="p-2 rounded-md text-foreground"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>
            </div>
            {isMenuOpen && (
                <div className="absolute left-0 w-full lg:hidden bg-background/95 backdrop-blur-sm p-4 border-t border-border shadow-md z-50">
                    <nav className="flex flex-col space-y-3">
                        {navigation.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.href}
                                className={({ isActive }) =>
                                    cn(
                                        "text-foreground hover:text-sentinel-blue px-3 py-2 rounded-md",
                                        isActive && "bg-secondary text-sentinel-blue font-semibold"
                                    )
                                }
                                onClick={() => setIsMenuOpen(false)}
                            >
                                {item.name}
                            </NavLink>
                        ))}
                        <div className="pt-3 border-t border-border flex flex-col gap-3">
                            <div className="px-3 pt-2">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={toggleTheme}
                                >
                                    {isDarkMode ? (
                                        <Sun className="w-4 h-4 mr-2" />
                                    ) : (
                                        <Moon className="w-4 h-4 mr-2" />
                                    )}
                                    Toggle Theme
                                </Button>
                            </div>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
};

// --- Main AuthPage Component ---
export default function AuthPage() {
    const [isDarkMode, setIsDarkMode] = useState(
        document.documentElement.classList.contains("dark")
    );
    const [signupName, setSignupName] = useState("");
    const [signupEmail, setSignupEmail] = useState("");
    const [signupPassword, setSignupPassword] = useState("");
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showSignupPassword, setShowSignupPassword] = useState(false);
    const navigate = useNavigate();
    
    const [alert, setAlert] = useState<{
        type: "success" | "destructive";
        message: string;
    } | null>(null);

    const toggleTheme = () => {
        setIsDarkMode((prevMode) => {
            const newMode = !prevMode;
            if (newMode) {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
            return newMode;
        });
    };

    useEffect(() => {
        setIsDarkMode(document.documentElement.classList.contains("dark"));
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === "class") {
                    setIsDarkMode(document.documentElement.classList.contains("dark"));
                }
            });
        });
        observer.observe(document.documentElement, { attributes: true });
        return () => observer.disconnect();
    }, []);

    const showAlert = (type: "success" | "destructive", message: string) => {
        setAlert({ type, message });
        setTimeout(() => setAlert(null), 4000);
    };

    const handleSignup = async () => {
        if (!signupEmail || !signupPassword || !signupName) {
            showAlert("destructive", "Please fill in Name, Email, and Password.");
            return;
        }
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            showAlert("success", "Account created! Redirecting to Dashboard...");
            setTimeout(() => navigate('/dashboard'), 1500);
        }, 1500);
    };

    const handleLogin = async () => {
        if (!loginEmail || !loginPassword) {
            showAlert("destructive", "Please enter both email and password.");
            return;
        }
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            showAlert("success", "Welcome back! Redirecting...");
            setTimeout(() => navigate('/dashboard'), 1000);
        }, 1500);
    };

    return (
        <>
            <AuthHeader isDarkMode={isDarkMode} toggleTheme={toggleTheme} />

            <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
                {alert && (
                    <Alert
                        variant={alert.type}
                        className={`shadow-lg flex items-start ${alert.type === 'destructive' ? 'bg-destructive/10 border-destructive/50' : 'bg-green-500/10 border-green-500/50'}`}
                    >
                         {alert.type === 'success' && <CheckCircle className="h-5 w-5 mr-3 text-green-500 flex-shrink-0" />}
                         {alert.type === 'destructive' && <X className="h-5 w-5 mr-3 text-destructive flex-shrink-0" />}
                        <div>
                            <AlertTitle className={alert.type === 'success' ? 'text-green-500' : 'text-destructive'}>
                                {alert.type === "success" ? "Success" : "Error"}
                            </AlertTitle>
                            <AlertDescription>{alert.message}</AlertDescription>
                        </div>
                        <button onClick={() => setAlert(null)} className="ml-auto">
                            <X className="h-4 w-4 opacity-70" />
                        </button>
                    </Alert>
                )}
            </div>

            <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
                {/* --- Left Column (Illustration) --- */}
                {/* MODIFIED: Reduced padding from p-12 to p-6 to tighten vertical space */}
                <div className="hidden lg:flex flex-col items-center justify-center p-6 relative overflow-hidden">
                   <div className="absolute inset-0 bg-grid-white/5 bg-[size:20px_20px] pointer-events-none opacity-30" />
                   
                    {/* MODIFIED: Reduced space-y-6 to space-y-4 */}
                    <div className="text-center space-y-4 relative z-10 max-w-3xl">
                        
                        <div className="relative rounded-2xl overflow-hidden max-w-md mx-auto">
                            <img
                                src={isDarkMode ? AuthWhiteImg : AuthBlackImg}
                                alt="Security Illustration"
                                className="w-full object-cover transition-all duration-700"
                            />
                        </div>
                        
                        <h1 className="text-4xl font-display font-bold leading-tight text-foreground whitespace-nowrap">
                            Secure Your <span className="text-sentinel-blue">Digital Frontier</span>
                        </h1>
                        
                        <div className="text-left max-w-md mx-auto space-y-3">
                            <p className="text-lg text-muted-foreground">
                                Join elite security teams using Sentinel to bridge the gap between offensive discovery and defensive remediation.
                            </p>
                            <ul className="space-y-3 text-muted-foreground">
                                <li className="flex items-start">
                                    <CheckCircle2 className="w-5 h-5 mr-2 mt-1 text-sentinel-blue flex-shrink-0" />
                                    Automated compliance mapping (GDPR, PCI-DSS).
                                </li>
                                <li className="flex items-start">
                                    <CheckCircle2 className="w-5 h-5 mr-2 mt-1 text-sentinel-blue flex-shrink-0" />
                                    Real-time Shadow API discovery & risk analysis.
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* --- Right Column (Auth Forms) --- */}
                {/* MODIFIED: Reduced padding from pt-24 pb-12 to pt-16 pb-8 to remove scrollbar */}
                <div className="flex flex-col items-center justify-center pt-16 pb-8 px-4 sm:px-6 lg:p-8 bg-background">
                    <div className="w-full max-w-md">
                         {/* MODIFIED: Reduced margin-bottom from mb-8 to mb-6 */}
                         <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-sentinel-blue/10 mb-4">
                                <Lock className="w-6 h-6 text-sentinel-blue" />
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight text-foreground font-display">
                                Access Sentinel
                            </h2>
                            <p className="mt-2 text-muted-foreground">
                                Authenticate to access the dashboard.
                            </p>
                        </div>

                        <Tabs defaultValue="login" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-6">
                                <TabsTrigger value="login">Login</TabsTrigger>
                                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                            </TabsList>

                            {/* Login Tab */}
                            <TabsContent value="login">
                                <Card className="border-none shadow-none bg-transparent">
                                    <CardContent className="space-y-4 p-0">
                                         <div className="space-y-2">
                                            <Label htmlFor="login-email">Email</Label>
                                            <Input
                                                id="login-email"
                                                type="email"
                                                placeholder="sec-admin@company.com"
                                                value={loginEmail}
                                                onChange={(e) => setLoginEmail(e.target.value)}
                                                required
                                                className="bg-secondary/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor="login-password">Password</Label>
                                            </div>
                                            <div className="relative">
                                                <Input
                                                    id="login-password"
                                                    type={showLoginPassword ? "text" : "password"}
                                                    value={loginPassword}
                                                    onChange={(e) => setLoginPassword(e.target.value)}
                                                    required
                                                    className="bg-secondary/50"
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                                                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                                                >
                                                    {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                        </div>
                                        <Button
                                            className="w-full bg-sentinel-blue hover:bg-sentinel-blue/90"
                                            onClick={handleLogin}
                                            disabled={loading}
                                        >
                                            {loading ? "Authenticating..." : "Login"}
                                        </Button>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Signup Tab */}
                            <TabsContent value="signup">
                                 <Card className="border-none shadow-none bg-transparent">
                                    <CardContent className="space-y-4 p-0">
                                        <div className="space-y-2">
                                            <Label htmlFor="signup-name">Full Name</Label>
                                            <Input
                                                id="signup-name"
                                                placeholder="Jane Doe"
                                                value={signupName}
                                                onChange={(e) => setSignupName(e.target.value)}
                                                required
                                                className="bg-secondary/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="signup-email">Email</Label>
                                            <Input
                                                id="signup-email"
                                                type="email"
                                                placeholder="jane@company.com"
                                                value={signupEmail}
                                                onChange={(e) => setSignupEmail(e.target.value)}
                                                required
                                                className="bg-secondary/50"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="signup-password">Password</Label>
                                            <div className="relative">
                                                <Input
                                                    id="signup-password"
                                                    type={showSignupPassword ? "text" : "password"}
                                                    value={signupPassword}
                                                    onChange={(e) => setSignupPassword(e.target.value)}
                                                    required
                                                    minLength={8} 
                                                    className="bg-secondary/50"
                                                />
                                                <button
                                                    type="button"
                                                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                                                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                                                >
                                                    {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                </button>
                                            </div>
                                             <p className="text-xs text-muted-foreground">Must be at least 8 characters.</p>
                                        </div>
                                        <div className="pt-2">
                                            <Button
                                                className="w-full bg-sentinel-blue hover:bg-sentinel-blue/90"
                                                onClick={handleSignup}
                                                disabled={loading}
                                            >
                                                {loading ? "Creating Account..." : "Create Account"}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </>
    );
}