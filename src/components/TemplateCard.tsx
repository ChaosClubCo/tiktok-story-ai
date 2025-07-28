import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Download, Star, Clock, User, Crown, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Template {
  id: string;
  title: string;
  description: string;
  niche: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  rating: number;
  downloads: number;
  tags: string[];
  author: string;
  isPremium: boolean;
  structure: {
    hook: string;
    scenes: Array<{
      timeStamp: string;
      content: string;
      action: string;
    }>;
    hashtags: string[];
  };
  createdAt: string;
}

interface TemplateCardProps {
  template: Template;
  isSaved: boolean;
  onSave: () => void;
}

const TemplateCard = ({ template, isSaved, onSave }: TemplateCardProps) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const handleUseTemplate = () => {
    // In a real app, this would navigate to the script generator with pre-filled data
    toast({
      title: "Template Applied!",
      description: "Template structure has been applied to the script generator.",
    });
    setIsPreviewOpen(false);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <>
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start mb-2">
            <Badge variant="outline" className="capitalize">
              {template.niche}
            </Badge>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onSave}
                className={`h-8 w-8 p-0 ${isSaved ? 'text-red-500' : 'text-muted-foreground'}`}
              >
                <Heart className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} />
              </Button>
              {template.isPremium && (
                <Crown className="h-4 w-4 text-yellow-500" />
              )}
            </div>
          </div>
          
          <CardTitle className="text-lg leading-tight">{template.title}</CardTitle>
          <CardDescription className="text-sm line-clamp-2">
            {template.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          {/* Template Stats */}
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-current text-yellow-500" />
                <span>{template.rating}</span>
              </div>
              <div className="flex items-center gap-1">
                <Download className="h-3 w-3" />
                <span>{template.downloads.toLocaleString()}</span>
              </div>
            </div>
            <Badge className={getDifficultyColor(template.difficulty)}>
              {template.difficulty}
            </Badge>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-4">
            {template.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {template.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{template.tags.length - 3}
              </Badge>
            )}
          </div>

          {/* Author and Date */}
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span>{template.author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{new Date(template.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 mt-auto">
            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    {template.title}
                    {template.isPremium && <Crown className="h-5 w-5 text-yellow-500" />}
                  </DialogTitle>
                  <DialogDescription>
                    {template.description}
                  </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="structure" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="structure">Script Structure</TabsTrigger>
                    <TabsTrigger value="details">Template Details</TabsTrigger>
                    <TabsTrigger value="usage">Usage Guide</TabsTrigger>
                  </TabsList>

                  <TabsContent value="structure" className="space-y-4">
                    {/* Hook */}
                    <div className="bg-primary/5 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">🎣 Viral Hook:</h4>
                      <p className="text-sm">{template.structure.hook}</p>
                    </div>

                    {/* Scenes */}
                    <div className="space-y-3">
                      <h4 className="font-medium">🎬 Scene Breakdown:</h4>
                      {template.structure.scenes.map((scene, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-medium">Scene {index + 1}</h5>
                            <Badge variant="outline">{scene.timeStamp}</Badge>
                          </div>
                          <div className="space-y-2 text-sm">
                            <div>
                              <p className="font-medium text-muted-foreground">Content:</p>
                              <p>"{scene.content}"</p>
                            </div>
                            <div>
                              <p className="font-medium text-muted-foreground">Action:</p>
                              <p>{scene.action}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Hashtags */}
                    <div>
                      <h4 className="font-medium mb-2">🏷️ Hashtags:</h4>
                      <div className="flex flex-wrap gap-2">
                        {template.structure.hashtags.map((hashtag, index) => (
                          <Badge key={index} variant="secondary">
                            #{hashtag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Template Info</h4>
                        <div className="space-y-2 text-sm">
                          <p><strong>Niche:</strong> {template.niche}</p>
                          <p><strong>Difficulty:</strong> {template.difficulty}</p>
                          <p><strong>Author:</strong> {template.author}</p>
                          <p><strong>Created:</strong> {new Date(template.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Performance</h4>
                        <div className="space-y-2 text-sm">
                          <p><strong>Rating:</strong> {template.rating}/5 stars</p>
                          <p><strong>Downloads:</strong> {template.downloads.toLocaleString()}</p>
                          <p><strong>Type:</strong> {template.isPremium ? 'Premium' : 'Free'}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {template.tags.map((tag, index) => (
                          <Badge key={index} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="usage" className="space-y-4">
                    <div className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">🎯 How to Use This Template:</h4>
                        <ol className="text-sm space-y-1 list-decimal list-inside">
                          <li>Adapt the hook to your specific situation or topic</li>
                          <li>Customize the dialogue to match your voice and style</li>
                          <li>Adjust timing based on your preferred video length</li>
                          <li>Modify hashtags to include current trending tags</li>
                          <li>Add your personal touch to make it unique</li>
                        </ol>
                      </div>

                      <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">💡 Success Tips:</h4>
                        <ul className="text-sm space-y-1 list-disc list-inside">
                          <li>Study what made this template successful</li>
                          <li>Test different variations to find what works for your audience</li>
                          <li>Pay attention to timing and pacing</li>
                          <li>Use trending audio that matches the energy</li>
                          <li>Engage with comments to boost algorithm performance</li>
                        </ul>
                      </div>

                      <div className="bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">⚠️ Important Notes:</h4>
                        <ul className="text-sm space-y-1 list-disc list-inside">
                          <li>Always adapt content to avoid copyright issues</li>
                          <li>Make sure the content aligns with platform guidelines</li>
                          <li>Consider your audience's preferences and sensitivities</li>
                          <li>Track performance to understand what resonates</li>
                        </ul>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleUseTemplate} className="flex-1">
                    Use This Template
                  </Button>
                  <Button variant="outline" onClick={onSave}>
                    <Heart className={`h-4 w-4 mr-2 ${isSaved ? 'fill-current text-red-500' : ''}`} />
                    {isSaved ? 'Saved' : 'Save'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Button 
              className="w-full" 
              onClick={handleUseTemplate}
              disabled={template.isPremium}
            >
              {template.isPremium ? 'Premium Required' : 'Use Template'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default TemplateCard;