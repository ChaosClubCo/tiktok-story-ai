import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, GitBranch } from "lucide-react";

interface CreateBranchModalProps {
  scriptId: string;
  onComplete: () => void;
  onCancel: () => void;
}

export const CreateBranchModal = ({ scriptId, onComplete, onCancel }: CreateBranchModalProps) => {
  const { toast } = useToast();
  const [branchName, setBranchName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!branchName.trim()) {
      toast({
        title: "Branch Name Required",
        description: "Please enter a name for the branch",
        variant: "destructive",
      });
      return;
    }

    // Validate branch name (alphanumeric, hyphens, underscores only)
    const validName = /^[a-zA-Z0-9_-]+$/.test(branchName);
    if (!validName) {
      toast({
        title: "Invalid Branch Name",
        description: "Branch name can only contain letters, numbers, hyphens, and underscores",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const { error } = await supabase.functions.invoke('create-branch', {
        body: { 
          scriptId, 
          branchName: branchName.trim(),
          description: description.trim() || null
        }
      });

      if (error) throw error;
      
      toast({
        title: "Branch Created",
        description: `New branch "${branchName}" created successfully`,
      });
      onComplete();
    } catch (error: any) {
      console.error('Error creating branch:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create branch",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="branchName">Branch Name *</Label>
        <Input
          id="branchName"
          value={branchName}
          onChange={(e) => setBranchName(e.target.value)}
          placeholder="e.g., experiment-new-hook"
          disabled={isCreating}
        />
        <p className="text-xs text-muted-foreground">
          Use lowercase letters, numbers, hyphens, or underscores
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What are you experimenting with?"
          rows={2}
          disabled={isCreating}
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onCancel} disabled={isCreating}>
          Cancel
        </Button>
        <Button onClick={handleCreate} disabled={isCreating}>
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <GitBranch className="w-4 h-4 mr-2" />
              Create Branch
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
