import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/useAuth';
import { useAdminRouteProtection } from '@/hooks/useAdminRouteProtection';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { 
          subscription: { 
            id: 'mock-sub',
            callback: () => {},
            unsubscribe: vi.fn() 
          } 
        }
      })),
    },
    functions: {
      invoke: vi.fn(),
    },
  },
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

// Test component using admin route protection
const ProtectedAdminPage = () => {
  const { isVerifying, isAuthorized } = useAdminRouteProtection('/');

  if (isVerifying) {
    return <div data-testid="verifying">Verifying...</div>;
  }

  if (!isAuthorized) {
    return <div data-testid="unauthorized">Unauthorized</div>;
  }

  return <div data-testid="admin-content">Admin Dashboard</div>;
};

const HomePage = () => <div data-testid="home">Home Page</div>;

const TestRouter = ({ initialRoute = '/admin' }: { initialRoute?: string }) => (
  <QueryClientProvider client={queryClient}>
    <MemoryRouter initialEntries={[initialRoute]}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<ProtectedAdminPage />} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  </QueryClientProvider>
);

describe('Admin Route Protection Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  describe('Unauthenticated Access', () => {
    it('should redirect to home when user has no session', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      render(<TestRouter />);

      // Should show verifying state first
      expect(screen.getByTestId('verifying')).toBeInTheDocument();

      // Should redirect (component won't show admin content)
      await waitFor(() => {
        // The hook will trigger navigation, but in test we verify it doesn't show admin content
        expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('Non-Admin User Access', () => {
    it('should redirect when authenticated user is not admin', async () => {
      const mockSession = {
        access_token: 'regular-user-token',
        user: { id: 'user-123', email: 'user@test.com' },
      };

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession as any },
        error: null,
      });

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { authorized: false, error: 'Forbidden' },
        error: null,
      });

      render(<TestRouter />);

      await waitFor(() => {
        expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('Admin User Access', () => {
    it('should show admin content when user is verified admin', async () => {
      const mockSession = {
        access_token: 'admin-token',
        user: { id: 'admin-123', email: 'admin@test.com' },
      };

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession as any },
        error: null,
      });

      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: {
          authorized: true,
          userId: 'admin-123',
          email: 'admin@test.com',
        },
        error: null,
      });

      render(<TestRouter />);

      await waitFor(() => {
        expect(screen.getByTestId('admin-content')).toBeInTheDocument();
      }, { timeout: 2000 });

      expect(screen.getByTestId('admin-content')).toHaveTextContent('Admin Dashboard');
    });
  });

  describe('Error Handling', () => {
    it('should handle verification function errors gracefully', async () => {
      const mockSession = {
        access_token: 'token',
        user: { id: 'user-123' },
      };

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession as any },
        error: null,
      });

      vi.mocked(supabase.functions.invoke).mockRejectedValue(
        new Error('Network error')
      );

      render(<TestRouter />);

      await waitFor(() => {
        expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should handle session fetch errors', async () => {
      vi.mocked(supabase.auth.getSession).mockRejectedValue(
        new Error('Session fetch failed')
      );

      render(<TestRouter />);

      await waitFor(() => {
        expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });

  describe('Loading States', () => {
    it('should show loading state during verification', async () => {
      const mockSession = {
        access_token: 'token',
        user: { id: 'user-123' },
      };

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession as any },
        error: null,
      });

      // Delay the response to test loading state
      vi.mocked(supabase.functions.invoke).mockImplementation(
        () => new Promise((resolve) => 
          setTimeout(() => resolve({ 
            data: { authorized: true }, 
            error: null 
          }), 100)
        )
      );

      render(<TestRouter />);

      // Should show verifying state
      expect(screen.getByTestId('verifying')).toBeInTheDocument();

      // Eventually show content
      await waitFor(() => {
        expect(screen.getByTestId('admin-content')).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });
});

describe('Admin Access Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle token expiration during page load', async () => {
    const mockSession = {
      access_token: 'expired-token',
      user: { id: 'user-123' },
    };

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession as any },
      error: null,
    });

    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: { authorized: false, error: 'Token expired' },
      error: null,
    });

    render(<TestRouter />);

    await waitFor(() => {
      expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
    });
  });

  it('should handle role demotion during active session', async () => {
    const mockSession = {
      access_token: 'token',
      user: { id: 'demoted-admin' },
    };

    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: mockSession as any },
      error: null,
    });

    // User was admin but role was revoked
    vi.mocked(supabase.functions.invoke).mockResolvedValue({
      data: { authorized: false, error: 'Role no longer valid' },
      error: null,
    });

    render(<TestRouter />);

    await waitFor(() => {
      expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
    });
  });
});
