import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Download, Eye } from "lucide-react";
import { Header } from "@/components/Header";

interface ScriptScene {
  id: number;
  timeStamp: string;
  dialogue: string;
  action: string;
  visual: string;
  sound: string;
}

interface Script {
  title: string;
  hook: string;
  scenes: ScriptScene[];
  hashtags: string[];
}

interface SavedScript {
  id: string;
  title: string;
  content: string;
  niche: string;
  length: string;
  tone: string;
  topic: string;
  created_at: string;
}

const MyScripts = () => {
  const { user } = useAuth();
  const [scripts, setScripts] = useState<SavedScript[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchScripts();
    }
  }, [user, fetchScripts]);

  const fetchScripts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('scripts')
        .select('*')
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
  }, [user, toast]);

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
      const scriptText = `${parsedContent.title}\n\n${parsedContent.hook}\n\n${parsedContent.scenes.map((scene: ScriptScene, index: number) => 
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
              <Card key={script.id} className="p-6 bg-gradient-card backdrop-blur-sm border border-border/50">
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
                  
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(script)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleExport(script)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(script.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
                    {selectedScript.scenes.map((scene: ScriptScene) => (
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
    </div>
  );
};

export default MyScripts;