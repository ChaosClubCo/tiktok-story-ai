import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Zap, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface TrendingTopic {
  id: string;
  topic: string;
  viral_score: number;
  engagement_count: string;
  category: string;
  platform: string;
}

interface TrendRadarProps {
  onGenerateFromTrend: (trendId: string, topic: string) => void;
}

export const TrendRadar = ({ onGenerateFromTrend }: TrendRadarProps) => {
  const [trends, setTrends] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const { data, error } = await supabase
          .from('trending_topics' as any)
          .select('*')
          .eq('is_active', true)
          .order('viral_score', { ascending: false })
          .limit(8);

        if (error) throw error;
        setTrends((data || []) as unknown as TrendingTopic[]);
      } catch (error) {
        console.error('Failed to fetch trends:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
    
    // Refresh every 30 minutes
    const interval = setInterval(fetchTrends, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const getViralColor = (score: number) => {
    if (score >= 80) return 'text-error';
    if (score >= 60) return 'text-warning';
    return 'text-info';
  };

  if (loading) {
    return (
      <Card floating className="sticky top-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Trend Radar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card floating className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 animate-pulse text-primary" />
          Trend Radar
          <Badge variant="default" className="ml-auto">
            LIVE
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {trends.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No trending topics available</p>
            <p className="text-xs mt-1">Check back soon for updates</p>
          </div>
        ) : (
          trends.map((trend) => (
            <div
              key={trend.id}
              className="p-3 rounded-lg bg-background-elevated border border-border hover:border-primary/50 transition-all group"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <div className="font-semibold text-sm mb-1">
                    {trend.topic}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {trend.category}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {trend.platform}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex flex-col items-end">
                  <div className={`flex items-center gap-1 ${getViralColor(trend.viral_score)}`}>
                    <Zap className="w-3 h-3" />
                    <span className="text-xs font-bold">{trend.viral_score}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {trend.engagement_count}
                  </span>
                </div>
              </div>
              
              <Button
                size="sm"
                variant="outline"
                className="w-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onGenerateFromTrend(trend.id, trend.topic)}
              >
                <Play className="w-3 h-3 mr-1" />
                Generate Script
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};
