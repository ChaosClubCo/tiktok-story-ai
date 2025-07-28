import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Zap, Download, Save, Wand2, Sparkles } from "lucide-react";

interface GeneratedScript {
  title: string;
  hook: string;
  scenes: Array<{
    id: number;
    timeStamp: string;
    dialogue: string;
    action: string;
    visual: string;
    sound: string;
  }>;
  hashtags: string[];
  callToAction: string;
  viralScore: number;
}

const ScriptGenerator = () => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<GeneratedScript | null>(null);
  const [formData, setFormData] = useState({
    niche: "",
    length: "",
    tone: "",
    topic: "",
    targetAudience: "",
    trendingKeywords: "",
    visualStyle: "",
    musicType: ""
  });

  const handleGenerate = async () => {
    if (!formData.niche || !formData.length || !formData.tone || !formData.topic) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Call the generate-script edge function
      const { data, error } = await supabase.functions.invoke('generate-script', {
        body: {
          niche: formData.niche,
          length: formData.length,
          tone: formData.tone,
          topic: formData.topic,
          targetAudience: formData.targetAudience,
          trendingKeywords: formData.trendingKeywords,
          visualStyle: formData.visualStyle,
          musicType: formData.musicType
        }
      });

      if (error) throw error;

      setGeneratedScript(data.script);
      
      toast({
        title: "🎬 Script Generated!",
        description: "Your AI-powered TikTok script is ready!",
      });
    } catch (error) {
      console.error('Error generating script:', error);
      toast({
        title: "Generation Failed",
        description: "Unable to generate script. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveScript = async () => {
    if (!generatedScript || !user) return;

    try {
      const { error } = await supabase.functions.invoke('save-script', {
        body: {
          title: generatedScript.title,
          content: JSON.stringify(generatedScript),
          niche: formData.niche,
          length: formData.length,
          tone: formData.tone,
          topic: formData.topic
        }
      });

      if (error) throw error;

      toast({
        title: "Script Saved!",
        description: "Your script has been saved to your library.",
      });
    } catch (error) {
      console.error('Error saving script:', error);
      toast({
        title: "Save Failed",
        description: "Unable to save script. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportScript = () => {
    if (!generatedScript) return;
    
    const scriptText = `${generatedScript.title}\n\n${generatedScript.hook}\n\n${generatedScript.scenes.map((scene, index) => 
      `Scene ${index + 1} (${scene.timeStamp}):\n${scene.dialogue}\nAction: ${scene.action}\nVisual: ${scene.visual}\nSound: ${scene.sound}`
    ).join('\n\n')}\n\nCall to Action: ${generatedScript.callToAction}\n\nHashtags: ${generatedScript.hashtags.join(' ')}`;
    
    const blob = new Blob([scriptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedScript.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_script.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Script Exported!",
      description: "Your script has been downloaded as a text file.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="w-5 h-5" />
              Script Parameters
            </CardTitle>
            <CardDescription>
              Define your script requirements for AI generation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="niche">Niche *</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, niche: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select niche" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dating">Dating & Relationships</SelectItem>
                    <SelectItem value="horror">Horror & Scary</SelectItem>
                    <SelectItem value="comedy">Comedy & Humor</SelectItem>
                    <SelectItem value="drama">Drama & Storytelling</SelectItem>
                    <SelectItem value="lifestyle">Lifestyle & Daily Life</SelectItem>
                    <SelectItem value="motivation">Motivation & Self-Help</SelectItem>
                    <SelectItem value="mystery">Mystery & Suspense</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="length">Length *</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, length: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15-30s">15-30 seconds</SelectItem>
                    <SelectItem value="30-60s">30-60 seconds</SelectItem>
                    <SelectItem value="60-90s">1-1.5 minutes</SelectItem>
                    <SelectItem value="90-120s">1.5-2 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tone">Tone *</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, tone: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="funny">Funny & Humorous</SelectItem>
                    <SelectItem value="dramatic">Dramatic & Intense</SelectItem>
                    <SelectItem value="mysterious">Mysterious & Suspenseful</SelectItem>
                    <SelectItem value="inspirational">Inspirational & Uplifting</SelectItem>
                    <SelectItem value="casual">Casual & Relatable</SelectItem>
                    <SelectItem value="edgy">Edgy & Bold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="visualStyle">Visual Style</Label>
                <Select onValueChange={(value) => setFormData(prev => ({ ...prev, visualStyle: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cinematic">Cinematic</SelectItem>
                    <SelectItem value="casual">Casual/Raw</SelectItem>
                    <SelectItem value="minimalist">Minimalist</SelectItem>
                    <SelectItem value="colorful">Colorful/Vibrant</SelectItem>
                    <SelectItem value="dark">Dark/Moody</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">Topic/Theme *</Label>
              <Input
                id="topic"
                placeholder="e.g., 'First date disaster at fancy restaurant'"
                value={formData.topic}
                onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Input
                id="targetAudience"
                placeholder="e.g., 'Gen Z women, 18-25, interested in dating'"
                value={formData.targetAudience}
                onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trendingKeywords">Trending Keywords</Label>
              <Input
                id="trendingKeywords"
                placeholder="e.g., 'red flags, toxic behavior, dating advice'"
                value={formData.trendingKeywords}
                onChange={(e) => setFormData(prev => ({ ...prev, trendingKeywords: e.target.value }))}
              />
            </div>

            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Script...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Script with AI
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Quick Templates */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Start Templates</CardTitle>
            <CardDescription>
              Use these popular formats as starting points
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { label: "POV: Dating Red Flags", niche: "dating", tone: "dramatic", topic: "Restaurant date reveals red flags" },
                { label: "3AM Horror Story", niche: "horror", tone: "mysterious", topic: "Strange sounds at night" },
                { label: "Workplace Drama", niche: "drama", tone: "dramatic", topic: "Office gossip and confrontation" },
                { label: "Morning Routine Glow-Up", niche: "lifestyle", tone: "inspirational", topic: "Transforming morning habits" },
                { label: "Gym Bro Comedy", niche: "comedy", tone: "funny", topic: "Terrible gym pickup lines" }
              ].map((template, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left h-auto p-3"
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    niche: template.niche,
                    tone: template.tone,
                    topic: template.topic,
                    length: "30-60s"
                  }))}
                >
                  <div>
                    <p className="font-medium">{template.label}</p>
                    <p className="text-sm text-muted-foreground">{template.topic}</p>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Generated Script Preview */}
      {generatedScript && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Generated Script
              </CardTitle>
              <CardDescription>
                AI-generated TikTok script based on your parameters
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Viral Score: {generatedScript.viralScore}%
              </Badge>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleSaveScript}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportScript}>
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="script" className="space-y-4">
              <TabsList>
                <TabsTrigger value="script">Script Content</TabsTrigger>
                <TabsTrigger value="production">Production Notes</TabsTrigger>
                <TabsTrigger value="optimization">Optimization Tips</TabsTrigger>
              </TabsList>
              
              <TabsContent value="script" className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{generatedScript.title}</h3>
                  
                  <div className="bg-primary/5 p-4 rounded-lg mb-4">
                    <h4 className="font-medium mb-2">🎣 Viral Hook:</h4>
                    <p className="text-sm">{generatedScript.hook}</p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">🎬 Scene Breakdown:</h4>
                    {generatedScript.scenes.map((scene, index) => (
                      <div key={scene.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium">Scene {index + 1}</h5>
                          <Badge variant="outline">{scene.timeStamp}</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="font-medium text-muted-foreground">Dialogue:</p>
                            <p>"{scene.dialogue}"</p>
                          </div>
                          <div>
                            <p className="font-medium text-muted-foreground">Action:</p>
                            <p>{scene.action}</p>
                          </div>
                          <div>
                            <p className="font-medium text-muted-foreground">Visual:</p>
                            <p>{scene.visual}</p>
                          </div>
                          <div>
                            <p className="font-medium text-muted-foreground">Sound:</p>
                            <p>{scene.sound}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-secondary/30 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">📢 Call to Action:</h4>
                    <p className="text-sm">{generatedScript.callToAction}</p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">🏷️ Hashtags:</h4>
                    <div className="flex flex-wrap gap-2">
                      {generatedScript.hashtags.map((hashtag, index) => (
                        <Badge key={index} variant="secondary">
                          #{hashtag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="production" className="space-y-4">
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">🎥 Production Tips:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Use good lighting for all close-up shots</li>
                      <li>• Keep transitions quick and snappy</li>
                      <li>• Match audio levels between scenes</li>
                      <li>• Add captions for accessibility</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">🎵 Audio Recommendations:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Use trending audio for better reach</li>
                      <li>• Sync beat drops with visual moments</li>
                      <li>• Consider original audio for unique content</li>
                      <li>• Keep background music volume balanced</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="optimization" className="space-y-4">
                <div className="space-y-4">
                  <div className="bg-purple-50 dark:bg-purple-950/20 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">🚀 Viral Optimization:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Post during peak hours (7-9 PM)</li>
                      <li>• Engage with comments within first hour</li>
                      <li>• Cross-post to other social platforms</li>
                      <li>• Use 3-5 relevant hashtags maximum</li>
                    </ul>
                  </div>
                  
                  <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">📊 Performance Tracking:</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Monitor engagement rate in first 24 hours</li>
                      <li>• Track completion rate and adjust pacing</li>
                      <li>• Analyze which hooks perform best</li>
                      <li>• A/B test different versions of successful scripts</li>
                    </ul>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScriptGenerator;