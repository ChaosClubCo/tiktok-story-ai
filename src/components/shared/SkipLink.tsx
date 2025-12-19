import { cn } from '@/lib/utils';

interface SkipLinkProps {
  href?: string;
  children?: React.ReactNode;
  className?: string;
}

/**
 * SkipLink - Accessibility component for keyboard navigation
 * Allows users to skip repetitive navigation and jump to main content
 * Only visible when focused via keyboard
 */
export function SkipLink({ 
  href = '#main-content', 
  children = 'Skip to main content',
  className 
}: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        // Visually hidden by default
        'sr-only',
        // Visible when focused
        'focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100]',
        'focus:px-4 focus:py-2 focus:rounded-md',
        'focus:bg-primary focus:text-primary-foreground',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        'focus:shadow-lg',
        'transition-all duration-200',
        className
      )}
    >
      {children}
    </a>
  );
}

/**
 * SkipLinks - Multiple skip link targets for complex layouts
 */
export function SkipLinks() {
  return (
    <div className="skip-links">
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <SkipLink href="#main-navigation">Skip to navigation</SkipLink>
    </div>
  );
}
