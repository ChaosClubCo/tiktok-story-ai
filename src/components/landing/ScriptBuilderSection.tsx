import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useSpecialEffects } from '@/hooks/useSpecialEffects';
import { NicheSelector } from '@/components/NicheSelector';
import { ScriptControls } from '@/components/ScriptControls';
import { ScriptPreview } from '@/components/ScriptPreview';
import { SectionHeader } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { generateMockScript, type GeneratedScript } from '@/lib/scriptGeneration';

/**
 * ScriptBuilderSection - Interactive script generation section
 * Handles niche selection, generation, and export
 */
export function ScriptBuilderSection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { createConfetti } = useSpecialEffects();

  const [selectedNiche, setSelectedNiche] = useState<string | null>(null);
  const [length, setLength] = useState('60s');
  const [tone, setTone] = useState('funny');
  const [trendingTopic, setTrendingTopic] = useState('');
  const [script, setScript] = useState<GeneratedScript | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = useCallback(async () => {
    if (!selectedNiche || !user) {
      toast({
        title: 'Select a Niche',
        description: 'Please choose a drama niche first!',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      const generatedScript = generateMockScript(selectedNiche, length, tone, trendingTopic);

      const { error } = await supabase.from('scripts').insert([
        {
          user_id: user.id,
          title: generatedScript.title,
          content: JSON.stringify(generatedScript),
          niche: selectedNiche,
          length,
          tone,
          topic: trendingTopic,
        },
      ]);

      if (error) throw error;

      setScript(generatedScript);
      createConfetti();

      toast({
        title: '🎬 Script Generated!',
        description: 'Your viral TikTok script is ready and saved!',
      });
    } catch (error) {
      console.error('Error saving script:', error);
      toast({
        title: 'Error',
        description: 'Failed to save script. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  }, [selectedNiche, user, length, tone, trendingTopic, createConfetti]);

  const handleExport = useCallback(() => {
    if (!script) return;

    const scriptText = `${script.title}\n\n${script.hook}\n\n${script.scenes
      .map(
        (scene, index) =>
          `Scene ${index + 1} (${scene.timeStamp}):\n${scene.dialogue}\nAction: ${scene.action}\nVisual: ${scene.visual}\nSound: ${scene.sound}`
      )
      .join('\n\n')}\n\nHashtags: ${script.hashtags.map((tag) => `#${tag}`).join(' ')}`;

    const blob = new Blob([scriptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${script.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_script.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Script Exported!',
      description: 'Your script has been downloaded as a text file.',
    });
  }, [script]);

  return (
    <section id="niche-selector" className="container mx-auto px-4 py-16 space-y-16">
      <SectionHeader
        title="Build Your Drama Empire"
        description="Generate multi-episode series designed to keep audiences hooked and algorithms happy"
        gradient
        centered
      />

      <NicheSelector selectedNiche={selectedNiche} onNicheSelect={setSelectedNiche} />

      {selectedNiche && (
        <div className="grid lg:grid-cols-2 gap-8">
          <ScriptControls
            length={length}
            tone={tone}
            trendingTopic={trendingTopic}
            onLengthChange={setLength}
            onToneChange={setTone}
            onTrendingTopicChange={setTrendingTopic}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />

          <ScriptPreview script={script} onExport={handleExport} />
        </div>
      )}

      {/* Footer CTA */}
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">
          Your scripts are automatically saved and accessible in{' '}
          <Button
            variant="link"
            className="text-primary font-semibold p-0 h-auto"
            onClick={() => navigate('/my-scripts')}
          >
            My Scripts
          </Button>{' '}
          section! ✨
        </p>
      </div>
    </section>
  );
}
