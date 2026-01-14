import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
import { AuthRequired } from "@/components/shared/AuthRequired";
import { AnalyticsOverviewCards } from "@/components/analytics/AnalyticsOverviewCards";
import { AnalyticsTrendChart } from "@/components/analytics/AnalyticsTrendChart";
import { AnalyticsRadarChart } from "@/components/analytics/AnalyticsRadarChart";
import { AnalyticsNichePerformance } from "@/components/analytics/AnalyticsNichePerformance";
import { AnalyticsTopScripts } from "@/components/analytics/AnalyticsTopScripts";
import { AnalyticsExport } from "@/components/analytics/AnalyticsExport";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import {
  calculateImprovementRate,
  calculateAverageViralScore,
  getBestScript,
  calculateNichePerformance,
  generateRadarData,
  getTopScripts,
  countHighScorers
} from "@/lib/analyticsCalculations";

const Analytics = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("30d");
  const [nicheFilter, setNicheFilter] = useState("all");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate, fetchScripts]);

  const { 
    scripts, 
    predictions, 
    filteredPredictions, 
    uniqueNiches, 
    isLoading 
  } = useAnalyticsData({ 
    userId: user?.id, 
    timeRange, 
    nicheFilter 
  });

  // Calculate metrics
  const totalScripts = scripts.length;
  const totalPredictions = predictions.length;
  const avgViralScore = calculateAverageViralScore(filteredPredictions);
  const improvementRate = calculateImprovementRate(predictions);
  const bestScript = getBestScript(filteredPredictions);
  const highScorersCount = countHighScorers(filteredPredictions);
  
  // Generate chart data
  const trendData = filteredPredictions.slice(0, 20).reverse().map((p) => ({
    date: format(new Date(p.created_at), 'MMM d'),
    viralScore: p.viral_score,
    engagement: p.engagement_score,
    shareability: p.shareability_score,
  }));

  const nichePerformance = calculateNichePerformance(filteredPredictions);
  const radarData = generateRadarData(filteredPredictions);
  const topScripts = getTopScripts(filteredPredictions, 10);

  return (
    <AuthRequired user={user} loading={loading || isLoading}>
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

          <div className="flex flex-wrap gap-4 mb-8 justify-between">
            <div className="flex flex-wrap gap-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Time range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
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
            
            <AnalyticsExport predictions={filteredPredictions} timeRange={timeRange} />
          </div>

          <AnalyticsOverviewCards
            totalScripts={totalScripts}
            totalPredictions={totalPredictions}
            avgViralScore={avgViralScore}
            improvementRate={improvementRate}
            bestScriptTitle={bestScript?.title || null}
            bestScriptScore={bestScript?.viral_score || 0}
            highScorersCount={highScorersCount}
          />

          <Tabs defaultValue="trends" className="space-y-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="trends" className="space-y-6">
              <AnalyticsTrendChart data={trendData} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnalyticsRadarChart data={radarData} />
                <AnalyticsNichePerformance data={nichePerformance.slice(0, 5)} />
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <AnalyticsNichePerformance data={nichePerformance} />
              <AnalyticsTopScripts scripts={topScripts} />
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnalyticsRadarChart data={radarData} />
                <AnalyticsNichePerformance data={nichePerformance.slice(0, 5)} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthRequired>
  );
};

export default Analytics;
