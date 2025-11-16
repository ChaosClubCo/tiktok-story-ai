import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, TrendingUp, Eye, Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ShowcaseSeries } from "@/data/showcaseSeries";
import { analytics } from "@/lib/analytics";

interface RemixSeriesModalProps {
  series: ShowcaseSeries | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RemixSeriesModal = ({ series, isOpen, onClose }: RemixSeriesModalProps) => {
  const navigate = useNavigate();

  if (!series) return null;

  const handleRemix = () => {
    analytics.track('series_remix_started', { 
      seriesId: series.id,
      seriesTitle: series.title 
    });

    // Store series template in localStorage for app to pick up
    localStorage.setItem('remix_series_template', JSON.stringify({
      title: series.title,
      logline: series.logline,
      episodes: series.episodes,
      tags: series.tags || []
    }));

    onClose();
    
    // Navigate to series builder flow with query param
    navigate(`/series/builder?remix=${series.id}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-card-elevated border-border/50">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                {series.title}
              </DialogTitle>
              {series.badge && (
                <Badge 
                  variant={series.badge === 'top' ? 'default' : 'secondary'}
                  className="w-fit"
                >
                  {series.badge === 'top' ? '🏆 Top Performer' : '🔥 Trending'}
                </Badge>
              )}
            </div>
          </div>
          <DialogDescription className="text-base pt-2">
            {series.logline}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Series Stats */}
          <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-background/50 border border-border/30">
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <Eye className="w-4 h-4" />
                <span className="text-xs">Views</span>
              </div>
              <p className="text-lg font-bold text-foreground">{series.metrics.views}</p>
            </div>
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <Heart className="w-4 h-4" />
                <span className="text-xs">Likes</span>
              </div>
              <p className="text-lg font-bold text-foreground">{series.metrics.likes}</p>
            </div>
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs">Completion</span>
              </div>
              <p className="text-lg font-bold text-foreground">{series.metrics.completionRate}%</p>
            </div>
          </div>

          {/* Episode Count */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
            <div>
              <p className="text-sm text-muted-foreground">Series Structure</p>
              <p className="text-lg font-semibold text-foreground">{series.episodes} Episodes</p>
            </div>
            {series.tags && series.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap justify-end">
                {series.tags.slice(0, 3).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* What Happens Next */}
          <div className="space-y-3 p-4 rounded-lg bg-gradient-subtle border border-border/30">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              What happens when you remix?
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Start with this proven series structure and episode count</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Customize the storyline, characters, and drama hooks</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Keep the viral formula that got {series.metrics.views} views</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">✓</span>
                <span>Generate all episodes at once or customize each individually</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleRemix}
              className="flex-1 gap-2 shadow-glow hover:shadow-glow"
            >
              Remix This Series
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
