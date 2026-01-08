import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Download, Eye, CheckSquare, Square, Loader2, History, Save } from "lucide-react";
import { Header } from "@/components/Header";
import { ScriptVersionHistory } from "@/components/ScriptVersionHistory";
import { useNavigate } from "react-router-dom";
import { useAutoVersion } from "@/hooks/useAutoVersion";
import { BranchSelector } from "@/components/branching/BranchSelector";

interface SavedScript {
  id: string;
  title: string;
  content: string;
  niche: string;
  length: string;
  tone: string;
  topic: string;
  created_at: string;
  current_version?: number;
  active_branch_id?: string | null;
}

interface BatchAnalysisResult {
  id: string;
  title: string;
  status: 'pending' | 'analyzing' | 'completed' | 'failed';
  viralScore?: number;
}

const MyScripts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [scripts, setScripts] = useState<SavedScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScript, setSelectedScript] = useState<any>(null);
  const [selectedScriptIds, setSelectedScriptIds] = useState<Set<string>>(new Set());
  const [batchAnalyzing, setBatchAnalyzing] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });
  const [batchResults, setBatchResults] = useState<BatchAnalysisResult[]>([]);
  const [versionHistoryScript, setVersionHistoryScript] = useState<SavedScript | null>(null);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [editingScript, setEditingScript] = useState<SavedScript | null>(null);
  const { toast } = useToast();

  // Auto-versioning for the script being edited
  const { checkAndCreateVersion } = useAutoVersion(
    editingScript?.id || null,
    editingScript ? {
      content: editingScript.content,
      title: editingScript.title,
      niche: editingScript.niche,
      length: editingScript.length,
      tone: editingScript.tone,
      timestamp: Date.now(),
    } : null
  );

  useEffect(() => {
    if (user) {
      fetchScripts();
    }
  }, [user]);

  const fetchScripts = async () => {
    try {
      const { data, error } = await supabase
        .from('scripts')
        .select('id, title, content, niche, length, tone, topic, created_at, current_version, active_branch_id')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setScripts(data || []);
    } catch (error) {
      console.error('Error fetching scripts:', error);
      toast({
        title: "Error",
        description: "Failed to load your scripts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (scriptId: string) => {
    try {
      const { error } = await supabase
        .from('scripts')
        .delete()
        .eq('id', scriptId);

      if (error) throw error;

      setScripts(scripts.filter(s => s.id !== scriptId));
      toast({
        title: "Script Deleted",
        description: "Your script has been deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting script:', error);
      toast({
        title: "Error",
        description: "Failed to delete script",
        variant: "destructive",
      });
    }
  };

  const handleView = (script: SavedScript) => {
    try {
      const parsedContent = JSON.parse(script.content);
      setSelectedScript(parsedContent);
    } catch (error) {
      console.error('Error parsing script content:', error);
      toast({
        title: "Error",
        description: "Failed to load script content",
        variant: "destructive",
      });
    }
  };

  const handleExport = (script: SavedScript) => {
    try {
      const parsedContent = JSON.parse(script.content);
      const scriptText = `${parsedContent.title}\n\n${parsedContent.hook}\n\n${parsedContent.scenes.map((scene: any, index: number) => 
        `Scene ${index + 1} (${scene.timeStamp}):\n${scene.dialogue}\nAction: ${scene.action}\nVisual: ${scene.visual}\nSound: ${scene.sound}`
      ).join('\n\n')}\n\nHashtags: ${parsedContent.hashtags.map((tag: string) => `#${tag}`).join(' ')}`;
      
      const blob = new Blob([scriptText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${script.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_script.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Script Exported!",
        description: "Your script has been downloaded as a text file.",
      });
    } catch (error) {
      console.error('Error exporting script:', error);
      toast({
        title: "Error",
        description: "Failed to export script",
        variant: "destructive",
      });
    }
  };

  const toggleScriptSelection = (scriptId: string) => {
    const newSelection = new Set(selectedScriptIds);
    if (newSelection.has(scriptId)) {
      newSelection.delete(scriptId);
    } else {
      newSelection.add(scriptId);
    }
    setSelectedScriptIds(newSelection);
  };

  const handleCreateVersion = async (scriptId: string, description?: string) => {
    try {
      const script = scripts.find(s => s.id === scriptId);
      if (!script) return;

      const { data, error } = await supabase.functions.invoke('create-script-version', {
        body: { 
          scriptId,
          title: script.title,
          content: script.content,
          niche: script.niche,
          length: script.length,
          tone: script.tone,
          changeDescription: description || 'Manual save',
          userId: user?.id
        }
      });

      if (error) throw error;

      toast({
        title: "Version Created",
        description: `Version ${data.version.version_number} created successfully`,
      });

      fetchScripts();
    } catch (error) {
      console.error('Error creating version:', error);
      toast({
        title: "Error",
        description: "Failed to create version",
        variant: "destructive",
      });
    }
  };

  // Track when a script is being edited
  const handleEdit = (script: SavedScript) => {
    setEditingScript(script);
  };

  // Trigger auto-version check when user navigates away or runs analysis
  useEffect(() => {
    return () => {
      if (editingScript && user) {
        checkAndCreateVersion(
          {
            content: editingScript.content,
            title: editingScript.title,
            niche: editingScript.niche,
            length: editingScript.length,
            tone: editingScript.tone,
            timestamp: Date.now(),
          },
          user.id
        );
      }
    };
  }, [editingScript, user]);

  const handleShowVersionHistory = (script: SavedScript) => {
    setVersionHistoryScript(script);
    setVersionHistoryOpen(true);
  };

  const handleVersionRestore = (version: any) => {
    setVersionHistoryOpen(false);
    fetchScripts();
    toast({
      title: "Version Restored",
      description: "Script has been restored to selected version",
    });
  };

  const handleBranchChange = async (scriptId: string, branchId: string) => {
    // Refetch scripts to get updated content from the new branch
    await fetchScripts();
    toast({
      title: "Branch Switched",
      description: "Script content updated to selected branch",
    });
  };

  const toggleSelectAll = () => {
    if (selectedScriptIds.size === scripts.length) {
      setSelectedScriptIds(new Set());
    } else {
      setSelectedScriptIds(new Set(scripts.map(s => s.id)));
    }
  };

  const handleBatchAnalysis = async () => {
    if (selectedScriptIds.size === 0) {
      toast({
        title: "No Scripts Selected",
        description: "Please select at least one script to analyze",
        variant: "destructive",
      });
      return;
    }

    if (selectedScriptIds.size > 10) {
      toast({
        title: "Too Many Scripts",
        description: "Please select a maximum of 10 scripts for batch analysis",
        variant: "destructive",
      });
      return;
    }

    setBatchAnalyzing(true);
    const scriptsToAnalyze = scripts.filter(s => selectedScriptIds.has(s.id));
    setBatchProgress({ current: 0, total: scriptsToAnalyze.length });
    setBatchResults(scriptsToAnalyze.map(s => ({ 
      id: s.id, 
      title: s.title, 
      status: 'pending' as 'pending' | 'analyzing' | 'completed' | 'failed'
    })));

    let completed = 0;
    const results: BatchAnalysisResult[] = scriptsToAnalyze.map(s => ({ 
      id: s.id, 
      title: s.title, 
      status: 'pending' as 'pending' | 'analyzing' | 'completed' | 'failed'
    }));

    for (let i = 0; i < scriptsToAnalyze.length; i++) {
      const script = scriptsToAnalyze[i];
      
      // Update status to analyzing
      results[i] = { ...results[i], status: 'analyzing' };
      setBatchResults([...results]);

      try {
        const { data, error } = await supabase.functions.invoke('analyze-script', {
          body: {
            scriptId: script.id,
            content: script.content,
            title: script.title,
            niche: script.niche
          }
        });

        if (error) throw error;

        results[i] = { 
          ...results[i], 
          status: 'completed',
          viralScore: data?.viral_score 
        };
        completed++;
        
        // Add delay between requests (2 seconds)
        if (i < scriptsToAnalyze.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error) {
        console.error(`Error analyzing script ${script.title}:`, error);
        results[i] = { ...results[i], status: 'failed' };
      }

      setBatchProgress({ current: i + 1, total: scriptsToAnalyze.length });
      setBatchResults([...results]);
    }

    setBatchAnalyzing(false);
    toast({
      title: "Batch Analysis Complete",
      description: `Successfully analyzed ${completed} of ${scriptsToAnalyze.length} scripts`,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Loading your scripts...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <Header />
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-drama bg-clip-text text-transparent">
            My Scripts
          </h1>
          <p className="text-lg text-muted-foreground">
            All your saved viral TikTok scripts in one place
          </p>
        </div>

        {/* Batch Selection Controls */}
        {scripts.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSelectAll}
            >
              {selectedScriptIds.size === scripts.length ? (
                <>
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Deselect All
                </>
              ) : (
                <>
                  <Square className="h-4 w-4 mr-2" />
                  Select All
                </>
              )}
            </Button>
            
            {selectedScriptIds.size > 0 && (
              <Button
                onClick={handleBatchAnalysis}
                disabled={batchAnalyzing}
                className="bg-gradient-to-r from-primary to-primary/80"
              >
                {batchAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing {batchProgress.current}/{batchProgress.total}
                  </>
                ) : (
                  <>Analyze Selected ({selectedScriptIds.size})</>
                )}
              </Button>
            )}
          </div>
        )}
        
        {/* Batch Progress */}
        {batchAnalyzing && (
          <Card className="p-4 bg-gradient-to-r from-primary/5 to-secondary/5">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Batch Analysis Progress</span>
                <span className="text-muted-foreground">
                  {batchProgress.current} of {batchProgress.total} completed
                </span>
              </div>
              <Progress 
                value={(batchProgress.current / batchProgress.total) * 100} 
                className="h-2"
              />
            </div>
          </Card>
        )}
        
        {/* Batch Results */}
        {batchResults.length > 0 && !batchAnalyzing && (
          <Card className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">Analysis Results</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    navigate('/predictions');
                    setBatchResults([]);
                  }}
                >
                  View Full Analysis
                </Button>
              </div>
              <div className="grid gap-2">
                {batchResults.map((result) => (
                  <div key={result.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                    <span className="text-sm font-medium truncate flex-1">{result.title}</span>
                    <div className="flex items-center gap-2">
                      {result.status === 'completed' && result.viralScore && (
                        <Badge variant="default" className="ml-2">
                          Viral Score: {result.viralScore}
                        </Badge>
                      )}
                      <Badge 
                        variant={
                          result.status === 'completed' ? 'default' : 
                          result.status === 'failed' ? 'destructive' : 
                          result.status === 'analyzing' ? 'secondary' : 
                          'outline'
                        }
                      >
                        {result.status === 'analyzing' && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                        {result.status.charAt(0).toUpperCase() + result.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {scripts.length === 0 ? (
          <Card className="p-8 text-center bg-gradient-card backdrop-blur-sm border border-border/50">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">No Scripts Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start creating viral TikTok scripts to see them here!
            </p>
            <Button variant="drama" onClick={() => window.location.href = "/"}>
              ✨ Create Your First Script
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6">
            {scripts.map((script) => (
              <Card key={script.id} className="p-6 bg-gradient-card backdrop-blur-sm border border-border/50 relative">
                <div className="absolute top-4 left-4 z-10">
                  <Checkbox
                    checked={selectedScriptIds.has(script.id)}
                    onCheckedChange={() => toggleScriptSelection(script.id)}
                    className="h-5 w-5 border-2"
                  />
                </div>
                <div className="pl-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold">{script.title}</h3>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">{script.niche}</Badge>
                        <Badge variant="outline">{script.length}</Badge>
                        <Badge variant="outline">{script.tone}</Badge>
                        {script.topic && <Badge variant="outline">{script.topic}</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Created: {new Date(script.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <BranchSelector 
                        scriptId={script.id} 
                        currentBranchId={script.active_branch_id || null}
                        onBranchChange={(branchId) => handleBranchChange(script.id, branchId)}
                      />
                      <Button variant="outline" size="sm" onClick={() => handleView(script)}>
                        <Eye className="w-4 h-4 mr-2" />View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleExport(script)}>
                        <Download className="w-4 h-4 mr-2" />Export
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleShowVersionHistory(script)}>
                        <History className="w-4 h-4 mr-2" />
                        History
                        {script.current_version && script.current_version > 1 && (
                          <Badge variant="outline" className="ml-2">v{script.current_version}</Badge>
                        )}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleCreateVersion(script.id, `Manual save`)}>
                        <Save className="w-4 h-4 mr-2" />Save Version
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(script.id)}>
                        <Trash2 className="w-4 h-4 mr-2" />Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Script Preview Modal */}
        {selectedScript && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <Card className="p-6 bg-gradient-card backdrop-blur-sm border border-border/50">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold bg-gradient-drama bg-clip-text text-transparent">
                    {selectedScript.title}
                  </h2>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedScript(null)}
                  >
                    ✕
                  </Button>
                </div>
                
                <div className="space-y-6">
                  {/* Viral Hook */}
                  <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
                    <p className="text-lg font-semibold text-primary">🎯 VIRAL HOOK:</p>
                    <p className="text-foreground mt-2">{selectedScript.hook}</p>
                  </div>

                  {/* Scenes */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Scene Breakdown:</h3>
                    {selectedScript.scenes.map((scene: any) => (
                      <div key={scene.id} className="border border-border/50 rounded-lg p-4 bg-background/30">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                            {scene.timeStamp}
                          </Badge>
                          <Badge variant="secondary">Scene {scene.id}</Badge>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-semibold text-accent mb-1">💬 Dialogue:</p>
                            <p className="text-foreground">{scene.dialogue}</p>
                          </div>
                          
                          <div>
                            <p className="font-semibold text-accent mb-1">🎭 Action:</p>
                            <p className="text-foreground">{scene.action}</p>
                          </div>
                          
                          <div>
                            <p className="font-semibold text-accent mb-1">👁️ Visual:</p>
                            <p className="text-muted-foreground">{scene.visual}</p>
                          </div>
                          
                          <div>
                            <p className="font-semibold text-accent mb-1">🔊 Sound:</p>
                            <p className="text-muted-foreground">{scene.sound}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Hashtags */}
                  <div className="space-y-2">
                    <h4 className="font-semibold">📱 Suggested Hashtags:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedScript.hashtags.map((tag: string, index: number) => (
                        <Badge key={index} variant="secondary" className="bg-accent/20 text-accent">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>

      <Dialog open={versionHistoryOpen} onOpenChange={setVersionHistoryOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Version History - {versionHistoryScript?.title}</DialogTitle>
          </DialogHeader>
          {versionHistoryScript && (
            <ScriptVersionHistory
              scriptId={versionHistoryScript.id}
              currentVersion={versionHistoryScript.current_version || 1}
              onRestore={handleVersionRestore}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyScripts;