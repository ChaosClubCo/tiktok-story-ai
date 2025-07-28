import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Circle, ArrowLeft, ArrowRight, Sparkles } from "lucide-react";

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
    callToAction: ""
  });

  const [steps] = useState<WorkflowStep[]>([
    { id: 1, title: "Basic Setup", description: "Define your script's foundation", completed: false },
    { id: 2, title: "Target Audience", description: "Identify your viewers", completed: false },
    { id: 3, title: "Content Strategy", description: "Plan your viral elements", completed: false },
    { id: 4, title: "Engagement Hooks", description: "Create compelling openings", completed: false },
    { id: 5, title: "Call to Action", description: "Drive viewer engagement", completed: false }
  ]);

  const handleNext = () => {
    if (currentStep < 5) {
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

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep >= step.id 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-secondary text-secondary-foreground'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <Circle className="w-5 h-5" />
                  )}
                </div>
                <div className="mt-2 text-center">
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-xs text-muted-foreground">{step.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-4 ${
                  currentStep > step.id ? 'bg-primary' : 'bg-secondary'
                }`} />
              )}
            </div>
          ))}
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
          disabled={currentStep === 5}
        >
          Next
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default ScriptWorkflow;