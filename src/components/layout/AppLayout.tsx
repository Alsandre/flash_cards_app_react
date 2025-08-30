import React from "react";
import {Outlet, Link, useLocation} from "react-router-dom";
import {useTheme, useSetTheme} from "../../store/appStore";
import {Button} from "../ui";

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const theme = useTheme();
  const setTheme = useSetTheme();

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 transition-colors duration-200">
      <header className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-card bg-primary-500 shadow-button group-hover:bg-primary-600 transition-colors duration-200">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span className="text-xl font-bold text-neutral-900 dark:text-neutral-100 hidden sm:block">Flashcards</span>
            </Link>

            <nav className="flex items-center space-x-1">
              <Link to="/" className={`px-2 py-2 text-sm font-medium rounded-button transition-colors duration-200 min-h-[44px] flex items-center sm:px-3 ${isActive("/") ? "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300" : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-700"}`}>
                <span className="hidden sm:inline">Dashboard</span>
                <span className="sm:hidden">Home</span>
              </Link>
              <Link
                to="/stats"
                className={`px-2 py-2 text-sm font-medium rounded-button transition-colors duration-200 min-h-[44px] flex items-center sm:px-3 ${isActive("/stats") ? "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300" : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-700"}`}
              >
                Stats
              </Link>
              <Link
                to="/settings"
                className={`px-2 py-2 text-sm font-medium rounded-button transition-colors duration-200 min-h-[44px] flex items-center sm:px-3 ${isActive("/settings") ? "bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300" : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-700"}`}
              >
                Settings
              </Link>

              <Button variant="ghost" size="sm" onClick={toggleTheme} className="ml-1 p-2 h-11 w-11 sm:ml-2" title={`Switch to ${theme === "light" ? "dark" : "light"} theme`}>
                {theme === "light" ? (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};
