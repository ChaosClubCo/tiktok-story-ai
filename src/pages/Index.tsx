import { useAuth } from '@/hooks/useAuth';
import { usePageTitle } from '@/hooks/usePageTitle';
import { MainLayout } from '@/components/layout/MainLayout';
import { LoadingSpinner } from '@/components/shared';
import { HeroSection, ScriptBuilderSection } from '@/components/landing';
import { SubscriptionTiers } from '@/components/SubscriptionTiers';
import { LandingViralPredictorCard } from '@/components/LandingViralPredictorCard';
import { LiveSocialProofFeed } from '@/components/LiveSocialProofFeed';
import { DifferentiationTable } from '@/components/DifferentiationTable';
import { SeriesShowcaseSection } from '@/components/SeriesShowcaseSection';

/**
 * Index - Landing page for MiniDrama
 * 
 * Structure:
 * 1. Hero section with CTAs
 * 2. Viral predictor demo
 * 3. Social proof feed
 * 4. Differentiation table
 * 5. Series showcase
 * 6. Script builder
 * 7. Subscription tiers
 */
export default function Index() {
  const { loading, subscription } = useAuth();
  
  usePageTitle('AI Script Generator for Viral TikTok Content');

  if (loading) {
    return <LoadingSpinner message="Loading..." />;
  }

  return (
    <MainLayout background="base">
      {/* Hero Section */}
      <HeroSection />

      {/* Viral Predictor Demo */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <LandingViralPredictorCard />
        </div>
      </section>

      {/* Social Proof */}
      <LiveSocialProofFeed />

      {/* Differentiation */}
      <DifferentiationTable />

      {/* Series Showcase */}
      <SeriesShowcaseSection />

      {/* Script Builder */}
      <ScriptBuilderSection />

      {/* Subscription Tiers */}
      <section className="container mx-auto px-4 py-12">
        <SubscriptionTiers currentTier={subscription?.subscription_tier} />
      </section>
    </MainLayout>
  );
}
