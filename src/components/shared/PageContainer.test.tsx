import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PageContainer } from './PageContainer';

describe('PageContainer', () => {
  it('renders children correctly', () => {
    const { getByTestId, getByText } = render(
      <PageContainer>
        <div data-testid="child">Child Content</div>
      </PageContainer>
    );
    
    expect(getByTestId('child')).toBeTruthy();
    expect(getByText('Child Content')).toBeTruthy();
  });

  it('applies default max-width class', () => {
    const { getByText } = render(
      <PageContainer>
        <span>Content</span>
      </PageContainer>
    );
    
    const container = getByText('Content').parentElement;
    expect(container?.className).toContain('max-w-7xl');
  });

  it('applies custom max-width class', () => {
    const { getByText } = render(
      <PageContainer maxWidth="sm">
        <span>Content</span>
      </PageContainer>
    );
    
    const container = getByText('Content').parentElement;
    expect(container?.className).toContain('max-w-3xl');
  });

  it('applies header offset when specified', () => {
    const { getByText } = render(
      <PageContainer withHeaderOffset>
        <span>Content</span>
      </PageContainer>
    );
    
    const container = getByText('Content').parentElement;
    expect(container?.className).toContain('pt-20');
  });
});
