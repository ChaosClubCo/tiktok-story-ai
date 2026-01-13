import { useNavigate } from 'react-router-dom';
import { QuickActionCard } from './QuickActionCard';
import { TrendingUp, FileText, Zap, Workflow } from 'lucide-react';

interface QuickActionsGridProps {
  onNewScript: () => void;
}

const QUICK_ACTIONS = [
  {
    id: 'analytics',
    title: 'Analytics',
    description: 'View performance',
    icon: TrendingUp,
    path: '/analytics',
  },
  {
    id: 'templates',
    title: 'Templates',
    description: 'Browse library',
    icon: FileText,
    path: '/templates',
  },
  {
    id: 'scripts',
    title: 'My Scripts',
    description: 'Manage scripts',
    icon: Zap,
    path: '/my-scripts',
  },
] as const;

/**
 * QuickActionsGrid - Dashboard quick action cards
 */
export function QuickActionsGrid({ onNewScript }: QuickActionsGridProps) {
  const navigate = useNavigate();

  return (
    <div 
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4"
      role="list"
      aria-label="Quick actions"
    >
      {QUICK_ACTIONS.map((action) => (
        <QuickActionCard
          key={action.id}
          title={action.title}
          description={action.description}
          icon={action.icon}
          onClick={() => navigate(action.path)}
        />
      ))}
      <QuickActionCard
        title="New Script"
        description="Start creating"
        icon={Workflow}
        onClick={onNewScript}
      />
    </div>
  );
}
