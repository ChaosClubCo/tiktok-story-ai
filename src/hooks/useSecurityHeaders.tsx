import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useSecurityHeaders = () => {
  useEffect(() => {
    const applySecurityHeaders = async () => {
      try {
        // Call the security headers function to apply security headers
        await supabase.functions.invoke('security-headers');
      } catch (error) {
        console.warn('Failed to apply security headers:', error);
      }
    };

    applySecurityHeaders();
  }, []);

  return null;
};