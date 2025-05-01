
import { useCallback } from 'react';
import { CustomReminderInput } from '@/types/reminders';
import { addReminder } from '@/services/RemindersService';

export const useCustomReminderActions = (loadReminders: () => Promise<void>) => {
  // Add custom reminder
  const addCustomReminder = useCallback(async (input: CustomReminderInput) => {
    try {
      const success = await addReminder(input);
      
      if (success) {
        // Reload reminders to get the new one with its server-generated ID
        await loadReminders();
      }
      
      return success;
    } catch (error) {
      console.error("Error adding reminder:", error);
      return false;
    }
  }, [loadReminders]);
  
  return { addCustomReminder };
};
