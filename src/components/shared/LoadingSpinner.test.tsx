import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default message', () => {
    const { getByText } = render(<LoadingSpinner />);
    
    expect(getByText('Loading...')).toBeTruthy();
  });

  it('renders with custom message', () => {
    const { getByText } = render(<LoadingSpinner message="Please wait..." />);
    
    expect(getByText('Please wait...')).toBeTruthy();
  });

  it('applies correct size class for small size', () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    
    const spinner = container.querySelector('.animate-spin');
    expect(spinner?.className).toContain('h-4');
    expect(spinner?.className).toContain('w-4');
  });

  it('applies correct size class for medium size (default)', () => {
    const { container } = render(<LoadingSpinner />);
    
    const spinner = container.querySelector('.animate-spin');
    expect(spinner?.className).toContain('h-8');
    expect(spinner?.className).toContain('w-8');
  });

  it('applies correct size class for large size', () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    
    const spinner = container.querySelector('.animate-spin');
    expect(spinner?.className).toContain('h-12');
    expect(spinner?.className).toContain('w-12');
  });
});
