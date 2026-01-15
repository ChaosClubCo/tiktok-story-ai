import { describe, it, expect } from 'vitest';
import { 
  VIDEO_TEMPLATES, 
  getTemplateById, 
  getTemplatesByCategory,
  VideoTemplate 
} from '../videoTemplates';

describe('videoTemplates', () => {
  describe('VIDEO_TEMPLATES', () => {
    it('should have valid templates', () => {
      expect(VIDEO_TEMPLATES.length).toBeGreaterThan(0);

      VIDEO_TEMPLATES.forEach((template) => {
        expect(template.id).toBeDefined();
        expect(template.name).toBeDefined();
        expect(template.description).toBeDefined();
        expect(template.category).toBeDefined();
        expect(template.settings).toBeDefined();
      });
    });

    it('should have unique IDs', () => {
      const ids = VIDEO_TEMPLATES.map((t) => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have valid categories', () => {
      const validCategories = ['educational', 'entertainment', 'documentary', 'promotional', 'social'];
      
      VIDEO_TEMPLATES.forEach((template) => {
        expect(validCategories).toContain(template.category);
      });
    });

    it('should have valid settings structure', () => {
      VIDEO_TEMPLATES.forEach((template) => {
        expect(template.settings.visualStyle).toBeDefined();
        expect(template.settings.colorGrading).toBeDefined();
        expect(template.settings.transitionType).toBeDefined();
        expect(template.settings.transitionDuration).toBeGreaterThan(0);
        expect(template.settings.aspectRatioRecommended).toBeDefined();
      });
    });
  });

  describe('getTemplateById', () => {
    it('should return template for valid ID', () => {
      const template = getTemplateById('modern-minimal');
      
      expect(template).toBeDefined();
      expect(template?.id).toBe('modern-minimal');
      expect(template?.name).toBe('Modern Minimal');
    });

    it('should return undefined for invalid ID', () => {
      expect(getTemplateById('non-existent')).toBeUndefined();
    });

    it('should return undefined for empty ID', () => {
      expect(getTemplateById('')).toBeUndefined();
    });

    it('should return correct template for all existing IDs', () => {
      VIDEO_TEMPLATES.forEach((expectedTemplate) => {
        const result = getTemplateById(expectedTemplate.id);
        expect(result).toEqual(expectedTemplate);
      });
    });
  });

  describe('getTemplatesByCategory', () => {
    it('should return templates for promotional category', () => {
      const templates = getTemplatesByCategory('promotional');
      
      expect(templates.length).toBeGreaterThan(0);
      templates.forEach((t) => {
        expect(t.category).toBe('promotional');
      });
    });

    it('should return templates for entertainment category', () => {
      const templates = getTemplatesByCategory('entertainment');
      
      expect(templates.length).toBeGreaterThan(0);
      templates.forEach((t) => {
        expect(t.category).toBe('entertainment');
      });
    });

    it('should return templates for educational category', () => {
      const templates = getTemplatesByCategory('educational');
      
      expect(templates.length).toBeGreaterThan(0);
      templates.forEach((t) => {
        expect(t.category).toBe('educational');
      });
    });

    it('should return templates for documentary category', () => {
      const templates = getTemplatesByCategory('documentary');
      
      expect(templates.length).toBeGreaterThan(0);
      templates.forEach((t) => {
        expect(t.category).toBe('documentary');
      });
    });

    it('should return templates for social category', () => {
      const templates = getTemplatesByCategory('social');
      
      expect(templates.length).toBeGreaterThan(0);
      templates.forEach((t) => {
        expect(t.category).toBe('social');
      });
    });

    it('should return correct count per category', () => {
      const categories: VideoTemplate['category'][] = ['educational', 'entertainment', 'documentary', 'promotional', 'social'];
      
      categories.forEach((category) => {
        const templates = getTemplatesByCategory(category);
        const expectedCount = VIDEO_TEMPLATES.filter((t) => t.category === category).length;
        expect(templates.length).toBe(expectedCount);
      });
    });
  });

  describe('Template settings validation', () => {
    it('should have valid transition types', () => {
      const validTransitions = ['fade', 'dissolve', 'wipe', 'zoom', 'slide'];
      
      VIDEO_TEMPLATES.forEach((template) => {
        expect(validTransitions).toContain(template.settings.transitionType);
      });
    });

    it('should have valid aspect ratios', () => {
      const validAspectRatios = ['9:16', '16:9', '1:1'];
      
      VIDEO_TEMPLATES.forEach((template) => {
        expect(validAspectRatios).toContain(template.settings.aspectRatioRecommended);
      });
    });

    it('should have positive transition durations', () => {
      VIDEO_TEMPLATES.forEach((template) => {
        expect(template.settings.transitionDuration).toBeGreaterThan(0);
        expect(template.settings.transitionDuration).toBeLessThanOrEqual(2);
      });
    });

    it('should have non-empty visual style and color grading', () => {
      VIDEO_TEMPLATES.forEach((template) => {
        expect(template.settings.visualStyle.length).toBeGreaterThan(0);
        expect(template.settings.colorGrading.length).toBeGreaterThan(0);
      });
    });
  });
});
