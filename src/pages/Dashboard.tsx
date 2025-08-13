import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import ScriptWorkflow from "@/components/ScriptWorkflow";
import ScriptGenerator from "@/components/ScriptGenerator";
import { CreatorWellness } from "@/components/CreatorWellness";
import { ViralTopicFinder } from "@/components/ViralTopicFinder";
import { PerformanceTracker } from "@/components/PerformanceTracker";
import { FastValueDelivery } from "@/components/FastValueDelivery";
import { SocialProofCapture } from "@/components/SocialProofCapture";
import { VisualCreativeHooks } from "@/components/VisualCreativeHooks";
import { ChatFeedbackRewards } from "@/components/ChatFeedbackRewards";
import { AIVideoGeneration } from "@/components/AIVideoGeneration";
import { AIScriptOptimization } from "@/components/AIScriptOptimization";
import { VoiceToneConsistency } from "@/components/VoiceToneConsistency";
import { ContentCalendarIntegration } from "@/components/ContentCalendarIntegration";
import { MultiPlatformAdaptation } from "@/components/MultiPlatformAdaptation";
import { CreatorMarketplace } from "@/components/CreatorMarketplace";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Zap, Workflow, TrendingUp, FileText, Heart, Target, Rocket, Users, Palette, MessageCircle, Video, Sparkles, Mic, Calendar, Share2, Store } from "lucide-react";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("workflow");

  // useEffect(() => {
  //   if (!loading && !user) {
  //     navigate("/auth");
  //   }
  // }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // if (!user) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-center space-y-4">
  //         <h2 className="text-2xl font-bold">Please sign in</h2>
  //         <Button onClick={() => navigate("/auth")}>
  //           Go to Login
  //         </Button>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Script Creation Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Create viral TikTok scripts with our advanced workflow and AI-powered tools
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/analytics")}>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Analytics</h3>
              <p className="text-sm text-muted-foreground">View performance</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/templates")}>
            <CardContent className="p-4 text-center">
              <FileText className="w-8 h-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Templates</h3>
              <p className="text-sm text-muted-foreground">Browse library</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate("/my-scripts")}>
            <CardContent className="p-4 text-center">
              <Zap className="w-8 h-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">My Scripts</h3>
              <p className="text-sm text-muted-foreground">Manage scripts</p>
            </CardContent>
          </Card>
          
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab("workflow")}>
            <CardContent className="p-4 text-center">
              <Workflow className="w-8 h-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">New Script</h3>
              <p className="text-sm text-muted-foreground">Start creating</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:grid-cols-15 gap-1">
            <TabsTrigger value="workflow" className="flex items-center gap-1 text-xs">
              <Workflow className="w-3 h-3" />
              <span className="hidden sm:inline">Workflow</span>
            </TabsTrigger>
            <TabsTrigger value="generator" className="flex items-center gap-1 text-xs">
              <Zap className="w-3 h-3" />
              <span className="hidden sm:inline">Generator</span>
            </TabsTrigger>
            <TabsTrigger value="topics" className="flex items-center gap-1 text-xs">
              <TrendingUp className="w-3 h-3" />
              <span className="hidden sm:inline">Topics</span>
            </TabsTrigger>
            <TabsTrigger value="wellness" className="flex items-center gap-1 text-xs">
              <Heart className="w-3 h-3" />
              <span className="hidden sm:inline">Wellness</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-1 text-xs">
              <Target className="w-3 h-3" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="fast-delivery" className="flex items-center gap-1 text-xs">
              <Rocket className="w-3 h-3" />
              <span className="hidden sm:inline">Fast</span>
            </TabsTrigger>
            <TabsTrigger value="social-proof" className="flex items-center gap-1 text-xs">
              <Users className="w-3 h-3" />
              <span className="hidden sm:inline">Social</span>
            </TabsTrigger>
            <TabsTrigger value="visual-hooks" className="flex items-center gap-1 text-xs">
              <Palette className="w-3 h-3" />
              <span className="hidden sm:inline">Visual</span>
            </TabsTrigger>
            <TabsTrigger value="chat-rewards" className="flex items-center gap-1 text-xs">
              <MessageCircle className="w-3 h-3" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="ai-video" className="flex items-center gap-1 text-xs">
              <Video className="w-3 h-3" />
              <span className="hidden sm:inline">AI Video</span>
            </TabsTrigger>
            <TabsTrigger value="optimization" className="flex items-center gap-1 text-xs">
              <Sparkles className="w-3 h-3" />
              <span className="hidden sm:inline">Optimize</span>
            </TabsTrigger>
            <TabsTrigger value="voice-tone" className="flex items-center gap-1 text-xs">
              <Mic className="w-3 h-3" />
              <span className="hidden sm:inline">Voice</span>
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-1 text-xs">
              <Calendar className="w-3 h-3" />
              <span className="hidden sm:inline">Calendar</span>
            </TabsTrigger>
            <TabsTrigger value="platform" className="flex items-center gap-1 text-xs">
              <Share2 className="w-3 h-3" />
              <span className="hidden sm:inline">Platform</span>
            </TabsTrigger>
            <TabsTrigger value="marketplace" className="flex items-center gap-1 text-xs">
              <Store className="w-3 h-3" />
              <span className="hidden sm:inline">Market</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="workflow" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="w-5 h-5" />
                  Professional Script Workflow
                </CardTitle>
                <CardDescription>
                  Follow our comprehensive 15-step process to create viral TikTok scripts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScriptWorkflow />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="generator" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  AI-Powered Script Generator
                </CardTitle>
                <CardDescription>
                  Generate scripts instantly with advanced AI technology
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScriptGenerator />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="topics" className="space-y-6">
            <ViralTopicFinder />
          </TabsContent>
          
          <TabsContent value="wellness" className="space-y-6">
            <CreatorWellness />
          </TabsContent>
          
          <TabsContent value="performance" className="space-y-6">
            <PerformanceTracker />
          </TabsContent>
          
          <TabsContent value="fast-delivery" className="space-y-6">
            <FastValueDelivery />
          </TabsContent>
          
          <TabsContent value="social-proof" className="space-y-6">
            <SocialProofCapture />
          </TabsContent>
          
          <TabsContent value="visual-hooks" className="space-y-6">
            <VisualCreativeHooks />
          </TabsContent>
          
          <TabsContent value="chat-rewards" className="space-y-6">
            <ChatFeedbackRewards />
          </TabsContent>
          
          <TabsContent value="ai-video" className="space-y-6">
            <AIVideoGeneration />
          </TabsContent>
          
          <TabsContent value="optimization" className="space-y-6">
            <AIScriptOptimization />
          </TabsContent>
          
          <TabsContent value="voice-tone" className="space-y-6">
            <VoiceToneConsistency />
          </TabsContent>
          
          <TabsContent value="calendar" className="space-y-6">
            <ContentCalendarIntegration />
          </TabsContent>
          
          <TabsContent value="platform" className="space-y-6">
            <MultiPlatformAdaptation />
          </TabsContent>
          
          <TabsContent value="marketplace" className="space-y-6">
            <CreatorMarketplace />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;