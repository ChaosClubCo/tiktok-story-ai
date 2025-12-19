import { lazy, Suspense, useState, useMemo, ComponentType } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePageTitle } from '@/hooks/usePageTitle';
import { MainLayout } from '@/components/layout/MainLayout';
import { LoadingSpinner, AuthRequired, SectionHeader } from '@/components/shared';
import { QuickActionsGrid } from '@/components/dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

import {
  Workflow, Zap, TrendingUp, Heart, Target, Rocket, Users,
  Palette, MessageCircle, Video, Sparkles, Mic, Calendar, Share2, Store,
} from 'lucide-react';

// Lazy loaded components for code splitting
const ScriptWorkflow = lazy(() => import('@/components/ScriptWorkflow'));
const ScriptGenerator = lazy(() => import('@/components/ScriptGenerator'));
const CreatorWellness = lazy(() => import('@/components/CreatorWellness').then(m => ({ default: m.CreatorWellness })));
const ViralTopicFinder = lazy(() => import('@/components/ViralTopicFinder').then(m => ({ default: m.ViralTopicFinder })));
const PerformanceTracker = lazy(() => import('@/components/PerformanceTracker').then(m => ({ default: m.PerformanceTracker })));
const FastValueDelivery = lazy(() => import('@/components/FastValueDelivery').then(m => ({ default: m.FastValueDelivery })));
const SocialProofCapture = lazy(() => import('@/components/SocialProofCapture').then(m => ({ default: m.SocialProofCapture })));
const VisualCreativeHooks = lazy(() => import('@/components/VisualCreativeHooks').then(m => ({ default: m.VisualCreativeHooks })));
const ChatFeedbackRewards = lazy(() => import('@/components/ChatFeedbackRewards').then(m => ({ default: m.ChatFeedbackRewards })));
const AIVideoGeneration = lazy(() => import('@/components/AIVideoGeneration').then(m => ({ default: m.AIVideoGeneration })));
const AIScriptOptimization = lazy(() => import('@/components/AIScriptOptimization').then(m => ({ default: m.AIScriptOptimization })));
const VoiceToneConsistency = lazy(() => import('@/components/VoiceToneConsistency').then(m => ({ default: m.VoiceToneConsistency })));
const ContentCalendarIntegration = lazy(() => import('@/components/ContentCalendarIntegration').then(m => ({ default: m.ContentCalendarIntegration })));
const MultiPlatformAdaptation = lazy(() => import('@/components/MultiPlatformAdaptation').then(m => ({ default: m.MultiPlatformAdaptation })));
const CreatorMarketplace = lazy(() => import('@/components/CreatorMarketplace').then(m => ({ default: m.CreatorMarketplace })));

// Tab configuration - Single source of truth
const TAB_CONFIG = [
  { id: 'workflow', label: 'Workflow', icon: Workflow },
  { id: 'generator', label: 'Generator', icon: Zap },
  { id: 'topics', label: 'Topics', icon: TrendingUp },
  { id: 'wellness', label: 'Wellness', icon: Heart },
  { id: 'performance', label: 'Analytics', icon: Target },
  { id: 'fast-delivery', label: 'Fast', icon: Rocket },
  { id: 'social-proof', label: 'Social', icon: Users },
  { id: 'visual-hooks', label: 'Visual', icon: Palette },
  { id: 'chat-rewards', label: 'Chat', icon: MessageCircle },
  { id: 'ai-video', label: 'AI Video', icon: Video },
  { id: 'optimization', label: 'Optimize', icon: Sparkles },
  { id: 'voice-tone', label: 'Voice', icon: Mic },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'platform', label: 'Platform', icon: Share2 },
  { id: 'marketplace', label: 'Market', icon: Store },
] as const;

// Tab content loading fallback
function TabSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-72 mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Wrapper component for lazy loaded content
function LazyTabContent({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<TabSkeleton />}>
      {children}
    </Suspense>
  );
}

/**
 * Dashboard - Main script creation dashboard
 * Features:
 * - Lazy loaded tab components for performance
 * - Tabbed interface for various creation tools
 * - Quick action cards
 */
export default function Dashboard() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('workflow');

  usePageTitle('Dashboard');

  // Memoize tab content mapping with lazy components
  const tabContent = useMemo(() => ({
    workflow: (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="w-5 h-5" aria-hidden="true" />
            Professional Script Workflow
          </CardTitle>
          <CardDescription>
            Follow our comprehensive 15-step process to create viral TikTok scripts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LazyTabContent>
            <ScriptWorkflow />
          </LazyTabContent>
        </CardContent>
      </Card>
    ),
    generator: (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" aria-hidden="true" />
            AI-Powered Script Generator
          </CardTitle>
          <CardDescription>
            Generate scripts instantly with advanced AI technology
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LazyTabContent>
            <ScriptGenerator />
          </LazyTabContent>
        </CardContent>
      </Card>
    ),
    topics: <LazyTabContent><ViralTopicFinder /></LazyTabContent>,
    wellness: <LazyTabContent><CreatorWellness /></LazyTabContent>,
    performance: <LazyTabContent><PerformanceTracker /></LazyTabContent>,
    'fast-delivery': <LazyTabContent><FastValueDelivery /></LazyTabContent>,
    'social-proof': <LazyTabContent><SocialProofCapture /></LazyTabContent>,
    'visual-hooks': <LazyTabContent><VisualCreativeHooks /></LazyTabContent>,
    'chat-rewards': <LazyTabContent><ChatFeedbackRewards /></LazyTabContent>,
    'ai-video': <LazyTabContent><AIVideoGeneration /></LazyTabContent>,
    optimization: <LazyTabContent><AIScriptOptimization /></LazyTabContent>,
    'voice-tone': <LazyTabContent><VoiceToneConsistency /></LazyTabContent>,
    calendar: <LazyTabContent><ContentCalendarIntegration /></LazyTabContent>,
    platform: <LazyTabContent><MultiPlatformAdaptation /></LazyTabContent>,
    marketplace: <LazyTabContent><CreatorMarketplace /></LazyTabContent>,
  }), []);

  if (loading) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <AuthRequired user={user} loading={loading}>
      <MainLayout background="gradient">
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Header */}
          <SectionHeader
            title="Script Creation Dashboard"
            description="Create viral TikTok scripts with our advanced workflow and AI-powered tools"
            gradient
          />

          {/* Quick Actions */}
          <QuickActionsGrid onNewScript={() => setActiveTab('workflow')} />

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 lg:grid-cols-15 gap-1 h-auto p-1">
              {TAB_CONFIG.map(({ id, label, icon: Icon }) => (
                <TabsTrigger
                  key={id}
                  value={id}
                  className="flex items-center gap-1 text-xs py-2"
                >
                  <Icon className="w-3 h-3" aria-hidden="true" />
                  <span className="hidden sm:inline">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {TAB_CONFIG.map(({ id }) => (
              <TabsContent key={id} value={id} className="space-y-6">
                {tabContent[id as keyof typeof tabContent]}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </MainLayout>
    </AuthRequired>
  );
}
