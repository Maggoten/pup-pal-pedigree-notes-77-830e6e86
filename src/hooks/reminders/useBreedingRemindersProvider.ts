
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Reminder } from '@/types/reminders';
import { toast } from '@/hooks/use-toast';

export const useBreedingRemindersProvider = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      setIsLoading(true);
      setHasError(false);
      
      const { data: session } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error("No valid session");
      }
      
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_deleted', false)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      
      setReminders(data || []);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      setHasError(true);
      toast({
        title: "Failed to load reminders",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkComplete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .update({ is_completed: true })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setReminders(prev => 
        prev.map(reminder => 
          reminder.id === id 
            ? { ...reminder, is_completed: true } 
            : reminder
        )
      );
      
      toast({
        title: "Reminder completed",
        description: "The reminder has been marked as complete",
      });
    } catch (error) {
      console.error('Error marking reminder complete:', error);
      toast({
        title: "Error",
        description: "Failed to update reminder status",
        variant: "destructive"
      });
    }
  };

  // Format reminders summary for the dashboard
  const remindersSummary = useMemo(() => {
    const incomplete = reminders.filter(r => !r.is_completed).length;
    const upcoming = reminders.filter(r => 
      !r.is_completed && 
      new Date(r.due_date) > new Date() && 
      new Date(r.due_date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    ).length;
    
    return {
      total: reminders.length,
      incomplete,
      upcoming
    };
  }, [reminders]);

  return {
    reminders,
    isLoading,
    hasError,
    handleMarkComplete,
    remindersSummary
  };
};
