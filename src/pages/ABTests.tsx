import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, FlaskConical, Trophy, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ABTestWizard } from "@/components/abtesting/ABTestWizard";
import { ABTestResults } from "@/components/abtesting/ABTestResults";
import { AuthRequired } from "@/components/shared/AuthRequired";

interface ABTest {
  id: string;
  test_name: string;
  hypothesis: string | null;
  status: string;
  created_at: string;
  completed_at: string | null;
  winner_variant_id: string | null;
  script_id: string;
}

const ABTests = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tests, setTests] = useState<ABTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchTests();
    }
  }, [user]);

  const fetchTests = async () => {
    try {
      const { data, error } = await supabase
        .from('ab_tests')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTests(data || []);
    } catch (error) {
      console.error('Error fetching tests:', error);
      toast({
        title: "Error",
        description: "Failed to load A/B tests",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestCreated = () => {
    setCreateOpen(false);
    fetchTests();
    toast({
      title: "A/B Test Created",
      description: "Your test is now running. Results will update as data comes in.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-info/20 text-info border-info/30"><Clock className="w-3 h-3 mr-1" />Active</Badge>;
      case 'completed':
        return <Badge className="bg-success/20 text-success border-success/30"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-muted text-muted-foreground"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AuthRequired user={user} loading={loading || isLoading}>
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
        <Header />
        
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                A/B Testing
              </h1>
              <p className="text-muted-foreground mt-2">
                Test script variations to find the best performing content
              </p>
            </div>
            
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  New Test
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create A/B Test</DialogTitle>
                </DialogHeader>
                <ABTestWizard onComplete={handleTestCreated} onCancel={() => setCreateOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          {tests.length === 0 ? (
            <Card className="text-center py-16 bg-gradient-card backdrop-blur-sm">
              <CardContent>
                <FlaskConical className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No A/B Tests Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first test to compare script variations and find what works best.
                </p>
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Test
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {tests.map((test) => (
                <Card 
                  key={test.id} 
                  className="hover:shadow-elevated transition-shadow cursor-pointer bg-gradient-card backdrop-blur-sm"
                  onClick={() => setSelectedTest(test)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2">
                          <FlaskConical className="w-5 h-5 text-primary" />
                          {test.test_name}
                        </CardTitle>
                        {test.hypothesis && (
                          <CardDescription>{test.hypothesis}</CardDescription>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(test.status || 'active')}
                        {test.winner_variant_id && (
                          <Badge className="bg-warning/20 text-warning border-warning/30">
                            <Trophy className="w-3 h-3 mr-1" />
                            Winner Selected
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>Created {format(new Date(test.created_at), 'MMM d, yyyy')}</span>
                      {test.completed_at && (
                        <span>Completed {format(new Date(test.completed_at), 'MMM d, yyyy')}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Test Results Modal */}
          <Dialog open={!!selectedTest} onOpenChange={() => setSelectedTest(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{selectedTest?.test_name}</DialogTitle>
              </DialogHeader>
              {selectedTest && (
                <ABTestResults 
                  testId={selectedTest.id} 
                  onComplete={() => {
                    setSelectedTest(null);
                    fetchTests();
                  }}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </AuthRequired>
  );
};

export default ABTests;
