import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick?: () => void;
  className?: string;
  /** Visual variant */
  variant?: 'default' | 'elevated' | 'glass';
  /** Glow effect color */
  glow?: 'primary' | 'secondary' | 'none';
}

const variantClasses = {
  default: 'bg-card/50 backdrop-blur-sm border border-border/50',
  elevated: 'bg-card shadow-elevated',
  glass: 'bg-gradient-glass backdrop-blur-md border border-border/30',
};

const glowClasses = {
  primary: 'hover:shadow-glow',
  secondary: 'hover:shadow-glow-secondary',
  none: '',
};

/**
 * FeatureCard - Reusable card for displaying features with icon
 * Supports multiple visual variants and glow effects
 */
export function FeatureCard({
  title,
  description,
  icon: Icon,
  onClick,
  className,
  variant = 'default',
  glow = 'primary',
}: FeatureCardProps) {
  const isClickable = !!onClick;

  return (
    <Card
      className={cn(
        variantClasses[variant],
        glowClasses[glow],
        'rounded-xl p-6 transition-all duration-300',
        isClickable && 'cursor-pointer hover:bg-card/70 hover:scale-[1.02]',
        'group',
        className
      )}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => e.key === 'Enter' && onClick?.() : undefined}
    >
      <CardContent className="p-0 text-center">
        <Icon
          className={cn(
            'w-8 h-8 mx-auto mb-3 text-primary',
            'group-hover:scale-110 transition-transform duration-200'
          )}
          aria-hidden="true"
        />
        <h3 className="font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
