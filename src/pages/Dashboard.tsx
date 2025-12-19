import { useState, useMemo } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { usePageTitle } from '@/hooks/usePageTitle';
import { MainLayout } from '@/components/layout/MainLayout';
import { LoadingSpinner, AuthRequired, SectionHeader } from '@/components/shared';
import { QuickActionsGrid } from '@/components/dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Feature Components
import ScriptWorkflow from '@/components/ScriptWorkflow';
import ScriptGenerator from '@/components/ScriptGenerator';
import { CreatorWellness } from '@/components/CreatorWellness';
import { ViralTopicFinder } from '@/components/ViralTopicFinder';
import { PerformanceTracker } from '@/components/PerformanceTracker';
import { FastValueDelivery } from '@/components/FastValueDelivery';
import { SocialProofCapture } from '@/components/SocialProofCapture';
import { VisualCreativeHooks } from '@/components/VisualCreativeHooks';
import { ChatFeedbackRewards } from '@/components/ChatFeedbackRewards';
import { AIVideoGeneration } from '@/components/AIVideoGeneration';
import { AIScriptOptimization } from '@/components/AIScriptOptimization';
import { VoiceToneConsistency } from '@/components/VoiceToneConsistency';
import { ContentCalendarIntegration } from '@/components/ContentCalendarIntegration';
import { MultiPlatformAdaptation } from '@/components/MultiPlatformAdaptation';
import { CreatorMarketplace } from '@/components/CreatorMarketplace';

import {
  Workflow, Zap, TrendingUp, Heart, Target, Rocket, Users,
  Palette, MessageCircle, Video, Sparkles, Mic, Calendar, Share2, Store,
} from 'lucide-react';

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

/**
 * Dashboard - Main script creation dashboard
 * Features tabbed interface for various creation tools
 */
export default function Dashboard() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('workflow');

  usePageTitle('Dashboard');

  // Memoize tab content mapping
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
          <ScriptWorkflow />
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
          <ScriptGenerator />
        </CardContent>
      </Card>
    ),
    topics: <ViralTopicFinder />,
    wellness: <CreatorWellness />,
    performance: <PerformanceTracker />,
    'fast-delivery': <FastValueDelivery />,
    'social-proof': <SocialProofCapture />,
    'visual-hooks': <VisualCreativeHooks />,
    'chat-rewards': <ChatFeedbackRewards />,
    'ai-video': <AIVideoGeneration />,
    optimization: <AIScriptOptimization />,
    'voice-tone': <VoiceToneConsistency />,
    calendar: <ContentCalendarIntegration />,
    platform: <MultiPlatformAdaptation />,
    marketplace: <CreatorMarketplace />,
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
