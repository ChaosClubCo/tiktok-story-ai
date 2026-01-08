import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { User, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const NICHES = [
  { id: 'drama', label: 'Drama & Storytelling', emoji: '🎭' },
  { id: 'comedy', label: 'Comedy & Entertainment', emoji: '😂' },
  { id: 'educational', label: 'Educational Content', emoji: '📚' },
  { id: 'lifestyle', label: 'Lifestyle & Vlog', emoji: '✨' },
  { id: 'motivation', label: 'Motivational', emoji: '💪' },
  { id: 'horror', label: 'Horror & Thriller', emoji: '👻' },
  { id: 'romance', label: 'Romance', emoji: '💕' },
  { id: 'business', label: 'Business & Finance', emoji: '💼' },
];

const GOALS = [
  { id: 'grow_audience', label: 'Grow my audience' },
  { id: 'monetize', label: 'Monetize my content' },
  { id: 'improve_quality', label: 'Improve content quality' },
  { id: 'save_time', label: 'Save time on content creation' },
  { id: 'go_viral', label: 'Create viral content' },
  { id: 'build_brand', label: 'Build my personal brand' },
];

export const ProfileSettings = () => {
  const { user, checkProfile } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [selectedNiche, setSelectedNiche] = useState<string | null>(null);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('display_name, preferred_niche, goals')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') throw error;

        if (data) {
          setDisplayName(data.display_name || '');
          setSelectedNiche(data.preferred_niche || null);
          setSelectedGoals(data.goals || []);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadProfile();
  }, [user?.id]);

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId) ? prev.filter((g) => g !== goalId) : [...prev, goalId]
    );
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim() || null,
          preferred_niche: selectedNiche,
          goals: selectedGoals,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Also update the display name in auth metadata
      if (displayName.trim()) {
        await supabase.auth.updateUser({
          data: { display_name: displayName.trim() },
        });
      }

      // Refresh profile data in auth context
      await checkProfile();

      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Settings
          </CardTitle>
          <CardDescription>Loading profile...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Profile Settings
        </CardTitle>
        <CardDescription>
          Manage your profile information and content preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email (Read-only) */}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={user?.email || ''}
            disabled
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">
            Email cannot be changed. Contact support if you need to update it.
          </p>
        </div>

        {/* Display Name */}
        <div className="space-y-2">
          <Label htmlFor="display-name">Display Name</Label>
          <Input
            id="display-name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter your display name"
            maxLength={50}
          />
        </div>

        {/* Content Niche */}
        <div className="space-y-3">
          <Label>Content Niche</Label>
          <div className="grid grid-cols-2 gap-2">
            {NICHES.map((niche) => (
              <motion.button
                key={niche.id}
                type="button"
                onClick={() => setSelectedNiche(niche.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  selectedNiche === niche.id
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <span className="mr-2">{niche.emoji}</span>
                <span className="text-sm">{niche.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Goals */}
        <div className="space-y-3">
          <Label>Content Goals (Select all that apply)</Label>
          <div className="grid grid-cols-2 gap-2">
            {GOALS.map((goal) => (
              <motion.button
                key={goal.id}
                type="button"
                onClick={() => toggleGoal(goal.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  selectedGoals.includes(goal.id)
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <span className="text-sm">{goal.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
