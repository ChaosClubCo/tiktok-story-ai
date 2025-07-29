import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { 
  Zap, 
  TrendingUp, 
  Eye, 
  Clock, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Info 
} from "lucide-react";

interface OptimizationSuggestion {
  type: 'hook' | 'engagement' | 'timing' | 'cta' | 'structure';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  suggestion: string;
  impact: string;
}

interface AnalysisMetrics {
  engagementScore: number;
  viralPotential: number;
  retentionRate: number;
  hookStrength: number;
}

export const AIScriptOptimization = () => {
  const { toast } = useToast();
  const [originalScript, setOriginalScript] = useState("");
  const [optimizedScript, setOptimizedScript] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [metrics, setMetrics] = useState<AnalysisMetrics>({
    engagementScore: 0,
    viralPotential: 0,
    retentionRate: 0,
    hookStrength: 0
  });
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);

  const mockSuggestions: OptimizationSuggestion[] = [
    {
      type: 'hook',
      severity: 'high',
      title: 'Strengthen Opening Hook',
      description: 'Your opening line needs more impact to grab attention',
      suggestion: 'Start with a question or shocking statistic',
      impact: 'Could increase retention by 35%'
    },
    {
      type: 'engagement',
      severity: 'medium',
      title: 'Add Interactive Elements',
      description: 'Include more engagement triggers throughout',
      suggestion: 'Ask viewers to comment their opinion',
      impact: 'Could boost engagement by 20%'
    },
    {
      type: 'timing',
      severity: 'low',
      title: 'Optimize Pacing',
      description: 'Some sections feel rushed',
      suggestion: 'Add 2-second pauses between key points',
      impact: 'Could improve comprehension by 15%'
    }
  ];

  const handleAnalyze = async () => {
    if (!originalScript.trim()) {
      toast({
        title: "Error",
        description: "Please enter a script to analyze",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisComplete(false);

    try {
      // Simulate AI analysis
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock analysis results
      setMetrics({
        engagementScore: Math.floor(Math.random() * 30) + 70,
        viralPotential: Math.floor(Math.random() * 25) + 60,
        retentionRate: Math.floor(Math.random() * 20) + 75,
        hookStrength: Math.floor(Math.random() * 40) + 50
      });
      
      setSuggestions(mockSuggestions);
      
      // Generate optimized version
      setOptimizedScript(`🔥 OPTIMIZED VERSION 🔥

HOOK: "Did you know that 90% of people make this mistake daily?"

${originalScript.split('\n').slice(1).join('\n')}

✨ ENHANCED ENDING: "Try this and comment below with your results!"

#ViralContent #LifeHacks #MustWatch`);
      
      setAnalysisComplete(true);
      
      toast({
        title: "Analysis Complete",
        description: "Your script has been optimized for maximum engagement"
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze script. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      case 'medium':
        return <Info className="w-4 h-4 text-warning" />;
      case 'low':
        return <CheckCircle className="w-4 h-4 text-success" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          AI Script Optimization
        </CardTitle>
        <CardDescription>
          Analyze and optimize your scripts for maximum viral potential and engagement
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="analyze" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analyze">Analyze</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            <TabsTrigger value="optimized">Optimized</TabsTrigger>
          </TabsList>

          <TabsContent value="analyze" className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="script" className="text-sm font-medium">
                  Original Script
                </label>
                <Textarea
                  id="script"
                  placeholder="Paste your script here for AI analysis..."
                  value={originalScript}
                  onChange={(e) => setOriginalScript(e.target.value)}
                  className="min-h-48 mt-2"
                />
              </div>

              <Button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Script"}
              </Button>

              {isAnalyzing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Analyzing script performance...</span>
                    <span>Processing</span>
                  </div>
                  <Progress value={undefined} className="animate-pulse" />
                </div>
              )}

              {analysisComplete && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <div className={`text-2xl font-bold ${getScoreColor(metrics.engagementScore)}`}>
                        {metrics.engagementScore}%
                      </div>
                      <div className="text-sm text-muted-foreground">Engagement</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <Zap className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <div className={`text-2xl font-bold ${getScoreColor(metrics.viralPotential)}`}>
                        {metrics.viralPotential}%
                      </div>
                      <div className="text-sm text-muted-foreground">Viral Potential</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <Eye className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <div className={`text-2xl font-bold ${getScoreColor(metrics.retentionRate)}`}>
                        {metrics.retentionRate}%
                      </div>
                      <div className="text-sm text-muted-foreground">Retention</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <Target className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <div className={`text-2xl font-bold ${getScoreColor(metrics.hookStrength)}`}>
                        {metrics.hookStrength}%
                      </div>
                      <div className="text-sm text-muted-foreground">Hook Strength</div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-6">
            {suggestions.length > 0 ? (
              <div className="space-y-4">
                {suggestions.map((suggestion, index) => (
                  <Card key={index} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {getSeverityIcon(suggestion.severity)}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{suggestion.title}</h4>
                            <Badge variant={
                              suggestion.severity === 'high' ? 'destructive' :
                              suggestion.severity === 'medium' ? 'secondary' : 'outline'
                            }>
                              {suggestion.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {suggestion.description}
                          </p>
                          <div className="bg-muted p-3 rounded-md mb-2">
                            <p className="text-sm font-medium">Suggestion:</p>
                            <p className="text-sm">{suggestion.suggestion}</p>
                          </div>
                          <p className="text-sm text-success font-medium">
                            💡 {suggestion.impact}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Analyze a script to see optimization suggestions</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="optimized" className="space-y-6">
            {optimizedScript ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Optimized Script</label>
                  <Textarea
                    value={optimizedScript}
                    readOnly
                    className="min-h-48 mt-2 bg-muted"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={() => navigator.clipboard.writeText(optimizedScript)}
                    variant="outline"
                  >
                    Copy Optimized Script
                  </Button>
                  <Button>
                    Use This Version
                  </Button>
                </div>

                <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                  <h4 className="font-medium text-success mb-2">Key Improvements</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Stronger opening hook with shocking statistic</li>
                    <li>• Added engagement trigger at the end</li>
                    <li>• Optimized hashtags for discoverability</li>
                    <li>• Enhanced emotional appeal</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Zap className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Analyze a script to see the optimized version</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};