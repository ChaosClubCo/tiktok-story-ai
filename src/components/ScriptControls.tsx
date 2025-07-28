import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ScriptControlsProps {
  length: string;
  tone: string;
  trendingTopic: string;
  onLengthChange: (length: string) => void;
  onToneChange: (tone: string) => void;
  onTrendingTopicChange: (topic: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

const lengths = ["30s", "60s", "90s"];
const tones = [
  { id: "funny", name: "😂 Funny", color: "from-yellow-400 to-orange-500" },
  { id: "dark", name: "🖤 Dark", color: "from-gray-700 to-black" },
  { id: "cringe", name: "😬 Cringe", color: "from-green-400 to-yellow-500" },
  { id: "wholesome", name: "🥰 Wholesome", color: "from-pink-400 to-purple-500" },
  { id: "plottwist", name: "🌀 Plot Twist", color: "from-blue-500 to-purple-600" }
];

export const ScriptControls = ({
  length,
  tone,
  trendingTopic,
  onLengthChange,
  onToneChange,
  onTrendingTopicChange,
  onGenerate,
  isGenerating
}: ScriptControlsProps) => {
  return (
    <Card className="p-6 bg-gradient-card backdrop-blur-sm border border-border/50">
      <div className="space-y-6">
        {/* Length Selector */}
        <div className="space-y-3">
          <Label className="text-lg font-semibold">Script Length</Label>
          <div className="flex gap-2">
            {lengths.map((len) => (
              <Button
                key={len}
                variant={length === len ? "drama" : "niche"}
                size="sm"
                onClick={() => onLengthChange(len)}
                className="flex-1"
              >
                {len}
              </Button>
            ))}
          </div>
        </div>

        {/* Tone Selector */}
        <div className="space-y-3">
          <Label className="text-lg font-semibold">Tone & Vibe</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {tones.map((t) => (
              <Button
                key={t.id}
                variant={tone === t.id ? "drama" : "niche"}
                size="sm"
                onClick={() => onToneChange(t.id)}
                className="text-xs"
              >
                {t.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Trending Topic */}
        <div className="space-y-3">
          <Label htmlFor="trending" className="text-lg font-semibold">
            Trending Topic (Optional)
          </Label>
          <Input
            id="trending"
            placeholder="e.g., red flags, toxic traits, sigma male..."
            value={trendingTopic}
            onChange={(e) => onTrendingTopicChange(e.target.value)}
            className="bg-background/50 border-border/50 focus:border-primary"
          />
        </div>

        {/* Generate Button */}
        <Button
          onClick={onGenerate}
          disabled={isGenerating}
          variant="drama"
          size="lg"
          className="w-full text-lg font-bold"
        >
          {isGenerating ? "🎬 Generating Drama..." : "✨ Generate Viral Script"}
        </Button>
      </div>
    </Card>
  );
};