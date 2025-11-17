import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { GitBranch, Check, Plus, Trash2, GitMerge } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CreateBranchModal } from './CreateBranchModal';
import { MergeBranchModal } from './MergeBranchModal';

interface Branch {
  id: string;
  branch_name: string;
  created_at: string;
  is_active: boolean;
}

interface BranchSelectorProps {
  scriptId: string;
  currentBranchId?: string;
  onBranchChange: (branchId: string) => void;
}

export const BranchSelector = ({ scriptId, currentBranchId, onBranchChange }: BranchSelectorProps) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [mergeModalOpen, setMergeModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  useEffect(() => {
    fetchBranches();
  }, [scriptId]);

  const fetchBranches = async () => {
    try {
      const { data, error } = await supabase
        .from('script_branches')
        .select('*')
        .eq('script_id', scriptId)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setBranches(data || []);
    } catch (error: any) {
      console.error('Error fetching branches:', error);
    }
  };

  const handleSwitchBranch = async (branchId: string) => {
    try {
      const { error } = await supabase.functions.invoke('switch-branch', {
        body: { scriptId, branchId }
      });

      if (error) throw error;

      onBranchChange(branchId);
      toast.success('Switched to branch successfully');
    } catch (error: any) {
      console.error('Error switching branch:', error);
      toast.error('Failed to switch branch');
    }
  };

  const handleDeleteBranch = async (branchId: string, branchName: string) => {
    if (branchName === 'main') {
      toast.error('Cannot delete main branch');
      return;
    }

    if (!confirm(`Are you sure you want to delete branch "${branchName}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('script_branches')
        .delete()
        .eq('id', branchId);

      if (error) throw error;

      toast.success('Branch deleted successfully');
      fetchBranches();
      
      if (branchId === currentBranchId) {
        const mainBranch = branches.find(b => b.branch_name === 'main');
        if (mainBranch) handleSwitchBranch(mainBranch.id);
      }
    } catch (error: any) {
      console.error('Error deleting branch:', error);
      toast.error('Failed to delete branch');
    }
  };

  const currentBranch = branches.find(b => b.id === currentBranchId) || branches.find(b => b.branch_name === 'main');

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <GitBranch className="w-4 h-4 mr-2" />
            {currentBranch?.branch_name || 'Select Branch'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <div className="px-2 py-1.5 text-sm font-semibold">Branches</div>
          <DropdownMenuSeparator />
          
          {branches.map((branch) => (
            <DropdownMenuItem
              key={branch.id}
              onClick={() => handleSwitchBranch(branch.id)}
              className="flex items-center justify-between"
            >
              <span className="flex items-center">
                {branch.id === currentBranchId && (
                  <Check className="w-4 h-4 mr-2 text-primary" />
                )}
                <span className={branch.id === currentBranchId ? 'font-semibold' : ''}>
                  {branch.branch_name}
                </span>
              </span>
              
              <div className="flex items-center gap-1">
                {branch.branch_name !== 'main' && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBranch(branch);
                        setMergeModalOpen(true);
                      }}
                    >
                      <GitMerge className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBranch(branch.id, branch.branch_name);
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </>
                )}
              </div>
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create New Branch
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateBranchModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        scriptId={scriptId}
        onBranchCreated={fetchBranches}
      />

      {selectedBranch && (
        <MergeBranchModal
          open={mergeModalOpen}
          onOpenChange={setMergeModalOpen}
          branch={selectedBranch}
          scriptId={scriptId}
          onMergeComplete={fetchBranches}
        />
      )}
    </>
  );
};
