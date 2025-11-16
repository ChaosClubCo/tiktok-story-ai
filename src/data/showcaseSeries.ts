export type ShowcaseSeries = {
  id: string;
  title: string;
  logline: string;
  episodes: number;
  metrics: {
    views: string;
    likes: string;
    completionRate: number;
  };
  tags?: string[];
  badge?: 'top' | 'trending';
  gradient: string;
};

export const showcaseSeries: ShowcaseSeries[] = [
  {
    id: 'toxic-dating-chronicles',
    title: 'The Toxic Dating Chronicles',
    logline: 'A series exposing the wildest red flags from real dating disasters',
    episodes: 12,
    metrics: {
      views: '2.4M',
      likes: '340K',
      completionRate: 87
    },
    tags: ['dating', 'storytime', 'drama'],
    badge: 'top',
    gradient: 'from-rose-500/20 to-pink-500/20'
  },
  {
    id: 'haunted-apartment',
    title: 'My Haunted Apartment',
    logline: 'Real paranormal experiences from a cursed studio apartment',
    episodes: 8,
    metrics: {
      views: '1.8M',
      likes: '280K',
      completionRate: 92
    },
    tags: ['horror', 'supernatural', 'scary'],
    badge: 'trending',
    gradient: 'from-purple-500/20 to-indigo-500/20'
  },
  {
    id: 'workplace-betrayal',
    title: 'Workplace Betrayal Files',
    logline: 'Office drama that turned coworkers into enemies',
    episodes: 10,
    metrics: {
      views: '1.5M',
      likes: '210K',
      completionRate: 79
    },
    tags: ['workplace', 'betrayal', 'drama'],
    gradient: 'from-blue-500/20 to-cyan-500/20'
  },
  {
    id: 'revenge-served-cold',
    title: 'Revenge Served Cold',
    logline: 'How I got back at my ex who cheated with my best friend',
    episodes: 7,
    metrics: {
      views: '3.1M',
      likes: '450K',
      completionRate: 94
    },
    tags: ['revenge', 'relationships', 'justice'],
    gradient: 'from-orange-500/20 to-red-500/20'
  },
  {
    id: 'gaslighting-roommate',
    title: 'My Gaslighting Roommate',
    logline: 'Living with a narcissist who made me question reality',
    episodes: 9,
    metrics: {
      views: '2.2M',
      likes: '320K',
      completionRate: 85
    },
    tags: ['toxic', 'roommate', 'psychological'],
    gradient: 'from-yellow-500/20 to-amber-500/20'
  },
  {
    id: 'family-secrets',
    title: 'Family Secrets Exposed',
    logline: 'DNA test results that destroyed everything I thought I knew',
    episodes: 11,
    metrics: {
      views: '2.9M',
      likes: '410K',
      completionRate: 91
    },
    tags: ['family', 'secrets', 'shocking'],
    badge: 'top',
    gradient: 'from-emerald-500/20 to-teal-500/20'
  },
  {
    id: 'catfish-nightmare',
    title: 'The Catfish Nightmare',
    logline: 'I dated someone online for 2 years before discovering the truth',
    episodes: 6,
    metrics: {
      views: '1.6M',
      likes: '240K',
      completionRate: 88
    },
    tags: ['catfish', 'online', 'deception'],
    gradient: 'from-violet-500/20 to-fuchsia-500/20'
  },
  {
    id: 'wedding-disaster',
    title: 'My Wedding Disaster Series',
    logline: 'Everything that could go wrong on my big day actually did',
    episodes: 8,
    metrics: {
      views: '2.7M',
      likes: '390K',
      completionRate: 86
    },
    tags: ['wedding', 'disaster', 'comedy'],
    badge: 'trending',
    gradient: 'from-pink-500/20 to-rose-500/20'
  },
  {
    id: 'influencer-exposed',
    title: 'Influencer Exposed',
    logline: 'Behind the scenes of fake perfection and bought followers',
    episodes: 10,
    metrics: {
      views: '3.5M',
      likes: '520K',
      completionRate: 89
    },
    tags: ['influencer', 'expose', 'reality'],
    gradient: 'from-sky-500/20 to-blue-500/20'
  }
];
