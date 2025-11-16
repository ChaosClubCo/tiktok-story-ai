import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  CheckCircle2,
  Film,
  FileText,
  Hash,
  Palette,
  Loader2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { analytics } from "@/lib/analytics";

interface SeriesTemplate {
  title: string;
  logline: string;
  episodes: number;
  tags: string[];
}

const niches = [
  { value: 'dating', label: 'Dating Drama', emoji: '💔' },
  { value: 'horror', label: 'Horror Stories', emoji: '👻' },
  { value: 'workplace', label: 'Workplace Drama', emoji: '💼' },
  { value: 'family', label: 'Family Secrets', emoji: '🏠' },
  { value: 'revenge', label: 'Revenge Stories', emoji: '⚔️' },
  { value: 'mystery', label: 'Mystery', emoji: '🔍' }
];

const tones = [
  { value: 'dramatic', label: 'Dramatic', description: 'Intense and emotional' },
  { value: 'suspenseful', label: 'Suspenseful', description: 'Tense and gripping' },
  { value: 'dark', label: 'Dark', description: 'Edgy and serious' },
  { value: 'comedic', label: 'Comedic', description: 'Lighthearted and funny' }
];

export const SeriesBuilderFlow = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const remixId = searchParams.get('remix');

  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    logline: '',
    episodes: 5,
    niche: 'drama',
    tone: 'dramatic'
  });

  const totalSteps = 4;
  const progress = (currentStep / totalSteps) * 100;

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Load remix template if available
    if (remixId) {
      const storedTemplate = localStorage.getItem('remix_series_template');
      if (storedTemplate) {
        const template: SeriesTemplate = JSON.parse(storedTemplate);
        setFormData(prev => ({
          ...prev,
          title: template.title,
          logline: template.logline,
          episodes: template.episodes,
          niche: template.tags[0] || 'drama'
        }));
        localStorage.removeItem('remix_series_template');
      }
    }

    analytics.track('series_builder_viewed', { remixId });
  }, [user, remixId, navigate]);

  const handleNext = () => {
    // Validate current step
    if (currentStep === 1 && !formData.title.trim()) {
      toast.error('Please enter a series title');
      return;
    }
    if (currentStep === 2 && !formData.logline.trim()) {
      toast.error('Please enter a logline');
      return;
    }

    analytics.track('series_builder_step_completed', { step: currentStep });
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleGenerate = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setIsGenerating(true);
    analytics.track('series_generation_started', formData);

    try {
      const { data, error } = await supabase.functions.invoke('generate-series', {
        body: {
          premise: formData.logline,
          niche: formData.niche,
          tone: formData.tone,
          episodeCount: formData.episodes,
          seriesTitle: formData.title
        }
      });

      if (error) throw error;

      toast.success(`🎬 Series "${formData.title}" created with ${data.episodes.length} episodes!`);
      analytics.track('series_generation_completed', { 
        seriesId: data.seriesId,
        episodeCount: data.episodes.length 
      });

      // Navigate to series page after brief delay
      setTimeout(() => {
        navigate('/series');
      }, 2000);

    } catch (error: any) {
      console.error('Error generating series:', error);
      toast.error(error.message || 'Failed to generate series');
      setIsGenerating(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Film className="w-8 h-8 text-primary" />
              <div>
                <h3 className="text-2xl font-bold text-foreground">Name Your Series</h3>
                <p className="text-sm text-muted-foreground">Give your series a catchy, memorable title</p>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="title" className="text-base font-medium">Series Title</Label>
              <Input
                id="title"
                placeholder="e.g., The Toxic Dating Chronicles"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="text-lg h-12 bg-background/50 border-border/50 focus:border-primary"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                💡 Tip: Use strong emotional words and make it instantly intriguing
              </p>
            </div>

            {remixId && (
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm text-muted-foreground">
                  🎨 You're remixing a proven template. Feel free to customize the title to make it your own!
                </p>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-8 h-8 text-primary" />
              <div>
                <h3 className="text-2xl font-bold text-foreground">Craft Your Logline</h3>
                <p className="text-sm text-muted-foreground">One sentence that hooks viewers instantly</p>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="logline" className="text-base font-medium">Series Logline</Label>
              <Textarea
                id="logline"
                placeholder="e.g., A series exposing the wildest red flags from real dating disasters"
                value={formData.logline}
                onChange={(e) => setFormData(prev => ({ ...prev, logline: e.target.value }))}
                className="min-h-[120px] text-base bg-background/50 border-border/50 focus:border-primary resize-none"
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                💡 Tip: Focus on the core conflict or mystery. What makes viewers NEED to watch?
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gradient-subtle border border-border/30">
              <h4 className="text-sm font-semibold text-foreground mb-2">Great Logline Formula:</h4>
              <p className="text-sm text-muted-foreground">
                [Main Character/Situation] + [Faces/Discovers] + [Compelling Hook/Twist]
              </p>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Hash className="w-8 h-8 text-primary" />
              <div>
                <h3 className="text-2xl font-bold text-foreground">Choose Episode Count</h3>
                <p className="text-sm text-muted-foreground">How many episodes should this series have?</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[5, 7, 8, 10, 12, 15].map((count) => (
                <button
                  key={count}
                  onClick={() => setFormData(prev => ({ ...prev, episodes: count }))}
                  className={`p-6 rounded-lg border-2 transition-all hover:scale-105 ${
                    formData.episodes === count
                      ? 'border-primary bg-primary/10 shadow-glow'
                      : 'border-border/50 bg-card-elevated hover:border-primary/50'
                  }`}
                >
                  <div className="text-3xl font-bold text-foreground mb-1">{count}</div>
                  <div className="text-xs text-muted-foreground">episodes</div>
                </button>
              ))}
            </div>

            <div className="p-4 rounded-lg bg-info/5 border border-info/20">
              <p className="text-sm text-muted-foreground">
                📊 <strong>Recommended:</strong> 5-7 episodes for quick series, 10-15 for deep storytelling
              </p>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-8 h-8 text-primary" />
              <div>
                <h3 className="text-2xl font-bold text-foreground">Set Your Vibe</h3>
                <p className="text-sm text-muted-foreground">Choose the niche and tone for your series</p>
              </div>
            </div>

            {/* Niche Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Niche</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {niches.map((niche) => (
                  <button
                    key={niche.value}
                    onClick={() => setFormData(prev => ({ ...prev, niche: niche.value }))}
                    className={`p-4 rounded-lg border-2 transition-all hover:scale-105 text-left ${
                      formData.niche === niche.value
                        ? 'border-primary bg-primary/10 shadow-elevated'
                        : 'border-border/50 bg-card-elevated hover:border-primary/50'
                    }`}
                  >
                    <div className="text-2xl mb-1">{niche.emoji}</div>
                    <div className="text-sm font-semibold text-foreground">{niche.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tone Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Tone</Label>
              <div className="grid sm:grid-cols-2 gap-3">
                {tones.map((tone) => (
                  <button
                    key={tone.value}
                    onClick={() => setFormData(prev => ({ ...prev, tone: tone.value }))}
                    className={`p-4 rounded-lg border-2 transition-all hover:scale-105 text-left ${
                      formData.tone === tone.value
                        ? 'border-primary bg-primary/10 shadow-elevated'
                        : 'border-border/50 bg-card-elevated hover:border-primary/50'
                    }`}
                  >
                    <div className="text-sm font-semibold text-foreground mb-1">{tone.label}</div>
                    <div className="text-xs text-muted-foreground">{tone.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background-base py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Progress Header */}
        <div className="mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="text-sm">
              Step {currentStep} of {totalSteps}
            </Badge>
            {remixId && (
              <Badge variant="outline" className="gap-1">
                <Sparkles className="w-3 h-3" />
                Remixing Template
              </Badge>
            )}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Main Card */}
        <Card className="shadow-glow border-border/50 bg-card-elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Series Builder
            </CardTitle>
            <CardDescription>
              Let's customize your series step by step
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Step Content */}
            <div className="min-h-[400px]">
              {renderStep()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-6 border-t border-border/30">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="gap-2"
                  disabled={isGenerating}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              )}

              {currentStep < totalSteps ? (
                <Button
                  onClick={handleNext}
                  className="ml-auto gap-2 shadow-elevated hover:shadow-glow"
                  disabled={isGenerating}
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleGenerate}
                  className="ml-auto gap-2 shadow-glow hover:shadow-glow"
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating Series...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Generate Series
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Summary Preview (Step 4 only) */}
        {currentStep === 4 && (
          <Card className="mt-6 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Series Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">Title:</span>{" "}
                <span className="font-semibold text-foreground">{formData.title}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Logline:</span>{" "}
                <span className="text-foreground">{formData.logline}</span>
              </div>
              <div className="flex gap-4">
                <div>
                  <span className="text-muted-foreground">Episodes:</span>{" "}
                  <span className="font-semibold text-foreground">{formData.episodes}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Niche:</span>{" "}
                  <span className="font-semibold text-foreground capitalize">{formData.niche}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Tone:</span>{" "}
                  <span className="font-semibold text-foreground capitalize">{formData.tone}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
