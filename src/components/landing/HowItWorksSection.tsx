import { motion } from 'framer-motion';
import { Palette, Sparkles, Rocket } from 'lucide-react';

const STEPS = [
  {
    step: 1,
    icon: Palette,
    title: 'Pick Your Niche',
    description: 'Choose from romance, thriller, comedy, drama, or mystery. Tell us your unique angle.',
    highlight: '15+ genres',
  },
  {
    step: 2,
    icon: Sparkles,
    title: 'Generate a Series',
    description: 'AI creates 5-10 connected episodes with viral hooks, cliffhangers, and share-worthy moments.',
    highlight: 'One click',
  },
  {
    step: 3,
    icon: Rocket,
    title: 'Post & Grow',
    description: 'Publish serialized content that keeps viewers coming back. Build an audience that waits for your next drop.',
    highlight: '10x faster',
  },
];

/**
 * HowItWorksSection - 3-step visual explanation of the product
 * Addresses confusion new visitors have about what the product does
 */
export function HowItWorksSection() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-3 mb-4">
            From Idea to Viral Series in{' '}
            <span className="bg-gradient-drama bg-clip-text text-transparent">3 Simple Steps</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            No more staring at blank screens. No more one-hit wonders. Build a content empire.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {STEPS.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative"
            >
              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
              )}

              <div className="bg-card border border-border/50 rounded-2xl p-6 relative hover:shadow-elevated transition-all duration-300 hover:-translate-y-1">
                {/* Step number badge */}
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-glow">
                  {step.step}
                </div>

                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <step.icon className="w-7 h-7 text-primary" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {step.description}
                </p>

                {/* Highlight badge */}
                <span className="inline-block px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                  {step.highlight}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
