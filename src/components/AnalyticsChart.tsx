import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sanitizeChartData, sanitizeText } from '@/lib/sanitization';

interface AnalyticsData {
  id: string;
  title: string;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  engagement_rate: string;
  created_at: string;
  niche: string;
  performance_score: number;
}

interface NicheData {
  niche: string;
  views: number;
  likes: number;
  shares: number;
  comments: number;
  count: number;
  avgEngagement: number;
}

interface TooltipPayload {
  name: string;
  value: number | string;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

interface AnalyticsChartProps {
  data: AnalyticsData[];
}

const AnalyticsChart = ({ data }: AnalyticsChartProps) => {
  const [chartType, setChartType] = useState("line");
  const [metric, setMetric] = useState("views");

  // Sanitize incoming data
  const sanitizedData = sanitizeChartData(data, ['title', 'niche'], ['views', 'likes', 'shares', 'comments', 'performance_score']);

  // Process data for time series
  const timeSeriesData = sanitizedData
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map((item, index) => ({
      date: new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      views: item.views,
      likes: item.likes,
      shares: item.shares,
      comments: item.comments,
      engagement: parseFloat(item.engagement_rate),
      script: sanitizeText(item.title.length > 20 ? item.title.substring(0, 20) + '...' : item.title)
    }));

  // Process data for niche comparison
  const nicheData = sanitizedData.reduce((acc: any[], item) => {
    const existingNiche = acc.find(n => n.niche === item.niche);
    if (existingNiche) {
      existingNiche.views += item.views;
      existingNiche.likes += item.likes;
      existingNiche.shares += item.shares;
      existingNiche.comments += item.comments;
      existingNiche.count += 1;
    } else {
      acc.push({
        niche: item.niche,
        views: item.views,
        likes: item.likes,
        shares: item.shares,
        comments: item.comments,
        count: 1
      });
    }
    return acc;
  }, []).map(item => ({
    ...item,
    avgViews: Math.round(item.views / item.count),
    avgLikes: Math.round(item.likes / item.count),
    avgShares: Math.round(item.shares / item.count),
    avgEngagement: Math.round((item.likes + item.shares + item.comments) / item.views * 100 * 100) / 100
  }));

  // Top performing scripts
  const topScripts = [...sanitizedData]
    .sort((a, b) => b.performance_score - a.performance_score)
    .slice(0, 5)
    .map(item => ({
      title: sanitizeText(item.title.length > 25 ? item.title.substring(0, 25) + '...' : item.title),
      score: item.performance_score,
      views: item.views,
      engagement: parseFloat(item.engagement_rate)
    }));

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: TooltipPayload, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
              {entry.name.includes('engagement') ? '%' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Chart Controls */}
      <div className="flex flex-wrap gap-4">
        <Select value={chartType} onValueChange={setChartType}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Chart type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="line">Line Chart</SelectItem>
            <SelectItem value="bar">Bar Chart</SelectItem>
          </SelectContent>
        </Select>

        <Select value={metric} onValueChange={setMetric}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Metric" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="views">Views</SelectItem>
            <SelectItem value="likes">Likes</SelectItem>
            <SelectItem value="shares">Shares</SelectItem>
            <SelectItem value="engagement">Engagement Rate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="niches">By Niche</TabsTrigger>
          <TabsTrigger value="top">Top Performers</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Performance Timeline</CardTitle>
              <CardDescription>Script performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "line" ? (
                    <LineChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      {metric === "views" && <Line type="monotone" dataKey="views" stroke="#8884d8" strokeWidth={2} />}
                      {metric === "likes" && <Line type="monotone" dataKey="likes" stroke="#82ca9d" strokeWidth={2} />}
                      {metric === "shares" && <Line type="monotone" dataKey="shares" stroke="#ffc658" strokeWidth={2} />}
                      {metric === "engagement" && <Line type="monotone" dataKey="engagement" stroke="#ff7300" strokeWidth={2} />}
                    </LineChart>
                  ) : (
                    <BarChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      {metric === "views" && <Bar dataKey="views" fill="#8884d8" />}
                      {metric === "likes" && <Bar dataKey="likes" fill="#82ca9d" />}
                      {metric === "shares" && <Bar dataKey="shares" fill="#ffc658" />}
                      {metric === "engagement" && <Bar dataKey="engagement" fill="#ff7300" />}
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="niches">
          <Card>
            <CardHeader>
              <CardTitle>Performance by Niche</CardTitle>
              <CardDescription>Average performance across different content niches</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={nicheData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="niche" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="avgViews" fill="#8884d8" name="Avg Views" />
                    <Bar dataKey="avgLikes" fill="#82ca9d" name="Avg Likes" />
                    <Bar dataKey="avgShares" fill="#ffc658" name="Avg Shares" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Scripts</CardTitle>
              <CardDescription>Your highest scoring content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topScripts} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="title" type="category" width={120} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="score" fill="#8884d8" name="Performance Score" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              {/* Additional metrics table */}
              <div className="mt-6">
                <h4 className="font-medium mb-3">Detailed Metrics</h4>
                <div className="space-y-2">
                  {topScripts.map((script, index) => (
                    <div key={index} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <p className="font-medium text-sm">{script.title}</p>
                        <p className="text-xs text-muted-foreground">Score: {script.score}%</p>
                      </div>
                      <div className="text-right text-sm">
                        <p>{script.views.toLocaleString()} views</p>
                        <p className="text-muted-foreground">{script.engagement}% engagement</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsChart;