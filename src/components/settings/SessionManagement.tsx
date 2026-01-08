import { useState, useEffect } from 'react';
import { Monitor, Smartphone, Laptop, Globe, LogOut, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SessionInfo {
  id: string;
  device: string;
  browser: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export function SessionManagement() {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [signingOut, setSigningOut] = useState(false);
  const { toast } = useToast();

  const getDeviceIcon = (device: string) => {
    const lowerDevice = device.toLowerCase();
    if (lowerDevice.includes('mobile') || lowerDevice.includes('android') || lowerDevice.includes('iphone')) {
      return <Smartphone className="h-5 w-5" />;
    }
    if (lowerDevice.includes('tablet') || lowerDevice.includes('ipad')) {
      return <Monitor className="h-5 w-5" />;
    }
    return <Laptop className="h-5 w-5" />;
  };

  const parseUserAgent = (userAgent: string): { device: string; browser: string } => {
    let device = 'Desktop';
    let browser = 'Unknown Browser';

    if (/mobile/i.test(userAgent)) device = 'Mobile';
    else if (/tablet|ipad/i.test(userAgent)) device = 'Tablet';

    if (/chrome/i.test(userAgent) && !/edge/i.test(userAgent)) browser = 'Chrome';
    else if (/firefox/i.test(userAgent)) browser = 'Firefox';
    else if (/safari/i.test(userAgent) && !/chrome/i.test(userAgent)) browser = 'Safari';
    else if (/edge/i.test(userAgent)) browser = 'Edge';

    return { device, browser };
  };

  const loadSessions = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const userAgent = navigator.userAgent;
        const { device, browser } = parseUserAgent(userAgent);
        
        // Current session info
        const currentSession: SessionInfo = {
          id: session.access_token.slice(-8),
          device,
          browser,
          location: 'Current Location',
          lastActive: 'Now',
          isCurrent: true,
        };

        setSessions([currentSession]);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleSignOutAll = async () => {
    setSigningOut(true);
    try {
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      if (error) throw error;

      toast({
        title: 'Signed Out',
        description: 'You have been signed out from all devices',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign out from all devices',
        variant: 'destructive',
      });
    } finally {
      setSigningOut(false);
    }
  };

  const handleSignOutCurrent = async () => {
    setSigningOut(true);
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) throw error;

      toast({
        title: 'Signed Out',
        description: 'You have been signed out from this device',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign out',
        variant: 'destructive',
      });
    } finally {
      setSigningOut(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Active Sessions
          </CardTitle>
          <CardDescription>View and manage your active login sessions</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
              <Globe className="h-5 w-5" />
              Active Sessions
            </CardTitle>
            <CardDescription>View and manage your active login sessions</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={loadSessions}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertDescription>
            Sessions are managed by Supabase authentication. You can sign out from the current device or all devices at once.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-4 rounded-lg border bg-card"
            >
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-lg bg-muted">
                  {getDeviceIcon(session.device)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{session.device}</p>
                    {session.isCurrent && (
                      <Badge variant="default" className="text-xs">Current</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {session.browser} • {session.location}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last active: {session.lastActive}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleSignOutCurrent} disabled={signingOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out (This Device)
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={signingOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out All Devices
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Sign out from all devices?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will sign you out from all devices where you're currently logged in, 
                  including this one. You'll need to log in again.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleSignOutAll} disabled={signingOut}>
                  {signingOut ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing Out...
                    </>
                  ) : (
                    'Sign Out All'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}
