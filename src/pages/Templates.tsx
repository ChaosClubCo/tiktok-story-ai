import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import TemplateCard from "@/components/TemplateCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Star, TrendingUp, Crown, Filter, Heart, Download } from "lucide-react";

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

const Templates = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNiche, setSelectedNiche] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [sortBy, setSortBy] = useState("trending");
  const [savedTemplates, setSavedTemplates] = useState<string[]>([]);

  // Mock template data - in real app, this would come from database
  const mockTemplates: Template[] = [
    {
      id: "1",
      title: "Restaurant Red Flag Date",
      description: "Classic dating scenario where the date reveals major red flags through their behavior at a restaurant",
      niche: "dating",
      difficulty: "beginner",
      rating: 4.8,
      downloads: 15420,
      tags: ["red-flags", "dating", "restaurant", "viral"],
      author: "CreatorPro",
      isPremium: false,
      structure: {
        hook: "POV: He takes you to a restaurant and does THIS... 🚩",
        scenes: [
          { timeStamp: "0-7s", content: "So I thought this place looked fancy on Instagram...", action: "Nervous fidgeting with menu" },
          { timeStamp: "8-15s", content: "Actually, can we split the bill? I'm saving for crypto...", action: "Pulls out phone to show crypto wallet" },
          { timeStamp: "16-23s", content: "This is why I don't date anymore.", action: "Gets up and leaves" }
        ],
        hashtags: ["redflags", "dating", "storytime", "toxic", "fyp"]
      },
      createdAt: "2024-01-15"
    },
    {
      id: "2",
      title: "3AM Horror Doorbell",
      description: "Spine-chilling scenario about mysterious late-night visitors with a twist ending",
      niche: "horror",
      difficulty: "intermediate",
      rating: 4.9,
      downloads: 23100,
      tags: ["horror", "3am", "mystery", "doorbell", "scary"],
      author: "HorrorMaster",
      isPremium: true,
      structure: {
        hook: "Someone rang my doorbell at 3AM and what I saw will haunt you...",
        scenes: [
          { timeStamp: "0-10s", content: "It's 3:17 AM and someone just rang my doorbell...", action: "Whispering, checking phone time" },
          { timeStamp: "11-20s", content: "I look through the peephole and see...", action: "Slowly approaching door" },
          { timeStamp: "21-30s", content: "NOTHING. But the doorbell keeps ringing.", action: "Jumps back from door" }
        ],
        hashtags: ["horror", "scary", "3am", "haunted", "creepy"]
      },
      createdAt: "2024-01-20"
    },
    {
      id: "3",
      title: "Workplace Drama Reveal",
      description: "Office gossip and workplace politics that escalate into dramatic confrontation",
      niche: "drama",
      difficulty: "advanced",
      rating: 4.6,
      downloads: 8900,
      tags: ["workplace", "drama", "office", "gossip", "confrontation"],
      author: "DramaQueen",
      isPremium: false,
      structure: {
        hook: "When you overhear your coworkers talking about you...",
        scenes: [
          { timeStamp: "0-8s", content: "I was just grabbing coffee when I heard my name...", action: "Hiding behind office plants" },
          { timeStamp: "9-18s", content: "She thinks she's better than us since the promotion", action: "Shocked facial expression" },
          { timeStamp: "19-28s", content: "Well, let me show them what 'better' really looks like", action: "Dramatic hair flip and walk away" }
        ],
        hashtags: ["workplace", "drama", "office", "tea", "storytime"]
      },
      createdAt: "2024-01-18"
    },
    {
      id: "4",
      title: "Gym Bro Pickup Lines",
      description: "Hilarious compilation of terrible pickup lines heard at the gym",
      niche: "comedy",
      difficulty: "beginner",
      rating: 4.7,
      downloads: 19800,
      tags: ["comedy", "gym", "pickup-lines", "cringe", "funny"],
      author: "FitnessComedian",
      isPremium: false,
      structure: {
        hook: "Gym bros and their pickup lines be like...",
        scenes: [
          { timeStamp: "0-6s", content: "Are you a protein shake? Because you're making me stronger", action: "Flexing awkwardly" },
          { timeStamp: "7-14s", content: "I must be doing cardio because my heart's racing", action: "Breathing heavily, sweating" },
          { timeStamp: "15-22s", content: "Can I spot you? Because I've been watching you all day", action: "Winking unsuccessfully" }
        ],
        hashtags: ["gym", "comedy", "pickuplines", "cringe", "fyp"]
      },
      createdAt: "2024-01-12"
    },
    {
      id: "5",
      title: "Morning Routine Glow Up",
      description: "Lifestyle transformation showing an elevated morning routine for productivity",
      niche: "lifestyle",
      difficulty: "beginner",
      rating: 4.5,
      downloads: 12600,
      tags: ["morning-routine", "glow-up", "productivity", "self-care", "lifestyle"],
      author: "WellnessGuru",
      isPremium: true,
      structure: {
        hook: "POV: You decided to become that girl...",
        scenes: [
          { timeStamp: "0-8s", content: "5 AM wake up, no snooze button", action: "Gracefully getting out of bed" },
          { timeStamp: "9-16s", content: "Meditation, journaling, and green smoothie", action: "Peaceful morning activities montage" },
          { timeStamp: "17-24s", content: "Ready to conquer the day ✨", action: "Confident walk out the door" }
        ],
        hashtags: ["morningroutine", "thatgirl", "productivity", "selfcare", "lifestyle"]
      },
      createdAt: "2024-01-22"
    }
  ];

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Filter and sort templates
  const filteredTemplates = mockTemplates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesNiche = selectedNiche === "all" || template.niche === selectedNiche;
    const matchesDifficulty = selectedDifficulty === "all" || template.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesNiche && matchesDifficulty;
  }).sort((a, b) => {
    switch (sortBy) {
      case "trending":
        return b.downloads - a.downloads;
      case "rating":
        return b.rating - a.rating;
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return 0;
    }
  });

  const handleSaveTemplate = (templateId: string) => {
    setSavedTemplates(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading templates...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Please sign in</h2>
          <Button onClick={() => navigate("/auth")}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Template Marketplace
          </h1>
          <p className="text-muted-foreground mt-2">
            Discover viral script templates created by top content creators
          </p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search templates, tags, or creators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex flex-wrap gap-4">
            <Select value={selectedNiche} onValueChange={setSelectedNiche}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Niche" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Niches</SelectItem>
                <SelectItem value="dating">Dating</SelectItem>
                <SelectItem value="horror">Horror</SelectItem>
                <SelectItem value="comedy">Comedy</SelectItem>
                <SelectItem value="drama">Drama</SelectItem>
                <SelectItem value="lifestyle">Lifestyle</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="trending">Trending</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Featured Templates */}
        <div className="mb-8">
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                Featured Templates
              </CardTitle>
              <CardDescription>
                Hand-picked viral templates that are trending this week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mockTemplates.slice(0, 3).map((template) => (
                  <div key={template.id} className="relative">
                    <TemplateCard
                      template={template}
                      isSaved={savedTemplates.includes(template.id)}
                      onSave={() => handleSaveTemplate(template.id)}
                    />
                    <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-yellow-900">
                      Featured
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Template Grid */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Templates ({filteredTemplates.length})</TabsTrigger>
            <TabsTrigger value="saved">Saved ({savedTemplates.length})</TabsTrigger>
            <TabsTrigger value="premium">Premium</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isSaved={savedTemplates.includes(template.id)}
                  onSave={() => handleSaveTemplate(template.id)}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="saved" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates
                .filter(template => savedTemplates.includes(template.id))
                .map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isSaved={true}
                    onSave={() => handleSaveTemplate(template.id)}
                  />
                ))}
            </div>
            {savedTemplates.length === 0 && (
              <div className="text-center py-12">
                <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No saved templates yet</h3>
                <p className="text-muted-foreground">Save your favorite templates to access them quickly</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="premium" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates
                .filter(template => template.isPremium)
                .map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isSaved={savedTemplates.includes(template.id)}
                    onSave={() => handleSaveTemplate(template.id)}
                  />
                ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Upload Template CTA */}
        <div className="mt-12">
          <Card className="text-center">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold mb-2">Share Your Templates</h3>
              <p className="text-muted-foreground mb-4">
                Help the community by sharing your successful script templates
              </p>
              <Button className="flex items-center gap-2 mx-auto">
                <TrendingUp className="w-4 h-4" />
                Upload Template
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Templates;