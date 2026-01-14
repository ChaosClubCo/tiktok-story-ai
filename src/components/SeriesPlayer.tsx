import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SkipForward, SkipBack } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Episode {
  id: string;
  title: string;
  episode_number: number;
  content: string;
}

export const SeriesPlayer = ({ seriesId }: { seriesId: string }) => {
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEpisodes();
  }, [seriesId]);

  const fetchEpisodes = async () => {
    try {
      const { data, error } = await supabase
        .from('scripts' as any)
        .select('id, title, episode_number, content')
        .eq('series_id', seriesId)
        .order('episode_number', { ascending: true });

      if (error) throw error;
      setEpisodes((data || []) as unknown as Episode[]);
    } catch (error) {
      console.error('Failed to fetch episodes:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentEpisode = episodes[currentEpisodeIndex];

  const nextEpisode = () => {
    if (currentEpisodeIndex < episodes.length - 1) {
      setCurrentEpisodeIndex(currentEpisodeIndex + 1);
    }
  };

  const previousEpisode = () => {
    if (currentEpisodeIndex > 0) {
      setCurrentEpisodeIndex(currentEpisodeIndex - 1);
    }
  };

  if (loading) return <div className="text-center py-8">Loading episodes...</div>;
  if (!currentEpisode) return <div className="text-center py-8">No episodes found</div>;

  return (
    <div className="space-y-4">
      <Card className="shadow-elevated">
        <CardContent className="p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold mb-2">
              Episode {currentEpisode.episode_number}: {currentEpisode.title}
            </h3>
            <Progress value={(currentEpisodeIndex / episodes.length) * 100} className="mb-4" />
          </div>

          <div className="bg-background-elevated rounded-lg p-6 mb-4 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap font-sans text-sm">
              {currentEpisode.content}
            </pre>
          </div>

          <div className="flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={previousEpisode}
              disabled={currentEpisodeIndex === 0}
            >
              <SkipBack className="w-4 h-4" />
            </Button>

            <Button
              size="lg"
              onClick={nextEpisode}
              disabled={currentEpisodeIndex === episodes.length - 1}
            >
              {currentEpisodeIndex === episodes.length - 1 ? (
                'Series Complete!'
              ) : (
                <>
                  Next Episode
                  <SkipForward className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h4 className="font-semibold mb-3">All Episodes</h4>
          <div className="space-y-2">
            {episodes.map((episode, index) => (
              <button
                key={episode.id}
                onClick={() => setCurrentEpisodeIndex(index)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  index === currentEpisodeIndex
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background-elevated hover:bg-background-elevated/80'
                }`}
              >
                <div className="font-medium">
                  Episode {episode.episode_number}: {episode.title}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
