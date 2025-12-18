import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { GitBranch, Plus, ChevronDown, Merge, Check, Loader2 } from "lucide-react";
import { CreateBranchModal } from "./CreateBranchModal";
import { MergeBranchModal } from "./MergeBranchModal";

interface Branch {
  id: string;
  branch_name: string;
  is_active: boolean;
  created_at: string;
  merged_at: string | null;
}

interface BranchSelectorProps {
  scriptId: string;
  currentBranchId: string | null;
  onBranchChange: (branchId: string) => void;
}

export const BranchSelector = ({ scriptId, currentBranchId, onBranchChange }: BranchSelectorProps) => {
  const { toast } = useToast();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [mergeOpen, setMergeOpen] = useState(false);
  const [selectedBranchForMerge, setSelectedBranchForMerge] = useState<Branch | null>(null);

  useEffect(() => {
    if (scriptId) {
      fetchBranches();
    }
  }, [scriptId]);

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase
        .from('script_branches')
        .select('id, branch_name, is_active, created_at, merged_at')
        .eq('script_id', scriptId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setBranches(data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchBranch = async (branchId: string) => {
    if (branchId === currentBranchId) return;
    
    setIsSwitching(true);
    try {
      const { error } = await supabase.functions.invoke('switch-branch', {
        body: { scriptId, branchId }
      });

      if (error) throw error;
      
      onBranchChange(branchId);
      toast({
        title: "Branch Switched",
        description: `Now working on ${branches.find(b => b.id === branchId)?.branch_name || 'branch'}`,
      });
    } catch (error: any) {
      console.error('Error switching branch:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to switch branch",
        variant: "destructive",
      });
    } finally {
      setIsSwitching(false);
    }
  };

  const handleMerge = (branch: Branch) => {
    setSelectedBranchForMerge(branch);
    setMergeOpen(true);
  };

  const currentBranch = branches.find(b => b.id === currentBranchId) || branches[0];

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Loading...
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isSwitching}>
            {isSwitching ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <GitBranch className="w-4 h-4 mr-2" />
            )}
            {currentBranch?.branch_name || 'main'}
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {branches.map((branch) => (
            <DropdownMenuItem
              key={branch.id}
              className="flex justify-between items-center"
              onClick={() => handleSwitchBranch(branch.id)}
            >
              <span className="flex items-center gap-2">
                <GitBranch className="w-4 h-4" />
                {branch.branch_name}
                {branch.merged_at && (
                  <Badge variant="outline" className="text-xs">merged</Badge>
                )}
              </span>
              {branch.id === currentBranchId && (
                <Check className="w-4 h-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setCreateOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create New Branch
          </DropdownMenuItem>
          
          {currentBranch && currentBranch.branch_name !== 'main' && !currentBranch.merged_at && (
            <DropdownMenuItem onClick={() => handleMerge(currentBranch)}>
              <Merge className="w-4 h-4 mr-2" />
              Merge to Main
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create Branch Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Branch</DialogTitle>
          </DialogHeader>
          <CreateBranchModal 
            scriptId={scriptId}
            onComplete={() => {
              setCreateOpen(false);
              fetchBranches();
            }}
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Merge Branch Modal */}
      <Dialog open={mergeOpen} onOpenChange={setMergeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Merge Branch</DialogTitle>
          </DialogHeader>
          {selectedBranchForMerge && (
            <MergeBranchModal 
              scriptId={scriptId}
              branch={selectedBranchForMerge}
              onComplete={() => {
                setMergeOpen(false);
                setSelectedBranchForMerge(null);
                fetchBranches();
              }}
              onCancel={() => {
                setMergeOpen(false);
                setSelectedBranchForMerge(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
