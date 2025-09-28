import React, {useState} from "react";
import {Link} from "react-router-dom";
import {Button, Card} from "../components/ui";
import {BackupService} from "../services/supabase";

export const Settings: React.FC = () => {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupStatus, setBackupStatus] = useState<{success: boolean; message: string} | null>(null);

  const handleBackup = async () => {
    setIsBackingUp(true);
    setBackupStatus(null);

    try {
      const result = await BackupService.backupData();

      if (result.success) {
        setBackupStatus({success: true, message: "Data backed up successfully!"});
      } else {
        setBackupStatus({success: false, message: result.error || "Backup failed"});
      }
    } catch (error) {
      setBackupStatus({success: false, message: "Backup failed: " + (error instanceof Error ? error.message : "Unknown error")});
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleGetBackups = async () => {
    try {
      const result = await BackupService.getBackups();
      if (result.success) {
        alert(`Found ${result.backups?.length || 0} backup(s).`);
      } else {
        alert("Failed to get backups: " + result.error);
      }
    } catch (error) {
      alert("Error: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-1 sm:px-0">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">Settings</h1>
          <Link to="/">
            <Button variant="secondary">Back to Dashboard</Button>
          </Link>
        </div>
      </div>

      {/* Backup Section */}
      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-neutral-100">Data Backup</h2>

        <div className="space-y-4">
          <p className="text-neutral-600 dark:text-neutral-400">Back up your flashcards, groups, and study progress to the cloud.</p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button onClick={handleBackup} disabled={isBackingUp} className="flex-1">
              {isBackingUp ? "Backing up..." : "Backup Data"}
            </Button>

            <Button onClick={handleGetBackups} variant="secondary" className="flex-1">
              View Backups
            </Button>
          </div>

          {backupStatus && <div className={`p-4 rounded-lg ${backupStatus.success ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200" : "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200"}`}>{backupStatus.message}</div>}
        </div>
      </Card>

      {/* Other Settings */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-neutral-100">App Settings</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-neutral-700 dark:text-neutral-300">Version</span>
            <span className="text-neutral-500 dark:text-neutral-400">1.0.0</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-neutral-700 dark:text-neutral-300">Storage</span>
            <span className="text-neutral-500 dark:text-neutral-400">Supabase Cloud</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
