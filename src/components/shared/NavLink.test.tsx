import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { NavLink } from './NavLink';

const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('NavLink', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <NavLink to="/test">Test Link</NavLink>,
      { wrapper: RouterWrapper }
    );
    
    expect(getByText('Test Link')).toBeTruthy();
  });

  it('renders with icon when provided', () => {
    const TestIcon = () => <span data-testid="test-icon">Icon</span>;
    
    const { getByTestId, getByText } = render(
      <NavLink to="/test" icon={<TestIcon />}>
        With Icon
      </NavLink>,
      { wrapper: RouterWrapper }
    );
    
    expect(getByTestId('test-icon')).toBeTruthy();
    expect(getByText('With Icon')).toBeTruthy();
  });

  it('applies correct href attribute', () => {
    const { getByRole } = render(
      <NavLink to="/dashboard">Dashboard</NavLink>,
      { wrapper: RouterWrapper }
    );
    
    const link = getByRole('link');
    expect(link.getAttribute('href')).toBe('/dashboard');
  });
});
