import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';
import { useAdminRouteProtection } from '@/hooks/useAdminRouteProtection';
import { usePageTitle } from '@/hooks/usePageTitle';
import { AdminSidebar, SecurityStatusBanner } from '@/components/admin';
import { LoadingSpinner } from '@/components/shared';
import { Users, FileText, TrendingUp, Settings, Shield, FileCode } from 'lucide-react';
import type { AdminNavItem } from '@/components/admin/types';

// Admin navigation configuration
const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    id: 'users',
    label: 'Users',
    path: '/admin/users',
    icon: Users,
    description: 'Manage user accounts',
  },
  {
    id: 'content',
    label: 'Content',
    path: '/admin/content',
    icon: FileText,
    description: 'Moderate content',
  },
  {
    id: 'security',
    label: 'Security',
    path: '/admin/security',
    icon: Shield,
    description: 'Security dashboard',
    badge: 'Live',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    path: '/admin/analytics',
    icon: TrendingUp,
    description: 'View analytics',
  },
  {
    id: 'system',
    label: 'System',
    path: '/admin/system',
    icon: Settings,
    description: 'System settings',
    requiresSuperAdmin: true,
  },
  {
    id: 'api-docs',
    label: 'API Docs',
    path: '/admin/api-docs',
    icon: FileCode,
    description: 'API documentation',
  },
];

/**
 * AdminLayout - Protected admin panel layout with sidebar navigation
 * 
 * Security Features:
 * - Client-side admin role check
 * - Server-side admin verification (defense-in-depth)
 * - Active session monitoring
 */
export function AdminLayout() {
  const { isAdmin, loading } = useAdmin();
  const { isVerifying, isAuthorized } = useAdminRouteProtection('/');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  usePageTitle('Admin Dashboard');

  // Loading state during verification
  if (loading || isVerifying) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-base">
        <div className="text-center space-y-4">
          <Shield className="w-12 h-12 mx-auto text-primary animate-pulse" aria-hidden="true" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Client-side authorization check (first layer)
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Server-side authorization check (second layer - defense-in-depth)
  if (!isAuthorized) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-background-base">
      {/* Sidebar */}
      <AdminSidebar
        items={ADMIN_NAV_ITEMS}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Security Status Banner */}
        <div className="p-4 border-b border-border bg-background">
          <SecurityStatusBanner />
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
