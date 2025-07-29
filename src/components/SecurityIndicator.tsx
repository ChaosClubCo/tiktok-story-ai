import { Shield, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface SecurityIndicatorProps {
  isLimited?: boolean;
  attempts?: number;
  maxAttempts?: number;
  remainingTime?: number;
  progressPercentage?: number;
  className?: string;
}

export const SecurityIndicator = ({
  isLimited = false,
  attempts = 0,
  maxAttempts = 5,
  remainingTime = 0,
  progressPercentage = 0,
  className
}: SecurityIndicatorProps) => {
  const getSecurityLevel = () => {
    if (isLimited) return 'blocked';
    if (progressPercentage > 80) return 'warning';
    if (progressPercentage > 60) return 'caution';
    return 'secure';
  };

  const securityLevel = getSecurityLevel();

  const getIcon = () => {
    switch (securityLevel) {
      case 'blocked':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'caution':
        return <Clock className="h-4 w-4 text-orange-500" />;
      default:
        return <Shield className="h-4 w-4 text-green-500" />;
    }
  };

  const getBadgeVariant = () => {
    switch (securityLevel) {
      case 'blocked':
        return 'destructive';
      case 'warning':
      case 'caution':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getMessage = () => {
    if (isLimited) {
      return `Rate limited. Try again in ${remainingTime}s`;
    }
    if (progressPercentage > 80) {
      return `${maxAttempts - attempts} attempts remaining`;
    }
    if (progressPercentage > 60) {
      return 'Approaching rate limit';
    }
    return 'Secure connection';
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={getBadgeVariant()} className="flex items-center gap-1">
            {getIcon()}
            <span className="text-xs">{getMessage()}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="text-sm font-medium">Security Status</p>
            <p className="text-xs text-muted-foreground">
              Attempts: {attempts}/{maxAttempts}
            </p>
            {progressPercentage > 0 && (
              <div className="w-32">
                <Progress value={progressPercentage} className="h-1" />
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};