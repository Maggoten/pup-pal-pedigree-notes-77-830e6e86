import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateReminder, addReminder, deleteReminder as deleteReminderFromSupabase } from '@/services/RemindersService';
import { toast } from '@/components/ui/use-toast';
import { CustomReminderInput } from '@/types/reminders';

export const useReminderMutations = (user: any) => {
  const queryClient = useQueryClient();

  // Mutation for marking reminders complete
  const markCompleteReminderMutation = useMutation({
    mutationFn: async ({ id, isCompleted }: { id: string, isCompleted: boolean }) => {
      console.log(`[Reminders Provider] Marking reminder ${id} as ${isCompleted ? 'completed' : 'not completed'}`);
      
      // Only update custom reminders in database (those with UUIDs)
      if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)) {
        return await updateReminder(id, isCompleted);
      }
      // For system-generated reminders, we still return success but don't persist to DB
      return true;
    },
    onMutate: async ({ id, isCompleted }) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['reminders', user?.id] });
      
      // Snapshot the previous value
      const previousReminders = queryClient.getQueryData(['reminders', user?.id]);
      
      // Optimistically update the cache
      queryClient.setQueryData(['reminders', user?.id], (old: any[] = []) => 
        old.map(r => r.id === id ? {...r, isCompleted} : r)
      );
      
      return { previousReminders };
    },
    onError: (err, { id }, context) => {
      console.error("Error marking reminder complete:", err);
      // Rollback to the previous state
      if (context?.previousReminders) {
        queryClient.setQueryData(['reminders', user?.id], context.previousReminders);
      }
    },
    onSuccess: (result, { id, isCompleted }) => {
      console.log(`[Reminders Provider] Successfully marked reminder ${id} as ${isCompleted ? 'completed' : 'not completed'}`);
      
      // Keep the optimistic update in the query cache
      queryClient.setQueryData(['reminders', user?.id], (old: any[] = []) => 
        old.map(r => r.id === id ? {...r, isCompleted} : r)
      );
      
      toast({
        title: isCompleted ? "Reminder Completed" : "Reminder Reopened",
        description: isCompleted 
          ? "This task has been marked as completed."
          : "This task has been marked as not completed."
      });
    }
  });
  
  // Mutation for adding reminders
  const addCustomReminderMutation = useMutation({
    mutationFn: async (input: CustomReminderInput) => {
      if (!user) throw new Error("User authentication required");
      return await addReminder(input);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Reminder added successfully."
      });
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['reminders', user?.id] });
    },
    onError: (error) => {
      console.error("Error adding reminder:", error);
      toast({
        title: "Error",
        description: "Failed to add reminder. Please try again.",
        variant: "destructive"
      });
    }
  });
  
  // Mutation for deleting reminders
  const deleteReminderMutation = useMutation({
    mutationFn: async (id: string) => {
      // Only delete from database if it's a custom reminder (has UUID format)
      if (id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)) {
        return await deleteReminderFromSupabase(id);
      }
      return true;
    },
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['reminders', user?.id] });
      
      // Snapshot the previous value
      const previousReminders = queryClient.getQueryData(['reminders', user?.id]);
      
      // Optimistically update
      queryClient.setQueryData(['reminders', user?.id], (old: any[] = []) => 
        old.filter(r => r.id !== id)
      );
      
      return { previousReminders };
    },
    onError: (err, id, context) => {
      console.error("Error deleting reminder:", err);
      // Rollback on error
      if (context?.previousReminders) {
        queryClient.setQueryData(['reminders', user?.id], context.previousReminders);
      }
    },
    onSuccess: () => {
      toast({
        title: "Reminder Deleted",
        description: "The reminder has been deleted successfully."
      });
    }
  });
  
  // Functions to interface with mutations
  const handleMarkComplete = (id: string, currentReminders: any[]) => {
    const reminder = currentReminders.find(r => r.id === id);
    if (!reminder) return;
    
    markCompleteReminderMutation.mutate({ 
      id, 
      isCompleted: !reminder.isCompleted 
    });
  };
  
  const addCustomReminder = async (input: CustomReminderInput) => {
    try {
      await addCustomReminderMutation.mutateAsync(input);
      return true;
    } catch {
      return false;
    }
  };
  
  const deleteReminder = async (id: string) => {
    try {
      await deleteReminderMutation.mutateAsync(id);
      return true;
    } catch {
      return false;
    }
  };
  
  return {
    handleMarkComplete,
    addCustomReminder,
    deleteReminder
  };
};
