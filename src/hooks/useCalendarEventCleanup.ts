
import { useState } from 'react';
import { ReminderCalendarSyncService } from '@/services/ReminderCalendarSyncService';
import { useToast } from '@/hooks/use-toast';

export const useCalendarEventCleanup = () => {
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const { toast } = useToast();

  const cleanupOrphanedEvents = async () => {
    try {
      setIsCleaningUp(true);
      console.log('Starting cleanup of orphaned calendar events');
      
      const success = await ReminderCalendarSyncService.cleanupOrphanedEvents();
      
      if (success) {
        toast({
          title: "Cleanup Complete",
          description: "Successfully cleaned up outdated calendar events.",
        });
      } else {
        toast({
          title: "Cleanup Failed",
          description: "Failed to clean up some calendar events. Please try again.",
          variant: "destructive"
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error during calendar cleanup:', error);
      toast({
        title: "Cleanup Error",
        description: "An error occurred while cleaning up calendar events.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsCleaningUp(false);
    }
  };

  const cleanupEventsForDog = async (dogId: string) => {
    try {
      console.log('Cleaning up calendar events for dog:', dogId);
      
      const success = await ReminderCalendarSyncService.cleanupCalendarEventsForDog(dogId);
      
      if (!success) {
        toast({
          title: "Cleanup Failed",
          description: "Failed to clean up calendar events for this dog.",
          variant: "destructive"
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error cleaning up dog calendar events:', error);
      return false;
    }
  };

  return {
    cleanupOrphanedEvents,
    cleanupEventsForDog,
    isCleaningUp
  };
};
