import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { useAdminRouteProtection } from '@/hooks/useAdminRouteProtection';
import { Button } from '@/components/ui/button';
import { Users, FileText, TrendingUp, Settings, Shield } from 'lucide-react';

export const AdminLayout = () => {
  const { isAdmin, loading } = useAdmin();
  const { isVerifying, isAuthorized } = useAdminRouteProtection('/');
  const navigate = useNavigate();

  // Show loading state if either check is in progress
  if (loading || isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Shield className="w-12 h-12 mx-auto text-primary animate-pulse" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }
  
  // Client-side check (first layer)
  if (!isAdmin) return <Navigate to="/" replace />;
  
  // Server-side check (second layer - defense-in-depth)
  if (!isAuthorized) return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-background-elevated shadow-elevated border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-2xl font-bold">MiniDrama Admin</h1>
            </div>
            <Button variant="outline" onClick={() => navigate('/')}>
              Back to App
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-4">
        <nav className="flex gap-2 mb-6">
          <Button variant="ghost" onClick={() => navigate('/admin/users')}>
            <Users className="w-4 h-4 mr-2" />
            Users
          </Button>
          <Button variant="ghost" onClick={() => navigate('/admin/content')}>
            <FileText className="w-4 h-4 mr-2" />
            Content
          </Button>
          <Button variant="ghost" onClick={() => navigate('/admin/security')}>
            <Shield className="w-4 h-4 mr-2" />
            Security
          </Button>
          <Button variant="ghost" onClick={() => navigate('/admin/analytics')}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          <Button variant="ghost" onClick={() => navigate('/admin/system')}>
            <Settings className="w-4 h-4 mr-2" />
            System
          </Button>
        </nav>

        <Outlet />
      </div>
    </div>
  );
};
