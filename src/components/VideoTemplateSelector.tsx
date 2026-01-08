import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { VIDEO_TEMPLATES, VideoTemplate } from "@/lib/videoTemplates";
import { cn } from "@/lib/utils";

interface VideoTemplateSelectorProps {
  selectedTemplate?: string;
  onSelectTemplate: (template: VideoTemplate) => void;
}

export function VideoTemplateSelector({ selectedTemplate, onSelectTemplate }: VideoTemplateSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Choose a Template</h3>
        <p className="text-sm text-muted-foreground">
          Select a pre-configured style that matches your content type
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {VIDEO_TEMPLATES.map((template) => (
          <Card
            key={template.id}
            className={cn(
              "cursor-pointer transition-all duration-300 hover:shadow-elegant hover:-translate-y-1",
              selectedTemplate === template.id && "ring-2 ring-primary"
            )}
            onClick={() => onSelectTemplate(template)}
          >
            <CardHeader className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="text-4xl">{template.thumbnail}</div>
                {selectedTemplate === template.id && (
                  <div className="bg-primary text-primary-foreground rounded-full p-1">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
              <CardTitle className="text-base">{template.name}</CardTitle>
              <CardDescription className="text-sm">
                {template.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="outline" className="text-xs">
                  {template.category}
                </Badge>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>• {template.settings.transitionType} transitions</div>
                  <div>• {template.settings.aspectRatioRecommended} format</div>
                  {template.musicSuggestion && (
                    <div>• {template.musicSuggestion} music</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
