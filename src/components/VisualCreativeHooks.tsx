import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, Video, Palette, Sparkles, Wand2, Download, Eye, Zap } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Effect {
  icon: string;
  name: string;
  description: string;
}

export const VisualCreativeHooks = () => {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVisual, setGeneratedVisual] = useState<string | null>(null);

  const visualStyles = [
    { id: "dramatic", name: "Dramatic Cinematic", description: "High contrast, moody lighting" },
    { id: "vibrant", name: "Vibrant Pop", description: "Bright colors, energetic" },
    { id: "minimalist", name: "Clean Minimalist", description: "Simple, elegant design" },
    { id: "retro", name: "Retro Aesthetic", description: "Vintage film look" },
    { id: "neon", name: "Neon Cyberpunk", description: "Futuristic, glowing effects" }
  ];

  const quickPrompts = [
    "Person dramatically revealing shocking news with exaggerated facial expression",
    "Split screen showing 'expectation vs reality' moment",
    "Close-up reaction shot with text overlay revealing plot twist",
    "Before and after transformation with dramatic lighting change",
    "Multiple people reacting to same situation with different emotions"
  ];

  const videoEffects = [
    { name: "Zoom Transition", description: "Quick zoom for emphasis", icon: "🎯" },
    { name: "Speed Ramp", description: "Slow to fast motion", icon: "⚡" },
    { name: "Split Screen", description: "Show multiple angles", icon: "📱" },
    { name: "Text Reveal", description: "Animated text overlay", icon: "💬" },
    { name: "Color Grade", description: "Mood-based coloring", icon: "🎨" }
  ];

  const handleGenerateVisual = async () => {
    if (!prompt || !style) {
      toast({
        title: "Missing Information",
        description: "Please add a prompt and select a style",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI image generation
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock generated image URL (in real app, this would come from AI service)
    setGeneratedVisual("https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=500&h=500&fit=crop");
    setIsGenerating(false);
    
    toast({
      title: "🎨 Visual Generated!",
      description: "Your creative hook is ready for download",
    });
  };

  const handleEffectApply = (effect: Effect) => {
    toast({
      title: `${effect.icon} ${effect.name} Applied!`,
      description: effect.description,
    });
  };

  return (
    <Card className="bg-gradient-to-br from-card via-card to-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          Visual Creative Hooks
          <Badge variant="secondary" className="ml-auto">
            <Sparkles className="w-3 h-3 mr-1" />
            AI-Powered
          </Badge>
        </CardTitle>
        <CardDescription>
          Generate stunning visuals and effects like CapCut & Pixart
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generate">
              <Image className="w-4 h-4 mr-2" />
              Generate
            </TabsTrigger>
            <TabsTrigger value="effects">
              <Video className="w-4 h-4 mr-2" />
              Effects
            </TabsTrigger>
            <TabsTrigger value="templates">
              <Eye className="w-4 h-4 mr-2" />
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Visual Prompt</label>
                <Input
                  placeholder="Describe the visual you want to create..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Style</label>
                <Select onValueChange={setStyle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose visual style" />
                  </SelectTrigger>
                  <SelectContent>
                    {visualStyles.map((style) => (
                      <SelectItem key={style.id} value={style.id}>
                        <div>
                          <div className="font-medium">{style.name}</div>
                          <div className="text-xs text-muted-foreground">{style.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleGenerateVisual}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
              >
                {isGenerating ? (
                  <>
                    <Wand2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Visual...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Visual Hook
                  </>
                )}
              </Button>

              {/* Quick Prompts */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Quick Prompts:</h4>
                <div className="space-y-1">
                  {quickPrompts.map((quickPrompt, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-left h-auto p-2"
                      onClick={() => setPrompt(quickPrompt)}
                    >
                      <Zap className="w-3 h-3 mr-2 flex-shrink-0" />
                      <span className="text-xs">{quickPrompt}</span>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Generated Visual */}
              {generatedVisual && (
                <Card className="border-2 border-primary/20">
                  <CardContent className="p-4">
                    <div className="aspect-square rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 mb-3 flex items-center justify-center">
                      <div className="text-4xl">🎨</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <Download className="w-3 h-3 mr-2" />
                        Download
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="w-3 h-3 mr-2" />
                        Preview
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="effects" className="space-y-4">
            <div className="grid gap-3">
              <h3 className="font-semibold">Video Effects Library</h3>
              {videoEffects.map((effect, index) => (
                <Card key={index} className="border hover:border-primary/50 transition-colors">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{effect.icon}</span>
                        <div>
                          <h4 className="font-medium">{effect.name}</h4>
                          <p className="text-sm text-muted-foreground">{effect.description}</p>
                        </div>
                      </div>
                      <Button size="sm" onClick={() => handleEffectApply(effect)}>
                        Apply
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[
                { name: "Reaction Template", thumbnail: "😱", description: "Split reaction format" },
                { name: "Before/After", thumbnail: "🔄", description: "Transformation reveal" },
                { name: "Text Reveal", thumbnail: "💭", description: "Dramatic text overlay" },
                { name: "POV Format", thumbnail: "👀", description: "Point of view setup" }
              ].map((template, index) => (
                <Card key={index} className="cursor-pointer hover:border-primary/50 transition-colors">
                  <CardContent className="p-3 text-center">
                    <div className="text-4xl mb-2">{template.thumbnail}</div>
                    <h4 className="font-medium text-sm">{template.name}</h4>
                    <p className="text-xs text-muted-foreground">{template.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};