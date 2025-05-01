
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

/**
 * Service to clean up stray/orphaned data from the database and local storage
 */

/**
 * Cleanup orphaned calendar events from the database
 * This removes events related to dogs that no longer exist
 */
export const cleanupOrphanedCalendarEvents = async (): Promise<boolean> => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData?.session) {
      console.error('No active session:', sessionError);
      return false;
    }
    
    // Get all dog IDs in the system for the current user
    const { data: dogs, error: dogError } = await supabase
      .from('dogs')
      .select('id');
      
    if (dogError) {
      console.error("Error fetching dogs:", dogError);
      return false;
    }
    
    // Create an array of valid dog IDs
    const validDogIds = dogs?.map(dog => dog.id) || [];
    
    console.log('Cleaning up orphaned calendar events. Valid dog IDs:', validDogIds);
    
    // Find events with dog_id values that don't match any existing dog
    // This includes both missing dogs and potentially malformed IDs
    const { data: orphanedEvents, error: eventsError } = await supabase
      .from('calendar_events')
      .select('*')
      .not('dog_id', 'is', null)
      .filter('type', 'in', '("custom","heat","mating","due-date")');
    
    if (eventsError) {
      console.error("Error fetching calendar events:", eventsError);
      return false;
    }
    
    if (!orphanedEvents || orphanedEvents.length === 0) {
      console.log('No orphaned calendar events found');
      toast({
        title: "Calendar Cleanup",
        description: "No orphaned calendar events found to clean up.",
      });
      return true;
    }
    
    console.log('Found potential orphaned events:', orphanedEvents);
    
    // Filter for truly orphaned events (dog_id doesn't match any valid dog)
    const eventsToDelete = orphanedEvents.filter(event => {
      return event.dog_id && !validDogIds.includes(event.dog_id);
    });
    
    if (eventsToDelete.length === 0) {
      console.log('No orphaned events to delete after validation');
      toast({
        title: "Calendar Cleanup",
        description: "No orphaned calendar events found to clean up.",
      });
      return true;
    }
    
    console.log(`Deleting ${eventsToDelete.length} orphaned events:`, eventsToDelete);
    
    // Delete the orphaned events
    const idsToDelete = eventsToDelete.map(event => event.id);
    const { error: deleteError } = await supabase
      .from('calendar_events')
      .delete()
      .in('id', idsToDelete);
    
    if (deleteError) {
      console.error("Error deleting orphaned events:", deleteError);
      toast({
        title: "Cleanup Error",
        description: "Failed to delete orphaned calendar events. Please try again.",
        variant: "destructive"
      });
      return false;
    }
    
    // Also clear local storage of any old calendar events
    localStorage.removeItem('breedingCalendarEvents');
    
    toast({
      title: "Calendar Cleaned",
      description: `Successfully removed ${eventsToDelete.length} orphaned calendar events.`,
    });
    
    return true;
  } catch (error) {
    console.error("Error in cleanupOrphanedCalendarEvents:", error);
    toast({
      title: "Cleanup Error",
      description: "An unexpected error occurred during cleanup.",
      variant: "destructive"
    });
    return false;
  }
};

/**
 * Clean up any orphaned reminders from the database
 * This removes reminders related to dogs or litters that no longer exist
 */
export const cleanupOrphanedReminders = async (): Promise<boolean> => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData?.session) {
      console.error('No active session:', sessionError);
      return false;
    }
    
    // Get all valid IDs for dogs and litters
    const { data: dogs, error: dogError } = await supabase
      .from('dogs')
      .select('id');
      
    const { data: litters, error: litterError } = await supabase
      .from('litters')
      .select('id');
    
    if (dogError) {
      console.error("Error fetching dogs:", dogError);
      return false;
    }
    
    if (litterError) {
      console.error("Error fetching litters:", litterError);
      return false;
    }
    
    // Create arrays of valid IDs
    const validDogIds = dogs?.map(dog => dog.id) || [];
    const validLitterIds = litters?.map(litter => litter.id) || [];
    
    // Find reminders with related_id values that don't match any existing entity
    const { data: orphanedReminders, error: remindersError } = await supabase
      .from('reminders')
      .select('*')
      .not('related_id', 'is', null);
    
    if (remindersError) {
      console.error("Error fetching reminders:", remindersError);
      return false;
    }
    
    if (!orphanedReminders || orphanedReminders.length === 0) {
      console.log('No orphaned reminders found');
      toast({
        title: "Reminders Cleanup",
        description: "No orphaned reminders found to clean up.",
      });
      return true;
    }
    
    // Filter for truly orphaned reminders
    const remindersToDelete = orphanedReminders.filter(reminder => {
      // Skip custom reminders with no valid relation
      if (reminder.type === 'custom' && !reminder.related_id) return false;
      
      // Check if related_id exists in valid IDs based on reminder type
      if (['heat', 'mating', 'vaccination', 'deworming', 'birthday'].includes(reminder.type)) {
        return reminder.related_id && !validDogIds.includes(reminder.related_id);
      } else if (['weighing', 'vet-visit'].includes(reminder.type)) {
        return reminder.related_id && !validLitterIds.includes(reminder.related_id);
      }
      
      return false;
    });
    
    if (remindersToDelete.length === 0) {
      console.log('No orphaned reminders to delete after validation');
      toast({
        title: "Reminders Cleanup",
        description: "No orphaned reminders found to clean up.",
      });
      return true;
    }
    
    // Delete the orphaned reminders
    const idsToDelete = remindersToDelete.map(reminder => reminder.id);
    const { error: deleteError } = await supabase
      .from('reminders')
      .delete()
      .in('id', idsToDelete);
    
    if (deleteError) {
      console.error("Error deleting orphaned reminders:", deleteError);
      toast({
        title: "Cleanup Error",
        description: "Failed to delete orphaned reminders. Please try again.",
        variant: "destructive"
      });
      return false;
    }
    
    // Clear local storage of any old reminders
    localStorage.removeItem('customReminders');
    localStorage.removeItem('completedReminders');
    localStorage.removeItem('deletedReminderIds');
    
    toast({
      title: "Reminders Cleaned",
      description: `Successfully removed ${remindersToDelete.length} orphaned reminders.`,
    });
    
    return true;
  } catch (error) {
    console.error("Error in cleanupOrphanedReminders:", error);
    toast({
      title: "Cleanup Error",
      description: "An unexpected error occurred during reminders cleanup.",
      variant: "destructive"
    });
    return false;
  }
};

