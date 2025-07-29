import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, DollarSign, Eye, Heart, Share2, MessageCircle, Target, Calendar } from "lucide-react";

interface ContentMetrics {
  title: string;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  revenue: number;
  viralScore: number;
  date: string;
}

export const PerformanceTracker = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("7d");
  
  const [contentMetrics] = useState<ContentMetrics[]>([
    {
      title: "Office Hierarchy Drama",
      views: 2300000,
      likes: 340000,
      shares: 45000,
      comments: 23000,
      revenue: 1200,
      viralScore: 94,
      date: "2024-01-20"
    },
    {
      title: "Best Friend Betrayal",
      views: 1800000,
      likes: 280000,
      shares: 38000,
      comments: 19000,
      revenue: 950,
      viralScore: 87,
      date: "2024-01-19"
    },
    {
      title: "Family Secret Revealed",
      views: 1600000,
      likes: 245000,
      shares: 32000,
      comments: 16000,
      revenue: 840,
      viralScore: 82,
      date: "2024-01-18"
    }
  ]);

  const engagementData = [
    { name: 'Mon', views: 1200, engagement: 8.2 },
    { name: 'Tue', views: 1900, engagement: 12.1 },
    { name: 'Wed', views: 3000, engagement: 15.8 },
    { name: 'Thu', views: 2800, engagement: 18.2 },
    { name: 'Fri', views: 3900, engagement: 22.4 },
    { name: 'Sat', views: 4200, engagement: 25.1 },
    { name: 'Sun', views: 3800, engagement: 21.8 }
  ];

  const revenueData = [
    { name: 'Views', value: 35, color: '#8884d8' },
    { name: 'Sponsorships', value: 45, color: '#82ca9d' },
    { name: 'Merch', value: 20, color: '#ffc658' }
  ];

  const totalRevenue = contentMetrics.reduce((sum, content) => sum + content.revenue, 0);
  const totalViews = contentMetrics.reduce((sum, content) => sum + content.views, 0);
  const avgViralScore = Math.round(contentMetrics.reduce((sum, content) => sum + content.viralScore, 0) / contentMetrics.length);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart className="w-5 h-5 text-green-500" />
          Performance Analytics
        </CardTitle>
        <CardDescription>
          Track your content performance and ROI with detailed metrics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">Total Views</span>
                </div>
                <p className="text-2xl font-bold">{(totalViews / 1000000).toFixed(1)}M</p>
                <p className="text-xs text-green-600">+23% vs last week</p>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium">Revenue</span>
                </div>
                <p className="text-2xl font-bold">${totalRevenue}</p>
                <p className="text-xs text-green-600">+15% vs last week</p>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium">Viral Score</span>
                </div>
                <p className="text-2xl font-bold">{avgViralScore}%</p>
                <p className="text-xs text-green-600">+8% vs last week</p>
              </Card>
              
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium">Engagement</span>
                </div>
                <p className="text-2xl font-bold">18.2%</p>
                <p className="text-xs text-green-600">+12% vs last week</p>
              </Card>
            </div>

            {/* Engagement Chart */}
            <Card className="p-4">
              <h4 className="font-medium mb-4">Weekly Engagement Trend</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={engagementData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Line type="monotone" dataKey="engagement" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            {/* ROI Calculator */}
            <Card className="p-4">
              <h4 className="font-medium mb-4">ROI Analysis</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Cost per video</p>
                  <p className="text-lg font-bold">$45</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Revenue per video</p>
                  <p className="text-lg font-bold">${(totalRevenue / contentMetrics.length).toFixed(0)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ROI</p>
                  <p className="text-lg font-bold text-green-600">+{Math.round(((totalRevenue / contentMetrics.length) / 45 - 1) * 100)}%</p>
                </div>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="content" className="space-y-4">
            <div className="space-y-3">
              {contentMetrics.map((content, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium">{content.title}</h4>
                      <p className="text-sm text-muted-foreground">{content.date}</p>
                    </div>
                    <Badge variant={content.viralScore > 90 ? "default" : content.viralScore > 80 ? "secondary" : "outline"}>
                      {content.viralScore}% viral
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <Eye className="w-4 h-4 mx-auto mb-1 text-blue-500" />
                      <p className="font-medium">{(content.views / 1000000).toFixed(1)}M</p>
                      <p className="text-muted-foreground">Views</p>
                    </div>
                    <div className="text-center">
                      <Heart className="w-4 h-4 mx-auto mb-1 text-red-500" />
                      <p className="font-medium">{(content.likes / 1000).toFixed(0)}K</p>
                      <p className="text-muted-foreground">Likes</p>
                    </div>
                    <div className="text-center">
                      <Share2 className="w-4 h-4 mx-auto mb-1 text-green-500" />
                      <p className="font-medium">{(content.shares / 1000).toFixed(0)}K</p>
                      <p className="text-muted-foreground">Shares</p>
                    </div>
                    <div className="text-center">
                      <DollarSign className="w-4 h-4 mx-auto mb-1 text-yellow-500" />
                      <p className="font-medium">${content.revenue}</p>
                      <p className="text-muted-foreground">Revenue</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="revenue" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h4 className="font-medium mb-4">Revenue Sources</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={revenueData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {revenueData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </Card>
              
              <Card className="p-4">
                <h4 className="font-medium mb-4">Revenue Optimization</h4>
                <div className="space-y-3">
                  <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                      💡 Drama content generates 40% more revenue
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                      📈 Peak posting time: 7-9 PM for max revenue
                    </p>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                      🎯 Add CTAs to increase conversion by 25%
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="goals" className="space-y-4">
            <div className="space-y-4">
              <Card className="p-4">
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Monthly Goals Progress
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">10M Views</span>
                      <span className="text-sm font-medium">7.2M / 10M</span>
                    </div>
                    <Progress value={72} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">$5K Revenue</span>
                      <span className="text-sm font-medium">$3.2K / $5K</span>
                    </div>
                    <Progress value={64} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">20 Viral Videos</span>
                      <span className="text-sm font-medium">13 / 20</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Content Calendar Optimization
                </h4>
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">Based on your performance data:</p>
                  <ul className="space-y-1">
                    <li>• Monday: Relationship drama (+30% engagement)</li>
                    <li>• Wednesday: Plot twist content (+45% shares)</li>
                    <li>• Friday: Cliffhanger series (+60% retention)</li>
                    <li>• Sunday: Behind-the-scenes (+25% authenticity)</li>
                  </ul>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};