import { useAuth } from '@/hooks/useAuth';
import { usePageTitle } from '@/hooks/usePageTitle';
import { MainLayout } from '@/components/layout/MainLayout';
import { LoadingSpinner } from '@/components/shared';
import { 
  HeroSection, 
  ScriptBuilderSection,
  HowItWorksSection,
  TestimonialsSection,
  ResultsShowcaseSection,
  TrustBadgesSection,
} from '@/components/landing';
import { SubscriptionTiers } from '@/components/SubscriptionTiers';
import { LandingViralPredictorCard } from '@/components/LandingViralPredictorCard';
import { DifferentiationTable } from '@/components/DifferentiationTable';
import { SeriesShowcaseSection } from '@/components/SeriesShowcaseSection';

/**
 * Index - Landing page for MiniDrama
 * 
 * Optimized conversion flow:
 * 1. Hero section with value prop + demo video
 * 2. How It Works (3-step explanation)
 * 3. Trust badges (platform compatibility)
 * 4. Viral predictor demo (interactive)
 * 5. Testimonials (social proof)
 * 6. Differentiation table (vs competitors)
 * 7. Results showcase (before/after)
 * 8. Series showcase
 * 9. Script builder demo
 * 10. Subscription tiers
 */
export default function Index() {
  const { loading, subscription } = useAuth();
  
  usePageTitle('AI Script Generator for Viral TikTok Content');

  if (loading) {
    return <LoadingSpinner message="Loading..." />;
  }

  return (
    <MainLayout background="base">
      {/* Hero Section with Demo Video */}
      <HeroSection />

      {/* How It Works - 3 Step Explanation */}
      <HowItWorksSection />

      {/* Trust Badges - Platform Compatibility */}
      <TrustBadgesSection />

      {/* Viral Predictor Demo */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <LandingViralPredictorCard />
        </div>
      </section>

      {/* Creator Testimonials */}
      <TestimonialsSection />

      {/* Differentiation */}
      <DifferentiationTable />

      {/* Results Showcase */}
      <ResultsShowcaseSection />

      {/* Series Showcase */}
      <SeriesShowcaseSection />

      {/* Script Builder Demo */}
      <ScriptBuilderSection />

      {/* Subscription Tiers */}
      <section className="container mx-auto px-4 py-12">
        <SubscriptionTiers currentTier={subscription?.subscription_tier} />
      </section>
    </MainLayout>
  );
}