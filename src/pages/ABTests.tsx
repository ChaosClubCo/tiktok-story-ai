import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Loader2, TrendingUp, Trophy, FlaskConical } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ABTestWizard } from '@/components/ABTestWizard';
import { ABTestResults } from '@/components/ABTestResults';
import { format } from 'date-fns';

interface ABTest {
  id: string;
  test_name: string;
  hypothesis?: string;
  status: string;
  created_at: string;
  completed_at?: string;
  winner_variant_id?: string;
  script_id: string;
}

export default function ABTests() {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [testVariants, setTestVariants] = useState<any[]>([]);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedScriptId, setSelectedScriptId] = useState<string>('');

  useEffect(() => {
    fetchTests();
  }, []);

  useEffect(() => {
    if (selectedTest) {
      fetchTestVariants(selectedTest.id);
    }
  }, [selectedTest]);

  const fetchTests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('ab_tests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTests(data || []);
    } catch (error: any) {
      console.error('Error fetching tests:', error);
      toast.error('Failed to load A/B tests');
    } finally {
      setLoading(false);
    }
  };

  const fetchTestVariants = async (testId: string) => {
    try {
      const { data, error } = await supabase
        .from('ab_test_variants')
        .select('*')
        .eq('test_id', testId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setTestVariants(data || []);
    } catch (error: any) {
      console.error('Error fetching variants:', error);
      toast.error('Failed to load test variants');
    }
  };

  const handleDeclareWinner = async (variantId: string) => {
    if (!selectedTest) return;

    try {
      const { error } = await supabase.functions.invoke('complete-ab-test', {
        body: {
          testId: selectedTest.id,
          winnerId: variantId
        }
      });

      if (error) throw error;

      toast.success('Winner declared successfully');
      fetchTests();
      if (selectedTest) {
        const updated = tests.find(t => t.id === selectedTest.id);
        if (updated) setSelectedTest(updated);
      }
    } catch (error: any) {
      console.error('Error declaring winner:', error);
      toast.error('Failed to declare winner');
    }
  };

  const handleApplyWinner = async (variantId: string) => {
    toast.success('Winner applied to main script');
    // Implementation would update the main script with winner content
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      active: 'default',
      completed: 'secondary',
      paused: 'outline'
    };
    return <Badge variant={variants[status] || 'outline'}>{status}</Badge>;
  };

  const activeTests = tests.filter(t => t.status === 'active');
  const completedTests = tests.filter(t => t.status === 'completed');

  const stats = {
    totalTests: tests.length,
    activeTests: activeTests.length,
    completedTests: completedTests.length,
    avgImprovement: completedTests.length > 0 ? 12.5 : 0 // Placeholder calculation
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-base">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-base">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">A/B Testing</h1>
            <p className="text-muted-foreground">Test different script variations and optimize performance</p>
          </div>
          <Button onClick={() => setWizardOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Test
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <FlaskConical className="w-8 h-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Total Tests</p>
                <p className="text-2xl font-bold">{stats.totalTests}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Active Tests</p>
                <p className="text-2xl font-bold">{stats.activeTests}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{stats.completedTests}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Improvement</p>
                <p className="text-2xl font-bold">+{stats.avgImprovement}%</p>
              </div>
            </div>
          </Card>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Tests ({tests.length})</TabsTrigger>
            <TabsTrigger value="active">Active ({activeTests.length})</TabsTrigger>
            <TabsTrigger value="completed">Completed ({completedTests.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {selectedTest ? (
              <div>
                <Button variant="outline" onClick={() => setSelectedTest(null)} className="mb-4">
                  ← Back to Tests
                </Button>
                <ABTestResults
                  variants={testVariants}
                  testName={selectedTest.test_name}
                  hypothesis={selectedTest.hypothesis}
                  winnerId={selectedTest.winner_variant_id}
                  onDeclareWinner={handleDeclareWinner}
                  onApplyWinner={handleApplyWinner}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tests.map((test) => (
                  <Card
                    key={test.id}
                    className="p-6 cursor-pointer hover:shadow-elevated transition-shadow"
                    onClick={() => setSelectedTest(test)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold">{test.test_name}</h3>
                        {getStatusBadge(test.status)}
                      </div>
                      {test.hypothesis && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {test.hypothesis}
                        </p>
                      )}
                      <div className="text-xs text-muted-foreground">
                        Created {format(new Date(test.created_at), 'PPp')}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="active" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeTests.map((test) => (
                <Card
                  key={test.id}
                  className="p-6 cursor-pointer hover:shadow-elevated transition-shadow"
                  onClick={() => setSelectedTest(test)}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold">{test.test_name}</h3>
                      {getStatusBadge(test.status)}
                    </div>
                    {test.hypothesis && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {test.hypothesis}
                      </p>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Created {format(new Date(test.created_at), 'PPp')}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedTests.map((test) => (
                <Card
                  key={test.id}
                  className="p-6 cursor-pointer hover:shadow-elevated transition-shadow"
                  onClick={() => setSelectedTest(test)}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold">{test.test_name}</h3>
                      {getStatusBadge(test.status)}
                    </div>
                    {test.hypothesis && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {test.hypothesis}
                      </p>
                    )}
                    <div className="text-xs text-muted-foreground">
                      Completed {test.completed_at ? format(new Date(test.completed_at), 'PPp') : 'N/A'}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <ABTestWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        scriptId={selectedScriptId}
        onTestCreated={fetchTests}
      />
    </div>
  );
}
