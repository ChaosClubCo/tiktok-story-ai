import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPerformanceScore, getWebVitals } from '@/lib/webVitals';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Compact performance widget for the header
 * Displays current performance score with color coding
 */
export function PerformanceWidget() {
  const [score, setScore] = useState<number>(100);
  const [metricsCount, setMetricsCount] = useState<number>(0);

  useEffect(() => {
    const updateMetrics = () => {
      setScore(getPerformanceScore());
      setMetricsCount(getWebVitals().size);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-500/10 border-green-500/20';
    if (score >= 50) return 'bg-yellow-500/10 border-yellow-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 50) return 'Needs Work';
    return 'Poor';
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          to="/performance"
          className={cn(
            'flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs font-medium transition-all hover:scale-105',
            getScoreBg(score)
          )}
          aria-label={`Performance score: ${score}. Click for details.`}
        >
          <Gauge className={cn('w-3.5 h-3.5', getScoreColor(score))} />
          <span className={getScoreColor(score)}>{score}</span>
        </Link>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        <div className="space-y-1">
          <p className="font-medium">Performance: {getScoreLabel(score)}</p>
          <p className="text-muted-foreground">
            {metricsCount > 0 
              ? `${metricsCount} metrics tracked` 
              : 'Collecting metrics...'}
          </p>
          <p className="text-muted-foreground">Click for details</p>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

export default PerformanceWidget;
