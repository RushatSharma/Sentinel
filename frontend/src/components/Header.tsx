import { Shield, Menu } from "lucide-react";
import { Button } from "./ui/button";

export const Header = () => {
  return (
    <header className="fixed w-full top-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold tracking-tight">Sentinel<span className="text-primary">Audit</span></span>
          </div>
          
          <nav className="hidden md:flex gap-8">
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Dashboard</a>
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Scans</a>
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Compliance</a>
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">Settings</a>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-500 text-xs font-bold">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              SYSTEM ONLINE
            </div>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};