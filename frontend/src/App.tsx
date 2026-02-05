import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext"; // Import from new file

import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage"; 
import ScanResultsPage from "./pages/ScanResultsPage"; 
import DeepScanPage from "./pages/DeepScanPage";
import ProfilePage from "./pages/ProfilePage";

const queryClient = new QueryClient();

// Protected Route checks the context we created
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null; // Or a loading spinner

  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    {/* 1. Wrap everything in AuthProvider */}
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            
            <Route path="/scan-results" element={<ProtectedRoute><ScanResultsPage /></ProtectedRoute>} />
            <Route path="/deep-scan" element={<ProtectedRoute><DeepScanPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;