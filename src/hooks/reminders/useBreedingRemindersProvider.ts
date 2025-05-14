
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
      
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session?.user) {
        throw new Error("No valid session");
      }
      
      const userId = sessionData.session.user.id;
      
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', userId)
        .eq('is_deleted', false)
        .order('due_date', { ascending: true });
      
      if (error) throw error;
      
      // Transform the data to match the Reminder interface
      const transformedReminders: Reminder[] = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        dueDate: item.due_date,
        priority: item.priority as 'high' | 'medium' | 'low',
        type: item.type,
        relatedId: item.related_id,
        isCompleted: item.is_completed,
        isDeleted: item.is_deleted,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));
      
      setReminders(transformedReminders);
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
            ? { ...reminder, isCompleted: true } 
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
    const incomplete = reminders.filter(r => !r.isCompleted).length;
    const upcoming = reminders.filter(r => 
      !r.isCompleted && 
      new Date(r.dueDate) > new Date() && 
      new Date(r.dueDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
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
