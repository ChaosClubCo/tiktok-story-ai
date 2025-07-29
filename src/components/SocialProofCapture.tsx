import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Share2, MessageCircle, TrendingUp, Users, Camera, Smile } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ReliefMoment {
  id: string;
  user: { name: string; avatar: string; };
  content: string;
  timestamp: string;
  likes: number;
  shares: number;
  type: 'success' | 'breakthrough' | 'relief' | 'viral';
}

export const SocialProofCapture = () => {
  const [moments, setMoments] = useState<ReliefMoment[]>([
    {
      id: "1",
      user: { name: "Sarah M.", avatar: "" },
      content: "Just hit 1M views on my dating horror story! The script generator helped me structure it perfectly. I was stuck for weeks and this broke my creative block! 🎉",
      timestamp: "2 hours ago",
      likes: 42,
      shares: 12,
      type: 'viral'
    },
    {
      id: "2", 
      user: { name: "Jake R.", avatar: "" },
      content: "Finally got my first 100k views! The wellness tracker helped me realize I was burning out. Taking breaks actually improved my content quality.",
      timestamp: "1 day ago",
      likes: 28,
      shares: 8,
      type: 'breakthrough'
    },
    {
      id: "3",
      user: { name: "Maya P.", avatar: "" },
      content: "The viral topic finder predicted this trend 3 days early. Got in before everyone else and my video blew up! Feeling so relieved after months of struggling.",
      timestamp: "3 days ago", 
      likes: 67,
      shares: 23,
      type: 'relief'
    }
  ]);

  const [newMoment, setNewMoment] = useState("");
  const [isSharing, setIsSharing] = useState(false);

  const handleShareMoment = async () => {
    if (!newMoment.trim()) return;
    
    setIsSharing(true);
    
    // Simulate sharing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const moment: ReliefMoment = {
      id: Date.now().toString(),
      user: { name: "You", avatar: "" },
      content: newMoment,
      timestamp: "just now",
      likes: 0,
      shares: 0,
      type: 'success'
    };
    
    setMoments(prev => [moment, ...prev]);
    setNewMoment("");
    setIsSharing(false);
    
    toast({
      title: "🎉 Moment Shared!",
      description: "Your success story has been added to the community feed",
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'viral': return '🚀';
      case 'breakthrough': return '💡';
      case 'relief': return '😌';
      case 'success': return '🎉';
      default: return '✨';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'viral': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'breakthrough': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'relief': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'success': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-card via-card to-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-accent" />
          Social Proof Capture
          <Badge variant="secondary" className="ml-auto">
            <Users className="w-3 h-3 mr-1" />
            Live Community
          </Badge>
        </CardTitle>
        <CardDescription>
          Capture and share your relief moments and creative breakthroughs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Share Your Moment */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Smile className="w-4 h-4" />
            Share Your Relief Moment
          </h3>
          <Textarea
            placeholder="Share your breakthrough, success, or moment of relief... (e.g., 'Just hit my first viral video thanks to the script suggestions!')"
            value={newMoment}
            onChange={(e) => setNewMoment(e.target.value)}
            className="min-h-[100px]"
          />
          <Button
            onClick={handleShareMoment}
            disabled={!newMoment.trim() || isSharing}
            className="w-full bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90"
          >
            {isSharing ? "Sharing..." : "Share Your Moment"}
            <Share2 className="w-4 h-4 ml-2" />
          </Button>
        </div>

        {/* Community Moments Feed */}
        <div className="space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Community Relief Moments
          </h3>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {moments.map((moment) => (
              <Card key={moment.id} className="border-l-4 border-l-accent/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={moment.user.avatar} />
                      <AvatarFallback>{moment.user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{moment.user.name}</span>
                          <Badge className={`text-xs ${getTypeColor(moment.type)}`}>
                            {getTypeIcon(moment.type)} {moment.type}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground">{moment.timestamp}</span>
                      </div>
                      
                      <p className="text-sm">{moment.content}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                          <Heart className="w-3 h-3" />
                          {moment.likes}
                        </button>
                        <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                          <Share2 className="w-3 h-3" />
                          {moment.shares}
                        </button>
                        <button className="flex items-center gap-1 hover:text-green-500 transition-colors">
                          <MessageCircle className="w-3 h-3" />
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Social Proof Stats */}
        <div className="bg-gradient-to-r from-accent/10 to-primary/10 p-4 rounded-lg">
          <h3 className="font-semibold mb-3">📈 Community Impact This Week</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">156</div>
              <div className="text-xs text-muted-foreground">Relief Moments</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">42</div>
              <div className="text-xs text-muted-foreground">Viral Breakthroughs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-500">89%</div>
              <div className="text-xs text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};