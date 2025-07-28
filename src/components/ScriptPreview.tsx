import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Scene {
  id: number;
  timeStamp: string;
  action: string;
  dialogue: string;
  visual: string;
  sound: string;
}

interface ScriptPreviewProps {
  script: {
    title: string;
    hook: string;
    scenes: Scene[];
    hashtags: string[];
  } | null;
  onExport: () => void;
}

export const ScriptPreview = ({ script, onExport }: ScriptPreviewProps) => {
  if (!script) {
    return (
      <Card className="p-8 bg-gradient-card backdrop-blur-sm border border-border/50">
        <div className="text-center text-muted-foreground">
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="text-xl font-semibold mb-2">Your Script Will Appear Here</h3>
          <p>Select a niche and generate your viral TikTok script!</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-card backdrop-blur-sm border border-border/50">
      <div className="space-y-6">
        {/* Script Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold bg-gradient-drama bg-clip-text text-transparent">
            {script.title}
          </h2>
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
            <p className="text-lg font-semibold text-primary">🎯 VIRAL HOOK:</p>
            <p className="text-foreground mt-2">{script.hook}</p>
          </div>
        </div>

        {/* Scenes */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Scene Breakdown:</h3>
          {script.scenes.map((scene) => (
            <div key={scene.id} className="border border-border/50 rounded-lg p-4 bg-background/30">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline" className="bg-primary/20 text-primary border-primary/30">
                  {scene.timeStamp}
                </Badge>
                <Badge variant="secondary">Scene {scene.id}</Badge>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-accent mb-1">💬 Dialogue:</p>
                  <p className="text-foreground">{scene.dialogue}</p>
                </div>
                
                <div>
                  <p className="font-semibold text-accent mb-1">🎭 Action:</p>
                  <p className="text-foreground">{scene.action}</p>
                </div>
                
                <div>
                  <p className="font-semibold text-accent mb-1">👁️ Visual:</p>
                  <p className="text-muted-foreground">{scene.visual}</p>
                </div>
                
                <div>
                  <p className="font-semibold text-accent mb-1">🔊 Sound:</p>
                  <p className="text-muted-foreground">{scene.sound}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Hashtags */}
        <div className="space-y-2">
          <h4 className="font-semibold">📱 Suggested Hashtags:</h4>
          <div className="flex flex-wrap gap-2">
            {script.hashtags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="bg-accent/20 text-accent">
                #{tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Export Button */}
        <Button
          onClick={onExport}
          variant="drama"
          size="lg"
          className="w-full"
        >
          📤 Export & Share Script
        </Button>
      </div>
    </Card>
  );
};