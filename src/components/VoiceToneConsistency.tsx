import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { 
  Mic, 
  User, 
  CheckCircle, 
  AlertTriangle, 
  Target, 
  BookOpen,
  Palette,
  Users
} from "lucide-react";

interface VoiceProfile {
  id: string;
  name: string;
  description: string;
  tone: string;
  style: string;
  vocabulary: string[];
  examples: string[];
}

interface ConsistencyCheck {
  aspect: string;
  score: number;
  status: 'good' | 'warning' | 'error';
  feedback: string;
}

export const VoiceToneConsistency = () => {
  const { toast } = useToast();
  const [selectedProfile, setSelectedProfile] = useState("");
  const [scriptText, setScriptText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [consistencyResults, setConsistencyResults] = useState<ConsistencyCheck[]>([]);
  const [overallScore, setOverallScore] = useState(0);

  const voiceProfiles: VoiceProfile[] = [
    {
      id: "casual-friend",
      name: "Casual Friend",
      description: "Friendly, approachable, conversational",
      tone: "Warm and relatable",
      style: "Informal, personal",
      vocabulary: ["hey", "guys", "awesome", "totally", "honestly"],
      examples: ["Hey guys! So I just discovered this amazing trick...", "You're gonna love this!"]
    },
    {
      id: "expert-authority",
      name: "Expert Authority",
      description: "Knowledgeable, confident, professional",
      tone: "Authoritative yet accessible",
      style: "Informative, structured",
      vocabulary: ["research shows", "evidence suggests", "experts recommend", "proven method"],
      examples: ["Studies have consistently shown that...", "The data clearly indicates..."]
    },
    {
      id: "energetic-motivator",
      name: "Energetic Motivator",
      description: "High-energy, inspiring, action-oriented",
      tone: "Enthusiastic and empowering",
      style: "Dynamic, encouraging",
      vocabulary: ["amazing", "incredible", "transform", "unleash", "breakthrough"],
      examples: ["This is going to CHANGE YOUR LIFE!", "Get ready to transform everything!"]
    },
    {
      id: "storyteller",
      name: "Storyteller",
      description: "Narrative-focused, emotional, engaging",
      tone: "Compelling and immersive",
      style: "Story-driven, descriptive",
      vocabulary: ["imagine", "picture this", "suddenly", "little did I know", "meanwhile"],
      examples: ["Picture this: It was 3 AM and I couldn't sleep...", "Let me tell you a story that changed everything..."]
    }
  ];

  const mockConsistencyResults: ConsistencyCheck[] = [
    {
      aspect: "Tone Consistency",
      score: 85,
      status: 'good',
      feedback: "Voice tone matches your selected profile well"
    },
    {
      aspect: "Vocabulary Usage",
      score: 72,
      status: 'warning',
      feedback: "Consider using more profile-specific vocabulary"
    },
    {
      aspect: "Style Alignment",
      score: 90,
      status: 'good',
      feedback: "Writing style perfectly matches your voice profile"
    },
    {
      aspect: "Emotional Resonance",
      score: 65,
      status: 'warning',
      feedback: "Could enhance emotional connection with audience"
    }
  ];

  const handleAnalyze = async () => {
    if (!selectedProfile || !scriptText.trim()) {
      toast({
        title: "Error",
        description: "Please select a voice profile and enter script text",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      // Simulate analysis
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      setConsistencyResults(mockConsistencyResults);
      setOverallScore(Math.floor(mockConsistencyResults.reduce((acc, result) => acc + result.score, 0) / mockConsistencyResults.length));
      
      toast({
        title: "Analysis Complete",
        description: "Voice and tone consistency analysis finished"
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to analyze voice consistency. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-destructive" />;
      default:
        return <Target className="w-4 h-4" />;
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
          <Mic className="w-5 h-5" />
          Voice & Tone Consistency
        </CardTitle>
        <CardDescription>
          Maintain consistent voice and tone across all your content for stronger brand identity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Voice Profile</TabsTrigger>
            <TabsTrigger value="analyze">Analyze</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Select Your Voice Profile</label>
                <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a voice profile" />
                  </SelectTrigger>
                  <SelectContent>
                    {voiceProfiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.id}>
                        {profile.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedProfile && (
                <Card className="border-primary/20">
                  <CardContent className="p-4">
                    {(() => {
                      const profile = voiceProfiles.find(p => p.id === selectedProfile);
                      if (!profile) return null;
                      
                      return (
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium flex items-center gap-2">
                              <User className="w-4 h-4" />
                              {profile.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">{profile.description}</p>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h5 className="text-sm font-medium mb-2">Tone</h5>
                              <Badge variant="outline">{profile.tone}</Badge>
                            </div>
                            <div>
                              <h5 className="text-sm font-medium mb-2">Style</h5>
                              <Badge variant="outline">{profile.style}</Badge>
                            </div>
                          </div>

                          <div>
                            <h5 className="text-sm font-medium mb-2">Key Vocabulary</h5>
                            <div className="flex flex-wrap gap-1">
                              {profile.vocabulary.map((word, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  {word}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h5 className="text-sm font-medium mb-2">Example Phrases</h5>
                            <div className="space-y-2">
                              {profile.examples.map((example, index) => (
                                <div key={index} className="bg-muted p-2 rounded text-sm italic">
                                  "{example}"
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analyze" className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="script-analysis" className="text-sm font-medium">
                  Script to Analyze
                </label>
                <Textarea
                  id="script-analysis"
                  placeholder="Paste your script here to check voice and tone consistency..."
                  value={scriptText}
                  onChange={(e) => setScriptText(e.target.value)}
                  className="min-h-40 mt-2"
                />
              </div>

              {isAnalyzing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Analyzing voice consistency...</span>
                    <span>Processing</span>
                  </div>
                  <Progress value={undefined} className="animate-pulse" />
                </div>
              )}

              <Button 
                onClick={handleAnalyze} 
                disabled={isAnalyzing || !selectedProfile || !scriptText.trim()}
                className="w-full"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Voice Consistency"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            {consistencyResults.length > 0 ? (
              <div className="space-y-6">
                <Card className="border-primary/20">
                  <CardContent className="p-6 text-center">
                    <div className={`text-4xl font-bold mb-2 ${getScoreColor(overallScore)}`}>
                      {overallScore}%
                    </div>
                    <div className="text-sm text-muted-foreground">Overall Consistency Score</div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  {consistencyResults.map((result, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(result.status)}
                            <h4 className="font-medium">{result.aspect}</h4>
                          </div>
                          <div className={`text-lg font-bold ${getScoreColor(result.score)}`}>
                            {result.score}%
                          </div>
                        </div>
                        <Progress value={result.score} className="mb-2" />
                        <p className="text-sm text-muted-foreground">{result.feedback}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Recommendations
                  </h4>
                  <ul className="text-sm space-y-1">
                    <li>• Use more vocabulary specific to your chosen voice profile</li>
                    <li>• Maintain consistent emotional tone throughout</li>
                    <li>• Consider adding more personal touches to match your style</li>
                    <li>• Review successful scripts to identify patterns</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Palette className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Analyze a script to see consistency results</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};