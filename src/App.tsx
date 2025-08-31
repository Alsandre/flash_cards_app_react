import {useEffect} from "react";
import {AppRouter} from "./router/AppRouter";
import {useTheme, useSetTheme} from "./store/appStore";
import {initializeTheme} from "./store/uiSlice";
import {AppErrorBoundary} from "./components/layout/AppErrorBoundary";

// CCK import removed for production-ready master branch

function App() {
  const theme = useTheme();
  const setTheme = useSetTheme();

  useEffect(() => {
    const initialTheme = initializeTheme();
    setTheme(initialTheme);
  }, [setTheme]);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return (
    <AppErrorBoundary>
      <AppRouter />
    </AppErrorBoundary>
  );
}

export default App;
