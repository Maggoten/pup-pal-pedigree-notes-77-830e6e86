
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useEffect } from 'react';
import { Dog } from '@/types/dogs';
import { CalendarEvent } from '@/components/calendar/types';
import { 
  fetchCalendarEvents, 
  migrateCalendarEventsFromLocalStorage
} from '@/services/CalendarEventService';
import { useAuth } from '@/hooks/useAuth';
import { calculateUpcomingHeats } from '@/utils/heatCalculator';
import { format, isValid } from 'date-fns';
import { useBreedingReminders } from '@/hooks/useBreedingReminders';
import { isValidDate } from '@/utils/dateUtils';

export const useEventQueries = (dogs: Dog[]) => {
  const [hasMigrated, setHasMigrated] = useState<boolean>(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { reminders } = useBreedingReminders();
  
  // Handle migration once per session
  const migrateEventsIfNeeded = useCallback(async () => {
    if (!hasMigrated && user) {
      console.log("[Calendar] Starting data migration check...");
      await migrateCalendarEventsFromLocalStorage(dogs);
      setHasMigrated(true);
      console.log("[Calendar] Migration completed");
    }
  }, [hasMigrated, user, dogs]);
  
  // Log detailed dog data for debugging
  useEffect(() => {
    if (dogs.length > 0) {
      console.log("[Calendar DEBUG] Available dogs for calendar processing:");
      dogs.forEach(dog => {
        console.log(`Dog: ${dog.name} (ID: ${dog.id})`);
        if (dog.gender === 'female') {
          console.log(`- Heat History: ${dog.heatHistory ? JSON.stringify(dog.heatHistory) : 'None'}`);
        }
        console.log(`- Vaccination Date: ${dog.vaccinationDate || 'Not set'}`);
      });
    } else {
      console.log("[Calendar DEBUG] No dogs available for calendar events");
    }
  }, [dogs]);
  
  // Convert reminders to calendar events
  const reminderToCalendarEvents = useCallback(() => {
    if (!reminders || reminders.length === 0) {
      console.log("[Calendar] No reminders to convert to calendar events");
      return [];
    }
    
    console.log("[Calendar] Converting reminders to calendar events:", reminders.length);
    
    const eventsList = reminders.map(reminder => {
      const dueDate = reminder.dueDate;
      
      // Validate date
      if (!dueDate || !isValidDate(dueDate)) {
        console.error(`[Calendar] Invalid due date for reminder: ${reminder.id} - ${reminder.title}`, dueDate);
        return null;
      }
      
      console.log(`[Calendar] Converting reminder: ${reminder.id} - ${reminder.title} - type: ${reminder.type} - due: ${dueDate.toISOString()}`);
      
      return {
        id: `reminder-${reminder.id}`,
        title: reminder.title,
        date: dueDate,
        type: reminder.type,
        dogId: reminder.relatedId,
        dogName: "", // We'll try to add the dog name below
        time: format(dueDate, 'HH:mm'),
        notes: reminder.description,
        isCompleted: reminder.isCompleted,
        priority: reminder.priority
      };
    }).filter(event => event !== null) as CalendarEvent[]; // Filter out any null entries
    
    // Add dog names where possible
    eventsList.forEach(event => {
      if (event.dogId) {
        const dog = dogs.find(d => d.id === event.dogId);
        if (dog) {
          event.dogName = dog.name;
        }
      }
    });
    
    // Log vaccination reminders specifically for debugging
    const vacEvents = eventsList.filter(e => e.type === 'vaccination');
    console.log(`[Calendar] Found ${vacEvents.length} vaccination calendar events`);
    vacEvents.forEach(e => {
      console.log(`[Calendar] Vaccination event: ${e.title}, Due: ${new Date(e.date).toISOString()}, Dog: ${e.dogName}`);
    });
    
    console.log(`[Calendar] Converted ${eventsList.length} reminders to calendar events`);
    return eventsList;
  }, [reminders, dogs]);
  
  // Use React Query for calendar events - Fixed for v5 compatibility
  const { 
    data: calendarEvents = [],
    isLoading,
    error: fetchError,
    refetch
  } = useQuery({
    queryKey: ['calendar-events', user?.id, dogs.length, reminders?.length],
    queryFn: async () => {
      if (!user) {
        console.log("[Calendar] No user found, returning empty events array");
        return [];
      }
      
      console.log("[Calendar] Loading calendar events for user:", user.id);
      console.log("[Calendar] Dogs data:", dogs.map(d => ({id: d.id, name: d.name})));
      console.log("[Calendar] Reminders data:", reminders?.length || 0, "reminders available");
      
      try {
        // Ensure migration happens before fetching
        await migrateEventsIfNeeded();
        
        // Fetch custom events from Supabase
        const customEvents = await fetchCalendarEvents();
        console.log("[Calendar] Fetched custom events:", customEvents.length);
        
        // Generate heat events based on dogs data - now showing past events as well
        const heatEvents: CalendarEvent[] = calculateUpcomingHeats(dogs, 6, 24).map((heat, index) => {
          const event = {
            id: `heat-${heat.dogId}-${index}-${Date.now()}`, // Add timestamp for uniqueness
            title: 'Heat Cycle',
            date: heat.date,
            type: 'heat',
            dogId: heat.dogId,
            dogName: heat.dogName
          };
          console.log(`[Calendar] Generated heat event: ${event.title} for ${event.dogName} on ${new Date(event.date).toISOString()}`);
          return event;
        });
        console.log("[Calendar] Generated heat events:", heatEvents.length);
        
        // Get reminder events
        const reminderEvents = reminderToCalendarEvents();
        console.log("[Calendar] Generated reminder events:", reminderEvents.length);
        
        // Log all vaccination events for debugging
        const vaccinationEvents = reminderEvents.filter(e => e.type === 'vaccination');
        console.log(`[Calendar] Vaccination events (${vaccinationEvents.length}):`, 
          vaccinationEvents.map(e => `${e.title} - ${new Date(e.date).toISOString()} - Dog ID: ${e.dogId}`));
        
        // Return all events at once
        const allEvents = [...heatEvents, ...customEvents, ...reminderEvents];
        console.log("[Calendar] Total events:", allEvents.length);
        return allEvents;
      } catch (error) {
        console.error("[Calendar] Error generating calendar events:", error);
        // Return custom events at minimum
        const customEvents = await fetchCalendarEvents();
        return customEvents;
      }
    },
    enabled: !!user, // Enable when user is available, even if dogs are not yet loaded
    staleTime: 1000 * 30, // Consider data fresh for just 30 seconds to ensure frequent updates
    retry: 2, // Increased retry attempts
    refetchOnMount: true,
    refetchOnWindowFocus: true // Enable refetching when window regains focus
  });
  
  // Force a refresh when dogs or reminders change
  useEffect(() => {
    if (user) {
      console.log("[Calendar] Force refreshing calendar events after dogs or reminders updated");
      refetch();
    }
  }, [user, dogs.length, reminders?.length, refetch]);
  
  // Manual refresh function
  const refreshCalendarData = useCallback(() => {
    console.log("[Calendar] Manually refreshing calendar events");
    queryClient.invalidateQueries({ queryKey: ['calendar-events', user?.id, dogs.length] });
    refetch();
  }, [queryClient, user, dogs.length, refetch]);
  
  return {
    calendarEvents,
    isLoading,
    fetchError,
    refreshCalendarData
  };
};
