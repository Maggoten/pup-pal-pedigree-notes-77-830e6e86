
import { Dog } from '@/types/dogs';
import { Reminder } from '@/types/reminders';
import { createCalendarClockIcon } from '@/utils/iconUtils';
import { differenceInMonths, parseISO, startOfDay } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import i18n from '@/i18n';

// Helper method to get translation with fallback
const t = (key: string, options?: any): string => {
  return i18n.t(key, { ...options, ns: 'dogs' });
};

// Generate deterministic UUID for system reminders
const generateSystemReminderId = (dogId: string, type: string): string => {
  return uuidv4();
};

/**
 * Generate general breeding-related reminders
 */
export const generateGeneralReminders = (dogs: Dog[]): Reminder[] => {
  const reminders: Reminder[] = [];
  const today = startOfDay(new Date());
  
  // Female dogs of breeding age without heat records
  const femaleDogsWithoutHeatRecords = dogs.filter(dog => {
    console.log(`[GeneralReminders] Checking dog: ${dog.name}, gender: ${dog.gender}, sterilized: ${dog.sterilization_date || dog.sterilizationDate}`);
    
    if (dog.gender !== 'female') return false;
    
    // Skip sterilized dogs
    if (dog.sterilization_date || dog.sterilizationDate) {
      console.log(`[GeneralReminders] Skipping sterilized dog: ${dog.name}`);
      return false;
    }
    
    // Check for birth date (handle both field variations)
    const birthDateString = dog.dateOfBirth || dog.birthdate;
    if (!birthDateString) {
      console.log(`[GeneralReminders] No birth date for dog: ${dog.name}`);
      return false;
    }
    
    const birthDate = parseISO(birthDateString);
    const ageInMonths = differenceInMonths(today, birthDate);
    
    // Only consider dogs older than 6 months (potential breeding age)
    if (ageInMonths < 6) {
      console.log(`[GeneralReminders] Dog too young: ${dog.name}, age: ${ageInMonths} months`);
      return false;
    }
    
    // Check if the dog has heat records
    const hasHeatHistory = dog.heatHistory && dog.heatHistory.length > 0;
    if (hasHeatHistory) {
      console.log(`[GeneralReminders] Dog already has heat history: ${dog.name}, records: ${dog.heatHistory.length}`);
      return false;
    }
    
    console.log(`[GeneralReminders] Adding heat tracking reminder for: ${dog.name}`);
    return true;
  });
  
  // Add heat tracking reminders
  femaleDogsWithoutHeatRecords.forEach(dog => {
    reminders.push({
      id: generateSystemReminderId(dog.id, 'general-heat-tracking'),
      title: t('reminders.heatTracking.title', { dogName: dog.name }),
      description: t('reminders.heatTracking.description', { dogName: dog.name }),
      icon: createCalendarClockIcon('purple-500'),
      dueDate: today,
      priority: 'low',
      type: 'breeding',
      relatedId: dog.id
    });
  });
  
  return reminders;
};
