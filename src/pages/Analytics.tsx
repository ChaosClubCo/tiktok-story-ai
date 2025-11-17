import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, FileText, Target, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';

interface Script {
  id: string;
  title: string;
  niche: string;
  created_at: string;
}

interface Prediction {
  id: string;
  script_id: string | null;
  title: string;
  niche: string | null;
  viral_score: number;
  engagement_score: number;
  shareability_score: number;
  hook_strength: number;
  emotional_impact: number;
  conflict_clarity: number;
  pacing_quality: number;
  dialogue_quality: number;
  quotability: number;
  relatability: number;
  prediction_type: string;
  created_at: string;
}

const Analytics = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30d");
  const [nicheFilter, setNicheFilter] = useState("all");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    } else if (user) {
      fetchData();
    }
  }, [user, loading, navigate]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [scriptsRes, predictionsRes] = await Promise.all([
        supabase.from('scripts').select('id, title, niche, created_at').eq('user_id', user?.id).order('created_at', { ascending: false }),
        supabase.from('predictions_history').select('*').eq('user_id', user?.id).order('created_at', { ascending: false })
      ]);

      if (scriptsRes.error) throw scriptsRes.error;
      if (predictionsRes.error) throw predictionsRes.error;

      setScripts(scriptsRes.data || []);
      setPredictions(predictionsRes.data || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredByTime = (data: any[]) => {
    const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : timeRange === "90d" ? 90 : timeRange === "1y" ? 365 : 999999;
    const cutoff = subDays(new Date(), days);
    return data.filter(item => new Date(item.created_at) >= cutoff);
  };

  const filteredPredictions = nicheFilter === "all" 
    ? getFilteredByTime(predictions)
    : getFilteredByTime(predictions).filter(p => p.niche === nicheFilter);

  const totalScripts = scripts.length;
  const totalPredictions = predictions.length;
  const avgViralScore = filteredPredictions.length > 0
    ? Math.round(filteredPredictions.reduce((sum, p) => sum + p.viral_score, 0) / filteredPredictions.length)
    : 0;

  const bestScript = filteredPredictions.reduce((best, p) => 
    (!best || p.viral_score > best.viral_score) ? p : best
  , null as Prediction | null);

  const firstFive = predictions.slice(-5);
  const lastFive = predictions.slice(0, 5);
  const avgFirst = firstFive.length > 0 ? firstFive.reduce((sum, p) => sum + p.viral_score, 0) / firstFive.length : 0;
  const avgLast = lastFive.length > 0 ? lastFive.reduce((sum, p) => sum + p.viral_score, 0) / lastFive.length : 0;
  const improvementRate = avgFirst > 0 ? Math.round(((avgLast - avgFirst) / avgFirst) * 100) : 0;

  const trendData = filteredPredictions.slice(0, 20).reverse().map((p) => ({
    date: format(new Date(p.created_at), 'MMM d'),
    viralScore: p.viral_score,
    engagement: p.engagement_score,
    shareability: p.shareability_score,
  }));

  const nicheStats = filteredPredictions.reduce((acc, p) => {
    const niche = p.niche || 'Unknown';
    if (!acc[niche]) {
      acc[niche] = { niche, count: 0, totalScore: 0, bestScore: 0 };
    }
    acc[niche].count++;
    acc[niche].totalScore += p.viral_score;
    acc[niche].bestScore = Math.max(acc[niche].bestScore, p.viral_score);
    return acc;
  }, {} as Record<string, { niche: string; count: number; totalScore: number; bestScore: number }>);

  const nichePerformance = Object.values(nicheStats).map((n: any) => ({
    niche: n.niche,
    avgScore: Math.round(n.totalScore / n.count),
    count: n.count,
    bestScore: n.bestScore,
  })).sort((a, b) => b.avgScore - a.avgScore);

  const typeBreakdown = filteredPredictions.reduce((acc, p) => {
    const type = p.prediction_type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(typeBreakdown).map(([name, value]) => ({ name, value }));
  const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))'];

  const radarData = [
    { metric: 'Hook', score: Math.round(filteredPredictions.reduce((s, p) => s + p.hook_strength, 0) / (filteredPredictions.length || 1)) },
    { metric: 'Emotion', score: Math.round(filteredPredictions.reduce((s, p) => s + p.emotional_impact, 0) / (filteredPredictions.length || 1)) },
    { metric: 'Conflict', score: Math.round(filteredPredictions.reduce((s, p) => s + p.conflict_clarity, 0) / (filteredPredictions.length || 1)) },
    { metric: 'Pacing', score: Math.round(filteredPredictions.reduce((s, p) => s + p.pacing_quality, 0) / (filteredPredictions.length || 1)) },
    { metric: 'Dialogue', score: Math.round(filteredPredictions.reduce((s, p) => s + p.dialogue_quality, 0) / (filteredPredictions.length || 1)) },
    { metric: 'Quotability', score: Math.round(filteredPredictions.reduce((s, p) => s + p.quotability, 0) / (filteredPredictions.length || 1)) },
  ];

  const topScripts = [...filteredPredictions].sort((a, b) => b.viral_score - a.viral_score).slice(0, 10);
  const uniqueNiches = Array.from(new Set(predictions.map(p => p.niche).filter(Boolean)));

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
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>

          <Select value={nicheFilter} onValueChange={setNicheFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by niche" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All niches</SelectItem>
              {uniqueNiches.map(niche => (
                <SelectItem key={niche} value={niche!}>{niche}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Scripts</p>
                  <p className="text-2xl font-bold">{totalScripts}</p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {totalPredictions} predictions run
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Viral Score</p>
                  <p className="text-2xl font-bold">{avgViralScore}/100</p>
                </div>
                <TrendingUp className="h-8 w-8 text-secondary" />
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                {improvementRate > 0 ? (
                  <>
                    <ArrowUpRight className="w-3 h-3 text-green-500" />
                    <span className="text-green-500">+{improvementRate}%</span> improvement
                  </>
                ) : improvementRate < 0 ? (
                  <>
                    <ArrowDownRight className="w-3 h-3 text-red-500" />
                    <span className="text-red-500">{improvementRate}%</span> decline
                  </>
                ) : (
                  <span>No change</span>
                )}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Best Script</p>
                  <p className="text-lg font-bold truncate">{bestScript?.title || 'N/A'}</p>
                </div>
                <Target className="h-8 w-8 text-accent" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Score: {bestScript?.viral_score || 0}/100
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">High Scorers</p>
                  <p className="text-2xl font-bold">{filteredPredictions.filter(p => p.viral_score >= 80).length}</p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Scripts with 80+ score
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Viral Score Trends</CardTitle>
                <CardDescription>Track your performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                    <Legend />
                    <Line type="monotone" dataKey="viralScore" stroke="hsl(var(--primary))" name="Viral Score" strokeWidth={2} />
                    <Line type="monotone" dataKey="engagement" stroke="hsl(var(--secondary))" name="Engagement" strokeWidth={2} />
                    <Line type="monotone" dataKey="shareability" stroke="hsl(var(--accent))" name="Shareability" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Prediction Type Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Content Quality Radar</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(var(--border))" />
                      <PolarAngleAxis dataKey="metric" stroke="hsl(var(--foreground))" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
                      <Radar name="Your Average" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Niche Performance</CardTitle>
                <CardDescription>See which niches perform best</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={nichePerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="niche" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }} />
                    <Legend />
                    <Bar dataKey="avgScore" fill="hsl(var(--primary))" name="Avg Score" />
                    <Bar dataKey="bestScore" fill="hsl(var(--secondary))" name="Best Score" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Scripts</CardTitle>
                <CardDescription>Your highest-scoring content</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Niche</TableHead>
                      <TableHead>Viral Score</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topScripts.map((script) => (
                      <TableRow key={script.id}>
                        <TableCell className="font-medium">{script.title}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{script.niche}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={script.viral_score >= 80 ? 'default' : 'secondary'}>
                            {script.viral_score}/100
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {format(new Date(script.created_at), 'MMM d, yyyy')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Niche Success Rates</CardTitle>
                  <CardDescription>Average scores by niche</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {nichePerformance.map((niche) => (
                    <div key={niche.niche} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{niche.niche}</span>
                        <span className="text-muted-foreground">{niche.avgScore}/100</span>
                      </div>
                      <Progress value={niche.avgScore} className="h-2" />
                      <p className="text-xs text-muted-foreground">{niche.count} scripts</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recommendations</CardTitle>
                  <CardDescription>Based on your performance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {nichePerformance[0] && (
                    <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                      <p className="text-sm font-medium">🎯 Best Performing Niche</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Focus on <strong>{nichePerformance[0].niche}</strong> - averaging {nichePerformance[0].avgScore}/100
                      </p>
                    </div>
                  )}
                  {avgViralScore < 70 && (
                    <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                      <p className="text-sm font-medium">📈 Improvement Opportunity</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your average score is {avgViralScore}. Focus on hook strength and emotional impact to boost engagement.
                      </p>
                    </div>
                  )}
                  {radarData.find(d => d.metric === 'Hook' && d.score < 70) && (
                    <div className="p-4 rounded-lg bg-accent/10 border border-accent/20">
                      <p className="text-sm font-medium">🎣 Strengthen Your Hooks</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Your hook scores are below 70. Try using more intriguing questions or bold statements.
                      </p>
                    </div>
                  )}
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
