import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  ListVideo,
  Gauge,
  Settings,
  User,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { PerformanceWidget } from '@/components/PerformanceWidget';

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
  { label: 'Performance', path: '/performance', icon: <Gauge className="h-4 w-4" /> },
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
          id="main-navigation"
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

        {/* Performance Widget & User Profile */}
        <div className="flex items-center gap-3">
          <PerformanceWidget />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
                <Avatar className="h-9 w-9 ring-2 ring-border/50 transition-all hover:ring-primary/50">
                  <AvatarFallback className="text-xs bg-gradient-drama text-primary-foreground font-semibold">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">Account</p>
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/my-scripts')}>
                <FileText className="mr-2 h-4 w-4" />
                <span>My Scripts</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
