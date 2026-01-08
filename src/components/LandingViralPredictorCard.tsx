import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles, TrendingUp, ArrowRight, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { analytics } from "@/lib/analytics";

const MAX_FREE_PREDICTIONS = 3;
const STORAGE_KEY = 'viral_predictor_count';

export const LandingViralPredictorCard = () => {
  const navigate = useNavigate();
  const [idea, setIdea] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    summary: string;
    tips: string[];
  } | null>(null);
  const [remainingPredictions, setRemainingPredictions] = useState(MAX_FREE_PREDICTIONS);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Track widget view
    analytics.track('viral_predictor_viewed');
    
    // Load prediction count from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    const count = stored ? parseInt(stored, 10) : 0;
    setRemainingPredictions(Math.max(0, MAX_FREE_PREDICTIONS - count));
  }, []);

  const handlePredict = async () => {
    if (!idea.trim() || idea.trim().length < 10) {
      return;
    }

    if (remainingPredictions <= 0) {
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    setResult(null);

    // Animate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      analytics.track('viral_predictor_requested', { ideaLength: idea.length });

      const { data, error } = await supabase.functions.invoke('demo-viral-score', {
        body: { idea: idea.trim() }
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) throw error;

      setResult(data);

      // Update localStorage
      const stored = localStorage.getItem(STORAGE_KEY);
      const count = stored ? parseInt(stored, 10) : 0;
      localStorage.setItem(STORAGE_KEY, String(count + 1));
      setRemainingPredictions(Math.max(0, MAX_FREE_PREDICTIONS - count - 1));

    } catch (error) {
      console.error('Error predicting viral score:', error);
      clearInterval(progressInterval);
    } finally {
      setTimeout(() => {
        setIsAnalyzing(false);
        setProgress(0);
      }, 500);
    }
  };

  const handleContinue = () => {
    analytics.track('viral_predictor_continue_clicked', { score: result?.score });
    // Store idea in localStorage for use in app
    if (idea.trim()) {
      localStorage.setItem('demo_script_idea', idea.trim());
    }
    navigate('/');
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return "text-success";
    if (score >= 70) return "text-info";
    if (score >= 60) return "text-secondary";
    return "text-warning";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 85) return "bg-success/10 border-success/30";
    if (score >= 70) return "bg-info/10 border-info/30";
    if (score >= 60) return "bg-secondary/10 border-secondary/30";
    return "bg-warning/10 border-warning/30";
  };

  return (
    <Card className="relative overflow-hidden shadow-glow border-border/50 bg-card-elevated">
      <div className="absolute inset-0 bg-gradient-subtle opacity-50" />
      
      <CardHeader className="relative">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-primary" />
          <CardTitle className="text-2xl">Test Your Viral Potential</CardTitle>
        </div>
        <CardDescription>
          Get an instant virality score for your script idea – no signup required
        </CardDescription>
      </CardHeader>

      <CardContent className="relative space-y-6">
        {/* Input Section */}
        <div className="space-y-3">
          <label htmlFor="script-idea" className="text-sm font-medium text-foreground">
            Your Script Idea
          </label>
          <Textarea
            id="script-idea"
            placeholder="Example: POV: Your date takes you to an expensive restaurant but forgets his wallet... 🚩"
            value={idea}
            onChange={(e) => setIdea(e.target.value.slice(0, 500))}
            className="min-h-[120px] resize-none bg-background/50 border-border/50 focus:border-primary transition-colors"
            disabled={isAnalyzing || remainingPredictions <= 0}
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{idea.length}/500 characters</span>
            <span>
              {remainingPredictions > 0 ? (
                `${remainingPredictions} free prediction${remainingPredictions !== 1 ? 's' : ''} left`
              ) : (
                <span className="text-warning flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Sign up for unlimited predictions
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Loading State */}
        {isAnalyzing && (
          <div className="space-y-2 animate-fade-in">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4 animate-pulse" />
              Analyzing virality...
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Results */}
        {result && !isAnalyzing && (
          <div className="space-y-4 animate-fade-in">
            {/* Score Display */}
            <div className={`rounded-lg border-2 p-6 ${getScoreBgColor(result.score)}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-muted-foreground">Viral Score</span>
                <TrendingUp className={`w-5 h-5 ${getScoreColor(result.score)}`} />
              </div>
              <div className={`text-5xl font-bold ${getScoreColor(result.score)} mb-2`}>
                {result.score}
                <span className="text-2xl text-muted-foreground">/100</span>
              </div>
              <p className="text-sm text-foreground">{result.summary}</p>
            </div>

            {/* Improvement Tips */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground">💡 Tips to Boost Virality</h4>
              <ul className="space-y-2">
                {result.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-0.5">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Banner */}
            <div className="rounded-lg bg-gradient-drama p-4 text-center">
              <p className="text-sm font-medium text-white mb-3">
                Ready to build a full series from this idea?
              </p>
              <Button
                onClick={handleContinue}
                variant="secondary"
                className="gap-2 shadow-elevated hover:shadow-glow transition-all"
              >
                Continue in App
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Predict Button */}
        {!result && (
          <Button
            onClick={handlePredict}
            disabled={isAnalyzing || idea.trim().length < 10 || remainingPredictions <= 0}
            className="w-full gap-2 text-lg py-6 shadow-glow hover:shadow-glow hover:scale-105 transition-all"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <TrendingUp className="w-5 h-5 animate-pulse" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Predict Viral Score
              </>
            )}
          </Button>
        )}

        {/* Try Another */}
        {result && !isAnalyzing && remainingPredictions > 0 && (
          <Button
            onClick={() => {
              setResult(null);
              setIdea("");
            }}
            variant="outline"
            className="w-full"
          >
            Try Another Idea
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
