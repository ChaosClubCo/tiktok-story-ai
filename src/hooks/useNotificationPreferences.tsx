import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_marketing: boolean;
  email_product_updates: boolean;
  email_weekly_digest: boolean;
  email_script_analysis: boolean;
  email_series_reminders: boolean;
  email_collaboration: boolean;
  created_at: string;
  updated_at: string;
}

export const useNotificationPreferences = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchPreferences = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No preferences found, create default ones
          const { data: newData, error: insertError } = await supabase
            .from('notification_preferences')
            .insert({ user_id: user.id })
            .select()
            .single();

          if (insertError) throw insertError;
          setPreferences(newData);
        } else {
          throw error;
        }
      } else {
        setPreferences(data);
      }
    } catch (error: any) {
      console.error('Error fetching notification preferences:', error);
      toast.error('Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const updatePreference = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!user?.id || !preferences) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('notification_preferences')
        .update({ [key]: value })
        .eq('user_id', user.id);

      if (error) throw error;

      setPreferences(prev => prev ? { ...prev, [key]: value } : null);
      toast.success('Preference updated');
    } catch (error: any) {
      console.error('Error updating preference:', error);
      toast.error('Failed to update preference');
    } finally {
      setSaving(false);
    }
  };

  return {
    preferences,
    loading,
    saving,
    updatePreference,
    refetch: fetchPreferences,
  };
};
