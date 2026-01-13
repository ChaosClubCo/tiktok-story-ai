import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  /** Maximum width preset */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  /** Add top padding for header offset */
  withHeaderOffset?: boolean;
}

const maxWidthClasses = {
  sm: 'max-w-3xl',
  md: 'max-w-4xl',
  lg: 'max-w-5xl',
  xl: 'max-w-6xl',
  '2xl': 'max-w-7xl',
  full: 'max-w-full',
};

/**
 * PageContainer - Consistent page wrapper with responsive padding
 * Provides container constraints and responsive spacing
 */
export function PageContainer({
  children,
  className,
  maxWidth = '2xl',
  withHeaderOffset = false,
}: PageContainerProps) {
  return (
    <div
      className={cn(
        'container mx-auto px-4 py-8',
        maxWidthClasses[maxWidth],
        withHeaderOffset && 'pt-20',
        className
      )}
    >
      {children}
    </div>
  );
}
