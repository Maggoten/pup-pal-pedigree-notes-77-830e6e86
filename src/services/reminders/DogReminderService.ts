
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
  
  console.log(`Generating reminders for ${dogs.length} dogs - Today is ${format(today, 'yyyy-MM-dd')}`);
  
  // Process each dog
  dogs.forEach((dog) => {
    console.log(`Processing dog: ${dog.name}, ID: ${dog.id}, Owner ID: ${dog.owner_id}`);
    console.log(`Dog data: Vaccination date: ${dog.vaccinationDate}, Heat history: ${dog.heatHistory ? dog.heatHistory.length : 0} entries`);
    
    // Generate different types of reminders
    const heatReminders = generateHeatReminders(dog, today);
    const vaccinationReminders = generateVaccinationReminders(dog, today);
    const birthdayReminders = generateBirthdayReminders(dog, today);
    
    // Add all reminders to the collection
    reminders.push(...heatReminders);
    reminders.push(...vaccinationReminders);
    reminders.push(...birthdayReminders);
  });
  
  // Log summary information for debugging
  logReminderSummary(reminders);
  
  return reminders;
};

/**
 * Helper function to log reminders summary information
 */
const logReminderSummary = (reminders: Reminder[]): void => {
  // Summarize vaccination reminders for debugging
  const vaccinationReminders = reminders.filter(r => r.type === 'vaccination');
  console.log(`[VACCINATION SUMMARY] Generated ${vaccinationReminders.length} vaccination reminders:`);
  vaccinationReminders.forEach(r => {
    console.log(`- ${r.title} (due: ${format(r.dueDate, 'yyyy-MM-dd')}, priority: ${r.priority})`);
  });
  
  // Summarize heat reminders
  const heatReminders = reminders.filter(r => r.type === 'heat');
  console.log(`[HEAT SUMMARY] Generated ${heatReminders.length} heat reminders:`);
  heatReminders.forEach(r => {
    console.log(`- ${r.title} (due: ${format(r.dueDate, 'yyyy-MM-dd')}, priority: ${r.priority})`);
  });
  
  console.log(`Generated ${reminders.length} total dog reminders`);
};
