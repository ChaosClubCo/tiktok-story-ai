import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Fingerprint, Trash2, Shield, AlertCircle, CheckCircle2, Loader2, Smartphone } from 'lucide-react';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export function BiometricSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    isSupported,
    isAvailable,
    isRegistered,
    isLoading,
    error,
    registerBiometric,
    removeBiometric,
    clearError,
  } = useBiometricAuth();

  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleEnableBiometric = async () => {
    if (!user?.id || !user?.email) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to enable biometric authentication.',
      });
      return;
    }

    setIsRegistering(true);
    clearError();

    const success = await registerBiometric(user.id, user.email);

    if (success) {
      toast({
        title: 'Biometric Enabled',
        description: 'You can now sign in using your fingerprint or face recognition.',
      });
    } else if (error) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: error,
      });
    }

    setIsRegistering(false);
  };

  const handleRemoveBiometric = () => {
    removeBiometric();
    setShowRemoveDialog(false);
    toast({
      title: 'Biometric Removed',
      description: 'Biometric authentication has been disabled for your account.',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5" />
            Biometric Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5" />
            Biometric Authentication
          </CardTitle>
          <CardDescription>
            Use your fingerprint or face to sign in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Biometric authentication is not supported by your browser. Try using a modern browser like Chrome, Safari, or Edge.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!isAvailable) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5" />
            Biometric Authentication
          </CardTitle>
          <CardDescription>
            Use your fingerprint or face to sign in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Smartphone className="h-4 w-4" />
            <AlertDescription>
              Your device doesn't have biometric capabilities (fingerprint or face recognition) or they are not set up. Please configure biometrics in your device settings first.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5" />
            Biometric Authentication
          </CardTitle>
          <CardDescription>
            Use your fingerprint or face to sign in quickly and securely
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="biometric-toggle" className="text-base font-medium">
                Enable Biometric Sign In
              </Label>
              <p className="text-sm text-muted-foreground">
                Sign in using your device's fingerprint or face recognition
              </p>
            </div>
            <Switch
              id="biometric-toggle"
              checked={isRegistered}
              onCheckedChange={(checked) => {
                if (checked) {
                  handleEnableBiometric();
                } else {
                  setShowRemoveDialog(true);
                }
              }}
              disabled={isRegistering}
            />
          </div>

          {isRegistered && (
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-sm">Biometric authentication is active</p>
                  <p className="text-sm text-muted-foreground">
                    You can use your fingerprint or face recognition to sign in on the login page.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isRegistered && (
            <div className="rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div className="space-y-2">
                  <p className="font-medium text-sm">Quick & Secure Access</p>
                  <p className="text-sm text-muted-foreground">
                    Enable biometric authentication to sign in faster without typing your password. Your biometric data never leaves your device.
                  </p>
                  <Button
                    size="sm"
                    onClick={handleEnableBiometric}
                    disabled={isRegistering}
                  >
                    {isRegistering ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Setting up...
                      </>
                    ) : (
                      <>
                        <Fingerprint className="h-4 w-4 mr-2" />
                        Set Up Biometric
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {isRegistered && (
            <div className="pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => setShowRemoveDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Biometric Credentials
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Biometric Authentication?</DialogTitle>
            <DialogDescription>
              This will remove your biometric credentials from this device. You'll need to sign in with your password and set up biometrics again if you want to use this feature.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRemoveDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveBiometric}>
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
