import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Shield, ChevronLeft } from 'lucide-react';
import { AdminNavItem } from './types';

interface AdminSidebarProps {
  items: AdminNavItem[];
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

/**
 * AdminSidebar - Collapsible sidebar with active state tracking
 * Highlights current route and supports badge indicators
 */
export function AdminSidebar({ items, collapsed = false, onToggleCollapse }: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside
      className={cn(
        'flex flex-col bg-background-elevated border-r border-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
      role="navigation"
      aria-label="Admin navigation"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center w-full')}>
          <Shield className="w-6 h-6 text-primary flex-shrink-0" aria-hidden="true" />
          {!collapsed && (
            <span className="font-bold text-lg">Admin</span>
          )}
        </div>
        {onToggleCollapse && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className={cn('h-8 w-8', collapsed && 'hidden')}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
          </Button>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                active
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                collapsed && 'justify-center px-2'
              )}
              aria-current={active ? 'page' : undefined}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Button
          variant="outline"
          size={collapsed ? 'icon' : 'default'}
          className="w-full"
          onClick={() => navigate('/')}
        >
          {collapsed ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            'Back to App'
          )}
        </Button>
      </div>
    </aside>
  );
}
