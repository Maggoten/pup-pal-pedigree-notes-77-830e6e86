
import { Reminder, createReminder } from '@/types/reminders';
import { addDays, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { createCalendarClockIcon } from '@/utils/iconUtils';

export const generateGeneralReminders = (): Reminder[] => {
  const reminders: Reminder[] = [];
  const today = new Date();
  
  // Get the first day of the current month
  const firstDayOfMonth = startOfMonth(today);
  const lastDayOfMonth = endOfMonth(today);
  
  // Create a reminder for kennel maintenance on the 15th of each month
  const maintenanceReminderDate = new Date(today.getFullYear(), today.getMonth(), 15);
  
  // Only add if the 15th is in the future or today
  if (isWithinInterval(maintenanceReminderDate, { 
    start: today, 
    end: addDays(today, 7) // Only show if it's within a week
  })) {
    reminders.push(createReminder({
      id: `general-maintenance-${today.getFullYear()}-${today.getMonth() + 1}`,
      title: 'Monthly Kennel Maintenance',
      description: 'Perform routine maintenance checks of kennel facilities',
      icon: createCalendarClockIcon("blue-500"),
      dueDate: maintenanceReminderDate,
      priority: 'low',
      type: 'maintenance',
      relatedId: 'kennel'
    }));
  }
  
  // Add more general reminder types as needed
  
  return reminders;
};
