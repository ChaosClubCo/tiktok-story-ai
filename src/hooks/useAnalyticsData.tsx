import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { subDays } from 'date-fns';
import type { Prediction } from '@/lib/analyticsCalculations';

interface Script {
  id: string;
  title: string;
  niche: string;
  created_at: string;
}

interface UseAnalyticsDataProps {
  userId?: string;
  timeRange?: string;
  nicheFilter?: string;
}

export function useAnalyticsData({ userId, timeRange = '30d', nicheFilter = 'all' }: UseAnalyticsDataProps = {}) {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    fetchData();
  }, [userId, timeRange, nicheFilter]);

  const fetchData = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const [scriptsRes, predictionsRes] = await Promise.all([
        supabase
          .from('scripts')
          .select('id, title, niche, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('predictions_history')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
      ]);

      if (scriptsRes.error) throw scriptsRes.error;
      if (predictionsRes.error) throw predictionsRes.error;

      setScripts(scriptsRes.data || []);
      setPredictions(predictionsRes.data || []);
    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter by time range
  const getFilteredByTime = (data: any[]) => {
    const days = timeRange === "7d" ? 7 
      : timeRange === "30d" ? 30 
      : timeRange === "90d" ? 90 
      : timeRange === "1y" ? 365 
      : 999999;
    
    const cutoff = subDays(new Date(), days);
    return data.filter(item => new Date(item.created_at) >= cutoff);
  };

  // Apply filters
  const filteredPredictions = nicheFilter === "all" 
    ? getFilteredByTime(predictions)
    : getFilteredByTime(predictions).filter(p => p.niche === nicheFilter);

  const uniqueNiches = Array.from(new Set(predictions.map(p => p.niche).filter(Boolean)));

  return {
    scripts,
    predictions,
    filteredPredictions,
    uniqueNiches,
    isLoading,
    error,
    refetch: fetchData
  };
}
