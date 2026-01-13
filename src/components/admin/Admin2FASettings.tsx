import { useState, useEffect } from 'react';
import { Shield, ShieldCheck, ShieldOff, Copy, Eye, EyeOff, RefreshCw, AlertTriangle } from 'lucide-react';
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
import { useAdmin2FA } from '@/hooks/useAdmin2FA';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export function Admin2FASettings() {
  const {
    loading,
    status,
    setupData,
    checkStatus,
    startSetup,
    verifySetup,
    disable,
    regenerateBackupCodes,
  } = useAdmin2FA();

  const { toast } = useToast();
  const [verificationCode, setVerificationCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [regenerateCode, setRegenerateCode] = useState('');
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [setupDialogOpen, setSetupDialogOpen] = useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [regenerateDialogOpen, setRegenerateDialogOpen] = useState(false);
  const [newBackupCodes, setNewBackupCodes] = useState<string[]>([]);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const handleStartSetup = async () => {
    await startSetup();
    setSetupDialogOpen(true);
  };

  const handleVerifySetup = async () => {
    const result = await verifySetup(verificationCode);
    if (result?.success) {
      setSetupDialogOpen(false);
      setVerificationCode('');
    }
  };

  const handleDisable = async () => {
    const result = await disable(disableCode);
    if (result?.success) {
      setDisableDialogOpen(false);
      setDisableCode('');
    }
  };

  const handleRegenerate = async () => {
    const result = await regenerateBackupCodes(regenerateCode);
    if (result?.success && result.backupCodes) {
      setNewBackupCodes(result.backupCodes);
      setRegenerateCode('');
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
          Add an extra layer of security to your admin account
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

        {/* Backup Codes Info */}
        {status?.enabled && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Backup Codes</AlertTitle>
            <AlertDescription>
              You have {status.backupCodesRemaining} backup codes remaining.
              {status.backupCodesRemaining <= 2 && (
                <span className="text-destructive font-medium">
                  {' '}Consider regenerating your backup codes.
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          {!status?.enabled ? (
            <Button onClick={handleStartSetup} disabled={loading}>
              <Shield className="mr-2 h-4 w-4" />
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
                            onChange={(e) => setRegenerateCode(e.target.value)}
                            maxLength={6}
                          />
                        </div>
                        <Button onClick={handleRegenerate} disabled={loading || regenerateCode.length !== 6}>
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
                        onChange={(e) => setDisableCode(e.target.value)}
                        maxLength={6}
                      />
                    </div>
                    <Button
                      variant="destructive"
                      onClick={handleDisable}
                      disabled={loading || disableCode.length !== 6}
                    >
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
                {/* QR Code Placeholder - In production, generate actual QR code */}
                <div className="flex justify-center">
                  <div className="p-4 bg-white rounded-lg border">
                    <div className="w-48 h-48 flex items-center justify-center bg-muted text-muted-foreground">
                      <div className="text-center p-4">
                        <p className="text-sm mb-2">Scan with authenticator app:</p>
                        <p className="text-xs font-mono break-all">{setupData.uri}</p>
                      </div>
                    </div>
                  </div>
                </div>

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
                      {showBackupCodes ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
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
              <p className="text-muted-foreground">Last Used</p>
              <p className="font-medium">
                {status.lastUsedAt
                  ? new Date(status.lastUsedAt).toLocaleDateString()
                  : 'Never'}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
