import { useState, useEffect, useCallback } from 'react';
import { Shield, ShieldCheck, ShieldOff, Copy, Eye, EyeOff, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TwoFAStatus {
  enabled: boolean;
  verifiedAt: string | null;
  lastUsedAt: string | null;
  backupCodesRemaining: number;
}

interface SetupResponse {
  success: boolean;
  secret: string;
  uri: string;
  backupCodes: string[];
  message: string;
}

export function TwoFactorAuth() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<TwoFAStatus | null>(null);
  const [setupData, setSetupData] = useState<SetupResponse | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [regenerateCode, setRegenerateCode] = useState('');
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false);
  const [newBackupCodes, setNewBackupCodes] = useState<string[]>([]);

  const invoke2FA = useCallback(async (action: string, params?: Record<string, any>) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase.functions.invoke('user-2fa', {
      body: { action, ...params },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) throw error;
    return data;
  }, []);

  const checkStatus = useCallback(async () => {
    try {
      setLoading(true);
      const data = await invoke2FA('status');
      setStatus(data);
      return data;
    } catch (error) {
      console.error('Failed to check 2FA status:', error);
      setStatus({ enabled: false, verifiedAt: null, lastUsedAt: null, backupCodesRemaining: 0 });
      return null;
    } finally {
      setLoading(false);
    }
  }, [invoke2FA]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const handleStartSetup = async () => {
    try {
      setLoading(true);
      const data = await invoke2FA('setup');
      setSetupData(data);
      setSetupDialogOpen(true);
      toast({
        title: '2FA Setup Started',
        description: 'Scan the QR code with your authenticator app',
      });
    } catch (error: any) {
      toast({
        title: 'Setup Failed',
        description: error.message || 'Failed to start 2FA setup',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySetup = async () => {
    try {
      setLoading(true);
      const result = await invoke2FA('verify-setup', { code: verificationCode });
      if (result?.success) {
        setSetupDialogOpen(false);
        setSetupData(null);
        setVerificationCode('');
        await checkStatus();
        toast({
          title: '2FA Enabled',
          description: 'Two-factor authentication is now active',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Verification Failed',
        description: error.message || 'Invalid verification code',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    try {
      setLoading(true);
      const result = await invoke2FA('disable', { code: disableCode });
      if (result?.success) {
        setDisableDialogOpen(false);
        setDisableCode('');
        setStatus({ enabled: false, verifiedAt: null, lastUsedAt: null, backupCodesRemaining: 0 });
        toast({
          title: '2FA Disabled',
          description: 'Two-factor authentication has been disabled',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Failed to Disable',
        description: error.message || 'Invalid verification code',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    try {
      setLoading(true);
      const result = await invoke2FA('regenerate-backup', { code: regenerateCode });
      if (result?.success && result.backupCodes) {
        setNewBackupCodes(result.backupCodes);
        setRegenerateCode('');
        await checkStatus();
        toast({
          title: 'Backup Codes Regenerated',
          description: 'Save your new backup codes securely',
        });
      }
    } catch (error: any) {
      toast({
        title: 'Failed to Regenerate',
        description: error.message || 'Invalid verification code',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Copied to clipboard',
    });
  };

  if (loading && !status) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Two-Factor Authentication (2FA)
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account using TOTP
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Display */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            {status?.enabled ? (
              <>
                <ShieldCheck className="h-8 w-8 text-green-500" />
                <div>
                  <p className="font-medium">2FA is Enabled</p>
                  <p className="text-sm text-muted-foreground">
                    Your account is protected with two-factor authentication
                  </p>
                </div>
              </>
            ) : (
              <>
                <ShieldOff className="h-8 w-8 text-yellow-500" />
                <div>
                  <p className="font-medium">2FA is Not Enabled</p>
                  <p className="text-sm text-muted-foreground">
                    Enable 2FA for enhanced security
                  </p>
                </div>
              </>
            )}
          </div>
          <Badge variant={status?.enabled ? 'default' : 'secondary'}>
            {status?.enabled ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        {/* Backup Codes Warning */}
        {status?.enabled && status.backupCodesRemaining <= 3 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Low Backup Codes</AlertTitle>
            <AlertDescription>
              You have only {status.backupCodesRemaining} backup codes remaining. 
              Consider regenerating your backup codes.
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          {!status?.enabled ? (
            <Button onClick={handleStartSetup} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Shield className="mr-2 h-4 w-4" />}
              Enable 2FA
            </Button>
          ) : (
            <>
              <Dialog open={regenerateDialogOpen} onOpenChange={setRegenerateDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate Backup Codes
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Regenerate Backup Codes</DialogTitle>
                    <DialogDescription>
                      Enter your current 2FA code to generate new backup codes. Old codes will be invalidated.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {newBackupCodes.length === 0 ? (
                      <>
                        <div className="space-y-2">
                          <Label>Verification Code</Label>
                          <Input
                            type="text"
                            placeholder="Enter 6-digit code"
                            value={regenerateCode}
                            onChange={(e) => setRegenerateCode(e.target.value.replace(/\D/g, ''))}
                            maxLength={6}
                          />
                        </div>
                        <Button onClick={handleRegenerate} disabled={loading || regenerateCode.length !== 6}>
                          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Regenerate Codes
                        </Button>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <Alert>
                          <AlertTriangle className="h-4 w-4" />
                          <AlertTitle>Save These Codes</AlertTitle>
                          <AlertDescription>
                            These codes will only be shown once. Store them securely.
                          </AlertDescription>
                        </Alert>
                        <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg font-mono text-sm">
                          {newBackupCodes.map((code, i) => (
                            <div key={i} className="flex items-center justify-between">
                              <span>{code}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => copyToClipboard(code)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <Button
                          onClick={() => copyToClipboard(newBackupCodes.join('\n'))}
                          variant="outline"
                          className="w-full"
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Copy All Codes
                        </Button>
                        <Button
                          onClick={() => {
                            setNewBackupCodes([]);
                            setRegenerateDialogOpen(false);
                          }}
                          className="w-full"
                        >
                          Done
                        </Button>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={disableDialogOpen} onOpenChange={setDisableDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="destructive">
                    <ShieldOff className="mr-2 h-4 w-4" />
                    Disable 2FA
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
                    <DialogDescription>
                      This will remove 2FA protection from your account. Enter your current code to confirm.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Verification Code</Label>
                      <Input
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={disableCode}
                        onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
                        maxLength={6}
                      />
                    </div>
                    <Button
                      variant="destructive"
                      onClick={handleDisable}
                      disabled={loading || disableCode.length !== 6}
                    >
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Disable 2FA
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>

        {/* Setup Dialog */}
        <Dialog open={setupDialogOpen} onOpenChange={setSetupDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
              <DialogDescription>
                Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </DialogDescription>
            </DialogHeader>

            {setupData && (
              <div className="space-y-6">
                {/* Manual Entry */}
                <div className="space-y-2">
                  <Label>Manual Entry Key</Label>
                  <div className="flex gap-2">
                    <Input
                      value={setupData.secret}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(setupData.secret)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Or scan: <code className="text-xs break-all">{setupData.uri}</code>
                  </p>
                </div>

                {/* Backup Codes */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Backup Codes</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowBackupCodes(!showBackupCodes)}
                    >
                      {showBackupCodes ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {showBackupCodes && (
                    <div className="grid grid-cols-2 gap-2 p-3 bg-muted rounded-lg font-mono text-xs">
                      {setupData.backupCodes.map((code, i) => (
                        <span key={i}>{code}</span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Save these codes securely. Each can be used once if you lose access to your authenticator.
                  </p>
                </div>

                {/* Verification */}
                <div className="space-y-2">
                  <Label>Enter Code to Verify</Label>
                  <Input
                    type="text"
                    placeholder="6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    maxLength={6}
                    className="text-center text-2xl tracking-widest"
                  />
                </div>

                <Button
                  onClick={handleVerifySetup}
                  disabled={loading || verificationCode.length !== 6}
                  className="w-full"
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {loading ? 'Verifying...' : 'Verify & Enable 2FA'}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Status Details */}
        {status?.enabled && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t text-sm">
            <div>
              <p className="text-muted-foreground">Enabled Since</p>
              <p className="font-medium">
                {status.verifiedAt
                  ? new Date(status.verifiedAt).toLocaleDateString()
                  : 'Unknown'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Backup Codes Remaining</p>
              <p className="font-medium">{status.backupCodesRemaining}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
