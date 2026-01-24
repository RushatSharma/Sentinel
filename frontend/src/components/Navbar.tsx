import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Sun, Moon, Shield, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

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
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-white/10 transition-all duration-300">
      <div className="container mx-auto px-4 md:px-6">
        <div className="relative flex items-center justify-between h-16 lg:h-20">

          {/* Logo Section */}
          <div className="flex-1 flex justify-start">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="relative flex items-center justify-center w-8 h-8 bg-sentinel-blue/10 rounded-lg group-hover:bg-sentinel-blue/20 transition-colors">
                <Shield className="h-5 w-5 text-sentinel-blue transition-transform group-hover:scale-110" />
              </div>
              <span className="text-xl font-bold font-display tracking-tight text-foreground">
                SENTINEL
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center space-x-8">
            {navLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={cn(
                  // UPDATED: Changed text-sm to text-base for larger text
                  "font-medium text-base text-muted-foreground transition-colors hover:text-sentinel-blue py-2 relative",
                  "after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-center after:scale-x-0 after:bg-sentinel-blue after:transition-transform after:duration-300 hover:after:scale-x-100"
                )}
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="hidden lg:flex flex-1 justify-end items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-secondary/50 hover:bg-secondary transition-colors border border-transparent hover:border-white/10"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <Link to="/dashboard">
              <Button 
                className="bg-sentinel-blue hover:bg-sentinel-blue/90 text-white font-medium px-6 rounded-full shadow-lg shadow-sentinel-blue/20 hover:shadow-sentinel-blue/40 transition-all duration-300"
              >
                <Terminal className="w-4 h-4 mr-2" />
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              className="p-2 rounded-md text-foreground hover:bg-secondary/50"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Panel */}
        {isMenuOpen && (
          <div className="absolute left-0 w-full lg:hidden bg-background/95 backdrop-blur-xl border-b border-white/10 shadow-2xl animate-in slide-in-from-top-5">
            <nav className="flex flex-col p-4 space-y-2">
              {navLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  // UPDATED: Changed text-sm to text-base for mobile as well
                  className="px-4 py-3 text-base font-medium text-foreground hover:text-sentinel-blue hover:bg-secondary/50 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </a>
              ))}
              
              <div className="h-px bg-white/10 my-2" />
              
              <div className="flex items-center justify-between px-4 py-2">
                <span className="text-sm font-medium text-muted-foreground">Theme</span>
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-md bg-secondary hover:bg-secondary/80"
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
              </div>

              <div className="pt-2">
                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-sentinel-blue hover:bg-sentinel-blue/90 text-white rounded-lg">
                    Get Started
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}