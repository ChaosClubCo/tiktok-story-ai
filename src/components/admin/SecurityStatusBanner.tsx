import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldCheck, ShieldAlert, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * SecurityStatusBanner - Displays current security status for admin users
 * Shows auth status, role level, and session information
 */
export function SecurityStatusBanner() {
  const { user, session } = useAuth();
  const { isAdmin, isSuperAdmin, loading } = useAdmin();

  if (loading || !user) return null;

  const getRoleLevel = () => {
    if (isSuperAdmin) return { label: 'Super Admin', variant: 'destructive' as const, icon: ShieldAlert };
    if (isAdmin) return { label: 'Admin', variant: 'default' as const, icon: ShieldCheck };
    return { label: 'User', variant: 'secondary' as const, icon: Shield };
  };

  const role = getRoleLevel();
  const RoleIcon = role.icon;

  // Calculate session age
  const sessionAge = session?.expires_at
    ? new Date(session.expires_at * 1000).getTime() - Date.now()
    : 0;
  const hoursRemaining = Math.max(0, Math.floor(sessionAge / (1000 * 60 * 60)));

  return (
    <Card className="bg-card-elevated border-primary/20">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <div className={cn(
            'p-2 rounded-lg',
            isSuperAdmin ? 'bg-error/10' : 'bg-primary/10'
          )}>
            <RoleIcon className={cn(
              'w-5 h-5',
              isSuperAdmin ? 'text-error' : 'text-primary'
            )} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{user.email}</span>
              <Badge variant={role.variant}>{role.label}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Authenticated via Supabase
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>Session: {hoursRemaining}h remaining</span>
        </div>
      </CardContent>
    </Card>
  );
}
