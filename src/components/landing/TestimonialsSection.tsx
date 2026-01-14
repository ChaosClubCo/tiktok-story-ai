import { motion } from 'framer-motion';
import { Star, Quote, TrendingUp, Users, DollarSign } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Sarah Chen',
    handle: '@SarahDramas',
    avatar: '',
    role: 'Romance Creator',
    platform: 'TikTok',
    verified: true,
    quote: "I went from posting random skits to running a drama empire. My 'Toxic Ex' series hit 2.3M views. Now I'm earning $12K/month from Creator Fund alone.",
    stats: {
      followers: '150K',
      growth: '+148K in 3 months',
      views: '2.3M',
    },
    rating: 5,
  },
  {
    id: 2,
    name: 'Mike Torres',
    handle: '@MysteryMike',
    avatar: '',
    role: 'Thriller Creator',
    platform: 'TikTok',
    verified: true,
    quote: "The viral predictor is scary accurate. It told me my Part 3 would underperform—I tweaked the hook and it became my most-shared episode ever.",
    stats: {
      followers: '89K',
      growth: '+67K in 2 months',
      views: '1.8M',
    },
    rating: 5,
  },
  {
    id: 3,
    name: 'Comedy Queens Team',
    handle: '@ComedyQueens',
    avatar: '',
    role: 'Creator Team',
    platform: 'Instagram',
    verified: true,
    quote: "We're a team of 3 writers. Before MiniDrama, coordinating was chaos. Now we publish 5 series per week, all staying on-brand. The collaboration tools are *chef's kiss*.",
    stats: {
      followers: '220K',
      growth: '+180K in 4 months',
      views: '5.2M',
    },
    rating: 5,
  },
];

const STATS = [
  { icon: Users, value: '30,000+', label: 'Active Creators' },
  { icon: TrendingUp, value: '1M+', label: 'Scripts Generated' },
  { icon: DollarSign, value: '$2.8K', label: 'Avg. Monthly Earnings' },
];

/**
 * TestimonialsSection - Creator testimonials with specific outcomes
 * Shows real results to build trust and credibility
 */
export function TestimonialsSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Creator Success Stories
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mt-3 mb-4">
            Join 30,000+ Creators{' '}
            <span className="bg-gradient-drama bg-clip-text text-transparent">Building Empires</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Real creators. Real results. See how they turned viral ideas into sustainable income.
          </p>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-3 gap-4 max-w-3xl mx-auto mb-16"
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center p-4 bg-card rounded-xl border border-border/50">
              <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
              <div className="text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Testimonial Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {TESTIMONIALS.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 border-border/50">
                <CardContent className="p-6">
                  {/* Quote Icon */}
                  <Quote className="w-8 h-8 text-primary/20 mb-4" />

                  {/* Quote Text */}
                  <p className="text-foreground/90 text-sm leading-relaxed mb-6">
                    "{testimonial.quote}"
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 mb-6 p-3 bg-muted/50 rounded-lg">
                    <div className="text-center">
                      <div className="text-sm font-bold text-primary">{testimonial.stats.followers}</div>
                      <div className="text-xs text-muted-foreground">Followers</div>
                    </div>
                    <div className="text-center border-x border-border/50">
                      <div className="text-sm font-bold text-green-500">{testimonial.stats.growth}</div>
                      <div className="text-xs text-muted-foreground">Growth</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-foreground">{testimonial.stats.views}</div>
                      <div className="text-xs text-muted-foreground">Views</div>
                    </div>
                  </div>

                  {/* Author */}
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border-2 border-primary/20">
                      <AvatarImage src={testimonial.avatar} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm truncate">{testimonial.name}</span>
                        {testimonial.verified && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0">
                            ✓
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{testimonial.handle}</div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {testimonial.platform}
                    </Badge>
                  </div>

                  {/* Rating */}
                  <div className="flex gap-0.5 mt-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
