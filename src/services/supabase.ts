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
      // TODO: Implement Supabase-based backup
      // For now, backups are handled by Supabase directly
      return {success: true};
    } catch (error) {
      console.error("❌ Backup failed:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  static async getBackups(): Promise<{success: boolean; backups?: unknown[]; error?: string}> {
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

  static async restoreFromBackup(): Promise<{success: boolean; error?: string}> {
    try {
      // TODO: Implement Supabase-based restore
      // For now, data restoration is not needed as data lives in Supabase
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
