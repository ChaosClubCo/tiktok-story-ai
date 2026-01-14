import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from './LoadingSpinner';

interface AuthRequiredProps {
  user: any;
  loading: boolean;
  children: ReactNode;
}

export function AuthRequired({ user, loading, children }: AuthRequiredProps) {
  const navigate = useNavigate();

  if (loading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Please sign in</h2>
          <Button onClick={() => navigate("/auth")}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
