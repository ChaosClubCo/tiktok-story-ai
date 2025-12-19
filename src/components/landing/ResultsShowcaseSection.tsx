import { motion } from 'framer-motion';
import { ArrowRight, Clock, TrendingUp, DollarSign, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const BEFORE_AFTER_STATS = [
  {
    id: 1,
    metric: 'Followers',
    before: '500',
    after: '75,000',
    change: '+14,900%',
    timeframe: '4 months',
    icon: Users,
  },
  {
    id: 2,
    metric: 'Monthly Revenue',
    before: '$0',
    after: '$8,500',
    change: 'From zero',
    timeframe: '6 months',
    icon: DollarSign,
  },
  {
    id: 3,
    metric: 'Content Creation Time',
    before: '20 hrs/week',
    after: '3 hrs/week',
    change: '-85%',
    timeframe: 'Immediate',
    icon: Clock,
  },
  {
    id: 4,
    metric: 'Avg. Views per Video',
    before: '200',
    after: '45,000',
    change: '+22,400%',
    timeframe: '3 months',
    icon: TrendingUp,
  },
];

/**
 * ResultsShowcaseSection - Before/after metrics and case studies
 * Shows concrete outcomes to convince visitors
 */
export function ResultsShowcaseSection() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCTA = () => {
    navigate(user ? '/series/builder' : '/auth');
  };

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Real Results
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-3 mb-4">
            The Numbers Don't Lie
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Average results from creators who switched to MiniDrama for their content strategy.
          </p>
        </motion.div>

        {/* Before/After Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
          {BEFORE_AFTER_STATS.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full border-border/50 hover:shadow-elevated transition-all duration-300 overflow-hidden">
                <CardContent className="p-0">
                  {/* Header */}
                  <div className="p-4 bg-muted/30 border-b border-border/50">
                    <div className="flex items-center gap-2">
                      <stat.icon className="w-4 h-4 text-primary" />
                      <span className="font-medium text-sm">{stat.metric}</span>
                    </div>
                  </div>

                  {/* Before/After */}
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-4 mb-4">
                      <div className="text-center flex-1">
                        <div className="text-xs text-muted-foreground mb-1">Before</div>
                        <div className="text-lg font-semibold text-muted-foreground line-through decoration-red-500/50">
                          {stat.before}
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-primary shrink-0" />
                      <div className="text-center flex-1">
                        <div className="text-xs text-muted-foreground mb-1">After</div>
                        <div className="text-lg font-bold text-primary">
                          {stat.after}
                        </div>
                      </div>
                    </div>

                    {/* Change Badge */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-500 font-medium">
                        {stat.change}
                      </span>
                      <span className="text-muted-foreground">
                        in {stat.timeframe}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button 
            size="lg" 
            onClick={handleCTA}
            className="shadow-glow hover:shadow-glow hover:scale-105 transition-all"
          >
            Start Your Transformation
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            Free tier available. No credit card required.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
