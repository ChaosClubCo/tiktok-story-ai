import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface HookVariationsProps {
  hooks: string[];
}

export const HookVariations = ({ hooks }: HookVariationsProps) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyHook = (hook: string, index: number) => {
    navigator.clipboard.writeText(hook);
    setCopiedIndex(index);
    toast.success("Hook copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!hooks || hooks.length === 0) return null;

  return (
    <Card elevated className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🎣 Hook Variations
          <Badge variant="secondary" className="ml-auto">
            A/B Test Ready
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {hooks.map((hook, index) => (
            <div
              key={index}
              className="p-4 rounded-lg bg-background-elevated border border-border hover:border-primary/50 transition-all group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <Badge variant="outline" className="mb-2 text-xs">
                    Hook {index + 1}
                  </Badge>
                  <p className="text-sm">{hook}</p>
                </div>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyHook(hook, index)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {copiedIndex === index ? (
                    <Check className="w-4 h-4 text-success" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-info/10 border border-info/20 rounded-lg">
          <p className="text-xs text-muted-foreground">
            💡 <strong>Pro Tip:</strong> Test different hooks across multiple posts to find what resonates best with your audience. Track which ones get the most engagement!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
