import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Eye, Heart, Share2, Zap, Target, BarChart3, Sparkles } from "lucide-react";

interface PredictionMetric {
  label: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
}

const Predictions = () => {
  const { loading } = useAuth();
  const [selectedScript, setSelectedScript] = useState("recent");

  const viralScore = 87;
  const engagementPrediction = 92;
  const shareabilityScore = 79;

  const metrics: PredictionMetric[] = [
    {
      label: "Predicted Views",
      value: 85,
      trend: 'up',
      icon: <Eye className="w-5 h-5" />
    },
    {
      label: "Engagement Rate",
      value: 92,
      trend: 'up',
      icon: <Heart className="w-5 h-5" />
    },
    {
      label: "Share Potential",
      value: 79,
      trend: 'stable',
      icon: <Share2 className="w-5 h-5" />
    },
    {
      label: "Hook Effectiveness",
      value: 94,
      trend: 'up',
      icon: <Zap className="w-5 h-5" />
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading predictions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-base">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-gradient-drama px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-primary-foreground" />
            <span className="text-sm font-semibold text-primary-foreground">AI-Powered Predictions</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-drama bg-clip-text text-transparent mb-4">
            Viral Potential Analysis
          </h1>
          <p className="text-lg text-muted-foreground">
            Predict your script's performance before you film with advanced AI analytics
          </p>
        </div>

        {/* Viral Score Card */}
        <Card floating className="mb-8 border-primary/20 bg-gradient-card">
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <div className="inline-block relative">
                <svg className="w-48 h-48" viewBox="0 0 200 200">
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="hsl(var(--border))"
                    strokeWidth="12"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="12"
                    strokeDasharray={`${viralScore * 5.65} 565`}
                    strokeLinecap="round"
                    transform="rotate(-90 100 100)"
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="hsl(var(--primary))" />
                      <stop offset="100%" stopColor="hsl(var(--secondary))" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-5xl font-bold bg-gradient-drama bg-clip-text text-transparent">
                    {viralScore}
                  </span>
                  <span className="text-sm text-muted-foreground">Viral Score</span>
                </div>
              </div>
            </div>
            
            <div className="text-center max-w-md mx-auto">
              <Badge variant="secondary" className="mb-2 bg-success/20 text-success border-success/30">
                High Viral Potential
              </Badge>
              <p className="text-muted-foreground">
                This script has strong indicators for viral success based on trending patterns and engagement metrics
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <Card key={index} elevated className="transition-all hover:shadow-floating">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {metric.icon}
                  </div>
                  <Badge variant={metric.trend === 'up' ? 'default' : 'outline'}>
                    {metric.trend === 'up' && '↑'} {metric.value}%
                  </Badge>
                </div>
                <h3 className="font-semibold mb-2">{metric.label}</h3>
                <Progress value={metric.value} className="h-2" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detailed Analysis */}
        <Tabs defaultValue="breakdown" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="optimize">Optimize</TabsTrigger>
          </TabsList>

          <TabsContent value="breakdown" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card elevated>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Hook Analysis
                  </CardTitle>
                  <CardDescription>First 3 seconds performance prediction</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Attention Grab</span>
                      <span className="text-sm font-semibold">94%</span>
                    </div>
                    <Progress value={94} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Curiosity Gap</span>
                      <span className="text-sm font-semibold">88%</span>
                    </div>
                    <Progress value={88} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Pattern Interrupt</span>
                      <span className="text-sm font-semibold">91%</span>
                    </div>
                    <Progress value={91} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card elevated>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Content Structure
                  </CardTitle>
                  <CardDescription>Pacing and retention analysis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Story Flow</span>
                      <span className="text-sm font-semibold">89%</span>
                    </div>
                    <Progress value={89} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Pacing Variety</span>
                      <span className="text-sm font-semibold">76%</span>
                    </div>
                    <Progress value={76} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Climax Placement</span>
                      <span className="text-sm font-semibold">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="insights">
            <Card elevated>
              <CardHeader>
                <CardTitle>AI-Generated Insights</CardTitle>
                <CardDescription>Key factors driving your viral potential</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4 p-4 bg-success/10 rounded-lg border border-success/20">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-success/20 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-success" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Strong Opening Hook</h4>
                    <p className="text-sm text-muted-foreground">
                      Your first 3 seconds create immediate curiosity - 94% above average
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-warning/10 rounded-lg border border-warning/20">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-warning/20 rounded-full flex items-center justify-center">
                      <Zap className="w-5 h-5 text-warning" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Mid-Section Pacing</h4>
                    <p className="text-sm text-muted-foreground">
                      Consider adding a mini-twist at the 15-second mark to maintain momentum
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-info/10 rounded-lg border border-info/20">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-info/20 rounded-full flex items-center justify-center">
                      <Share2 className="w-5 h-5 text-info" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Share Triggers Present</h4>
                    <p className="text-sm text-muted-foreground">
                      Contains 3 relatable moments that encourage sharing with friends
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="optimize">
            <Card elevated>
              <CardHeader>
                <CardTitle>Optimization Suggestions</CardTitle>
                <CardDescription>AI recommendations to boost viral potential</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: "Enhance the hook", impact: "High", desc: "Add a pattern interrupt in the first frame" },
                  { title: "Adjust pacing", impact: "Medium", desc: "Speed up seconds 10-15 by 1.5x" },
                  { title: "Strengthen CTA", impact: "Medium", desc: "Make the call-to-action more explicit" },
                  { title: "Add trending audio", impact: "High", desc: "Consider using trending sound #viral2024" },
                ].map((suggestion, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-background-elevated rounded-lg border border-border/50">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-semibold">{suggestion.title}</h4>
                        <Badge variant={suggestion.impact === 'High' ? 'default' : 'outline'} className="text-xs">
                          {suggestion.impact} Impact
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{suggestion.desc}</p>
                    </div>
                    <Button variant="ghost" size="sm">Apply</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Predictions;
