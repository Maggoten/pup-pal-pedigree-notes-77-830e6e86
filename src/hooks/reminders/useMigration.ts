
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import { 
  loadCustomReminders,
  loadCompletedReminders,
  loadDeletedReminders
} from '@/utils/reminderStorage';
import { migrateLocalRemindersToSupabase } from '@/services/reminders';

export const useMigration = () => {
  const { isLoggedIn, user } = useAuth();
  const [migrationComplete, setMigrationComplete] = useState(false);
  const [migrationAttempted, setMigrationAttempted] = useState(false);

  useEffect(() => {
    const hasPerformedMigration = localStorage.getItem('remindersMigrated') === 'true';
    if (hasPerformedMigration) {
      setMigrationComplete(true);
      setMigrationAttempted(true);
    }
  }, []);

  const migrateIfNeeded = async () => {
    if (!isLoggedIn || !user || migrationComplete || migrationAttempted) {
      return false;
    }

    setMigrationAttempted(true);
    
    try {
      console.log("Starting reminders migration check...");
      
      const customReminders = loadCustomReminders();
      const completedReminders = loadCompletedReminders();
      const deletedReminderIds = loadDeletedReminders();
      
      console.log(`Found ${customReminders.length} custom reminders, ${completedReminders.size} completed statuses, and ${deletedReminderIds.size} deleted statuses`);
      
      if (customReminders.length > 0 || completedReminders.size > 0 || deletedReminderIds.size > 0) {
        console.log("Starting migration to Supabase...");
        
        const success = await migrateLocalRemindersToSupabase(
          customReminders,
          completedReminders,
          deletedReminderIds
        );
        
        if (success) {
          console.log("Migration successful, updating local state");
          localStorage.setItem('remindersMigrated', 'true');
          setMigrationComplete(true);
          
          toast({
            title: "Reminders Migrated",
            description: "Your reminders have been successfully migrated to your account."
          });
          
          return true;
        } else {
          console.error("Migration failed");
          return false;
        }
      } else {
        console.log("No local data to migrate, marking as complete");
        localStorage.setItem('remindersMigrated', 'true');
        setMigrationComplete(true);
        return true;
      }
    } catch (error) {
      console.error("Error during migration check:", error);
      return false;
    }
  };

  return {
    migrationComplete,
    migrateIfNeeded
  };
};
