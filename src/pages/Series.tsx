import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Tv, Plus, Play, Trash2, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Series {
  id: string;
  title: string;
  description: string;
  premise: string;
  total_episodes: number;
  niche: string;
  tone: string;
  created_at: string;
}

interface Script {
  id: string;
  title: string;
  episode_number: number;
  content: string;
}

export default function Series() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const [formData, setFormData] = useState({
    premise: "",
    niche: "drama",
    tone: "dramatic",
    episodeCount: 5
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchSeries();
  }, [user, navigate]);

  const fetchSeries = async () => {
    try {
      const { data, error } = await supabase
        .from('series')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSeries(data || []);
    } catch (error) {
      console.error('Error fetching series:', error);
      toast.error('Failed to load series');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSeries = async () => {
    if (!formData.premise) {
      toast.error('Please enter a series premise');
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-series', {
        body: {
          premise: formData.premise,
          niche: formData.niche,
          tone: formData.tone,
          episodeCount: formData.episodeCount
        }
      });

      if (error) throw error;

      toast.success(`Series created with ${data.episodes.length} episodes!`);
      setShowCreateForm(false);
      setFormData({ premise: "", niche: "drama", tone: "dramatic", episodeCount: 5 });
      fetchSeries();
    } catch (error: any) {
      console.error('Error creating series:', error);
      toast.error(error.message || 'Failed to create series');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteSeries = async (seriesId: string) => {
    if (!confirm('Are you sure you want to delete this series? All episodes will be deleted.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('series')
        .delete()
        .eq('id', seriesId);

      if (error) throw error;

      toast.success('Series deleted');
      fetchSeries();
    } catch (error) {
      console.error('Error deleting series:', error);
      toast.error('Failed to delete series');
    }
  };

  const viewSeries = (seriesId: string) => {
    navigate(`/my-scripts?series=${seriesId}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Tv className="w-10 h-10 text-primary" />
            Mini-Drama Series
          </h1>
          <p className="text-muted-foreground">
            Create binge-worthy multi-episode vertical drama series
          </p>
        </div>

        {showCreateForm ? (
          <Card elevated className="mb-8">
            <CardHeader>
              <CardTitle>Create New Series</CardTitle>
              <CardDescription>
                Generate a complete mini-drama series with multiple episodes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="premise">Series Premise</Label>
                <Textarea
                  id="premise"
                  placeholder="E.g., A small-town barista discovers she has superpowers after a mysterious coffee bean delivery..."
                  value={formData.premise}
                  onChange={(e) => setFormData({ ...formData, premise: e.target.value })}
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="niche">Niche</Label>
                  <Select value={formData.niche} onValueChange={(value) => setFormData({ ...formData, niche: value })}>
                    <SelectTrigger id="niche" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="drama">Drama</SelectItem>
                      <SelectItem value="romance">Romance</SelectItem>
                      <SelectItem value="comedy">Comedy</SelectItem>
                      <SelectItem value="mystery">Mystery</SelectItem>
                      <SelectItem value="thriller">Thriller</SelectItem>
                      <SelectItem value="fantasy">Fantasy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tone">Tone</Label>
                  <Select value={formData.tone} onValueChange={(value) => setFormData({ ...formData, tone: value })}>
                    <SelectTrigger id="tone" className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dramatic">Dramatic</SelectItem>
                      <SelectItem value="humorous">Humorous</SelectItem>
                      <SelectItem value="suspenseful">Suspenseful</SelectItem>
                      <SelectItem value="romantic">Romantic</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="episodes">Episodes</Label>
                  <Input
                    id="episodes"
                    type="number"
                    min={3}
                    max={10}
                    value={formData.episodeCount}
                    onChange={(e) => setFormData({ ...formData, episodeCount: parseInt(e.target.value) })}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreateSeries} disabled={creating} className="flex-1">
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Series...
                    </>
                  ) : (
                    <>
                      <Tv className="w-4 h-4 mr-2" />
                      Generate Series
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)} disabled={creating}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button onClick={() => setShowCreateForm(true)} className="mb-8" size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Create New Series
          </Button>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : series.length === 0 ? (
          <Card elevated>
            <CardContent className="py-12 text-center">
              <Tv className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No Series Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first mini-drama series to get started
              </p>
              <Button onClick={() => setShowCreateForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Series
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {series.map((s) => (
              <Card key={s.id} elevated className="hover:shadow-floating transition-all">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-2">{s.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {s.premise}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 flex-wrap mb-4">
                    <Badge variant="secondary">{s.niche}</Badge>
                    <Badge variant="outline">{s.tone}</Badge>
                    <Badge variant="default">{s.total_episodes} episodes</Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => viewSeries(s.id)} className="flex-1">
                      <Play className="w-3 h-3 mr-1" />
                      View Episodes
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteSeries(s.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
