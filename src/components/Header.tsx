import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate, useLocation } from "react-router-dom";

export const Header = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed Out",
      description: "You have been signed out successfully",
    });
  };

  if (!user) return null;

  return (
    <header className="sticky top-0 z-50 bg-gradient-nav border-b border-border/50 backdrop-blur-lg shadow-elevated">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-6">
          <h2 
            className="text-xl font-bold bg-gradient-drama bg-clip-text text-transparent cursor-pointer hover:scale-105 transition-transform"
            onClick={() => navigate("/")}
          >
            MiniDrama
          </h2>
          <nav className="hidden md:flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className={location.pathname === '/' ? 'bg-primary/10 text-primary' : ''}
            >
              Home
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className={location.pathname === '/dashboard' ? 'bg-primary/10 text-primary' : ''}
            >
              Dashboard
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/templates")}
              className={location.pathname === '/templates' ? 'bg-primary/10 text-primary' : ''}
            >
              Templates
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/collaborate")}
              className={location.pathname === '/collaborate' ? 'bg-primary/10 text-primary' : ''}
            >
              Collaborate
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/predictions")}
              className={location.pathname === '/predictions' ? 'bg-primary/10 text-primary' : ''}
            >
              Predictions
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/series")}
              className={location.pathname === '/series' ? 'bg-primary/10 text-primary' : ''}
            >
              Series
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/my-scripts")}
              className={`flex items-center gap-2 ${location.pathname === '/my-scripts' ? 'bg-primary/10 text-primary' : ''}`}
            >
              <FileText className="h-4 w-4" />
              My Scripts
            </Button>
          </nav>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className="text-sm text-muted-foreground hidden lg:block">
            {user.email}
          </span>
          <Avatar className="h-9 w-9 ring-2 ring-border/50 transition-all hover:ring-primary/50">
            <AvatarFallback className="text-xs bg-gradient-drama text-primary-foreground font-semibold">
              {user.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};