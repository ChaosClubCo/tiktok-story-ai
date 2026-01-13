import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { 
  Users, 
  FileText, 
  Zap, 
  TrendingUp,
  RefreshCw,
  Calendar,
  Activity,
  Eye,
  Play,
  Clock
} from 'lucide-react';
import { formatDistanceToNow, subDays, format } from 'date-fns';

interface AnalyticsData {
  users: {
    total: number;
    activeToday: number;
    newThisWeek: number;
    growth: number;
  };
  content: {
    totalScripts: number;
    scriptsThisWeek: number;
    totalSeries: number;
    avgScriptsPerUser: number;
  };
  apiCalls: {
    total24h: number;
    byFunction: { name: string; count: number }[];
    hourlyData: { hour: string; count: number }[];
  };
  performance: {
    avgResponseTime: number;
    p95ResponseTime: number;
    successRate: number;
    errorsByType: { type: string; count: number }[];
  };
  engagement: {
    dailyActiveUsers: { date: string; count: number }[];
    featureUsage: { feature: string; usage: number }[];
    retentionRate: number;
  };
}

const CHART_COLORS = ['hsl(var(--primary))', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export function AdminAnalyticsPage() {
  const { session } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadAnalytics = useCallback(async (showRefreshState = false) => {
    if (showRefreshState) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // In production, this would fetch from an analytics edge function
      // For now, we'll generate realistic mock data
      const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90;
      
      const dailyData = Array.from({ length: days }, (_, i) => ({
        date: format(subDays(new Date(), days - 1 - i), 'MMM dd'),
        count: Math.floor(Math.random() * 500) + 100,
      }));

      const hourlyData = Array.from({ length: 24 }, (_, i) => ({
        hour: `${i.toString().padStart(2, '0')}:00`,
        count: Math.floor(Math.random() * 200) + 50,
      }));

      const mockAnalytics: AnalyticsData = {
        users: {
          total: Math.floor(Math.random() * 5000) + 1000,
          activeToday: Math.floor(Math.random() * 200) + 50,
          newThisWeek: Math.floor(Math.random() * 100) + 20,
          growth: Math.random() * 20 + 5,
        },
        content: {
          totalScripts: Math.floor(Math.random() * 20000) + 5000,
          scriptsThisWeek: Math.floor(Math.random() * 500) + 100,
          totalSeries: Math.floor(Math.random() * 1000) + 200,
          avgScriptsPerUser: Math.random() * 10 + 2,
        },
        apiCalls: {
          total24h: Math.floor(Math.random() * 50000) + 10000,
          byFunction: [
            { name: 'generate-script', count: Math.floor(Math.random() * 5000) + 1000 },
            { name: 'analyze-script', count: Math.floor(Math.random() * 3000) + 500 },
            { name: 'save-script', count: Math.floor(Math.random() * 2000) + 300 },
            { name: 'fetch-trends', count: Math.floor(Math.random() * 1500) + 200 },
            { name: 'tts-preview', count: Math.floor(Math.random() * 1000) + 100 },
          ],
          hourlyData,
        },
        performance: {
          avgResponseTime: Math.floor(Math.random() * 200) + 100,
          p95ResponseTime: Math.floor(Math.random() * 500) + 300,
          successRate: 99 + Math.random() * 0.9,
          errorsByType: [
            { type: 'Rate Limited', count: Math.floor(Math.random() * 50) + 10 },
            { type: 'Auth Error', count: Math.floor(Math.random() * 30) + 5 },
            { type: 'Timeout', count: Math.floor(Math.random() * 20) + 2 },
            { type: 'Server Error', count: Math.floor(Math.random() * 10) + 1 },
          ],
        },
        engagement: {
          dailyActiveUsers: dailyData,
          featureUsage: [
            { feature: 'Script Generation', usage: Math.floor(Math.random() * 1000) + 500 },
            { feature: 'Viral Predictor', usage: Math.floor(Math.random() * 800) + 300 },
            { feature: 'Series Builder', usage: Math.floor(Math.random() * 400) + 100 },
            { feature: 'A/B Testing', usage: Math.floor(Math.random() * 200) + 50 },
            { feature: 'Video Generator', usage: Math.floor(Math.random() * 100) + 20 },
          ],
          retentionRate: 60 + Math.random() * 25,
        },
      };

      setAnalytics(mockAnalytics);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session, dateRange]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-8 text-center">
            <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Failed to load analytics</p>
            <Button onClick={() => loadAnalytics()} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <TrendingUp className="h-6 w-6" />
            Platform Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Usage statistics and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Tabs value={dateRange} onValueChange={(v) => setDateRange(v as typeof dateRange)}>
            <TabsList>
              <TabsTrigger value="7d">7 Days</TabsTrigger>
              <TabsTrigger value="30d">30 Days</TabsTrigger>
              <TabsTrigger value="90d">90 Days</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadAnalytics(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.users.total.toLocaleString()}</div>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +{analytics.users.growth.toFixed(1)}% this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              Active Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.users.activeToday.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.users.newThisWeek} new this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              Total Scripts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.content.totalScripts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +{analytics.content.scriptsThisWeek} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              API Calls (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.apiCalls.total24h.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.performance.successRate.toFixed(1)}% success rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Daily Active Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Daily Active Users
            </CardTitle>
            <CardDescription>User activity over the selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.engagement.dailyActiveUsers}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="count" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary) / 0.2)"
                    name="Active Users"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* API Calls by Hour */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              API Calls by Hour (Today)
            </CardTitle>
            <CardDescription>Request volume distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.apiCalls.hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="hour" 
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    interval={2}
                  />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                    name="Requests"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* API Calls by Function */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              API Calls by Function
            </CardTitle>
            <CardDescription>Most used edge functions (24h)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.apiCalls.byFunction} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" tick={{ fontSize: 12 }} tickLine={false} />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    width={120}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    fill="hsl(var(--primary))" 
                    radius={[0, 4, 4, 0]}
                    name="Calls"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Feature Usage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Feature Usage
            </CardTitle>
            <CardDescription>Most popular platform features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.engagement.featureUsage}
                    dataKey="usage"
                    nameKey="feature"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ feature, percent }) => 
                      `${feature.split(' ')[0]} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {analytics.engagement.featureUsage.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
          <CardDescription>API response times and error rates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold">{analytics.performance.avgResponseTime}ms</div>
              <p className="text-sm text-muted-foreground mt-1">Avg Response Time</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold">{analytics.performance.p95ResponseTime}ms</div>
              <p className="text-sm text-muted-foreground mt-1">P95 Response Time</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {analytics.performance.successRate.toFixed(2)}%
              </div>
              <p className="text-sm text-muted-foreground mt-1">Success Rate</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold">
                {analytics.engagement.retentionRate.toFixed(1)}%
              </div>
              <p className="text-sm text-muted-foreground mt-1">User Retention</p>
            </div>
          </div>

          {/* Error Breakdown */}
          <div className="mt-6">
            <h4 className="text-sm font-medium mb-4">Error Breakdown (24h)</h4>
            <div className="grid gap-3 md:grid-cols-4">
              {analytics.performance.errorsByType.map((error) => (
                <div key={error.type} className="flex items-center justify-between p-3 rounded-lg border">
                  <span className="text-sm">{error.type}</span>
                  <Badge variant="secondary">{error.count}</Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Last Updated */}
      <p className="text-center text-sm text-muted-foreground">
        Last updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
      </p>
    </div>
  );
}
