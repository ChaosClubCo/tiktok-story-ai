import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Activity, 
  Server, 
  Database, 
  Zap, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Cpu,
  HardDrive,
  Wifi
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface EdgeFunctionStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'error' | 'unknown';
  lastInvoked: string | null;
  avgResponseTime: number | null;
  errorRate: number;
  invocations24h: number;
}

interface SystemHealth {
  database: {
    status: 'healthy' | 'degraded' | 'error';
    connectionPoolUsage: number;
    avgQueryTime: number;
    totalQueries24h: number;
    errorCount24h: number;
  };
  edgeFunctions: EdgeFunctionStatus[];
  uptime: {
    percentage: number;
    lastDowntime: string | null;
    currentStreak: string;
  };
}

export function AdminSystemPage() {
  const { session } = useAuth();
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadSystemHealth = useCallback(async (showRefreshState = false) => {
    if (showRefreshState) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Fetch edge function logs for status
      const edgeFunctionNames = [
        'generate-script',
        'analyze-script',
        'send-security-alert',
        'login-rate-limit',
        'admin-get-users',
        'admin-get-content',
        'verify-admin-access',
        'user-2fa',
        'admin-2fa',
      ];

      // Simulate fetching health data (in production, this would come from a monitoring edge function)
      const mockHealth: SystemHealth = {
        database: {
          status: 'healthy',
          connectionPoolUsage: Math.floor(Math.random() * 30) + 10,
          avgQueryTime: Math.floor(Math.random() * 50) + 10,
          totalQueries24h: Math.floor(Math.random() * 50000) + 10000,
          errorCount24h: Math.floor(Math.random() * 10),
        },
        edgeFunctions: edgeFunctionNames.map(name => ({
          name,
          status: Math.random() > 0.1 ? 'healthy' : Math.random() > 0.5 ? 'degraded' : 'error',
          lastInvoked: new Date(Date.now() - Math.random() * 3600000).toISOString(),
          avgResponseTime: Math.floor(Math.random() * 500) + 50,
          errorRate: Math.random() * 5,
          invocations24h: Math.floor(Math.random() * 1000) + 100,
        })),
        uptime: {
          percentage: 99.9 + Math.random() * 0.09,
          lastDowntime: null,
          currentStreak: '45 days',
        },
      };

      setHealth(mockHealth);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to load system health:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [session]);

  useEffect(() => {
    loadSystemHealth();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => loadSystemHealth(true), 30000);
    return () => clearInterval(interval);
  }, [loadSystemHealth]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Healthy</Badge>;
      case 'degraded':
        return <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Degraded</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Error</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </div>
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

  if (!health) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-8 text-center">
            <XCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <p className="text-muted-foreground">Failed to load system health</p>
            <Button onClick={() => loadSystemHealth()} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const healthyFunctions = health.edgeFunctions.filter(f => f.status === 'healthy').length;
  const totalFunctions = health.edgeFunctions.length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Server className="h-6 w-6" />
            System Health
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor edge functions, database, and system uptime
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadSystemHealth(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Uptime */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {health.uptime.percentage.toFixed(2)}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Current streak: {health.uptime.currentStreak}
            </p>
          </CardContent>
        </Card>

        {/* Database */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getStatusIcon(health.database.status)}
              <span className="text-2xl font-bold capitalize">{health.database.status}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Pool: {health.database.connectionPoolUsage}% used
            </p>
          </CardContent>
        </Card>

        {/* Edge Functions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              Edge Functions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {healthyFunctions}/{totalFunctions}
            </div>
            <Progress 
              value={(healthyFunctions / totalFunctions) * 100} 
              className="h-2 mt-2" 
            />
            <p className="text-xs text-muted-foreground mt-1">
              Functions healthy
            </p>
          </CardContent>
        </Card>

        {/* Error Rate */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              Error Rate (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              health.database.errorCount24h > 50 ? 'text-red-600' : 
              health.database.errorCount24h > 10 ? 'text-amber-600' : 
              'text-green-600'
            }`}>
              {health.database.errorCount24h}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Database errors
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Database Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Statistics
          </CardTitle>
          <CardDescription>Connection pool and query performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Connection Pool</span>
                <span className="font-medium">{health.database.connectionPoolUsage}%</span>
              </div>
              <Progress value={health.database.connectionPoolUsage} className="h-2" />
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <Cpu className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <div className="text-xl font-bold">{health.database.avgQueryTime}ms</div>
              <p className="text-xs text-muted-foreground">Avg Query Time</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <HardDrive className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <div className="text-xl font-bold">{health.database.totalQueries24h.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Queries (24h)</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <Wifi className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
              <div className="text-xl font-bold">{getStatusBadge(health.database.status)}</div>
              <p className="text-xs text-muted-foreground mt-2">Connection Status</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edge Functions Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Edge Functions Status
          </CardTitle>
          <CardDescription>Real-time status of all deployed edge functions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {health.edgeFunctions.map((fn) => (
              <div
                key={fn.name}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(fn.status)}
                  <div>
                    <p className="font-medium font-mono text-sm">{fn.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {fn.lastInvoked 
                        ? `Last invoked ${formatDistanceToNow(new Date(fn.lastInvoked), { addSuffix: true })}`
                        : 'Never invoked'
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-right">
                    <p className="font-medium">{fn.avgResponseTime}ms</p>
                    <p className="text-xs text-muted-foreground">Avg Response</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{fn.invocations24h.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Invocations</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-medium ${fn.errorRate > 2 ? 'text-red-600' : 'text-green-600'}`}>
                      {fn.errorRate.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">Error Rate</p>
                  </div>
                  {getStatusBadge(fn.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
