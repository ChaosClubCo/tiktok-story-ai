import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, ArrowLeft, ArrowRight, Sparkles, Calendar, Clock, Hash, TrendingUp, Zap } from "lucide-react";

interface WorkflowStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

interface ScriptData {
  niche: string;
  length: string;
  tone: string;
  topic: string;
  targetAudience: string;
  keywords: string[];
  hooks: string[];
  callToAction: string;
  visualStyle: string;
  sceneDescriptions: string[];
  audioStrategy: string;
  musicType: string;
  characters: string[];
  scriptStructure: string;
  dialogueNarration: string;
  visualEffects: string[];
  timingNotes: string;
  hashtags: string[];
  postingTime: string;
  successMetrics: string[];
}

const ScriptWorkflow = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [scriptData, setScriptData] = useState<ScriptData>({
    niche: "",
    length: "",
    tone: "",
    topic: "",
    targetAudience: "",
    keywords: [],
    hooks: [],
    callToAction: "",
    visualStyle: "",
    sceneDescriptions: [],
    audioStrategy: "",
    musicType: "",
    characters: [],
    scriptStructure: "",
    dialogueNarration: "",
    visualEffects: [],
    timingNotes: "",
    hashtags: [],
    postingTime: "",
    successMetrics: []
  });

  const [steps] = useState<WorkflowStep[]>([
    { id: 1, title: "Basic Setup", description: "Define your script's foundation", completed: false },
    { id: 2, title: "Target Audience", description: "Identify your viewers", completed: false },
    { id: 3, title: "Content Strategy", description: "Plan your viral elements", completed: false },
    { id: 4, title: "Engagement Hooks", description: "Create compelling openings", completed: false },
    { id: 5, title: "Call to Action", description: "Drive viewer engagement", completed: false },
    { id: 6, title: "Visual Planning", description: "Plan your visual style and scenes", completed: false },
    { id: 7, title: "Audio Strategy", description: "Choose music and sound design", completed: false },
    { id: 8, title: "Character Development", description: "Define characters and personas", completed: false },
    { id: 9, title: "Script Structure", description: "Organize your story flow", completed: false },
    { id: 10, title: "Dialogue & Narration", description: "Write your script content", completed: false },
    { id: 11, title: "Visual Effects", description: "Plan special effects and transitions", completed: false },
    { id: 12, title: "Timing & Pacing", description: "Perfect your video timing", completed: false },
    { id: 13, title: "Hashtag Strategy", description: "Optimize for discoverability", completed: false },
    { id: 14, title: "Posting Schedule", description: "Plan your release timing", completed: false },
    { id: 15, title: "Success Metrics", description: "Define your success goals", completed: false }
  ]);

  const handleNext = () => {
    if (currentStep < 15) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addKeyword = (keyword: string) => {
    if (keyword && !scriptData.keywords.includes(keyword)) {
      setScriptData(prev => ({
        ...prev,
        keywords: [...prev.keywords, keyword]
      }));
    }
  };

  const removeKeyword = (keyword: string) => {
    setScriptData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(k => k !== keyword)
    }));
  };

  const addHook = (hook: string) => {
    if (hook && !scriptData.hooks.includes(hook)) {
      setScriptData(prev => ({
        ...prev,
        hooks: [...prev.hooks, hook]
      }));
    }
  };

  const removeHook = (hook: string) => {
    setScriptData(prev => ({
      ...prev,
      hooks: prev.hooks.filter(h => h !== hook)
    }));
  };

  // Helper functions for new data types
  const addSceneDescription = (scene: string) => {
    if (scene && !scriptData.sceneDescriptions.includes(scene)) {
      setScriptData(prev => ({
        ...prev,
        sceneDescriptions: [...prev.sceneDescriptions, scene]
      }));
    }
  };

  const removeSceneDescription = (scene: string) => {
    setScriptData(prev => ({
      ...prev,
      sceneDescriptions: prev.sceneDescriptions.filter(s => s !== scene)
    }));
  };

  const addCharacter = (character: string) => {
    if (character && !scriptData.characters.includes(character)) {
      setScriptData(prev => ({
        ...prev,
        characters: [...prev.characters, character]
      }));
    }
  };

  const removeCharacter = (character: string) => {
    setScriptData(prev => ({
      ...prev,
      characters: prev.characters.filter(c => c !== character)
    }));
  };

  const addVisualEffect = (effect: string) => {
    if (effect && !scriptData.visualEffects.includes(effect)) {
      setScriptData(prev => ({
        ...prev,
        visualEffects: [...prev.visualEffects, effect]
      }));
    }
  };

  const removeVisualEffect = (effect: string) => {
    setScriptData(prev => ({
      ...prev,
      visualEffects: prev.visualEffects.filter(e => e !== effect)
    }));
  };

  const addHashtag = (hashtag: string) => {
    const cleanHashtag = hashtag.startsWith('#') ? hashtag : `#${hashtag}`;
    if (cleanHashtag && !scriptData.hashtags.includes(cleanHashtag)) {
      setScriptData(prev => ({
        ...prev,
        hashtags: [...prev.hashtags, cleanHashtag]
      }));
    }
  };

  const removeHashtag = (hashtag: string) => {
    setScriptData(prev => ({
      ...prev,
      hashtags: prev.hashtags.filter(h => h !== hashtag)
    }));
  };

  const addSuccessMetric = (metric: string) => {
    if (metric && !scriptData.successMetrics.includes(metric)) {
      setScriptData(prev => ({
        ...prev,
        successMetrics: [...prev.successMetrics, metric]
      }));
    }
  };

  const removeSuccessMetric = (metric: string) => {
    setScriptData(prev => ({
      ...prev,
      successMetrics: prev.successMetrics.filter(m => m !== metric)
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="niche">Niche</Label>
              <Select onValueChange={(value) => setScriptData(prev => ({ ...prev, niche: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your niche" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comedy">Comedy</SelectItem>
                  <SelectItem value="lifestyle">Lifestyle</SelectItem>
                  <SelectItem value="education">Education</SelectItem>
                  <SelectItem value="drama">Drama</SelectItem>
                  <SelectItem value="motivation">Motivation</SelectItem>
                  <SelectItem value="horror">Horror</SelectItem>
                  <SelectItem value="romance">Romance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="length">Script Length</Label>
              <Select onValueChange={(value) => setScriptData(prev => ({ ...prev, length: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select script length" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15-30 seconds">15-30 seconds</SelectItem>
                  <SelectItem value="30-60 seconds">30-60 seconds</SelectItem>
                  <SelectItem value="1-2 minutes">1-2 minutes</SelectItem>
                  <SelectItem value="2-3 minutes">2-3 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select onValueChange={(value) => setScriptData(prev => ({ ...prev, tone: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="funny">Funny</SelectItem>
                  <SelectItem value="serious">Serious</SelectItem>
                  <SelectItem value="dramatic">Dramatic</SelectItem>
                  <SelectItem value="inspiring">Inspiring</SelectItem>
                  <SelectItem value="mysterious">Mysterious</SelectItem>
                  <SelectItem value="casual">Casual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic">Topic/Theme</Label>
              <Textarea
                id="topic"
                placeholder="Describe your script topic or theme..."
                value={scriptData.topic}
                onChange={(e) => setScriptData(prev => ({ ...prev, topic: e.target.value }))}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Textarea
                id="targetAudience"
                placeholder="Describe your target audience (age, interests, demographics)..."
                value={scriptData.targetAudience}
                onChange={(e) => setScriptData(prev => ({ ...prev, targetAudience: e.target.value }))}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p><strong>Tips for defining your audience:</strong></p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Age range (Gen Z, Millennials, etc.)</li>
                <li>Interests and hobbies</li>
                <li>Pain points or challenges</li>
                <li>Platform behavior patterns</li>
              </ul>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Trending Keywords</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add relevant keywords..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addKeyword(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    addKeyword(input.value);
                    input.value = '';
                  }}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {scriptData.keywords.map((keyword, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeKeyword(keyword)}
                  >
                    {keyword} ×
                  </Badge>
                ))}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <p><strong>Content Strategy Tips:</strong></p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Use trending hashtags and keywords</li>
                <li>Create relatable scenarios</li>
                <li>Include current events or memes</li>
                <li>Plan for shareability</li>
              </ul>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Viral Hooks</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add compelling opening lines..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addHook(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    addHook(input.value);
                    input.value = '';
                  }}
                >
                  Add
                </Button>
              </div>
              <div className="space-y-2 mt-2">
                {scriptData.hooks.map((hook, index) => (
                  <div
                    key={index}
                    className="p-2 border rounded cursor-pointer hover:bg-secondary/50"
                    onClick={() => removeHook(hook)}
                  >
                    <p className="text-sm">{hook}</p>
                    <span className="text-xs text-muted-foreground">Click to remove</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <p><strong>Effective Hook Examples:</strong></p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>"POV: You just realized..."</li>
                <li>"Tell me you're [X] without telling me..."</li>
                <li>"This will blow your mind..."</li>
                <li>"Wait for it..."</li>
              </ul>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="callToAction">Call to Action</Label>
              <Textarea
                id="callToAction"
                placeholder="How do you want viewers to engage? (like, comment, share, follow)..."
                value={scriptData.callToAction}
                onChange={(e) => setScriptData(prev => ({ ...prev, callToAction: e.target.value }))}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p><strong>Strong CTA Examples:</strong></p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>"Drop a 🔥 if you agree"</li>
                <li>"Follow for more [niche] content"</li>
                <li>"Share this with someone who needs to see it"</li>
                <li>"Comment your thoughts below"</li>
                <li>"Save this for later"</li>
              </ul>
            </div>
            <div className="mt-6 p-4 bg-secondary/30 rounded-lg">
              <h4 className="font-medium mb-2">Your Script Foundation:</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Niche:</strong> {scriptData.niche}</p>
                <p><strong>Length:</strong> {scriptData.length}</p>
                <p><strong>Tone:</strong> {scriptData.tone}</p>
                <p><strong>Keywords:</strong> {scriptData.keywords.join(', ')}</p>
                <p><strong>Hooks:</strong> {scriptData.hooks.length} created</p>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="visualStyle">Visual Style</Label>
              <Select onValueChange={(value) => setScriptData(prev => ({ ...prev, visualStyle: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select visual style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cinematic">Cinematic</SelectItem>
                  <SelectItem value="casual">Casual/Raw</SelectItem>
                  <SelectItem value="minimalist">Minimalist</SelectItem>
                  <SelectItem value="colorful">Colorful/Vibrant</SelectItem>
                  <SelectItem value="dark">Dark/Moody</SelectItem>
                  <SelectItem value="bright">Bright/Energetic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Scene Descriptions</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Describe a scene (e.g., 'Close-up of character looking surprised')..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addSceneDescription(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    addSceneDescription(input.value);
                    input.value = '';
                  }}
                >
                  Add
                </Button>
              </div>
              <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
                {scriptData.sceneDescriptions.map((scene, index) => (
                  <div
                    key={index}
                    className="p-2 border rounded cursor-pointer hover:bg-secondary/50"
                    onClick={() => removeSceneDescription(scene)}
                  >
                    <p className="text-sm">{scene}</p>
                    <span className="text-xs text-muted-foreground">Click to remove</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="musicType">Music Type</Label>
              <Select onValueChange={(value) => setScriptData(prev => ({ ...prev, musicType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select music type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trending">Trending TikTok Audio</SelectItem>
                  <SelectItem value="original">Original Music</SelectItem>
                  <SelectItem value="instrumental">Instrumental</SelectItem>
                  <SelectItem value="voiceover">Voiceover Only</SelectItem>
                  <SelectItem value="sound-effects">Sound Effects</SelectItem>
                  <SelectItem value="silent">Silent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="audioStrategy">Audio Strategy</Label>
              <Textarea
                id="audioStrategy"
                placeholder="Describe your audio strategy (mood, timing, sync with visuals)..."
                value={scriptData.audioStrategy}
                onChange={(e) => setScriptData(prev => ({ ...prev, audioStrategy: e.target.value }))}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p><strong>Audio Tips:</strong></p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Match audio to video energy</li>
                <li>Use trending sounds for better reach</li>
                <li>Sync beat drops with visual moments</li>
                <li>Consider captions for accessibility</li>
              </ul>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Characters/Personas</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add character (e.g., 'Main character - confident teen')..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addCharacter(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    addCharacter(input.value);
                    input.value = '';
                  }}
                >
                  Add
                </Button>
              </div>
              <div className="space-y-2 mt-2">
                {scriptData.characters.map((character, index) => (
                  <div
                    key={index}
                    className="p-2 border rounded cursor-pointer hover:bg-secondary/50"
                    onClick={() => removeCharacter(character)}
                  >
                    <p className="text-sm">{character}</p>
                    <span className="text-xs text-muted-foreground">Click to remove</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <p><strong>Character Development Tips:</strong></p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Make characters relatable to your audience</li>
                <li>Give them clear motivations</li>
                <li>Consider age, personality, and background</li>
                <li>Think about their role in the story</li>
              </ul>
            </div>
          </div>
        );

      case 9:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="scriptStructure">Script Structure</Label>
              <Textarea
                id="scriptStructure"
                placeholder="Outline your story structure (beginning, middle, end, plot points)..."
                value={scriptData.scriptStructure}
                onChange={(e) => setScriptData(prev => ({ ...prev, scriptStructure: e.target.value }))}
                rows={6}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p><strong>TikTok Structure Framework:</strong></p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>Hook (0-3s):</strong> Grab attention immediately</li>
                <li><strong>Setup (3-10s):</strong> Establish context</li>
                <li><strong>Conflict/Twist (10-20s):</strong> Create tension</li>
                <li><strong>Resolution (20-30s):</strong> Payoff/conclusion</li>
                <li><strong>CTA (Last 3s):</strong> Drive engagement</li>
              </ul>
            </div>
          </div>
        );

      case 10:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dialogueNarration">Dialogue & Narration</Label>
              <Textarea
                id="dialogueNarration"
                placeholder="Write your script dialogue and narration..."
                value={scriptData.dialogueNarration}
                onChange={(e) => setScriptData(prev => ({ ...prev, dialogueNarration: e.target.value }))}
                rows={8}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p><strong>Writing Tips:</strong></p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Use conversational, authentic language</li>
                <li>Keep sentences short and punchy</li>
                <li>Include emotional words and expressions</li>
                <li>Write for your target audience's vocabulary</li>
                <li>Consider text overlays for key points</li>
              </ul>
            </div>
          </div>
        );

      case 11:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Visual Effects & Transitions</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add visual effect (e.g., 'Zoom transition', 'Text overlay')..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addVisualEffect(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    addVisualEffect(input.value);
                    input.value = '';
                  }}
                >
                  Add
                </Button>
              </div>
              <div className="space-y-2 mt-2">
                {scriptData.visualEffects.map((effect, index) => (
                  <div
                    key={index}
                    className="p-2 border rounded cursor-pointer hover:bg-secondary/50"
                    onClick={() => removeVisualEffect(effect)}
                  >
                    <p className="text-sm">{effect}</p>
                    <span className="text-xs text-muted-foreground">Click to remove</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <p><strong>Popular TikTok Effects:</strong></p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Speed ramping (slow-mo/fast forward)</li>
                <li>Text overlays and captions</li>
                <li>Jump cuts and quick transitions</li>
                <li>Split screen effects</li>
                <li>Green screen backgrounds</li>
              </ul>
            </div>
          </div>
        );

      case 12:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="timingNotes">Timing & Pacing Notes</Label>
              <Textarea
                id="timingNotes"
                placeholder="Detail your timing strategy (when to pause, speed up, emphasize)..."
                value={scriptData.timingNotes}
                onChange={(e) => setScriptData(prev => ({ ...prev, timingNotes: e.target.value }))}
                rows={5}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p><strong>Timing Best Practices:</strong></p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>First 3 seconds:</strong> Most critical for retention</li>
                <li><strong>Beat matching:</strong> Sync cuts with music beats</li>
                <li><strong>Pause strategy:</strong> Build suspense before reveals</li>
                <li><strong>Quick cuts:</strong> Maintain high energy</li>
                <li><strong>Loop potential:</strong> End connects to beginning</li>
              </ul>
            </div>
          </div>
        );

      case 13:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Hashtag Strategy</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add hashtag (with or without #)..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addHashtag(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    addHashtag(input.value);
                    input.value = '';
                  }}
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {scriptData.hashtags.map((hashtag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => removeHashtag(hashtag)}
                  >
                    {hashtag} ×
                  </Badge>
                ))}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <p><strong>Hashtag Strategy:</strong></p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Mix trending and niche hashtags</li>
                <li>Use 3-5 relevant hashtags maximum</li>
                <li>Include one broad, one medium, one specific</li>
                <li>Research hashtag performance in your niche</li>
                <li>Consider location-based hashtags if relevant</li>
              </ul>
            </div>
          </div>
        );

      case 14:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="postingTime">Optimal Posting Time</Label>
              <Select onValueChange={(value) => setScriptData(prev => ({ ...prev, postingTime: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select posting time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6-9am">6-9 AM (Morning commute)</SelectItem>
                  <SelectItem value="12-3pm">12-3 PM (Lunch break)</SelectItem>
                  <SelectItem value="7-9pm">7-9 PM (Prime time)</SelectItem>
                  <SelectItem value="9-11pm">9-11 PM (Evening wind-down)</SelectItem>
                  <SelectItem value="weekend-morning">Weekend Morning</SelectItem>
                  <SelectItem value="weekend-evening">Weekend Evening</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-sm text-muted-foreground">
              <p><strong>Posting Schedule Tips:</strong></p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Test different times to find your audience's peak</li>
                <li>Consider your audience's time zone</li>
                <li>Tuesday-Thursday often perform best</li>
                <li>Avoid posting during major events</li>
                <li>Consistency is key - maintain regular schedule</li>
                <li>Monitor your analytics for optimal times</li>
              </ul>
            </div>
          </div>
        );

      case 15:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Success Metrics</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add success metric (e.g., '1000 views in first hour')..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addSuccessMetric(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    addSuccessMetric(input.value);
                    input.value = '';
                  }}
                >
                  Add
                </Button>
              </div>
              <div className="space-y-2 mt-2">
                {scriptData.successMetrics.map((metric, index) => (
                  <div
                    key={index}
                    className="p-2 border rounded cursor-pointer hover:bg-secondary/50"
                    onClick={() => removeSuccessMetric(metric)}
                  >
                    <p className="text-sm">{metric}</p>
                    <span className="text-xs text-muted-foreground">Click to remove</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <p><strong>Key Performance Indicators:</strong></p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>Views:</strong> Reach and exposure</li>
                <li><strong>Likes:</strong> Content quality indicator</li>
                <li><strong>Comments:</strong> Engagement depth</li>
                <li><strong>Shares:</strong> Viral potential</li>
                <li><strong>Saves:</strong> Content value</li>
                <li><strong>Completion rate:</strong> Content retention</li>
              </ul>
            </div>
            <div className="mt-6 p-4 bg-secondary/30 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Complete Script Overview:
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Foundation:</strong></p>
                  <p>• Niche: {scriptData.niche}</p>
                  <p>• Length: {scriptData.length}</p>
                  <p>• Tone: {scriptData.tone}</p>
                </div>
                <div>
                  <p><strong>Strategy:</strong></p>
                  <p>• Keywords: {scriptData.keywords.length}</p>
                  <p>• Hooks: {scriptData.hooks.length}</p>
                  <p>• Hashtags: {scriptData.hashtags.length}</p>
                </div>
                <div>
                  <p><strong>Production:</strong></p>
                  <p>• Style: {scriptData.visualStyle}</p>
                  <p>• Scenes: {scriptData.sceneDescriptions.length}</p>
                  <p>• Effects: {scriptData.visualEffects.length}</p>
                </div>
                <div>
                  <p><strong>Performance:</strong></p>
                  <p>• Posting: {scriptData.postingTime}</p>
                  <p>• Metrics: {scriptData.successMetrics.length}</p>
                  <p>• Characters: {scriptData.characters.length}</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="relative">
            <div className="w-full bg-secondary h-2 rounded-full">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / steps.length) * 100}%` }}
              />
            </div>
            <div className="absolute -top-1 bg-primary w-4 h-4 rounded-full border-2 border-background transition-all duration-300"
                 style={{ left: `calc(${(currentStep / steps.length) * 100}% - 8px)` }}
            />
          </div>
          
          {/* Step Indicators */}
          <div className="grid grid-cols-5 gap-2">
            {steps.map((step) => (
              <div key={step.id} className="text-center">
                <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-medium ${
                  currentStep >= step.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-secondary-foreground'
                }`}>
                  {step.id}
                </div>
                <p className="text-xs font-medium mt-1 leading-tight">{step.title}</p>
                <p className="text-xs text-muted-foreground leading-tight">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            {steps[currentStep - 1]?.title}
          </CardTitle>
          <CardDescription>
            {steps[currentStep - 1]?.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <div className="text-sm text-muted-foreground">
          Step {currentStep} of {steps.length}
        </div>
        <Button
          onClick={handleNext}
          disabled={currentStep === 15}
        >
          Next
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default ScriptWorkflow;