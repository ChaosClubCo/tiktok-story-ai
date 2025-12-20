import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Globe, 
  CheckCircle2, 
  XCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Shield
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface LoginActivity {
  id: string;
  ip_address: string | null;
  user_agent: string | null;
  device_type: string;
  browser: string;
  location: string | null;
  success: boolean;
  failure_reason: string | null;
  created_at: string;
}

interface ActivityResponse {
  activities: LoginActivity[];
  total: number;
  limit: number;
  offset: number;
}

export function LoginActivityHistory() {
  const { session } = useAuth();
  const [activities, setActivities] = useState<LoginActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const limit = 10;

  const getDeviceIcon = (deviceType: string) => {
    const device = deviceType?.toLowerCase() || '';
    if (device.includes('iphone') || device.includes('android phone')) {
      return <Smartphone className="h-4 w-4" />;
    }
    if (device.includes('ipad') || device.includes('tablet')) {
      return <Tablet className="h-4 w-4" />;
    }
    return <Monitor className="h-4 w-4" />;
  };

  const loadActivity = async (showRefreshState = false) => {
    if (!session) return;
    
    if (showRefreshState) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const { data, error } = await supabase.functions.invoke<ActivityResponse>('get-login-activity', {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { limit, offset: page * limit }
      });
      
      if (error) throw error;
      
      setActivities(data?.activities || []);
      setTotal(data?.total || 0);
    } catch (error) {
      console.error('Failed to load login activity:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadActivity();
  }, [session, page]);

  const totalPages = Math.ceil(total / limit);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Login Activity
          </CardTitle>
          <CardDescription>Recent login attempts to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Login Activity
            </CardTitle>
            <CardDescription>Recent login attempts to your account</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadActivity(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No login activity recorded yet</p>
          </div>
        ) : (
          <>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border ${
                      activity.success 
                        ? 'bg-card' 
                        : 'bg-destructive/5 border-destructive/20'
                    }`}
                  >
                    <div className={`p-2 rounded-full ${
                      activity.success 
                        ? 'bg-primary/10 text-primary' 
                        : 'bg-destructive/10 text-destructive'
                    }`}>
                      {getDeviceIcon(activity.device_type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">
                          {activity.device_type || 'Unknown Device'}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {activity.browser || 'Unknown Browser'}
                        </Badge>
                        {activity.success ? (
                          <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Success
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-destructive border-destructive/20">
                            <XCircle className="h-3 w-3 mr-1" />
                            Failed
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-muted-foreground mt-1 space-y-0.5">
                        {activity.ip_address && (
                          <p className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            IP: {activity.ip_address}
                          </p>
                        )}
                        <p>
                          {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                        </p>
                        {activity.failure_reason && (
                          <p className="text-destructive text-xs">
                            Reason: {activity.failure_reason}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Showing {page * limit + 1}-{Math.min((page + 1) * limit, total)} of {total}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
