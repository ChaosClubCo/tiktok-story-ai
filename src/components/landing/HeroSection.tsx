import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FeatureCard } from '@/components/shared';
import { Sparkles, TrendingUp, Zap } from 'lucide-react';
import { CinematicHeroBackground } from '@/components/CinematicHeroBackground';
import { useAuth } from '@/hooks/useAuth';

const HERO_FEATURES = [
  {
    title: 'Series Builder',
    description: 'Generate complete 5-10 episode series in one click',
    icon: Sparkles,
    glow: 'primary' as const,
  },
  {
    title: 'Viral Predictor',
    description: 'See your content\'s viral potential before posting',
    icon: TrendingUp,
    glow: 'secondary' as const,
  },
  {
    title: 'Team Studio',
    description: 'Built for creator teams, not just solopreneurs',
    icon: Zap,
    glow: 'primary' as const,
  },
];

/**
 * HeroSection - Landing page hero with cinematic background
 * Features headline, feature cards, and CTAs
 */
export function HeroSection() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handlePrimaryCTA = () => {
    navigate(user ? '/series/builder' : '/auth');
  };

  const handleSecondaryCTA = () => {
    navigate(user ? '/series/builder?from=trend' : '/auth');
  };

  return (
    <section 
      className="relative min-h-[90vh] flex items-center justify-center overflow-hidden"
      aria-labelledby="hero-heading"
    >
      <CinematicHeroBackground />

      <div className="relative z-10 text-center space-y-8 px-4 max-w-6xl mx-auto">
        {/* Main Headline */}
        <header className="space-y-4">
          <h1 
            id="hero-heading"
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold leading-tight"
          >
            <span className="block bg-gradient-drama bg-clip-text text-transparent">
              Stop Creating.
            </span>
            <span className="block text-foreground">
              Start Building.
            </span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            The only AI platform that turns viral ideas into{' '}
            <span className="text-primary font-semibold">serialized content empires</span>
          </p>
        </header>

        {/* Feature Cards */}
        <div 
          className="grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto mt-12"
          role="list"
          aria-label="Key features"
        >
          {HERO_FEATURES.map((feature) => (
            <FeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
              glow={feature.glow}
              variant="default"
            />
          ))}
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
          <Button
            size="lg"
            className="text-lg px-8 py-6 shadow-glow hover:shadow-glow hover:scale-105 transition-all"
            onClick={handlePrimaryCTA}
          >
            <Sparkles className="w-5 h-5 mr-2" aria-hidden="true" />
            Generate Your First Series
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="text-lg px-8 py-6 hover:scale-105 transition-all"
            onClick={handleSecondaryCTA}
          >
            <TrendingUp className="w-5 h-5 mr-2" aria-hidden="true" />
            Generate from Trend
          </Button>
        </div>

        {/* Social Proof */}
        <p className="text-sm text-muted-foreground pt-8">
          30,000+ creators generated 1M+ scripts this month
        </p>
      </div>
    </section>
  );
}
