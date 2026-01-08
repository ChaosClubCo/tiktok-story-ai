import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, Mail, Sparkles, Calendar, Users, TrendingUp } from 'lucide-react';

interface NotificationItemProps {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

const NotificationItem = ({
  id,
  label,
  description,
  icon,
  checked,
  onCheckedChange,
  disabled,
}: NotificationItemProps) => (
  <div className="flex items-start justify-between gap-4 py-4 border-b border-border/50 last:border-0">
    <div className="flex gap-3">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="space-y-1">
        <Label htmlFor={id} className="text-sm font-medium cursor-pointer">
          {label}
        </Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
    <Switch
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      aria-describedby={`${id}-description`}
    />
  </div>
);

export const NotificationPreferences = () => {
  const { preferences, loading, saving, updatePreference } = useNotificationPreferences();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>Manage your email notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex items-center justify-between py-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-11 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const notifications = [
    {
      id: 'email_marketing',
      key: 'email_marketing' as const,
      label: 'Marketing Emails',
      description: 'Receive promotional offers, tips, and special deals',
      icon: <Mail className="h-4 w-4" />,
    },
    {
      id: 'email_product_updates',
      key: 'email_product_updates' as const,
      label: 'Product Updates',
      description: 'Get notified about new features and improvements',
      icon: <Sparkles className="h-4 w-4" />,
    },
    {
      id: 'email_weekly_digest',
      key: 'email_weekly_digest' as const,
      label: 'Weekly Digest',
      description: 'Weekly summary of your content performance and trends',
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      id: 'email_script_analysis',
      key: 'email_script_analysis' as const,
      label: 'Script Analysis Notifications',
      description: 'Get notified when your script analysis is complete',
      icon: <Bell className="h-4 w-4" />,
    },
    {
      id: 'email_series_reminders',
      key: 'email_series_reminders' as const,
      label: 'Series Reminders',
      description: 'Reminders for your scheduled series content',
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      id: 'email_collaboration',
      key: 'email_collaboration' as const,
      label: 'Collaboration Updates',
      description: 'Notifications about team collaboration and comments',
      icon: <Users className="h-4 w-4" />,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Email Notifications
        </CardTitle>
        <CardDescription>
          Choose which emails you'd like to receive. You can change these preferences at any time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            id={notification.id}
            label={notification.label}
            description={notification.description}
            icon={notification.icon}
            checked={preferences?.[notification.key] ?? false}
            onCheckedChange={(checked) => updatePreference(notification.key, checked)}
            disabled={saving}
          />
        ))}
      </CardContent>
    </Card>
  );
};
