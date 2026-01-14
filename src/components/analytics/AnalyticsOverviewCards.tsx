import { Card, CardContent } from "@/components/ui/card";
import { FileText, TrendingUp, Target, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { sanitizeText } from '@/lib/sanitization';

interface AnalyticsOverviewCardsProps {
  totalScripts: number;
  totalPredictions: number;
  avgViralScore: number;
  improvementRate: number;
  bestScriptTitle: string | null;
  bestScriptScore: number;
  highScorersCount: number;
}

export function AnalyticsOverviewCards({
  totalScripts,
  totalPredictions,
  avgViralScore,
  improvementRate,
  bestScriptTitle,
  bestScriptScore,
  highScorersCount
}: AnalyticsOverviewCardsProps) {
  return (
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
              <p className="text-lg font-bold truncate">
                {bestScriptTitle ? sanitizeText(bestScriptTitle) : 'N/A'}
              </p>
            </div>
            <Target className="h-8 w-8 text-accent" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Score: {bestScriptScore}/100
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">High Scorers</p>
              <p className="text-2xl font-bold">{highScorersCount}</p>
            </div>
            <Calendar className="h-8 w-8 text-primary" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Scripts with 80+ score
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
