
import { Reminder } from '@/types/reminders';
import { CalendarEvent } from '@/types/calendar';
import { v4 as uuidv4 } from 'uuid';

/**
 * Converts reminder objects to calendar event format for display in the calendar
 */
export const reminderToCalendarEvent = (reminder: Reminder): CalendarEvent => {
  return {
    id: `reminder-${reminder.id}`,
    title: reminder.title,
    date: reminder.dueDate,
    startDate: reminder.dueDate,
    endDate: reminder.dueDate,
    type: `reminder-${reminder.type}`,
    notes: reminder.description,
    dogId: reminder.relatedId,
    dogName: '', // We don't have dog name in reminder object
  };
};

/**
 * Converts an array of reminders to calendar events
 */
export const remindersToCalendarEvents = (reminders: Reminder[]): CalendarEvent[] => {
  return reminders.map(reminderToCalendarEvent);
};
