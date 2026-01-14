import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { TTSPreview } from "./TTSPreview";

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
      <Card className="p-8 shadow-elevated">
        <div className="text-center text-muted-foreground">
          <div className="text-6xl mb-4">🎬</div>
          <h3 className="text-xl font-semibold mb-2">Your Script Will Appear Here</h3>
          <p>Generate your script to see it here</p>
        </div>
      </Card>
    );
  }

  const scriptText = script.hook + '\n\n' + script.scenes.map(s => s.dialogue).join('\n\n');

  return (
    <Card className="shadow-elevated">
      <CardHeader>
        <CardTitle>{script.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-primary/10 rounded-lg">
          <p className="text-lg font-semibold text-primary">VIRAL HOOK:</p>
          <p className="mt-2">{script.hook}</p>
        </div>

        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Scene Breakdown:</h3>
          {script.scenes.map((scene) => (
            <div key={scene.id} className="border rounded-lg p-4 bg-background-elevated">
              <p className="font-semibold mb-2">{scene.timeStamp}</p>
              <div className="space-y-2 text-sm">
                <p><strong>Dialogue:</strong> {scene.dialogue}</p>
                <p><strong>Action:</strong> {scene.action}</p>
                <p><strong>Visual:</strong> {scene.visual}</p>
                <p><strong>Sound:</strong> {scene.sound}</p>
              </div>
            </div>
          ))}
        </div>

        <div>
          <h4 className="font-semibold mb-2">Suggested Hashtags:</h4>
          <p className="text-sm">{script.hashtags.map(tag => `#${tag}`).join(' ')}</p>
        </div>

        <Button onClick={onExport} className="w-full">
          <Download className="w-4 h-4 mr-2" />
          Export Script
        </Button>
        
        <TTSPreview text={scriptText} />
      </CardContent>
    </Card>
  );
};