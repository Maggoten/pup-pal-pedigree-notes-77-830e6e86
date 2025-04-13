
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

  useEffect(() => {
    const hasPerformedMigration = localStorage.getItem('remindersMigrated') === 'true';
    if (hasPerformedMigration) {
      setMigrationComplete(true);
    }
  }, []);

  const migrateIfNeeded = async () => {
    if (!isLoggedIn || !user || migrationComplete) {
      return;
    }

    try {
      const customReminders = loadCustomReminders();
      const completedReminders = loadCompletedReminders();
      const deletedReminderIds = loadDeletedReminders();
      
      if (customReminders.length > 0 || completedReminders.size > 0 || deletedReminderIds.size > 0) {
        const success = await migrateLocalRemindersToSupabase(
          customReminders,
          completedReminders,
          deletedReminderIds
        );
        
        if (success) {
          localStorage.setItem('remindersMigrated', 'true');
          setMigrationComplete(true);
          
          toast({
            title: "Reminders Migrated",
            description: "Your reminders have been successfully migrated to your account."
          });
          
          return true;
        }
      } else {
        localStorage.setItem('remindersMigrated', 'true');
        setMigrationComplete(true);
      }
    } catch (error) {
      console.error("Error migrating reminders:", error);
    }
    
    return false;
  };

  return {
    migrationComplete,
    migrateIfNeeded
  };
};
