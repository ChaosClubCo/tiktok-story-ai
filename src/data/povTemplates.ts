export interface POVTemplate {
  id: string;
  title: string;
  structure: string;
  niches: string[];
  examples: string[];
  sceneCount: number;
  hooks: number;
  icon: string;
}

export const POV_TEMPLATES: POVTemplate[] = [
  {
    id: 'pov_first_day',
    title: 'First Day Disaster',
    structure: "POV: It's your first day at [context] and [conflict]",
    niches: ['workplace', 'school', 'dating'],
    examples: [
      "POV: It's your first day at work and you accidentally reply-all to the CEO",
      "POV: It's your first day at school and you sit in the popular kid's seat"
    ],
    sceneCount: 4,
    hooks: 5,
    icon: '🆕'
  },
  {
    id: 'pov_caught',
    title: 'Caught in the Act',
    structure: "POV: You're [role] and you get caught [doing thing]",
    niches: ['comedy', 'relatable', 'drama'],
    examples: [
      "POV: You're stalking your crush's Instagram and accidentally like a post from 2019",
      "POV: You're pretending to work and your boss walks in"
    ],
    sceneCount: 3,
    hooks: 5,
    icon: '😱'
  },
  {
    id: 'pov_texting_wrong_person',
    title: 'Wrong Person Text',
    structure: "POV: You text [message] to [wrong person] instead of [intended person]",
    niches: ['comedy', 'dating', 'workplace'],
    examples: [
      "POV: You send a text complaining about your boss... to your boss",
      "POV: You send a spicy text to your mom instead of your partner"
    ],
    sceneCount: 3,
    hooks: 5,
    icon: '📱'
  },
  {
    id: 'pov_overheard',
    title: 'Overheard Conversation',
    structure: "POV: You overhear [person] talking about [you/secret] and [reaction]",
    niches: ['drama', 'workplace', 'school'],
    examples: [
      "POV: You overhear your coworkers planning a surprise party (or roasting you)",
      "POV: You hear your crush talking about you to their friends"
    ],
    sceneCount: 4,
    hooks: 5,
    icon: '👂'
  },
  {
    id: 'pov_fake_it',
    title: 'Fake It Till You Make It',
    structure: "POV: You lied about [skill/knowledge] and now you have to [prove it]",
    niches: ['comedy', 'workplace', 'dating'],
    examples: [
      "POV: You said you could cook on your dating profile and they're coming over",
      "POV: You lied about speaking French on your resume and they want you to translate"
    ],
    sceneCount: 4,
    hooks: 5,
    icon: '🎭'
  },
  {
    id: 'pov_unexpected_visitor',
    title: 'Unexpected Visitor',
    structure: "POV: [Person] shows up unexpectedly while you're [doing thing]",
    niches: ['comedy', 'relatable', 'dating'],
    examples: [
      "POV: Your ex shows up at your door while you're crying to their breakup playlist",
      "POV: Your parents arrive early and your place is a disaster"
    ],
    sceneCount: 3,
    hooks: 5,
    icon: '🚪'
  },
  {
    id: 'pov_group_chat_leak',
    title: 'Group Chat Exposed',
    structure: "POV: Someone accidentally adds [person] to the group chat where you [talk about them]",
    niches: ['drama', 'comedy', 'workplace'],
    examples: [
      "POV: Your friend adds your crush to the group chat where you've been thirsting over them",
      "POV: Someone adds the person you've been roasting to the group chat"
    ],
    sceneCount: 4,
    hooks: 5,
    icon: '💬'
  },
  {
    id: 'pov_mistaken_identity',
    title: 'Mistaken Identity',
    structure: "POV: Someone mistakes you for [person/role] and [situation escalates]",
    niches: ['comedy', 'chaos', 'relatable'],
    examples: [
      "POV: Someone thinks you work there and you just go with it",
      "POV: You're mistaken for a celebrity and play along"
    ],
    sceneCount: 4,
    hooks: 5,
    icon: '👤'
  },
  {
    id: 'pov_revenge',
    title: 'Petty Revenge',
    structure: "POV: [Person] wronged you and now you're getting [creative revenge]",
    niches: ['drama', 'comedy', 'relatable'],
    examples: [
      "POV: Your roommate ate your food so you're planning the perfect petty payback",
      "POV: Someone stole your parking spot and karma is about to hit"
    ],
    sceneCount: 4,
    hooks: 5,
    icon: '😈'
  },
  {
    id: 'pov_life_hack_fail',
    title: 'Life Hack Gone Wrong',
    structure: "POV: You tried [viral life hack] and [disaster happens]",
    niches: ['comedy', 'relatable', 'chaos'],
    examples: [
      "POV: You tried that viral cleaning hack and made everything worse",
      "POV: You followed a cooking hack from TikTok and nearly burned down your kitchen"
    ],
    sceneCount: 3,
    hooks: 5,
    icon: '🔥'
  },
  {
    id: 'pov_zoom_fail',
    title: 'Video Call Disaster',
    structure: "POV: You're on a [important call] and [embarrassing thing] happens",
    niches: ['workplace', 'school', 'comedy'],
    examples: [
      "POV: You're presenting to executives and your cat walks across the keyboard",
      "POV: You forget to mute on a work call and everyone hears you talking trash"
    ],
    sceneCount: 3,
    hooks: 5,
    icon: '💻'
  },
  {
    id: 'pov_secret_revealed',
    title: 'Secret Exposed',
    structure: "POV: Your [secret] gets exposed to [worst possible person]",
    niches: ['drama', 'comedy', 'chaos'],
    examples: [
      "POV: Your secret crush gets revealed in the worst way possible",
      "POV: Your embarrassing childhood nickname gets exposed at work"
    ],
    sceneCount: 4,
    hooks: 5,
    icon: '🤫'
  }
];

export const getTemplatesByNiche = (niche: string): POVTemplate[] => {
  return POV_TEMPLATES.filter(template => 
    template.niches.includes(niche.toLowerCase())
  );
};

export const getRandomTemplate = (): POVTemplate => {
  return POV_TEMPLATES[Math.floor(Math.random() * POV_TEMPLATES.length)];
};
