
import { useState, useEffect, useCallback } from 'react';
import { CalendarEvent } from '@/components/calendar/types';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/components/ui/use-toast';
import { Dog } from '@/context/DogsContext';
import { format } from 'date-fns';

export function useCalendarEvents(dogs: Dog[]) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load events from Supabase
  useEffect(() => {
    if (!user) {
      setEvents([]);
      setLoading(false);
      return;
    }

    const fetchEvents = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('calendar_events')
          .select('*')
          .eq('user_id', user.id);

        if (error) throw error;
        
        // Transform to CalendarEvent format
        const calendarEvents: CalendarEvent[] = data.map(event => ({
          id: event.id,
          title: event.title,
          date: new Date(event.date),
          time: event.time,
          type: event.type,
          dogId: event.dog_id,
          dogName: event.dog_name,
          notes: event.notes
        }));
        
        setEvents(calendarEvents);
      } catch (err) {
        console.error('Error fetching calendar events:', err);
        toast({
          title: 'Error',
          description: 'Failed to load calendar events',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [user]);

  // Get events for a specific date
  const getEventsForDate = useCallback((date: Date) => {
    return events.filter(event => 
      date.getDate() === event.date.getDate() &&
      date.getMonth() === event.date.getMonth() &&
      date.getFullYear() === event.date.getFullYear()
    );
  }, [events]);

  // Add a new event
  const addEvent = async (newEvent: Omit<CalendarEvent, 'id'>) => {
    try {
      if (!user) throw new Error('User must be logged in to add events');

      // Format for Supabase
      const eventData = {
        title: newEvent.title,
        date: format(newEvent.date, 'yyyy-MM-dd'),
        time: newEvent.time,
        type: newEvent.type,
        dog_id: newEvent.dogId,
        dog_name: newEvent.dogName,
        notes: newEvent.notes,
        user_id: user.id
      };
      
      const { data, error } = await supabase
        .from('calendar_events')
        .insert(eventData)
        .select()
        .single();

      if (error) throw error;
      
      // Create new event with the returned ID
      const createdEvent: CalendarEvent = {
        id: data.id,
        title: data.title,
        date: new Date(data.date),
        time: data.time,
        type: data.type,
        dogId: data.dog_id,
        dogName: data.dog_name,
        notes: data.notes
      };
      
      // Update local state
      setEvents(prev => [...prev, createdEvent]);
      
      toast({
        title: 'Event Added',
        description: `"${createdEvent.title}" has been added to your calendar.`
      });
      
      return createdEvent;
    } catch (err) {
      console.error('Error adding event:', err);
      toast({
        title: 'Error',
        description: `Failed to add event: ${(err as Error).message}`,
        variant: 'destructive'
      });
      return null;
    }
  };

  // Edit an existing event
  const editEvent = async (id: string, updates: Partial<CalendarEvent>) => {
    try {
      if (!user) throw new Error('User must be logged in to edit events');
      
      // Format for Supabase
      const eventUpdates: any = {};
      
      if (updates.title !== undefined) eventUpdates.title = updates.title;
      if (updates.date !== undefined) eventUpdates.date = format(updates.date, 'yyyy-MM-dd');
      if (updates.time !== undefined) eventUpdates.time = updates.time;
      if (updates.type !== undefined) eventUpdates.type = updates.type;
      if (updates.dogId !== undefined) eventUpdates.dog_id = updates.dogId;
      if (updates.dogName !== undefined) eventUpdates.dog_name = updates.dogName;
      if (updates.notes !== undefined) eventUpdates.notes = updates.notes;
      
      const { data, error } = await supabase
        .from('calendar_events')
        .update(eventUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Create updated event
      const updatedEvent: CalendarEvent = {
        id: data.id,
        title: data.title,
        date: new Date(data.date),
        time: data.time,
        type: data.type,
        dogId: data.dog_id,
        dogName: data.dog_name,
        notes: data.notes
      };
      
      // Update local state
      setEvents(prev => prev.map(event => event.id === id ? updatedEvent : event));
      
      toast({
        title: 'Event Updated',
        description: `"${updatedEvent.title}" has been updated.`
      });
      
      return updatedEvent;
    } catch (err) {
      console.error('Error updating event:', err);
      toast({
        title: 'Error',
        description: `Failed to update event: ${(err as Error).message}`,
        variant: 'destructive'
      });
      return null;
    }
  };

  // Delete an event
  const deleteEvent = async (id: string) => {
    try {
      if (!user) throw new Error('User must be logged in to delete events');
      
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setEvents(prev => prev.filter(event => event.id !== id));
      
      toast({
        title: 'Event Deleted',
        description: 'The event has been removed from your calendar.'
      });
      
      return true;
    } catch (err) {
      console.error('Error deleting event:', err);
      toast({
        title: 'Error',
        description: `Failed to delete event: ${(err as Error).message}`,
        variant: 'destructive'
      });
      return false;
    }
  };

  // Get appropriate color for an event type
  const getEventColor = (type: string) => {
    switch (type) {
      case 'heat':
        return 'bg-red-500 hover:bg-red-600';
      case 'planned-mating':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'vet':
        return 'bg-green-500 hover:bg-green-600';
      case 'due-date':
        return 'bg-purple-500 hover:bg-purple-600';
      case 'vaccination':
        return 'bg-amber-500 hover:bg-amber-600';
      case 'deworming':
        return 'bg-teal-500 hover:bg-teal-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return {
    events,
    loading,
    getEventsForDate,
    getEventColor,
    addEvent,
    editEvent,
    deleteEvent
  };
}
