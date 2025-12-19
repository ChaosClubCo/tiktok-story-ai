import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  description?: string;
  /** Gradient text effect on title */
  gradient?: boolean;
  /** Custom action slot (buttons, links, etc.) */
  action?: ReactNode;
  className?: string;
  /** Center align content */
  centered?: boolean;
}

/**
 * SectionHeader - Reusable section header with title, description, and optional actions
 * Supports gradient text and centered layout variants
 */
export function SectionHeader({
  title,
  description,
  gradient = false,
  action,
  className,
  centered = false,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'space-y-2',
        centered && 'text-center',
        className
      )}
    >
      <div className={cn('flex items-center gap-4', centered ? 'justify-center' : 'justify-between')}>
        <h2
          className={cn(
            'text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight',
            gradient && 'bg-gradient-drama bg-clip-text text-transparent'
          )}
        >
          {title}
        </h2>
        {action && !centered && <div className="flex-shrink-0">{action}</div>}
      </div>
      {description && (
        <p className={cn('text-muted-foreground', centered ? 'max-w-2xl mx-auto' : 'max-w-3xl')}>
          {description}
        </p>
      )}
      {action && centered && <div className="pt-4">{action}</div>}
    </div>
  );
}
