import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TrendDataPoint {
  date: string;
  viralScore: number;
  engagement: number;
  shareability: number;
}

interface AnalyticsTrendChartProps {
  data: TrendDataPoint[];
}

export function AnalyticsTrendChart({ data }: AnalyticsTrendChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Viral Score Trends</CardTitle>
        <CardDescription>Track your performance over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))' 
              }} 
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="viralScore" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              name="Viral Score"
            />
            <Line 
              type="monotone" 
              dataKey="engagement" 
              stroke="hsl(var(--secondary))" 
              strokeWidth={2}
              name="Engagement"
            />
            <Line 
              type="monotone" 
              dataKey="shareability" 
              stroke="hsl(var(--accent))" 
              strokeWidth={2}
              name="Shareability"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
