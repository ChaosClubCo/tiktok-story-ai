import { useRealtimeSecurityMonitor, SecurityThreat } from '@/hooks/useRealtimeSecurityMonitor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Shield, 
  AlertTriangle, 
  Wifi, 
  WifiOff, 
  Trash2, 
  Bell, 
  BellOff,
  Activity,
  Lock,
  UserX,
  Key,
  AlertCircle
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface LiveSecurityFeedProps {
  className?: string;
  compact?: boolean;
}

export function LiveSecurityFeed({ className, compact = false }: LiveSecurityFeedProps) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  const {
    threats,
    isConnected,
    connectionStatus,
    unreadCount,
    clearUnread,
    clearThreats
  } = useRealtimeSecurityMonitor({
    showNotifications: notificationsEnabled,
    maxThreats: compact ? 10 : 50
  });

  const getThreatIcon = (type: SecurityThreat['type']) => {
    switch (type) {
      case 'login_blocked': return <Lock className="h-4 w-4" />;
      case 'suspicious_activity': return <AlertTriangle className="h-4 w-4" />;
      case '2fa_disabled': return <Key className="h-4 w-4" />;
      case 'rate_limit': return <Shield className="h-4 w-4" />;
      case 'auth_failure': return <UserX className="h-4 w-4" />;
      case 'admin_action': return <Activity className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getSeverityStyles = (severity: SecurityThreat['severity']) => {
    switch (severity) {
      case 'critical':
        return 'border-l-4 border-l-red-500 bg-red-500/10';
      case 'high':
        return 'border-l-4 border-l-orange-500 bg-orange-500/10';
      case 'medium':
        return 'border-l-4 border-l-yellow-500 bg-yellow-500/10';
      case 'low':
        return 'border-l-4 border-l-blue-500 bg-blue-500/10';
    }
  };

  const getSeverityBadgeVariant = (severity: SecurityThreat['severity']) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'destructive' as const;
      case 'medium':
        return 'default' as const;
      case 'low':
        return 'secondary' as const;
    }
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-500';
      case 'connecting': return 'text-yellow-500';
      case 'disconnected': return 'text-gray-500';
      case 'error': return 'text-red-500';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Live Security Feed
            </CardTitle>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className={cn("flex items-center gap-1 text-xs", getConnectionStatusColor())}>
              {isConnected ? (
                <Wifi className="h-3 w-3" />
              ) : (
                <WifiOff className="h-3 w-3" />
              )}
              <span className="capitalize">{connectionStatus}</span>
            </div>
          </div>
        </div>
        {!compact && (
          <CardDescription>
            Real-time monitoring of security events and threats
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {/* Controls */}
        {!compact && (
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            >
              {notificationsEnabled ? (
                <Bell className="h-4 w-4 mr-2" />
              ) : (
                <BellOff className="h-4 w-4 mr-2" />
              )}
              {notificationsEnabled ? 'Mute' : 'Unmute'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearUnread}
              disabled={unreadCount === 0}
            >
              Mark Read
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearThreats}
              disabled={threats.length === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        )}

        {/* Threats List */}
        <ScrollArea className={cn(compact ? "h-[300px]" : "h-[400px]")}>
          {threats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mb-4 opacity-30" />
              <p className="font-medium">No threats detected</p>
              <p className="text-sm">Security events will appear here in real-time</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              <div className="space-y-2">
                {threats.map((threat) => (
                  <motion.div
                    key={threat.id}
                    initial={{ opacity: 0, x: -20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: 'auto' }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "p-3 rounded-lg",
                      getSeverityStyles(threat.severity),
                      threat.isNew && "ring-2 ring-primary animate-pulse"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "p-2 rounded-full",
                        threat.severity === 'critical' && "bg-red-500/20 text-red-500",
                        threat.severity === 'high' && "bg-orange-500/20 text-orange-500",
                        threat.severity === 'medium' && "bg-yellow-500/20 text-yellow-500",
                        threat.severity === 'low' && "bg-blue-500/20 text-blue-500"
                      )}>
                        {getThreatIcon(threat.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant={getSeverityBadgeVariant(threat.severity)} className="text-xs">
                            {threat.severity.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(threat.timestamp)}
                          </span>
                        </div>
                        <p className="font-medium text-sm mt-1">{threat.message}</p>
                        {threat.ipAddress && (
                          <p className="text-xs text-muted-foreground mt-1">
                            IP: {threat.ipAddress}
                          </p>
                        )}
                        {threat.details && Object.keys(threat.details).length > 0 && !compact && (
                          <div className="mt-2 text-xs text-muted-foreground">
                            {Object.entries(threat.details).slice(0, 3).map(([key, value]) => (
                              <span key={key} className="mr-3">
                                <span className="font-medium">{key}:</span> {String(value)}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </ScrollArea>

        {/* Connection indicator bar */}
        <div className={cn(
          "absolute bottom-0 left-0 right-0 h-1 transition-colors",
          connectionStatus === 'connected' && "bg-green-500",
          connectionStatus === 'connecting' && "bg-yellow-500 animate-pulse",
          connectionStatus === 'disconnected' && "bg-gray-500",
          connectionStatus === 'error' && "bg-red-500"
        )} />
      </CardContent>
    </Card>
  );
}
