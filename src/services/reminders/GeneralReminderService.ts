
import { Dog } from '@/types/dogs';
import { Reminder } from '@/types/reminders';
import { createCalendarClockIcon } from '@/utils/iconUtils';
import { differenceInMonths, parseISO, startOfDay } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

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
    if (dog.gender !== 'female') return false;
    if (!dog.dateOfBirth) return false;
    
    const birthDate = parseISO(dog.dateOfBirth);
    const ageInMonths = differenceInMonths(today, birthDate);
    
    // Only consider dogs older than 6 months (potential breeding age)
    if (ageInMonths < 6) return false;
    
    // Check if the dog has heat records
    return !dog.heatHistory || dog.heatHistory.length === 0;
  });
  
  // Add heat tracking reminders
  femaleDogsWithoutHeatRecords.forEach(dog => {
    reminders.push({
      id: generateSystemReminderId(dog.id, 'general-heat-tracking'),
      title: `Start Heat Tracking for ${dog.name}`,
      description: `${dog.name} is of breeding age but has no heat records`,
      icon: createCalendarClockIcon('purple-500'),
      dueDate: today,
      priority: 'low',
      type: 'breeding',
      relatedId: dog.id
    });
  });
  
  return reminders;
};
