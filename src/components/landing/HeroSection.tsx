import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FeatureCard } from '@/components/shared';
import { Sparkles, TrendingUp, Zap, Play, Check } from 'lucide-react';
import { CinematicHeroBackground } from '@/components/CinematicHeroBackground';
import { useAuth } from '@/hooks/useAuth';
import { DemoVideoModal } from './DemoVideoModal';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

const HERO_FEATURES = [
  {
    title: 'One-Click Series',
    description: 'Generate 5-10 episode series with connected storylines instantly',
    icon: Sparkles,
    glow: 'primary' as const,
  },
  {
    title: 'Viral Predictor',
    description: 'AI scores your content before you post—know what will hit',
    icon: TrendingUp,
    glow: 'secondary' as const,
  },
  {
    title: 'Team Studio',
    description: 'Collaborate with your team on multi-series content empires',
    icon: Zap,
    glow: 'primary' as const,
  },
];

const PLATFORM_BADGES = [
  'TikTok',
  'Instagram Reels',
  'YouTube Shorts',
];

/**
 * HeroSection - Landing page hero with cinematic background
 * Features clear value proposition, demo video CTA, and trust indicators
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
        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Badge variant="secondary" className="px-4 py-1.5 text-sm font-medium">
            ✨ Trusted by 30,000+ creators generating 1M+ views monthly
          </Badge>
        </motion.div>

        {/* Main Headline */}
        <header className="space-y-4">
          <motion.h1 
            id="hero-heading"
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <span className="block text-foreground">
              Turn One Idea Into
            </span>
            <span className="block bg-gradient-drama bg-clip-text text-transparent">
              10 Viral Episodes
            </span>
          </motion.h1>
          <motion.p 
            className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            AI generates complete TikTok series with{' '}
            <span className="text-primary font-semibold">hooks that grab</span>,{' '}
            <span className="text-primary font-semibold">cliffhangers that keep</span>, and{' '}
            <span className="text-primary font-semibold">stories that spread</span>.
          </motion.p>
        </header>

        {/* Platform Compatibility */}
        <motion.div 
          className="flex flex-wrap justify-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <span className="text-sm text-muted-foreground mr-2">Works with:</span>
          {PLATFORM_BADGES.map((platform) => (
            <span 
              key={platform}
              className="text-sm px-3 py-1 rounded-full bg-muted/50 text-foreground/80 border border-border/50"
            >
              {platform}
            </span>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            size="lg"
            className="text-lg px-8 py-6 shadow-glow hover:shadow-glow hover:scale-105 transition-all"
            onClick={handlePrimaryCTA}
          >
            <Sparkles className="w-5 h-5 mr-2" aria-hidden="true" />
            Generate Your First Series Free
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="text-lg px-8 py-6 hover:scale-105 transition-all"
            onClick={handleSecondaryCTA}
          >
            <TrendingUp className="w-5 h-5 mr-2" aria-hidden="true" />
            Start from Trending Topic
          </Button>
        </motion.div>

        {/* Value Props */}
        <motion.div 
          className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <span className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-green-500" />
            No credit card required
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-green-500" />
            Generate in 30 seconds
          </span>
          <span className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-green-500" />
            Cancel anytime
          </span>
        </motion.div>

        {/* Feature Cards */}
        <motion.div 
          className="grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto mt-12"
          role="list"
          aria-label="Key features"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
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
        </motion.div>

        {/* Demo Video CTA */}
        <motion.div
          className="pt-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <DemoVideoModal />
        </motion.div>
      </div>
    </section>
  );
}