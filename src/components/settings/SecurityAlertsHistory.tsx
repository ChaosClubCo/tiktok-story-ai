import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bell, 
  Shield, 
  Lock,
  Key,
  AlertTriangle,
  ShieldOff,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Mail,
  MailX
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SecurityAlertMetadata {
  userAgent?: string;
  location?: string;
  failedAttempts?: number;
  blockedUntil?: string;
}

interface SecurityAlert {
  id: string;
  alert_type: string;
  ip_address: unknown;
  metadata: SecurityAlertMetadata | null;
  email_sent: boolean | null;
  created_at: string | null;
}

const ALERT_TYPE_CONFIG: Record<string, { 
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  color: string;
  bgColor: string;
}> = {
  login_blocked: {
    icon: Lock,
    label: 'Login Blocked',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
  },
  '2fa_enabled': {
    icon: ShieldCheck,
    label: '2FA Enabled',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
  '2fa_disabled': {
    icon: ShieldOff,
    label: '2FA Disabled',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
  },
  suspicious_activity: {
    icon: AlertTriangle,
    label: 'Suspicious Activity',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
  },
  password_changed: {
    icon: Key,
    label: 'Password Changed',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
};

export function SecurityAlertsHistory() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const limit = 10;

  const loadAlerts = async (showRefreshState = false) => {
    if (!user) return;
    
    if (showRefreshState) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      // Query security alerts for the current user
      const { data, error, count } = await supabase
        .from('security_alerts')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);
      
      if (error) throw error;
      
      // Map data with proper typing
      const mappedAlerts: SecurityAlert[] = (data || []).map(item => ({
        id: item.id,
        alert_type: item.alert_type,
        ip_address: item.ip_address,
        metadata: item.metadata as SecurityAlertMetadata | null,
        email_sent: item.email_sent,
        created_at: item.created_at,
      }));
      
      setAlerts(mappedAlerts);
      setTotal(count || 0);
    } catch (error) {
      console.error('Failed to load security alerts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [user, page]);

  const totalPages = Math.ceil(total / limit);

  const getAlertConfig = (alertType: string) => {
    return ALERT_TYPE_CONFIG[alertType] || {
      icon: Bell,
      label: alertType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      color: 'text-muted-foreground',
      bgColor: 'bg-muted',
    };
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Alerts
          </CardTitle>
          <CardDescription>View your account security events</CardDescription>
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
              Security Alerts
            </CardTitle>
            <CardDescription>
              View your account security events and notifications
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadAlerts(true)}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No security alerts</p>
            <p className="text-sm mt-1">
              You'll see alerts here when security-related events occur
            </p>
          </div>
        ) : (
          <>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {alerts.map((alert) => {
                  const config = getAlertConfig(alert.alert_type);
                  const Icon = config.icon;

                  return (
                    <div
                      key={alert.id}
                      className="flex items-start gap-4 p-4 rounded-lg border bg-card"
                    >
                      <div className={`p-2 rounded-full ${config.bgColor}`}>
                        <Icon className={`h-4 w-4 ${config.color}`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`font-medium ${config.color}`}>
                            {config.label}
                          </span>
                          {alert.email_sent ? (
                            <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                              <Mail className="h-3 w-3 mr-1" />
                              Email Sent
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-muted-foreground">
                              <MailX className="h-3 w-3 mr-1" />
                              No Email
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-sm text-muted-foreground mt-1 space-y-0.5">
                          {alert.ip_address && (
                            <p className="font-mono text-xs">
                              IP: {String(alert.ip_address)}
                            </p>
                          )}
                          {alert.metadata?.location && (
                            <p className="text-xs">
                              Location: {alert.metadata.location}
                            </p>
                          )}
                          {alert.metadata?.failedAttempts && (
                            <p className="text-xs text-destructive">
                              Failed Attempts: {alert.metadata.failedAttempts}
                            </p>
                          )}
                          {alert.metadata?.blockedUntil && (
                            <p className="text-xs text-destructive">
                              Blocked Until: {new Date(alert.metadata.blockedUntil).toLocaleString()}
                            </p>
                          )}
                          <p className="text-xs">
                            {formatDistanceToNow(new Date(alert.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
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
