import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Link2, Unlink, Loader2 } from 'lucide-react';

interface LinkedProvider {
  provider: string;
  connected: boolean;
  email?: string;
}

// Provider icons as SVG components
const GoogleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const AppleIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
);

export const LinkedAccounts = () => {
  const { user } = useAuth();
  const [linkedProviders, setLinkedProviders] = useState<LinkedProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [linking, setLinking] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      // Check which providers are linked by examining user identities
      const identities = user.identities || [];
      const providers: LinkedProvider[] = [
        {
          provider: 'google',
          connected: identities.some((id) => id.provider === 'google'),
          email: identities.find((id) => id.provider === 'google')?.identity_data?.email,
        },
        {
          provider: 'apple',
          connected: identities.some((id) => id.provider === 'apple'),
          email: identities.find((id) => id.provider === 'apple')?.identity_data?.email,
        },
      ];
      setLinkedProviders(providers);
      setLoading(false);
    }
  }, [user]);

  const handleLinkProvider = async (provider: 'google' | 'apple') => {
    setLinking(provider);
    try {
      const { error } = await supabase.auth.linkIdentity({
        provider,
        options: {
          redirectTo: `${window.location.origin}/settings`,
        },
      });

      if (error) throw error;
      // User will be redirected to provider
    } catch (error: any) {
      console.error('Link provider error:', error);
      toast.error(error.message || `Failed to link ${provider} account`);
      setLinking(null);
    }
  };

  const handleUnlinkProvider = async (provider: string) => {
    // Check if this is the only identity - prevent unlinking if user would be locked out
    const identities = user?.identities || [];
    if (identities.length <= 1) {
      toast.error('Cannot unlink your only login method. Add another method first.');
      return;
    }

    setLinking(provider);
    try {
      const identity = identities.find((id) => id.provider === provider);
      if (!identity) {
        throw new Error('Identity not found');
      }

      const { error } = await supabase.auth.unlinkIdentity(identity);
      if (error) throw error;

      // Update local state
      setLinkedProviders((prev) =>
        prev.map((p) => (p.provider === provider ? { ...p, connected: false, email: undefined } : p))
      );
      toast.success(`${provider.charAt(0).toUpperCase() + provider.slice(1)} account unlinked`);
    } catch (error: any) {
      console.error('Unlink provider error:', error);
      toast.error(error.message || `Failed to unlink ${provider} account`);
    } finally {
      setLinking(null);
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'google':
        return <GoogleIcon />;
      case 'apple':
        return <AppleIcon />;
      default:
        return <Link2 className="h-5 w-5" />;
    }
  };

  const getProviderName = (provider: string) => {
    return provider.charAt(0).toUpperCase() + provider.slice(1);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Linked Accounts
          </CardTitle>
          <CardDescription>Loading connected accounts...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Linked Accounts
        </CardTitle>
        <CardDescription>
          Connect your social accounts for easier login. You can link multiple accounts to your profile.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {linkedProviders.map((provider) => (
          <div
            key={provider.provider}
            className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-muted/20"
          >
            <div className="flex items-center gap-3">
              {getProviderIcon(provider.provider)}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{getProviderName(provider.provider)}</span>
                  {provider.connected && (
                    <Badge variant="secondary" className="text-xs">
                      Connected
                    </Badge>
                  )}
                </div>
                {provider.email && (
                  <p className="text-xs text-muted-foreground">{provider.email}</p>
                )}
              </div>
            </div>
            {provider.connected ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleUnlinkProvider(provider.provider)}
                disabled={linking === provider.provider}
                className="text-destructive hover:text-destructive"
              >
                {linking === provider.provider ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Unlink className="h-4 w-4 mr-2" />
                    Unlink
                  </>
                )}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleLinkProvider(provider.provider as 'google' | 'apple')}
                disabled={linking === provider.provider}
              >
                {linking === provider.provider ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Link2 className="h-4 w-4 mr-2" />
                    Link
                  </>
                )}
              </Button>
            )}
          </div>
        ))}

        {/* OAuth Configuration Notice */}
        <div className="mt-6 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-4">
          <h4 className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-2">
            Setup Required for Social Login
          </h4>
          <p className="text-xs text-amber-800 dark:text-amber-200">
            Social login providers (Google, Apple) require configuration in your Supabase dashboard.
            Contact your administrator if you're having trouble connecting accounts.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
