import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Play, Pause, Maximize2 } from 'lucide-react';

interface VideoPreviewPlayerProps {
  videoUrl: string;
  title: string;
  onDownload: () => void;
}

export function VideoPreviewPlayer({
  videoUrl,
  title,
  onDownload,
}: VideoPreviewPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handlePlayPause = () => {
    const video = document.getElementById('preview-video') as HTMLVideoElement;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleFullscreen = () => {
    const video = document.getElementById('preview-video') as HTMLVideoElement;
    if (video) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
        setIsFullscreen(false);
      } else {
        video.requestFullscreen();
        setIsFullscreen(true);
      }
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="relative bg-black aspect-video">
        <video
          id="preview-video"
          src={videoUrl}
          controls
          className="w-full h-full"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      </div>
      
      <div className="p-4 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">Video preview ready</p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handlePlayPause}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Play
              </>
            )}
          </Button>

          <Button
            onClick={handleFullscreen}
            variant="outline"
            size="sm"
          >
            <Maximize2 className="w-4 h-4" />
          </Button>

          <Button
            onClick={onDownload}
            size="sm"
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Download MP4
          </Button>
        </div>
      </div>
    </Card>
  );
}
