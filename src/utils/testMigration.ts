// Migration utilities temporarily disabled - migration logic needs to be recreated
// import {runDataMigration, loadBackupFromJSON} from "../store/migration/runMigration";

/**
 * Test function to run migration with backup data
 * This can be called from browser console or a temporary component
 *
 * TODO: Recreate migration logic for Redux migration
 */
export const testMigration = async () => {
  console.log("Migration utilities are being restructured for Redux migration");
  console.log("Use Redux store directly to load data for now");
  return false;
};

/**
 * Migration with actual backup file data
 * Pass your backup JSON data directly
 *
 * TODO: Implement Redux-compatible migration
 */
export const migrateFromBackup = async (backupJsonString: string) => {
  console.log("Migration from backup temporarily disabled");
  console.log("Migration logic being restructured for Redux");
  console.log("Backup data:", backupJsonString.length, "characters");
  return false;
};

// Make these available globally for easy testing
if (typeof window !== "undefined") {
  (window as any).testMigration = testMigration;
  (window as any).migrateFromBackup = migrateFromBackup;
}
