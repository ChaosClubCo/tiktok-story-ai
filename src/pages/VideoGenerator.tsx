import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoProjectCard } from "@/components/VideoProjectCard";
import { useVideoGeneration } from "@/hooks/useVideoGeneration";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Film, Plus, Sparkles } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { AuthRequired } from "@/components/shared/AuthRequired";
import { useAuth } from "@/hooks/useAuth";

interface Script {
  id: string;
  title: string;
  content: string;
}

export default function VideoGenerator() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { loading, progress, createVideoProject, fetchProjects } = useVideoGeneration();
  const [projects, setProjects] = useState<any[]>([]);
  const [scripts, setScripts] = useState<Script[]>([]);
  const [selectedScriptId, setSelectedScriptId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [voiceId, setVoiceId] = useState("alloy");
  const [aspectRatio, setAspectRatio] = useState("9:16");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // Fetch user's scripts
    const { data: scriptsData } = await supabase
      .from('scripts')
      .select('id, title, content')
      .order('created_at', { ascending: false })
      .limit(20);

    if (scriptsData) {
      setScripts(scriptsData);
    }

    // Fetch video projects
    const projectsData = await fetchProjects();
    setProjects(projectsData);
  };

  const handleCreateProject = async () => {
    if (!selectedScriptId || !title) {
      return;
    }

    const project = await createVideoProject(
      selectedScriptId,
      title,
      description,
      {
        voiceId,
        aspectRatio,
        transitionStyle: 'fade',
        musicVolume: 0.3
      }
    );

    if (project) {
      navigate(`/video-editor/${project.id}`);
    }
  };

  return (
    <AuthRequired user={user} loading={authLoading}>
      <div className="min-h-screen bg-background-base">
        <Header />
        
        <main className="container mx-auto px-4 py-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                AI Video Generator
              </h1>
              <p className="text-muted-foreground">
                Transform your scripts into stunning videos with AI
              </p>
            </div>
            <Button
              size="lg"
              className="group"
              onClick={() => document.getElementById('create-tab')?.click()}
            >
              <Plus className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform" />
              Create Video
            </Button>
          </div>

          <Tabs defaultValue="projects" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="projects">
                <Film className="h-4 w-4 mr-2" />
                My Videos
              </TabsTrigger>
              <TabsTrigger value="create" id="create-tab">
                <Sparkles className="h-4 w-4 mr-2" />
                Create New
              </TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="space-y-6">
              {projects.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
                    <Film className="h-16 w-16 text-muted-foreground/50" />
                    <div className="text-center space-y-2">
                      <h3 className="text-xl font-semibold">No videos yet</h3>
                      <p className="text-muted-foreground max-w-md">
                        Create your first AI-generated video from any of your scripts
                      </p>
                    </div>
                    <Button onClick={() => document.getElementById('create-tab')?.click()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Video
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map((project) => (
                    <VideoProjectCard key={project.id} project={project} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="create" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Create Video Project</CardTitle>
                  <CardDescription>
                    Select a script and configure your video settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="script">Select Script</Label>
                    <Select value={selectedScriptId} onValueChange={setSelectedScriptId}>
                      <SelectTrigger id="script">
                        <SelectValue placeholder="Choose a script to convert" />
                      </SelectTrigger>
                      <SelectContent>
                        {scripts.map((script) => (
                          <SelectItem key={script.id} value={script.id}>
                            {script.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Video Title</Label>
                    <Input
                      id="title"
                      placeholder="Enter video title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your video"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="voice">Voice</Label>
                      <Select value={voiceId} onValueChange={setVoiceId}>
                        <SelectTrigger id="voice">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="alloy">Alloy (Neutral)</SelectItem>
                          <SelectItem value="echo">Echo (Male)</SelectItem>
                          <SelectItem value="fable">Fable (British)</SelectItem>
                          <SelectItem value="onyx">Onyx (Deep)</SelectItem>
                          <SelectItem value="nova">Nova (Female)</SelectItem>
                          <SelectItem value="shimmer">Shimmer (Warm)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="aspect">Aspect Ratio</Label>
                      <Select value={aspectRatio} onValueChange={setAspectRatio}>
                        <SelectTrigger id="aspect">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="9:16">9:16 (Vertical)</SelectItem>
                          <SelectItem value="16:9">16:9 (Horizontal)</SelectItem>
                          <SelectItem value="1:1">1:1 (Square)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {loading && progress > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Creating project...</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}

                  <Button
                    onClick={handleCreateProject}
                    disabled={!selectedScriptId || !title || loading}
                    className="w-full"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Creating Project...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-5 w-5 mr-2" />
                        Create Video Project
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </AuthRequired>
  );
}