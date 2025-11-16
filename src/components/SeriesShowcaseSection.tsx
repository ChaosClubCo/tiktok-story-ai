import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Heart, TrendingUp, Sparkles } from "lucide-react";
import { ShowcaseSeries, showcaseSeries } from "@/data/showcaseSeries";
import { RemixSeriesModal } from "@/components/RemixSeriesModal";

export const SeriesShowcaseSection = () => {
  const [selectedSeries, setSelectedSeries] = useState<ShowcaseSeries | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRemixClick = (series: ShowcaseSeries) => {
    setSelectedSeries(series);
    setIsModalOpen(true);
  };

  return (
    <>
      <section className="py-16 bg-gradient-subtle">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="text-center space-y-4 mb-12 max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              <span className="bg-gradient-drama bg-clip-text text-transparent">
                Proven Series Templates
              </span>
            </h2>
            <p className="text-lg text-muted-foreground">
              Remix these top-performing series and customize them for your audience
            </p>
          </div>

          {/* Series Grid - 3 columns on desktop, horizontal scroll on mobile */}
          <div className="relative">
            <div className="md:grid md:grid-cols-3 md:gap-6 flex md:flex-none overflow-x-auto md:overflow-visible gap-4 pb-4 md:pb-0 snap-x snap-mandatory scrollbar-hide">
              {showcaseSeries.map((series) => (
                <Card 
                  key={series.id}
                  className="flex-shrink-0 w-[300px] md:w-auto snap-start shadow-elevated hover:shadow-glow transition-all duration-300 group border-border/50 bg-card-elevated"
                >
                  {/* Gradient Thumbnail */}
                  <div className={`h-32 bg-gradient-to-br ${series.gradient} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                    
                    {/* Badge */}
                    {series.badge && (
                      <Badge 
                        variant={series.badge === 'top' ? 'default' : 'secondary'}
                        className="absolute top-3 right-3 shadow-lg"
                      >
                        {series.badge === 'top' ? '🏆 Top' : '🔥 Trending'}
                      </Badge>
                    )}

                    {/* Episode Count */}
                    <div className="absolute bottom-3 left-3">
                      <Badge variant="outline" className="bg-background/90 backdrop-blur-sm">
                        {series.episodes} Episodes
                      </Badge>
                    </div>
                  </div>

                  <CardHeader className="space-y-2">
                    <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                      {series.title}
                    </CardTitle>
                    <CardDescription className="text-sm line-clamp-2">
                      {series.logline}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Metrics */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="space-y-1">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground">
                          <Eye className="w-3 h-3" />
                        </div>
                        <p className="text-xs font-semibold text-foreground">{series.metrics.views}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground">
                          <Heart className="w-3 h-3" />
                        </div>
                        <p className="text-xs font-semibold text-foreground">{series.metrics.likes}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-center gap-1 text-muted-foreground">
                          <TrendingUp className="w-3 h-3" />
                        </div>
                        <p className="text-xs font-semibold text-foreground">{series.metrics.completionRate}%</p>
                      </div>
                    </div>

                    {/* Tags */}
                    {series.tags && series.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {series.tags.slice(0, 3).map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* CTA Button */}
                    <Button 
                      onClick={() => handleRemixClick(series)}
                      className="w-full gap-2 shadow-elevated hover:shadow-glow transition-all"
                      size="sm"
                    >
                      <Sparkles className="w-4 h-4" />
                      Remix This Series
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Scroll Indicator for Mobile */}
            <div className="md:hidden flex justify-center gap-1 mt-4">
              {showcaseSeries.map((_, index) => (
                <div 
                  key={index}
                  className="w-2 h-2 rounded-full bg-muted-foreground/30"
                />
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground">
              Can't find what you're looking for?{" "}
              <Button 
                variant="link" 
                className="text-primary font-semibold p-0 h-auto"
                onClick={() => {
                  document.getElementById('niche-selector')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Create a custom series from scratch
              </Button>
            </p>
          </div>
        </div>
      </section>

      <RemixSeriesModal 
        series={selectedSeries}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSeries(null);
        }}
      />
    </>
  );
};
