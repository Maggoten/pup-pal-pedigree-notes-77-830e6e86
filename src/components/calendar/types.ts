
import { Dog } from '@/types/dogs';

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  startDate?: Date;
  endDate?: Date;
  allDay?: boolean;
  type?: string;
  dogId?: string;
  dogName?: string;
  notes?: string;
  time?: string;
  eventType?: string;
}

export interface AddEventFormValues {
  title: string;
  date: Date;
  startDate?: Date;
  endDate?: Date;
  allDay?: boolean;
  notes?: string;
  dogId?: string;
  time?: string;
  eventType?: string;
  color?: string; // Used for UI color selection
}

export interface AddEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddEvent: (data: AddEventFormValues) => Promise<boolean>;
  dogs: Dog[];
}

export interface EditEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: CalendarEvent | null;
  onUpdateEvent: (id: string, data: AddEventFormValues) => Promise<boolean>;
  onDeleteEvent: (id: string) => Promise<boolean>;
  dogs: Dog[];
}

export interface EventFormProps {
  onSubmit: (data: AddEventFormValues) => void;
  initialValues?: Partial<AddEventFormValues>;
  submitLabel?: string;
  dogs: Dog[];
}

export interface EventCardProps {
  event: CalendarEvent;
  onClick?: () => void;
  getEventColor: (type: string) => string;
}

export interface MobileEventCardProps {
  event: CalendarEvent;
  onEdit: () => void;
  getEventColor: (type: string) => string;
}
