/**
 * Pure calculation functions for analytics
 * Separated from UI components for better testability and reusability
 */

export interface Prediction {
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
  prediction_type: string;
  niche: string | null;
  created_at: string;
  title: string;
}

export interface NichePerformance {
  niche: string;
  avgScore: number;
  count: number;
  bestScore: number;
}

export interface TrendDataPoint {
  date: string;
  viralScore: number;
  engagement: number;
  shareability: number;
}

export interface RadarDataPoint {
  metric: string;
  score: number;
}

/**
 * Calculate improvement rate between first and last predictions
 */
export function calculateImprovementRate(predictions: Prediction[]): number {
  const firstFive = predictions.slice(-5);
  const lastFive = predictions.slice(0, 5);
  
  const avgFirst = firstFive.length > 0 
    ? firstFive.reduce((sum, p) => sum + p.viral_score, 0) / firstFive.length 
    : 0;
    
  const avgLast = lastFive.length > 0 
    ? lastFive.reduce((sum, p) => sum + p.viral_score, 0) / lastFive.length 
    : 0;
    
  return avgFirst > 0 ? Math.round(((avgLast - avgFirst) / avgFirst) * 100) : 0;
}

/**
 * Calculate average viral score
 */
export function calculateAverageViralScore(predictions: Prediction[]): number {
  if (predictions.length === 0) return 0;
  return Math.round(predictions.reduce((sum, p) => sum + p.viral_score, 0) / predictions.length);
}

/**
 * Get best performing script
 */
export function getBestScript(predictions: Prediction[]): Prediction | null {
  return predictions.reduce((best, p) => 
    (!best || p.viral_score > best.viral_score) ? p : best
  , null as Prediction | null);
}

/**
 * Calculate niche performance statistics
 */
export function calculateNichePerformance(predictions: Prediction[]): NichePerformance[] {
  const nicheStats = predictions.reduce((acc, p) => {
    const niche = p.niche || 'Unknown';
    if (!acc[niche]) {
      acc[niche] = { niche, count: 0, totalScore: 0, bestScore: 0 };
    }
    acc[niche].count++;
    acc[niche].totalScore += p.viral_score;
    acc[niche].bestScore = Math.max(acc[niche].bestScore, p.viral_score);
    return acc;
  }, {} as Record<string, { niche: string; count: number; totalScore: number; bestScore: number }>);

  return Object.values(nicheStats)
    .map(n => ({
      niche: n.niche,
      avgScore: Math.round(n.totalScore / n.count),
      count: n.count,
      bestScore: n.bestScore,
    }))
    .sort((a, b) => b.avgScore - a.avgScore);
}

/**
 * Generate radar chart data for metrics
 */
export function generateRadarData(predictions: Prediction[]): RadarDataPoint[] {
  const length = predictions.length || 1;
  
  return [
    { 
      metric: 'Hook', 
      score: Math.round(predictions.reduce((s, p) => s + p.hook_strength, 0) / length) 
    },
    { 
      metric: 'Emotion', 
      score: Math.round(predictions.reduce((s, p) => s + p.emotional_impact, 0) / length) 
    },
    { 
      metric: 'Conflict', 
      score: Math.round(predictions.reduce((s, p) => s + p.conflict_clarity, 0) / length) 
    },
    { 
      metric: 'Pacing', 
      score: Math.round(predictions.reduce((s, p) => s + p.pacing_quality, 0) / length) 
    },
    { 
      metric: 'Dialogue', 
      score: Math.round(predictions.reduce((s, p) => s + p.dialogue_quality, 0) / length) 
    },
    { 
      metric: 'Quotability', 
      score: Math.round(predictions.reduce((s, p) => s + p.quotability, 0) / length) 
    },
  ];
}

/**
 * Calculate prediction type breakdown
 */
export function calculateTypeBreakdown(predictions: Prediction[]): Array<{ name: string; value: number }> {
  const typeBreakdown = predictions.reduce((acc, p) => {
    const type = p.prediction_type;
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(typeBreakdown).map(([name, value]) => ({ name, value }));
}

/**
 * Get top performing scripts
 */
export function getTopScripts(predictions: Prediction[], limit: number = 10): Prediction[] {
  return [...predictions]
    .sort((a, b) => b.viral_score - a.viral_score)
    .slice(0, limit);
}

/**
 * Count high scoring scripts (80+)
 */
export function countHighScorers(predictions: Prediction[]): number {
  return predictions.filter(p => p.viral_score >= 80).length;
}
