import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { useSecurityHeaders } from "@/hooks/useSecurityHeaders";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Templates from "./pages/Templates";
import MyScripts from "./pages/MyScripts";
import Collaborate from "./pages/Collaborate";
import Predictions from "./pages/Predictions";
import Series from "./pages/Series";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  useSecurityHeaders();
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/templates" element={<Templates />} />
              <Route path="/collaborate" element={<Collaborate />} />
              <Route path="/predictions" element={<Predictions />} />
              <Route path="/series" element={<Series />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/my-scripts" element={<MyScripts />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
