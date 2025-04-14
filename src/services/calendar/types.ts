
import { CalendarEvent, AddEventFormValues } from '@/components/calendar/types';
import { Dog } from '@/context/DogsContext';

export interface CalendarEventSupabase {
  id: string;
  title: string;
  date: string;
  time?: string | null;
  type: string;
  dog_id?: string | null;
  dog_name?: string | null;
  notes?: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface EventDataForSupabase {
  title: string;
  date: string;
  time?: string | null;
  type: string;
  dog_id?: string | null;
  dog_name?: string | null;
  notes?: string | null;
  user_id: string;
}
