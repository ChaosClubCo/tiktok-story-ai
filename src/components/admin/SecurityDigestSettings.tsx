import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Mail, Clock, Send, Calendar, Bell, Plus, X, CheckCircle } from 'lucide-react';

interface DigestSettings {
  enabled: boolean;
  frequency: 'daily' | 'weekly';
  sendTime: string;
  additionalEmails: string[];
}

export const SecurityDigestSettings = () => {
  const [settings, setSettings] = useState<DigestSettings>({
    enabled: true,
    frequency: 'daily',
    sendTime: '09:00',
    additionalEmails: []
  });
  const [newEmail, setNewEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [lastSent, setLastSent] = useState<string | null>(null);

  useEffect(() => {
    // Load settings from localStorage (in production, this would be from database)
    const saved = localStorage.getItem('security_digest_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse digest settings:', e);
      }
    }

    // Get last sent time
    const lastSentTime = localStorage.getItem('security_digest_last_sent');
    if (lastSentTime) {
      setLastSent(lastSentTime);
    }
  }, []);

  const saveSettings = (newSettings: DigestSettings) => {
    setSettings(newSettings);
    localStorage.setItem('security_digest_settings', JSON.stringify(newSettings));
    toast.success('Digest settings saved');
  };

  const addEmail = () => {
    if (!newEmail || !newEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (settings.additionalEmails.includes(newEmail)) {
      toast.error('Email already added');
      return;
    }
    const updated = {
      ...settings,
      additionalEmails: [...settings.additionalEmails, newEmail]
    };
    saveSettings(updated);
    setNewEmail('');
  };

  const removeEmail = (email: string) => {
    const updated = {
      ...settings,
      additionalEmails: settings.additionalEmails.filter(e => e !== email)
    };
    saveSettings(updated);
  };

  const sendTestDigest = async () => {
    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-security-digest', {
        body: {
          digestType: settings.frequency,
          adminEmails: settings.additionalEmails.length > 0 
            ? settings.additionalEmails 
            : undefined
        }
      });

      if (error) throw error;

      const now = new Date().toISOString();
      setLastSent(now);
      localStorage.setItem('security_digest_last_sent', now);

      toast.success(`${settings.frequency === 'daily' ? 'Daily' : 'Weekly'} security digest sent successfully!`, {
        description: `Sent to ${data.emailsSent || 'admin'} recipient(s)`
      });
    } catch (error: any) {
      console.error('Failed to send digest:', error);
      toast.error('Failed to send security digest', {
        description: error.message
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Security Digest Notifications
            </CardTitle>
            <CardDescription>
              Configure automated email summaries of security events
            </CardDescription>
          </div>
          <Badge variant={settings.enabled ? 'default' : 'secondary'}>
            {settings.enabled ? 'Active' : 'Disabled'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable Toggle */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base">Enable Security Digests</Label>
            <p className="text-sm text-muted-foreground">
              Receive automated security summaries via email
            </p>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(enabled) => saveSettings({ ...settings, enabled })}
          />
        </div>

        {settings.enabled && (
          <>
            {/* Frequency Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Digest Frequency
              </Label>
              <Select
                value={settings.frequency}
                onValueChange={(value: 'daily' | 'weekly') => 
                  saveSettings({ ...settings, frequency: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">
                    <div className="flex items-center gap-2">
                      <span>Daily Digest</span>
                      <span className="text-xs text-muted-foreground">Sent every morning</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="weekly">
                    <div className="flex items-center gap-2">
                      <span>Weekly Digest</span>
                      <span className="text-xs text-muted-foreground">Sent every Monday</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Send Time */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Preferred Send Time
              </Label>
              <Input
                type="time"
                value={settings.sendTime}
                onChange={(e) => saveSettings({ ...settings, sendTime: e.target.value })}
                className="w-32"
              />
              <p className="text-xs text-muted-foreground">
                Digests will be sent at this time in your local timezone
              </p>
            </div>

            {/* Additional Recipients */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Additional Recipients
              </Label>
              <p className="text-sm text-muted-foreground">
                All admins receive digests automatically. Add extra recipients below.
              </p>
              
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addEmail()}
                />
                <Button onClick={addEmail} variant="outline" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {settings.additionalEmails.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {settings.additionalEmails.map((email) => (
                    <Badge key={email} variant="secondary" className="gap-1 pr-1">
                      {email}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => removeEmail(email)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Digest Contents Preview */}
            <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
              <h4 className="font-medium text-sm">Digest Contents</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-primary" />
                  Security event summary and counts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-primary" />
                  Failed login attempts and rate limiting
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-primary" />
                  2FA enrollment statistics
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-primary" />
                  Top suspicious IP addresses
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-primary" />
                  Recommended security actions
                </li>
              </ul>
            </div>

            {/* Last Sent Info */}
            {lastSent && (
              <p className="text-xs text-muted-foreground">
                Last digest sent: {new Date(lastSent).toLocaleString()}
              </p>
            )}

            {/* Send Now Button */}
            <Button
              onClick={sendTestDigest}
              disabled={sending}
              className="w-full"
            >
              <Send className="mr-2 h-4 w-4" />
              {sending ? 'Sending...' : `Send ${settings.frequency === 'daily' ? 'Daily' : 'Weekly'} Digest Now`}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
