import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Film, Clock, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface VideoProjectCardProps {
  project: {
    id: string;
    title: string;
    description?: string;
    status: string;
    created_at: string;
    thumbnail_url?: string;
    duration_seconds?: number;
    scenes?: any[];
  };
}

export function VideoProjectCard({ project }: VideoProjectCardProps) {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-muted text-muted-foreground",
      generating: "bg-primary/20 text-primary",
      processing: "bg-secondary/20 text-secondary",
      completed: "bg-success/20 text-success",
      failed: "bg-destructive/20 text-destructive",
    };
    return colors[status] || "bg-muted";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="group cursor-pointer transition-all duration-300 hover:shadow-elegant hover:-translate-y-1">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Film className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg group-hover:text-primary transition-colors">
              {project.title}
            </CardTitle>
          </div>
          <Badge className={getStatusColor(project.status)}>
            {project.status}
          </Badge>
        </div>
        {project.description && (
          <CardDescription className="line-clamp-2">
            {project.description}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {project.thumbnail_url && (
          <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
            <img
              src={project.thumbnail_url}
              alt={project.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-20 transition-opacity" />
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Film className="h-4 w-4" />
              <span>{project.scenes?.length || 0} scenes</span>
            </div>
            {project.duration_seconds && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(project.duration_seconds)}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(project.created_at)}</span>
          </div>
        </div>

        <Button
          onClick={() => navigate(`/video-editor/${project.id}`)}
          className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
          variant="outline"
        >
          <Play className="h-4 w-4 mr-2" />
          {project.status === 'completed' ? 'View Video' : 'Continue Editing'}
        </Button>
      </CardContent>
    </Card>
  );
}