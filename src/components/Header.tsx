import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { NavLink, MobileNav, NavItem } from '@/components/shared';
import { 
  LogOut, 
  FileText, 
  Film, 
  FlaskConical, 
  Home, 
  LayoutDashboard,
  Layers,
  Users,
  TrendingUp,
  ListVideo
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

// Navigation configuration - single source of truth
const NAV_ITEMS: NavItem[] = [
  { label: 'Home', path: '/', icon: <Home className="h-4 w-4" /> },
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Templates', path: '/templates', icon: <Layers className="h-4 w-4" /> },
  { label: 'Collaborate', path: '/collaborate', icon: <Users className="h-4 w-4" /> },
  { label: 'Predictions', path: '/predictions', icon: <TrendingUp className="h-4 w-4" /> },
  { label: 'Series', path: '/series', icon: <ListVideo className="h-4 w-4" /> },
  { label: 'A/B Tests', path: '/ab-tests', icon: <FlaskConical className="h-4 w-4" /> },
  { label: 'Videos', path: '/video-generator', icon: <Film className="h-4 w-4" /> },
  { label: 'My Scripts', path: '/my-scripts', icon: <FileText className="h-4 w-4" /> },
];

/**
 * Header - Main application header with responsive navigation
 * Features: 
 * - Desktop navigation with active states
 * - Mobile navigation drawer
 * - User profile and sign-out
 */
export function Header() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'Signed Out',
      description: 'You have been signed out successfully',
    });
  };

  // Don't render header for unauthenticated users
  if (!user) return null;

  const userInitial = user.email?.charAt(0).toUpperCase() || 'U';

  return (
    <header 
      className="sticky top-0 z-50 bg-gradient-nav border-b border-border/50 backdrop-blur-lg shadow-elevated"
      role="banner"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo and Mobile Nav */}
        <div className="flex items-center gap-4">
          <MobileNav items={NAV_ITEMS} />
          <h2
            className="text-xl font-bold bg-gradient-drama bg-clip-text text-transparent cursor-pointer hover:scale-105 transition-transform"
            onClick={() => navigate('/')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && navigate('/')}
          >
            MiniDrama
          </h2>
        </div>

        {/* Desktop Navigation */}
        <nav 
          className="hidden md:flex items-center gap-1" 
          role="navigation" 
          aria-label="Main navigation"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              icon={item.icon}
              end={item.path === '/'}
            >
              <span className="hidden lg:inline">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden lg:block truncate max-w-[150px]">
            {user.email}
          </span>
          <Avatar className="h-9 w-9 ring-2 ring-border/50 transition-all hover:ring-primary/50">
            <AvatarFallback className="text-xs bg-gradient-drama text-primary-foreground font-semibold">
              {userInitial}
            </AvatarFallback>
          </Avatar>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
