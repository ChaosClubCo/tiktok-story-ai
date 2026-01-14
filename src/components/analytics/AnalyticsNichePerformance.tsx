import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface NichePerformance {
  niche: string;
  avgScore: number;
  count: number;
  bestScore: number;
}

interface AnalyticsNichePerformanceProps {
  data: NichePerformance[];
}

export function AnalyticsNichePerformance({ data }: AnalyticsNichePerformanceProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Niche Performance</CardTitle>
        <CardDescription>See which niches perform best</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="niche" stroke="hsl(var(--muted-foreground))" />
            <YAxis stroke="hsl(var(--muted-foreground))" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))' 
              }} 
            />
            <Legend />
            <Bar dataKey="avgScore" fill="hsl(var(--primary))" name="Avg Score" />
            <Bar dataKey="bestScore" fill="hsl(var(--secondary))" name="Best Score" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
