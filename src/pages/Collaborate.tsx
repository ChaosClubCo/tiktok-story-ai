import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Plus, MessageCircle, Clock, CheckCircle, TrendingUp } from "lucide-react";

interface CollaborationSession {
  id: string;
  title: string;
  creator: string;
  collaborators: number;
  status: 'active' | 'completed' | 'draft';
  updatedAt: string;
  niche: string;
}

const Collaborate = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Mock collaboration sessions
  const sessions: CollaborationSession[] = [
    {
      id: "1",
      title: "Red Flag Restaurant Date - Team Edit",
      creator: "Sarah_Creator",
      collaborators: 3,
      status: 'active',
      updatedAt: '2 hours ago',
      niche: 'dating'
    },
    {
      id: "2",
      title: "Horror Story Collab - Spooky Season",
      creator: "You",
      collaborators: 5,
      status: 'active',
      updatedAt: '5 minutes ago',
      niche: 'horror'
    },
    {
      id: "3",
      title: "Comedy Sketch - Office Gossip",
      creator: "Mike_Comedy",
      collaborators: 2,
      status: 'draft',
      updatedAt: 'Yesterday',
      niche: 'comedy'
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-base">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-8 text-center max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-drama bg-clip-text text-transparent mb-4">
            Collaboration Hub
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            Team up with other creators, share ideas in real-time, and create viral scripts together
          </p>
          <Button variant="drama" size="lg" className="shadow-glow">
            <Plus className="w-5 h-5 mr-2" />
            Start New Collaboration
          </Button>
        </div>

        {/* Search and Filter */}
        <div className="mb-6">
          <Input
            placeholder="Search collaborations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md mx-auto"
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="invites">Invites</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sessions.filter(s => s.status === 'active').map((session) => (
                <Card key={session.id} elevated floating className="cursor-pointer transition-all hover:scale-[1.02]">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="secondary" className="bg-success/20 text-success border-success/30">
                        Active
                      </Badge>
                      <Badge variant="outline">{session.niche}</Badge>
                    </div>
                    <CardTitle className="text-lg">{session.title}</CardTitle>
                    <CardDescription>by {session.creator}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{session.collaborators} collaborators</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>{session.updatedAt}</span>
                      </div>
                    </div>
                    
                    <div className="flex -space-x-2">
                      {[...Array(session.collaborators)].map((_, i) => (
                        <Avatar key={i} className="border-2 border-background-elevated w-8 h-8">
                          <AvatarFallback className="text-xs bg-gradient-drama text-primary-foreground">
                            {String.fromCharCode(65 + i)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </div>

                    <Button variant="outline" className="w-full" size="sm">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Join Session
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="invites">
            <Card elevated className="text-center py-12">
              <CardContent>
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No pending invites</h3>
                <p className="text-muted-foreground">You'll see collaboration invites from other creators here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="completed">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card elevated className="cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge className="bg-info/20 text-info border-info/30">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Completed
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">Summer Vibes Comedy Special</CardTitle>
                  <CardDescription>Completed 1 week ago</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm mb-4">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="text-success">15K views generated</span>
                  </div>
                  <Button variant="secondary" className="w-full" size="sm">
                    View Results
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Features Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card elevated>
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-gradient-drama rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Real-Time Editing</h3>
              <p className="text-sm text-muted-foreground">
                Collaborate simultaneously with live updates and instant feedback
              </p>
            </CardContent>
          </Card>

          <Card elevated>
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="font-semibold mb-2">Team Management</h3>
              <p className="text-sm text-muted-foreground">
                Invite creators, assign roles, and track contributions
              </p>
            </CardContent>
          </Card>

          <Card elevated>
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
              <h3 className="font-semibold mb-2">Shared Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Track performance metrics together and optimize as a team
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Collaborate;
