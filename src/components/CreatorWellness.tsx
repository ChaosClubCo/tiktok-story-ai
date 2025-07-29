import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Heart, Brain, Calendar, TrendingUp, Clock, Target } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface WellnessMetrics {
  burnoutRisk: number;
  contentVelocity: number;
  engagementScore: number;
  weeklyGoals: number;
}

export const CreatorWellness = () => {
  const { toast } = useToast();
  const [metrics] = useState<WellnessMetrics>({
    burnoutRisk: 25,
    contentVelocity: 85,
    engagementScore: 72,
    weeklyGoals: 60
  });

  const [wellnessMode, setWellnessMode] = useState(false);

  const handleWellnessBreak = () => {
    setWellnessMode(true);
    toast({
      title: "Wellness Mode Activated",
      description: "Taking breaks improves creativity by 40%. Your content will thank you!",
    });
  };

  const getBurnoutColor = (risk: number) => {
    if (risk < 30) return "text-green-600";
    if (risk < 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          Creator Wellness Dashboard
        </CardTitle>
        <CardDescription>
          Monitor your creative health and prevent burnout with AI-powered insights
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Burnout Risk Assessment */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              <span className="font-medium">Burnout Risk</span>
            </div>
            <Badge variant={metrics.burnoutRisk < 30 ? "default" : metrics.burnoutRisk < 60 ? "secondary" : "destructive"}>
              {metrics.burnoutRisk}% Risk
            </Badge>
          </div>
          <Progress value={metrics.burnoutRisk} className="h-2" />
          <p className={`text-sm ${getBurnoutColor(metrics.burnoutRisk)}`}>
            {metrics.burnoutRisk < 30 ? "You're in a healthy creative flow!" : 
             metrics.burnoutRisk < 60 ? "Consider taking short breaks between content sessions" :
             "High burnout risk detected. Time for a wellness break!"}
          </p>
        </div>

        {/* Content Velocity */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="font-medium">Content Velocity</span>
            </div>
            <Badge variant="outline">{metrics.contentVelocity}%</Badge>
          </div>
          <Progress value={metrics.contentVelocity} className="h-2" />
          <p className="text-sm text-muted-foreground">
            You're producing content {metrics.contentVelocity > 80 ? "rapidly" : "steadily"}. 
            {metrics.contentVelocity > 90 && " Consider slowing down to maintain quality."}
          </p>
        </div>

        {/* Weekly Goals */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span className="font-medium">Weekly Goals Progress</span>
            </div>
            <Badge variant="outline">{metrics.weeklyGoals}%</Badge>
          </div>
          <Progress value={metrics.weeklyGoals} className="h-2" />
        </div>

        {/* Wellness Actions */}
        <div className="pt-4 border-t space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Wellness Recommendations
          </h4>
          
          {!wellnessMode ? (
            <div className="space-y-2">
              <Button 
                onClick={handleWellnessBreak}
                variant="outline" 
                className="w-full justify-start"
              >
                <Clock className="w-4 h-4 mr-2" />
                Take a 15-minute wellness break
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm">
                  Generate relaxing content
                </Button>
                <Button variant="outline" size="sm">
                  Schedule content breaks
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-300">
                🧘‍♀️ Wellness mode active. Your next script will focus on positive, uplifting content.
              </p>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setWellnessMode(false)}
                className="mt-2"
              >
                Resume normal mode
              </Button>
            </div>
          )}
        </div>

        {/* AI Insights */}
        <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
          <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">AI Wellness Insight</h5>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Based on your content velocity, consider batching similar content types. 
            Studies show this reduces decision fatigue by 35% and improves creative output.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};