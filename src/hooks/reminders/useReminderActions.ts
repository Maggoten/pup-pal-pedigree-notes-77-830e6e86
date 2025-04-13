
import { toast } from '@/components/ui/use-toast';
import { Reminder, CustomReminderInput } from '@/types/reminders';
import { useAuth } from '@/hooks/useAuth';
import { 
  updateReminderStatus,
  addCustomReminder as addCustomReminderToSupabase,
  deleteReminder as deleteReminderFromSupabase
} from '@/services/reminders';
import { createCalendarClockIcon } from '@/utils/iconUtils';

export const useReminderActions = (
  reminders: Reminder[],
  setReminders: React.Dispatch<React.SetStateAction<Reminder[]>>,
  reloadReminders: () => Promise<void>
) => {
  const { isLoggedIn } = useAuth();

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
      // Reload reminders to restore state if delete failed
      await reloadReminders();
      
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
    handleMarkComplete,
    addCustomReminder,
    deleteReminder
  };
};
