import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { 
  Smartphone, 
  Copy, 
  Download, 
  Share2, 
  Clock, 
  Users, 
  TrendingUp,
  PlayCircle,
  ImageIcon,
  Hash
} from "lucide-react";

interface PlatformSpecs {
  name: string;
  icon: string;
  maxDuration: number;
  aspectRatio: string;
  hashtagLimit: number;
  characterLimit: number;
  tone: string;
  audience: string;
  peakTimes: string[];
}

interface AdaptedScript {
  platform: string;
  content: string;
  hashtags: string[];
  duration: string;
  tone: string;
  engagementTips: string[];
}

export const MultiPlatformAdaptation = () => {
  const { toast } = useToast();
  const [originalScript, setOriginalScript] = useState("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [isAdapting, setIsAdapting] = useState(false);
  const [adaptedScripts, setAdaptedScripts] = useState<AdaptedScript[]>([]);

  const platforms: PlatformSpecs[] = [
    {
      name: "TikTok",
      icon: "🎵",
      maxDuration: 60,
      aspectRatio: "9:16",
      hashtagLimit: 5,
      characterLimit: 300,
      tone: "Energetic, trendy",
      audience: "Gen Z, younger millennials",
      peakTimes: ["6-10am", "7-9pm"]
    },
    {
      name: "Instagram Reels",
      icon: "📸",
      maxDuration: 90,
      aspectRatio: "9:16",
      hashtagLimit: 10,
      characterLimit: 500,
      tone: "Aesthetic, lifestyle",
      audience: "Millennials, Gen Z",
      peakTimes: ["11am-1pm", "5-7pm"]
    },
    {
      name: "YouTube Shorts",
      icon: "🎥",
      maxDuration: 60,
      aspectRatio: "9:16",
      hashtagLimit: 3,
      characterLimit: 1000,
      tone: "Educational, entertaining",
      audience: "All ages",
      peakTimes: ["2-4pm", "8-10pm"]
    },
    {
      name: "Twitter",
      icon: "🐦",
      maxDuration: 30,
      aspectRatio: "16:9",
      hashtagLimit: 3,
      characterLimit: 280,
      tone: "Conversational, news-worthy",
      audience: "Professionals, news consumers",
      peakTimes: ["8-10am", "12-1pm"]
    },
    {
      name: "LinkedIn",
      icon: "💼",
      maxDuration: 30,
      aspectRatio: "1:1",
      hashtagLimit: 5,
      characterLimit: 1300,
      tone: "Professional, insightful",
      audience: "Business professionals",
      peakTimes: ["8-9am", "12-1pm", "5-6pm"]
    }
  ];

  const handlePlatformToggle = (platformName: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformName)
        ? prev.filter(p => p !== platformName)
        : [...prev, platformName]
    );
  };

  const handleAdaptScript = async () => {
    if (!originalScript.trim()) {
      toast({
        title: "Error",
        description: "Please enter a script to adapt",
        variant: "destructive"
      });
      return;
    }

    if (selectedPlatforms.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one platform",
        variant: "destructive"
      });
      return;
    }

    setIsAdapting(true);

    try {
      // Simulate adaptation process
      await new Promise(resolve => setTimeout(resolve, 2500));

      const adaptations: AdaptedScript[] = selectedPlatforms.map(platformName => {
        const platform = platforms.find(p => p.name === platformName)!;
        
        // Mock adaptation logic
        let adaptedContent = originalScript;
        
        // Adjust for platform specifics
        if (platform.name === "TikTok") {
          adaptedContent = `🔥 ${originalScript.substring(0, 250)} Drop a 💯 if you agree! #viral #fyp #trending`;
        } else if (platform.name === "Instagram Reels") {
          adaptedContent = `✨ ${originalScript.substring(0, 400)} Save this post for later! 💾`;
        } else if (platform.name === "YouTube Shorts") {
          adaptedContent = `${originalScript} \n\n🎯 Subscribe for more tips like this! What topic should we cover next?`;
        } else if (platform.name === "Twitter") {
          adaptedContent = originalScript.substring(0, 200) + "... [Thread 1/3]";
        } else if (platform.name === "LinkedIn") {
          adaptedContent = `Professional insight: ${originalScript}\n\nWhat's your experience with this? Share in the comments.`;
        }

        return {
          platform: platformName,
          content: adaptedContent,
          hashtags: generateHashtags(platformName, platform.hashtagLimit),
          duration: `${Math.min(platform.maxDuration, Math.max(15, Math.floor(originalScript.length / 10)))}s`,
          tone: platform.tone,
          engagementTips: generateEngagementTips(platformName)
        };
      });

      setAdaptedScripts(adaptations);
      
      toast({
        title: "Adaptation Complete",
        description: `Successfully adapted script for ${selectedPlatforms.length} platform(s)`
      });
    } catch (error) {
      toast({
        title: "Adaptation Failed",
        description: "Failed to adapt script. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAdapting(false);
    }
  };

  const generateHashtags = (platform: string, limit: number): string[] => {
    const hashtags = {
      "TikTok": ["#fyp", "#viral", "#trending", "#foryou", "#tiktok"],
      "Instagram Reels": ["#reels", "#instagram", "#explore", "#trending", "#viral", "#instagood"],
      "YouTube Shorts": ["#shorts", "#youtube", "#trending"],
      "Twitter": ["#thread", "#tip", "#insight"],
      "LinkedIn": ["#professional", "#business", "#growth", "#linkedin", "#career"]
    };
    
    return (hashtags[platform as keyof typeof hashtags] || []).slice(0, limit);
  };

  const generateEngagementTips = (platform: string): string[] => {
    const tips = {
      "TikTok": [
        "Use trending sounds and effects",
        "Post during peak hours: 6-10am, 7-9pm",
        "Hook viewers in first 3 seconds",
        "Add interactive elements like polls"
      ],
      "Instagram Reels": [
        "Use relevant hashtags in comments",
        "Add captions for accessibility",
        "Include a clear call-to-action",
        "Share to your story for more reach"
      ],
      "YouTube Shorts": [
        "Create eye-catching thumbnails",
        "Ask questions to encourage comments",
        "End with 'Subscribe for more'",
        "Use cards to link related content"
      ],
      "Twitter": [
        "Thread longer content",
        "Engage with replies quickly",
        "Use trending hashtags sparingly",
        "Pin important tweets"
      ],
      "LinkedIn": [
        "Share professional insights",
        "Tag relevant connections",
        "Use industry-specific hashtags",
        "Encourage professional discussion"
      ]
    };
    
    return tips[platform as keyof typeof tips] || [];
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copied",
      description: "Content copied to clipboard"
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5" />
          Multi-Platform Adaptation
        </CardTitle>
        <CardDescription>
          Automatically adapt your script content for different social media platforms
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="adapt" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="adapt">Adapt Script</TabsTrigger>
            <TabsTrigger value="platforms">Platform Specs</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="adapt" className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="original-script" className="text-sm font-medium">
                  Original Script
                </label>
                <Textarea
                  id="original-script"
                  placeholder="Enter your original script content here..."
                  value={originalScript}
                  onChange={(e) => setOriginalScript(e.target.value)}
                  className="min-h-32 mt-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-3 block">
                  Select Platforms to Adapt For
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {platforms.map((platform) => (
                    <Card
                      key={platform.name}
                      className={`cursor-pointer transition-all ${
                        selectedPlatforms.includes(platform.name)
                          ? 'ring-2 ring-primary bg-primary/5'
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => handlePlatformToggle(platform.name)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl mb-1">{platform.icon}</div>
                        <div className="font-medium text-sm">{platform.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {platform.maxDuration}s max
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleAdaptScript}
                disabled={isAdapting}
                className="w-full"
              >
                {isAdapting ? "Adapting..." : "Adapt for Selected Platforms"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="platforms" className="space-y-6">
            <div className="space-y-4">
              {platforms.map((platform) => (
                <Card key={platform.name}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">{platform.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-medium mb-2">{platform.name}</h4>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="text-muted-foreground">Duration</div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {platform.maxDuration}s max
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-muted-foreground">Aspect Ratio</div>
                            <div className="flex items-center gap-1">
                              <ImageIcon className="w-3 h-3" />
                              {platform.aspectRatio}
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-muted-foreground">Hashtags</div>
                            <div className="flex items-center gap-1">
                              <Hash className="w-3 h-3" />
                              {platform.hashtagLimit} max
                            </div>
                          </div>
                          
                          <div>
                            <div className="text-muted-foreground">Characters</div>
                            <div>{platform.characterLimit} max</div>
                          </div>
                        </div>

                        <div className="mt-3 space-y-2">
                          <div>
                            <span className="text-muted-foreground">Tone: </span>
                            <Badge variant="outline">{platform.tone}</Badge>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Audience: </span>
                            <span className="text-sm">{platform.audience}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Peak Times: </span>
                            <div className="flex gap-1 mt-1">
                              {platform.peakTimes.map((time, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {time}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            {adaptedScripts.length > 0 ? (
              <div className="space-y-6">
                {adaptedScripts.map((script, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <span>{platforms.find(p => p.name === script.platform)?.icon}</span>
                          {script.platform}
                        </CardTitle>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(script.content)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Adapted Content</label>
                        <div className="bg-muted p-3 rounded-md mt-1 text-sm">
                          {script.content}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="text-sm font-medium">Hashtags</label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {script.hashtags.map((hashtag, hashIndex) => (
                              <Badge key={hashIndex} variant="secondary" className="text-xs">
                                {hashtag}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Duration</label>
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm">{script.duration}</span>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Tone</label>
                          <Badge variant="outline" className="mt-1">
                            {script.tone}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Platform-Specific Tips</label>
                        <ul className="text-sm mt-1 space-y-1">
                          {script.engagementTips.slice(0, 3).map((tip, tipIndex) => (
                            <li key={tipIndex} className="flex items-start gap-2">
                              <span className="text-primary">•</span>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Share2 className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Adapt a script to see platform-specific versions</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};