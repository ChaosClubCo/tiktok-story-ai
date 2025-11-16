import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Clock, Eye, RotateCcw, Trash2, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

interface ScriptVersion {
  id: string;
  version_number: number;
  title: string;
  content: string;
  change_description: string | null;
  created_at: string;
  viral_score: number | null;
  niche: string | null;
  length: string | null;
  tone: string | null;
}

interface ScriptVersionHistoryProps {
  scriptId: string;
  currentVersion: number;
  onRestore: (version: ScriptVersion) => void;
}

export const ScriptVersionHistory = ({ scriptId, currentVersion, onRestore }: ScriptVersionHistoryProps) => {
  const [versions, setVersions] = useState<ScriptVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<ScriptVersion | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchVersions();
  }, [scriptId]);

  const fetchVersions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('script_versions')
        .select('*')
        .eq('script_id', scriptId)
        .order('version_number', { ascending: false });

      if (error) throw error;
      setVersions(data || []);
    } catch (error) {
      console.error('Error fetching versions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load version history',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleView = (version: ScriptVersion) => {
    setSelectedVersion(version);
    setViewModalOpen(true);
  };

  const handleRestore = async (version: ScriptVersion) => {
    if (version.version_number === currentVersion) {
      toast({
        title: 'Already Current',
        description: 'This is already the current version',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('scripts')
        .update({
          content: version.content,
          title: version.title,
          niche: version.niche,
          length: version.length,
          tone: version.tone,
        })
        .eq('id', scriptId);

      if (error) throw error;

      toast({
        title: 'Version Restored',
        description: `Restored to version ${version.version_number}`,
      });

      onRestore(version);
    } catch (error) {
      console.error('Error restoring version:', error);
      toast({
        title: 'Error',
        description: 'Failed to restore version',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (versionId: string, versionNumber: number) => {
    if (versionNumber === currentVersion) {
      toast({
        title: 'Cannot Delete',
        description: 'Cannot delete the current version',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('script_versions')
        .delete()
        .eq('id', versionId);

      if (error) throw error;

      toast({
        title: 'Version Deleted',
        description: `Version ${versionNumber} deleted successfully`,
      });

      fetchVersions();
    } catch (error) {
      console.error('Error deleting version:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete version',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (versions.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No version history yet</p>
        <p className="text-sm mt-2">Versions will be created when you update your script</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Version History</h3>
        <Badge variant="secondary">{versions.length} versions</Badge>
      </div>

      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-3">
          {versions.map((version) => (
            <Card key={version.id} className={version.version_number === currentVersion ? 'border-primary' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base">
                        Version {version.version_number}
                      </CardTitle>
                      {version.version_number === currentVersion && (
                        <Badge variant="default">Current</Badge>
                      )}
                      {version.viral_score && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          {version.viral_score}/100
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(version.created_at), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {version.change_description && (
                  <p className="text-sm text-foreground">{version.change_description}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleView(version)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  {version.version_number !== currentVersion && (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleRestore(version)}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Restore
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(version.id, version.version_number)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Version {selectedVersion?.version_number} - {selectedVersion?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedVersion && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Niche:</span>{' '}
                  <span className="font-medium">{selectedVersion.niche || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Length:</span>{' '}
                  <span className="font-medium">{selectedVersion.length || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Tone:</span>{' '}
                  <span className="font-medium">{selectedVersion.tone || 'N/A'}</span>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Content:</h4>
                <ScrollArea className="h-[400px] rounded-md border p-4">
                  <div className="whitespace-pre-wrap">{selectedVersion.content}</div>
                </ScrollArea>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};