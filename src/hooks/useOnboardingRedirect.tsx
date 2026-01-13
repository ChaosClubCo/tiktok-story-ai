import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

/**
 * Hook to check if user has completed onboarding
 * Redirects to /onboarding if not completed
 * 
 * @param options.skip - Skip the redirect (useful for onboarding page itself)
 */
export function useOnboardingRedirect(options?: { skip?: boolean }) {
  const { user, profile, profileLoading, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Skip if disabled or still loading
    if (options?.skip || loading || profileLoading) return;
    
    // Skip if not logged in
    if (!user) return;
    
    // Skip if already on onboarding or auth pages
    const skipPaths = ['/onboarding', '/auth', '/'];
    if (skipPaths.includes(location.pathname)) return;
    
    // If profile loaded and onboarding not completed, redirect
    if (profile && !profile.onboarding_completed) {
      navigate('/onboarding', { replace: true });
    }
  }, [user, profile, profileLoading, loading, navigate, location.pathname, options?.skip]);

  return {
    isOnboardingComplete: profile?.onboarding_completed ?? false,
    isLoading: loading || profileLoading,
  };
}