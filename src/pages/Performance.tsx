import { usePageTitle } from '@/hooks/usePageTitle';
import { MainLayout } from '@/components/layout/MainLayout';
import { SectionHeader } from '@/components/shared';
import { PerformanceDashboard } from '@/components/PerformanceDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Gauge, Shield } from 'lucide-react';

/**
 * Performance Page - Detailed performance monitoring
 * Displays real-time Web Vitals and session metrics
 */
export default function Performance() {
  usePageTitle('Performance Monitoring');

  return (
    <MainLayout background="gradient">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <SectionHeader
          title="Performance Monitoring"
          description="Track real-time Web Vitals and session performance metrics"
          gradient
        />

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Gauge className="w-4 h-4 text-primary" />
                Core Web Vitals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Monitor LCP, INP, and CLS - the three metrics that matter most for user experience.
              </p>
              <div className="flex gap-2 mt-3">
                <Badge variant="outline" className="text-xs">LCP</Badge>
                <Badge variant="outline" className="text-xs">INP</Badge>
                <Badge variant="outline" className="text-xs">CLS</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                Real-Time Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Metrics are captured automatically as you interact with the app and updated every 5 seconds.
              </p>
              <div className="flex gap-2 mt-3">
                <Badge variant="secondary" className="text-xs">Auto-refresh</Badge>
                <Badge variant="secondary" className="text-xs">Live data</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Error Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Session errors are tracked automatically with stack traces for debugging.
              </p>
              <div className="flex gap-2 mt-3">
                <Badge variant="secondary" className="text-xs">Stack traces</Badge>
                <Badge variant="secondary" className="text-xs">Batched reports</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard */}
        <PerformanceDashboard />

        {/* Additional Info */}
        <Card className="border-dashed border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Understanding Your Metrics</CardTitle>
            <CardDescription>
              Learn what each metric means and how to improve them
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
              <div>
                <h4 className="font-medium text-foreground mb-1">LCP (Largest Contentful Paint)</h4>
                <p className="text-muted-foreground">
                  Measures loading performance. Should occur within 2.5 seconds of page start loading.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">INP (Interaction to Next Paint)</h4>
                <p className="text-muted-foreground">
                  Measures responsiveness. Should be less than 200 milliseconds for good experience.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">CLS (Cumulative Layout Shift)</h4>
                <p className="text-muted-foreground">
                  Measures visual stability. Should be less than 0.1 for good experience.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">FCP (First Contentful Paint)</h4>
                <p className="text-muted-foreground">
                  Time until first content appears. Should be under 1.8 seconds.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">TTFB (Time to First Byte)</h4>
                <p className="text-muted-foreground">
                  Server response time. Should be under 800 milliseconds.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-foreground mb-1">Performance Score</h4>
                <p className="text-muted-foreground">
                  Composite score based on Core Web Vitals. 90+ is excellent, 50-89 needs work.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
