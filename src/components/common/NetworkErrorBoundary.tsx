import {Component, type ReactNode, type ErrorInfo} from "react";
import {Button, Card} from "../ui";

interface Props {
  children: ReactNode;
  onRetry?: () => void;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  className?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isRetrying: boolean;
}

export class NetworkErrorBoundary extends Component<Props, State> {
  private retryCount = 0;
  private maxRetries = 3;

  public state: State = {
    hasError: false,
    error: null,
    isRetrying: false,
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    // Only catch network-related errors
    if (error.message.includes("fetch") || error.message.includes("network") || error.message.includes("Failed to sync") || error.message.includes("Connection") || error.name === "NetworkError" || error.name === "TypeError") {
      return {
        hasError: true,
        error,
      };
    }

    // Re-throw non-network errors
    throw error;
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Network Error Boundary caught an error:", error, errorInfo);

    this.setState({error});
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = async () => {
    if (this.retryCount >= this.maxRetries) {
      console.warn("Max retry attempts reached");
      return;
    }

    this.setState({isRetrying: true});
    this.retryCount++;

    try {
      // Wait a bit before retrying
      await new Promise((resolve) => setTimeout(resolve, 1000 * this.retryCount));

      // Call custom retry handler if provided
      if (this.props.onRetry) {
        await this.props.onRetry();
      }

      // Reset error state
      this.setState({
        hasError: false,
        error: null,
        isRetrying: false,
      });
    } catch (error) {
      console.error("Retry failed:", error);
      this.setState({isRetrying: false});
    }
  };

  private handleReset = () => {
    this.retryCount = 0;
    this.setState({
      hasError: false,
      error: null,
      isRetrying: false,
    });
  };

  private isNetworkError = (error: Error): boolean => {
    return error.message.toLowerCase().includes("network") || error.message.toLowerCase().includes("fetch") || error.message.toLowerCase().includes("connection") || error.name === "NetworkError" || error.name === "TypeError";
  };

  public render() {
    if (this.state.hasError && this.state.error) {
      const isNetworkError = this.isNetworkError(this.state.error);

      return (
        <div className={`p-4 ${this.props.className || ""}`}>
          <Card className="border-warning-200 bg-warning-50 dark:border-warning-800 dark:bg-warning-900/20">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-warning-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-warning-800 dark:text-warning-200">{isNetworkError ? "Network Issue" : "Sync Error"}</h3>

                <p className="mt-1 text-sm text-warning-700 dark:text-warning-300">{isNetworkError ? "Unable to connect to the server. Please check your internet connection." : "There was a problem syncing your data. Your changes are saved locally."}</p>

                {/* Error details for development */}
                {process.env.NODE_ENV === "development" && (
                  <details className="mt-2">
                    <summary className="text-xs text-warning-600 dark:text-warning-400 cursor-pointer">Error Details</summary>
                    <pre className="mt-1 text-xs text-warning-600 dark:text-warning-400 whitespace-pre-wrap">{this.state.error.message}</pre>
                  </details>
                )}

                <div className="mt-3 flex space-x-2">
                  <Button variant="secondary" size="sm" onClick={this.handleRetry} disabled={this.state.isRetrying || this.retryCount >= this.maxRetries}>
                    {this.state.isRetrying ? "Retrying..." : this.retryCount >= this.maxRetries ? "Max Retries Reached" : `Retry (${this.retryCount}/${this.maxRetries})`}
                  </Button>

                  <Button variant="ghost" size="sm" onClick={this.handleReset}>
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
