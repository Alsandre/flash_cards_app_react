import {Component, type ReactNode, type ErrorInfo} from "react";
import {Button, Card} from "../components/ui";

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

export class AuthErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Auth Error Boundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // Call the onError prop if provided
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 px-4">
          <Card className="w-full max-w-md p-6 space-y-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-error-100 dark:bg-error-900/20">
                <svg className="h-6 w-6 text-error-600 dark:text-error-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-neutral-100">Authentication Error</h3>

              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">Something went wrong with the authentication system. This could be due to network issues or a temporary service problem.</p>
            </div>

            {/* Error details for development */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="mt-4 p-3 bg-neutral-100 dark:bg-neutral-800 rounded-md">
                <details>
                  <summary className="text-sm font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer">Error Details</summary>
                  <div className="mt-2 text-xs text-neutral-600 dark:text-neutral-400 space-y-2">
                    <div>
                      <strong>Error:</strong> {this.state.error.message}
                    </div>
                    <div>
                      <strong>Stack:</strong>
                      <pre className="mt-1 whitespace-pre-wrap text-xs">{this.state.error.stack}</pre>
                    </div>
                  </div>
                </details>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex space-x-3 pt-4">
              <Button variant="secondary" onClick={this.handleRetry} className="flex-1">
                Try Again
              </Button>
              <Button variant="primary" onClick={this.handleReload} className="flex-1">
                Reload Page
              </Button>
            </div>

            {/* Help text */}
            <div className="text-center pt-2">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">If this problem persists, please check your internet connection or try again later.</p>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
