import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { account } from "@/lib/appwrite"; // Import Appwrite account
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage"; 
import ScanResultsPage from "./pages/ScanResultsPage"; 
import DeepScanPage from "./pages/DeepScanPage";
import ProfilePage from "./pages/ProfilePage";

const queryClient = new QueryClient();

// --- PROTECTED ROUTE COMPONENT ---
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
  const checkSession = async () => {
    try {
      const session = await account.get();
      setUser(session);
    } catch (error: any) {
      // 401 is expected if the user hasn't logged in yet
      setUser(null); 
      console.log("No active session found.");
    }
  };
  checkSession();
}, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse h-4 w-48 rounded bg-muted"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          
          {/* Protected Routes - Migration: Logic replaced Supabase listeners */}
          <Route 
            path="/scan-results" 
            element={
              <ProtectedRoute>
                <ScanResultsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/deep-scan" 
            element={
              <ProtectedRoute>
                <DeepScanPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;