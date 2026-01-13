import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Key, RefreshCw, Clock, AlertTriangle, CheckCircle2, Copy } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ApiKey {
  name: string;
  lastRotated: string;
  daysUntilExpiry: number;
  status: 'active' | 'expiring' | 'expired';
}

export const ApiKeyRotation = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [showNewKey, setShowNewKey] = useState(false);

  // Mock API keys - in production, fetch from secure backend
  const [apiKeys] = useState<ApiKey[]>([
    { name: 'OPENAI_API_KEY', lastRotated: '2025-10-15', daysUntilExpiry: 45, status: 'active' },
    { name: 'ELEVENLABS_API_KEY', lastRotated: '2025-09-20', daysUntilExpiry: 20, status: 'expiring' },
    { name: 'STRIPE_SECRET_KEY', lastRotated: '2025-08-01', daysUntilExpiry: -5, status: 'expired' },
  ]);

  const rotateApiKey = async (keyName: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('rotate-api-key', {
        body: { keyName }
      });

      if (error) throw error;

      if (data?.newKey) {
        setNewKey(data.newKey);
        setShowNewKey(true);
        
        toast({
          title: 'API Key Rotated',
          description: `${keyName} has been successfully rotated. Save the new key securely.`,
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Rotation Failed',
        description: 'Failed to rotate API key. This feature requires backend implementation.',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'API key copied to clipboard',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'expiring': return 'default';
      case 'expired': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle2 className="h-4 w-4 text-success" />;
      case 'expiring': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'expired': return <AlertTriangle className="h-4 w-4 text-error" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>API Key Management</CardTitle>
          <CardDescription>
            Rotate API keys regularly to maintain security. Keys older than 90 days should be rotated.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {apiKeys.map((key) => (
            <div
              key={key.name}
              className="flex items-center justify-between p-4 border rounded-lg bg-card-elevated"
            >
              <div className="flex items-center gap-4">
                <Key className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{key.name}</p>
                    <Badge variant={getStatusColor(key.status)}>
                      {key.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Clock className="h-3 w-3" />
                    <span>Last rotated: {new Date(key.lastRotated).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>
                      {key.daysUntilExpiry > 0
                        ? `Expires in ${key.daysUntilExpiry} days`
                        : `Expired ${Math.abs(key.daysUntilExpiry)} days ago`}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(key.status)}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="outline" disabled={loading}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Rotate
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Rotate API Key?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will generate a new {key.name} and invalidate the old key.
                        Make sure to update all services using this key immediately.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => rotateApiKey(key.name)}>
                        Rotate Key
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Best Practices Card */}
      <Card>
        <CardHeader>
          <CardTitle>API Key Security Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
              <span>Rotate keys every 90 days or when compromised</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
              <span>Never commit API keys to version control</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
              <span>Use environment variables and Supabase secrets</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
              <span>Monitor API key usage for anomalies</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-success mt-0.5" />
              <span>Implement rate limiting on all API endpoints</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* New Key Display Dialog */}
      <Dialog open={showNewKey} onOpenChange={setShowNewKey}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New API Key Generated</DialogTitle>
            <DialogDescription>
              Save this key securely. It will not be shown again.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>New API Key</Label>
              <div className="flex gap-2">
                <Input
                  value={newKey}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => copyToClipboard(newKey)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
              <p className="text-sm text-warning-foreground">
                <AlertTriangle className="inline h-4 w-4 mr-2" />
                Update all services using this key immediately to prevent disruptions.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
