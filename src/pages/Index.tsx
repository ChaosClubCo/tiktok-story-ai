import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Header } from "@/components/Header";
import { NicheSelector } from "@/components/NicheSelector";
import { ScriptControls } from "@/components/ScriptControls";
import { ScriptPreview } from "@/components/ScriptPreview";
import { SubscriptionTiers } from "@/components/SubscriptionTiers";
import { ScriptModeSelector, ScriptMode } from "@/components/ScriptModeSelector";
import { POVTemplateSelector } from "@/components/POVTemplateSelector";
import { TrendRadar } from "@/components/TrendRadar";
import { HookVariations } from "@/components/HookVariations";
import { Button } from "@/components/ui/button";
import { useSpecialEffects } from "@/hooks/useSpecialEffects";
import { CinematicHeroBackground } from "@/components/CinematicHeroBackground";
import { DifferentiationTable } from "@/components/DifferentiationTable";
import { LiveSocialProofFeed } from "@/components/LiveSocialProofFeed";
import { LandingViralPredictorCard } from "@/components/LandingViralPredictorCard";
import { SeriesShowcaseSection } from "@/components/SeriesShowcaseSection";
import { Sparkles, TrendingUp, Zap } from "lucide-react";

// Mock script generation - in real app, this would call an AI API
const generateMockScript = (niche: string, length: string, tone: string, topic: string) => {
  const scripts = {
    dating: {
      title: "Red Flag Restaurant Date",
      hook: "POV: He takes you to a restaurant and does THIS... 🚩",
      scenes: [
        {
          id: 1,
          timeStamp: "0-7s",
          dialogue: "So I thought this place looked fancy on Instagram...",
          action: "Nervous fidgeting with menu",
          visual: "Close-up of overpriced menu prices",
          sound: "Awkward silence, cutlery clinking"
        },
        {
          id: 2,
          timeStamp: "8-15s",
          dialogue: "Actually, can we split the bill? I'm saving for crypto...",
          action: "Pulls out phone to show crypto wallet",
          visual: "Reaction shot - eyes widening",
          sound: "Record scratch sound effect"
        },
        {
          id: 3,
          timeStamp: "16-23s",
          dialogue: "This is why I don't date anymore.",
          action: "Gets up and leaves",
          visual: "Walking away in slow motion",
          sound: "Dramatic music builds"
        },
        {
          id: 4,
          timeStamp: "24-30s",
          dialogue: "Ladies, the bar is in HELL.",
          action: "Direct address to camera",
          visual: "Text overlay: 'THE BAR IS IN HELL'",
          sound: "Viral TikTok audio clip"
        }
      ],
      hashtags: ["redflags", "dating", "storytime", "toxic", "fyp", "viral", "girlstalk"]
    },
    horror: {
      title: "3AM Doorbell Mystery",
      hook: "Someone rang my doorbell at 3AM and what I saw will haunt you...",
      scenes: [
        {
          id: 1,
          timeStamp: "0-10s",
          dialogue: "It's 3:17 AM and someone just rang my doorbell...",
          action: "Whispering, checking phone time",
          visual: "Dark room, phone screen showing 3:17 AM",
          sound: "Eerie doorbell echo"
        },
        {
          id: 2,
          timeStamp: "11-20s",
          dialogue: "I look through the peephole and see...",
          action: "Slowly approaching door",
          visual: "POV walking to door, shaky camera",
          sound: "Heartbeat, footsteps on creaky floor"
        },
        {
          id: 3,
          timeStamp: "21-30s",
          dialogue: "NOTHING. But the doorbell keeps ringing.",
          action: "Jumps back from door",
          visual: "Peephole view of empty hallway",
          sound: "Doorbell rings again, horror music sting"
        }
      ],
      hashtags: ["horror", "scary", "3am", "haunted", "creepy", "mystery", "fyp"]
    }
  };

  return scripts[niche as keyof typeof scripts] || scripts.dating;
};

const Index = () => {
  const { user, loading, subscription } = useAuth();
  const navigate = useNavigate();
  const [selectedNiche, setSelectedNiche] = useState<string | null>(null);
  const [length, setLength] = useState("60s");
  const [tone, setTone] = useState("funny");
  const [trendingTopic, setTrendingTopic] = useState("");
  const [scriptMode, setScriptMode] = useState<ScriptMode>('standard');
  const [selectedTrendId, setSelectedTrendId] = useState<string | null>(null);
  const [script, setScript] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { createConfetti, triggerRandomEffect } = useSpecialEffects();

  // useEffect(() => {
  //   if (!loading && !user) {
  //     navigate("/auth");
  //   }
  // }, [user, loading, navigate]);

  const handleGenerate = async () => {
    if (!selectedNiche || !user) {
      toast({
        title: "Select a Niche",
        description: "Please choose a drama niche first!",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      // Generate script using mock data (in real app, this would call an AI API)
      const generatedScript = generateMockScript(selectedNiche, length, tone, trendingTopic);
      
      // Save script to database
      const { error } = await supabase
        .from('scripts')
        .insert([{
          user_id: user.id,
          title: generatedScript.title,
          content: JSON.stringify(generatedScript),
          niche: selectedNiche,
          length,
          tone,
          topic: trendingTopic,
        }]);

      if (error) {
        throw error;
      }

      setScript(generatedScript);
      setIsGenerating(false);
      
      // Trigger confetti on successful generation
      createConfetti();
      
      toast({
        title: "🎬 Script Generated!",
        description: "Your viral TikTok script is ready and saved!",
      });
    } catch (error) {
      console.error('Error saving script:', error);
      setIsGenerating(false);
      toast({
        title: "Error",
        description: "Failed to save script. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    if (!script) return;
    
    const scriptText = `${script.title}\n\n${script.hook}\n\n${script.scenes.map((scene: any, index: number) => 
      `Scene ${index + 1} (${scene.timeStamp}):\n${scene.dialogue}\nAction: ${scene.action}\nVisual: ${scene.visual}\nSound: ${scene.sound}`
    ).join('\n\n')}\n\nHashtags: ${script.hashtags.map((tag: string) => `#${tag}`).join(' ')}`;
    
    const blob = new Blob([scriptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${script.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_script.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Script Exported!",
      description: "Your script has been downloaded as a text file.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // if (!user) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-center space-y-4">
  //         <h2 className="text-2xl font-bold">Please sign in</h2>
  //         <Button onClick={() => navigate("/auth")}>
  //           Go to Login
  //         </Button>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-background-base">
      <Header />
      
      {/* Cinematic Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <CinematicHeroBackground />
        
        <div className="relative z-10 text-center space-y-8 px-4 max-w-6xl mx-auto">
          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight">
              <span className="block bg-gradient-drama bg-clip-text text-transparent">
                Stop Creating.
              </span>
              <span className="block text-foreground">
                Start Building.
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The only AI platform that turns viral ideas into{" "}
              <span className="text-primary font-semibold">serialized content empires</span>
            </p>
          </div>

          {/* USP Cards */}
          <div className="grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto mt-12">
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 hover:bg-card/70 transition-all hover:shadow-glow group">
              <Sparkles className="w-8 h-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-foreground mb-2">Series Builder</h3>
              <p className="text-sm text-muted-foreground">
                Generate complete 5-10 episode series in one click
              </p>
            </div>
            
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 hover:bg-card/70 transition-all hover:shadow-glow-secondary group">
              <TrendingUp className="w-8 h-8 text-secondary mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-foreground mb-2">Viral Predictor</h3>
              <p className="text-sm text-muted-foreground">
                See your content's viral potential before posting
              </p>
            </div>
            
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 hover:bg-card/70 transition-all hover:shadow-glow group">
              <Zap className="w-8 h-8 text-info mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-foreground mb-2">Team Studio</h3>
              <p className="text-sm text-muted-foreground">
                Built for creator teams, not just solopreneurs
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 shadow-glow hover:shadow-glow hover:scale-105 transition-all"
              onClick={() => {
                document.getElementById('niche-selector')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Generate Your First Series
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6 hover:bg-card hover:scale-105 transition-all"
              onClick={() => navigate("/series")}
            >
              See How It Works
            </Button>
          </div>

          {/* Social Proof */}
          <p className="text-sm text-muted-foreground pt-8">
            30,000+ creators generated 1M+ scripts this month
          </p>
        </div>
      </section>

      {/* Viral Predictor Demo Widget */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <LandingViralPredictorCard />
        </div>
      </section>

      {/* Live Social Proof Feed */}
      <LiveSocialProofFeed />

      {/* Differentiation Table */}
      <DifferentiationTable />

      {/* Series Showcase */}
      <SeriesShowcaseSection />

      {/* Main Content */}
      <div id="niche-selector" className="container mx-auto px-4 py-16 space-y-16">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            <span className="bg-gradient-drama bg-clip-text text-transparent">
              Build Your Drama Empire
            </span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Generate multi-episode series designed to keep audiences hooked and algorithms happy
          </p>
        </div>

        {/* Niche Selection */}
        <NicheSelector 
          selectedNiche={selectedNiche}
          onNicheSelect={setSelectedNiche}
        />

        {/* Controls and Preview Grid */}
        {selectedNiche && (
          <div className="grid lg:grid-cols-2 gap-8">
            <ScriptControls
              length={length}
              tone={tone}
              trendingTopic={trendingTopic}
              onLengthChange={setLength}
              onToneChange={setTone}
              onTrendingTopicChange={setTrendingTopic}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
            
            <ScriptPreview
              script={script}
              onExport={handleExport}
            />
          </div>
        )}

        {/* Subscription Tiers Section */}
        <section className="py-12">
          <SubscriptionTiers currentTier={subscription?.subscription_tier} />
        </section>

        {/* Footer */}
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">
            Your scripts are automatically saved and accessible in{" "}
            <Button 
              variant="link" 
              className="text-primary font-semibold p-0 h-auto"
              onClick={() => navigate("/my-scripts")}
            >
              My Scripts
            </Button>
            {" "}section! ✨
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;