import posthog from 'posthog-js';

export const initAnalytics = () => {
  if (typeof window !== 'undefined' && import.meta.env.VITE_POSTHOG_KEY) {
    posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
      api_host: 'https://app.posthog.com',
      loaded: (posthog) => {
        if (import.meta.env.DEV) posthog.debug();
      },
    });
  }
};

export const analytics = {
  track: (event: string, properties?: Record<string, any>) => {
    if (typeof window !== 'undefined' && import.meta.env.VITE_POSTHOG_KEY) {
      posthog.capture(event, properties);
    }
  },
  identify: (userId: string, traits?: Record<string, any>) => {
    if (typeof window !== 'undefined' && import.meta.env.VITE_POSTHOG_KEY) {
      posthog.identify(userId, traits);
    }
  },
  reset: () => {
    if (typeof window !== 'undefined' && import.meta.env.VITE_POSTHOG_KEY) {
      posthog.reset();
    }
  },
};
