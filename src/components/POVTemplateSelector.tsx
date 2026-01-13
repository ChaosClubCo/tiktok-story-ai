import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { POV_TEMPLATES, POVTemplate } from "@/data/povTemplates";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles } from "lucide-react";

interface POVTemplateSelectorProps {
  onSelectTemplate: (template: POVTemplate) => void;
  selectedNiche?: string;
}

export const POVTemplateSelector = ({ onSelectTemplate, selectedNiche }: POVTemplateSelectorProps) => {
  const filteredTemplates = selectedNiche
    ? POV_TEMPLATES.filter(t => t.niches.includes(selectedNiche.toLowerCase()))
    : POV_TEMPLATES;

  return (
    <Card elevated className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Quick Start POV Templates
        </CardTitle>
        <CardDescription>
          Pre-structured scenarios for instant viral potential
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredTemplates.map((template) => (
              <Button
                key={template.id}
                variant="outline"
                className="h-auto py-4 px-4 flex flex-col items-start text-left hover:shadow-elevated hover:border-primary/50 transition-all"
                onClick={() => onSelectTemplate(template)}
              >
                <div className="flex items-center gap-2 mb-2 w-full">
                  <span className="text-2xl">{template.icon}</span>
                  <div className="flex-1">
                    <div className="font-bold text-sm">{template.title}</div>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {template.structure}
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    {template.hooks} hooks
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {template.sceneCount} scenes
                  </Badge>
                </div>
                
                <div className="text-xs text-muted-foreground/70 mt-2 italic line-clamp-1">
                  {template.examples[0]}
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
