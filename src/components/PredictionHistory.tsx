import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target,
  Sparkles,
  Trash2,
  ChevronRight,
  Lightbulb
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface PredictionRecord {
  id: string;
  prediction_type: 'premise' | 'full_script';
  title: string;
  content: string;
  niche: string | null;
  viral_score: number;
  engagement_score: number;
  shareability_score: number;
  hook_strength: number;
  emotional_impact: number;
  conflict_clarity: number;
  pacing_quality: number;
  dialogue_quality: number;
  quotability: number;
  relatability: number;
  recommendations: any;
  strengths: any;
  weaknesses: any;
  created_at: string;
}

export const PredictionHistory = () => {
  const [predictions, setPredictions] = useState<PredictionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrediction, setSelectedPrediction] = useState<PredictionRecord | null>(null);
  const [filter, setFilter] = useState<'all' | 'premise' | 'full_script'>('all');

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      const { data, error } = await supabase
        .from('predictions_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPredictions((data || []) as PredictionRecord[]);
    } catch (error) {
      console.error('Error fetching predictions:', error);
      toast.error("Failed to load prediction history");
    } finally {
      setLoading(false);
    }
  };

  const deletePrediction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('predictions_history')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setPredictions(prev => prev.filter(p => p.id !== id));
      if (selectedPrediction?.id === id) {
        setSelectedPrediction(null);
      }
      toast.success("Prediction deleted");
    } catch (error) {
      console.error('Error deleting prediction:', error);
      toast.error("Failed to delete prediction");
    }
  };

  const getScoreTrend = (currentScore: number, predictions: PredictionRecord[], scoreKey: keyof PredictionRecord) => {
    if (predictions.length < 2) return null;
    
    const previousPredictions = predictions.slice(1);
    const avgPrevious = previousPredictions.reduce((sum, p) => sum + (p[scoreKey] as number), 0) / previousPredictions.length;
    const difference = currentScore - avgPrevious;
    
    return {
      direction: difference > 0 ? 'up' : difference < 0 ? 'down' : 'neutral',
      percentage: Math.abs((difference / avgPrevious) * 100).toFixed(1)
    };
  };

  const filteredPredictions = predictions.filter(p => 
    filter === 'all' || p.prediction_type === filter
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-success/10 border-success/20";
    if (score >= 60) return "bg-warning/10 border-warning/20";
    return "bg-destructive/10 border-destructive/20";
  };

  if (loading) {
    return (
      <Card className="bg-card-elevated border-border/50">
        <CardContent className="p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-muted-foreground mt-4">Loading your prediction history...</p>
        </CardContent>
      </Card>
    );
  }

  if (predictions.length === 0) {
    return (
      <Card className="bg-card-elevated border-border/50">
        <CardContent className="p-12 text-center">
          <Target className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Predictions Yet</h3>
          <p className="text-sm text-muted-foreground">
            Start analyzing scripts or premises to build your prediction history
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* History List */}
      <Card className="lg:col-span-1 bg-card-elevated border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            History
          </CardTitle>
          <CardDescription>
            {predictions.length} prediction{predictions.length !== 1 ? 's' : ''} tracked
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="mb-4">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="premise">Premise</TabsTrigger>
              <TabsTrigger value="full_script">Full</TabsTrigger>
            </TabsList>
          </Tabs>

          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-2">
              {filteredPredictions.map((prediction) => (
                <button
                  key={prediction.id}
                  onClick={() => setSelectedPrediction(prediction)}
                  className={`w-full text-left p-3 rounded-lg border transition-all hover:bg-background/50 ${
                    selectedPrediction?.id === prediction.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border/30'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-foreground truncate">
                        {prediction.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(prediction.created_at), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {prediction.prediction_type === 'premise' ? 'Premise' : 'Full'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`text-xl font-bold ${getScoreColor(prediction.viral_score)}`}>
                      {prediction.viral_score}
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Detailed View */}
      <Card className="lg:col-span-2 bg-card-elevated border-border/50">
        {selectedPrediction ? (
          <>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{selectedPrediction.title}</CardTitle>
                  <CardDescription className="flex items-center gap-3">
                    <span>{format(new Date(selectedPrediction.created_at), 'MMMM d, yyyy')}</span>
                    <Badge variant="outline">
                      {selectedPrediction.prediction_type === 'premise' ? 'Premise Analysis' : 'Full Script'}
                    </Badge>
                    {selectedPrediction.niche && (
                      <Badge variant="secondary">{selectedPrediction.niche}</Badge>
                    )}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deletePrediction(selectedPrediction.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Scores */}
              <div className="grid grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg border ${getScoreBgColor(selectedPrediction.viral_score)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase">Viral Score</span>
                    {getScoreTrend(selectedPrediction.viral_score, predictions, 'viral_score') && (
                      <span className={`text-xs flex items-center gap-1 ${
                        getScoreTrend(selectedPrediction.viral_score, predictions, 'viral_score')!.direction === 'up'
                          ? 'text-success'
                          : 'text-destructive'
                      }`}>
                        {getScoreTrend(selectedPrediction.viral_score, predictions, 'viral_score')!.direction === 'up' ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {getScoreTrend(selectedPrediction.viral_score, predictions, 'viral_score')!.percentage}%
                      </span>
                    )}
                  </div>
                  <span className={`text-3xl font-bold ${getScoreColor(selectedPrediction.viral_score)}`}>
                    {selectedPrediction.viral_score}
                  </span>
                </div>
                
                <div className={`p-4 rounded-lg border ${getScoreBgColor(selectedPrediction.engagement_score)}`}>
                  <span className="text-xs font-medium text-muted-foreground uppercase block mb-2">Engagement</span>
                  <span className={`text-3xl font-bold ${getScoreColor(selectedPrediction.engagement_score)}`}>
                    {selectedPrediction.engagement_score}
                  </span>
                </div>
                
                <div className={`p-4 rounded-lg border ${getScoreBgColor(selectedPrediction.shareability_score)}`}>
                  <span className="text-xs font-medium text-muted-foreground uppercase block mb-2">Shareability</span>
                  <span className={`text-3xl font-bold ${getScoreColor(selectedPrediction.shareability_score)}`}>
                    {selectedPrediction.shareability_score}
                  </span>
                </div>
              </div>

              {/* Detailed Metrics */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Detailed Breakdown</h4>
                {[
                  { label: 'Hook Strength', value: selectedPrediction.hook_strength },
                  { label: 'Emotional Impact', value: selectedPrediction.emotional_impact },
                  { label: 'Conflict Clarity', value: selectedPrediction.conflict_clarity },
                  { label: 'Pacing Quality', value: selectedPrediction.pacing_quality },
                  { label: 'Dialogue Quality', value: selectedPrediction.dialogue_quality },
                  { label: 'Quotability', value: selectedPrediction.quotability },
                  { label: 'Relatability', value: selectedPrediction.relatability }
                ].map((metric) => (
                  <div key={metric.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{metric.label}</span>
                      <span className="font-medium text-foreground">{metric.value}/100</span>
                    </div>
                    <Progress value={metric.value} className="h-1.5" />
                  </div>
                ))}
              </div>

              {/* Insights Tabs */}
              <Tabs defaultValue="recommendations" className="mt-6">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="recommendations">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Tips
                  </TabsTrigger>
                  <TabsTrigger value="strengths">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Strengths
                  </TabsTrigger>
                  <TabsTrigger value="weaknesses">Weaknesses</TabsTrigger>
                </TabsList>
                
                <TabsContent value="recommendations" className="mt-4 space-y-2">
                  {Array.isArray(selectedPrediction.recommendations) && selectedPrediction.recommendations.map((rec, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-sm text-foreground">{rec}</p>
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="strengths" className="mt-4 space-y-2">
                  {Array.isArray(selectedPrediction.strengths) && selectedPrediction.strengths.map((strength, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-success/5 border border-success/20">
                      <p className="text-sm text-foreground">{strength}</p>
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="weaknesses" className="mt-4 space-y-2">
                  {Array.isArray(selectedPrediction.weaknesses) && selectedPrediction.weaknesses.map((weakness, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-warning/5 border border-warning/20">
                      <p className="text-sm text-foreground">{weakness}</p>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </>
        ) : (
          <CardContent className="p-12 text-center">
            <Target className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Select a Prediction</h3>
            <p className="text-sm text-muted-foreground">
              Choose a prediction from the history to view detailed analysis
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
