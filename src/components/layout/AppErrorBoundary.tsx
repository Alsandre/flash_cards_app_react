import React, {Component, ReactNode} from "react";
import {Button, Card} from "../ui";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class AppErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {hasError: false};
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Application error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // Log error to monitoring service in production
    if (process.env.NODE_ENV === "production") {
      // TODO: Send to error monitoring service
      console.error("Production application error:", {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      });
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({hasError: false, error: undefined, errorInfo: undefined});
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-neutral-50 dark:bg-neutral-900">
          <Card className="max-w-lg w-full text-center p-8">
            <div className="mb-6">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-error-100 dark:bg-error-900/20">
                <svg className="h-8 w-8 text-error-600 dark:text-error-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">Oops! Something went wrong</h1>

            <p className="text-neutral-600 dark:text-neutral-400 mb-6">The application encountered an unexpected error. Don't worry - your data is safe and has been automatically saved.</p>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="text-sm text-neutral-500 dark:text-neutral-400 cursor-pointer hover:text-neutral-700 dark:hover:text-neutral-300 mb-2">🔧 Error Details (Development Mode)</summary>
                <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs font-mono text-neutral-700 dark:text-neutral-300 overflow-auto max-h-40">
                  <div className="font-semibold text-error-600 dark:text-error-400 mb-2">
                    {this.state.error.name}: {this.state.error.message}
                  </div>
                  <div className="whitespace-pre-wrap text-xs">{this.state.error.stack}</div>
                  {this.state.errorInfo && (
                    <div className="mt-3 pt-3 border-t border-neutral-300 dark:border-neutral-600">
                      <div className="font-semibold mb-1">Component Stack:</div>
                      <div className="whitespace-pre-wrap text-xs">{this.state.errorInfo.componentStack}</div>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="space-y-3">
              <Button onClick={this.handleReset} className="w-full">
                Try Again
              </Button>

              <Button variant="secondary" onClick={this.handleReload} className="w-full">
                Reload Application
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-700">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">If this problem continues, try clearing your browser cache or contact support.</p>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
