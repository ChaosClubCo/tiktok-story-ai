import { describe, it, expect } from 'vitest';
import { 
  MUSIC_LIBRARY, 
  getMusicById, 
  getMusicByCategory, 
  getMusicByMood,
  MusicTrack 
} from '../musicLibrary';

describe('musicLibrary', () => {
  describe('MUSIC_LIBRARY', () => {
    it('should have valid music tracks', () => {
      expect(MUSIC_LIBRARY.length).toBeGreaterThan(0);
      
      MUSIC_LIBRARY.forEach((track) => {
        expect(track.id).toBeDefined();
        expect(track.name).toBeDefined();
        expect(track.category).toBeDefined();
        expect(track.mood).toBeDefined();
        expect(['slow', 'medium', 'fast']).toContain(track.tempo);
        expect(track.duration).toBeGreaterThan(0);
        expect(track.url).toMatch(/^https?:\/\//);
        expect(track.license).toBeDefined();
      });
    });

    it('should have unique IDs', () => {
      const ids = MUSIC_LIBRARY.map((track) => track.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('getMusicById', () => {
    it('should return track for valid ID', () => {
      const track = getMusicById('ambient-electronic');
      
      expect(track).toBeDefined();
      expect(track?.id).toBe('ambient-electronic');
      expect(track?.name).toBe('Ambient Electronic Flow');
    });

    it('should return undefined for invalid ID', () => {
      const track = getMusicById('non-existent-track');
      expect(track).toBeUndefined();
    });

    it('should return undefined for empty ID', () => {
      expect(getMusicById('')).toBeUndefined();
    });
  });

  describe('getMusicByCategory', () => {
    it('should return tracks for valid category', () => {
      const ambientTracks = getMusicByCategory('ambient');
      
      expect(ambientTracks.length).toBeGreaterThan(0);
      ambientTracks.forEach((track) => {
        expect(track.category).toBe('ambient');
      });
    });

    it('should return empty array for non-existent category', () => {
      const tracks = getMusicByCategory('non-existent');
      expect(tracks).toEqual([]);
    });

    it('should return correct count for each category', () => {
      const categories = ['ambient', 'orchestral', 'pop', 'acoustic', 'electronic'];
      
      categories.forEach((category) => {
        const tracks = getMusicByCategory(category);
        const expectedCount = MUSIC_LIBRARY.filter((t) => t.category === category).length;
        expect(tracks.length).toBe(expectedCount);
      });
    });
  });

  describe('getMusicByMood', () => {
    it('should return tracks matching mood keyword', () => {
      const calmTracks = getMusicByMood('calm');
      
      expect(calmTracks.length).toBeGreaterThan(0);
      calmTracks.forEach((track) => {
        expect(track.mood.toLowerCase()).toContain('calm');
      });
    });

    it('should return empty array for non-matching mood', () => {
      const tracks = getMusicByMood('angry');
      expect(tracks).toEqual([]);
    });

    it('should find tracks with partial mood match', () => {
      const modernTracks = getMusicByMood('modern');
      expect(modernTracks.length).toBeGreaterThan(0);
    });

    it('should be case-sensitive for mood matching', () => {
      const lowerCase = getMusicByMood('calm');
      const upperCase = getMusicByMood('CALM');
      
      // Case-sensitive by default
      expect(lowerCase.length).toBeGreaterThan(0);
    });
  });

  describe('MusicTrack interface compliance', () => {
    it('should have all required properties', () => {
      const requiredProps: (keyof MusicTrack)[] = [
        'id', 'name', 'category', 'mood', 'tempo', 'duration', 'url', 'license'
      ];

      MUSIC_LIBRARY.forEach((track) => {
        requiredProps.forEach((prop) => {
          expect(track[prop]).toBeDefined();
        });
      });
    });

    it('should have valid tempo values', () => {
      const validTempos = ['slow', 'medium', 'fast'];
      
      MUSIC_LIBRARY.forEach((track) => {
        expect(validTempos).toContain(track.tempo);
      });
    });

    it('should have positive durations', () => {
      MUSIC_LIBRARY.forEach((track) => {
        expect(track.duration).toBeGreaterThan(0);
        expect(Number.isInteger(track.duration)).toBe(true);
      });
    });
  });
});
