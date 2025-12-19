import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface DemoVideoModalProps {
  trigger?: React.ReactNode;
}

/**
 * DemoVideoModal - Video walkthrough modal
 * Shows product demo video in a modal overlay
 */
export function DemoVideoModal({ trigger }: DemoVideoModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const defaultTrigger = (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative cursor-pointer group"
    >
      {/* Video Thumbnail */}
      <div className="relative aspect-video max-w-2xl mx-auto rounded-2xl overflow-hidden border border-border/50 shadow-elevated bg-card">
        {/* Placeholder gradient - replace with actual thumbnail */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
        
        {/* Overlay pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }} />

        {/* Content preview mockup */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full bg-primary/90 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-glow">
              <Play className="w-10 h-10 text-primary-foreground ml-1" />
            </div>
            <p className="text-lg font-semibold text-foreground">Watch Demo</p>
            <p className="text-sm text-muted-foreground">See MiniDrama in action (2 min)</p>
          </div>
        </div>

        {/* Decorative elements */}
        <motion.div 
          className="absolute top-4 right-4 w-32 h-24 bg-card/80 backdrop-blur-sm rounded-lg border border-border/50 p-2"
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <div className="h-2 w-16 bg-primary/30 rounded mb-1.5" />
          <div className="h-2 w-12 bg-muted rounded mb-1.5" />
          <div className="h-2 w-20 bg-muted rounded" />
        </motion.div>

        <motion.div 
          className="absolute bottom-4 left-4 w-28 h-20 bg-card/80 backdrop-blur-sm rounded-lg border border-border/50 p-2"
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
        >
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-3 h-3 rounded-full bg-green-500/50" />
            <div className="h-2 w-10 bg-muted rounded" />
          </div>
          <div className="h-8 w-full bg-gradient-to-r from-primary/30 to-secondary/30 rounded" />
        </motion.div>
      </div>

      {/* Badge */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
        <span className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-sm font-medium shadow-md">
          ✨ See the magic in 2 minutes
        </span>
      </div>
    </motion.div>
  );

  return (
    <>
      <div onClick={() => setIsOpen(true)}>
        {trigger || defaultTrigger}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background/95 backdrop-blur-md">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="text-xl">MiniDrama Demo Walkthrough</DialogTitle>
          </DialogHeader>
          
          <div className="aspect-video w-full bg-black relative">
            {/* Placeholder for video embed */}
            <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
              <div className="w-20 h-20 rounded-full bg-muted/20 flex items-center justify-center">
                <Play className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">
                Video demo coming soon
              </p>
              <p className="text-muted-foreground/60 text-xs">
                Embed your walkthrough video here
              </p>
            </div>
            
            {/* When you have a video, replace the above with:
            <iframe
              src="https://www.youtube.com/embed/YOUR_VIDEO_ID?autoplay=1"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            /> 
            */}
          </div>

          <div className="p-4 border-t border-border/50 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Ready to create your first viral series?
            </p>
            <Button onClick={() => setIsOpen(false)}>
              Get Started Free
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
