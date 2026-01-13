import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SubscriptionTiersProps {
  currentTier?: string;
}

interface Tier {
  name: string;
  price: string;
  description: string;
  features: string[];
  popular: boolean;
  priceId: string | null;
}

const tiers: Tier[] = [
  {
    name: "Hobbyist",
    price: "Free",
    description: "Perfect for getting started",
    features: [
      "5 scripts per month",
      "Single-episode generation",
      "Basic templates",
      "Community support"
    ],
    popular: false,
    priceId: null
  },
  {
    name: "Creator",
    price: "$19",
    description: "Build your content library",
    features: [
      "Unlimited scripts",
      "Series generation (up to 5 episodes)",
      "Trend radar access",
      "Basic visual generation",
      "Priority support"
    ],
    popular: true,
    priceId: "creator"
  },
  {
    name: "Empire Builder",
    price: "$49",
    description: "Scale your content empire",
    features: [
      "Everything in Creator",
      "10-episode series",
      "Team collaboration (up to 5 members)",
      "Virality predictions",
      "Priority AI (faster generation)",
      "Custom POV templates"
    ],
    popular: false,
    priceId: "empire"
  },
  {
    name: "Studio",
    price: "$199",
    description: "Enterprise-grade content production",
    features: [
      "Everything in Empire Builder",
      "Unlimited team members",
      "White-label exports",
      "API access",
      "Dedicated account manager",
      "Custom AI training on your style"
    ],
    popular: false,
    priceId: "studio"
  }
];

export const SubscriptionTiers = ({ currentTier }: SubscriptionTiersProps) => {
  const [loading, setLoading] = useState<string | null>(null);
  const { session, subscription, checkSubscription } = useAuth();
  const { toast } = useToast();

  const handleSubscribe = async (tier: string) => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to subscribe",
        variant: "destructive",
      });
      return;
    }

    setLoading(tier);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { tier },
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
      
      // Refresh subscription status after a delay
      setTimeout(() => {
        checkSubscription();
      }, 3000);
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create checkout session",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    if (!session) return;

    setLoading("manage");
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (error) throw error;

      // Open customer portal in a new tab
      window.open(data.url, '_blank');
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to open customer portal",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-drama bg-clip-text text-transparent">
          Choose Your Growth Path
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          From hobbyist to empire builder. Scale at your own pace.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {tiers.map((tier) => {
          const isCurrentTier = currentTier === tier.name;
          const isSubscribed = subscription?.subscribed && isCurrentTier;
          
          return (
            <Card 
              key={tier.name} 
              className={`relative ${tier.popular ? 'border-primary ring-2 ring-primary/20' : ''} ${isCurrentTier ? 'bg-primary/5' : ''}`}
            >
              {tier.popular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              {isCurrentTier && (
                <Badge variant="secondary" className="absolute -top-2 right-4">
                  Your Plan
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
                <div className="text-4xl font-bold mt-4">
                  {tier.price}<span className="text-sm font-normal text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {isSubscribed ? (
                  <Button 
                    onClick={handleManageSubscription}
                    disabled={loading === "manage"}
                    className="w-full"
                    variant="outline"
                  >
                    {loading === "manage" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Manage Subscription
                  </Button>
                ) : tier.priceId === null ? (
                  <Button 
                    disabled
                    className="w-full"
                    variant="outline"
                  >
                    Current Plan
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handleSubscribe(tier.priceId!)}
                    disabled={loading === tier.name}
                    className="w-full"
                    variant={tier.popular ? "default" : "outline"}
                  >
                    {loading === tier.name && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Upgrade to {tier.name}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {subscription?.subscribed && (
        <div className="text-center mt-8">
          <p className="text-muted-foreground">
            Your {subscription.subscription_tier} subscription is active
            {subscription.subscription_end && (
              <> until {new Date(subscription.subscription_end).toLocaleDateString()}</>
            )}
          </p>
        </div>
      )}
    </div>
  );
};