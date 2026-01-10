import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface GuestModeContextType {
  isGuest: boolean;
  guestId: string | null;
  enterGuestMode: () => void;
  exitGuestMode: () => void;
  guestStartTime: Date | null;
}

const GuestModeContext = createContext<GuestModeContextType | undefined>(undefined);

const GUEST_STORAGE_KEY = 'minidrama_guest_session';
const GUEST_EXPIRY_HOURS = 24;

interface GuestSession {
  guestId: string;
  startTime: string;
}

export function GuestModeProvider({ children }: { children: ReactNode }) {
  const [isGuest, setIsGuest] = useState(false);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [guestStartTime, setGuestStartTime] = useState<Date | null>(null);

  // Check for existing guest session on mount
  useEffect(() => {
    const storedSession = localStorage.getItem(GUEST_STORAGE_KEY);
    if (storedSession) {
      try {
        const session: GuestSession = JSON.parse(storedSession);
        const startTime = new Date(session.startTime);
        const now = new Date();
        const hoursDiff = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        
        // Check if session has expired
        if (hoursDiff < GUEST_EXPIRY_HOURS) {
          setIsGuest(true);
          setGuestId(session.guestId);
          setGuestStartTime(startTime);
        } else {
          // Session expired, clean up
          localStorage.removeItem(GUEST_STORAGE_KEY);
        }
      } catch {
        localStorage.removeItem(GUEST_STORAGE_KEY);
      }
    }
  }, []);

  const enterGuestMode = () => {
    const newGuestId = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const startTime = new Date();
    
    const session: GuestSession = {
      guestId: newGuestId,
      startTime: startTime.toISOString(),
    };
    
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(session));
    setIsGuest(true);
    setGuestId(newGuestId);
    setGuestStartTime(startTime);
  };

  const exitGuestMode = () => {
    localStorage.removeItem(GUEST_STORAGE_KEY);
    setIsGuest(false);
    setGuestId(null);
    setGuestStartTime(null);
  };

  return (
    <GuestModeContext.Provider value={{
      isGuest,
      guestId,
      enterGuestMode,
      exitGuestMode,
      guestStartTime,
    }}>
      {children}
    </GuestModeContext.Provider>
  );
}

export function useGuestMode() {
  const context = useContext(GuestModeContext);
  if (context === undefined) {
    throw new Error('useGuestMode must be used within a GuestModeProvider');
  }
  return context;
}

// List of features available to guests
export const GUEST_FEATURES = {
  viewTemplates: true,
  viewDashboard: true,
  generateScriptPreview: true,  // Limited preview only
  viewSeries: true,
  saveScripts: false,
  exportScripts: false,
  useAIFeatures: false,  // Limited
  accessSettings: false,
  createSeries: false,
  viewAnalytics: false,
  collaborateWithOthers: false,
};

// Check if a feature is available for guests
export function isFeatureAvailableForGuest(feature: keyof typeof GUEST_FEATURES): boolean {
  return GUEST_FEATURES[feature];
}
