import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

interface ProfileData {
  onboarding_completed: boolean;
  preferred_niche?: string;
  goals?: string[];
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  subscription: SubscriptionData | null;
  subscriptionLoading: boolean;
  profile: ProfileData | null;
  profileLoading: boolean;
  checkSubscription: () => Promise<void>;
  checkProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const checkSubscription = useCallback(async () => {
    if (!session) return;
    
    setSubscriptionLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      
      if (error) throw error;
      setSubscription(data);
    } catch (error) {
      console.error('Failed to check subscription:', error);
      setSubscription({ subscribed: false });
    } finally {
      setSubscriptionLoading(false);
    }
  }, [session]);

  const checkProfile = async () => {
    if (!user) return;
    
    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('onboarding_completed, preferred_niche, goals')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Failed to check profile:', error);
      setProfile({ onboarding_completed: false });
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Check subscription and profile when user logs in
        if (session?.user && event === 'SIGNED_IN') {
          setTimeout(() => {
            checkSubscription();
            checkProfile();
          }, 0);
        }
        
        // Clear data and remember me preference when user logs out
        if (!session) {
          setSubscription(null);
          setProfile(null);
        }
        
        // Handle token refresh for remember me sessions
        if (event === 'TOKEN_REFRESHED' && session) {
          const rememberMe = localStorage.getItem('minidrama_remember_me');
          if (!rememberMe) {
            // For non-remember sessions, check if session is older than 24 hours
            const sessionCreated = new Date(session.user.last_sign_in_at || session.user.created_at || '');
            const now = new Date();
            const hoursSinceSignIn = (now.getTime() - sessionCreated.getTime()) / (1000 * 60 * 60);
            
            // If more than 24 hours and not remember me, sign out
            if (hoursSinceSignIn > 24) {
              supabase.auth.signOut();
            }
          }
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Check remember me preference for existing sessions
      if (session?.user) {
        const rememberMe = localStorage.getItem('minidrama_remember_me');
        
        if (!rememberMe) {
          // For non-remember sessions, check if session is older than 24 hours
          const sessionCreated = new Date(session.user.last_sign_in_at || session.user.created_at || '');
          const now = new Date();
          const hoursSinceSignIn = (now.getTime() - sessionCreated.getTime()) / (1000 * 60 * 60);
          
          // If more than 24 hours and not remember me, sign out
          if (hoursSinceSignIn > 24) {
            supabase.auth.signOut();
            return;
          }
        }
        
        setTimeout(() => {
          checkSubscription();
          checkProfile();
        }, 0);
      }
    });

    return () => authSubscription.unsubscribe();
  }, [checkSubscription]);

  const signOut = async () => {
    // Clear remember me preference on sign out
    localStorage.removeItem('minidrama_remember_me');
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    subscription,
    subscriptionLoading,
    profile,
    profileLoading,
    checkSubscription,
    checkProfile,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};