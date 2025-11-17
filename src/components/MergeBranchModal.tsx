import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { computeWordDiff } from '@/utils/diffUtils';

interface Branch {
  id: string;
  branch_name: string;
  current_version_content: string;
}

interface MergeBranchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch: Branch;
  scriptId: string;
  onMergeComplete: () => void;
}

export const MergeBranchModal = ({ open, onOpenChange, branch, scriptId, onMergeComplete }: MergeBranchModalProps) => {
  const [isMerging, setIsMerging] = useState(false);
  const [mainContent, setMainContent] = useState('');

  const handleMerge = async () => {
    setIsMerging(true);

    try {
      const { data, error } = await supabase.functions.invoke('merge-branch', {
        body: {
          branchId: branch.id,
          scriptId
        }
      });

      if (error) throw error;

      toast.success(`Branch "${branch.branch_name}" merged successfully`);
      onMergeComplete();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error merging branch:', error);
      toast.error(error.message || 'Failed to merge branch');
    } finally {
      setIsMerging(false);
    }
  };

  const diff = computeWordDiff(mainContent, branch.current_version_content);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Merge Branch: {branch.branch_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <p className="text-sm">
              This will create a new version in the main branch with the content from "{branch.branch_name}".
              The branch will be marked as merged but will remain accessible.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline">Main Branch</Badge>
              </div>
              <div className="p-4 bg-background-elevated rounded-lg border border-border max-h-96 overflow-y-auto">
                <p className="text-sm text-muted-foreground">
                  {mainContent || 'Loading main branch content...'}
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="default">{branch.branch_name}</Badge>
              </div>
              <div className="p-4 bg-background-elevated rounded-lg border border-border max-h-96 overflow-y-auto">
                <p className="text-sm">
                  {branch.current_version_content}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Changes Preview</h4>
            <div className="p-4 bg-background-elevated rounded-lg border border-border max-h-48 overflow-y-auto">
              <div className="text-sm space-y-1">
                {diff.map((segment, idx) => {
                  if (segment.type === 'add') {
                    return (
                      <span key={idx} className="bg-green-500/20 text-green-600 dark:text-green-400">
                        {segment.text}
                      </span>
                    );
                  } else if (segment.type === 'remove') {
                    return (
                      <span key={idx} className="bg-red-500/20 text-red-600 dark:text-red-400 line-through">
                        {segment.text}
                      </span>
                    );
                  }
                  return <span key={idx}>{segment.text}</span>;
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleMerge} disabled={isMerging}>
              {isMerging ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Merging...
                </>
              ) : (
                'Merge to Main'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
