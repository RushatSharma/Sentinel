import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Sun, Moon, LogIn, User, LayoutDashboard, LogOut, Settings } from 'lucide-react'; 
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false); // State for Profile Card
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const profileRef = useRef<HTMLDivElement>(null); // Ref to close dropdown on click outside
  
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // --- AUTH LISTENER ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsProfileOpen(false);
    navigate('/');
  };

  // --- THEME LOGIC ---
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  const navLinks = [
    { name: 'Features', href: '/#features' },
    { name: 'Compliance', href: '/#compliance' },
    { name: 'Reporting', href: '/#reporting' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md transition-all duration-300">
      
      {/* Static "Bridge" Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-sentinel-red via-transparent to-sentinel-blue opacity-100 z-50" />

      <div className="container mx-auto px-4 md:px-6">
        <div className="relative flex items-center justify-between h-16 lg:h-20">

          {/* --- LOGO SECTION --- */}
          <div className="flex-1 flex justify-start">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative w-12 h-12"> 
                <img 
                    src="/LogoBlack.png" 
                    alt="Sentinel Logo" 
                    className="absolute inset-0 w-full h-full object-contain block dark:hidden transition-transform duration-300 group-hover:scale-110" 
                />
                <img 
                    src="/LogoWhite.png" 
                    alt="Sentinel Logo" 
                    className="absolute inset-0 w-full h-full object-contain hidden dark:block transition-transform duration-300 group-hover:scale-110" 
                />
              </div>
              <span className="text-2xl font-bold font-display tracking-tight text-foreground">
                SENTINEL
              </span>
            </Link>
          </div>

          {/* --- DESKTOP NAVIGATION --- */}
          <nav className="hidden lg:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center space-x-8">
            {navLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={cn(
                  "font-medium text-base text-muted-foreground transition-colors hover:text-sentinel-blue py-2 relative",
                  "after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-center after:scale-x-0 after:bg-sentinel-blue after:transition-transform after:duration-300 hover:after:scale-x-100"
                )}
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* --- DESKTOP RIGHT ACTIONS --- */}
          <div className="hidden lg:flex flex-1 justify-end items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-secondary/50 hover:bg-secondary transition-colors border border-transparent hover:border-white/10"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {user ? (
               <div className="relative" ref={profileRef}>
                 {/* PROFILE TRIGGER BUTTON */}
                 <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-2 p-1 pr-3 rounded-full border border-white/10 bg-secondary/30 hover:bg-secondary/50 transition-colors"
                 >
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.user_metadata?.full_name || 'User'}`} />
                        <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-foreground max-w-[100px] truncate">
                        {user?.user_metadata?.full_name || 'Account'}
                    </span>
                 </button>

                 {/* --- PROFILE DROPDOWN CARD --- */}
                 {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl border border-white/10 bg-background/95 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in-95 z-50 overflow-hidden">
                        <div className="p-3 border-b border-white/10">
                            <p className="text-sm font-semibold text-foreground truncate">{user?.user_metadata?.full_name}</p>
                            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                        </div>
                        <div className="p-1 space-y-1">
                            <Link to="/profile" onClick={() => setIsProfileOpen(false)}>
                                <Button variant="ghost" className="w-full justify-start h-9 px-2 text-sm font-normal">
                                    <User className="mr-2 h-4 w-4" />
                                    Profile
                                </Button>
                            </Link>
                            <Link to="/dashboard" onClick={() => setIsProfileOpen(false)}>
                                <Button variant="ghost" className="w-full justify-start h-9 px-2 text-sm font-normal">
                                    <LayoutDashboard className="mr-2 h-4 w-4" />
                                    Dashboard
                                </Button>
                            </Link>
                            <Link to="/settings" onClick={() => setIsProfileOpen(false)}>
                                <Button variant="ghost" className="w-full justify-start h-9 px-2 text-sm font-normal">
                                    <Settings className="mr-2 h-4 w-4" />
                                    Settings
                                </Button>
                            </Link>
                        </div>
                        <div className="p-1 border-t border-white/10">
                            <Button 
                                variant="ghost" 
                                onClick={handleLogout}
                                className="w-full justify-start h-9 px-2 text-sm font-normal text-red-500 hover:text-red-600 hover:bg-red-500/10"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Log out
                            </Button>
                        </div>
                    </div>
                 )}
               </div>
            ) : (
                <Link to="/auth">
                  <Button className="bg-sentinel-blue hover:bg-sentinel-blue/90 text-white font-medium px-6 rounded-full shadow-lg shadow-sentinel-blue/20 hover:shadow-sentinel-blue/40 transition-all duration-300">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
            )}
          </div>

          {/* --- MOBILE MENU TOGGLE --- */}
          <div className="lg:hidden">
            <button
              className="p-2 rounded-md text-foreground hover:bg-secondary/50"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* --- MOBILE MENU PANEL --- */}
        {isMenuOpen && (
          <div className="absolute left-0 w-full lg:hidden bg-background/95 backdrop-blur-xl border-b border-white/10 shadow-2xl animate-in slide-in-from-top-5">
            <nav className="flex flex-col p-4 space-y-2">
              {navLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="px-4 py-3 text-base font-medium text-foreground hover:text-sentinel-blue hover:bg-secondary/50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              
              <div className="h-px bg-white/10 my-2" />
              
              {/* CENTERED THEME BUTTON (Nexus Style) */}
              <div className="flex items-center justify-center py-4">
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 px-6 py-2 rounded-full bg-secondary hover:bg-secondary/80 transition-all border border-white/10"
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  <span className="text-sm font-medium">Toggle Theme</span>
                </button>
              </div>

              {/* Mobile Auth Buttons */}
              <div className="pt-2">
                {user ? (
                    <div className="flex flex-col gap-2">
                        <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                             <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-white/10 mb-2">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.user_metadata?.full_name || 'User'}`} />
                                    <AvatarFallback>U</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium text-sm">{user?.user_metadata?.full_name}</p>
                                    <p className="text-xs text-muted-foreground truncate max-w-[200px]">{user?.email}</p>
                                </div>
                             </div>
                        </Link>
                        
                        <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                            <Button variant="outline" className="w-full justify-start">
                                <LayoutDashboard className="w-4 h-4 mr-2" />
                                Dashboard
                            </Button>
                        </Link>
                        <Button 
                            onClick={() => { handleLogout(); setIsMenuOpen(false); }} 
                            className="w-full bg-destructive/80 hover:bg-destructive text-white"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Log Out
                        </Button>
                    </div>
                ) : (
                    <Link to="/auth" onClick={() => setIsMenuOpen(false)}>
                      <Button className="w-full bg-sentinel-blue hover:bg-sentinel-blue/90 text-white rounded-lg">
                        <LogIn className="w-4 h-4 mr-2" />
                        Sign In
                      </Button>
                    </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}