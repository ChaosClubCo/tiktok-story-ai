import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';

interface Variant {
  id: string;
  variant_name: string;
  viral_score: number;
  engagement_score: number;
  shareability_score: number;
  hook_strength: number;
  emotional_impact: number;
  trend_alignment: number;
  content: string;
}

interface ABTestResultsProps {
  variants: Variant[];
  testName: string;
  hypothesis?: string;
  winnerId?: string;
  onDeclareWinner: (variantId: string) => void;
  onApplyWinner: (variantId: string) => void;
}

export const ABTestResults = ({
  variants,
  testName,
  hypothesis,
  winnerId,
  onDeclareWinner,
  onApplyWinner
}: ABTestResultsProps) => {
  const getWinner = () => {
    if (winnerId) return variants.find(v => v.id === winnerId);
    return variants.reduce((best, current) => 
      (current.viral_score > best.viral_score) ? current : best
    , variants[0]);
  };

  const winner = getWinner();
  const controlVariant = variants[0];

  const getScoreDelta = (score: number, controlScore: number) => {
    const delta = score - controlScore;
    const percentage = ((delta / controlScore) * 100).toFixed(1);
    return { delta, percentage };
  };

  const getDeltaIcon = (delta: number) => {
    if (delta > 0) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (delta < 0) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const radarData = [
    {
      metric: 'Viral',
      ...Object.fromEntries(variants.map(v => [v.variant_name, v.viral_score]))
    },
    {
      metric: 'Engagement',
      ...Object.fromEntries(variants.map(v => [v.variant_name, v.engagement_score]))
    },
    {
      metric: 'Shareability',
      ...Object.fromEntries(variants.map(v => [v.variant_name, v.shareability_score]))
    },
    {
      metric: 'Hook',
      ...Object.fromEntries(variants.map(v => [v.variant_name, v.hook_strength]))
    },
    {
      metric: 'Emotion',
      ...Object.fromEntries(variants.map(v => [v.variant_name, v.emotional_impact]))
    },
    {
      metric: 'Trend',
      ...Object.fromEntries(variants.map(v => [v.variant_name, v.trend_alignment]))
    }
  ];

  const colors = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#10b981', '#f59e0b'];

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold">{testName}</h2>
            {hypothesis && (
              <p className="text-muted-foreground mt-2">Hypothesis: {hypothesis}</p>
            )}
          </div>

          {winner && (
            <div className="flex items-center gap-2 p-4 bg-primary/10 rounded-lg border border-primary/20">
              <Trophy className="w-5 h-5 text-primary" />
              <div>
                <span className="font-semibold">{winner.variant_name}</span> is the 
                {winnerId ? ' declared winner' : ' leading variant'} with a viral score of {winner.viral_score}
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Performance Comparison</h3>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            {variants.map((variant, index) => (
              <Radar
                key={variant.id}
                name={variant.variant_name}
                dataKey={variant.variant_name}
                stroke={colors[index % colors.length]}
                fill={colors[index % colors.length]}
                fillOpacity={0.3}
              />
            ))}
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {variants.map((variant) => {
          const isWinner = variant.id === winner?.id;
          const viralDelta = getScoreDelta(variant.viral_score, controlVariant.viral_score);
          const engagementDelta = getScoreDelta(variant.engagement_score, controlVariant.engagement_score);

          return (
            <Card key={variant.id} className={`p-4 ${isWinner ? 'border-primary shadow-elevated' : ''}`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{variant.variant_name}</h4>
                  {isWinner && <Badge variant="default">Winner</Badge>}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Viral Score</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{variant.viral_score}</span>
                      {variant.id !== controlVariant.id && (
                        <>
                          {getDeltaIcon(viralDelta.delta)}
                          <span className={viralDelta.delta > 0 ? 'text-green-500' : viralDelta.delta < 0 ? 'text-red-500' : 'text-muted-foreground'}>
                            {viralDelta.percentage}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Engagement</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{variant.engagement_score}</span>
                      {variant.id !== controlVariant.id && (
                        <>
                          {getDeltaIcon(engagementDelta.delta)}
                          <span className={engagementDelta.delta > 0 ? 'text-green-500' : engagementDelta.delta < 0 ? 'text-red-500' : 'text-muted-foreground'}>
                            {engagementDelta.percentage}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Shareability</span>
                    <span className="font-semibold">{variant.shareability_score}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Hook Strength</span>
                    <span className="font-semibold">{variant.hook_strength}</span>
                  </div>
                </div>

                {!winnerId && (
                  <Button
                    variant={isWinner ? "default" : "outline"}
                    size="sm"
                    className="w-full"
                    onClick={() => onDeclareWinner(variant.id)}
                  >
                    {isWinner ? 'Confirm Winner' : 'Declare Winner'}
                  </Button>
                )}

                {winnerId === variant.id && (
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full"
                    onClick={() => onApplyWinner(variant.id)}
                  >
                    Apply to Main Script
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
