/**
 * Video Assembler Hook
 * Manages FFmpeg WASM video assembly process
 */

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  loadFFmpeg,
  generateVideoFromScenes,
  downloadVideo,
  cleanupFFmpeg,
} from '@/lib/videoAssembly';

interface VideoScene {
  id: string;
  image_url: string | null;
  audio_url: string | null;
  sequence_order: number;
}

interface AssemblyProgress {
  stage: string;
  progress: number;
}

export function useVideoAssembler() {
  const [isAssembling, setIsAssembling] = useState(false);
  const [assemblyProgress, setAssemblyProgress] = useState<AssemblyProgress>({
    stage: '',
    progress: 0,
  });
  const [assembledVideoUrl, setAssembledVideoUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const assembleVideo = useCallback(
    async (scenes: VideoScene[], projectTitle: string): Promise<boolean> => {
      setIsAssembling(true);
      setAssemblyProgress({ stage: 'Preparing', progress: 0 });

      try {
        // Validate scenes
        const validScenes = scenes
          .filter((scene) => scene.image_url && scene.audio_url)
          .sort((a, b) => a.sequence_order - b.sequence_order);

        if (validScenes.length === 0) {
          throw new Error('No valid scenes with both image and audio found');
        }

        toast({
          title: 'Starting video assembly',
          description: `Processing ${validScenes.length} scenes...`,
        });

        // Generate video
        const videoBlob = await generateVideoFromScenes(
          validScenes.map((scene) => ({
            imageUrl: scene.image_url!,
            audioUrl: scene.audio_url!,
          })),
          (stage, progress) => {
            setAssemblyProgress({ stage, progress });
          }
        );

        // Create object URL for preview
        const videoUrl = URL.createObjectURL(videoBlob);
        setAssembledVideoUrl(videoUrl);

        toast({
          title: 'Video assembly complete',
          description: 'Your video is ready to preview and download!',
        });

        return true;
      } catch (error: any) {
        console.error('Error assembling video:', error);
        toast({
          title: 'Video assembly failed',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      } finally {
        setIsAssembling(false);
        setAssemblyProgress({ stage: '', progress: 0 });
      }
    },
    [toast]
  );

  const downloadAssembledVideo = useCallback(
    (filename: string) => {
      if (!assembledVideoUrl) {
        toast({
          title: 'No video to download',
          description: 'Please assemble the video first',
          variant: 'destructive',
        });
        return;
      }

      fetch(assembledVideoUrl)
        .then((res) => res.blob())
        .then((blob) => {
          downloadVideo(blob, filename);
          toast({
            title: 'Download started',
            description: `Downloading ${filename}`,
          });
        })
        .catch((error) => {
          console.error('Download error:', error);
          toast({
            title: 'Download failed',
            description: error.message,
            variant: 'destructive',
          });
        });
    },
    [assembledVideoUrl, toast]
  );

  const resetAssembler = useCallback(() => {
    if (assembledVideoUrl) {
      URL.revokeObjectURL(assembledVideoUrl);
    }
    setAssembledVideoUrl(null);
    setAssemblyProgress({ stage: '', progress: 0 });
    cleanupFFmpeg();
  }, [assembledVideoUrl]);

  return {
    isAssembling,
    assemblyProgress,
    assembledVideoUrl,
    assembleVideo,
    downloadAssembledVideo,
    resetAssembler,
  };
}
