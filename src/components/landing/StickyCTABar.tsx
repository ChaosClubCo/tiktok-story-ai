import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface StickyCTABarProps {
  /** Scroll threshold in pixels before showing the bar */
  threshold?: number;
  /** CTA button text */
  ctaText?: string;
  /** Supporting text */
  supportText?: string;
}

/**
 * StickyCTABar - Appears when user scrolls past hero section
 * Fixed to bottom of viewport with CTA button
 */
export function StickyCTABar({ 
  threshold = 600,
  ctaText = "Start Free Trial",
  supportText = "No credit card required"
}: StickyCTABarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsVisible(scrollY > threshold && !isDismissed);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold, isDismissed]);

  const handleCTA = () => {
    navigate(user ? '/series/builder' : '/auth');
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  // Don't show for logged in users viewing the landing page
  if (user) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none"
        >
          <div className="container mx-auto max-w-4xl pointer-events-auto">
            <div className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-floating p-4 flex items-center justify-between gap-4">
              {/* Left side - Text */}
              <div className="hidden sm:block">
                <p className="font-semibold text-foreground">
                  Ready to build your content empire?
                </p>
                <p className="text-sm text-muted-foreground">
                  {supportText}
                </p>
              </div>

              {/* Mobile - Compact */}
              <p className="sm:hidden text-sm font-medium text-foreground">
                {supportText}
              </p>

              {/* Right side - CTA */}
              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleCTA}
                  size="lg"
                  className="shadow-glow whitespace-nowrap"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  {ctaText}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDismiss}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                  aria-label="Dismiss"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}