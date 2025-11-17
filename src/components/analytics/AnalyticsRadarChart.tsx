import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

interface RadarDataPoint {
  metric: string;
  score: number;
}

interface AnalyticsRadarChartProps {
  data: RadarDataPoint[];
}

export function AnalyticsRadarChart({ data }: AnalyticsRadarChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Strength Radar</CardTitle>
        <CardDescription>Average scores across key metrics</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={data}>
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey="metric" stroke="hsl(var(--muted-foreground))" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
            <Radar 
              name="Average Score" 
              dataKey="score" 
              stroke="hsl(var(--primary))" 
              fill="hsl(var(--primary))" 
              fillOpacity={0.3} 
            />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
