import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VideoProject {
  id: string;
  title: string;
  description?: string;
  status: string;
  settings: any;
  video_url?: string;
  thumbnail_url?: string;
  created_at: string;
  scenes?: VideoScene[];
}

interface VideoScene {
  id: string;
  sequence_order: number;
  script_segment: string;
  visual_prompt: string;
  image_url?: string;
  audio_url?: string;
  status: string;
  duration_seconds: number;
}

export function useVideoGeneration() {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();

  const createVideoProject = async (
    scriptId: string,
    title: string,
    description?: string,
    settings?: any
  ): Promise<VideoProject | null> => {
    setLoading(true);
    setProgress(10);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('generate-video-project', {
        body: { scriptId, title, description, settings }
      });

      if (error) throw error;

      setProgress(30);
      
      toast({
        title: "Video project created",
        description: `Created project with ${data.sceneCount} scenes`,
      });

      return data.project;
    } catch (error: any) {
      console.error('Error creating video project:', error);
      toast({
        title: "Failed to create video project",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateSceneVisuals = async (sceneId: string): Promise<boolean> => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('generate-scene-visuals', {
        body: { sceneId }
      });

      if (error) throw error;

      return true;
    } catch (error: any) {
      console.error('Error generating scene visuals:', error);
      toast({
        title: "Failed to generate visuals",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const generateSceneAudio = async (sceneId: string): Promise<boolean> => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('generate-scene-audio', {
        body: { sceneId }
      });

      if (error) throw error;

      return true;
    } catch (error: any) {
      console.error('Error generating scene audio:', error);
      toast({
        title: "Failed to generate audio",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };

  const generateAllScenes = async (projectId: string) => {
    setLoading(true);
    setProgress(30);

    try {
      // Fetch project and scenes
      const { data: projectData } = await supabase.functions.invoke('get-video-projects', {
        body: {},
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!projectData?.project) {
        throw new Error('Project not found');
      }

      const scenes = projectData.project.scenes || [];
      const totalScenes = scenes.length;

      toast({
        title: "Starting generation",
        description: `Generating ${totalScenes} scenes...`,
      });

      let completed = 0;

      // Generate visuals and audio for each scene sequentially
      for (const scene of scenes) {
        if (scene.status === 'completed') {
          completed++;
          continue;
        }

        // Generate visual
        const visualSuccess = await generateSceneVisuals(scene.id);
        if (visualSuccess) {
          completed++;
          setProgress(30 + (completed / totalScenes) * 35);
          
          // Generate audio
          const audioSuccess = await generateSceneAudio(scene.id);
          if (audioSuccess) {
            setProgress(30 + (completed / totalScenes) * 70);
          }
        }

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      setProgress(100);

      toast({
        title: "Generation complete",
        description: `Successfully generated ${completed} scenes`,
      });

      return true;
    } catch (error: any) {
      console.error('Error generating scenes:', error);
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const fetchProjects = async (): Promise<VideoProject[]> => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase.functions.invoke('get-video-projects', {
        body: {}
      });

      if (error) throw error;

      return data.projects || [];
    } catch (error: any) {
      console.error('Error fetching projects:', error);
      toast({
        title: "Failed to fetch projects",
        description: error.message,
        variant: "destructive",
      });
      return [];
    }
  };

  const fetchProject = async (projectId: string): Promise<VideoProject | null> => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-video-projects?projectId=${projectId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.session.access_token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch project');
      }

      const data = await response.json();
      return data.project;
    } catch (error: any) {
      console.error('Error fetching project:', error);
      toast({
        title: "Failed to fetch project",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    loading,
    progress,
    createVideoProject,
    generateSceneVisuals,
    generateSceneAudio,
    generateAllScenes,
    fetchProjects,
    fetchProject,
  };
}