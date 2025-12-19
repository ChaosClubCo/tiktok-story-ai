import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Activity, 
  Zap, 
  Clock, 
  LayoutDashboard, 
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { getWebVitals, getPerformanceScore } from '@/lib/webVitals';
import { getErrorStats } from '@/lib/errorTracking';

interface MetricData {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  unit: string;
  description: string;
  threshold: { good: number; poor: number };
}

const METRIC_CONFIG: Record<string, { unit: string; description: string; threshold: { good: number; poor: number } }> = {
  LCP: { 
    unit: 'ms', 
    description: 'Largest Contentful Paint - Loading performance',
    threshold: { good: 2500, poor: 4000 }
  },
  INP: { 
    unit: 'ms', 
    description: 'Interaction to Next Paint - Responsiveness',
    threshold: { good: 200, poor: 500 }
  },
  CLS: { 
    unit: '', 
    description: 'Cumulative Layout Shift - Visual stability',
    threshold: { good: 0.1, poor: 0.25 }
  },
  FCP: { 
    unit: 'ms', 
    description: 'First Contentful Paint - Initial render',
    threshold: { good: 1800, poor: 3000 }
  },
  TTFB: { 
    unit: 'ms', 
    description: 'Time to First Byte - Server response',
    threshold: { good: 800, poor: 1800 }
  },
};

const getRatingColor = (rating: string) => {
  switch (rating) {
    case 'good': return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'needs-improvement': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    case 'poor': return 'bg-red-500/10 text-red-500 border-red-500/20';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getRatingIcon = (rating: string) => {
  switch (rating) {
    case 'good': return <TrendingUp className="w-4 h-4" />;
    case 'poor': return <TrendingDown className="w-4 h-4" />;
    default: return <Minus className="w-4 h-4" />;
  }
};

const getScoreColor = (score: number) => {
  if (score >= 90) return 'text-green-500';
  if (score >= 50) return 'text-yellow-500';
  return 'text-red-500';
};

const getScoreGradient = (score: number) => {
  if (score >= 90) return 'from-green-500 to-emerald-500';
  if (score >= 50) return 'from-yellow-500 to-orange-500';
  return 'from-red-500 to-rose-500';
};

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [score, setScore] = useState<number>(100);
  const [errorStats, setErrorStats] = useState({ totalErrors: 0, errorsByType: {} as Record<string, number> });
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshMetrics = useCallback(() => {
    setIsRefreshing(true);
    
    const vitals = getWebVitals();
    const metricsArray: MetricData[] = [];
    
    vitals.forEach((vital, name) => {
      const config = METRIC_CONFIG[name];
      if (config) {
        metricsArray.push({
          name,
          value: name === 'CLS' ? vital.value : Math.round(vital.value),
          rating: vital.rating,
          unit: config.unit,
          description: config.description,
          threshold: config.threshold,
        });
      }
    });
    
    setMetrics(metricsArray);
    setScore(getPerformanceScore());
    setErrorStats(getErrorStats());
    setLastUpdated(new Date());
    
    setTimeout(() => setIsRefreshing(false), 500);
  }, []);

  useEffect(() => {
    refreshMetrics();
    const interval = setInterval(refreshMetrics, 5000);
    return () => clearInterval(interval);
  }, [refreshMetrics]);

  const formatValue = (value: number, name: string) => {
    if (name === 'CLS') {
      return value.toFixed(3);
    }
    return value.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Performance Dashboard</h2>
          <p className="text-muted-foreground text-sm">
            Real-time Web Vitals and session metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground">
            Updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshMetrics}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Score Card */}
      <Card className="border-border/50 bg-gradient-to-br from-background to-muted/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className={`relative w-24 h-24 rounded-full bg-gradient-to-br ${getScoreGradient(score)} p-1`}>
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                  <span className={`text-3xl font-bold ${getScoreColor(score)}`}>
                    {score}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Performance Score</h3>
                <p className="text-muted-foreground text-sm">
                  Based on Core Web Vitals (LCP, INP, CLS)
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="outline" className={score >= 90 ? 'border-green-500/20 text-green-500' : 'border-muted'}>
                    {score >= 90 ? 'Excellent' : score >= 50 ? 'Needs Work' : 'Poor'}
                  </Badge>
                  {metrics.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {metrics.length} metrics tracked
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            
            {/* Error Stats */}
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <Activity className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Session Errors</span>
              </div>
              <p className={`text-2xl font-bold ${errorStats.totalErrors > 0 ? 'text-destructive' : 'text-green-500'}`}>
                {errorStats.totalErrors}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.length === 0 ? (
          <Card className="col-span-full border-dashed">
            <CardContent className="py-12 text-center">
              <LayoutDashboard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Collecting Metrics...
              </h3>
              <p className="text-muted-foreground text-sm">
                Interact with the page to see performance data
              </p>
            </CardContent>
          </Card>
        ) : (
          metrics.map((metric) => (
            <Card key={metric.name} className="border-border/50 hover:border-border transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    {metric.name === 'LCP' && <Clock className="w-4 h-4 text-primary" />}
                    {metric.name === 'INP' && <Zap className="w-4 h-4 text-primary" />}
                    {metric.name === 'CLS' && <LayoutDashboard className="w-4 h-4 text-primary" />}
                    {metric.name === 'FCP' && <Activity className="w-4 h-4 text-primary" />}
                    {metric.name === 'TTFB' && <TrendingUp className="w-4 h-4 text-primary" />}
                    {metric.name}
                  </CardTitle>
                  <Badge 
                    variant="outline" 
                    className={`${getRatingColor(metric.rating)} gap-1`}
                  >
                    {getRatingIcon(metric.rating)}
                    {metric.rating.replace('-', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-foreground">
                      {formatValue(metric.value, metric.name)}
                    </span>
                    <span className="text-muted-foreground text-sm">{metric.unit}</span>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    {metric.description}
                  </p>
                  
                  {/* Threshold visualization */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Good: &lt;{metric.threshold.good}{metric.unit}</span>
                      <span>Poor: &gt;{metric.threshold.poor}{metric.unit}</span>
                    </div>
                    <Progress 
                      value={Math.min(100, (metric.value / metric.threshold.poor) * 100)} 
                      className="h-1.5"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-muted-foreground">Good</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="text-muted-foreground">Needs Improvement</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span className="text-muted-foreground">Poor</span>
        </div>
      </div>
    </div>
  );
}

export default PerformanceDashboard;
