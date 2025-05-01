import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast';
import { Dog } from '@/context/DogsContext';
import { CalendarEvent, AddEventFormValues } from '@/components/calendar/types';

// Fetch calendar events from Supabase
export const fetchCalendarEvents = async (): Promise<CalendarEvent[]> => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData?.session) {
      console.error('No active session:', sessionError);
      return [];
    }
    
    const { data: events, error } = await supabase
      .from('calendar_events')
      .select('*')
      .order('date', { ascending: true });
      
    if (error) {
      console.error("Error fetching calendar events:", error);
      return [];
    }
    
    if (!events) return [];
    
    // Transform events to match application format
    return events.map(event => ({
      id: event.id,
      title: event.title,
      date: new Date(event.date),
      time: event.time,
      type: event.type,
      dogId: event.dog_id,
      dogName: event.dog_name,
      notes: event.notes
    }));
  } catch (error) {
    console.error("Error in fetchCalendarEvents:", error);
    return [];
  }
};

// Add a new calendar event to Supabase
export const addEventToSupabase = async (data: AddEventFormValues, dogs: Dog[]): Promise<CalendarEvent | null> => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData?.session) {
      console.error('No active session:', sessionError);
      return null;
    }
    
    const userId = sessionData.session.user.id;
    
    // Combine date and time
    const combinedDate = new Date(data.date);
    if (data.time) {
      const [hours, minutes] = data.time.split(':').map(Number);
      combinedDate.setHours(hours, minutes);
    }
    
    // Prepare the event data
    const eventData: any = {
      user_id: userId,
      title: data.title,
      date: combinedDate.toISOString(),
      time: data.time,
      type: 'custom',
      notes: data.notes
    };
    
    // Add dog information if provided
    if (data.dogId) {
      const selectedDog = dogs.find(dog => dog.id === data.dogId);
      if (selectedDog) {
        eventData.dog_id = data.dogId;
        eventData.dog_name = selectedDog.name;
      }
    }
    
    // Insert into Supabase
    const { data: insertedEvent, error } = await supabase
      .from('calendar_events')
      .insert(eventData)
      .select()
      .single();
    
    if (error || !insertedEvent) {
      console.error("Error adding calendar event:", error);
      toast({
        title: "Error",
        description: "Failed to add calendar event. Please try again.",
        variant: "destructive"
      });
      return null;
    }
    
    // Format the event for the application
    const newEvent: CalendarEvent = {
      id: insertedEvent.id,
      title: insertedEvent.title,
      date: new Date(insertedEvent.date),
      time: insertedEvent.time,
      type: insertedEvent.type,
      notes: insertedEvent.notes,
      dogId: insertedEvent.dog_id,
      dogName: insertedEvent.dog_name
    };
    
    toast({
      title: "Event Added",
      description: "Your event has been added to the calendar.",
    });
    
    return newEvent;
  } catch (error) {
    console.error("Error in addEventToSupabase:", error);
    return null;
  }
};

// Update an existing calendar event
export const updateEventInSupabase = async (
  eventId: string, 
  data: AddEventFormValues, 
  dogs: Dog[]
): Promise<CalendarEvent | null> => {
  try {
    // Combine date and time
    const combinedDate = new Date(data.date);
    if (data.time) {
      const [hours, minutes] = data.time.split(':').map(Number);
      combinedDate.setHours(hours, minutes);
    }
    
    // Prepare the event data
    const eventData: any = {
      title: data.title,
      date: combinedDate.toISOString(),
      time: data.time,
      notes: data.notes,
      updated_at: new Date().toISOString()
    };
    
    // Add dog information if provided
    if (data.dogId) {
      const selectedDog = dogs.find(dog => dog.id === data.dogId);
      if (selectedDog) {
        eventData.dog_id = data.dogId;
        eventData.dog_name = selectedDog.name;
      }
    } else {
      eventData.dog_id = null;
      eventData.dog_name = null;
    }
    
    // Update in Supabase
    const { data: updatedEvent, error } = await supabase
      .from('calendar_events')
      .update(eventData)
      .eq('id', eventId)
      .select()
      .single();
    
    if (error || !updatedEvent) {
      console.error("Error updating calendar event:", error);
      toast({
        title: "Error",
        description: "Failed to update calendar event. Please try again.",
        variant: "destructive"
      });
      return null;
    }
    
    // Format the event for the application
    const modifiedEvent: CalendarEvent = {
      id: updatedEvent.id,
      title: updatedEvent.title,
      date: new Date(updatedEvent.date),
      time: updatedEvent.time,
      type: updatedEvent.type,
      notes: updatedEvent.notes,
      dogId: updatedEvent.dog_id,
      dogName: updatedEvent.dog_name
    };
    
    toast({
      title: "Event Updated",
      description: "Your event has been updated in the calendar.",
    });
    
    return modifiedEvent;
  } catch (error) {
    console.error("Error in updateEventInSupabase:", error);
    return null;
  }
};

// Delete a calendar event
export const deleteEventFromSupabase = async (eventId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', eventId);
    
    if (error) {
      console.error("Error deleting calendar event:", error);
      toast({
        title: "Error",
        description: "Failed to delete calendar event. Please try again.",
        variant: "destructive"
      });
      return false;
    }
    
    toast({
      title: "Event Deleted",
      description: "Your event has been removed from the calendar.",
    });
    
    return true;
  } catch (error) {
    console.error("Error in deleteEventFromSupabase:", error);
    return false;
  }
};

// Migrate calendar events from localStorage to Supabase (one-time operation)
export const migrateCalendarEventsFromLocalStorage = async (dogs: Dog[]): Promise<boolean> => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData?.session) {
      console.error('No active session for migration:', sessionError);
      return false;
    }
    
    const userId = sessionData.session.user.id;
    
    // Get data from local storage
    const savedEvents = localStorage.getItem('breedingCalendarEvents');
    if (!savedEvents) {
      // No local data to migrate
      return true;
    }
    
    const localEvents = JSON.parse(savedEvents).map((event: any) => ({
      ...event,
      date: new Date(event.date)
    }));
    
    console.log("Starting calendar events migration...");
    
    // Only migrate custom events (not system events)
    const customEvents = localEvents.filter(event => event.type === 'custom');
    
    if (customEvents.length > 0) {
      const eventInserts = customEvents.map(event => ({
        user_id: userId,
        title: event.title,
        date: event.date.toISOString(),
        time: event.time || null,
        type: event.type,
        notes: event.notes || null,
        dog_id: event.dogId || null,
        dog_name: event.dogName || null
      }));
      
      const { error } = await supabase
        .from('calendar_events')
        .insert(eventInserts);
        
      if (error) {
        console.error("Error migrating calendar events:", error);
        return false;
      }
    }
    
    console.log("Calendar events migration completed successfully");
    
    // Clear local storage after successful migration
    localStorage.removeItem('breedingCalendarEvents');
    
    return true;
  } catch (error) {
    console.error("Error in migrateCalendarEventsFromLocalStorage:", error);
    return false;
  }
};

// Load events from localStorage
export const loadEvents = (): CalendarEvent[] => {
  const savedEvents = localStorage.getItem('breedingCalendarEvents');
  return savedEvents 
    ? JSON.parse(savedEvents).map((event: any) => ({
        ...event,
        date: new Date(event.date)
      })) 
    : [];
};

// Save events to localStorage
export const saveEvents = (events: CalendarEvent[]): void => {
  const customEvents = events.filter(event => event.type === 'custom');
  if (customEvents.length > 0) {
    localStorage.setItem('breedingCalendarEvents', JSON.stringify(customEvents));
  }
};

// Add a new event
export const addEvent = (data: AddEventFormValues, dogs: Dog[]): CalendarEvent => {
  // Combine date and time
  const combinedDate = new Date(data.date);
  if (data.time) {
    const [hours, minutes] = data.time.split(':').map(Number);
    combinedDate.setHours(hours, minutes);
  }
  
  const newEvent: CalendarEvent = {
    id: uuidv4(),
    title: data.title,
    date: combinedDate,
    time: data.time,
    type: 'custom',
    notes: data.notes
  };
  
  if (data.dogId) {
    const selectedDog = dogs.find(dog => dog.id === data.dogId);
    if (selectedDog) {
      newEvent.dogId = data.dogId;
      newEvent.dogName = selectedDog.name;
    }
  }
  
  toast({
    title: "Event Added",
    description: "Your event has been added to the calendar.",
  });
  
  return newEvent;
};

// Edit an existing event
export const editEvent = (
  eventId: string, 
  data: AddEventFormValues, 
  events: CalendarEvent[],
  dogs: Dog[]
): CalendarEvent[] | null => {
  // Only custom events can be edited
  const eventToEdit = events.find(event => event.id === eventId);
  
  if (eventToEdit && eventToEdit.type === 'custom') {
    // Combine date and time
    const combinedDate = new Date(data.date);
    if (data.time) {
      const [hours, minutes] = data.time.split(':').map(Number);
      combinedDate.setHours(hours, minutes);
    }
    
    const updatedEvent: CalendarEvent = {
      ...eventToEdit,
      title: data.title,
      date: combinedDate,
      time: data.time,
      notes: data.notes,
    };
    
    // Update dog information if changed
    if (data.dogId !== eventToEdit.dogId) {
      if (data.dogId) {
        const selectedDog = dogs.find(dog => dog.id === data.dogId);
        if (selectedDog) {
          updatedEvent.dogId = data.dogId;
          updatedEvent.dogName = selectedDog.name;
        } else {
          updatedEvent.dogId = undefined;
          updatedEvent.dogName = undefined;
        }
      } else {
        updatedEvent.dogId = undefined;
        updatedEvent.dogName = undefined;
      }
    }
    
    const updatedEvents = events.map(event => 
      event.id === eventId ? updatedEvent : event
    );
    
    toast({
      title: "Event Updated",
      description: "Your event has been updated in the calendar.",
    });
    
    return updatedEvents;
  }
  
  return null;
};

// Delete an event
export const deleteEvent = (eventId: string, events: CalendarEvent[]): CalendarEvent[] | null => {
  // Only filter out custom events (system events cannot be deleted)
  const eventToDelete = events.find(event => event.id === eventId);
  
  if (eventToDelete && eventToDelete.type === 'custom') {
    const updatedEvents = events.filter(event => event.id !== eventId);
    
    toast({
      title: "Event Deleted",
      description: "Your event has been removed from the calendar.",
    });
    
    return updatedEvents;
  }
  
  return null;
};

// Get event color based on type
export const getEventColor = (type: string): string => {
  switch (type) {
    case 'heat':
      return 'bg-rose-100 border-rose-300 text-rose-800';
    case 'mating':
      return 'bg-purple-100 border-purple-300 text-purple-800';
    case 'planned-mating':
      return 'bg-indigo-100 border-indigo-300 text-indigo-800';
    case 'due-date':
      return 'bg-amber-100 border-amber-300 text-amber-800';
    case 'vaccination':
      return 'bg-emerald-100 border-emerald-300 text-emerald-800';
    case 'birthday':
      return 'bg-blue-100 border-blue-300 text-blue-800';
    case 'custom':
      return 'bg-green-100 border-green-300 text-green-800';
    default:
      return 'bg-gray-100 border-gray-300 text-gray-800';
  }
};
