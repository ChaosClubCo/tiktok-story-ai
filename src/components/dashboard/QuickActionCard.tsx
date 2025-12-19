import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  className?: string;
}

/**
 * QuickActionCard - Compact action card for dashboard quick actions
 */
export function QuickActionCard({
  title,
  description,
  icon: Icon,
  onClick,
  className,
}: QuickActionCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <CardContent className="p-4 text-center">
        <Icon className="w-8 h-8 mx-auto mb-2 text-primary" aria-hidden="true" />
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
