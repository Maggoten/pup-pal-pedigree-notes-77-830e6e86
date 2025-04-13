
import { useDogs } from '@/context/DogsContext';
import { toast } from '@/components/ui/use-toast';
import { useState, useEffect } from 'react';
import { Reminder, CustomReminderInput } from '@/types/reminders';
import { useAuth } from '@/hooks/useAuth';
import {
  fetchReminders,
  fetchReminderStatuses,
  addCustomReminder as addCustomReminderToSupabase,
  updateReminderStatus,
  deleteReminder as deleteReminderFromSupabase,
  migrateLocalRemindersToSupabase,
  mapToReminder
} from '@/services/reminders';
import {
  loadCustomReminders,
  loadCompletedReminders,
  loadDeletedReminders
} from '@/utils/reminderStorage';
import {
  generateDogReminders,
  generateLitterReminders,
  generateGeneralReminders
} from '@/services/SystemReminderGenerator';
import { createCalendarClockIcon } from '@/utils/iconUtils';

export type { Reminder, CustomReminderInput };

export const useBreedingReminders = () => {
  const { dogs } = useDogs();
  const { isLoggedIn, user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loadingReminders, setLoadingReminders] = useState(true);
  const [migrationComplete, setMigrationComplete] = useState(false);

  useEffect(() => {
    const hasPerformedMigration = localStorage.getItem('remindersMigrated') === 'true';
    if (hasPerformedMigration) {
      setMigrationComplete(true);
    }
  }, []);

  useEffect(() => {
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
            
            await loadRemindersData();
          }
        } else {
          localStorage.setItem('remindersMigrated', 'true');
          setMigrationComplete(true);
        }
      } catch (error) {
        console.error("Error migrating reminders:", error);
      }
    };

    loadRemindersData();
    migrateIfNeeded();
  }, [isLoggedIn, user, dogs, migrationComplete]);

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

  const handleMarkComplete = async (id: string) => {
    if (!isLoggedIn) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to manage reminders.",
        variant: "destructive"
      });
      return;
    }
    
    const reminderToToggle = reminders.find(r => r.id === id);
    if (!reminderToToggle) return;
    
    const newIsCompleted = !reminderToToggle.isCompleted;
    
    setReminders(prev => 
      prev.map(r => r.id === id ? { ...r, isCompleted: newIsCompleted } : r)
    );
    
    const success = await updateReminderStatus(id, newIsCompleted);
    
    if (!success) {
      setReminders(prev => 
        prev.map(r => r.id === id ? { ...r, isCompleted: !newIsCompleted } : r)
      );
      
      toast({
        title: "Update Failed",
        description: "Failed to update reminder status. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: newIsCompleted ? "Reminder Completed" : "Reminder Reopened",
      description: newIsCompleted 
        ? "This task has been marked as completed."
        : "This task has been marked as not completed."
    });
  };
  
  const addCustomReminder = async (input: CustomReminderInput) => {
    if (!isLoggedIn) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add reminders.",
        variant: "destructive"
      });
      return;
    }
    
    const newReminderId = await addCustomReminderToSupabase(input);
    
    if (!newReminderId) {
      toast({
        title: "Failed to Add Reminder",
        description: "There was an error adding your reminder. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    const newReminder: Reminder = {
      id: newReminderId,
      title: input.title,
      description: input.description,
      dueDate: input.dueDate,
      priority: input.priority,
      type: 'custom',
      icon: createCalendarClockIcon(
        input.priority === 'high' ? 'rose-500' : 
        input.priority === 'medium' ? 'amber-500' : 'green-500'
      )
    };
    
    setReminders(prev => [...prev, newReminder]);
    
    toast({
      title: "Reminder Added",
      description: "Your reminder has been added successfully."
    });
  };
  
  const deleteReminder = async (id: string) => {
    if (!isLoggedIn) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to delete reminders.",
        variant: "destructive"
      });
      return;
    }
    
    setReminders(prev => prev.filter(r => r.id !== id));
    
    const success = await deleteReminderFromSupabase(id);
    
    if (!success) {
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
      
      setReminders(loadedReminders);
      
      toast({
        title: "Delete Failed",
        description: "Failed to delete reminder. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Reminder Deleted",
      description: "The reminder has been deleted successfully."
    });
  };
  
  return {
    reminders,
    loadingReminders,
    handleMarkComplete,
    addCustomReminder,
    deleteReminder
  };
};
