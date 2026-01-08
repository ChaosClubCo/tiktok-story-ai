import { motion } from 'framer-motion';

const PLATFORMS = [
  { name: 'TikTok', logo: '📱' },
  { name: 'Instagram Reels', logo: '📸' },
  { name: 'YouTube Shorts', logo: '▶️' },
  { name: 'Snapchat', logo: '👻' },
];

const TRUST_POINTS = [
  '256-bit SSL Encryption',
  'GDPR Compliant',
  '99.9% Uptime',
  '24/7 Support',
];

/**
 * TrustBadgesSection - Platform logos and trust indicators
 * Builds credibility with platform compatibility and security badges
 */
export function TrustBadgesSection() {
  return (
    <section className="py-12 border-y border-border/30 bg-muted/20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col items-center"
        >
          {/* Platform Compatibility */}
          <div className="text-center mb-8">
            <p className="text-sm text-muted-foreground mb-4">
              Optimized for all major short-form platforms
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              {PLATFORMS.map((platform, index) => (
                <motion.div
                  key={platform.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <span className="text-xl">{platform.logo}</span>
                  <span className="text-sm font-medium">{platform.name}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
            {TRUST_POINTS.map((point, index) => (
              <motion.div
                key={point}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + index * 0.1 }}
                className="flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span>{point}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
