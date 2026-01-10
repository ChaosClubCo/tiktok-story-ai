import { ReactNode } from 'react';
import { Header } from '@/components/Header';
import { GuestBanner } from '@/components/auth/GuestBanner';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: ReactNode;
  /** Show header (default: true) */
  showHeader?: boolean;
  /** Background variant */
  background?: 'base' | 'gradient' | 'none';
  className?: string;
}

const backgroundClasses = {
  base: 'bg-background-base',
  gradient: 'bg-gradient-to-br from-background to-secondary/20',
  none: '',
};

/**
 * MainLayout - Primary application layout wrapper
 * Provides consistent header and background styling
 */
export function MainLayout({
  children,
  showHeader = true,
  background = 'base',
  className,
}: MainLayoutProps) {
  return (
    <div className={cn('min-h-screen', backgroundClasses[background], className)}>
      <GuestBanner />
      {showHeader && <Header />}
      <main id="main-content" tabIndex={-1} className="outline-none">
        {children}
      </main>
    </div>
  );
}
