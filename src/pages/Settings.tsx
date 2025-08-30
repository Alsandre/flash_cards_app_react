// Settings page - app configuration
import React from "react";
import {useTheme, useSetTheme} from "../store/appStore";

export const Settings: React.FC = () => {
  const theme = useTheme();
  const setTheme = useSetTheme();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Appearance</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Theme</label>
            <div className="flex space-x-4">
              <button onClick={() => setTheme("light")} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${theme === "light" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"}`}>
                Light
              </button>
              <button onClick={() => setTheme("dark")} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${theme === "dark" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"}`}>
                Dark
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Data Management</h2>
        <p className="text-gray-600 dark:text-gray-400">Data export/import and sync features will be implemented in Phase 2.</p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">This section will include options for backing up your flashcards, syncing with cloud storage, and managing your data.</p>
      </div>
    </div>
  );
};
