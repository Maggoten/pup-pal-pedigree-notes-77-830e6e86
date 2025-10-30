
import { supabase } from '@/integrations/supabase/client';
import { CalendarEvent, AddEventFormValues } from '@/components/calendar/types';
import { Dog } from '@/types/dogs';
import { toast } from '@/components/ui/use-toast';

// Map event types to colors with enhanced heat tracking
const eventTypeColors = {
  'heat': 'bg-rose-200 text-rose-800 border-rose-300',
  'heat-active': 'bg-rose-300 text-rose-900 border-rose-400', // Active heat phase
  'ovulation-predicted': 'bg-purple-200 text-purple-900 border-purple-400 shadow-purple-200/50 shadow-lg', // Predicted ovulation
  'fertility-window': 'bg-violet-150 text-violet-900 border-violet-350 shadow-violet-200/40 shadow-md', // Optimal breeding days
  'mating': 'bg-violet-100 text-violet-800 border-violet-200',
  'pregnancy-period': 'bg-pink-100 text-pink-800 border-pink-200', // 63-day pregnancy period
  'due-date': 'bg-warmgreen-100 text-warmgreen-800 border-warmgreen-200',
  'vaccination': 'bg-warmgreen-100 text-warmgreen-800 border-warmgreen-200',
  'deworming': 'bg-teal-100 text-teal-800 border-teal-200',
  'birthday': 'bg-blue-100 text-blue-800 border-blue-200',
  'custom': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'planned-mating': 'bg-purple-100 text-purple-800 border-purple-200',
  'vet-visit': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'reminder': 'bg-warmbeige-200 text-darkgray-700 border-warmbeige-300',
  'default': 'bg-warmbeige-100 text-darkgray-800 border-warmbeige-200'
};

// Get the color for an event type
export function getEventColor(type: string): string {
  return eventTypeColors[type] || eventTypeColors.default;
}

// Fetch calendar events for the current user
export async function fetchCalendarEvents(): Promise<CalendarEvent[]> {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData?.session) {
      console.error('No active session:', sessionError);
      return [];
    }
    
    const userId = sessionData.session.user.id;
    
    // Fetch events for the current user
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId);
      
    if (error) {
      console.error('Error fetching calendar events:', error);
      return [];
    }
    
    // Convert database results to CalendarEvent objects
    const events: CalendarEvent[] = data.map(event => ({
      id: event.id,
      title: event.title,
      date: new Date(event.date),
      startDate: new Date(event.date),
      endDate: event.end_date ? new Date(event.end_date) : new Date(event.date),
      type: event.type,
      dogId: event.dog_id || undefined,
      dogName: event.dog_name || undefined,
      notes: event.notes || undefined,
      time: event.time || undefined,
      status: (event.status as 'predicted' | 'active' | 'ended') || 'predicted',
      heatPhase: event.heat_phase as 'proestrus' | 'estrus' | 'metestrus' | 'anestrus' | undefined
    }));
    
    return events;
  } catch (error) {
    console.error('Error in fetchCalendarEvents:', error);
    return [];
  }
}

// Add a new event to Supabase
export async function addEventToSupabase(
  data: AddEventFormValues,
  dogs: Dog[]
): Promise<CalendarEvent | null> {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData?.session) {
      console.error('No active session:', sessionError);
      return null;
    }
    
    const userId = sessionData.session.user.id;
    
    // Find selected dog if applicable
    const selectedDog = data.dogId ? dogs.find(dog => dog.id === data.dogId) : null;
    
    // Prepare the event data
    const eventData = {
      title: data.title,
      date: data.date.toISOString(),
      type: 'custom', // All user-added events are custom type
      dog_id: data.dogId || null,
      dog_name: selectedDog ? selectedDog.name : null,
      notes: data.notes || null,
      time: data.time || null,
      user_id: userId // Always set user_id for proper filtering
    };
    
    // Insert into Supabase
    const { data: result, error } = await supabase
      .from('calendar_events')
      .insert(eventData)
      .select()
      .single();
      
    if (error) {
      console.error('Error adding calendar event:', error);
      toast({
        title: 'Error',
        description: 'Failed to add calendar event',
        variant: 'destructive'
      });
      return null;
    }
    
    toast({
      title: 'Event Added',
      description: 'Calendar event has been added successfully'
    });
    
    // Convert the result to a CalendarEvent
    return {
      id: result.id,
      title: result.title,
      date: new Date(result.date),
      startDate: new Date(result.date),
      endDate: result.end_date ? new Date(result.end_date) : new Date(result.date),
      type: result.type,
      dogId: result.dog_id || undefined,
      dogName: result.dog_name || undefined,
      notes: result.notes || undefined,
      time: result.time || undefined,
      status: (result.status as 'predicted' | 'active' | 'ended') || 'predicted',
      heatPhase: result.heat_phase as 'proestrus' | 'estrus' | 'metestrus' | 'anestrus' | undefined
    };
  } catch (error) {
    console.error('Error in addEventToSupabase:', error);
    return null;
  }
}

// Update an existing event
export async function updateEventInSupabase(
  eventId: string,
  data: AddEventFormValues,
  dogs: Dog[]
): Promise<CalendarEvent | null> {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData?.session) {
      console.error('No active session:', sessionError);
      return null;
    }
    
    const userId = sessionData.session.user.id;
    
    // Find selected dog if applicable
    const selectedDog = data.dogId ? dogs.find(dog => dog.id === data.dogId) : null;
    
    // Prepare the event data
    const eventData = {
      title: data.title,
      date: data.date.toISOString(),
      dog_id: data.dogId || null,
      dog_name: selectedDog ? selectedDog.name : null,
      notes: data.notes || null,
      time: data.time || null
    };
    
    // Update in Supabase
    const { data: result, error } = await supabase
      .from('calendar_events')
      .update(eventData)
      .eq('id', eventId)
      .eq('user_id', userId) // Ensure we only update the user's own events
      .select()
      .single();
      
    if (error) {
      console.error('Error updating calendar event:', error);
      toast({
        title: 'Error',
        description: 'Failed to update calendar event',
        variant: 'destructive'
      });
      return null;
    }
    
    toast({
      title: 'Event Updated',
      description: 'Calendar event has been updated successfully'
    });
    
    // Convert the result to a CalendarEvent
    return {
      id: result.id,
      title: result.title,
      date: new Date(result.date),
      startDate: new Date(result.date),
      endDate: result.end_date ? new Date(result.end_date) : new Date(result.date),
      type: result.type,
      dogId: result.dog_id || undefined,
      dogName: result.dog_name || undefined,
      notes: result.notes || undefined,
      time: result.time || undefined,
      status: (result.status as 'predicted' | 'active' | 'ended') || 'predicted',
      heatPhase: result.heat_phase as 'proestrus' | 'estrus' | 'metestrus' | 'anestrus' | undefined
    };
  } catch (error) {
    console.error('Error in updateEventInSupabase:', error);
    return null;
  }
}

// Delete an event
export async function deleteEventFromSupabase(eventId: string): Promise<boolean> {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData?.session) {
      console.error('No active session:', sessionError);
      return false;
    }
    
    const userId = sessionData.session.user.id;
    
    // Delete from Supabase
    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', eventId)
      .eq('user_id', userId); // Ensure we only delete the user's own events
      
    if (error) {
      console.error('Error deleting calendar event:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete calendar event',
        variant: 'destructive'
      });
      return false;
    }
    
    toast({
      title: 'Event Deleted',
      description: 'Calendar event has been deleted successfully'
    });
    
    return true;
  } catch (error) {
    console.error('Error in deleteEventFromSupabase:', error);
    return false;
  }
}

// Migrate events from localStorage to Supabase (one-time operation)
export async function migrateCalendarEventsFromLocalStorage(dogs: Dog[]): Promise<boolean> {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData?.session) {
      console.error('No active session for migration:', sessionError);
      return false;
    }
    
    const userId = sessionData.session.user.id;
    
    // Check if we already have events in Supabase for this user
    const { data: existingEvents, error: checkError } = await supabase
      .from('calendar_events')
      .select('id')
      .eq('user_id', userId);
      
    if (checkError) {
      console.error('Error checking existing events:', checkError);
      return false;
    }
    
    // If we already have events, skip migration
    if (existingEvents && existingEvents.length > 0) {
      console.log('Events already exist in database, skipping migration');
      return true;
    }
    
    // No need to migrate sample events as they shouldn't exist anymore
    console.log('No events to migrate from localStorage');
    return true;
  } catch (error) {
    console.error('Error in migrateCalendarEventsFromLocalStorage:', error);
    return false;
  }
}

// Phase 1: Advanced Heat Tracking Functions

// Mark a heat cycle as started - creates active heat period and ovulation prediction
export async function markHeatAsStarted(eventId: string, dogs: Dog[]): Promise<boolean> {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData?.session) {
      console.error('No active session:', sessionError);
      return false;
    }
    
    const userId = sessionData.session.user.id;
    
    // Get the current event
    const { data: event, error: fetchError } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('id', eventId)
      .eq('user_id', userId)
      .single();
      
    if (fetchError || !event) {
      console.error('Error fetching event:', fetchError);
      return false;
    }

    // Create heat cycle in heat journal if dogId exists
    if (event.dog_id) {
      try {
        const { HeatCalendarSyncService } = await import('./HeatCalendarSyncService');
        
        // Create heat cycle directly since we already have all the data we need
        const startDate = new Date(event.date);
        const { HeatService } = await import('./HeatService');
        
        // Check if active heat cycle already exists for this dog
        const existingCycle = await HeatService.getActiveHeatCycle(event.dog_id);
        if (!existingCycle) {
          await HeatService.createHeatCycle(
            event.dog_id,
            startDate,
            event.notes || 'Started from calendar'
          );
          console.log('Heat cycle created in journal from calendar');
        } else {
          console.log('Active heat cycle already exists for dog:', event.dog_id);
        }
      } catch (syncError) {
        console.error('Error creating heat cycle in journal:', syncError);
        // Continue with calendar updates even if journal sync fails
      }
    }
    
    const startDate = new Date(event.date);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 20); // 21-day heat period (day 0-20)
    
    // Update the heat event to active status with end date
    const { error: updateError } = await supabase
      .from('calendar_events')
      .update({
        status: 'active',
        heat_phase: 'proestrus',
        end_date: endDate.toISOString(),
        type: 'heat-active'
      })
      .eq('id', eventId)
      .eq('user_id', userId);
      
    if (updateError) {
      console.error('Error updating heat event:', updateError);
      return false;
    }
    
    // Create ovulation prediction (days 12-14, peak at day 13)
    const ovulationDate = new Date(startDate);
    ovulationDate.setDate(startDate.getDate() + 12);
    
    const ovulationData = {
      title: `${event.dog_name} - Predicted Ovulation`,
      date: ovulationDate.toISOString(),
      type: 'ovulation-predicted',
      dog_id: event.dog_id,
      dog_name: event.dog_name,
      notes: 'Peak fertility window (days 12-14)',
      user_id: userId,
      status: 'predicted'
    };
    
    const { error: ovulationError } = await supabase
      .from('calendar_events')
      .insert(ovulationData);
      
    if (ovulationError) {
      console.error('Error creating ovulation event:', ovulationError);
      // Don't fail the whole operation if ovulation creation fails
    }
    
    // Create fertility window markers
    const fertilityStart = new Date(startDate);
    fertilityStart.setDate(startDate.getDate() + 9); // Day 10
    const fertilityEnd = new Date(startDate);
    fertilityEnd.setDate(startDate.getDate() + 15); // Day 16
    
    const fertilityData = {
      title: `${event.dog_name} - Fertility Window`,
      date: fertilityStart.toISOString(),
      end_date: fertilityEnd.toISOString(),
      type: 'fertility-window',
      dog_id: event.dog_id,
      dog_name: event.dog_name,
      notes: 'Optimal breeding window (days 10-16)',
      user_id: userId,
      status: 'active'
    };
    
    const { error: fertilityError } = await supabase
      .from('calendar_events')
      .insert(fertilityData);
      
    if (fertilityError) {
      console.error('Error creating fertility window:', fertilityError);
    }
    
    toast({
      title: 'Heat Started',
      description: `${event.dog_name}'s heat cycle has been marked as started. Ovulation prediction and fertility window have been added.`
    });
    
    return true;
  } catch (error) {
    console.error('Error in markHeatAsStarted:', error);
    return false;
  }
}

// Get heat phase color based on day in cycle
export function getHeatPhaseColor(dayInCycle: number): string {
  if (dayInCycle <= 9) {
    return 'bg-rose-200 text-rose-800 border-rose-300'; // Proestrus
  } else if (dayInCycle <= 16) {
    return 'bg-rose-400 text-rose-900 border-rose-500'; // Estrus (fertile)
  } else {
    return 'bg-rose-300 text-rose-800 border-rose-400'; // Metestrus
  }
}

// Get heat phase name based on day in cycle
export function getHeatPhaseName(dayInCycle: number): string {
  if (dayInCycle <= 9) {
    return 'Proestrus';
  } else if (dayInCycle <= 16) {
    return 'Estrus (Fertile)';
  } else {
    return 'Metestrus';
  }
}

// Check if an event spans multiple days
export function isMultiDayEvent(event: CalendarEvent): boolean {
  if (!event.endDate || !event.startDate) return false;
  
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  
  return end.getTime() > start.getTime() + (24 * 60 * 60 * 1000); // More than 1 day difference
}
