import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { account, ID } from "@/lib/appwrite";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
    CheckCircle2,
    Eye,
    EyeOff,
    Loader2
} from "lucide-react";
import { Navbar } from "@/components/Navbar";

// Assets
import AuthIllustration from "@/assets/AuthBlack.webp";
import AuthIllustrationWhite from "@/assets/AuthWhite.webp";

// --- Components ---

const OrDivider = () => (
    <div className="flex items-center my-4">
        <div className="flex-grow border-t border-border"></div>
        <span className="mx-4 text-xs font-medium text-muted-foreground uppercase">
            OR
        </span>
        <div className="flex-grow border-t border-border"></div>
    </div>
);

const SocialLogins = () => (
    <div className="grid grid-cols-1 gap-3">
        <Button variant="outline" disabled className="w-full h-11 text-sm">
            <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
            Continue with Google (Coming Soon)
        </Button>
    </div>
);

export default function AuthPage() {
    const [isDarkMode, setIsDarkMode] = useState(
        document.documentElement.classList.contains("dark")
    );

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const navigate = useNavigate();
    const { checkSession, isAuthenticated } = useAuth();

    useEffect(() => {
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

    useEffect(() => {
        if (isAuthenticated) navigate('/');
    }, [isAuthenticated, navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            await account.createEmailPasswordSession(email, password);
            await checkSession(); 
            setSuccess("Logged in successfully!");
            navigate('/');
        } catch (err: any) {
            setError(err.message || "Invalid credentials.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            setIsLoading(false);
            return;
        }
        try {
            await account.create(ID.unique(), email, password, name);
            await account.createEmailPasswordSession(email, password);
            await checkSession();
            setSuccess("Account created!");
            navigate('/');
        } catch (err: any) {
            if (err.code === 409) setError("Account with this email already exists.");
            else setError(err.message || "Failed to create account.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen bg-background text-foreground overflow-hidden flex flex-col">
            
            <Navbar />

            <div className="flex-1 w-full lg:grid lg:grid-cols-2 h-full overflow-hidden">
                
                {/* Left Column */}
                <div className="hidden lg:flex flex-col items-center justify-center px-12 bg-secondary/30 relative h-full">
                    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
                    <div className="absolute h-full w-full bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
                    
                    {/* Compacted space-y from 8 to 6 */}
                    <div className="relative z-10 text-center space-y-6 max-w-lg">
                        <div className="relative">
                            <img
                                src={isDarkMode ? AuthIllustrationWhite : AuthIllustration}
                                alt="Security Illustration"
                                className="w-full max-w-[420px] mx-auto drop-shadow-2xl"
                            />
                        </div>
                        
                        <div className="space-y-4">
                            <h1 className="text-4xl font-display font-bold leading-tight">
                                Secure Infrastructure
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                Identify and neutralize threats before they emerge with Sentinel's heuristic engine.
                            </p>
                        </div>

                        {/* REPLACED CARDS WITH BULLET POINTS */}
                        <div className="space-y-3 text-left max-w-sm mx-auto pt-2">
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                <span className="text-base font-medium">Real-time Threat Detection</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                                <span className="text-base font-medium">Automated Compliance Reports</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="flex flex-col items-center justify-center pt-24 pb-12 px-4 sm:px-6 lg:p-8 bg-background relative h-full">
                    <div className="w-full max-w-md space-y-6">
                        
                        <div className="text-center space-y-2">
                            <h2 className="text-3xl font-bold tracking-tight">
                                Welcome Back
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Enter your credentials to access your Sentinel dashboard.
                            </p>
                        </div>

                        {error && (
                            <Alert variant="destructive" className="animate-in fade-in zoom-in-95">
                                <AlertTitle className="flex items-center gap-2">
                                    Error: <span className="font-normal">{error}</span>
                                </AlertTitle>
                            </Alert>
                        )}

                        <Tabs defaultValue="login" className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-4 h-11">
                                <TabsTrigger value="login" className="text-sm">Login</TabsTrigger>
                                <TabsTrigger value="signup" className="text-sm">Sign Up</TabsTrigger>
                            </TabsList>

                            <TabsContent value="login" className="space-y-6">
                                <Card className="border-none shadow-none bg-transparent p-0">
                                    <CardContent className="p-0 space-y-6">
                                        
                                        <form onSubmit={handleLogin} className="space-y-3">
                                            <div className="space-y-2">
                                                <Label htmlFor="email" className="text-sm">Email</Label>
                                                <Input 
                                                    id="email" 
                                                    type="email" 
                                                    placeholder="name@company.com" 
                                                    required 
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="h-11 text-base"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <Label htmlFor="password" className="text-sm">Password</Label>
                                                    <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
                                                </div>
                                                <div className="relative">
                                                    <Input 
                                                        id="password" 
                                                        type={showPassword ? "text" : "password"} 
                                                        required 
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        className="h-11 text-base pr-10"
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <Button className="w-full h-11 text-base font-medium mt-2" type="submit" disabled={isLoading}>
                                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Login to Account
                                            </Button>
                                        </form>
                                        
                                        <OrDivider />
                                        <SocialLogins />
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="signup">
                                <Card className="border-none shadow-none bg-transparent p-0">
                                    <CardContent className="p-0 space-y-6">
                                        
                                        <form onSubmit={handleSignup} className="space-y-3">
                                            <div className="space-y-2">
                                                <Label htmlFor="signup-name" className="text-sm">Full Name</Label>
                                                <Input 
                                                    id="signup-name" 
                                                    placeholder="John Doe" 
                                                    required 
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="h-11 text-base"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="signup-email" className="text-sm">Email</Label>
                                                <Input 
                                                    id="signup-email" 
                                                    type="email" 
                                                    placeholder="name@company.com" 
                                                    required 
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="h-11 text-base"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="signup-password" className="text-sm">Password</Label>
                                                <div className="relative">
                                                    <Input 
                                                        id="signup-password" 
                                                        type={showPassword ? "text" : "password"} 
                                                        required 
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        className="h-11 text-base pr-10"
                                                        minLength={8}
                                                    />
                                                    <button
                                                        type="button"
                                                        className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <Button className="w-full h-11 text-base font-medium mt-2" type="submit" disabled={isLoading}>
                                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                Create Account
                                            </Button>
                                        </form>

                                        <OrDivider />
                                        <SocialLogins />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
}