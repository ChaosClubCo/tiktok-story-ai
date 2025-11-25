import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AdminProvider } from "@/hooks/useAdmin";
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
import SeriesBuilder from "./pages/SeriesBuilder";
import NotFound from "./pages/NotFound";
import Install from "./pages/Install";
import { AdminLayout } from "./pages/admin/AdminLayout";
import { AdminUsersPage } from "./pages/admin/UsersPage";
import { AdminContentPage } from "./pages/admin/ContentPage";
import { SecurityPage } from "./pages/admin/SecurityPage";

const queryClient = new QueryClient();

const App = () => {
  useSecurityHeaders();
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AdminProvider>
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
                <Route path="/series/builder" element={<SeriesBuilder />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/my-scripts" element={<MyScripts />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route path="users" element={<AdminUsersPage />} />
                  <Route path="content" element={<AdminContentPage />} />
                  <Route path="security" element={<SecurityPage />} />
                  <Route path="analytics" element={<div className="p-8 text-center">Analytics Coming Soon</div>} />
                  <Route path="system" element={<div className="p-8 text-center">System Health Coming Soon</div>} />
                </Route>
                <Route path="/install" element={<Install />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AdminProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
