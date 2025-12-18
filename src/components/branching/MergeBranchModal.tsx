import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Merge, AlertTriangle } from "lucide-react";

interface Branch {
  id: string;
  branch_name: string;
}

interface MergeBranchModalProps {
  scriptId: string;
  branch: Branch;
  onComplete: () => void;
  onCancel: () => void;
}

export const MergeBranchModal = ({ scriptId, branch, onComplete, onCancel }: MergeBranchModalProps) => {
  const { toast } = useToast();
  const [strategy, setStrategy] = useState<'replace' | 'keep_main'>('replace');
  const [isMerging, setIsMerging] = useState(false);

  const handleMerge = async () => {
    setIsMerging(true);
    try {
      const { error } = await supabase.functions.invoke('merge-branch', {
        body: { 
          scriptId, 
          branchId: branch.id,
          strategy
        }
      });

      if (error) throw error;
      
      toast({
        title: "Branch Merged",
        description: `"${branch.branch_name}" has been merged into main`,
      });
      onComplete();
    } catch (error: any) {
      console.error('Error merging branch:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to merge branch",
        variant: "destructive",
      });
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className="space-y-4">
      <Alert>
        <AlertTriangle className="w-4 h-4" />
        <AlertDescription>
          You are about to merge <strong>"{branch.branch_name}"</strong> into <strong>main</strong>.
          This will update your primary script content.
        </AlertDescription>
      </Alert>

      <div className="space-y-3">
        <Label>Merge Strategy</Label>
        <RadioGroup value={strategy} onValueChange={(v) => setStrategy(v as typeof strategy)}>
          <div className="flex items-start space-x-3 p-3 rounded-lg border bg-muted/30">
            <RadioGroupItem value="replace" id="replace" />
            <div className="space-y-1">
              <Label htmlFor="replace" className="font-medium cursor-pointer">
                Replace main with branch
              </Label>
              <p className="text-sm text-muted-foreground">
                The branch content will become the new main content
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3 p-3 rounded-lg border bg-muted/30">
            <RadioGroupItem value="keep_main" id="keep_main" />
            <div className="space-y-1">
              <Label htmlFor="keep_main" className="font-medium cursor-pointer">
                Keep main, archive branch
              </Label>
              <p className="text-sm text-muted-foreground">
                Mark the branch as merged without changing main
              </p>
            </div>
          </div>
        </RadioGroup>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onCancel} disabled={isMerging}>
          Cancel
        </Button>
        <Button onClick={handleMerge} disabled={isMerging}>
          {isMerging ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Merging...
            </>
          ) : (
            <>
              <Merge className="w-4 h-4 mr-2" />
              Merge Branch
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
