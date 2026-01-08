import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { SectionHeader } from './SectionHeader';
import { Button } from '@/components/ui/button';

describe('SectionHeader', () => {
  it('renders title correctly', () => {
    const { getByRole } = render(<SectionHeader title="Test Title" />);
    
    expect(getByRole('heading', { level: 2 }).textContent).toBe('Test Title');
  });

  it('renders description when provided', () => {
    const { getByText } = render(
      <SectionHeader 
        title="Title" 
        description="This is a description" 
      />
    );
    
    expect(getByText('This is a description')).toBeTruthy();
  });

  it('does not render description when not provided', () => {
    const { container } = render(<SectionHeader title="Title Only" />);
    
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs.length).toBe(0);
  });

  it('applies gradient class when specified', () => {
    const { getByRole } = render(<SectionHeader title="Gradient Title" gradient />);
    
    const heading = getByRole('heading');
    expect(heading.className).toContain('bg-gradient-drama');
  });

  it('renders action element when provided', () => {
    const { getByRole } = render(
      <SectionHeader 
        title="With Action" 
        action={<Button>Click Me</Button>}
      />
    );
    
    expect(getByRole('button')).toBeTruthy();
  });
});
