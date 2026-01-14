import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Sparkles } from "lucide-react";

interface Script {
  id: string;
  title: string;
  content: string;
}

interface Variant {
  name: string;
  content: string;
}

interface ABTestWizardProps {
  onComplete: () => void;
  onCancel: () => void;
}

export const ABTestWizard = ({ onComplete, onCancel }: ABTestWizardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [selectedScriptId, setSelectedScriptId] = useState<string>("");
  const [testName, setTestName] = useState("");
  const [hypothesis, setHypothesis] = useState("");
  const [variants, setVariants] = useState<Variant[]>([
    { name: "Variant A", content: "" },
    { name: "Variant B", content: "" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingScripts, setIsLoadingScripts] = useState(true);

  useEffect(() => {
    fetchScripts();
  }, []);

  const fetchScripts = async () => {
    try {
      const { data, error } = await supabase
        .from('scripts')
        .select('id, title, content')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScripts(data || []);
    } catch (error) {
      console.error('Error fetching scripts:', error);
    } finally {
      setIsLoadingScripts(false);
    }
  };

  const handleScriptSelect = (scriptId: string) => {
    setSelectedScriptId(scriptId);
    const script = scripts.find(s => s.id === scriptId);
    if (script) {
      try {
        const parsed = JSON.parse(script.content);
        setVariants([
          { name: "Original", content: script.content },
          { name: "Variant B", content: "" }
        ]);
        setTestName(`${script.title} Test`);
      } catch {
        setVariants([
          { name: "Original", content: script.content },
          { name: "Variant B", content: "" }
        ]);
      }
    }
  };

  const addVariant = () => {
    if (variants.length >= 4) {
      toast({
        title: "Maximum Variants",
        description: "You can have up to 4 variants per test",
        variant: "destructive",
      });
      return;
    }
    setVariants([...variants, { name: `Variant ${String.fromCharCode(65 + variants.length)}`, content: "" }]);
  };

  const removeVariant = (index: number) => {
    if (variants.length <= 2) {
      toast({
        title: "Minimum Variants",
        description: "You need at least 2 variants for an A/B test",
        variant: "destructive",
      });
      return;
    }
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof Variant, value: string) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const handleSubmit = async () => {
    if (!selectedScriptId || !testName || variants.some(v => !v.content.trim())) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('run-ab-test', {
        body: {
          scriptId: selectedScriptId,
          testName,
          hypothesis,
          variants: variants.map(v => ({ name: v.name, content: v.content }))
        }
      });

      if (error) throw error;
      onComplete();
    } catch (error: any) {
      console.error('Error creating test:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create A/B test",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingScripts) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Script Selection */}
      <div className="space-y-2">
        <Label>Select Script to Test</Label>
        <Select value={selectedScriptId} onValueChange={handleScriptSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Choose a script..." />
          </SelectTrigger>
          <SelectContent>
            {scripts.map(script => (
              <SelectItem key={script.id} value={script.id}>
                {script.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Test Details */}
      <div className="space-y-2">
        <Label>Test Name *</Label>
        <Input
          value={testName}
          onChange={(e) => setTestName(e.target.value)}
          placeholder="e.g., Hook Variation Test"
        />
      </div>

      <div className="space-y-2">
        <Label>Hypothesis (Optional)</Label>
        <Textarea
          value={hypothesis}
          onChange={(e) => setHypothesis(e.target.value)}
          placeholder="What do you expect to learn from this test?"
          rows={2}
        />
      </div>

      {/* Variants */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Label>Variants ({variants.length}/4)</Label>
          <Button type="button" variant="outline" size="sm" onClick={addVariant}>
            <Plus className="w-4 h-4 mr-1" />
            Add Variant
          </Button>
        </div>

        {variants.map((variant, index) => (
          <Card key={index} className="bg-muted/30">
            <CardContent className="pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <Input
                  value={variant.name}
                  onChange={(e) => updateVariant(index, 'name', e.target.value)}
                  className="w-40 font-medium"
                />
                {variants.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVariant(index)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                )}
              </div>
              <Textarea
                value={variant.content}
                onChange={(e) => updateVariant(index, 'content', e.target.value)}
                placeholder="Enter variant content..."
                rows={4}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Start Test
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
