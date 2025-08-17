import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, Clock, TrendingUp, Target, Sparkles, Timer, Rocket, LucideIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface QuickTemplate {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: LucideIcon;
  result: string;
}

export const FastValueDelivery = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const quickTemplates: QuickTemplate[] = [
    {
      id: "instant-hook",
      title: "Instant Viral Hook",
      description: "3-second attention grabber",
      time: "5 seconds",
      icon: Zap,
      result: "POV: When you realize your crush has been dropping hints for months but you're too oblivious to notice..."
    },
    {
      id: "trend-hijack",
      title: "Trend Hijacker",
      description: "Jump on trending audio",
      time: "10 seconds", 
      icon: TrendingUp,
      result: "Using this trending sound to tell the story of my worst first date ever..."
    },
    {
      id: "instant-cta",
      title: "Conversion CTA",
      description: "High-converting call to action",
      time: "3 seconds",
      icon: Target,
      result: "Comment 'DRAMA' if you want the part 2 with even more tea ☕"
    }
  ];

  const handleQuickGenerate = async (template: QuickTemplate) => {
    setIsGenerating(true);
    setProgress(0);
    
    // Simulate fast generation with progress
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          toast({
            title: "✨ Instant Result Ready!",
            description: template.result,
          });
          return 100;
        }
        return prev + 20;
      });
    }, 200);
  };

  return (
    <Card className="bg-gradient-to-br from-card via-card to-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="w-5 h-5 text-primary" />
          Fast Value Delivery
          <Badge variant="secondary" className="ml-auto">
            <Timer className="w-3 h-3 mr-1" />
            &lt;30s results
          </Badge>
        </CardTitle>
        <CardDescription>
          Get instant results for immediate content creation needs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Generation Progress */}
        {isGenerating && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Generating instant content...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Instant Templates */}
        <div className="grid gap-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Instant Generators
          </h3>
          {quickTemplates.map((template) => (
            <Card key={template.id} className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <template.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">{template.title}</h4>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {template.time}
                    </Badge>
                    <Button
                      size="sm"
                      onClick={() => handleQuickGenerate(template)}
                      disabled={isGenerating}
                      className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      Generate
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Value Proposition */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">⚡ Why Fast Delivery Works</h3>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• Get instant content for trending moments</li>
            <li>• Test ideas quickly before full production</li>
            <li>• Overcome creative blocks with rapid prototypes</li>
            <li>• Maintain consistent posting schedule</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};