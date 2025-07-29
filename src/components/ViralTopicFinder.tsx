import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Search, Zap, Clock, Eye, ThumbsUp } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface TrendingTopic {
  topic: string;
  viralScore: number;
  engagement: string;
  timeframe: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
}

export const ViralTopicFinder = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  
  const [trendingTopics] = useState<TrendingTopic[]>([
    {
      topic: "POV: You're the main character in your own mini-drama",
      viralScore: 94,
      engagement: "2.3M views",
      timeframe: "Last 24h",
      difficulty: "easy",
      category: "storytelling"
    },
    {
      topic: "When your phone dies at 1% but you need to film content",
      viralScore: 87,
      engagement: "1.8M views", 
      timeframe: "Last 12h",
      difficulty: "medium",
      category: "relatable"
    },
    {
      topic: "Plot twist: The quiet kid becomes the CEO",
      viralScore: 92,
      engagement: "3.1M views",
      timeframe: "Last 6h",
      difficulty: "easy",
      category: "drama"
    },
    {
      topic: "Rich vs poor family dinner reactions",
      viralScore: 89,
      engagement: "2.7M views",
      timeframe: "Last 18h", 
      difficulty: "medium",
      category: "social"
    },
    {
      topic: "When your bestie starts dating your ex",
      viralScore: 85,
      engagement: "1.9M views",
      timeframe: "Last 8h",
      difficulty: "hard",
      category: "relationship"
    }
  ]);

  const handleSearch = async () => {
    setIsSearching(true);
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Topics Found!",
        description: `Found 12 trending topics related to "${searchTerm}"`,
      });
      setIsSearching(false);
    }, 2000);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "hard": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const generateScript = (topic: string) => {
    toast({
      title: "Script Generated!",
      description: `Creating viral script for: "${topic}"`,
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-500" />
          Viral Topic Finder
        </CardTitle>
        <CardDescription>
          Discover trending topics and viral content opportunities in real-time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="trending" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trending">Trending Now</TabsTrigger>
            <TabsTrigger value="search">Topic Search</TabsTrigger>
            <TabsTrigger value="insights">AI Insights</TabsTrigger>
          </TabsList>
          
          <TabsContent value="trending" className="space-y-4">
            <div className="space-y-3">
              {trendingTopics.map((topic, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium mb-2">{topic.topic}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {topic.engagement}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {topic.timeframe}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950">
                        {topic.viralScore}% viral
                      </Badge>
                      <Badge className={getDifficultyColor(topic.difficulty)}>
                        {topic.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => generateScript(topic.topic)}
                      className="flex-1"
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      Generate Script
                    </Button>
                    <Button size="sm" variant="outline">
                      Save Topic
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="search" className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search for topic ideas (e.g., 'workplace drama', 'friendship betrayal')"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={isSearching}>
                <Search className="w-4 h-4" />
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm">Relationship Drama</Button>
              <Button variant="outline" size="sm">Work Life Chaos</Button>
              <Button variant="outline" size="sm">Family Secrets</Button>
              <Button variant="outline" size="sm">School Politics</Button>
            </div>
            
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h5 className="font-medium mb-2">Search Tips</h5>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Use emotional keywords (betrayal, shock, revenge)</li>
                <li>• Include setting (school, office, family)</li>
                <li>• Try "POV:" format for trending results</li>
              </ul>
            </div>
          </TabsContent>
          
          <TabsContent value="insights" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-4">
                <h5 className="font-medium mb-2 flex items-center gap-2">
                  <ThumbsUp className="w-4 h-4 text-green-500" />
                  Best Performing Categories
                </h5>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Relationship Drama</span>
                    <Badge variant="outline">92% success</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Plot Twists</span>
                    <Badge variant="outline">89% success</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Social Commentary</span>
                    <Badge variant="outline">85% success</Badge>
                  </div>
                </div>
              </Card>
              
              <Card className="p-4">
                <h5 className="font-medium mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  Optimal Posting Times
                </h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Peak Engagement</span>
                    <span className="font-medium">7-9 PM EST</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Weekend Boost</span>
                    <span className="font-medium">12-3 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Viral Window</span>
                    <span className="font-medium">6-8 PM</span>
                  </div>
                </div>
              </Card>
            </div>
            
            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 rounded-lg">
              <h5 className="font-medium mb-2">🔮 AI Prediction</h5>
              <p className="text-sm">
                Based on current trends, "workplace hierarchy drama" topics are 
                predicted to go viral in the next 48 hours. Consider creating content 
                around boss-employee dynamics or corporate politics.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};