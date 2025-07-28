import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { NicheSelector } from "@/components/NicheSelector";
import { ScriptControls } from "@/components/ScriptControls";
import { ScriptPreview } from "@/components/ScriptPreview";
import heroImage from "@/assets/hero-drama.jpg";

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
  const [selectedNiche, setSelectedNiche] = useState<string | null>(null);
  const [length, setLength] = useState("60s");
  const [tone, setTone] = useState("funny");
  const [trendingTopic, setTrendingTopic] = useState("");
  const [script, setScript] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!selectedNiche) {
      toast({
        title: "Select a Niche",
        description: "Please choose a drama niche first!",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generation delay
    setTimeout(() => {
      const generatedScript = generateMockScript(selectedNiche, length, tone, trendingTopic);
      setScript(generatedScript);
      setIsGenerating(false);
      
      toast({
        title: "🎬 Script Generated!",
        description: "Your viral TikTok script is ready!",
      });
    }, 2000);
  };

  const handleExport = () => {
    toast({
      title: "Coming Soon!",
      description: "Connect to Supabase to save and share your scripts!",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <div className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="MiniDrama Hero" 
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/60 to-background"></div>
        </div>
        
        <div className="relative text-center space-y-6 px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-drama bg-clip-text text-transparent">
            MiniDrama
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Generate viral TikTok scripts with AI. Choose your drama niche, set the vibe, and create content that goes viral.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <span>🎬 Scene-by-scene breakdown</span>
            <span>🎵 Sound suggestions</span>
            <span>📱 TikTok-optimized</span>
            <span>✨ AI-powered</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 space-y-8">
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

        {/* Footer */}
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">
            Need backend features like saving scripts? Connect to{" "}
            <span className="text-primary font-semibold">Supabase</span> via the green button above! 
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;