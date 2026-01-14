import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Lock, Sparkles, Save, BarChart3, Users, Zap } from 'lucide-react';
import { useGuestMode, GUEST_FEATURES } from '@/hooks/useGuestMode';

interface GuestRestrictionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: keyof typeof GUEST_FEATURES;
  featureLabel?: string;
}

const featureDetails: Record<keyof typeof GUEST_FEATURES, { icon: React.ElementType; title: string; description: string }> = {
  saveScripts: {
    icon: Save,
    title: 'Save Your Scripts',
    description: 'Create an account to save your scripts and access them from any device.',
  },
  exportScripts: {
    icon: Sparkles,
    title: 'Export Scripts',
    description: 'Sign up to export your scripts in various formats and share them with others.',
  },
  useAIFeatures: {
    icon: Zap,
    title: 'AI-Powered Features',
    description: 'Unlock advanced AI features including script optimization, viral prediction, and more.',
  },
  accessSettings: {
    icon: Lock,
    title: 'Account Settings',
    description: 'Create an account to customize your preferences and manage your profile.',
  },
  createSeries: {
    icon: Sparkles,
    title: 'Create Series',
    description: 'Sign up to create and manage your own script series with episode tracking.',
  },
  viewAnalytics: {
    icon: BarChart3,
    title: 'View Analytics',
    description: 'Get detailed analytics and insights about your scripts\' performance.',
  },
  collaborateWithOthers: {
    icon: Users,
    title: 'Collaborate',
    description: 'Work together with other creators on scripts and series.',
  },
  viewTemplates: {
    icon: Sparkles,
    title: 'View Templates',
    description: 'Access our library of script templates.',
  },
  viewDashboard: {
    icon: BarChart3,
    title: 'Dashboard',
    description: 'Access your personal dashboard.',
  },
  generateScriptPreview: {
    icon: Zap,
    title: 'Generate Scripts',
    description: 'Generate and preview scripts.',
  },
  viewSeries: {
    icon: Sparkles,
    title: 'View Series',
    description: 'Browse available series.',
  },
};

export function GuestRestrictionModal({
  open,
  onOpenChange,
  feature,
  featureLabel,
}: GuestRestrictionModalProps) {
  const navigate = useNavigate();
  const { exitGuestMode } = useGuestMode();

  const details = featureDetails[feature];
  const Icon = details?.icon || Lock;
  const title = featureLabel || details?.title || 'Premium Feature';
  const description = details?.description || 'Create a free account to access this feature.';

  const handleSignUp = () => {
    exitGuestMode();
    navigate('/auth');
    onOpenChange(false);
  };

  const handleContinueGuest = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription className="text-center pt-2">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          <div className="rounded-lg border bg-muted/50 p-4">
            <h4 className="font-medium mb-2 text-sm">Create a free account to unlock:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Save className="h-4 w-4 text-primary" />
                Save unlimited scripts
              </li>
              <li className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-primary" />
                Access AI-powered features
              </li>
              <li className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                View performance analytics
              </li>
              <li className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Collaborate with others
              </li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={handleSignUp} className="w-full">
            Create Free Account
          </Button>
          <Button variant="ghost" onClick={handleContinueGuest} className="w-full">
            Continue as Guest
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Hook for easy use of the restriction modal
import { useState, useCallback } from 'react';

export function useGuestRestriction() {
  const [restrictedFeature, setRestrictedFeature] = useState<keyof typeof GUEST_FEATURES | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { isGuest } = useGuestMode();

  const checkGuestAccess = useCallback(
    (feature: keyof typeof GUEST_FEATURES): boolean => {
      if (!isGuest) return true;
      
      if (!GUEST_FEATURES[feature]) {
        setRestrictedFeature(feature);
        setIsModalOpen(true);
        return false;
      }
      
      return true;
    },
    [isGuest]
  );

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setRestrictedFeature(null);
  }, []);

  return {
    isGuest,
    checkGuestAccess,
    restrictedFeature,
    isModalOpen,
    setIsModalOpen: (open: boolean) => {
      setIsModalOpen(open);
      if (!open) setRestrictedFeature(null);
    },
    closeModal,
  };
}
