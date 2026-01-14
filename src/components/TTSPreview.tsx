import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, Volume2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const VOICES = [
  { id: '9BWtsMINqrJLrRacOk9x', name: 'Aria (Female, Warm)' },
  { id: 'CwhRBWXzGAHq8TQ4Fs17', name: 'Roger (Male, Confident)' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah (Female, Professional)' },
  { id: 'IKne3meq5aSn9XLyUdCD', name: 'Charlie (Male, Friendly)' },
];

export const TTSPreview = ({ text }: { text: string }) => {
  const [selectedVoice, setSelectedVoice] = useState(VOICES[0].id);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const handlePreview = async () => {
    if (audio && isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    setLoading(true);
    try {
      const previewText = text.slice(0, 500);

      const { data, error } = await supabase.functions.invoke('tts-preview', {
        body: { text: previewText, voice_id: selectedVoice },
      });

      if (error) throw error;

      const audioBlob = new Blob([data], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const newAudio = new Audio(audioUrl);

      newAudio.onended = () => setIsPlaying(false);
      newAudio.play();

      setAudio(newAudio);
      setIsPlaying(true);
    } catch (error) {
      console.error('TTS preview error:', error);
      toast.error('Failed to generate preview');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-4 shadow-elevated">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="w-5 h-5" />
          TTS Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Select value={selectedVoice} onValueChange={setSelectedVoice}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VOICES.map((voice) => (
                <SelectItem key={voice.id} value={voice.id}>
                  {voice.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handlePreview} disabled={loading || !text}>
            {loading ? (
              'Generating...'
            ) : isPlaying ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Preview (First 30s)
              </>
            )}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Previews first 500 characters (~30 seconds)
        </p>
      </CardContent>
    </Card>
  );
};
