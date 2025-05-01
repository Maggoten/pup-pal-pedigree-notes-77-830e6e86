
import { useState, useEffect, useCallback, useRef } from 'react';
import { calculateUpcomingHeats } from '@/utils/heatCalculator';
import { Dog } from '@/types/dogs';
import { CalendarEvent, AddEventFormValues } from '@/components/calendar/types';
import { 
  fetchCalendarEvents, 
  addEventToSupabase, 
  updateEventInSupabase, 
  deleteEventFromSupabase,
  migrateCalendarEventsFromLocalStorage,
  getEventColor 
} from '@/services/CalendarEventService';
import { useAuth } from '@/context/AuthContext';
import { parseISO, addDays, format, isAfter, isBefore, isSameDay } from 'date-fns';

export const useCalendarEvents = (dogs: Dog[]) => {
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [hasMigrated, setHasMigrated] = useState<boolean>(false);
  const { user } = useAuth();
  const isLoadingRef = useRef(false);
  const loadingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Generate automated events based on dog data (birthdays, vaccinations, heats, due dates)
  const generateAutomatedEvents = useCallback((dogList: Dog[]): CalendarEvent[] => {
    const autoEvents: CalendarEvent[] = [];
    const today = new Date();
    const oneYearFromNow = addDays(today, 365);
    
    // Process each dog for relevant events
    dogList.forEach(dog => {
      // Add birthday events
      if (dog.dateOfBirth) {
        try {
          const birthDate = parseISO(dog.dateOfBirth);
          const currentYear = today.getFullYear();
          
          // Add birthday for current year and next year
          [currentYear, currentYear + 1].forEach(year => {
            const birthdayThisYear = new Date(year, birthDate.getMonth(), birthDate.getDate());
            
            // Skip if birthday is more than a year in the future
            if (isBefore(birthdayThisYear, oneYearFromNow)) {
              const age = year - birthDate.getFullYear();
              if (age > 0) { // Only show birthdays for dogs already born
                autoEvents.push({
                  id: `birthday-${dog.id}-${year}`,
                  title: `${dog.name}'s ${age}${getOrdinalSuffix(age)} Birthday`,
                  date: birthdayThisYear,
                  type: 'birthday',
                  dogId: dog.id,
                  dogName: dog.name
                });
              }
            }
          });
        } catch (error) {
          console.error(`Error processing birthday for dog ${dog.name}:`, error);
        }
      }
      
      // Add vaccination events
      if (dog.vaccinationDate) {
        try {
          const lastVaccination = parseISO(dog.vaccinationDate);
          const nextVaccination = addDays(lastVaccination, 365); // Yearly vaccinations
          
          if (isAfter(nextVaccination, today) && isBefore(nextVaccination, oneYearFromNow)) {
            autoEvents.push({
              id: `vaccination-${dog.id}`,
              title: `${dog.name}'s Vaccination Due`,
              date: nextVaccination,
              type: 'vaccination',
              dogId: dog.id,
              dogName: dog.name
            });
          }
        } catch (error) {
          console.error(`Error processing vaccination for dog ${dog.name}:`, error);
        }
      }
      
      // Add heat events for female dogs
      if (dog.gender === 'female') {
        const upcomingHeats = calculateUpcomingHeats([dog], 12); // Look ahead 12 months
        const heatEvents: CalendarEvent[] = upcomingHeats.map((heat, index) => ({
          id: `heat-${heat.dogId}-${index}`,
          title: `${heat.dogName}'s Heat Cycle`,
          date: heat.date,
          type: 'heat',
          dogId: heat.dogId,
          dogName: heat.dogName
        }));
        
        autoEvents.push(...heatEvents);
      }
      
      // Add due date events for pregnant females
      if (dog.gender === 'female' && dog.breedingHistory?.matings && dog.breedingHistory.matings.length > 0) {
        dog.breedingHistory.matings.forEach((mating, index) => {
          try {
            const matingDate = parseISO(mating.date);
            // Only process recent matings (in the past 60 days)
            if (isBefore(matingDate, today) && isAfter(matingDate, addDays(today, -60))) {
              const dueDate = addDays(matingDate, 63); // ~9 weeks pregnancy
              
              if (isAfter(dueDate, today)) {
                autoEvents.push({
                  id: `due-date-${dog.id}-${index}`,
                  title: `${dog.name}'s Due Date`,
                  date: dueDate,
                  type: 'due-date',
                  dogId: dog.id,
                  dogName: dog.name
                });
              }
            }
          } catch (error) {
            console.error(`Error processing mating date for dog ${dog.name}:`, error);
          }
        });
      }
    });
    
    return autoEvents;
  }, []);
  
  const getOrdinalSuffix = (number: number): string => {
    if (number % 100 >= 11 && number % 100 <= 13) {
      return 'th';
    }
    
    switch (number % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };
  
  // Function to load events
  const loadEvents = useCallback(async () => {
    if (!user) {
      setCalendarEvents([]);
      setIsLoading(false);
      return;
    }
    
    // Prevent multiple simultaneous calls
    if (isLoadingRef.current) {
      return;
    }
    
    isLoadingRef.current = true;
    setHasError(false);
    
    try {
      // Generate automated events
      const automatedEvents = generateAutomatedEvents(dogs);
      
      // Check if migration is needed (first time only)
      if (!hasMigrated) {
        try {
          await migrateCalendarEventsFromLocalStorage(dogs);
          setHasMigrated(true);
        } catch (migrationErr) {
          console.error("Migration error (non-critical):", migrationErr);
        }
      }
      
      // Fetch custom events from Supabase
      try {
        const customEvents = await fetchCalendarEvents();
        
        // Update with complete data
        setCalendarEvents(prev => {
          // Keep only custom events and add automated events
          const customOnly = customEvents.filter(event => event.type === 'custom');
          return [...automatedEvents, ...customOnly];
        });
      } catch (fetchErr) {
        console.error("Error fetching custom events:", fetchErr);
        // Don't set error state here - we still have automated data
        setCalendarEvents(automatedEvents);
      }
    } catch (error) {
      console.error("Error loading calendar events:", error);
      setHasError(true);
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [dogs, user, hasMigrated, generateAutomatedEvents]);
  
  // Load events on component mount or when dependencies change
  useEffect(() => {
    let isMounted = true;
    
    const delayedLoad = async () => {
      // Clear any existing timer
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
      
      // Only set loading state after a short delay to prevent flickering
      loadingTimerRef.current = setTimeout(() => {
        if (isMounted) {
          setIsLoading(true);
        }
      }, 300);
      
      await loadEvents();
      
      // Clear the loading timer if events loaded quickly
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
        loadingTimerRef.current = null;
      }
    };
    
    delayedLoad();
    
    return () => {
      isMounted = false;
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, [dogs, user, hasMigrated, loadEvents]);
  
  // Function to get events for a specific date
  const getEventsForDate = useCallback((date: Date) => {
    return calendarEvents.filter(event => 
      isSameDay(new Date(event.date), date)
    );
  }, [calendarEvents]);
  
  // Function to refresh events 
  const refreshEvents = useCallback(async () => {
    await loadEvents();
  }, [loadEvents]);
  
  // Function to add a new event
  const handleAddEvent = async (data: AddEventFormValues) => {
    if (!user) {
      return false;
    }
    
    const newEvent = await addEventToSupabase(data, dogs);
    
    if (newEvent) {
      setCalendarEvents(prevEvents => [...prevEvents, newEvent]);
      return true;
    }
    
    return false;
  };
  
  // Function to edit an event
  const handleEditEvent = async (eventId: string, data: AddEventFormValues) => {
    // Check if it's a custom event (only custom events can be edited)
    const eventToEdit = calendarEvents.find(event => event.id === eventId);
    
    if (!eventToEdit || eventToEdit.type !== 'custom') {
      return false;
    }
    
    const updatedEvent = await updateEventInSupabase(eventId, data, dogs);
    
    if (updatedEvent) {
      setCalendarEvents(prevEvents => 
        prevEvents.map(event => event.id === eventId ? updatedEvent : event)
      );
      return true;
    }
    
    return false;
  };
  
  // Function to delete an event
  const handleDeleteEvent = async (eventId: string) => {
    // Check if it's a custom event (only custom events can be deleted)
    const eventToDelete = calendarEvents.find(event => event.id === eventId);
    
    if (!eventToDelete || eventToDelete.type !== 'custom') {
      return false;
    }
    
    const success = await deleteEventFromSupabase(eventId);
    
    if (success) {
      setCalendarEvents(prevEvents => 
        prevEvents.filter(event => event.id !== eventId)
      );
      return true;
    }
    
    return false;
  };
  
  return {
    calendarEvents,
    isLoading,
    hasError,
    getEventsForDate,
    addEvent: handleAddEvent,
    editEvent: handleEditEvent,
    deleteEvent: handleDeleteEvent,
    getEventColor,
    refreshEvents
  };
};
