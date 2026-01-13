import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface AdminContextType {
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isContentModerator: boolean;
  loading: boolean;
  logAction: (action: string, resource_type?: string, resource_id?: string, reason?: string, metadata?: any) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isContentModerator, setIsContentModerator] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setIsSuperAdmin(false);
      setIsContentModerator(false);
      setLoading(false);
      return;
    }

    const checkAdminRole = async () => {
      try {
        const { data: roles } = await supabase
          .from('admin_roles' as any)
          .select('role')
          .eq('user_id', user.id);

        if (roles && roles.length > 0) {
          const roleList = roles.map((r: any) => r.role);
          setIsAdmin(true);
          setIsSuperAdmin(roleList.includes('super_admin'));
          setIsContentModerator(roleList.includes('content_moderator'));
        }
      } catch (error) {
        console.error('Failed to check admin role:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAdminRole();
  }, [user]);

  const logAction = async (
    action: string,
    resource_type?: string,
    resource_id?: string,
    reason?: string,
    metadata?: any
  ) => {
    try {
      await supabase.functions.invoke('log-admin-action', {
        body: { action, resource_type, resource_id, reason, metadata }
      });
    } catch (error) {
      console.error('Failed to log admin action:', error);
    }
  };

  return (
    <AdminContext.Provider value={{ isAdmin, isSuperAdmin, isContentModerator, loading, logAction }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within AdminProvider');
  return context;
};
