import React from "react";
import {Button} from "../ui";

interface ErrorAlertProps {
  title: string;
  message: string;
  type?: "error" | "warning" | "info";
  onRetry?: () => void;
  onDismiss?: () => void;
  retryText?: string;
  isRetrying?: boolean;
  showDetails?: boolean;
  details?: string;
  className?: string;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({title, message, type = "error", onRetry, onDismiss, retryText = "Try Again", isRetrying = false, showDetails = false, details, className = ""}) => {
  const getTypeStyles = () => {
    switch (type) {
      case "warning":
        return {
          containerClass: "border-warning-200 bg-warning-50 dark:border-warning-800 dark:bg-warning-900/20",
          iconClass: "text-warning-500",
          titleClass: "text-warning-800 dark:text-warning-200",
          messageClass: "text-warning-700 dark:text-warning-300",
          detailsClass: "text-warning-600 dark:text-warning-400",
        };
      case "info":
        return {
          containerClass: "border-primary-200 bg-primary-50 dark:border-primary-800 dark:bg-primary-900/20",
          iconClass: "text-primary-500",
          titleClass: "text-primary-800 dark:text-primary-200",
          messageClass: "text-primary-700 dark:text-primary-300",
          detailsClass: "text-primary-600 dark:text-primary-400",
        };
      case "error":
      default:
        return {
          containerClass: "border-error-200 bg-error-50 dark:border-error-800 dark:bg-error-900/20",
          iconClass: "text-error-500",
          titleClass: "text-error-800 dark:text-error-200",
          messageClass: "text-error-700 dark:text-error-300",
          detailsClass: "text-error-600 dark:text-error-400",
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case "warning":
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "info":
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case "error":
      default:
        return (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const styles = getTypeStyles();

  return (
    <div className={`p-4 rounded-md border ${styles.containerClass} ${className}`}>
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 ${styles.iconClass} mt-0.5`}>{getIcon()}</div>

        <div className="flex-1 min-w-0">
          <h3 className={`text-sm font-medium ${styles.titleClass}`}>{title}</h3>

          <p className={`mt-1 text-sm ${styles.messageClass}`}>{message}</p>

          {showDetails && details && (
            <details className="mt-2">
              <summary className={`text-xs ${styles.detailsClass} cursor-pointer hover:underline`}>Technical Details</summary>
              <pre className={`mt-1 text-xs ${styles.detailsClass} whitespace-pre-wrap font-mono bg-black/5 dark:bg-white/5 p-2 rounded`}>{details}</pre>
            </details>
          )}

          {(onRetry || onDismiss) && (
            <div className="mt-3 flex space-x-2">
              {onRetry && (
                <Button variant="secondary" size="sm" onClick={onRetry} disabled={isRetrying}>
                  {isRetrying ? "Retrying..." : retryText}
                </Button>
              )}

              {onDismiss && (
                <Button variant="ghost" size="sm" onClick={onDismiss}>
                  Dismiss
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
