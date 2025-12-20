import { useState } from 'react';
import { Trash2, AlertTriangle, Loader2, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export function AccountDeletion() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmationStep, setConfirmationStep] = useState(1);
  const [confirmText, setConfirmText] = useState('');
  const [understandChecked, setUnderstandChecked] = useState(false);
  const [dataChecked, setDataChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const resetDialog = () => {
    setConfirmationStep(1);
    setConfirmText('');
    setUnderstandChecked(false);
    setDataChecked(false);
    setDeleted(false);
  };

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      resetDialog();
    }
  };

  const handleProceedToStep2 = () => {
    if (understandChecked && dataChecked) {
      setConfirmationStep(2);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE MY ACCOUNT') {
      toast({
        title: 'Confirmation Required',
        description: 'Please type "DELETE MY ACCOUNT" exactly to confirm',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Call edge function to delete all user data
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { error } = await supabase.functions.invoke('delete-account', {
        body: { confirmation: confirmText },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setDeleted(true);
      
      toast({
        title: 'Account Deleted',
        description: 'Your account and all associated data have been permanently deleted',
      });

      // Sign out after a short delay
      setTimeout(async () => {
        await signOut();
      }, 2000);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete account. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <Trash2 className="h-5 w-5" />
          Delete Account
        </CardTitle>
        <CardDescription>
          Permanently delete your account and all associated data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Danger Zone</AlertTitle>
          <AlertDescription>
            Once you delete your account, there is no going back. All your data including 
            scripts, predictions, series, and settings will be permanently removed.
          </AlertDescription>
        </Alert>

        <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete My Account
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            {deleted ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Account Deleted</h3>
                <p className="text-muted-foreground">
                  Your account has been permanently deleted. You will be redirected shortly.
                </p>
              </div>
            ) : confirmationStep === 1 ? (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Confirm Account Deletion
                  </DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. Please read carefully.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  <div className="space-y-4 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">
                      The following data will be permanently deleted:
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Your profile and account settings</li>
                      <li>All scripts and their version history</li>
                      <li>All predictions and analytics data</li>
                      <li>All series and episodes</li>
                      <li>Video projects and assets</li>
                      <li>A/B tests and results</li>
                      <li>Notification preferences</li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="understand"
                        checked={understandChecked}
                        onCheckedChange={(checked) => setUnderstandChecked(checked === true)}
                      />
                      <Label htmlFor="understand" className="text-sm font-normal leading-relaxed cursor-pointer">
                        I understand that this action is permanent and cannot be reversed
                      </Label>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="data"
                        checked={dataChecked}
                        onCheckedChange={(checked) => setDataChecked(checked === true)}
                      />
                      <Label htmlFor="data" className="text-sm font-normal leading-relaxed cursor-pointer">
                        I understand that all my data will be permanently deleted
                      </Label>
                    </div>
                  </div>

                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleProceedToStep2}
                    disabled={!understandChecked || !dataChecked}
                  >
                    Continue to Final Confirmation
                  </Button>
                </div>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-destructive">
                    <AlertTriangle className="h-5 w-5" />
                    Final Confirmation
                  </DialogTitle>
                  <DialogDescription>
                    This is your last chance to cancel.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="confirmText">
                      Type <span className="font-mono font-bold">DELETE MY ACCOUNT</span> to confirm:
                    </Label>
                    <Input
                      id="confirmText"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder="Type confirmation text"
                      className="font-mono"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setConfirmationStep(1)}
                      disabled={loading}
                    >
                      Go Back
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={handleDeleteAccount}
                      disabled={loading || confirmText !== 'DELETE MY ACCOUNT'}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Forever
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        <p className="text-xs text-muted-foreground">
          Account associated with: {user?.email}
        </p>
      </CardContent>
    </Card>
  );
}
