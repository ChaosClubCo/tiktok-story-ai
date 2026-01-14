import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Play, Pause, Music, Volume2 } from "lucide-react";
import { MUSIC_LIBRARY, MusicTrack } from "@/lib/musicLibrary";
import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

interface MusicSelectorProps {
  selectedMusic?: string;
  musicVolume?: number;
  onSelectMusic: (musicId: string) => void;
  onVolumeChange: (volume: number) => void;
}

export function MusicSelector({ 
  selectedMusic, 
  musicVolume = 0.3, 
  onSelectMusic, 
  onVolumeChange 
}: MusicSelectorProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handlePlayPreview = (track: MusicTrack) => {
    if (playingId === track.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(track.url);
      audioRef.current.volume = 0.3;
      audioRef.current.play();
      audioRef.current.onended = () => setPlayingId(null);
      setPlayingId(track.id);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Background Music</h3>
        <p className="text-sm text-muted-foreground">
          Select music to enhance your video (optional)
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="music-volume" className="flex items-center gap-2">
            <Volume2 className="h-4 w-4" />
            Music Volume: {Math.round(musicVolume * 100)}%
          </Label>
          <Slider
            id="music-volume"
            min={0}
            max={100}
            step={5}
            value={[musicVolume * 100]}
            onValueChange={([value]) => onVolumeChange(value / 100)}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card
            className={cn(
              "cursor-pointer transition-all hover:shadow-md",
              !selectedMusic && "ring-2 ring-primary"
            )}
            onClick={() => onSelectMusic('')}
          >
            <CardContent className="flex items-center gap-4 py-6">
              <div className="bg-muted rounded-full p-3">
                <Music className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">No Music</p>
                <p className="text-sm text-muted-foreground">Silent background</p>
              </div>
            </CardContent>
          </Card>

          {MUSIC_LIBRARY.map((track) => (
            <Card
              key={track.id}
              className={cn(
                "cursor-pointer transition-all hover:shadow-md",
                selectedMusic === track.id && "ring-2 ring-primary"
              )}
            >
              <CardContent className="py-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1" onClick={() => onSelectMusic(track.id)}>
                    <p className="font-medium">{track.name}</p>
                    <p className="text-sm text-muted-foreground">{track.mood}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayPreview(track);
                    }}
                  >
                    {playingId === track.id ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">
                    {track.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {track.tempo}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
