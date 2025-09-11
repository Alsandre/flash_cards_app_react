import {createClient} from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables. " + "For local development: Check your .env.local file. " + "For production: Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your deployment platform.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// Backup service
export class BackupService {
  private static getDeviceId(): string {
    // Generate or retrieve a unique device identifier
    let deviceId = localStorage.getItem("device_id");
    if (!deviceId) {
      deviceId = "device_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("device_id", deviceId);
    }
    return deviceId;
  }

  static async backupData(): Promise<{success: boolean; error?: string}> {
    try {
      // Get all data from IndexedDB
      const {db} = await import("./database");
      await db.open();

      const [groups, cards] = await Promise.all([db.groups.toArray(), db.cards.toArray()]);

      const backupData = {
        groups,
        cards,
        metadata: {
          timestamp: new Date().toISOString(),
          deviceId: this.getDeviceId(),
          version: "1.0",
        },
      };

      const fileName = `backup-${this.getDeviceId()}-${Date.now()}.json`;

      const {error} = await supabase.storage.from("flash_cards_backup").upload(fileName, JSON.stringify(backupData, null, 2), {
        contentType: "application/json",
        upsert: true,
      });

      if (error) {
        console.error("Supabase backup error:", error);
        return {success: false, error: error.message};
      }

      console.log("✅ Data backed up successfully:", fileName);
      return {success: true};
    } catch (error) {
      console.error("❌ Backup failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async getBackups(): Promise<{success: boolean; backups?: any[]; error?: string}> {
    try {
      const deviceId = this.getDeviceId();

      const {data, error} = await supabase.storage.from("flash_cards_backup").list("", {
        search: `backup-${deviceId}`,
      });

      if (error) {
        return {success: false, error: error.message};
      }

      return {success: true, backups: data || []};
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async restoreFromBackup(fileName: string): Promise<{success: boolean; error?: string}> {
    try {
      const {data, error} = await supabase.storage.from("flash_cards_backup").download(fileName);

      if (error) {
        return {success: false, error: error.message};
      }

      const backupText = await data.text();
      const backupData = JSON.parse(backupText);

      // Import data back to IndexedDB
      const {db} = await import("./database");
      await db.open();

      await db.transaction("rw", [db.groups, db.cards], async () => {
        // Clear existing data (optional - you might want to merge instead)
        await db.groups.clear();
        await db.cards.clear();

        // Restore data
        await db.groups.bulkAdd(backupData.groups);
        await db.cards.bulkAdd(backupData.cards);
      });

      console.log("✅ Data restored successfully from:", fileName);
      return {success: true};
    } catch (error) {
      console.error("❌ Restore failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
