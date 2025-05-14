
import { Reminder } from '@/types/reminders';
import { CalendarEvent } from '@/types/calendar';
import { v4 as uuidv4 } from 'uuid';

/**
 * Converts a Reminder object to a CalendarEvent object for display in the calendar
 * @param reminder The reminder to convert
 * @returns A CalendarEvent representation of the reminder
 */
export const reminderToCalendarEvent = (reminder: Reminder): CalendarEvent => {
  const dueDate = reminder.dueDate;
  
  return {
    id: `reminder-${reminder.id}`, // Prefix with 'reminder-' to distinguish from regular calendar events
    title: reminder.title,
    date: dueDate, // For backward compatibility
    startDate: dueDate, // Required field
    endDate: dueDate, // Required field
    type: reminder.type || 'reminder',
    dogId: reminder.relatedId,
    notes: reminder.description,
    isReminderEvent: true  // Flag to identify this as a reminder-sourced event
  };
};

/**
 * Converts an array of Reminder objects to CalendarEvent objects
 * @param reminders Array of reminders to convert
 * @returns Array of CalendarEvent objects
 */
export const remindersToCalendarEvents = (reminders: Reminder[]): CalendarEvent[] => {
  if (!reminders || !Array.isArray(reminders) || reminders.length === 0) {
    return [];
  }
  
  return reminders.map(reminderToCalendarEvent);
};
