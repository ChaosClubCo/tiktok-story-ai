import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AdminProvider } from "@/hooks/useAdmin";
import { useSecurityHeaders } from "@/hooks/useSecurityHeaders";
import { LoadingSpinner } from "@/components/shared";

// Eagerly load critical pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy load non-critical pages for better initial bundle size
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Templates = lazy(() => import("./pages/Templates"));
const MyScripts = lazy(() => import("./pages/MyScripts"));
const Collaborate = lazy(() => import("./pages/Collaborate"));
const Predictions = lazy(() => import("./pages/Predictions"));
const Series = lazy(() => import("./pages/Series"));
const SeriesBuilder = lazy(() => import("./pages/SeriesBuilder"));
const VideoGenerator = lazy(() => import("./pages/VideoGenerator"));
const VideoEditor = lazy(() => import("./pages/VideoEditor"));
const ABTests = lazy(() => import("./pages/ABTests"));
const Install = lazy(() => import("./pages/Install"));

// Lazy load admin pages
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout").then(m => ({ default: m.AdminLayout })));
const AdminUsersPage = lazy(() => import("./pages/admin/UsersPage").then(m => ({ default: m.AdminUsersPage })));
const AdminContentPage = lazy(() => import("./pages/admin/ContentPage").then(m => ({ default: m.AdminContentPage })));
const SecurityPage = lazy(() => import("./pages/admin/SecurityPage").then(m => ({ default: m.SecurityPage })));

const queryClient = new QueryClient();

// Page loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <LoadingSpinner size="lg" />
  </div>
);

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
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Critical routes - eagerly loaded */}
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  
                  {/* Main app routes - lazy loaded */}
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/templates" element={<Templates />} />
                  <Route path="/collaborate" element={<Collaborate />} />
                  <Route path="/predictions" element={<Predictions />} />
                  <Route path="/series" element={<Series />} />
                  <Route path="/series/builder" element={<SeriesBuilder />} />
                  <Route path="/video-generator" element={<VideoGenerator />} />
                  <Route path="/video-editor/:projectId" element={<VideoEditor />} />
                  <Route path="/ab-tests" element={<ABTests />} />
                  <Route path="/my-scripts" element={<MyScripts />} />
                  <Route path="/install" element={<Install />} />
                  
                  {/* Admin routes - lazy loaded */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route path="users" element={<AdminUsersPage />} />
                    <Route path="content" element={<AdminContentPage />} />
                    <Route path="security" element={<SecurityPage />} />
                    <Route path="analytics" element={<div className="p-8 text-center">Analytics Coming Soon</div>} />
                    <Route path="system" element={<div className="p-8 text-center">System Health Coming Soon</div>} />
                  </Route>
                  
                  {/* Catch-all - eagerly loaded */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </AdminProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
