
import { Dog } from '@/types/dogs';
import { Reminder } from '@/types/reminders';
import { differenceInDays, parseISO, addDays, startOfDay, format, isValid } from 'date-fns';
import { createCalendarClockIcon } from '@/utils/iconUtils';
import { parseISODate, isValidDate, safelyParseDate } from '@/utils/dateUtils';

/**
 * Generate vaccination reminders for dogs
 */
export const generateVaccinationReminders = (dog: Dog, today: Date): Reminder[] => {
  const reminders: Reminder[] = [];
  console.log(`[Vaccination Reminder] Processing dog: ${dog.name}, ID: ${dog.id}`);
  console.log(`[Vaccination Reminder] Vaccination date: ${dog.vaccinationDate}`);
  
  // Skip if no vaccination date is available
  if (!dog.vaccinationDate) {
    console.log(`[Vaccination Reminder] No vaccination date for dog: ${dog.name}`);
    return reminders;
  }
  
  try {
    // Parse the vaccination date using enhanced utilities
    const vaccinationDate = safelyParseDate(dog.vaccinationDate);
    
    if (!vaccinationDate) {
      console.error(`[Vaccination Reminder] Failed to parse vaccination date for ${dog.name}: ${dog.vaccinationDate}`);
      return reminders;
    }
    
    console.log(`[Vaccination Reminder] Parsed vaccination date for ${dog.name}: ${format(vaccinationDate, 'yyyy-MM-dd')}`);
    
    // Calculate the next vaccination date (1 year after the last one)
    const nextVaccinationDate = addDays(vaccinationDate, 365);
    console.log(`[Vaccination Reminder] Next vaccination date for ${dog.name}: ${format(nextVaccinationDate, 'yyyy-MM-dd')}`);
    
    // Calculate days until next vaccination
    const daysUntilVaccination = differenceInDays(nextVaccinationDate, today);
    console.log(`[Vaccination Reminder] Days until vaccination for ${dog.name}: ${daysUntilVaccination}`);
    
    // Create reminder for upcoming vaccination (30 days before)
    // Also show reminder if it's overdue (up to 30 days after)
    if (daysUntilVaccination <= 30 && daysUntilVaccination >= -30) {
      // Determine priority based on how close/overdue the date is
      let priority: 'high' | 'medium' | 'low' = 'low';
      
      if (daysUntilVaccination <= 0) {
        priority = 'high'; // Overdue or due today
      } else if (daysUntilVaccination <= 7) {
        priority = 'medium'; // Due within a week
      }
      
      // Create the reminder
      const reminder: Reminder = {
        id: `vaccination-${dog.id}`,
        title: `Vaccination for ${dog.name}`,
        description: daysUntilVaccination < 0 
          ? `Vaccination overdue by ${Math.abs(daysUntilVaccination)} days` 
          : daysUntilVaccination === 0 
            ? 'Vaccination due today' 
            : `Vaccination due in ${daysUntilVaccination} days`,
        icon: createCalendarClockIcon(
          priority === 'high' ? 'rose-500' : 
          priority === 'medium' ? 'amber-500' : 'green-500'
        ),
        dueDate: nextVaccinationDate,
        priority,
        type: 'vaccination',
        relatedId: dog.id
      };
      
      // Validate reminder before adding
      if (isValidDate(reminder.dueDate)) {
        reminders.push(reminder);
        console.log(`[Vaccination Reminder] Created reminder for ${dog.name} with due date ${format(reminder.dueDate, 'yyyy-MM-dd')}`);
      } else {
        console.error(`[Vaccination Reminder] Invalid due date for ${dog.name}`);
      }
    } else {
      console.log(`[Vaccination Reminder] No reminder needed for ${dog.name} - ${daysUntilVaccination} days until next vaccination`);
    }
    
    return reminders;
  } catch (err) {
    console.error(`[Vaccination Reminder] Error processing vaccination for ${dog.name}:`, err);
    return reminders;
  }
};
