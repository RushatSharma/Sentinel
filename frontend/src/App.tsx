import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage"; 
import ScanResultsPage from "./pages/ScanResultsPage"; 
import DeepScanPage from "./pages/DeepScanPage";
import ProfilePage from "./pages/ProfilePage"; // 1. IMPORT PROFILE PAGE

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster /> {/* Added Toaster for notifications */}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/scan-results" element={<ScanResultsPage />} />
          <Route path="/deep-scan" element={<DeepScanPage />} />
          
          {/* 2. ADD THE PROFILE ROUTE */}
          <Route path="/profile" element={<ProfilePage />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;