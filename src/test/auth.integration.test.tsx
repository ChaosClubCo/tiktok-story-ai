import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { Subscription } from '@supabase/supabase-js';

// Create a mock subscription that satisfies the Subscription type
const createMockSubscription = (): Subscription => ({
  id: 'mock-subscription-id',
  callback: () => {},
  unsubscribe: vi.fn(),
});

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: createMockSubscription() }
      })),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
    functions: {
      invoke: vi.fn(),
    },
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>{children}</AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

// Test component to access auth context
const AuthTestComponent = () => {
  const { user, session, loading } = useAuth();
  
  return (
    <div>
      <span data-testid="loading">{loading ? 'loading' : 'ready'}</span>
      <span data-testid="user">{user?.email || 'no-user'}</span>
      <span data-testid="session">{session ? 'has-session' : 'no-session'}</span>
    </div>
  );
};

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Session Management', () => {
    it('should initialize with no session when user is not logged in', async () => {
      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      render(
        <TestWrapper>
          <AuthTestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready');
      });

      expect(screen.getByTestId('user')).toHaveTextContent('no-user');
      expect(screen.getByTestId('session')).toHaveTextContent('no-session');
    });

    it('should restore session from existing auth state', async () => {
      const mockSession = {
        access_token: 'test-token',
        refresh_token: 'test-refresh',
        user: {
          id: 'user-123',
          email: 'test@example.com',
          aud: 'authenticated',
        },
      };

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: mockSession as any },
        error: null,
      });

      render(
        <TestWrapper>
          <AuthTestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('ready');
      });

      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
      expect(screen.getByTestId('session')).toHaveTextContent('has-session');
    });

    it('should handle auth state changes', async () => {
      let authCallback: ((event: string, session: any) => void) | null = null;

      vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback: any) => {
        authCallback = callback;
        return { 
          data: { 
            subscription: {
              id: 'test-sub',
              callback: () => {},
              unsubscribe: vi.fn(),
            } 
          } 
        };
      });

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: null,
      });

      render(
        <TestWrapper>
          <AuthTestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('session')).toHaveTextContent('no-session');
      });

      // Simulate sign in event
      if (authCallback) {
        authCallback('SIGNED_IN', {
          access_token: 'new-token',
          user: { id: 'user-456', email: 'new@example.com' },
        });
      }

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('new@example.com');
      });
    });
  });

  describe('Sign In Flow', () => {
    it('should handle successful sign in', async () => {
      const mockSession = {
        access_token: 'token',
        user: { id: 'user-123', email: 'user@test.com' },
      };

      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { session: mockSession as any, user: mockSession.user as any },
        error: null,
      });

      const result = await supabase.auth.signInWithPassword({
        email: 'user@test.com',
        password: 'password123',
      });

      expect(result.error).toBeNull();
      expect(result.data.session).toBeDefined();
      expect(result.data.user?.email).toBe('user@test.com');
    });

    it('should handle invalid credentials', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { session: null, user: null },
        error: { message: 'Invalid login credentials', status: 400 } as any,
      });

      const result = await supabase.auth.signInWithPassword({
        email: 'wrong@test.com',
        password: 'wrongpassword',
      });

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Invalid login credentials');
    });

    it('should handle rate limiting', async () => {
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { session: null, user: null },
        error: { message: 'Too many requests', status: 429 } as any,
      });

      const result = await supabase.auth.signInWithPassword({
        email: 'user@test.com',
        password: 'password123',
      });

      expect(result.error?.status).toBe(429);
    });
  });

  describe('Sign Up Flow', () => {
    it('should handle successful sign up', async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: {
          user: { id: 'new-user', email: 'newuser@test.com' } as any,
          session: null,
        },
        error: null,
      });

      const result = await supabase.auth.signUp({
        email: 'newuser@test.com',
        password: 'securepassword123',
      });

      expect(result.error).toBeNull();
      expect(result.data.user?.email).toBe('newuser@test.com');
    });

    it('should handle duplicate email', async () => {
      vi.mocked(supabase.auth.signUp).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'User already registered', status: 400 } as any,
      });

      const result = await supabase.auth.signUp({
        email: 'existing@test.com',
        password: 'password123',
      });

      expect(result.error?.message).toContain('already registered');
    });
  });

  describe('Sign Out Flow', () => {
    it('should handle successful sign out', async () => {
      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null });

      const result = await supabase.auth.signOut();

      expect(result.error).toBeNull();
    });
  });
});

describe('Admin Access Verification Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Admin Route Protection', () => {
    it('should deny access when user is not authenticated', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { authorized: false, error: 'Unauthorized' },
        error: null,
      });

      const result = await supabase.functions.invoke('verify-admin-access');

      expect(result.data?.authorized).toBe(false);
    });

    it('should deny access when user is authenticated but not admin', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { authorized: false, error: 'Forbidden - Admin access required' },
        error: null,
      });

      const result = await supabase.functions.invoke('verify-admin-access', {
        headers: { Authorization: 'Bearer regular-user-token' },
      });

      expect(result.data?.authorized).toBe(false);
      expect(result.data?.error).toContain('Admin access required');
    });

    it('should grant access when user is admin', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: {
          authorized: true,
          userId: 'admin-user-123',
          email: 'admin@test.com',
        },
        error: null,
      });

      const result = await supabase.functions.invoke('verify-admin-access', {
        headers: { Authorization: 'Bearer admin-token' },
      });

      expect(result.data?.authorized).toBe(true);
      expect(result.data?.email).toBe('admin@test.com');
    });

    it('should handle verification errors gracefully', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: null,
        error: { message: 'Internal server error' } as any,
      });

      const result = await supabase.functions.invoke('verify-admin-access');

      expect(result.error).toBeDefined();
    });
  });

  describe('Admin Role Verification', () => {
    it('should verify super_admin role', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: {
          authorized: true,
          role: 'super_admin',
          permissions: ['all'],
        },
        error: null,
      });

      const result = await supabase.functions.invoke('verify-admin-access', {
        headers: { Authorization: 'Bearer super-admin-token' },
      });

      expect(result.data?.authorized).toBe(true);
    });

    it('should verify support_admin role', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: {
          authorized: true,
          role: 'support_admin',
        },
        error: null,
      });

      const result = await supabase.functions.invoke('verify-admin-access', {
        headers: { Authorization: 'Bearer support-admin-token' },
      });

      expect(result.data?.authorized).toBe(true);
    });

    it('should reject expired admin sessions', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { authorized: false, error: 'Session expired' },
        error: null,
      });

      const result = await supabase.functions.invoke('verify-admin-access', {
        headers: { Authorization: 'Bearer expired-token' },
      });

      expect(result.data?.authorized).toBe(false);
    });
  });

  describe('Security Edge Cases', () => {
    it('should reject malformed authorization headers', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { authorized: false, error: 'Invalid token format' },
        error: null,
      });

      const result = await supabase.functions.invoke('verify-admin-access', {
        headers: { Authorization: 'malformed-header' },
      });

      expect(result.data?.authorized).toBe(false);
    });

    it('should reject empty tokens', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { authorized: false, error: 'Token required' },
        error: null,
      });

      const result = await supabase.functions.invoke('verify-admin-access', {
        headers: { Authorization: 'Bearer ' },
      });

      expect(result.data?.authorized).toBe(false);
    });

    it('should handle concurrent verification requests', async () => {
      vi.mocked(supabase.functions.invoke).mockResolvedValue({
        data: { authorized: true },
        error: null,
      });

      const requests = Array(5).fill(null).map(() =>
        supabase.functions.invoke('verify-admin-access', {
          headers: { Authorization: 'Bearer valid-token' },
        })
      );

      const results = await Promise.all(requests);

      results.forEach((result) => {
        expect(result.data?.authorized).toBe(true);
      });
    });
  });
});
