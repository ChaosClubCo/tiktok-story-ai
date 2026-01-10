import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Shield, AlertTriangle, Activity, Key, RefreshCw, Clock, TrendingUp, Lock, Mail, Download } from 'lucide-react';
import { SecurityIndicator } from '@/components/SecurityIndicator';
import { ApiKeyRotation } from '@/components/admin/ApiKeyRotation';
import { Admin2FASettings } from '@/components/admin/Admin2FASettings';
import { LiveSecurityFeed } from '@/components/admin/LiveSecurityFeed';
import { SecurityDigestSettings } from '@/components/admin/SecurityDigestSettings';
import { SecurityAuditExport } from '@/components/admin/SecurityAuditExport';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
interface SecurityEvent {
  id: string;
  type: string;
  severity: string;
  timestamp: string;
  details: any;
}

interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  blockedAttempts: number;
  successfulAuths: number;
  failedAuths: number;
}

export const SecurityPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    criticalEvents: 0,
    blockedAttempts: 0,
    successfulAuths: 0,
    failedAuths: 0
  });

  useEffect(() => {
    loadSecurityData();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadSecurityData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSecurityData = async () => {
    try {
      // Load security events from monitoring
      const { data, error } = await supabase.functions.invoke('get-security-events', {
        body: { limit: 50 }
      });

      if (error) throw error;

      if (data?.events) {
        setEvents(data.events);
        calculateMetrics(data.events);
      }
    } catch (error) {
      console.error('Failed to load security data:', error);
      // Use mock data for now
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateMetrics = (events: SecurityEvent[]) => {
    const metrics = {
      totalEvents: events.length,
      criticalEvents: events.filter(e => e.severity === 'critical').length,
      blockedAttempts: events.filter(e => e.type === 'rate_limit').length,
      successfulAuths: events.filter(e => e.type === 'auth_attempt' && e.details?.success).length,
      failedAuths: events.filter(e => e.type === 'auth_attempt' && !e.details?.success).length,
    };
    setMetrics(metrics);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const testSecurityHeaders = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('security-headers');
      if (error) throw error;
      
      toast({
        title: 'Security Headers Active',
        description: `${data.headers.length} security headers configured`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Security Check Failed',
        description: 'Failed to verify security headers',
      });
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Dashboard</h1>
          <p className="text-muted-foreground">Monitor security events and manage API keys</p>
        </div>
        <Button onClick={loadSecurityData} variant="outline" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Security Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalEvents}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-error" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.criticalEvents}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked Attempts</CardTitle>
            <Shield className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.blockedAttempts}</div>
            <p className="text-xs text-muted-foreground">Rate limited</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Auth</CardTitle>
            <Lock className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.successfulAuths}</div>
            <p className="text-xs text-muted-foreground">Login success</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Auth</CardTitle>
            <TrendingUp className="h-4 w-4 text-error" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.failedAuths}</div>
            <p className="text-xs text-muted-foreground">Login failures</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="live" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="live">Live Monitoring</TabsTrigger>
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="digest">Email Digests</TabsTrigger>
          <TabsTrigger value="export">Export Reports</TabsTrigger>
          <TabsTrigger value="2fa">Two-Factor Auth</TabsTrigger>
          <TabsTrigger value="keys">API Key Rotation</TabsTrigger>
          <TabsTrigger value="headers">Security Headers</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4">
          <LiveSecurityFeed />
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Events</CardTitle>
              <CardDescription>
                Real-time monitoring of authentication attempts, rate limiting, and suspicious activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No security events recorded yet</p>
                  <p className="text-sm">Events will appear here as they occur</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-3 border rounded-lg bg-card-elevated"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant={getSeverityColor(event.severity)}>
                          {event.severity}
                        </Badge>
                        <div>
                          <p className="text-sm font-medium">{event.type.replace(/_/g, ' ').toUpperCase()}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="digest">
          <SecurityDigestSettings />
        </TabsContent>

        <TabsContent value="export">
          <SecurityAuditExport />
        </TabsContent>

        <TabsContent value="2fa">
          <Admin2FASettings />
        </TabsContent>

        <TabsContent value="keys">
          <ApiKeyRotation />
        </TabsContent>

        <TabsContent value="headers">
          <Card>
            <CardHeader>
              <CardTitle>Security Headers Configuration</CardTitle>
              <CardDescription>
                Comprehensive security headers protect against XSS, clickjacking, and other attacks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Active Security Headers</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>✓ Content Security Policy (CSP)</li>
                    <li>✓ X-Frame-Options (Clickjacking Protection)</li>
                    <li>✓ X-Content-Type-Options (MIME Sniffing)</li>
                    <li>✓ Strict-Transport-Security (HSTS)</li>
                    <li>✓ Referrer-Policy</li>
                    <li>✓ Permissions-Policy</li>
                    <li>✓ Cross-Origin Policies</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold">Protection Features</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>🛡️ XSS Attack Prevention</li>
                    <li>🛡️ Clickjacking Protection</li>
                    <li>🛡️ HTTPS Enforcement</li>
                    <li>🛡️ Mixed Content Blocking</li>
                    <li>🛡️ MIME Type Security</li>
                    <li>🛡️ Privacy Protection</li>
                  </ul>
                </div>
              </div>
              <Button onClick={testSecurityHeaders} className="w-full">
                <Shield className="mr-2 h-4 w-4" />
                Test Security Headers
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
