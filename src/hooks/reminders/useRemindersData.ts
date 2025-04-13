import { useState, useEffect } from 'react';
import { Reminder } from '@/types/reminders';
import { useAuth } from '@/hooks/useAuth';
import { 
  fetchReminders,
  fetchReminderStatuses,
  mapToReminder
} from '@/services/reminders';
import { useMigration } from './useMigration';
import { useDogs } from '@/context/DogsContext';
import { 
  generateDogReminders,
  generateLitterReminders,
  generateGeneralReminders
} from '@/services/reminders/generators';

export const useRemindersData = () => {
  const { dogs } = useDogs();
  const { isLoggedIn, user } = useAuth();
  const { migrationComplete, migrateIfNeeded } = useMigration();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loadingReminders, setLoadingReminders] = useState(true);

  const generateSupabaseSystemReminders = async (dogs: any[]): Promise<Reminder[]> => {
    if (!isLoggedIn || !user) {
      return [];
    }
    
    const dogReminders = generateDogReminders(dogs);
    const litterReminders = generateLitterReminders();
    const generalReminders = generateGeneralReminders(dogs);
    
    const systemReminders = [...dogReminders, ...litterReminders, ...generalReminders];
    
    const statusData = await fetchReminderStatuses();
    
    const deletedReminderIds = new Set(
      statusData
        .filter(status => status.is_deleted)
        .map(status => status.reminder_id)
    );
    
    const completedRemindersMap = new Map(
      statusData
        .filter(status => status.is_completed && !status.is_deleted)
        .map(status => [status.reminder_id, true])
    );
    
    return systemReminders
      .filter(reminder => !deletedReminderIds.has(reminder.id))
      .map(reminder => ({
        ...reminder,
        isCompleted: completedRemindersMap.has(reminder.id)
      }));
  };

  const loadRemindersData = async () => {
    if (!isLoggedIn || !user) {
      setLoadingReminders(false);
      return;
    }

    setLoadingReminders(true);
    
    try {
      const [reminderData, statusData] = await Promise.all([
        fetchReminders(),
        fetchReminderStatuses()
      ]);
      
      const statusMap = new Map();
      statusData.forEach(status => {
        statusMap.set(status.reminder_id, {
          isCompleted: status.is_completed,
          isDeleted: status.is_deleted
        });
      });
      
      const loadedReminders = reminderData
        .filter(reminder => !statusMap.get(reminder.id)?.isDeleted)
        .map(reminder => mapToReminder(
          reminder, 
          statusMap.get(reminder.id)?.isCompleted || false
        ));
      
      const systemReminders = await generateSupabaseSystemReminders(dogs);
      
      const allReminders = [...loadedReminders, ...systemReminders];
      
      const sortedReminders = [...allReminders].sort((a, b) => {
        if (a.isCompleted && !b.isCompleted) return 1;
        if (!a.isCompleted && b.isCompleted) return -1;
        
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
      
      setReminders(sortedReminders);
    } catch (error) {
      console.error("Error loading reminders:", error);
    } finally {
      setLoadingReminders(false);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      const migrated = await migrateIfNeeded();
      await loadRemindersData();
    };

    initialize();
  }, [isLoggedIn, user, dogs, migrationComplete]);

  return {
    reminders,
    loadingReminders,
    setReminders,
    loadRemindersData
  };
};
