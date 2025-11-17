import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from 'date-fns';
import { sanitizeText } from '@/lib/sanitization';
import type { Prediction } from '@/lib/analyticsCalculations';

interface AnalyticsTopScriptsProps {
  scripts: Prediction[];
}

export function AnalyticsTopScripts({ scripts }: AnalyticsTopScriptsProps) {
  return (
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
            {scripts.map((script) => (
              <TableRow key={script.title + script.created_at}>
                <TableCell className="font-medium">{sanitizeText(script.title)}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{sanitizeText(script.niche || 'Unknown')}</Badge>
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
  );
}
