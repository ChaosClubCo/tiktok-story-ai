import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { MessageCircle, Trophy, Star, Gift, Zap, Target, Crown, Gem } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface UserStats {
  level: number;
  xp: number;
  xpToNext: number;
  streak: number;
  totalScripts: number;
  viralHits: number;
  badges: string[];
}

interface Message {
  id: string;
  user: string;
  content: string;
  timestamp: string;
  reactions: { emoji: string; count: number; }[];
  reward?: number;
}

export const ChatFeedbackRewards = () => {
  const [userStats, setUserStats] = useState<UserStats>({
    level: 7,
    xp: 850,
    xpToNext: 1000,
    streak: 12,
    totalScripts: 34,
    viralHits: 5,
    badges: ['first-viral', 'streak-week', 'community-helper']
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      user: "AI Assistant",
      content: "Great job on your horror script! I noticed you used perfect pacing. Here's +50 XP for mastering dramatic timing! 🎬",
      timestamp: "2 min ago",
      reactions: [{ emoji: "🔥", count: 12 }, { emoji: "💯", count: 8 }],
      reward: 50
    },
    {
      id: "2",
      user: "You",
      content: "Thanks! The script structure really helped me understand how to build suspense.",
      timestamp: "1 min ago",
      reactions: []
    }
  ]);

  const [newMessage, setNewMessage] = useState("");
  const [showReward, setShowReward] = useState(false);

  const badges = {
    'first-viral': { name: 'First Viral', icon: '🚀', description: 'Your first viral video!' },
    'streak-week': { name: 'Week Warrior', icon: '🔥', description: '7-day creation streak' },
    'community-helper': { name: 'Helper', icon: '🤝', description: 'Helped 10 creators' },
    'script-master': { name: 'Script Master', icon: '📝', description: '100 scripts created' },
    'viral-legend': { name: 'Viral Legend', icon: '👑', description: '10 viral videos' }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      user: "You",
      content: newMessage,
      timestamp: "just now",
      reactions: []
    };

    setMessages(prev => [...prev, message]);
    setNewMessage("");

    // Simulate AI response with reward
    setTimeout(() => {
      const responses = [
        { content: "Excellent question! That shows great creative thinking. +25 XP for engagement! 🧠", reward: 25 },
        { content: "I love your approach to that scene! You're really getting the hang of viral structures. +30 XP! ⚡", reward: 30 },
        { content: "That's a fantastic insight! Your understanding is growing. +20 XP for depth! 🎯", reward: 20 }
      ];
      
      const response = responses[Math.floor(Math.random() * responses.length)];
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        user: "AI Assistant",
        content: response.content,
        timestamp: "just now",
        reactions: [],
        reward: response.reward
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Update XP with animation
      setUserStats(prev => ({
        ...prev,
        xp: prev.xp + response.reward
      }));
      
      setShowReward(true);
      setTimeout(() => setShowReward(false), 3000);
    }, 1500);
  };

  const handleReaction = (messageId: string, emoji: string) => {
    setMessages(prev => prev.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions.find(r => r.emoji === emoji);
        if (existingReaction) {
          return {
            ...msg,
            reactions: msg.reactions.map(r => 
              r.emoji === emoji ? { ...r, count: r.count + 1 } : r
            )
          };
        } else {
          return {
            ...msg,
            reactions: [...msg.reactions, { emoji, count: 1 }]
          };
        }
      }
      return msg;
    }));

    // Add XP for reactions
    setUserStats(prev => ({ ...prev, xp: prev.xp + 5 }));
    
    toast({
      title: "+5 XP",
      description: "Reaction added!",
    });
  };

  const levelProgress = (userStats.xp / userStats.xpToNext) * 100;

  return (
    <Card className="bg-gradient-to-br from-card via-card to-accent/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-accent" />
          Interactive Chat & Rewards
          <Badge variant="secondary" className="ml-auto">
            <Trophy className="w-3 h-3 mr-1" />
            Level {userStats.level}
          </Badge>
        </CardTitle>
        <CardDescription>
          Get real-time feedback and earn rewards for engagement
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Reward Animation */}
        {showReward && (
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-bounce">
            <div className="bg-yellow-400 text-black px-4 py-2 rounded-full font-bold shadow-lg">
              +XP Earned! 🎉
            </div>
          </div>
        )}

        {/* User Progress */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white">
                  <Crown className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold">Level {userStats.level} Creator</div>
                <div className="text-sm text-muted-foreground">{userStats.xp} / {userStats.xpToNext} XP</div>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-sm">
                <Zap className="w-3 h-3 text-yellow-500" />
                {userStats.streak} day streak
              </div>
            </div>
          </div>
          
          <Progress value={levelProgress} className="h-3" />
          
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{userStats.totalScripts}</div>
              <div className="text-xs text-muted-foreground">Scripts Created</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-accent">{userStats.viralHits}</div>
              <div className="text-xs text-muted-foreground">Viral Hits</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-500">{userStats.badges.length}</div>
              <div className="text-xs text-muted-foreground">Badges Earned</div>
            </div>
          </div>

          {/* Badges */}
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Star className="w-4 h-4" />
              Your Badges
            </h4>
            <div className="flex flex-wrap gap-2">
              {userStats.badges.map(badgeId => {
                const badge = badges[badgeId as keyof typeof badges];
                return (
                  <Badge key={badgeId} variant="outline" className="flex items-center gap-1">
                    <span>{badge.icon}</span>
                    {badge.name}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="space-y-4">
          <h3 className="font-semibold">Chat Feed</h3>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.user === 'You' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] ${message.user === 'You' ? 'order-2' : 'order-1'}`}>
                  <div className={`p-3 rounded-lg ${
                    message.user === 'You' 
                      ? 'bg-primary text-primary-foreground ml-auto' 
                      : 'bg-muted'
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium">{message.user}</span>
                      {message.reward && (
                        <Badge className="bg-yellow-400 text-black">
                          <Gem className="w-3 h-3 mr-1" />
                          +{message.reward} XP
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm">{message.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs opacity-70">{message.timestamp}</span>
                      {message.reactions.length > 0 && (
                        <div className="flex gap-1">
                          {message.reactions.map((reaction, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {reaction.emoji} {reaction.count}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Quick Reactions */}
                  <div className="flex gap-1 mt-1">
                    {['🔥', '💯', '🎯', '⚡'].map(emoji => (
                      <Button
                        key={emoji}
                        size="sm"
                        variant="ghost"
                        className="text-xs p-1 h-6 w-6"
                        onClick={() => handleReaction(message.id, emoji)}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Ask a question or share feedback..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
            <MessageCircle className="w-4 h-4" />
          </Button>
        </div>

        {/* Daily Challenges */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Target className="w-4 h-4" />
            Today's Challenges
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span>Create 1 script (1/1) ✅</span>
              <Badge variant="outline">+100 XP</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Get community feedback (0/1)</span>
              <Badge variant="outline">+50 XP</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Help another creator (0/1)</span>
              <Badge variant="outline">+75 XP</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};