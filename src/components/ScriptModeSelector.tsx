import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, Drama, Tv, Sparkles } from "lucide-react";

export type ScriptMode = 'standard' | 'ai_storytime' | 'pov_skit' | 'mini_drama_series';

interface ScriptModeOption {
  id: ScriptMode;
  title: string;
  icon: React.ReactNode;
  description: string;
  badge?: string;
  features: string[];
}

const SCRIPT_MODES: ScriptModeOption[] = [
  {
    id: 'standard',
    title: 'Standard Script',
    icon: <Sparkles className="w-6 h-6" />,
    description: 'Classic viral script format with hooks, scenes, and hashtags',
    features: ['Quick generation', 'Flexible format', 'All niches']
  },
  {
    id: 'ai_storytime',
    title: 'AI Voiceover Storytime',
    icon: <Mic className="w-6 h-6" />,
    description: 'TTS-optimized chaotic story scripts with beat markers',
    badge: 'Trending',
    features: ['TTS pacing', 'B-roll markers', 'Dramatic storytelling']
  },
  {
    id: 'pov_skit',
    title: 'POV Skit',
    icon: <Drama className="w-6 h-6" />,
    description: 'Point-of-view dramatic scenarios with template scaffolds',
    badge: '5 hook variations',
    features: ['Pre-built templates', 'Multiple hooks', 'A/B testing ready']
  },
  {
    id: 'mini_drama_series',
    title: 'Mini-Drama Series',
    icon: <Tv className="w-6 h-6" />,
    description: 'Multi-episode vertical drama with cliffhangers',
    badge: 'New',
    features: ['5-10 episodes', 'Continuous story', 'Binge-worthy']
  }
];

interface ScriptModeSelectorProps {
  selectedMode: ScriptMode;
  onModeChange: (mode: ScriptMode) => void;
}

export const ScriptModeSelector = ({ selectedMode, onModeChange }: ScriptModeSelectorProps) => {
  return (
    <Card elevated className="mb-6">
      <CardHeader>
        <CardTitle>Choose Your Style</CardTitle>
        <CardDescription>
          Select the format that best fits your content strategy
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {SCRIPT_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              className={`
                relative p-4 rounded-lg border-2 transition-all text-left
                hover:shadow-elevated
                ${selectedMode === mode.id 
                  ? 'border-primary bg-primary/5 shadow-glow' 
                  : 'border-border bg-background-elevated hover:border-primary/50'
                }
              `}
            >
              {mode.badge && (
                <Badge className="absolute top-2 right-2 text-xs">
                  {mode.badge}
                </Badge>
              )}
              
              <div className="flex items-center gap-3 mb-3">
                <div className={`${selectedMode === mode.id ? 'text-primary' : 'text-muted-foreground'}`}>
                  {mode.icon}
                </div>
                <h3 className="font-semibold text-sm">{mode.title}</h3>
              </div>
              
              <p className="text-xs text-muted-foreground mb-3">
                {mode.description}
              </p>
              
              <ul className="space-y-1">
                {mode.features.map((feature, idx) => (
                  <li key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                    <span className="text-primary">•</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
