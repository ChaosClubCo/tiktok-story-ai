import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminVerificationResult {
  authorized: boolean;
  userId?: string;
  email?: string;
  error?: string;
}

/**
 * Server-side admin route protection hook
 * 
 * This hook provides defense-in-depth by calling the verify-admin-access
 * edge function to validate admin status server-side. This prevents
 * unauthorized users from accessing admin UI even if they bypass
 * client-side route guards.
 * 
 * @param redirectPath - Path to redirect to if user is not authorized (default: '/')
 */
export function useAdminRouteProtection(redirectPath: string = '/') {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;

    const verifyAdminAccess = async () => {
      try {
        // Get current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          if (isMounted) {
            toast({
              title: "Authentication required",
              description: "Please sign in to access this page",
              variant: "destructive",
            });
            navigate(redirectPath);
          }
          return;
        }

        // Call server-side verification
        const { data, error } = await supabase.functions.invoke<AdminVerificationResult>(
          'verify-admin-access',
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (error) {
          console.error('Admin verification error:', error);
          throw error;
        }

        if (data && data.authorized) {
          if (isMounted) {
            setIsAuthorized(true);
          }
        } else {
          if (isMounted) {
            toast({
              title: "Access denied",
              description: "Admin privileges required to access this page",
              variant: "destructive",
            });
            navigate(redirectPath);
          }
        }
      } catch (error) {
        console.error('Failed to verify admin access:', error);
        if (isMounted) {
          toast({
            title: "Verification failed",
            description: "Unable to verify admin access. Please try again.",
            variant: "destructive",
          });
          navigate(redirectPath);
        }
      } finally {
        if (isMounted) {
          setIsVerifying(false);
        }
      }
    };

    verifyAdminAccess();

    return () => {
      isMounted = false;
    };
  }, [navigate, redirectPath, toast]);

  return { isVerifying, isAuthorized };
}
