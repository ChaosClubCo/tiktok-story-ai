import { useEffect } from 'react';

const APP_NAME = 'MiniDrama';

/**
 * usePageTitle - Sets the document title with consistent branding
 * Automatically cleans up on unmount
 * 
 * @param title - Page-specific title
 * @param includeAppName - Whether to append app name (default: true)
 */
export function usePageTitle(title: string, includeAppName = true) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = includeAppName ? `${title} | ${APP_NAME}` : title;

    return () => {
      document.title = previousTitle;
    };
  }, [title, includeAppName]);
}
