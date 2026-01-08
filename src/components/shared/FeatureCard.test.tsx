import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { FeatureCard } from './FeatureCard';
import { Sparkles } from 'lucide-react';

describe('FeatureCard', () => {
  const defaultProps = {
    title: 'Test Feature',
    description: 'Test description text',
    icon: Sparkles,
  };

  it('renders title and description', () => {
    const { getByText } = render(<FeatureCard {...defaultProps} />);
    
    expect(getByText('Test Feature')).toBeTruthy();
    expect(getByText('Test description text')).toBeTruthy();
  });

  it('renders icon', () => {
    const { container } = render(<FeatureCard {...defaultProps} />);
    
    const icon = container.querySelector('svg');
    expect(icon).toBeTruthy();
  });

  it('handles click events when onClick is provided', () => {
    const handleClick = vi.fn();
    const { getByRole } = render(<FeatureCard {...defaultProps} onClick={handleClick} />);
    
    const card = getByRole('button');
    card.click();
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is not a button when onClick is not provided', () => {
    const { queryByRole } = render(<FeatureCard {...defaultProps} />);
    
    expect(queryByRole('button')).toBeNull();
  });
});
