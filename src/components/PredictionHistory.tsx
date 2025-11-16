import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target,
  Sparkles,
  Trash2,
  ChevronRight,
  Lightbulb,
  LineChart as LineChartIcon,
  Download,
  FileDown,
  CalendarIcon,
  X
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { cn } from "@/lib/utils";

interface PredictionRecord {
  id: string;
  prediction_type: 'premise' | 'full_script';
  title: string;
  content: string;
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
  recommendations: any;
  strengths: any;
  weaknesses: any;
  created_at: string;
}

export const PredictionHistory = () => {
  const [predictions, setPredictions] = useState<PredictionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrediction, setSelectedPrediction] = useState<PredictionRecord | null>(null);
  const [filter, setFilter] = useState<'all' | 'premise' | 'full_script'>('all');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [comparisonPredictions, setComparisonPredictions] = useState<[PredictionRecord | null, PredictionRecord | null]>([null, null]);
  const [viewMode, setViewMode] = useState<'list' | 'trends'>('list');
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined
  });

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      const { data, error } = await supabase
        .from('predictions_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPredictions((data || []) as PredictionRecord[]);
    } catch (error) {
      console.error('Error fetching predictions:', error);
      toast.error("Failed to load prediction history");
    } finally {
      setLoading(false);
    }
  };

  const deletePrediction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('predictions_history')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setPredictions(prev => prev.filter(p => p.id !== id));
      if (selectedPrediction?.id === id) {
        setSelectedPrediction(null);
      }
      toast.success("Prediction deleted");
    } catch (error) {
      console.error('Error deleting prediction:', error);
      toast.error("Failed to delete prediction");
    }
  };

  const getScoreTrend = (currentScore: number, predictions: PredictionRecord[], scoreKey: keyof PredictionRecord) => {
    if (predictions.length < 2) return null;
    
    const previousPredictions = predictions.slice(1);
    const avgPrevious = previousPredictions.reduce((sum, p) => sum + (p[scoreKey] as number), 0) / previousPredictions.length;
    const difference = currentScore - avgPrevious;
    
    return {
      direction: difference > 0 ? 'up' : difference < 0 ? 'down' : 'neutral',
      percentage: Math.abs((difference / avgPrevious) * 100).toFixed(1)
    };
  };

  const filteredPredictions = predictions.filter(p => {
    // Filter by type
    if (filter !== 'all' && p.prediction_type !== filter) return false;
    
    // Filter by date range
    if (dateRange.from || dateRange.to) {
      const predictionDate = new Date(p.created_at);
      if (dateRange.from && predictionDate < dateRange.from) return false;
      if (dateRange.to) {
        const endOfDay = new Date(dateRange.to);
        endOfDay.setHours(23, 59, 59, 999);
        if (predictionDate > endOfDay) return false;
      }
    }
    
    return true;
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-destructive";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-success/10 border-success/20";
    if (score >= 60) return "bg-warning/10 border-warning/20";
    return "bg-destructive/10 border-destructive/20";
  };

  const handleComparisonSelect = (prediction: PredictionRecord) => {
    if (comparisonPredictions[0] === null) {
      setComparisonPredictions([prediction, null]);
    } else if (comparisonPredictions[1] === null && comparisonPredictions[0].id !== prediction.id) {
      setComparisonPredictions([comparisonPredictions[0], prediction]);
    } else if (comparisonPredictions[0]?.id === prediction.id) {
      setComparisonPredictions([comparisonPredictions[1], null]);
    } else if (comparisonPredictions[1]?.id === prediction.id) {
      setComparisonPredictions([comparisonPredictions[0], null]);
    }
  };

  const getScoreDelta = (score1: number, score2: number) => {
    const delta = score1 - score2;
    return {
      value: Math.abs(delta),
      direction: delta > 0 ? 'up' : delta < 0 ? 'down' : 'neutral',
      color: delta > 0 ? 'text-success' : delta < 0 ? 'text-destructive' : 'text-muted-foreground'
    };
  };

  const getChartData = () => {
    const filtered = filteredPredictions
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    
    return filtered.map((prediction) => ({
      date: format(new Date(prediction.created_at), 'MMM d'),
      fullDate: format(new Date(prediction.created_at), 'MMM d, yyyy h:mm a'),
      viralScore: prediction.viral_score,
      engagement: prediction.engagement_score,
      shareability: prediction.shareability_score,
      title: prediction.title
    }));
  };

  const exportToCSV = () => {
    const headers = [
      'Date', 'Title', 'Type', 'Viral Score', 'Engagement', 'Shareability', 
      'Hook', 'Emotional', 'Conflict', 'Pacing', 'Dialogue', 'Quotability', 
      'Relatability', 'Top Recommendation'
    ];
    
    const rows = filteredPredictions.map(p => {
      const topRec = Array.isArray(p.recommendations) && p.recommendations.length > 0 
        ? p.recommendations[0] 
        : 'N/A';
      
      return [
        format(new Date(p.created_at), 'yyyy-MM-dd HH:mm'),
        `"${p.title.replace(/"/g, '""')}"`,
        p.prediction_type,
        p.viral_score,
        p.engagement_score,
        p.shareability_score,
        p.hook_strength,
        p.emotional_impact,
        p.conflict_clarity,
        p.pacing_quality,
        p.dialogue_quality,
        p.quotability,
        p.relatability,
        `"${String(topRec).replace(/"/g, '""')}"`
      ].join(',');
    });
    
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `predictions_export_${format(new Date(), 'yyyy-MM-dd_HHmm')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`${filteredPredictions.length} predictions exported to CSV`);
  };

  const exportToJSON = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      totalPredictions: filteredPredictions.length,
      filters: {
        type: filter,
        dateRange: dateRange.from || dateRange.to ? {
          from: dateRange.from?.toISOString(),
          to: dateRange.to?.toISOString()
        } : null
      },
      predictions: filteredPredictions
    };
    
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `predictions_export_${format(new Date(), 'yyyy-MM-dd_HHmm')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`${filteredPredictions.length} predictions exported to JSON`);
  };

  const clearDateRange = () => {
    setDateRange({ from: undefined, to: undefined });
  };

  const setDateRangePreset = (preset: 'week' | 'month' | 'quarter') => {
    const today = new Date();
    const from = new Date();
    
    switch (preset) {
      case 'week':
        from.setDate(today.getDate() - 7);
        break;
      case 'month':
        from.setDate(today.getDate() - 30);
        break;
      case 'quarter':
        from.setDate(today.getDate() - 90);
        break;
    }
    
    setDateRange({ from, to: today });
  };

  if (loading) {
    return (
      <Card className="bg-card-elevated border-border/50">
        <CardContent className="p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-muted-foreground mt-4">Loading your prediction history...</p>
        </CardContent>
      </Card>
    );
  }

  if (predictions.length === 0) {
    return (
      <Card className="bg-card-elevated border-border/50">
        <CardContent className="p-12 text-center">
          <Target className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Predictions Yet</h3>
          <p className="text-sm text-muted-foreground">
            Start analyzing scripts or premises to build your prediction history
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* View Mode Tabs */}
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="gap-2"
          >
            <Clock className="w-4 h-4" />
            History List
          </Button>
          <Button
            variant={viewMode === 'trends' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('trends')}
            className="gap-2"
          >
            <LineChartIcon className="w-4 h-4" />
            Trends
          </Button>
        </div>

        {/* Filters and Export */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className={cn(
                "justify-start text-left font-normal",
                (dateRange.from || dateRange.to) && "border-primary"
              )}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "MMM dd")} - {format(dateRange.to, "MMM dd")}
                    </>
                  ) : (
                    format(dateRange.from, "MMM dd, yyyy")
                  )
                ) : (
                  <span>Date Range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <div className="p-3 space-y-2 border-b">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setDateRangePreset('week')}>
                    Last 7 Days
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setDateRangePreset('month')}>
                    Last 30 Days
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setDateRangePreset('quarter')}>
                    Last 90 Days
                  </Button>
                </div>
              </div>
              <Calendar
                mode="range"
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range) => setDateRange({ from: range?.from, to: range?.to })}
                numberOfMonths={2}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          
          {(dateRange.from || dateRange.to) && (
            <Button variant="ghost" size="sm" onClick={clearDateRange}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
          
          {/* Export Buttons */}
          <Button variant="outline" size="sm" onClick={exportToCSV} disabled={filteredPredictions.length === 0}>
            <FileDown className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={exportToJSON} disabled={filteredPredictions.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            JSON
          </Button>
        </div>
      </div>

      {viewMode === 'trends' ? (
        /* Trends Chart View */
        <Card className="bg-card-elevated border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChartIcon className="w-5 h-5 text-primary" />
              Score Progress Over Time
            </CardTitle>
            <CardDescription>
              Track your improvement trajectory across {filteredPredictions.length} predictions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="mb-4">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="all" onClick={() => setFilter('all')}>All</TabsTrigger>
                <TabsTrigger value="premise" onClick={() => setFilter('premise')}>Premise</TabsTrigger>
                <TabsTrigger value="full_script" onClick={() => setFilter('full_script')}>Full Script</TabsTrigger>
              </TabsList>
            </Tabs>

            {getChartData().length > 0 ? (
              <div className="space-y-6">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={getChartData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border/30" />
                    <XAxis 
                      dataKey="date" 
                      className="text-xs"
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis 
                      domain={[0, 100]}
                      className="text-xs"
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        color: 'hsl(var(--foreground))'
                      }}
                      labelFormatter={(label, payload) => {
                        if (payload && payload[0]) {
                          return payload[0].payload.fullDate;
                        }
                        return label;
                      }}
                      formatter={(value: number, name: string) => {
                        const nameMap: Record<string, string> = {
                          viralScore: 'Viral Score',
                          engagement: 'Engagement',
                          shareability: 'Shareability'
                        };
                        return [value, nameMap[name] || name];
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ color: 'hsl(var(--foreground))' }}
                      formatter={(value) => {
                        const nameMap: Record<string, string> = {
                          viralScore: 'Viral Score',
                          engagement: 'Engagement',
                          shareability: 'Shareability'
                        };
                        return nameMap[value] || value;
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="viralScore" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: 'hsl(var(--primary))', r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="engagement" 
                      stroke="hsl(var(--chart-2))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--chart-2))', r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="shareability" 
                      stroke="hsl(var(--chart-3))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--chart-3))', r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>

                {/* Stats Summary */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
                  {[
                    { label: 'Average Viral Score', value: Math.round(filteredPredictions.reduce((sum, p) => sum + p.viral_score, 0) / filteredPredictions.length), color: 'text-primary' },
                    { label: 'Highest Score', value: Math.max(...filteredPredictions.map(p => p.viral_score)), color: 'text-success' },
                    { label: 'Total Predictions', value: filteredPredictions.length, color: 'text-muted-foreground' }
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <p className="text-2xl font-bold mb-1" style={{ color: `hsl(var(--${stat.color.replace('text-', '')}))` }}>
                        {stat.value}
                      </p>
                      <p className="text-xs text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <LineChartIcon className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Data to Display</h3>
                <p className="text-sm text-muted-foreground">
                  Create more predictions to see your progress over time
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Original List View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* History List */}
          <Card className="lg:col-span-1 bg-card-elevated border-border/50">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  History
                </CardTitle>
                <Button
                  variant={comparisonMode ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setComparisonMode(!comparisonMode);
                    setComparisonPredictions([null, null]);
                    if (!comparisonMode) setSelectedPrediction(null);
                  }}
                >
                  Compare
                </Button>
              </div>
              <CardDescription>
                {predictions.length} prediction{predictions.length !== 1 ? 's' : ''} tracked
                {comparisonMode && " • Select 2 to compare"}
              </CardDescription>
            </CardHeader>
        <CardContent>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="mb-4">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="premise">Premise</TabsTrigger>
              <TabsTrigger value="full_script">Full</TabsTrigger>
            </TabsList>
          </Tabs>

          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-2">
              {filteredPredictions.map((prediction) => {
                const isInComparison = comparisonPredictions[0]?.id === prediction.id || comparisonPredictions[1]?.id === prediction.id;
                const comparisonIndex = comparisonPredictions[0]?.id === prediction.id ? 1 : comparisonPredictions[1]?.id === prediction.id ? 2 : null;
                
                return (
                  <button
                    key={prediction.id}
                    onClick={() => comparisonMode ? handleComparisonSelect(prediction) : setSelectedPrediction(prediction)}
                    className={`w-full text-left p-3 rounded-lg border transition-all hover:bg-background/50 ${
                      comparisonMode && isInComparison
                        ? 'border-primary bg-primary/5'
                        : !comparisonMode && selectedPrediction?.id === prediction.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-foreground truncate">
                          {prediction.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {format(new Date(prediction.created_at), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {comparisonMode && comparisonIndex && (
                          <Badge variant="default" className="text-xs">
                            {comparisonIndex}
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {prediction.prediction_type === 'premise' ? 'Premise' : 'Full'}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`text-xl font-bold ${getScoreColor(prediction.viral_score)}`}>
                        {prediction.viral_score}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Detailed View or Comparison View */}
      <Card className="lg:col-span-2 bg-card-elevated border-border/50">
        {comparisonMode && comparisonPredictions[0] && comparisonPredictions[1] ? (
          <>
            <CardHeader>
              <CardTitle className="text-xl">Comparison View</CardTitle>
              <CardDescription>Compare metrics between two predictions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Headers */}
              <div className="grid grid-cols-2 gap-4">
                {comparisonPredictions.map((pred, idx) => (
                  <div key={pred!.id} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="text-xs">{idx + 1}</Badge>
                      <h3 className="font-semibold text-sm text-foreground truncate">{pred!.title}</h3>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(pred!.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>
                ))}
              </div>

              {/* Main Scores Comparison */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-foreground">Main Scores</h4>
                {[
                  { label: 'Viral Score', key: 'viral_score' as keyof PredictionRecord },
                  { label: 'Engagement', key: 'engagement_score' as keyof PredictionRecord },
                  { label: 'Shareability', key: 'shareability_score' as keyof PredictionRecord }
                ].map((metric) => {
                  const score1 = comparisonPredictions[0]![metric.key] as number;
                  const score2 = comparisonPredictions[1]![metric.key] as number;
                  const delta = getScoreDelta(score1, score2);
                  
                  return (
                    <div key={metric.key} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground uppercase">{metric.label}</span>
                        {delta.direction !== 'neutral' && (
                          <span className={`text-xs flex items-center gap-1 ${delta.color}`}>
                            {delta.direction === 'up' ? (
                              <TrendingUp className="w-3 h-3" />
                            ) : (
                              <TrendingDown className="w-3 h-3" />
                            )}
                            {delta.value} points
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className={`p-3 rounded-lg border ${getScoreBgColor(score1)}`}>
                          <span className={`text-2xl font-bold ${getScoreColor(score1)}`}>{score1}</span>
                        </div>
                        <div className={`p-3 rounded-lg border ${getScoreBgColor(score2)}`}>
                          <span className={`text-2xl font-bold ${getScoreColor(score2)}`}>{score2}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Detailed Metrics Comparison */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Detailed Breakdown</h4>
                {[
                  { label: 'Hook Strength', key: 'hook_strength' as keyof PredictionRecord },
                  { label: 'Emotional Impact', key: 'emotional_impact' as keyof PredictionRecord },
                  { label: 'Conflict Clarity', key: 'conflict_clarity' as keyof PredictionRecord },
                  { label: 'Pacing Quality', key: 'pacing_quality' as keyof PredictionRecord },
                  { label: 'Dialogue Quality', key: 'dialogue_quality' as keyof PredictionRecord },
                  { label: 'Quotability', key: 'quotability' as keyof PredictionRecord },
                  { label: 'Relatability', key: 'relatability' as keyof PredictionRecord }
                ].map((metric) => {
                  const value1 = comparisonPredictions[0]![metric.key] as number;
                  const value2 = comparisonPredictions[1]![metric.key] as number;
                  const delta = getScoreDelta(value1, value2);
                  
                  return (
                    <div key={metric.key} className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{metric.label}</span>
                        {delta.direction !== 'neutral' && (
                          <span className={`flex items-center gap-1 ${delta.color}`}>
                            {delta.direction === 'up' ? '+' : '-'}{delta.value}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <span className="text-xs font-medium text-foreground">{value1}/100</span>
                          <Progress value={value1} className="h-1.5" />
                        </div>
                        <div className="space-y-1">
                          <span className="text-xs font-medium text-foreground">{value2}/100</span>
                          <Progress value={value2} className="h-1.5" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </>
        ) : selectedPrediction ? (
          <>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{selectedPrediction.title}</CardTitle>
                  <CardDescription className="flex items-center gap-3">
                    <span>{format(new Date(selectedPrediction.created_at), 'MMMM d, yyyy')}</span>
                    <Badge variant="outline">
                      {selectedPrediction.prediction_type === 'premise' ? 'Premise Analysis' : 'Full Script'}
                    </Badge>
                    {selectedPrediction.niche && (
                      <Badge variant="secondary">{selectedPrediction.niche}</Badge>
                    )}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deletePrediction(selectedPrediction.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Main Scores */}
              <div className="grid grid-cols-3 gap-4">
                <div className={`p-4 rounded-lg border ${getScoreBgColor(selectedPrediction.viral_score)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase">Viral Score</span>
                    {getScoreTrend(selectedPrediction.viral_score, predictions, 'viral_score') && (
                      <span className={`text-xs flex items-center gap-1 ${
                        getScoreTrend(selectedPrediction.viral_score, predictions, 'viral_score')!.direction === 'up'
                          ? 'text-success'
                          : 'text-destructive'
                      }`}>
                        {getScoreTrend(selectedPrediction.viral_score, predictions, 'viral_score')!.direction === 'up' ? (
                          <TrendingUp className="w-3 h-3" />
                        ) : (
                          <TrendingDown className="w-3 h-3" />
                        )}
                        {getScoreTrend(selectedPrediction.viral_score, predictions, 'viral_score')!.percentage}%
                      </span>
                    )}
                  </div>
                  <span className={`text-3xl font-bold ${getScoreColor(selectedPrediction.viral_score)}`}>
                    {selectedPrediction.viral_score}
                  </span>
                </div>
                
                <div className={`p-4 rounded-lg border ${getScoreBgColor(selectedPrediction.engagement_score)}`}>
                  <span className="text-xs font-medium text-muted-foreground uppercase block mb-2">Engagement</span>
                  <span className={`text-3xl font-bold ${getScoreColor(selectedPrediction.engagement_score)}`}>
                    {selectedPrediction.engagement_score}
                  </span>
                </div>
                
                <div className={`p-4 rounded-lg border ${getScoreBgColor(selectedPrediction.shareability_score)}`}>
                  <span className="text-xs font-medium text-muted-foreground uppercase block mb-2">Shareability</span>
                  <span className={`text-3xl font-bold ${getScoreColor(selectedPrediction.shareability_score)}`}>
                    {selectedPrediction.shareability_score}
                  </span>
                </div>
              </div>

              {/* Detailed Metrics */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground">Detailed Breakdown</h4>
                {[
                  { label: 'Hook Strength', value: selectedPrediction.hook_strength },
                  { label: 'Emotional Impact', value: selectedPrediction.emotional_impact },
                  { label: 'Conflict Clarity', value: selectedPrediction.conflict_clarity },
                  { label: 'Pacing Quality', value: selectedPrediction.pacing_quality },
                  { label: 'Dialogue Quality', value: selectedPrediction.dialogue_quality },
                  { label: 'Quotability', value: selectedPrediction.quotability },
                  { label: 'Relatability', value: selectedPrediction.relatability }
                ].map((metric) => (
                  <div key={metric.label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{metric.label}</span>
                      <span className="font-medium text-foreground">{metric.value}/100</span>
                    </div>
                    <Progress value={metric.value} className="h-1.5" />
                  </div>
                ))}
              </div>

              {/* Insights Tabs */}
              <Tabs defaultValue="recommendations" className="mt-6">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="recommendations">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Tips
                  </TabsTrigger>
                  <TabsTrigger value="strengths">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Strengths
                  </TabsTrigger>
                  <TabsTrigger value="weaknesses">Weaknesses</TabsTrigger>
                </TabsList>
                
                <TabsContent value="recommendations" className="mt-4 space-y-2">
                  {Array.isArray(selectedPrediction.recommendations) && selectedPrediction.recommendations.map((rec, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-sm text-foreground">{rec}</p>
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="strengths" className="mt-4 space-y-2">
                  {Array.isArray(selectedPrediction.strengths) && selectedPrediction.strengths.map((strength, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-success/5 border border-success/20">
                      <p className="text-sm text-foreground">{strength}</p>
                    </div>
                  ))}
                </TabsContent>
                
                <TabsContent value="weaknesses" className="mt-4 space-y-2">
                  {Array.isArray(selectedPrediction.weaknesses) && selectedPrediction.weaknesses.map((weakness, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-warning/5 border border-warning/20">
                      <p className="text-sm text-foreground">{weakness}</p>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </>
        ) : (
          <CardContent className="p-12 text-center">
            <Target className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {comparisonMode ? 'Select Two Predictions' : 'Select a Prediction'}
            </h3>
            <p className="text-sm text-muted-foreground">
              {comparisonMode 
                ? 'Choose two predictions from the history to compare side-by-side'
                : 'Choose a prediction from the history to view detailed analysis'
              }
            </p>
          </CardContent>
        )}
      </Card>
        </div>
      )}
    </div>
  );
};
