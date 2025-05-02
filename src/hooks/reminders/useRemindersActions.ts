
import { toast } from '@/components/ui/use-toast';
import { Reminder, CustomReminderInput } from '@/types/reminders';
import { createCalendarClockIcon } from '@/utils/iconUtils';
import { 
  addReminder, 
  updateReminder, 
  deleteReminder as deleteReminderFromSupabase,
  fetchReminders
} from '@/services/RemindersService';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
import { generateDogReminders, generateLitterReminders, generateGeneralReminders } from '@/services/ReminderService';
import { useDogs } from '@/context/DogsContext';

export const useRemindersActions = (
  reminders: Reminder[],
  setReminders: React.Dispatch<React.SetStateAction<Reminder[]>>
) => {
  const { user } = useAuth();
  const { dogs } = useDogs();
  
  const handleMarkComplete = async (id: string) => {
    // Find the reminder in our list
    const reminder = reminders.find(r => r.id === id);
    if (!reminder) return;
    
    const newStatus = !reminder.isCompleted;
    
    // Optimistically update the UI
    setReminders(prev => prev.map(r => 
      r.id === id ? {...r, isCompleted: newStatus} : r
    ));
    
    // Update in Supabase if it's a custom reminder (uuid format)
    if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)) {
      const success = await updateReminder(id, newStatus);
      
      if (!success) {
        // Revert the change if the API call fails
        setReminders(prev => prev.map(r => 
          r.id === id ? {...r, isCompleted: !newStatus} : r
        ));
        return;
      }
    }
    
    toast({
      title: newStatus ? "Reminder Completed" : "Reminder Reopened",
      description: newStatus 
        ? "This task has been marked as completed."
        : "This task has been marked as not completed."
    });
  };
  
  const addCustomReminder = async (input: CustomReminderInput) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add reminders.",
        variant: "destructive"
      });
      return;
    }
    
    // Create a temporary reminder for optimistic UI update
    const tempId = `temp-${Date.now()}`;
    const newReminder: Reminder = {
      id: tempId,
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
    
    // Optimistically update UI
    setReminders(prev => [...prev, newReminder]);
    
    // Add to Supabase
    const success = await addReminder(input);
    
    if (!success) {
      // Revert the change if the API call fails
      setReminders(prev => prev.filter(r => r.id !== tempId));
    } else {
      // Refresh the data from the server to get the real ID
      await refreshReminderData();
    }
  };
  
  const deleteReminderHandler = async (id: string) => {
    // Optimistically update UI
    setReminders(prev => prev.filter(r => r.id !== id));
    
    // If it's a UUID format (custom reminder in DB), call the delete API
    if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)) {
      const success = await deleteReminderFromSupabase(id);
      
      if (!success) {
        // Fetch fresh data on error to restore state
        await refreshReminderData();
        return;
      }
    }
    
    toast({
      title: "Reminder Deleted",
      description: "The reminder has been deleted successfully."
    });
  };
  
  const refreshReminderData = async () => {
    if (!user) return;
    
    // Fetch fresh data
    const updatedReminders = await fetchReminders();
    
    const userDogs = dogs.filter(dog => dog.owner_id === user.id);
    
    // Generate reminders
    const dogReminders = generateDogReminders(userDogs);
    
    // Get litter reminders and await the Promise
    const litterReminders = await generateLitterReminders(user.id);
    
    // Generate general reminders
    const generalReminders = generateGeneralReminders(userDogs);
    
    // Combine all reminders
    setReminders([...updatedReminders, ...dogReminders, ...litterReminders, ...generalReminders]);
  };
  
  return {
    handleMarkComplete,
    addCustomReminder,
    deleteReminder: deleteReminderHandler,
    refreshReminderData
  };
};
