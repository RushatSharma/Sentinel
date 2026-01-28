import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage"; 
import ScanResultsPage from "./pages/ScanResultsPage"; // IMPORT THIS
import DeepScanPage from "./pages/DeepScanPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Home />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/scan-results" element={<ScanResultsPage />} /> {/* NEW ROUTE */}
          <Route path="*" element={<NotFound />} />
          <Route path="/deep-scan" element={<DeepScanPage />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;