import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import AnalyticsChart from "@/components/AnalyticsChart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, FileText, Eye, Heart, Share, Calendar, Download, Filter } from "lucide-react";

interface SavedScript {
  id: string;
  title: string;
  content: string;
  niche: string;
  length: string;
  tone: string;
  topic?: string;
  created_at: string;
  updated_at: string;
}

const Analytics = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [scripts, setScripts] = useState<SavedScript[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  const [nicheFilter, setNicheFilter] = useState("all");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    } else if (user) {
      fetchScripts();
    }
  }, [user, loading, navigate, fetchScripts]);

  const fetchScripts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('scripts')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScripts(data || []);
    } catch (error) {
      console.error('Error fetching scripts:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Mock analytics data - in real app, this would come from actual performance data
  const mockPerformanceData = scripts.map((script, index) => ({
    id: script.id,
    title: script.title,
    views: Math.floor(Math.random() * 100000) + 1000,
    likes: Math.floor(Math.random() * 10000) + 100,
    shares: Math.floor(Math.random() * 1000) + 10,
    comments: Math.floor(Math.random() * 500) + 5,
    engagement_rate: (Math.random() * 10 + 2).toFixed(1),
    created_at: script.created_at,
    niche: script.niche,
    performance_score: Math.floor(Math.random() * 40) + 60
  }));

  const totalViews = mockPerformanceData.reduce((sum, script) => sum + script.views, 0);
  const totalLikes = mockPerformanceData.reduce((sum, script) => sum + script.likes, 0);
  const totalShares = mockPerformanceData.reduce((sum, script) => sum + script.shares, 0);
  const avgEngagementRate = mockPerformanceData.length > 0 
    ? (mockPerformanceData.reduce((sum, script) => sum + parseFloat(script.engagement_rate), 0) / mockPerformanceData.length).toFixed(1)
    : 0;

  const filteredData = nicheFilter === "all" 
    ? mockPerformanceData 
    : mockPerformanceData.filter(script => script.niche === nicheFilter);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Please sign in</h2>
          <Button onClick={() => navigate("/auth")}>Go to Login</Button>
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
            Performance Analytics
          </h1>
          <p className="text-muted-foreground mt-2">
            Track your script performance and optimize your content strategy
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={nicheFilter} onValueChange={setNicheFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by niche" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All niches</SelectItem>
              <SelectItem value="dating">Dating</SelectItem>
              <SelectItem value="horror">Horror</SelectItem>
              <SelectItem value="comedy">Comedy</SelectItem>
              <SelectItem value="lifestyle">Lifestyle</SelectItem>
              <SelectItem value="drama">Drama</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            More Filters
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                  <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
                </div>
                <Eye className="h-8 w-8 text-blue-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                <span className="text-green-500">+12.3%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Likes</p>
                  <p className="text-2xl font-bold">{totalLikes.toLocaleString()}</p>
                </div>
                <Heart className="h-8 w-8 text-red-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                <span className="text-green-500">+8.7%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Shares</p>
                  <p className="text-2xl font-bold">{totalShares.toLocaleString()}</p>
                </div>
                <Share className="h-8 w-8 text-green-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                <span className="text-green-500">+15.2%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg. Engagement</p>
                  <p className="text-2xl font-bold">{avgEngagementRate}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-500" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                <span className="text-green-500">+2.1%</span> from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="scripts">Script Performance</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Over Time</CardTitle>
                <CardDescription>Views, likes, and engagement trends</CardDescription>
              </CardHeader>
              <CardContent>
                <AnalyticsChart data={filteredData} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="scripts" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Individual Script Performance</CardTitle>
                  <CardDescription>Detailed metrics for each script</CardDescription>
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export Data
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredData.map((script) => (
                    <div key={script.id} className="border rounded-lg p-4 hover:bg-secondary/50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{script.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{script.niche}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(script.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Badge 
                          variant={script.performance_score >= 80 ? "default" : script.performance_score >= 60 ? "secondary" : "destructive"}
                        >
                          {script.performance_score}% Score
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Views</p>
                          <p className="font-semibold">{script.views.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Likes</p>
                          <p className="font-semibold">{script.likes.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Shares</p>
                          <p className="font-semibold">{script.shares.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Engagement</p>
                          <p className="font-semibold">{script.engagement_rate}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Niches</CardTitle>
                  <CardDescription>Your best performing content categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {['dating', 'horror', 'comedy', 'drama'].map((niche, index) => {
                      const nichePerformance = mockPerformanceData.filter(s => s.niche === niche);
                      const avgScore = nichePerformance.length > 0 
                        ? nichePerformance.reduce((sum, s) => sum + s.performance_score, 0) / nichePerformance.length 
                        : 0;
                      
                      return (
                        <div key={niche} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium">{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-medium capitalize">{niche}</p>
                              <p className="text-sm text-muted-foreground">{nichePerformance.length} scripts</p>
                            </div>
                          </div>
                          <Badge variant="secondary">{avgScore.toFixed(0)}% avg</Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Content Insights</CardTitle>
                  <CardDescription>AI-powered recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        🎯 Trending Opportunity
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                        Horror content is performing 23% better this week. Consider creating more scary scenarios.
                      </p>
                    </div>
                    
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                        📈 Optimization Tip
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        Your dating scripts get 2x more engagement on weekends. Schedule accordingly.
                      </p>
                    </div>
                    
                    <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                        🚀 Growth Strategy
                      </p>
                      <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                        Scripts with 3-4 hashtags perform best. Avoid using more than 5.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Analytics;