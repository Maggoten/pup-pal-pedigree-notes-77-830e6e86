
import { useDogs } from '@/context/DogsContext';
import { toast } from '@/components/ui/use-toast';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { createCalendarClockIcon } from '@/utils/iconUtils';
import { Reminder, CustomReminderInput } from '@/types/reminders';
import { useAuth } from '@/hooks/useAuth';
import {
  fetchReminders,
  fetchReminderStatuses,
  addCustomReminder as addCustomReminderToSupabase,
  updateReminderStatus,
  deleteReminder as deleteReminderFromSupabase,
  migrateLocalRemindersToSupabase,
  mapToReminder,
  ReminderData
} from '@/services/ReminderSupabaseService';
import {
  loadCustomReminders,
  loadCompletedReminders,
  loadDeletedReminders
} from '@/utils/reminderStorage';
import {
  generateDogReminders,
  generateLitterReminders,
  generateGeneralReminders
} from '@/services/ReminderService';

export type { Reminder, CustomReminderInput };

export const useBreedingReminders = () => {
  const { dogs } = useDogs();
  const { isLoggedIn, user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loadingReminders, setLoadingReminders] = useState(true);
  const [migrationComplete, setMigrationComplete] = useState(false);

  // Check if user is authenticated and migration status
  useEffect(() => {
    const hasPerformedMigration = localStorage.getItem('remindersMigrated') === 'true';
    if (hasPerformedMigration) {
      setMigrationComplete(true);
    }
  }, []);

  // Load reminders from Supabase if user is logged in
  useEffect(() => {
    const loadRemindersData = async () => {
      if (!isLoggedIn || !user) {
        setLoadingReminders(false);
        return;
      }

      setLoadingReminders(true);
      
      try {
        // Fetch all reminders and statuses from Supabase
        const [reminderData, statusData] = await Promise.all([
          fetchReminders(),
          fetchReminderStatuses()
        ]);
        
        // Create a map of reminder statuses for quick lookup
        const statusMap = new Map();
        statusData.forEach(status => {
          statusMap.set(status.reminder_id, {
            isCompleted: status.is_completed,
            isDeleted: status.is_deleted
          });
        });
        
        // Filter out deleted reminders and map to Reminder type
        const loadedReminders = reminderData
          .filter(reminder => !statusMap.get(reminder.id)?.isDeleted)
          .map(reminder => mapToReminder(
            reminder, 
            statusMap.get(reminder.id)?.isCompleted || false
          ));
        
        // Generate system reminders if the user is logged in
        const systemReminders = await generateSupabaseSystemReminders(dogs);
        
        // Combine custom and system reminders
        const allReminders = [...loadedReminders, ...systemReminders];
        
        // Sort reminders by priority and completion status
        const sortedReminders = [...allReminders].sort((a, b) => {
          // First sort by completion status
          if (a.isCompleted && !b.isCompleted) return 1;
          if (!a.isCompleted && b.isCompleted) return -1;
          
          // Then sort by priority
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

    // Migrate local reminders if needed and user is logged in
    const migrateIfNeeded = async () => {
      if (!isLoggedIn || !user || migrationComplete) {
        return;
      }

      try {
        // Get local reminders data
        const customReminders = loadCustomReminders();
        const completedReminders = loadCompletedReminders();
        const deletedReminderIds = loadDeletedReminders();
        
        // Only migrate if there's data to migrate
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
            
            // Reload reminders after migration
            await loadRemindersData();
          }
        } else {
          // No data to migrate
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

  // Generate system reminders and store them in Supabase if needed
  const generateSupabaseSystemReminders = async (dogs: any[]): Promise<Reminder[]> => {
    if (!isLoggedIn || !user) {
      return [];
    }
    
    // Generate all system reminders
    const dogReminders = generateDogReminders(dogs);
    const litterReminders = generateLitterReminders();
    const generalReminders = generateGeneralReminders(dogs);
    
    // Combine all system-generated reminders
    const systemReminders = [...dogReminders, ...litterReminders, ...generalReminders];
    
    // Fetch existing reminder status to filter deleted ones
    const statusData = await fetchReminderStatuses();
    
    // Create a set of deleted reminder IDs
    const deletedReminderIds = new Set(
      statusData
        .filter(status => status.is_deleted)
        .map(status => status.reminder_id)
    );
    
    // Create a map of completed reminders
    const completedRemindersMap = new Map(
      statusData
        .filter(status => status.is_completed && !status.is_deleted)
        .map(status => [status.reminder_id, true])
    );
    
    // Filter out deleted reminders and add completion status
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
    
    // Find the reminder to toggle
    const reminderToToggle = reminders.find(r => r.id === id);
    if (!reminderToToggle) return;
    
    // Toggle the completion status
    const newIsCompleted = !reminderToToggle.isCompleted;
    
    // Optimistically update UI
    setReminders(prev => 
      prev.map(r => r.id === id ? { ...r, isCompleted: newIsCompleted } : r)
    );
    
    // Update in Supabase
    const success = await updateReminderStatus(id, newIsCompleted);
    
    if (!success) {
      // Revert on failure
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
    
    // Add to Supabase
    const newReminderId = await addCustomReminderToSupabase(input);
    
    if (!newReminderId) {
      toast({
        title: "Failed to Add Reminder",
        description: "There was an error adding your reminder. Please try again.",
        variant: "destructive"
      });
      return;
    }
    
    // Create reminder object for local state
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
    
    // Update local state
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
    
    // Optimistically update UI
    setReminders(prev => prev.filter(r => r.id !== id));
    
    // Delete from Supabase
    const success = await deleteReminderFromSupabase(id);
    
    if (!success) {
      // Fetch fresh data if deletion failed
      const [reminderData, statusData] = await Promise.all([
        fetchReminders(),
        fetchReminderStatuses()
      ]);
      
      // Re-process the data as before
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
