import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { usePageTitle } from '../usePageTitle';

describe('usePageTitle', () => {
  let originalTitle: string;

  beforeEach(() => {
    originalTitle = document.title;
  });

  afterEach(() => {
    document.title = originalTitle;
  });

  it('should set page title with app name suffix', () => {
    renderHook(() => usePageTitle('Dashboard'));
    expect(document.title).toBe('Dashboard | MiniDrama');
  });

  it('should set page title without app name when disabled', () => {
    renderHook(() => usePageTitle('Custom Title', false));
    expect(document.title).toBe('Custom Title');
  });

  it('should restore previous title on unmount', () => {
    document.title = 'Previous Title';
    
    const { unmount } = renderHook(() => usePageTitle('New Title'));
    expect(document.title).toBe('New Title | MiniDrama');
    
    unmount();
    expect(document.title).toBe('Previous Title');
  });

  it('should update title when title prop changes', () => {
    const { rerender } = renderHook(
      ({ title }) => usePageTitle(title),
      { initialProps: { title: 'Page 1' } }
    );
    
    expect(document.title).toBe('Page 1 | MiniDrama');
    
    rerender({ title: 'Page 2' });
    expect(document.title).toBe('Page 2 | MiniDrama');
  });

  it('should handle empty title', () => {
    renderHook(() => usePageTitle(''));
    expect(document.title).toBe(' | MiniDrama');
  });

  it('should handle special characters in title', () => {
    renderHook(() => usePageTitle('Script #1 & More'));
    expect(document.title).toBe('Script #1 & More | MiniDrama');
  });

  it('should handle unicode characters', () => {
    renderHook(() => usePageTitle('🎬 Video Editor'));
    expect(document.title).toBe('🎬 Video Editor | MiniDrama');
  });

  it('should update when includeAppName changes', () => {
    const { rerender } = renderHook(
      ({ title, includeAppName }) => usePageTitle(title, includeAppName),
      { initialProps: { title: 'Page', includeAppName: true } }
    );
    
    expect(document.title).toBe('Page | MiniDrama');
    
    rerender({ title: 'Page', includeAppName: false });
    expect(document.title).toBe('Page');
  });
});
