
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Reminder } from '@/types/reminders';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/use-toast';

export function useReminders() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const { user, isAuthReady } = useAuth();
  
  useEffect(() => {
    // Only fetch when auth is ready and we have a user
    if (!isAuthReady || !user?.id) return;
    
    const fetchReminders = async () => {
      setIsLoading(true);
      setHasError(false);
      
      try {
        const { data, error } = await supabase
          .from('reminders')
          .select('*')
          .eq('user_id', user.id)
          .order('due_date', { ascending: true });
        
        if (error) {
          console.error('Error loading reminders:', error);
          setHasError(true);
          toast({
            title: "Failed to load reminders",
            description: "Please try again later",
            variant: "destructive"
          });
        } else {
          // Transform database reminders to the app's Reminder type
          const appReminders: Reminder[] = (data || []).map(item => ({
            id: item.id,
            title: item.title,
            description: item.description,
            dueDate: new Date(item.due_date),
            priority: item.priority as 'high' | 'medium' | 'low',
            type: item.type as 'pregnancy' | 'litter' | 'breeding' | 'health' | 'heat' | 'vaccination' | 'birthday' | 'other',
            relatedId: item.related_id || undefined,
            isCompleted: item.is_completed || false,
          }));
          
          setReminders(appReminders);
          console.log(`Loaded ${appReminders.length} reminders from Supabase`);
        }
      } catch (error) {
        console.error('Unexpected error loading reminders:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReminders();
    
    // Set up a subscription for real-time updates to reminders
    const channel = supabase
      .channel('reminders-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'reminders', filter: `user_id=eq.${user.id}` },
        () => {
          console.log('Reminders changed, refreshing data');
          fetchReminders();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, isAuthReady]);
  
  const handleMarkComplete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .update({ is_completed: true })
        .eq('id', id);
      
      if (error) {
        console.error('Error marking reminder complete:', error);
        toast({
          title: "Failed to update reminder",
          description: "Please try again",
          variant: "destructive"
        });
        return;
      }
      
      // Update local state
      setReminders(prevReminders => 
        prevReminders.map(reminder => 
          reminder.id === id ? { ...reminder, isCompleted: true } : reminder
        )
      );
    } catch (error) {
      console.error('Unexpected error updating reminder:', error);
    }
  };
  
  return {
    reminders,
    isLoading,
    hasError,
    handleMarkComplete
  };
}
