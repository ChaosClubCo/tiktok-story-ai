import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Clock, Eye, RotateCcw, Trash2, TrendingUp, GitCompare, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { format } from 'date-fns';
import { computeWordDiff, computeMetricsDelta, type DiffSegment } from '@/utils/diffUtils';

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
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonVersions, setComparisonVersions] = useState<[ScriptVersion | null, ScriptVersion | null]>([null, null]);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
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

  const handleCompareClick = () => {
    setComparisonMode(true);
    setComparisonVersions([null, null]);
  };

  const handleVersionSelect = (version: ScriptVersion) => {
    if (!comparisonMode) return;

    const [first, second] = comparisonVersions;
    if (!first) {
      setComparisonVersions([version, null]);
    } else if (!second && version.id !== first.id) {
      setComparisonVersions([first, version]);
    }
  };

  const handleViewComparison = () => {
    const [first, second] = comparisonVersions;
    if (first && second) {
      setCompareModalOpen(true);
    }
  };

  const handleCancelComparison = () => {
    setComparisonMode(false);
    setComparisonVersions([null, null]);
  };

  const renderDiff = (segments: DiffSegment[]) => {
    return segments.map((segment, idx) => {
      if (segment.type === 'add') {
        return <span key={idx} className="bg-green-500/20 text-green-700 dark:text-green-300">{segment.text}</span>;
      } else if (segment.type === 'remove') {
        return <span key={idx} className="bg-red-500/20 text-red-700 dark:text-red-300 line-through">{segment.text}</span>;
      } else {
        return <span key={idx}>{segment.text}</span>;
      }
    });
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

  const [first, second] = comparisonVersions;
  const contentDiff = first && second ? computeWordDiff(first.content, second.content) : [];
  const viralDelta = first && second && first.viral_score && second.viral_score
    ? computeMetricsDelta(first.viral_score, second.viral_score)
    : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Version History</h3>
        <div className="flex gap-2 items-center">
          <Badge variant="secondary">{versions.length} versions</Badge>
          {!comparisonMode ? (
            <Button size="sm" variant="outline" onClick={handleCompareClick}>
              <GitCompare className="w-4 h-4 mr-2" />
              Compare
            </Button>
          ) : (
            <>
              <Button size="sm" variant="default" onClick={handleViewComparison} disabled={!first || !second}>
                View Comparison
              </Button>
              <Button size="sm" variant="ghost" onClick={handleCancelComparison}>
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      {comparisonMode && (
        <div className="p-4 bg-muted/50 rounded-lg border border-border">
          <p className="text-sm font-medium mb-2">Select two versions to compare</p>
          <div className="flex gap-2">
            {first && (
              <Badge variant="default">Version {first.version_number} selected</Badge>
            )}
            {second && (
              <Badge variant="default">Version {second.version_number} selected</Badge>
            )}
            {!first && !second && (
              <p className="text-sm text-muted-foreground">Select first version</p>
            )}
            {first && !second && (
              <p className="text-sm text-muted-foreground">Select second version</p>
            )}
          </div>
        </div>
      )}

      <ScrollArea className="h-[500px] pr-4">
        <div className="space-y-3">
          {versions.map((version) => {
            const isSelected = comparisonMode && (version.id === first?.id || version.id === second?.id);
            const isFirstSelected = version.id === first?.id;
            const isSecondSelected = version.id === second?.id;
            
            return (
            <Card 
              key={version.id} 
              className={`transition-all ${
                version.version_number === currentVersion ? 'border-primary' : ''
              } ${isSelected ? (isFirstSelected ? 'border-blue-500 border-2' : 'border-green-500 border-2') : ''} ${
                comparisonMode ? 'cursor-pointer hover:border-primary' : ''
              }`}
              onClick={() => comparisonMode && handleVersionSelect(version)}
            >
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
           );
          })}
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

        <Dialog open={compareModalOpen} onOpenChange={setCompareModalOpen}>
          <DialogContent className="max-w-6xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>
                Compare Version {first?.version_number} vs Version {second?.version_number}
              </DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="content" className="w-full">
              <TabsList>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="metrics">Metrics</TabsTrigger>
              </TabsList>

              <TabsContent value="content" className="space-y-4">
                <ScrollArea className="h-[60vh]">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Badge variant="default">Version {first?.version_number}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {first && format(new Date(first.created_at), 'MMM d, yyyy')}
                        </span>
                      </h4>
                      <div className="text-sm space-y-1">
                        <p><strong>Title:</strong> {first?.title}</p>
                        <p><strong>Niche:</strong> {first?.niche}</p>
                        {first?.viral_score && <p><strong>Score:</strong> {first.viral_score}/100</p>}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Badge variant="default">Version {second?.version_number}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {second && format(new Date(second.created_at), 'MMM d, yyyy')}
                        </span>
                      </h4>
                      <div className="text-sm space-y-1">
                        <p><strong>Title:</strong> {second?.title}</p>
                        <p><strong>Niche:</strong> {second?.niche}</p>
                        {second?.viral_score && <p><strong>Score:</strong> {second.viral_score}/100</p>}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
                    <h4 className="font-semibold mb-2">Content Differences</h4>
                    <div className="text-sm leading-relaxed whitespace-pre-wrap">
                      {renderDiff(contentDiff)}
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="metrics" className="space-y-4">
                {first?.viral_score && second?.viral_score ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Version {first.version_number}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Viral Score:</span>
                            <Badge>{first.viral_score}/100</Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Version {second.version_number}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Viral Score:</span>
                            <Badge>{second.viral_score}/100</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {viralDelta && (
                      <Card className="bg-muted/30">
                        <CardHeader>
                          <CardTitle className="text-base">Performance Change</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2 text-lg font-semibold">
                            {viralDelta.direction === 'up' && (
                              <>
                                <ArrowUpRight className="w-5 h-5 text-green-500" />
                                <span className="text-green-500">{viralDelta.percentChange}</span>
                              </>
                            )}
                            {viralDelta.direction === 'down' && (
                              <>
                                <ArrowDownRight className="w-5 h-5 text-red-500" />
                                <span className="text-red-500">{viralDelta.percentChange}</span>
                              </>
                            )}
                            {viralDelta.direction === 'same' && (
                              <>
                                <Minus className="w-5 h-5 text-muted-foreground" />
                                <span className="text-muted-foreground">No change</span>
                              </>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            {viralDelta.delta > 0 ? '+' : ''}{viralDelta.delta} points
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : (
                  <div className="text-center p-8 text-muted-foreground">
                    <p>No metrics available for comparison</p>
                    <p className="text-sm mt-2">Run predictions on both versions to see metrics</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    );
  };