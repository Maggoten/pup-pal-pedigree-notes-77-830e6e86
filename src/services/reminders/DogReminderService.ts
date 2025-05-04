
import { Dog } from '@/types/dogs';
import { Reminder } from '@/types/reminders';
import { differenceInDays, parseISO, addDays, addYears, startOfDay, isAfter, isBefore, isToday, format, isSameDay, isValid } from 'date-fns';
import { createPawPrintIcon, createCalendarClockIcon } from '@/utils/iconUtils';
import { dateToISOString, parseISODate } from '@/utils/dateUtils';
import { generateHeatReminders } from './generators/HeatReminderGenerator';
import { generateVaccinationReminders } from './generators/VaccinationReminderGenerator';
import { generateBirthdayReminders } from './generators/BirthdayReminderGenerator';

/**
 * Main function to generate all dog-related reminders
 */
export const generateDogReminders = (dogs: Dog[]): Reminder[] => {
  const reminders: Reminder[] = [];
  const today = startOfDay(new Date());
  
  console.log(`[DOG REMINDERS] Generating reminders for ${dogs.length} dogs - Today is ${format(today, 'yyyy-MM-dd')}`);
  
  if (!dogs || dogs.length === 0) {
    console.warn('[DOG REMINDERS] No dogs available to generate reminders');
    return reminders;
  }
  
  try {
    // Process each dog
    dogs.forEach((dog) => {
      if (!dog.id || !dog.name) {
        console.warn(`[DOG REMINDERS] Skipping invalid dog object:`, dog);
        return;
      }
      
      console.log(`[DOG REMINDERS] Processing dog: ${dog.name}, ID: ${dog.id}, Owner ID: ${dog.owner_id}`);
      console.log(`[DOG REMINDERS] Dog data: Gender: ${dog.gender}, Vaccination date: ${dog.vaccinationDate}, Heat history: ${dog.heatHistory ? dog.heatHistory.length : 0} entries`);
      
      // Generate different types of reminders
      try {
        const heatReminders = generateHeatReminders(dog, today);
        reminders.push(...heatReminders);
      } catch (error) {
        console.error(`[DOG REMINDERS] Error generating heat reminders for ${dog.name}:`, error);
      }
      
      try {
        const vaccinationReminders = generateVaccinationReminders(dog, today);
        reminders.push(...vaccinationReminders);
      } catch (error) {
        console.error(`[DOG REMINDERS] Error generating vaccination reminders for ${dog.name}:`, error);
      }
      
      try {
        const birthdayReminders = generateBirthdayReminders(dog, today);
        reminders.push(...birthdayReminders);
      } catch (error) {
        console.error(`[DOG REMINDERS] Error generating birthday reminders for ${dog.name}:`, error);
      }
    });
    
    // Log summary information for debugging
    logReminderSummary(reminders);
    
    return reminders;
  } catch (error) {
    console.error('[DOG REMINDERS] Error in generateDogReminders:', error);
    return [];
  }
};

/**
 * Helper function to log reminders summary information
 */
const logReminderSummary = (reminders: Reminder[]): void => {
  // Summarize vaccination reminders for debugging
  const vaccinationReminders = reminders.filter(r => r.type === 'vaccination');
  console.log(`[DOG REMINDERS] Generated ${vaccinationReminders.length} vaccination reminders:`);
  vaccinationReminders.forEach(r => {
    console.log(`- ${r.title} (due: ${r.dueDate instanceof Date ? format(r.dueDate, 'yyyy-MM-dd') : 'Invalid date'}, priority: ${r.priority})`);
  });
  
  // Summarize heat reminders
  const heatReminders = reminders.filter(r => r.type === 'heat');
  console.log(`[DOG REMINDERS] Generated ${heatReminders.length} heat reminders:`);
  heatReminders.forEach(r => {
    console.log(`- ${r.title} (due: ${r.dueDate instanceof Date ? format(r.dueDate, 'yyyy-MM-dd') : 'Invalid date'}, priority: ${r.priority})`);
  });
  
  // Log birthday reminders
  const birthdayReminders = reminders.filter(r => r.type === 'birthday');
  console.log(`[DOG REMINDERS] Generated ${birthdayReminders.length} birthday reminders`);
  
  console.log(`[DOG REMINDERS] Generated ${reminders.length} total dog reminders`);
};
