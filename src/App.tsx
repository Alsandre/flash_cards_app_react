import {useEffect} from "react";
import {AppRouter} from "./router/AppRouter";
import {useSetTheme} from "./store/appStore";
import {initializeTheme} from "./store/uiSlice";

import "@codevelop-technologies/cck/setup";

function App() {
  const setTheme = useSetTheme();

  useEffect(() => {
    // Initialize theme from localStorage or system preference
    const initialTheme = initializeTheme();
    setTheme(initialTheme);
  }, [setTheme]);

  return <AppRouter />;
}

export default App;
