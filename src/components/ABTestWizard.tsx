import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Variant {
  name: string;
  content: string;
  versionId?: string;
  branchId?: string;
}

interface ABTestWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scriptId: string;
  onTestCreated: () => void;
}

export const ABTestWizard = ({ open, onOpenChange, scriptId, onTestCreated }: ABTestWizardProps) => {
  const [step, setStep] = useState(1);
  const [testName, setTestName] = useState('');
  const [hypothesis, setHypothesis] = useState('');
  const [variants, setVariants] = useState<Variant[]>([
    { name: 'Control', content: '' },
    { name: 'Variant A', content: '' }
  ]);
  const [isCreating, setIsCreating] = useState(false);

  const handleAddVariant = () => {
    const nextLetter = String.fromCharCode(65 + variants.length - 1);
    setVariants([...variants, { name: `Variant ${nextLetter}`, content: '' }]);
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length > 2) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const handleUpdateVariant = (index: number, field: keyof Variant, value: string) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const handleCreateTest = async () => {
    if (!testName.trim()) {
      toast.error('Please enter a test name');
      return;
    }

    if (variants.some(v => !v.content.trim())) {
      toast.error('All variants must have content');
      return;
    }

    setIsCreating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Call edge function to create test and analyze variants
      const { data, error } = await supabase.functions.invoke('run-ab-test', {
        body: {
          scriptId,
          testName,
          hypothesis,
          variants
        }
      });

      if (error) throw error;

      toast.success('A/B test created successfully! Analyzing variants...');
      onTestCreated();
      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      console.error('Error creating test:', error);
      toast.error(error.message || 'Failed to create A/B test');
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setTestName('');
    setHypothesis('');
    setVariants([
      { name: 'Control', content: '' },
      { name: 'Variant A', content: '' }
    ]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create A/B Test</DialogTitle>
        </DialogHeader>

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="testName">Test Name</Label>
              <Input
                id="testName"
                placeholder="e.g., Hook Effectiveness Test"
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="hypothesis">Hypothesis (Optional)</Label>
              <Textarea
                id="hypothesis"
                placeholder="What are you testing? e.g., A question hook will outperform a statement hook"
                value={hypothesis}
                onChange={(e) => setHypothesis(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setStep(2)}>
                Next: Add Variants
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Test Variants</h3>
                <p className="text-sm text-muted-foreground">Add 2-5 variants to test</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddVariant}
                disabled={variants.length >= 5}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Variant
              </Button>
            </div>

            <div className="space-y-3">
              {variants.map((variant, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Input
                        placeholder="Variant name"
                        value={variant.name}
                        onChange={(e) => handleUpdateVariant(index, 'name', e.target.value)}
                        className="max-w-xs"
                      />
                      {index > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveVariant(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <Textarea
                      placeholder="Enter script content for this variant..."
                      value={variant.content}
                      onChange={(e) => handleUpdateVariant(index, 'content', e.target.value)}
                      rows={4}
                    />
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={handleCreateTest} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Test...
                  </>
                ) : (
                  'Create & Analyze Test'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
