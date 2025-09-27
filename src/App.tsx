import {useEffect} from "react";
import {AppRouter} from "./router/AppRouter";
import {useAppDispatch, useAppSelector} from "./store/hooks";
import {selectTheme} from "./store/selectors/uiSelectors";
import {uiActions, initializeTheme} from "./store/slices/uiSlice";
// import {syncActions, performBackgroundSync} from "./store/slices/syncSlice"; // Removed - no longer using sync
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
  // Removed network status tracking - no longer needed for Supabase-only architecture

  // Removed network retry function - no longer needed for Supabase-only architecture

  return (
    <AppErrorBoundary>
      <NetworkErrorBoundary
        onRetry={() => window.location.reload()}
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
