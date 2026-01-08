import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TwoFAStatus {
  enabled: boolean;
  verifiedAt: string | null;
  lastUsedAt: string | null;
  backupCodesRemaining: number;
}

interface SetupResponse {
  success: boolean;
  secret: string;
  uri: string;
  backupCodes: string[];
  message: string;
}

export function useAdmin2FA() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<TwoFAStatus | null>(null);
  const [setupData, setSetupData] = useState<SetupResponse | null>(null);
  const { toast } = useToast();

  const invoke2FA = useCallback(async (action: string, params?: Record<string, any>) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase.functions.invoke('admin-2fa', {
      body: { action, ...params },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) throw error;
    return data;
  }, []);

  const checkStatus = useCallback(async () => {
    try {
      setLoading(true);
      const data = await invoke2FA('status');
      setStatus(data);
      return data;
    } catch (error) {
      console.error('Failed to check 2FA status:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [invoke2FA]);

  const startSetup = useCallback(async () => {
    try {
      setLoading(true);
      const data = await invoke2FA('setup');
      setSetupData(data);
      toast({
        title: '2FA Setup Started',
        description: 'Scan the QR code with your authenticator app',
      });
      return data;
    } catch (error: any) {
      toast({
        title: 'Setup Failed',
        description: error.message || 'Failed to start 2FA setup',
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [invoke2FA, toast]);

  const verifySetup = useCallback(async (code: string) => {
    try {
      setLoading(true);
      const data = await invoke2FA('verify-setup', { code });
      if (data.success) {
        setSetupData(null);
        await checkStatus();
        toast({
          title: '2FA Enabled',
          description: 'Two-factor authentication is now active',
        });
      }
      return data;
    } catch (error: any) {
      toast({
        title: 'Verification Failed',
        description: error.message || 'Invalid verification code',
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [invoke2FA, checkStatus, toast]);

  const verify = useCallback(async (code: string) => {
    try {
      setLoading(true);
      const data = await invoke2FA('verify', { code });
      return data;
    } catch (error: any) {
      return { success: false, verified: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [invoke2FA]);

  const disable = useCallback(async (code: string) => {
    try {
      setLoading(true);
      const data = await invoke2FA('disable', { code });
      if (data.success) {
        setStatus({ enabled: false, verifiedAt: null, lastUsedAt: null, backupCodesRemaining: 0 });
        toast({
          title: '2FA Disabled',
          description: 'Two-factor authentication has been disabled',
        });
      }
      return data;
    } catch (error: any) {
      toast({
        title: 'Failed to Disable',
        description: error.message || 'Invalid verification code',
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [invoke2FA, toast]);

  const regenerateBackupCodes = useCallback(async (code: string) => {
    try {
      setLoading(true);
      const data = await invoke2FA('regenerate-backup', { code });
      if (data.success) {
        await checkStatus();
        toast({
          title: 'Backup Codes Regenerated',
          description: 'Save your new backup codes securely',
        });
      }
      return data;
    } catch (error: any) {
      toast({
        title: 'Failed to Regenerate',
        description: error.message || 'Invalid verification code',
        variant: 'destructive',
      });
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [invoke2FA, checkStatus, toast]);

  return {
    loading,
    status,
    setupData,
    checkStatus,
    startSetup,
    verifySetup,
    verify,
    disable,
    regenerateBackupCodes,
  };
}
