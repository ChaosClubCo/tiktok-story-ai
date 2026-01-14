import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AuthRequired } from "@/components/shared/AuthRequired";
import { useAuth } from "@/hooks/useAuth";
import { useVideoGeneration } from "@/hooks/useVideoGeneration";
import { useVideoAssembler } from "@/hooks/useVideoAssembler";
import { VideoPreviewPlayer } from "@/components/VideoPreviewPlayer";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Play, Download, Sparkles, Loader2, Image, Music, Film } from "lucide-react";
import { MUSIC_LIBRARY } from "@/lib/musicLibrary";

export default function VideoEditor() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { fetchProject, generateAllScenes, progress, loading } = useVideoGeneration();
  const {
    isAssembling,
    assemblyProgress,
    assembledVideoUrl,
    assembleVideo,
    downloadAssembledVideo,
  } = useVideoAssembler();
  const [project, setProject] = useState<any>(null);
  const [scenes, setScenes] = useState<any[]>([]);

  useEffect(() => {
    if (projectId && user) {
      loadProject();
    }
  }, [projectId, user]);

  const loadProject = async () => {
    if (!projectId) return;
    
    const projectData = await fetchProject(projectId);
    if (projectData) {
      setProject(projectData);
      setScenes(projectData.scenes || []);
    }
  };

  const handleGenerate = async () => {
    if (!projectId) return;
    
    // Use parallel batch processing (3x concurrency by default)
    const success = await generateAllScenes(projectId, 3);
    if (success) {
      await loadProject();
    }
  };

  const handleRenderVideo = async () => {
    if (!scenes.length) return;
    
    // Get music settings from project
    const musicUrl = project?.settings?.musicId 
      ? MUSIC_LIBRARY.find(m => m.id === project.settings.musicId)?.url 
      : undefined;
    const musicVolume = project?.settings?.musicVolume ?? 0.3;
    
    const success = await assembleVideo(
      scenes, 
      project?.title || 'video', 
      musicUrl, 
      musicVolume
    );
    
    if (success) {
      toast({
        title: 'Video rendered successfully',
        description: 'Your video is ready to preview and download!',
      });
    }
  };

  const handleDownload = () => {
    downloadAssembledVideo(`${project?.title || 'video'}.mp4`);
  };

  const getSceneStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-muted text-muted-foreground",
      generating_image: "bg-primary/20 text-primary",
      generating_audio: "bg-secondary/20 text-secondary",
      completed: "bg-success/20 text-success",
      failed: "bg-destructive/20 text-destructive",
    };
    return colors[status] || "bg-muted";
  };

  const completedScenes = scenes.filter(s => s.status === 'completed').length;
  const totalScenes = scenes.length;
  const completionPercentage = totalScenes > 0 ? (completedScenes / totalScenes) * 100 : 0;

  return (
    <AuthRequired user={user} loading={authLoading}>
      <div className="min-h-screen bg-background-base">
        <Header />
        
        <main className="container mx-auto px-4 py-8 space-y-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/video-generator')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{project?.title}</h1>
              {project?.description && (
                <p className="text-muted-foreground mt-1">{project.description}</p>
              )}
            </div>
            <Badge className={getSceneStatusColor(project?.status)}>
              {project?.status}
            </Badge>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Video Generation Progress</CardTitle>
                  <CardDescription>
                    {completedScenes} of {totalScenes} scenes completed
                  </CardDescription>
                </div>
                <Button
                  onClick={handleGenerate}
                  disabled={loading || completionPercentage === 100}
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      {completionPercentage === 100 ? 'All Scenes Complete' : 'Generate All Scenes'}
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Overall Progress</span>
                  <span className="font-medium">{Math.round(completionPercentage)}%</span>
                </div>
                <Progress value={loading ? progress : completionPercentage} className="h-2" />
              </div>

              {loading && (
                <div className="text-sm text-muted-foreground text-center p-4 bg-muted/50 rounded-lg">
                  Generating scenes... This may take a few minutes.
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Video Scenes</h2>
            <div className="grid gap-4">
              {scenes.map((scene, index) => (
                <Card key={scene.id}>
                  <CardContent className="pt-6">
                    <div className="flex gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-48 h-32 bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                          {scene.image_url ? (
                            <img
                              src={scene.image_url}
                              alt={`Scene ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Image className="h-12 w-12 text-muted-foreground/50" />
                          )}
                        </div>
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">Scene {scene.sequence_order}</h3>
                            <p className="text-sm text-muted-foreground">
                              {scene.duration_seconds}s duration
                            </p>
                          </div>
                          <Badge className={getSceneStatusColor(scene.status)}>
                            {scene.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <p className="text-sm line-clamp-2">{scene.script_segment}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Image className="h-4 w-4" />
                            <span>{scene.image_url ? 'Generated' : 'Pending'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Music className="h-4 w-4" />
                            <span>{scene.audio_url ? 'Generated' : 'Pending'}</span>
                          </div>
                        </div>

                        {scene.audio_url && (
                          <audio
                            controls
                            className="w-full h-8"
                            src={scene.audio_url}
                          />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {completionPercentage === 100 && !assembledVideoUrl && (
            <Card className="border-primary">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/20">
                    <Film className="h-8 w-8 text-success" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">All Scenes Generated!</h3>
                    <p className="text-muted-foreground">
                      Ready to render your final video
                    </p>
                  </div>
                  {isAssembling ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span className="text-sm font-medium">{assemblyProgress.stage}</span>
                      </div>
                      <Progress value={assemblyProgress.progress} className="h-2" />
                    </div>
                  ) : (
                    <Button size="lg" onClick={handleRenderVideo}>
                      <Film className="h-5 w-5 mr-2" />
                      Render Video
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {assembledVideoUrl && (
            <VideoPreviewPlayer
              videoUrl={assembledVideoUrl}
              title={project?.title || 'Video'}
              onDownload={handleDownload}
            />
          )}
        </main>
      </div>
    </AuthRequired>
  );
}