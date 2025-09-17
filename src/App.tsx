import {useEffect} from "react";
import {AppRouter} from "./router/AppRouter";
import {useAppDispatch, useAppSelector} from "./store/hooks";
import {selectTheme} from "./store/selectors/uiSelectors";
import {uiActions, initializeTheme} from "./store/slices/uiSlice";
import {syncActions, performBackgroundSync} from "./store/slices/syncSlice";
import {AppErrorBoundary} from "./components/layout/AppErrorBoundary";
import {NetworkErrorBoundary} from "./components/common/NetworkErrorBoundary";

// CCK import removed for production-ready master branch

function App() {
  const theme = useAppSelector(selectTheme);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initialTheme = initializeTheme();
    dispatch(uiActions.setTheme(initialTheme));
  }, [dispatch]);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      dispatch(syncActions.setNetworkStatus("online"));
    };

    const handleOffline = () => {
      dispatch(syncActions.setNetworkStatus("offline"));
    };

    // Set initial network status
    dispatch(syncActions.setNetworkStatus(navigator.onLine ? "online" : "offline"));

    // Listen for network changes
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [dispatch]);

  const handleNetworkRetry = async () => {
    // Trigger background sync when user retries after network error
    try {
      await dispatch(performBackgroundSync()).unwrap();
    } catch (error) {
      console.error("Network retry failed:", error);
      throw error; // Re-throw to let error boundary handle it
    }
  };

  return (
    <AppErrorBoundary>
      <NetworkErrorBoundary
        onRetry={handleNetworkRetry}
        onError={(error, errorInfo) => {
          console.error("Network Error in App:", error, errorInfo);
          // Could dispatch to Redux error tracking here
        }}
      >
        <AppRouter />
      </NetworkErrorBoundary>
    </AppErrorBoundary>
  );
}

export default App;
