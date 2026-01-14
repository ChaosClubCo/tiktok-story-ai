import { ReactNode } from 'react';
import { NavLink as RouterNavLink, NavLinkProps as RouterNavLinkProps } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface NavLinkProps extends Omit<RouterNavLinkProps, 'className'> {
  children: ReactNode;
  className?: string;
  activeClassName?: string;
  icon?: ReactNode;
}

/**
 * NavLink - Accessible navigation link with active state styling
 * Uses react-router-dom's NavLink for automatic active detection
 */
export function NavLink({
  children,
  className,
  activeClassName = 'bg-primary/10 text-primary',
  icon,
  ...props
}: NavLinkProps) {
  return (
    <RouterNavLink
      className={({ isActive }) =>
        cn(
          'inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md',
          'transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          isActive ? activeClassName : 'text-muted-foreground hover:text-foreground',
          className
        )
      }
      {...props}
    >
      {icon}
      {children}
    </RouterNavLink>
  );
}
