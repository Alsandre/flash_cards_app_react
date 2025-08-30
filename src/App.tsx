import {useEffect} from "react";
import {AppRouter} from "./router/AppRouter";
import {useTheme, useSetTheme} from "./store/appStore";
import {initializeTheme} from "./store/uiSlice";

// Development-only CCK import
if (import.meta.env.DEV) {
  const cckModule = "@codevelop-technologies/cck/setup";
  import(/* @vite-ignore */ cckModule).catch(() => {
    // Silently fail if CCK is not available in production
  });
}

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

  return <AppRouter />;
}

export default App;
