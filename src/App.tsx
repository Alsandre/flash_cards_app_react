import {useEffect} from "react";
import {AppRouter} from "./router/AppRouter";
import {useAppDispatch, useAppSelector} from "./store/hooks";
import {selectTheme} from "./store/selectors/uiSelectors";
import {uiActions, initializeTheme} from "./store/slices/uiSlice";
import {AppErrorBoundary} from "./components/layout/AppErrorBoundary";

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

  return (
    <AppErrorBoundary>
      <AppRouter />
    </AppErrorBoundary>
  );
}

export default App;
