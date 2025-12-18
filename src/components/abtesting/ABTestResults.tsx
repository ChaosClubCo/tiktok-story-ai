import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Trophy, TrendingUp, Heart, Zap, Target, Loader2, CheckCircle } from "lucide-react";

interface Variant {
  id: string;
  variant_name: string;
  content: string;
  viral_score: number | null;
  engagement_score: number | null;
  shareability_score: number | null;
  hook_strength: number | null;
  emotional_impact: number | null;
  trend_alignment: number | null;
  user_preference_votes: number | null;
}

interface ABTestResultsProps {
  testId: string;
  onComplete: () => void;
}

export const ABTestResults = ({ testId, onComplete }: ABTestResultsProps) => {
  const { toast } = useToast();
  const [variants, setVariants] = useState<Variant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleting, setIsCompleting] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null);

  useEffect(() => {
    fetchVariants();
  }, [testId]);

  const fetchVariants = async () => {
    try {
      const { data, error } = await supabase
        .from('ab_test_variants')
        .select('*')
        .eq('test_id', testId)
        .order('viral_score', { ascending: false });

      if (error) throw error;
      setVariants(data || []);
    } catch (error) {
      console.error('Error fetching variants:', error);
      toast({
        title: "Error",
        description: "Failed to load test results",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteTest = async () => {
    if (!selectedWinner) {
      toast({
        title: "Select a Winner",
        description: "Please select the winning variant before completing the test",
        variant: "destructive",
      });
      return;
    }

    setIsCompleting(true);
    try {
      const { error } = await supabase.functions.invoke('complete-ab-test', {
        body: { testId, winnerId: selectedWinner }
      });

      if (error) throw error;
      
      toast({
        title: "Test Completed",
        description: "Winner has been recorded. You can apply learnings to future scripts.",
      });
      onComplete();
    } catch (error: any) {
      console.error('Error completing test:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to complete test",
        variant: "destructive",
      });
    } finally {
      setIsCompleting(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-muted-foreground";
  };

  const getLeader = () => {
    if (variants.length === 0) return null;
    return variants.reduce((best, v) => 
      (v.viral_score || 0) > (best.viral_score || 0) ? v : best
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const leader = getLeader();

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-muted/30">
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-primary">{variants.length}</p>
            <p className="text-sm text-muted-foreground">Variants Tested</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/30">
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-success">{leader?.viral_score || 0}</p>
            <p className="text-sm text-muted-foreground">Highest Score</p>
          </CardContent>
        </Card>
        <Card className="bg-muted/30">
          <CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-info">
              {Math.round(variants.reduce((sum, v) => sum + (v.viral_score || 0), 0) / variants.length) || 0}
            </p>
            <p className="text-sm text-muted-foreground">Avg Score</p>
          </CardContent>
        </Card>
      </div>

      {/* Variant Comparison */}
      <div className="space-y-4">
        <h3 className="font-semibold">Variant Performance</h3>
        {variants.map((variant, index) => {
          const isLeader = variant.id === leader?.id;
          const isSelected = variant.id === selectedWinner;
          
          return (
            <Card 
              key={variant.id}
              className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : ''} ${isLeader ? 'bg-success/5 border-success/30' : 'bg-muted/20'}`}
              onClick={() => setSelectedWinner(variant.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base flex items-center gap-2">
                    {variant.variant_name}
                    {isLeader && (
                      <Badge className="bg-success/20 text-success border-success/30">
                        <Trophy className="w-3 h-3 mr-1" />
                        Leading
                      </Badge>
                    )}
                    {isSelected && (
                      <CheckCircle className="w-4 h-4 text-primary" />
                    )}
                  </CardTitle>
                  <span className={`text-2xl font-bold ${getScoreColor(variant.viral_score || 0)}`}>
                    {variant.viral_score || 0}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Score Bars */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> Hook</span>
                      <span>{variant.hook_strength || 0}</span>
                    </div>
                    <Progress value={variant.hook_strength || 0} className="h-1.5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> Emotion</span>
                      <span>{variant.emotional_impact || 0}</span>
                    </div>
                    <Progress value={variant.emotional_impact || 0} className="h-1.5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Engagement</span>
                      <span>{variant.engagement_score || 0}</span>
                    </div>
                    <Progress value={variant.engagement_score || 0} className="h-1.5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="flex items-center gap-1"><Target className="w-3 h-3" /> Shareability</span>
                      <span>{variant.shareability_score || 0}</span>
                    </div>
                    <Progress value={variant.shareability_score || 0} className="h-1.5" />
                  </div>
                </div>

                {/* Content Preview */}
                <div className="text-sm text-muted-foreground line-clamp-2 bg-background/50 p-2 rounded">
                  {variant.content.substring(0, 150)}...
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Complete Test */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onComplete}>
          Close
        </Button>
        <Button onClick={handleCompleteTest} disabled={!selectedWinner || isCompleting}>
          {isCompleting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Completing...
            </>
          ) : (
            <>
              <Trophy className="w-4 h-4 mr-2" />
              Complete Test & Declare Winner
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
