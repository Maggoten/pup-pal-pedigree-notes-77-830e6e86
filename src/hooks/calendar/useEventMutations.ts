
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  addEventToSupabase, 
  updateEventInSupabase, 
  deleteEventFromSupabase,
} from '@/services/CalendarEventService';
import { Dog } from '@/types/dogs';
import { AddEventFormValues, CalendarEvent } from '@/components/calendar/types';
import { User } from '@/types/auth';
import { MutationState } from './types';

export const useEventMutations = (user: User | null, dogs: Dog[]) => {
  const queryClient = useQueryClient();
  
  // Add event mutation - Fixed for v5 compatibility
  const addEventMutation = useMutation({
    mutationFn: async (data: AddEventFormValues) => {
      if (!user) throw new Error('User not authenticated');
      return await addEventToSupabase(data, dogs);
    },
    onMutate: async (data) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['calendar-events', user?.id, dogs.length] });
      
      // No optimistic update because we need the server-generated ID
      return { submitted: true };
    },
    onError: (error) => {
      console.error("[Calendar] Error adding event:", error);
    },
    onSuccess: () => {
      console.log("[Calendar] Event added successfully");
    },
    onSettled: () => {
      // Always refetch after mutation completes
      queryClient.invalidateQueries({ queryKey: ['calendar-events', user?.id, dogs.length] });
    }
  });
  
  // Edit event mutation - Fixed for v5 compatibility
  const editEventMutation = useMutation({
    mutationFn: async ({ eventId, data }: { eventId: string, data: AddEventFormValues }) => {
      return await updateEventInSupabase(eventId, data, dogs);
    },
    onMutate: async ({ eventId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['calendar-events', user?.id, dogs.length] });
      
      // Snapshot the previous value
      const previousEvents = queryClient.getQueryData(['calendar-events', user?.id, dogs.length]);
      
      // Optimistically update
      queryClient.setQueryData(['calendar-events', user?.id, dogs.length], (oldEvents: CalendarEvent[] = []) => {
        return oldEvents.map(event => {
          if (event.id === eventId && event.type === 'custom') {
            return { 
              ...event,
              title: data.title,
              date: data.date,
              time: data.time,
              notes: data.notes,
              dogId: data.dogId
            };
          }
          return event;
        });
      });
      
      return { previousEvents } as MutationState;
    },
    onError: (err, { eventId }, context) => {
      console.error(`[Calendar] Error editing event ${eventId}:`, err);
      // Rollback to the snapshot on error
      if (context?.previousEvents) {
        queryClient.setQueryData(['calendar-events', user?.id, dogs.length], context.previousEvents);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events', user?.id, dogs.length] });
    }
  });
  
  // Delete event mutation - Fixed for v5 compatibility
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      return await deleteEventFromSupabase(eventId);
    },
    onMutate: async (eventId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['calendar-events', user?.id, dogs.length] });
      
      // Snapshot the previous value
      const previousEvents = queryClient.getQueryData(['calendar-events', user?.id, dogs.length]);
      
      // Optimistically update
      queryClient.setQueryData(['calendar-events', user?.id, dogs.length], (oldEvents: CalendarEvent[] = []) => {
        return oldEvents.filter(event => !(event.id === eventId && event.type === 'custom'));
      });
      
      return { previousEvents } as MutationState;
    },
    onError: (err, eventId, context) => {
      console.error(`[Calendar] Error deleting event ${eventId}:`, err);
      // Rollback to the snapshot on error
      if (context?.previousEvents) {
        queryClient.setQueryData(['calendar-events', user?.id, dogs.length], context.previousEvents);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['calendar-events', user?.id, dogs.length] });
    }
  });
  
  return { 
    addEventMutation, 
    editEventMutation, 
    deleteEventMutation 
  };
};
