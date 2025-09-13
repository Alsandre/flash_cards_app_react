import React, {Component} from "react";
import type {ReactNode} from "react";
import {Button, Card} from "../../ui";

interface Props {
  children: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ExploreErrorBoundary extends Component<Props, State> {
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
    console.error("Explore session error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // Log error to monitoring service in production
    if (import.meta.env.PROD) {
      // TODO: Send to error monitoring service
      console.error("Production error in explore session:", {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    }
  }

  handleReset = () => {
    this.setState({hasError: false, error: undefined, errorInfo: undefined});
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReturnToDashboard = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4">
          <Card className="max-w-md w-full text-center p-8">
            <div className="mb-6">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-error-100 dark:bg-error-900/20">
                <svg className="h-6 w-6 text-error-600 dark:text-error-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">Explore Session Error</h3>

            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">Something went wrong during your explore session. Your progress has been saved automatically.</p>

            {import.meta.env.DEV && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="text-sm text-neutral-500 dark:text-neutral-400 cursor-pointer hover:text-neutral-700 dark:hover:text-neutral-300">Error Details (Development)</summary>
                <div className="mt-2 p-3 bg-neutral-50 dark:bg-neutral-800 rounded text-xs font-mono text-neutral-700 dark:text-neutral-300 overflow-auto max-h-32">
                  <div className="font-semibold text-error-600 dark:text-error-400 mb-1">
                    {this.state.error.name}: {this.state.error.message}
                  </div>
                  <div className="whitespace-pre-wrap">{this.state.error.stack}</div>
                </div>
              </details>
            )}

            <div className="space-y-3">
              <Button onClick={this.handleReset} className="w-full">
                Try Again
              </Button>

              <Button variant="secondary" onClick={this.handleReturnToDashboard} className="w-full">
                Return to Dashboard
              </Button>
            </div>

            <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">If this problem persists, please refresh the page or restart the application.</p>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
