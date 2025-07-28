import { useState, useEffect, createContext, useContext } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  subscription: SubscriptionData | null;
  subscriptionLoading: boolean;
  checkSubscription: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  const checkSubscription = async () => {
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
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Check subscription when user logs in
        if (session?.user && event === 'SIGNED_IN') {
          setTimeout(() => {
            checkSubscription();
          }, 0);
        }
        
        // Clear subscription when user logs out
        if (!session) {
          setSubscription(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Check subscription for existing session
      if (session?.user) {
        setTimeout(() => {
          checkSubscription();
        }, 0);
      }
    });

    return () => authSubscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    subscription,
    subscriptionLoading,
    checkSubscription,
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