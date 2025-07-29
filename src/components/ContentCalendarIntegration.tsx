import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { 
  Calendar, 
  Clock, 
  Plus, 
  TrendingUp, 
  Target, 
  Users,
  Edit3,
  Trash2,
  CheckSquare
} from "lucide-react";

interface ContentPost {
  id: string;
  title: string;
  platform: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'draft' | 'scheduled' | 'published';
  script: string;
  hashtags: string[];
  estimatedReach: number;
}

interface CalendarDay {
  date: string;
  posts: ContentPost[];
  dayOfWeek: string;
}

export const ContentCalendarIntegration = () => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [newPost, setNewPost] = useState({
    title: "",
    platform: "",
    scheduledTime: "",
    script: "",
    hashtags: ""
  });
  const [showNewPost, setShowNewPost] = useState(false);

  const mockPosts: ContentPost[] = [
    {
      id: "1",
      title: "Morning Motivation Tips",
      platform: "TikTok",
      scheduledDate: "2024-01-15",
      scheduledTime: "09:00",
      status: "scheduled",
      script: "Start your day with these 3 powerful habits...",
      hashtags: ["#motivation", "#morningroutine", "#productivity"],
      estimatedReach: 15000
    },
    {
      id: "2",
      title: "Quick Recipe Tutorial",
      platform: "Instagram",
      scheduledDate: "2024-01-15",
      scheduledTime: "18:00",
      status: "draft",
      script: "This 5-minute recipe will change your dinner game...",
      hashtags: ["#cooking", "#recipe", "#quickmeals"],
      estimatedReach: 8000
    },
    {
      id: "3",
      title: "Tech Review Snippet",
      platform: "YouTube Shorts",
      scheduledDate: "2024-01-16",
      scheduledTime: "14:00",
      status: "scheduled",
      script: "I tested this gadget for 30 days and here's what happened...",
      hashtags: ["#tech", "#review", "#gadgets"],
      estimatedReach: 25000
    }
  ];

  const [posts, setPosts] = useState<ContentPost[]>(mockPosts);

  const platforms = [
    { id: "tiktok", name: "TikTok", icon: "🎵" },
    { id: "instagram", name: "Instagram", icon: "📸" },
    { id: "youtube", name: "YouTube Shorts", icon: "🎥" },
    { id: "twitter", name: "Twitter", icon: "🐦" }
  ];

  const handleAddPost = () => {
    if (!newPost.title || !newPost.platform || !newPost.scheduledTime) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    const post: ContentPost = {
      id: Date.now().toString(),
      title: newPost.title,
      platform: newPost.platform,
      scheduledDate: selectedDate,
      scheduledTime: newPost.scheduledTime,
      status: 'draft',
      script: newPost.script,
      hashtags: newPost.hashtags.split(',').map(tag => tag.trim()).filter(Boolean),
      estimatedReach: Math.floor(Math.random() * 20000) + 5000
    };

    setPosts(prev => [...prev, post]);
    setNewPost({ title: "", platform: "", scheduledTime: "", script: "", hashtags: "" });
    setShowNewPost(false);

    toast({
      title: "Post Added",
      description: "Content has been added to your calendar"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-success text-success-foreground';
      case 'scheduled':
        return 'bg-primary text-primary-foreground';
      case 'draft':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getOptimalTimes = (platform: string) => {
    const times = {
      tiktok: ["09:00", "12:00", "18:00", "21:00"],
      instagram: ["11:00", "14:00", "17:00", "20:00"],
      youtube: ["14:00", "16:00", "19:00", "22:00"],
      twitter: ["08:00", "12:00", "17:00", "19:00"]
    };
    return times[platform.toLowerCase() as keyof typeof times] || [];
  };

  const generateCalendarDays = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      
      days.push({
        date: dateString,
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'short' }),
        posts: posts.filter(post => post.scheduledDate === dateString)
      });
    }
    
    return days;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Content Calendar Integration
        </CardTitle>
        <CardDescription>
          Plan, schedule, and manage your content across all platforms
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="calendar" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="schedule">Schedule Post</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6">
            <div className="grid grid-cols-7 gap-2">
              {generateCalendarDays().map((day) => (
                <Card key={day.date} className="min-h-32">
                  <CardContent className="p-3">
                    <div className="text-center mb-2">
                      <div className="text-xs text-muted-foreground">{day.dayOfWeek}</div>
                      <div className="font-medium">{new Date(day.date).getDate()}</div>
                    </div>
                    
                    <div className="space-y-1">
                      {day.posts.map((post) => (
                        <div
                          key={post.id}
                          className="text-xs p-1 rounded bg-primary/10 cursor-pointer hover:bg-primary/20"
                          title={post.title}
                        >
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.scheduledTime}
                          </div>
                          <div className="truncate">{post.title}</div>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${getStatusColor(post.status)}`}
                          >
                            {post.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Upcoming Posts</h4>
              {posts
                .filter(post => new Date(post.scheduledDate + 'T' + post.scheduledTime) > new Date())
                .sort((a, b) => new Date(a.scheduledDate + 'T' + a.scheduledTime).getTime() - new Date(b.scheduledDate + 'T' + b.scheduledTime).getTime())
                .slice(0, 5)
                .map((post) => (
                  <Card key={post.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-medium">{post.title}</h5>
                            <Badge variant="outline">{post.platform}</Badge>
                            <Badge className={getStatusColor(post.status)}>
                              {post.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(post.scheduledDate).toLocaleDateString()} at {post.scheduledTime}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Est. reach: {post.estimatedReach.toLocaleString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Edit3 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="post-title">Post Title</Label>
                  <Input
                    id="post-title"
                    placeholder="Enter post title"
                    value={newPost.title}
                    onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="platform">Platform</Label>
                  <Select value={newPost.platform} onValueChange={(value) => 
                    setNewPost(prev => ({ ...prev, platform: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map((platform) => (
                        <SelectItem key={platform.id} value={platform.name}>
                          {platform.icon} {platform.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="schedule-date">Date</Label>
                  <Input
                    id="schedule-date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="schedule-time">Time</Label>
                  <Select value={newPost.scheduledTime} onValueChange={(value) => 
                    setNewPost(prev => ({ ...prev, scheduledTime: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {newPost.platform && getOptimalTimes(newPost.platform).map((time) => (
                        <SelectItem key={time} value={time}>
                          {time} ⭐ (Optimal)
                        </SelectItem>
                      ))}
                      {Array.from({ length: 24 }, (_, i) => 
                        String(i).padStart(2, '0') + ':00'
                      ).map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="script-content">Script Content</Label>
                <Textarea
                  id="script-content"
                  placeholder="Enter your script content..."
                  value={newPost.script}
                  onChange={(e) => setNewPost(prev => ({ ...prev, script: e.target.value }))}
                  className="min-h-32"
                />
              </div>

              <div>
                <Label htmlFor="hashtags">Hashtags</Label>
                <Input
                  id="hashtags"
                  placeholder="Enter hashtags separated by commas"
                  value={newPost.hashtags}
                  onChange={(e) => setNewPost(prev => ({ ...prev, hashtags: e.target.value }))}
                />
              </div>

              <Button onClick={handleAddPost} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Schedule Post
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Calendar className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{posts.length}</div>
                  <div className="text-sm text-muted-foreground">Total Posts</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">
                    {posts.reduce((acc, post) => acc + post.estimatedReach, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Est. Total Reach</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <CheckSquare className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">
                    {posts.filter(post => post.status === 'published').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Published</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Platform Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {platforms.map((platform) => {
                    const platformPosts = posts.filter(post => post.platform === platform.name);
                    const percentage = posts.length > 0 ? (platformPosts.length / posts.length) * 100 : 0;
                    
                    return (
                      <div key={platform.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{platform.icon}</span>
                          <span className="font-medium">{platform.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-muted-foreground w-12">
                            {platformPosts.length}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};