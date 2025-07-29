import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Video, Upload, Settings, Download, Play, Pause } from "lucide-react";

interface VideoGenerationParams {
  script: string;
  style: string;
  duration: string;
  aspectRatio: string;
  voiceOver: boolean;
  backgroundMusic: boolean;
}

export const AIVideoGeneration = () => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [videoParams, setVideoParams] = useState<VideoGenerationParams>({
    script: "",
    style: "modern",
    duration: "15",
    aspectRatio: "9:16",
    voiceOver: true,
    backgroundMusic: true
  });

  const videoStyles = [
    { id: "modern", name: "Modern", description: "Clean, minimalist aesthetic" },
    { id: "cinematic", name: "Cinematic", description: "Movie-like quality" },
    { id: "animated", name: "Animated", description: "2D/3D animation style" },
    { id: "realistic", name: "Realistic", description: "Photorealistic scenes" }
  ];

  const handleGenerate = async () => {
    if (!videoParams.script.trim()) {
      toast({
        title: "Error",
        description: "Please provide a script for video generation",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      // Simulate video generation with progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 500);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      clearInterval(progressInterval);
      setProgress(100);
      
      // Mock generated video URL
      setGeneratedVideo("https://example.com/generated-video.mp4");
      
      toast({
        title: "Video Generated Successfully",
        description: "Your AI-generated video is ready for download"
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate video. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="w-5 h-5" />
          AI Video Generation
        </CardTitle>
        <CardDescription>
          Transform your scripts into engaging videos with AI-powered generation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="generate" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generate">Generate</TabsTrigger>
            <TabsTrigger value="customize">Customize</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="script">Script Content</Label>
                <Textarea
                  id="script"
                  placeholder="Enter your script content here..."
                  value={videoParams.script}
                  onChange={(e) => setVideoParams(prev => ({ ...prev, script: e.target.value }))}
                  className="min-h-32"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Select value={videoParams.duration} onValueChange={(value) => 
                    setVideoParams(prev => ({ ...prev, duration: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 seconds</SelectItem>
                      <SelectItem value="30">30 seconds</SelectItem>
                      <SelectItem value="60">1 minute</SelectItem>
                      <SelectItem value="90">1.5 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
                  <Select value={videoParams.aspectRatio} onValueChange={(value) => 
                    setVideoParams(prev => ({ ...prev, aspectRatio: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="9:16">9:16 (TikTok/Instagram)</SelectItem>
                      <SelectItem value="16:9">16:9 (YouTube)</SelectItem>
                      <SelectItem value="1:1">1:1 (Square)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Generating video...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? "Generating..." : "Generate Video"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="customize" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Video Style</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {videoStyles.map((style) => (
                    <Card 
                      key={style.id}
                      className={`cursor-pointer transition-all ${
                        videoParams.style === style.id 
                          ? 'ring-2 ring-primary' 
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => setVideoParams(prev => ({ ...prev, style: style.id }))}
                    >
                      <CardContent className="p-4">
                        <h4 className="font-medium">{style.name}</h4>
                        <p className="text-sm text-muted-foreground">{style.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Audio Options</Label>
                <div className="flex gap-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={videoParams.voiceOver}
                      onChange={(e) => setVideoParams(prev => ({ ...prev, voiceOver: e.target.checked }))}
                    />
                    <span>AI Voice-Over</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={videoParams.backgroundMusic}
                      onChange={(e) => setVideoParams(prev => ({ ...prev, backgroundMusic: e.target.checked }))}
                    />
                    <span>Background Music</span>
                  </label>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="preview" className="space-y-6">
            {generatedVideo ? (
              <div className="space-y-4">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <Video className="w-12 h-12 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Video Preview</p>
                    <div className="flex gap-2 justify-center">
                      <Button size="sm" variant="outline">
                        <Play className="w-4 h-4 mr-1" />
                        Play
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Duration:</span>
                    <p className="font-medium">{videoParams.duration}s</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Style:</span>
                    <p className="font-medium capitalize">{videoParams.style}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Format:</span>
                    <p className="font-medium">{videoParams.aspectRatio}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Video className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Generate a video to see preview</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};