import React from "react";
import {useAppSelector, useAppDispatch} from "../../store/hooks";
import {selectSyncStatusText, selectSyncStatus, selectSyncProgress, selectShouldShowSyncIndicator, selectPendingOperations, selectSyncError} from "../../store/selectors/syncSelectors";
import {syncActions, forceSync} from "../../store/slices/syncSlice";
import {Button} from "./Button";
import {LoadingSpinner} from "./LoadingSpinner";
import {ErrorAlert} from "../common/ErrorAlert";

interface SyncStatusProps {
  variant?: "header" | "compact" | "detailed";
  showRetry?: boolean;
  className?: string;
}

export const SyncStatus: React.FC<SyncStatusProps> = ({variant = "compact", showRetry = true, className = ""}) => {
  const dispatch = useAppDispatch();
  const statusText = useAppSelector(selectSyncStatusText);
  const status = useAppSelector(selectSyncStatus);
  const progress = useAppSelector(selectSyncProgress);
  const shouldShow = useAppSelector(selectShouldShowSyncIndicator);
  const pendingOps = useAppSelector(selectPendingOperations);
  const syncError = useAppSelector(selectSyncError);

  const handleRetry = () => {
    dispatch(syncActions.clearSyncError());
    dispatch(forceSync());
  };

  const handleClearError = () => {
    dispatch(syncActions.clearSyncError());
  };

  const getUserFriendlyErrorMessage = (error: string): {title: string; message: string} => {
    const errorLower = error.toLowerCase();

    if (errorLower.includes("network") || errorLower.includes("fetch") || errorLower.includes("connection")) {
      return {
        title: "Connection Problem",
        message: "Unable to connect to our servers. Please check your internet connection and try again.",
      };
    }

    if (errorLower.includes("timeout")) {
      return {
        title: "Request Timed Out",
        message: "The server is taking too long to respond. This might be a temporary issue.",
      };
    }

    if (errorLower.includes("auth") || errorLower.includes("unauthorized")) {
      return {
        title: "Authentication Issue",
        message: "There was a problem with your login session. Please try signing out and back in.",
      };
    }

    if (errorLower.includes("sync") || errorLower.includes("conflict")) {
      return {
        title: "Sync Conflict",
        message: "Your data couldn't be synced due to conflicts. Your local changes are safe.",
      };
    }

    // Default generic message
    return {
      title: "Sync Error",
      message: "Something went wrong while syncing your data. Your changes are saved locally.",
    };
  };

  if (!shouldShow && variant !== "detailed") {
    return null;
  }

  const getStatusColor = () => {
    if (!status.isOnline) return "text-neutral-500";
    if (status.hasError) return "text-error-600";
    if (status.isSyncing) return "text-primary-600";
    if (pendingOps > 0) return "text-warning-600";
    return "text-success-600";
  };

  const getStatusIcon = () => {
    if (!status.isOnline) {
      return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-12.728 12.728m0 0L5.636 5.636m12.728 12.728L18.364 18.364M5.636 5.636l12.728 12.728" />
        </svg>
      );
    }

    if (status.hasError) {
      return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }

    if (status.isSyncing) {
      return <LoadingSpinner size="sm" />;
    }

    if (pendingOps > 0) {
      return (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }

    return (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
      </svg>
    );
  };

  if (variant === "header") {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className={`${getStatusColor()}`}>{getStatusIcon()}</div>
        <span className={`text-sm ${getStatusColor()}`}>{statusText}</span>
        {status.hasError && showRetry && (
          <Button variant="ghost" size="sm" onClick={handleRetry} className="text-error-600 hover:text-error-700">
            Retry
          </Button>
        )}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className={`${getStatusColor()}`}>{getStatusIcon()}</div>
        <span className={`text-sm ${getStatusColor()}`}>{statusText}</span>
      </div>
    );
  }

  if (variant === "detailed") {
    return (
      <div className={`space-y-3 ${className}`}>
        {/* Status Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`${getStatusColor()}`}>{getStatusIcon()}</div>
            <span className={`font-medium ${getStatusColor()}`}>{statusText}</span>
          </div>

          {status.hasError && showRetry && (
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" onClick={handleClearError}>
                Dismiss
              </Button>
              <Button variant="secondary" size="sm" onClick={handleRetry}>
                Retry Sync
              </Button>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {status.isSyncing && progress.total > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-neutral-500">
              <span>Progress</span>
              <span>
                {progress.current}/{progress.total}
              </span>
            </div>
            <div className="h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div className="h-full bg-primary-500 transition-all duration-300" style={{width: `${(progress.current / progress.total) * 100}%`}} />
            </div>
          </div>
        )}

        {/* Error Details */}
        {status.hasError && syncError && <ErrorAlert {...getUserFriendlyErrorMessage(syncError)} type="error" onRetry={showRetry ? handleRetry : undefined} onDismiss={handleClearError} retryText="Retry Sync" showDetails={process.env.NODE_ENV === "development"} details={syncError} />}

        {/* Network Status */}
        <div className="flex items-center space-x-4 text-xs text-neutral-500">
          <div className="flex items-center space-x-1">
            <div className={`w-2 h-2 rounded-full ${status.isOnline ? "bg-success-500" : "bg-error-500"}`} />
            <span>{status.isOnline ? "Online" : "Offline"}</span>
          </div>

          {pendingOps > 0 && (
            <div className="flex items-center space-x-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{pendingOps} pending</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
};
