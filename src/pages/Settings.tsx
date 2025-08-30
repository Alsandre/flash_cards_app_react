import React from "react";
import {useTheme, useSetTheme} from "../store/appStore";
import {Button, Card} from "../components/ui";

export const Settings: React.FC = () => {
  const theme = useTheme();
  const setTheme = useSetTheme();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Settings</h1>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Appearance</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">Theme</label>
            <div className="flex space-x-4">
              <Button onClick={() => setTheme("light")} variant={theme === "light" ? "primary" : "secondary"} size="sm">
                Light
              </Button>
              <Button onClick={() => setTheme("dark")} variant={theme === "dark" ? "primary" : "secondary"} size="sm">
                Dark
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Data Management</h2>
        <p className="text-neutral-600 dark:text-neutral-400">Data export/import and sync features will be implemented in Phase 2.</p>
        <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-2">This section will include options for backing up your flashcards, syncing with cloud storage, and managing your data.</p>
      </Card>
    </div>
  );
};
