import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";

// Pages
import Home from "./pages/Home";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import ProfilePage from "./pages/ProfilePage";
import DeepScanPage from "./pages/DeepScanPage";
import ScanResultsPage from "./pages/ScanResultsPage";
import AboutPage from "./pages/AboutPage"; 
import NormalScanPage from "./pages/NormalScanPage"; // IMPORT ADDED
import ReconPage from './pages/ReconPage';
import ApiFuzzerPage from './pages/ApiFuzzerPage';
import InfrastructureScannerPage from "./pages/InfrastructureScannerPage";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AuthProvider>
        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/about" element={<AboutPage />} />
              
              {/* Protected/App Routes */}
              <Route path="/dashboard" element={<Home />} />
              <Route path="/scan" element={<NormalScanPage />} /> {/* NEW ROUTE ADDED */}
              <Route path="/deep-scan" element={<DeepScanPage />} />
              
              <Route path="/scan-results" element={<ScanResultsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/recon" element={<ReconPage />} />
              <Route path="/api-fuzzer" element={<ApiFuzzerPage />} />
              <Route path="/infrastructure" element={<InfrastructureScannerPage />} />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>

          <Toaster />
          <Sonner />
          
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;