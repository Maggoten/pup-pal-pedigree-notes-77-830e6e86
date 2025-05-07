
import { PlannedLitter } from '@/types/breeding';
import { Dog } from '@/types/dogs';
import { Reminder } from '@/types/reminders';
import { differenceInDays, addYears, isAfter, isBefore, parseISO } from 'date-fns';
import { createCalendarClockIcon, createPawPrintIcon } from '@/utils/iconUtils';

/**
 * Generate reminders for upcoming planned heat dates
 */
export const generatePlannedHeatReminders = (plannedLitters: PlannedLitter[]): Reminder[] => {
  const reminders: Reminder[] = [];
  const today = new Date();
  
  // Filter litters with upcoming heat dates within the next 14 days
  const upcomingHeats = plannedLitters.filter(litter => {
    const heatDate = new Date(litter.expectedHeatDate);
    const daysUntil = differenceInDays(heatDate, today);
    return daysUntil >= 0 && daysUntil <= 14;
  });
  
  // Create reminders for upcoming heats
  upcomingHeats.forEach(litter => {
    const heatDate = new Date(litter.expectedHeatDate);
    const daysUntil = differenceInDays(heatDate, today);
    
    reminders.push({
      id: `auto-planned-heat-${litter.femaleId}-${litter.id}`,
      title: `Upcoming Heat for ${litter.femaleName}`,
      description: `Heat expected in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`,
      dueDate: heatDate,
      priority: 'high',
      type: 'heat',
      icon: createPawPrintIcon("rose-500"),
      relatedId: litter.femaleId
    });
  });
  
  return reminders;
};

/**
 * Generate enhanced birthday reminders for dogs
 */
export const generateEnhancedBirthdayReminders = (dogs: Dog[]): Reminder[] => {
  const reminders: Reminder[] = [];
  const today = new Date();
  
  dogs.forEach(dog => {
    if (!dog.dateOfBirth) return;
    
    const birthdate = parseISO(dog.dateOfBirth);
    const currentYear = today.getFullYear();
    
    // Calculate next birthday
    const birthdateThisYear = new Date(currentYear, birthdate.getMonth(), birthdate.getDate());
    const nextBirthday = isBefore(birthdateThisYear, today)
      ? new Date(currentYear + 1, birthdate.getMonth(), birthdate.getDate())
      : birthdateThisYear;
    
    const daysUntil = differenceInDays(nextBirthday, today);
    
    // If birthday is within 14 days
    if (daysUntil >= 0 && daysUntil <= 14) {
      const age = isBefore(birthdateThisYear, today)
        ? currentYear + 1 - birthdate.getFullYear()
        : currentYear - birthdate.getFullYear();
      
      reminders.push({
        id: `auto-birthday-${dog.id}-${currentYear}`,
        title: `${dog.name}'s Birthday Coming Up!`,
        description: `${dog.name} will turn ${age} in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`,
        dueDate: nextBirthday,
        priority: 'medium',
        type: 'birthday',
        icon: createPawPrintIcon("blue-500"),
        relatedId: dog.id
      });
    }
  });
  
  return reminders;
};

/**
 * Generate vaccination reminders for dogs
 */
export const generateVaccinationReminders = (dogs: Dog[]): Reminder[] => {
  const reminders: Reminder[] = [];
  const today = new Date();
  
  dogs.forEach(dog => {
    if (!dog.vaccinationDate) return;
    
    const lastVaccination = parseISO(dog.vaccinationDate);
    const nextVaccination = addYears(lastVaccination, 1); // Annual vaccination schedule
    
    const daysUntil = differenceInDays(nextVaccination, today);
    
    // If next vaccination is within 14 days or overdue by up to 30 days
    if (daysUntil >= -30 && daysUntil <= 14) {
      const isOverdue = daysUntil < 0;
      
      reminders.push({
        id: `auto-vaccination-${dog.id}`,
        title: `${dog.name}'s Vaccination ${isOverdue ? 'Overdue' : 'Due Soon'}`,
        description: isOverdue 
          ? `Vaccination overdue by ${Math.abs(daysUntil)} day${Math.abs(daysUntil) !== 1 ? 's' : ''}`
          : `Vaccination due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}`,
        dueDate: nextVaccination,
        priority: 'high',
        type: 'vaccination',
        icon: createCalendarClockIcon("amber-500"),
        relatedId: dog.id
      });
    }
  });
  
  return reminders;
};

/**
 * Merge multiple reminder sources while avoiding duplicates
 */
export const mergeReminders = (...reminderSets: Reminder[][]): Reminder[] => {
  const allReminders: Reminder[] = [];
  const seenIds = new Set<string>();
  
  reminderSets.forEach(reminderSet => {
    reminderSet.forEach(reminder => {
      if (!seenIds.has(reminder.id)) {
        seenIds.add(reminder.id);
        allReminders.push(reminder);
      }
    });
  });
  
  return allReminders;
};
