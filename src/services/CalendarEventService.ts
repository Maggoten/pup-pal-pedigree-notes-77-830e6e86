
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';
import { Dog } from '@/context/DogsContext';
import { CalendarEvent, AddEventFormValues } from '@/components/calendar/types';

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
    case 'custom':
      return 'bg-green-100 border-green-300 text-green-800';
    default:
      return 'bg-gray-100 border-gray-300 text-gray-800';
  }
};
