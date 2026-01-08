// Script generation utilities and types

export interface ScriptScene {
  id: number;
  timeStamp: string;
  dialogue: string;
  action: string;
  visual: string;
  sound: string;
}

export interface GeneratedScript {
  title: string;
  hook: string;
  scenes: ScriptScene[];
  hashtags: string[];
}

type NicheKey = 'dating' | 'horror';

const SCRIPT_TEMPLATES: Record<NicheKey, GeneratedScript> = {
  dating: {
    title: 'Red Flag Restaurant Date',
    hook: 'POV: He takes you to a restaurant and does THIS... 🚩',
    scenes: [
      {
        id: 1,
        timeStamp: '0-7s',
        dialogue: 'So I thought this place looked fancy on Instagram...',
        action: 'Nervous fidgeting with menu',
        visual: 'Close-up of overpriced menu prices',
        sound: 'Awkward silence, cutlery clinking',
      },
      {
        id: 2,
        timeStamp: '8-15s',
        dialogue: "Actually, can we split the bill? I'm saving for crypto...",
        action: 'Pulls out phone to show crypto wallet',
        visual: 'Reaction shot - eyes widening',
        sound: 'Record scratch sound effect',
      },
      {
        id: 3,
        timeStamp: '16-23s',
        dialogue: "This is why I don't date anymore.",
        action: 'Gets up and leaves',
        visual: 'Walking away in slow motion',
        sound: 'Dramatic music builds',
      },
      {
        id: 4,
        timeStamp: '24-30s',
        dialogue: 'Ladies, the bar is in HELL.',
        action: 'Direct address to camera',
        visual: "Text overlay: 'THE BAR IS IN HELL'",
        sound: 'Viral TikTok audio clip',
      },
    ],
    hashtags: ['redflags', 'dating', 'storytime', 'toxic', 'fyp', 'viral', 'girlstalk'],
  },
  horror: {
    title: '3AM Doorbell Mystery',
    hook: 'Someone rang my doorbell at 3AM and what I saw will haunt you...',
    scenes: [
      {
        id: 1,
        timeStamp: '0-10s',
        dialogue: "It's 3:17 AM and someone just rang my doorbell...",
        action: 'Whispering, checking phone time',
        visual: 'Dark room, phone screen showing 3:17 AM',
        sound: 'Eerie doorbell echo',
      },
      {
        id: 2,
        timeStamp: '11-20s',
        dialogue: 'I look through the peephole and see...',
        action: 'Slowly approaching door',
        visual: 'POV walking to door, shaky camera',
        sound: 'Heartbeat, footsteps on creaky floor',
      },
      {
        id: 3,
        timeStamp: '21-30s',
        dialogue: 'NOTHING. But the doorbell keeps ringing.',
        action: 'Jumps back from door',
        visual: 'Peephole view of empty hallway',
        sound: 'Doorbell rings again, horror music sting',
      },
    ],
    hashtags: ['horror', 'scary', '3am', 'haunted', 'creepy', 'mystery', 'fyp'],
  },
};

/**
 * Generate a mock script based on niche
 * In production, this would call an AI API
 * 
 * @param niche - Content niche (dating, horror, etc.)
 * @param _length - Script length (unused in mock)
 * @param _tone - Script tone (unused in mock)
 * @param _topic - Trending topic (unused in mock)
 */
export function generateMockScript(
  niche: string,
  _length: string,
  _tone: string,
  _topic: string
): GeneratedScript {
  const nicheKey = niche as NicheKey;
  return SCRIPT_TEMPLATES[nicheKey] || SCRIPT_TEMPLATES.dating;
}
