import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Eye, Heart, Share2, Zap, Target, BarChart3, Sparkles, AlertCircle, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Script {
  id: string;
  title: string;
  content: string;
  niche: string;
  created_at: string;
}

interface AnalysisResult {
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
  recommendations: string[];
  strengths: string[];
  weaknesses: string[];
}

const Predictions = () => {
  const { user, loading: authLoading } = useAuth();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [selectedScriptId, setSelectedScriptId] = useState<string>("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingScripts, setLoadingScripts] = useState(true);

  useEffect(() => {
    if (user) {
      fetchScripts();
    }
  }, [user]);

  const fetchScripts = async () => {
    try {
      const { data, error } = await supabase
        .from('scripts')
        .select('id, title, content, niche, created_at')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setScripts(data || []);
      if (data && data.length > 0) {
        setSelectedScriptId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching scripts:', error);
      toast.error('Failed to load scripts');
    } finally {
      setLoadingScripts(false);
    }
  };

  const analyzeScript = async () => {
    if (!selectedScriptId) {
      toast.error('Please select a script to analyze');
      return;
    }

    const script = scripts.find(s => s.id === selectedScriptId);
    if (!script) return;

    setAnalyzing(true);
    setAnalysis(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-script', {
        body: {
          scriptId: script.id,
          content: script.content,
          title: script.title,
          niche: script.niche
        }
      });

      if (error) throw error;

      if (data.success) {
        setAnalysis(data.analysis);
        toast.success('Analysis complete!');
      } else {
        throw new Error(data.error || 'Analysis failed');
      }
    } catch (error: any) {
      console.error('Analysis error:', error);
      toast.error(error.message || 'Failed to analyze script');
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-success';
    if (score >= 60) return 'text-warning';
    return 'text-error';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { label: 'High Potential', variant: 'default' as const, class: 'bg-success/20 text-success border-success/30' };
    if (score >= 60) return { label: 'Medium Potential', variant: 'secondary' as const, class: 'bg-warning/20 text-warning border-warning/30' };
    return { label: 'Needs Improvement', variant: 'outline' as const, class: 'bg-error/20 text-error border-error/30' };
  };

  if (authLoading || loadingScripts) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-base">
        <div className="text-center space-y-4">
          <Loader2 className="animate-spin w-8 h-8 text-primary mx-auto" />
          <p className="text-muted-foreground">Loading predictions...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-base">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to access viral predictions</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-base">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-gradient-drama px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
            <span className="text-sm font-semibold text-primary-foreground">AI-Powered Predictions</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-drama bg-clip-text text-transparent mb-4">
            Viral Potential Analysis
          </h1>
          <p className="text-lg text-muted-foreground">
            Predict your script's performance before you film with advanced AI analytics
          </p>
        </div>

        <Card className="mb-8 shadow-elevated">
          <CardHeader>
            <CardTitle>Select Script to Analyze</CardTitle>
            <CardDescription>Choose from your saved scripts to get viral predictions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {scripts.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No scripts found. Create one first!</p>
                <Button onClick={() => window.location.href = '/dashboard'}>
                  Go to Dashboard
                </Button>
              </div>
            ) : (
              <div className="flex gap-4">
                <Select value={selectedScriptId} onValueChange={setSelectedScriptId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a script" />
                  </SelectTrigger>
                  <SelectContent>
                    {scripts.map((script) => (
                      <SelectItem key={script.id} value={script.id}>
                        {script.title} ({script.niche})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button 
                  onClick={analyzeScript}
                  disabled={analyzing || !selectedScriptId}
                  className="gap-2"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="w-4 h-4" />
                      Analyze Script
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {analysis && (
          <>
            <Card floating className="mb-8 border-primary/20 bg-gradient-card">
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <div className="inline-block relative">
                    <svg className="w-48 h-48" viewBox="0 0 200 200">
                      <circle cx="100" cy="100" r="90" fill="none" stroke="hsl(var(--border))" strokeWidth="12" />
                      <circle
                        cx="100" cy="100" r="90" fill="none" stroke="url(#gradient)" strokeWidth="12"
                        strokeDasharray={`${analysis.viral_score * 5.65} 565`}
                        strokeLinecap="round" transform="rotate(-90 100 100)" className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="hsl(var(--primary))" />
                          <stop offset="100%" stopColor="hsl(var(--secondary))" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className={`text-5xl font-bold ${getScoreColor(analysis.viral_score)}`}>
                        {analysis.viral_score}
                      </span>
                      <span className="text-sm text-muted-foreground">Viral Score</span>
                    </div>
                  </div>
                </div>
                <div className="text-center max-w-md mx-auto">
                  <Badge className={getScoreBadge(analysis.viral_score).class}>
                    {getScoreBadge(analysis.viral_score).label}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card elevated>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg"><Eye className="w-5 h-5" /></div>
                    <Badge variant="default">{analysis.engagement_score}%</Badge>
                  </div>
                  <h3 className="font-semibold mb-2">Engagement Score</h3>
                  <Progress value={analysis.engagement_score} className="h-2" />
                </CardContent>
              </Card>
              <Card elevated>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-secondary/10 rounded-lg"><Share2 className="w-5 h-5" /></div>
                    <Badge variant="secondary">{analysis.shareability_score}%</Badge>
                  </div>
                  <h3 className="font-semibold mb-2">Shareability Score</h3>
                  <Progress value={analysis.shareability_score} className="h-2" />
                </CardContent>
              </Card>
              <Card elevated>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-info/10 rounded-lg"><Zap className="w-5 h-5" /></div>
                    <Badge variant="outline">{analysis.hook_strength}%</Badge>
                  </div>
                  <h3 className="font-semibold mb-2">Hook Strength</h3>
                  <Progress value={analysis.hook_strength} className="h-2" />
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="breakdown" className="space-y-6">
              <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
                <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                <TabsTrigger value="strengths">Strengths</TabsTrigger>
                <TabsTrigger value="optimize">Optimize</TabsTrigger>
              </TabsList>
              <TabsContent value="breakdown" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card elevated>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Target className="w-5 h-5" />Content Quality</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div><div className="flex justify-between mb-2"><span className="text-sm">Hook Strength</span><span className="text-sm font-semibold">{analysis.hook_strength}%</span></div><Progress value={analysis.hook_strength} className="h-2" /></div>
                      <div><div className="flex justify-between mb-2"><span className="text-sm">Emotional Impact</span><span className="text-sm font-semibold">{analysis.emotional_impact}%</span></div><Progress value={analysis.emotional_impact} className="h-2" /></div>
                      <div><div className="flex justify-between mb-2"><span className="text-sm">Conflict Clarity</span><span className="text-sm font-semibold">{analysis.conflict_clarity}%</span></div><Progress value={analysis.conflict_clarity} className="h-2" /></div>
                    </CardContent>
                  </Card>
                  <Card elevated>
                    <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5" />Execution Quality</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div><div className="flex justify-between mb-2"><span className="text-sm">Pacing Quality</span><span className="text-sm font-semibold">{analysis.pacing_quality}%</span></div><Progress value={analysis.pacing_quality} className="h-2" /></div>
                      <div><div className="flex justify-between mb-2"><span className="text-sm">Dialogue Quality</span><span className="text-sm font-semibold">{analysis.dialogue_quality}%</span></div><Progress value={analysis.dialogue_quality} className="h-2" /></div>
                      <div><div className="flex justify-between mb-2"><span className="text-sm">Quotability</span><span className="text-sm font-semibold">{analysis.quotability}%</span></div><Progress value={analysis.quotability} className="h-2" /></div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="strengths" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card elevated>
                    <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-success" />Strengths</CardTitle><CardDescription>What's working well</CardDescription></CardHeader>
                    <CardContent><ul className="space-y-3">{analysis.strengths.map((strength, index) => (<li key={index} className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" /><span className="text-sm">{strength}</span></li>))}</ul></CardContent>
                  </Card>
                  <Card elevated>
                    <CardHeader><CardTitle className="flex items-center gap-2"><XCircle className="w-5 h-5 text-error" />Weaknesses</CardTitle><CardDescription>Areas that need attention</CardDescription></CardHeader>
                    <CardContent><ul className="space-y-3">{analysis.weaknesses.map((weakness, index) => (<li key={index} className="flex gap-3"><XCircle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" /><span className="text-sm">{weakness}</span></li>))}</ul></CardContent>
                  </Card>
                </div>
              </TabsContent>
              <TabsContent value="optimize" className="space-y-6">
                <Card elevated>
                  <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5" />AI Recommendations</CardTitle><CardDescription>Specific actions to improve viral potential</CardDescription></CardHeader>
                  <CardContent><ul className="space-y-4">{analysis.recommendations.map((rec, index) => (<li key={index} className="flex gap-3 p-4 bg-background-elevated rounded-lg border border-border/50"><Badge variant="outline" className="flex-shrink-0 h-6">{index + 1}</Badge><span className="text-sm">{rec}</span></li>))}</ul></CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}

        {!analysis && !analyzing && scripts.length > 0 && (
          <Card className="text-center py-16">
            <CardContent>
              <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Ready to Analyze</h3>
              <p className="text-muted-foreground mb-6">Select a script above and click "Analyze Script" to get AI-powered viral predictions</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Predictions;
