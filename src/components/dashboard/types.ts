import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

export interface DashboardTab {
  id: string;
  label: string;
  icon: LucideIcon;
  component: ReactNode;
}

export const DASHBOARD_TAB_CATEGORIES = {
  core: ['workflow', 'generator', 'topics'],
  wellness: ['wellness', 'performance'],
  engagement: ['fast-delivery', 'social-proof', 'visual-hooks', 'chat-rewards'],
  ai: ['ai-video', 'optimization', 'voice-tone'],
  scheduling: ['calendar', 'platform', 'marketplace'],
} as const;
