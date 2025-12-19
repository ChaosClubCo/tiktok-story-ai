import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  TrendingUp, 
  Users, 
  Target, 
  Film, 
  Palette,
  Zap,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface Recommendation {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action: string;
  actionLabel: string;
  priority: 'high' | 'medium' | 'low';
  tags: string[];
}

const NICHE_RECOMMENDATIONS: Record<string, Recommendation[]> = {
  romance: [
    { id: 'rom-1', title: 'Trending: Slow Burn Romance', description: 'Slow burn plots are getting 40% more engagement this week', icon: TrendingUp, action: 'topics', actionLabel: 'Explore Trends', priority: 'high', tags: ['trending', 'romance'] },
    { id: 'rom-2', title: 'Create a Wedding Series', description: 'Wedding-themed content is perfect for your niche', icon: Film, action: 'workflow', actionLabel: 'Start Series', priority: 'medium', tags: ['series', 'romance'] },
  ],
  thriller: [
    { id: 'thr-1', title: 'True Crime is Surging', description: 'True crime hooks are 50% more viral right now', icon: TrendingUp, action: 'topics', actionLabel: 'See Topics', priority: 'high', tags: ['trending', 'thriller'] },
    { id: 'thr-2', title: 'Try a Mystery Series', description: 'Multi-part mysteries keep viewers coming back', icon: Film, action: 'workflow', actionLabel: 'Create Series', priority: 'medium', tags: ['series', 'mystery'] },
  ],
  comedy: [
    { id: 'com-1', title: 'Reaction Content Trending', description: 'Comedy reactions are up 35% this month', icon: TrendingUp, action: 'topics', actionLabel: 'View Trends', priority: 'high', tags: ['trending', 'comedy'] },
    { id: 'com-2', title: 'Sketch Series Builder', description: 'Create recurring characters for loyal fans', icon: Film, action: 'workflow', actionLabel: 'Build Sketch', priority: 'medium', tags: ['series', 'comedy'] },
  ],
  drama: [
    { id: 'dra-1', title: 'Family Drama Trending', description: 'Family conflict stories are highly engaging', icon: TrendingUp, action: 'topics', actionLabel: 'Explore', priority: 'high', tags: ['trending', 'drama'] },
    { id: 'dra-2', title: 'Emotional Hook Templates', description: 'Use proven emotional hooks for drama', icon: Palette, action: 'visual-hooks', actionLabel: 'Get Hooks', priority: 'medium', tags: ['hooks', 'drama'] },
  ],
  mystery: [
    { id: 'mys-1', title: 'Whodunit Series Popular', description: 'Mystery series with cliffhangers perform well', icon: TrendingUp, action: 'topics', actionLabel: 'See Topics', priority: 'high', tags: ['trending', 'mystery'] },
    { id: 'mys-2', title: 'Build Suspense Hooks', description: 'Learn suspense-building techniques', icon: Palette, action: 'visual-hooks', actionLabel: 'View Hooks', priority: 'medium', tags: ['hooks', 'mystery'] },
  ],
  horror: [
    { id: 'hor-1', title: 'Creepy Pasta Trending', description: 'Short horror stories are viral this week', icon: TrendingUp, action: 'topics', actionLabel: 'View Trends', priority: 'high', tags: ['trending', 'horror'] },
    { id: 'hor-2', title: 'Jump Scare Timing', description: 'Perfect your pacing for maximum scares', icon: Zap, action: 'optimization', actionLabel: 'Optimize', priority: 'medium', tags: ['optimization', 'horror'] },
  ],
};

const GOAL_RECOMMENDATIONS: Record<string, Recommendation[]> = {
  followers: [
    { id: 'fol-1', title: 'Grow Your Audience', description: 'Content strategies proven to attract followers', icon: Users, action: 'social-proof', actionLabel: 'Learn More', priority: 'high', tags: ['growth', 'followers'] },
  ],
  monetize: [
    { id: 'mon-1', title: 'Creator Monetization', description: 'Explore ways to monetize your content', icon: Target, action: 'marketplace', actionLabel: 'Explore', priority: 'high', tags: ['monetize', 'income'] },
  ],
  engagement: [
    { id: 'eng-1', title: 'Boost Engagement', description: 'Tactics to increase likes, comments, shares', icon: TrendingUp, action: 'performance', actionLabel: 'View Tips', priority: 'high', tags: ['engagement', 'growth'] },
  ],
  brand: [
    { id: 'bra-1', title: 'Voice Consistency', description: 'Build a recognizable brand voice', icon: Sparkles, action: 'voice-tone', actionLabel: 'Setup Voice', priority: 'high', tags: ['brand', 'voice'] },
  ],
};

interface PersonalizedRecommendationsProps {
  onNavigate: (tab: string) => void;
}

export function PersonalizedRecommendations({ onNavigate }: PersonalizedRecommendationsProps) {
  const { profile, profileLoading } = useAuth();

  const recommendations = useMemo(() => {
    if (!profile) return [];
    
    const recs: Recommendation[] = [];
    
    // Add niche-based recommendations
    if (profile.preferred_niche && NICHE_RECOMMENDATIONS[profile.preferred_niche]) {
      recs.push(...NICHE_RECOMMENDATIONS[profile.preferred_niche]);
    }
    
    // Add goal-based recommendations
    if (profile.goals && Array.isArray(profile.goals)) {
      profile.goals.forEach(goal => {
        if (GOAL_RECOMMENDATIONS[goal]) {
          recs.push(...GOAL_RECOMMENDATIONS[goal]);
        }
      });
    }
    
    // Sort by priority and limit
    return recs
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
      .slice(0, 4);
  }, [profile]);

  if (profileLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Personalized for You
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-20 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile?.preferred_niche || recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Get Personalized Recommendations
          </CardTitle>
          <CardDescription>
            Complete your profile to receive tailored content suggestions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => window.location.href = '/settings'}>
            Complete Profile
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Recommended for You
            </CardTitle>
            <CardDescription>
              Based on your {profile.preferred_niche} focus
              {profile.goals?.length ? ` and ${profile.goals.length} goal${profile.goals.length > 1 ? 's' : ''}` : ''}
            </CardDescription>
          </div>
          <Badge variant="secondary" className="capitalize">
            {profile.preferred_niche}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className={cn(
                "group p-4 rounded-lg border transition-all hover:shadow-md cursor-pointer",
                rec.priority === 'high' 
                  ? "border-primary/30 bg-primary/5 hover:border-primary" 
                  : "border-border hover:border-primary/50"
              )}
              onClick={() => onNavigate(rec.action)}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                  rec.priority === 'high' ? "bg-primary/20" : "bg-muted"
                )}>
                  <rec.icon className={cn(
                    "w-5 h-5",
                    rec.priority === 'high' ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm mb-1 flex items-center gap-2">
                    {rec.title}
                    {rec.priority === 'high' && (
                      <Badge variant="default" className="text-xs">Hot</Badge>
                    )}
                  </h4>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {rec.description}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
