import {useEffect} from "react";
import {AppRouter} from "./router/AppRouter";
import {useSetTheme} from "./store/appStore";
import {initializeTheme} from "./store/uiSlice";

import "@codevelop-technologies/cck/setup";

function App() {
  const setTheme = useSetTheme();

  useEffect(() => {
    const initialTheme = initializeTheme();
    setTheme(initialTheme);
  }, [setTheme]);

  return <AppRouter />;
}

export default App;
