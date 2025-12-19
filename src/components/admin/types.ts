import { LucideIcon } from 'lucide-react';

export interface AdminNavItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  description?: string;
  badge?: string;
  requiresSuperAdmin?: boolean;
}

export interface AdminUser {
  id: string;
  user_id: string;
  display_name: string | null;
  created_at: string;
  subscribers?: Array<{
    subscribed: boolean;
    subscription_tier: string | null;
  }>;
}
