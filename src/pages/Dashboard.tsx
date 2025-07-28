import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import ScriptWorkflow from "@/components/ScriptWorkflow";
import ScriptGenerator from "@/components/ScriptGenerator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Zap, Workflow, TrendingUp, FileText } from "lucide-react";

const Dashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("workflow");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Please sign in</h2>
          <Button onClick={() => navigate("/auth")}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

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
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="workflow" className="flex items-center gap-2">
              <Workflow className="w-4 h-4" />
              15-Step Workflow
            </TabsTrigger>
            <TabsTrigger value="generator" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              AI Generator
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
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;