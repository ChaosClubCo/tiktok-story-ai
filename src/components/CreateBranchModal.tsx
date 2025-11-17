import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface CreateBranchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scriptId: string;
  onBranchCreated: () => void;
}

export const CreateBranchModal = ({ open, onOpenChange, scriptId, onBranchCreated }: CreateBranchModalProps) => {
  const [branchName, setBranchName] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const generateSuggestedName = () => {
    const suggestions = [
      'experiment-1',
      'darker-tone',
      'comedy-version',
      'shorter-hook',
      'alternative-ending',
      'revised-structure'
    ];
    return suggestions[Math.floor(Math.random() * suggestions.length)];
  };

  const handleCreate = async () => {
    if (!branchName.trim()) {
      toast.error('Please enter a branch name');
      return;
    }

    setIsCreating(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-branch', {
        body: {
          scriptId,
          branchName: branchName.trim(),
          description
        }
      });

      if (error) throw error;

      toast.success(`Branch "${branchName}" created successfully`);
      onBranchCreated();
      onOpenChange(false);
      setBranchName('');
      setDescription('');
    } catch (error: any) {
      console.error('Error creating branch:', error);
      toast.error(error.message || 'Failed to create branch');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Branch</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="branchName">Branch Name</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="branchName"
                placeholder="e.g., darker-ending"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => setBranchName(generateSuggestedName())}
              >
                Suggest
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Use lowercase with hyphens (e.g., my-experiment)
            </p>
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="What are you testing in this branch?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Branch'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
