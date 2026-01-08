import React, { Component, ErrorInfo, ReactNode } from 'react';
import { trackReactError } from '@/lib/errorTracking';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Track the error
    trackReactError(error, {
      componentStack: errorInfo.componentStack,
    });

    this.setState({ errorInfo });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Something went wrong
          </h2>
          
          <p className="text-muted-foreground mb-6 max-w-md">
            An unexpected error occurred. Our team has been notified and is working on a fix.
          </p>

          {import.meta.env.DEV && this.state.error && (
            <details className="mb-6 text-left w-full max-w-lg">
              <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                Error details (dev only)
              </summary>
              <div className="mt-2 p-4 bg-muted rounded-lg overflow-auto">
                <p className="text-sm font-mono text-destructive mb-2">
                  {this.state.error.message}
                </p>
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
                  {this.state.error.stack}
                </pre>
                {this.state.errorInfo?.componentStack && (
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap mt-4">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            </details>
          )}

          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={this.handleReset}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </Button>
            <Button onClick={this.handleReload}>
              Reload page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
