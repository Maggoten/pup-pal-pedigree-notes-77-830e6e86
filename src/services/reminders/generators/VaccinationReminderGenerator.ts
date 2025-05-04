import { Dog } from '@/types/dogs';
import { Reminder } from '@/types/reminders';
import { differenceInDays, format, isSameDay, isAfter, isValid } from 'date-fns';
import { createCalendarClockIcon } from '@/utils/iconUtils';
import { parseISODate } from '@/utils/dateUtils';

/**
 * Generate vaccination reminders for dogs
 */
export const generateVaccinationReminders = (dog: Dog, today: Date): Reminder[] => {
  const reminders: Reminder[] = [];
  
  // Skip if no vaccination date is available
  if (!dog.vaccinationDate) {
    console.log(`Dog ${dog.name}: No vaccination date recorded`);
    return reminders;
  }
  
  console.log(`[VACCINATION DEBUG] Processing vaccination for ${dog.name} (ID: ${dog.id})`);
  console.log(`[VACCINATION DEBUG] Vaccination date string: ${dog.vaccinationDate}`);
  
  try {
    const lastVaccination = parseISODate(dog.vaccinationDate);
    if (!lastVaccination || !isValid(lastVaccination)) {
      console.error(`[VACCINATION DEBUG] Failed to parse vaccination date for ${dog.name}: ${dog.vaccinationDate}`);
      return reminders;
    }
    
    console.log(`[VACCINATION DEBUG] Parsed last vaccination: ${format(lastVaccination, 'yyyy-MM-dd')}`);
    
    // Extract day and month from the last vaccination date
    const lastVaccinationMonth = lastVaccination.getMonth();
    const lastVaccinationDay = lastVaccination.getDate();
    
    // Create dates for both this year and next year's vaccinations
    const thisYear = today.getFullYear();
    const nextYear = thisYear + 1;
    
    // Create normalized dates at noon to avoid time comparison issues
    const thisYearVaccination = new Date(thisYear, lastVaccinationMonth, lastVaccinationDay, 12, 0, 0, 0);
    const nextYearVaccination = new Date(nextYear, lastVaccinationMonth, lastVaccinationDay, 12, 0, 0, 0);
    
    console.log(`[VACCINATION DEBUG] Today: ${format(today, 'yyyy-MM-dd')} `);
    console.log(`[VACCINATION DEBUG] This year vaccination: ${format(thisYearVaccination, 'yyyy-MM-dd')}`);
    console.log(`[VACCINATION DEBUG] Next year vaccination: ${format(nextYearVaccination, 'yyyy-MM-dd')}`);
    
    // Decide which vaccination date to use - the closest future date or most recent past date
    let nextVaccination;
    let daysUntilVaccination;
    
    if (isSameDay(thisYearVaccination, today) || isAfter(thisYearVaccination, today)) {
      // If this year's date is today or in the future, use it
      nextVaccination = thisYearVaccination;
      daysUntilVaccination = differenceInDays(thisYearVaccination, today);
      console.log(`[VACCINATION DEBUG] Using this year's vaccination date: ${format(nextVaccination, 'yyyy-MM-dd')}`);
    } else {
      // Otherwise use next year's date
      nextVaccination = nextYearVaccination;
      daysUntilVaccination = differenceInDays(nextYearVaccination, today);
      console.log(`[VACCINATION DEBUG] Using next year's vaccination date: ${format(nextVaccination, 'yyyy-MM-dd')}`);
    }
    
    console.log(`[VACCINATION DEBUG] Dog ${dog.name}: Days until vaccination: ${daysUntilVaccination}`);
    
    // Create reminder if the vaccination is relevant to the current time frame
    return createVaccinationReminderIfNeeded(dog, nextVaccination, daysUntilVaccination);
    
  } catch (err) {
    console.error(`[VACCINATION ERROR] Error processing vaccination for ${dog.name}:`, err);
    return reminders;
  }
};

/**
 * Create a vaccination reminder if it falls within the relevant time frame
 */
function createVaccinationReminderIfNeeded(dog: Dog, nextVaccination: Date, daysUntilVaccination: number): Reminder[] {
  const reminders: Reminder[] = [];
  
  // Create reminder if vaccination is:
  // 1. Coming up in the next 60 days, or
  // 2. Overdue by up to 30 days, or
  // 3. Today
  if (daysUntilVaccination >= -30 && daysUntilVaccination <= 60) {
    const isOverdue = daysUntilVaccination < 0;
    const isToday = daysUntilVaccination === 0;
    
    const reminderPriority = isOverdue ? 'high' : (daysUntilVaccination <= 7 ? 'high' : 'medium');
    
    const vaccinationReminder: Reminder = {
      id: `vaccine-${dog.id}-${Date.now()}`, // Add timestamp for uniqueness
      title: isToday 
        ? `${dog.name}'s Vaccination Due Today`
        : `${dog.name}'s Vaccination ${isOverdue ? 'Overdue' : 'Due'}`,
      description: isToday 
        ? `${dog.name}'s vaccination is due today` 
        : isOverdue 
          ? `Vaccination overdue by ${Math.abs(daysUntilVaccination)} days`
          : `Vaccination due in ${daysUntilVaccination} days`,
      icon: createCalendarClockIcon(isOverdue ? "red-500" : "amber-500"),
      dueDate: nextVaccination,
      priority: reminderPriority,
      type: 'vaccination',
      relatedId: dog.id
    };
    
    reminders.push(vaccinationReminder);
    console.log(`[VACCINATION DEBUG] Created vaccination reminder for dog ${dog.name}:`, JSON.stringify(vaccinationReminder));
  } else {
    console.log(`[VACCINATION DEBUG] No vaccination reminder needed for ${dog.name}: ${daysUntilVaccination} days until due date`);
  }
  
  return reminders;
}
