import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { 
  Store, 
  Search, 
  Star, 
  Download, 
  Heart, 
  Filter,
  TrendingUp,
  DollarSign,
  Eye,
  ShoppingCart,
  Upload,
  Award
} from "lucide-react";

interface MarketplaceScript {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  rating: number;
  downloads: number;
  author: string;
  authorAvatar: string;
  tags: string[];
  previewText: string;
  isPremium: boolean;
  earnings?: number;
}

interface CreatorStats {
  totalEarnings: number;
  totalSales: number;
  averageRating: number;
  totalScripts: number;
}

export const CreatorMarketplace = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("popular");
  const [showFavorites, setShowFavorites] = useState(false);

  const categories = [
    "All Categories",
    "Viral Hooks",
    "Educational",
    "Entertainment", 
    "Lifestyle",
    "Business",
    "Comedy",
    "Motivational",
    "Tutorial"
  ];

  const mockScripts: MarketplaceScript[] = [
    {
      id: "1",
      title: "Ultimate Viral Hook Collection",
      description: "50 proven hooks that generated millions of views",
      category: "Viral Hooks",
      price: 29.99,
      rating: 4.9,
      downloads: 1247,
      author: "ViralMaster",
      authorAvatar: "VM",
      tags: ["hooks", "viral", "engagement"],
      previewText: "Did you know that 90% of people make this mistake...",
      isPremium: true,
      earnings: 37463.53
    },
    {
      id: "2", 
      title: "Morning Routine Scripts Bundle",
      description: "10 engaging morning routine scripts for lifestyle content",
      category: "Lifestyle",
      price: 14.99,
      rating: 4.7,
      downloads: 892,
      author: "LifestyleGuru",
      authorAvatar: "LG",
      tags: ["morning", "routine", "lifestyle"],
      previewText: "What if I told you that changing just one morning habit...",
      isPremium: false,
      earnings: 13378.08
    },
    {
      id: "3",
      title: "Business Growth Mini-Scripts",
      description: "Quick business tips perfect for 30-second videos",
      category: "Business", 
      price: 19.99,
      rating: 4.8,
      downloads: 654,
      author: "BizExpert",
      authorAvatar: "BE",
      tags: ["business", "growth", "entrepreneur"],
      previewText: "Most entrepreneurs fail because they ignore this one thing...",
      isPremium: true,
      earnings: 13073.46
    },
    {
      id: "4",
      title: "Comedy Gold Scripts",
      description: "Hilarious scripts that guarantee laughs and shares",
      category: "Comedy",
      price: 12.99,
      rating: 4.6,
      downloads: 1156,
      author: "ComedyKing",
      authorAvatar: "CK", 
      tags: ["comedy", "humor", "entertainment"],
      previewText: "Why do they call it rush hour when nobody's moving?",
      isPremium: false,
      earnings: 15015.44
    }
  ];

  const [scripts] = useState<MarketplaceScript[]>(mockScripts);
  const [favorites, setFavorites] = useState<string[]>([]);

  const creatorStats: CreatorStats = {
    totalEarnings: 78930.51,
    totalSales: 3949,
    averageRating: 4.8,
    totalScripts: 23
  };

  const handlePurchase = (scriptId: string) => {
    toast({
      title: "Purchase Successful",
      description: "Script has been added to your library",
    });
  };

  const handleFavorite = (scriptId: string) => {
    setFavorites(prev => 
      prev.includes(scriptId)
        ? prev.filter(id => id !== scriptId)
        : [...prev, scriptId]
    );
  };

  const filteredScripts = scripts.filter(script => {
    const matchesSearch = script.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         script.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         script.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === "all" || 
                           script.category.toLowerCase() === selectedCategory.toLowerCase();
    
    const matchesFavorites = !showFavorites || favorites.includes(script.id);
    
    return matchesSearch && matchesCategory && matchesFavorites;
  });

  const sortedScripts = [...filteredScripts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "downloads":
        return b.downloads - a.downloads;
      default: // popular
        return b.downloads - a.downloads;
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="w-5 h-5" />
          Creator Marketplace
        </CardTitle>
        <CardDescription>
          Buy and sell high-performing scripts with the creator community
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse">Browse Scripts</TabsTrigger>
            <TabsTrigger value="sell">Sell Scripts</TabsTrigger>
            <TabsTrigger value="earnings">My Earnings</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                  <Input
                    placeholder="Search scripts, tags, or creators..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  variant={showFavorites ? "default" : "outline"}
                  onClick={() => setShowFavorites(!showFavorites)}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Favorites
                </Button>
              </div>

              <div className="flex gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem 
                        key={category.toLowerCase().replace(" ", "-")} 
                        value={category === "All Categories" ? "all" : category.toLowerCase()}
                      >
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                    <SelectItem value="downloads">Most Downloaded</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Script Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedScripts.map((script) => (
                <Card key={script.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm line-clamp-2">{script.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {script.description}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleFavorite(script.id)}
                        >
                          <Heart 
                            className={`w-4 h-4 ${
                              favorites.includes(script.id) 
                                ? 'fill-red-500 text-red-500' 
                                : 'text-muted-foreground'
                            }`} 
                          />
                        </Button>
                      </div>

                      <div className="bg-muted p-2 rounded text-xs italic">
                        "{script.previewText}"
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {script.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground">
                            {script.authorAvatar}
                          </div>
                          <span>{script.author}</span>
                        </div>
                        {script.isPremium && (
                          <Badge variant="secondary">Premium</Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            {script.rating}
                          </div>
                          <div className="flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            {script.downloads}
                          </div>
                        </div>
                        <div className="text-lg font-bold">${script.price}</div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="w-3 h-3 mr-1" />
                          Preview
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handlePurchase(script.id)}
                        >
                          <ShoppingCart className="w-3 h-3 mr-1" />
                          Buy
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="sell" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Sell Your Scripts</CardTitle>
                <CardDescription>
                  Share your successful scripts with the community and earn passive income
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Script Title</label>
                    <Input placeholder="Enter script title" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Select>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.slice(1).map((category) => (
                          <SelectItem key={category} value={category.toLowerCase()}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Input placeholder="Describe your script's value proposition" className="mt-1" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Price ($)</label>
                    <Input type="number" placeholder="0.00" className="mt-1" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tags</label>
                    <Input placeholder="viral, hooks, engagement (comma separated)" className="mt-1" />
                  </div>
                </div>

                <Button className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Submit Script for Review
                </Button>

                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-medium mb-2">💡 Tips for Success</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Include performance metrics (views, engagement)</li>
                    <li>• Provide clear usage instructions</li>
                    <li>• Use relevant tags for better discoverability</li>
                    <li>• Price competitively based on proven results</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <DollarSign className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">${creatorStats.totalEarnings.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Earnings</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <ShoppingCart className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{creatorStats.totalSales.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Sales</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Star className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{creatorStats.averageRating}</div>
                  <div className="text-sm text-muted-foreground">Avg Rating</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Award className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">{creatorStats.totalScripts}</div>
                  <div className="text-sm text-muted-foreground">Scripts Sold</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">My Scripts Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scripts.map((script) => (
                    <div key={script.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{script.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>{script.downloads} downloads</span>
                          <span>⭐ {script.rating}</span>
                          <Badge variant="outline">{script.category}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-success">
                          ${script.earnings?.toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          ${script.price} each
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};