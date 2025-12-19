import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  TrendingUp, 
  Users, 
  Film, 
  Palette, 
  Target,
  ArrowRight,
  ArrowLeft,
  Check,
  Rocket,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePageTitle } from '@/hooks/usePageTitle';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const NICHES = [
  { id: 'romance', label: 'Romance', emoji: '💕', color: 'bg-pink-500/10 border-pink-500/30' },
  { id: 'thriller', label: 'Thriller', emoji: '🔥', color: 'bg-red-500/10 border-red-500/30' },
  { id: 'comedy', label: 'Comedy', emoji: '😂', color: 'bg-yellow-500/10 border-yellow-500/30' },
  { id: 'drama', label: 'Drama', emoji: '🎭', color: 'bg-purple-500/10 border-purple-500/30' },
  { id: 'mystery', label: 'Mystery', emoji: '🔍', color: 'bg-blue-500/10 border-blue-500/30' },
  { id: 'horror', label: 'Horror', emoji: '👻', color: 'bg-gray-500/10 border-gray-500/30' },
];

const GOALS = [
  { id: 'followers', label: 'Grow followers', icon: Users },
  { id: 'monetize', label: 'Monetize content', icon: Target },
  { id: 'engagement', label: 'Boost engagement', icon: TrendingUp },
  { id: 'brand', label: 'Build my brand', icon: Sparkles },
];

const STEPS = [
  { id: 'welcome', title: 'Welcome' },
  { id: 'niche', title: 'Your Niche' },
  { id: 'goals', title: 'Your Goals' },
  { id: 'ready', title: 'Ready!' },
];

/**
 * Onboarding - Multi-step onboarding flow for new users
 * Guides users through selecting their niche and goals
 */
export default function Onboarding() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedNiche, setSelectedNiche] = useState<string | null>(null);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  usePageTitle('Get Started - MiniDrama');

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const saveOnboardingPreferences = async () => {
    if (!user) return false;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          preferred_niche: selectedNiche,
          goals: selectedGoals,
          onboarding_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Failed to save onboarding preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to save your preferences. Please try again.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleComplete = async () => {
    const saved = await saveOnboardingPreferences();
    if (saved) {
      // Navigate to series builder with selected preferences
      const params = new URLSearchParams();
      if (selectedNiche) params.set('niche', selectedNiche);
      navigate(`/series/builder?${params.toString()}`);
    }
  };

  const handleSkip = async () => {
    // Mark onboarding as complete even if skipped
    if (user) {
      await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('user_id', user.id);
    }
    navigate('/dashboard');
  };

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(g => g !== goalId)
        : [...prev, goalId]
    );
  };

  const canProceed = () => {
    switch (STEPS[currentStep].id) {
      case 'welcome':
        return true;
      case 'niche':
        return selectedNiche !== null;
      case 'goals':
        return selectedGoals.length > 0;
      case 'ready':
        return true;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg">MiniDrama</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleSkip}
          >
            Skip for now
          </Button>
        </div>
      </header>

      {/* Progress */}
      <div className="container mx-auto px-4 pt-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((step, index) => (
              <div 
                key={step.id}
                className={cn(
                  "text-xs font-medium transition-colors",
                  index <= currentStep ? "text-primary" : "text-muted-foreground"
                )}
              >
                {step.title}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            {/* Step 1: Welcome */}
            {STEPS[currentStep].id === 'welcome' && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center space-y-8"
              >
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                  <Rocket className="w-10 h-10 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-4">
                    Welcome to MiniDrama{user?.email ? `, ${user.email.split('@')[0]}` : ''}! 🎬
                  </h1>
                  <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    Let's set up your content empire in just 2 minutes. We'll personalize everything for you.
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                  {[
                    { icon: Film, label: 'Series Builder' },
                    { icon: TrendingUp, label: 'Viral Predictor' },
                    { icon: Palette, label: 'Hook Generator' },
                  ].map((feature) => (
                    <div key={feature.label} className="text-center p-4 bg-card rounded-xl border border-border/50">
                      <feature.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                      <span className="text-xs text-muted-foreground">{feature.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Niche Selection */}
            {STEPS[currentStep].id === 'niche' && (
              <motion.div
                key="niche"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">
                    What's your content niche?
                  </h2>
                  <p className="text-muted-foreground">
                    Pick your primary genre. You can always create content in other niches too.
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {NICHES.map((niche) => (
                    <motion.button
                      key={niche.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedNiche(niche.id)}
                      className={cn(
                        "p-6 rounded-xl border-2 transition-all text-left",
                        selectedNiche === niche.id
                          ? "border-primary bg-primary/5 shadow-glow"
                          : `${niche.color} hover:border-primary/50`
                      )}
                    >
                      <span className="text-3xl mb-2 block">{niche.emoji}</span>
                      <span className="font-semibold">{niche.label}</span>
                      {selectedNiche === niche.id && (
                        <Check className="w-5 h-5 text-primary absolute top-3 right-3" />
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Goals */}
            {STEPS[currentStep].id === 'goals' && (
              <motion.div
                key="goals"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">
                    What are your goals?
                  </h2>
                  <p className="text-muted-foreground">
                    Select all that apply. We'll tailor your experience.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {GOALS.map((goal) => (
                    <motion.button
                      key={goal.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleGoal(goal.id)}
                      className={cn(
                        "p-6 rounded-xl border-2 transition-all text-left flex items-start gap-4",
                        selectedGoals.includes(goal.id)
                          ? "border-primary bg-primary/5 shadow-glow"
                          : "border-border/50 bg-card hover:border-primary/50"
                      )}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                        selectedGoals.includes(goal.id) ? "bg-primary/20" : "bg-muted"
                      )}>
                        <goal.icon className={cn(
                          "w-5 h-5",
                          selectedGoals.includes(goal.id) ? "text-primary" : "text-muted-foreground"
                        )} />
                      </div>
                      <div>
                        <span className="font-semibold block">{goal.label}</span>
                      </div>
                      {selectedGoals.includes(goal.id) && (
                        <Check className="w-5 h-5 text-primary ml-auto" />
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 4: Ready */}
            {STEPS[currentStep].id === 'ready' && (
              <motion.div
                key="ready"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center space-y-8"
              >
                <motion.div 
                  className="w-24 h-24 rounded-full bg-green-500/10 flex items-center justify-center mx-auto"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                >
                  <Check className="w-12 h-12 text-green-500" />
                </motion.div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">
                    You're all set! 🎉
                  </h2>
                  <p className="text-muted-foreground max-w-md mx-auto">
                    Your content empire awaits. Let's create your first viral series in{' '}
                    <span className="text-primary font-medium">
                      {NICHES.find(n => n.id === selectedNiche)?.label || 'your niche'}
                    </span>.
                  </p>
                </div>
                <Card className="max-w-sm mx-auto">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary">Your Setup</Badge>
                    </div>
                    <div className="space-y-2 text-left">
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>Niche: <span className="font-medium">{NICHES.find(n => n.id === selectedNiche)?.label}</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-500" />
                        <span>Goals: <span className="font-medium">{selectedGoals.length} selected</span></span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 0}
              className={currentStep === 0 ? 'invisible' : ''}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            {currentStep === STEPS.length - 1 ? (
              <Button onClick={handleComplete} size="lg" className="shadow-glow" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Create My First Series
                    <Sparkles className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                size="lg"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}