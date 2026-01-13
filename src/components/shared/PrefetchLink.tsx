import { forwardRef, ReactNode } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { usePrefetch } from '@/hooks/usePrefetch';
import { cn } from '@/lib/utils';

interface PrefetchLinkProps extends Omit<LinkProps, 'to'> {
  to: string;
  children: ReactNode;
  prefetchDelay?: number;
  className?: string;
}

/**
 * Enhanced Link component with automatic route prefetching on hover.
 * Preloads the target route's component when the user hovers over the link.
 */
export const PrefetchLink = forwardRef<HTMLAnchorElement, PrefetchLinkProps>(
  ({ to, children, prefetchDelay = 100, className, ...props }, ref) => {
    const { getPrefetchHandlers } = usePrefetch();
    const handlers = getPrefetchHandlers(to);

    return (
      <Link
        ref={ref}
        to={to}
        className={cn(className)}
        onMouseEnter={(e) => {
          handlers.onMouseEnter();
          props.onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          handlers.onMouseLeave();
          props.onMouseLeave?.(e);
        }}
        onFocus={(e) => {
          handlers.onFocus();
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          handlers.onBlur();
          props.onBlur?.(e);
        }}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

PrefetchLink.displayName = 'PrefetchLink';

export default PrefetchLink;
